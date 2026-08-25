"""
app/api/v1/endpoints/scan.py
─────────────────────────────
Scan endpoints — the core of the AntiVirus-AKN backend.

Endpoints:
  POST /api/v1/scan/hash   — Batch hash reputation lookup
  POST /api/v1/scan/file   — File upload static analysis (YARA + entropy + mime)
  POST /api/v1/scan/apk    — APK upload permission & manifest analysis
  POST /api/v1/scan/deep   — Async Celery deep scan (returns task_id for polling)
  GET  /api/v1/scan/status/{task_id} — Poll Celery deep scan result

All scan results persist to PostgreSQL via background tasks.
"""

from __future__ import annotations

import hashlib
import io
import logging
import time
import uuid
from typing import List, Optional

import magic
from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import verify_api_key
from app.db.session import get_db
from app.db.redis_client import get_redis
from app.engine.apk_inspector import APKInspector
from app.engine.entropy import calculate_shannon_entropy, is_high_entropy, entropy_risk_label
from app.engine.hash_matcher import HashMatcher
from app.engine.yara_engine import YaraEngine
from app.models.schemas import (
    APKScanResponse,
    FileScanMeta,
    FileScanResponse,
    HashScanRequest,
    HashScanResponse,
    ScanResponse,
    ScanTypeEnum,
    SeverityEnum,
    ThreatItem,
    ThreatTypeEnum,
)
from app.worker.tasks import deep_scan_task

log = logging.getLogger(__name__)
_settings = get_settings()

router = APIRouter(dependencies=[Depends(verify_api_key)])


# ────────────────────────────────────────────────────────────────────────────────
# Helper: compute all hashes from bytes
# ────────────────────────────────────────────────────────────────────────────────

def _compute_hashes(data: bytes) -> tuple[str, str, str]:
    """Return (md5, sha1, sha256) hex digests for the given byte sequence."""
    return (
        hashlib.md5(data).hexdigest(),
        hashlib.sha1(data).hexdigest(),
        hashlib.sha256(data).hexdigest(),
    )


async def _read_upload(upload: UploadFile, max_bytes: int) -> bytes:
    """
    Stream an UploadFile into memory, rejecting files that exceed max_bytes.

    Raises:
        HTTPException 413 if content exceeds the configured limit.
    """
    chunk_size = 65_536  # 64 KB chunks
    buffer = io.BytesIO()
    total = 0

    while True:
        chunk = await upload.read(chunk_size)
        if not chunk:
            break
        total += len(chunk)
        if total > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum allowed size of {_settings.max_file_size_mb} MB.",
            )
        buffer.write(chunk)

    return buffer.getvalue()


async def _persist_scan(scan_id: str, scan_type: str, items: int,
                        threats: List[ThreatItem], duration: float,
                        db: AsyncSession) -> None:
    """Background task: persist scan result to PostgreSQL."""
    try:
        from app.models.db_models import ScanRecord, ThreatRecord
        record = ScanRecord(
            id=scan_id,
            scan_type=scan_type,
            status="clean" if not threats else "threats_found",
            scanned_items_count=items,
            threat_count=len(threats),
            duration_seconds=duration,
        )
        db.add(record)
        for threat in threats:
            db.add(ThreatRecord(
                id=threat.id,
                scan_id=scan_id,
                name=threat.name,
                threat_type=threat.type,
                severity=threat.severity,
                file_hash=threat.file_hash,
                file_path=threat.file_path,
                description=threat.description,
                recommendation=threat.recommendation,
            ))
        await db.commit()
    except Exception as exc:
        log.error("Failed to persist scan %s: %s", scan_id, exc)


# ────────────────────────────────────────────────────────────────────────────────
# POST /scan/hash
# ────────────────────────────────────────────────────────────────────────────────

@router.post(
    "/hash",
    response_model=HashScanResponse,
    summary="Batch hash reputation lookup",
    description=(
        "Submit up to 100 MD5 or SHA-256 hashes for rapid malware reputation lookup "
        "against the Redis cache and PostgreSQL signature database."
    ),
    status_code=status.HTTP_200_OK,
)
async def scan_hash(
    request: HashScanRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
) -> HashScanResponse:
    start = time.perf_counter()
    matcher = HashMatcher(redis=redis, db=db)

    results = await matcher.lookup_hashes(request.hashes)
    malicious = [r for r in results if r.is_malicious]

    duration = round(time.perf_counter() - start, 4)
    log.info("Hash scan: %d queried, %d malicious, %.4fs", len(results), len(malicious), duration)

    return HashScanResponse(
        queried_count=len(results),
        malicious_count=len(malicious),
        results=results,
        duration_seconds=duration,
    )


# ────────────────────────────────────────────────────────────────────────────────
# POST /scan/file
# ────────────────────────────────────────────────────────────────────────────────

@router.post(
    "/file",
    response_model=FileScanResponse,
    summary="Static file analysis (YARA + entropy + MIME)",
    description=(
        "Upload any file for multi-layer static analysis:\n"
        "1. SHA-256/MD5 hash reputation check\n"
        "2. MIME type identification via libmagic\n"
        "3. YARA rule matching (trojans, ransomware, webshells)\n"
        "4. Shannon entropy analysis to detect packed/encrypted payloads\n\n"
        "Supports `scan_type`: `quick` (hash only), `files` (YARA), `deep` (all + entropy)."
    ),
    status_code=status.HTTP_200_OK,
)
async def scan_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="File to scan (max configurable MB)"),
    scan_type: str = Form("files", description="'quick' | 'files' | 'deep'"),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
) -> FileScanResponse:
    # Validate scan_type
    try:
        scan_type_enum = ScanTypeEnum(scan_type)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid scan_type '{scan_type}'. Must be one of: quick, files, deep.",
        )

    start = time.perf_counter()
    scan_id = str(uuid.uuid4())
    threats: List[ThreatItem] = []

    # 1. Read file bytes (enforces size limit)
    data = await _read_upload(file, _settings.max_file_size_bytes)
    filename = file.filename or "unknown"

    # 2. Compute hashes
    md5, sha1, sha256 = _compute_hashes(data)

    # 3. MIME type detection
    mime_type = "application/octet-stream"
    try:
        mime_type = magic.from_buffer(data, mime=True)
    except Exception as exc:
        log.warning("MIME detection failed for %s: %s", filename, exc)

    # 4. Entropy calculation
    entropy = calculate_shannon_entropy(data)
    high_entropy = is_high_entropy(data)

    # 5. Hash reputation check (all scan types)
    matcher = HashMatcher(redis=redis, db=db)
    hash_threats = await matcher.lookup_hashes_as_threats([md5, sha256])
    threats.extend(hash_threats)

    # 6. YARA scan (files / deep only)
    if scan_type_enum in (ScanTypeEnum.FILES, ScanTypeEnum.DEEP):
        engine = YaraEngine.get_instance()
        yara_matches = engine.scan_bytes(data)
        yara_threats = engine.to_threat_items(yara_matches, sha256, filename)
        threats.extend(yara_threats)

    # 7. Entropy threat flag (deep only)
    if scan_type_enum == ScanTypeEnum.DEEP and high_entropy and not threats:
        threats.append(ThreatItem(
            id=str(uuid.uuid4()),
            name="Heuristic.HighEntropy.Packed",
            type=ThreatTypeEnum.RISKWARE,
            severity=SeverityEnum.WARNING,
            file_path=filename,
            file_hash=sha256,
            description=(
                f"File exhibits abnormally high entropy ({entropy:.2f} bits/byte). "
                "This strongly indicates the payload is packed, encrypted, or obfuscated."
            ),
            recommendation=(
                "Inspect the file with a hex editor or sandbox tool before executing. "
                "Delete if the source is untrusted."
            ),
        ))

    duration = round(time.perf_counter() - start, 4)

    file_meta = FileScanMeta(
        filename=filename,
        mime_type=mime_type,
        size_bytes=len(data),
        md5=md5,
        sha1=sha1,
        sha256=sha256,
        entropy=entropy,
        is_high_entropy=high_entropy,
    )

    # Async DB persist
    background_tasks.add_task(
        _persist_scan, scan_id, scan_type, 1, threats, duration, db
    )

    log.info(
        "File scan [%s]: %s | MIME=%s | entropy=%.2f | threats=%d | %.4fs",
        scan_type, filename, mime_type, entropy, len(threats), duration,
    )

    return FileScanResponse(
        scan_id=scan_id,
        status="clean" if not threats else "threats_found",
        scanned_items_count=1,
        duration_seconds=duration,
        threats=threats,
        scan_type=scan_type_enum,
        file_meta=file_meta,
    )


# ────────────────────────────────────────────────────────────────────────────────
# POST /scan/apk
# ────────────────────────────────────────────────────────────────────────────────

@router.post(
    "/apk",
    response_model=APKScanResponse,
    summary="Android APK permission & manifest analysis",
    description=(
        "Upload an Android APK for static analysis:\n"
        "- Parse AndroidManifest.xml via androguard\n"
        "- Classify individual permissions as dangerous/safe\n"
        "- Detect known dangerous permission combinations (Trojan, Spyware, Adware patterns)\n"
        "- Extract signing certificate SHA-256 fingerprint\n"
        "- Score overall risk: `safe`, `warning`, or `danger`"
    ),
    status_code=status.HTTP_200_OK,
)
async def scan_apk(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Android APK file to inspect"),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
) -> APKScanResponse:
    filename = file.filename or "upload.apk"

    # Validate extension
    if not filename.lower().endswith(".apk"):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only .apk files are accepted by this endpoint.",
        )

    start = time.perf_counter()
    data = await _read_upload(file, _settings.max_file_size_bytes)

    # Hash reputation check on APK before deep analysis
    _, _, sha256 = _compute_hashes(data)
    matcher = HashMatcher(redis=redis, db=db)
    hash_threats = await matcher.lookup_hashes_as_threats([sha256])

    # Run APK inspector (synchronous androguard call — runs in thread pool via FastAPI)
    import asyncio
    result: APKScanResponse = await asyncio.get_event_loop().run_in_executor(
        None, APKInspector.inspect, data
    )

    # Merge any hash-level threats into APK result
    if hash_threats:
        result.threat_items.extend(hash_threats)
        result.risk_level = SeverityEnum.DANGER

    duration = round(time.perf_counter() - start, 4)
    result.duration_seconds = duration

    background_tasks.add_task(
        _persist_scan, result.scan_id, "apk", 1, result.threat_items, duration, db
    )

    log.info(
        "APK scan: %s | pkg=%s | risk=%s | combos=%d | threats=%d | %.4fs",
        filename, result.package_name, result.risk_level,
        len(result.dangerous_combos_detected), len(result.threat_items), duration,
    )

    return result


# ────────────────────────────────────────────────────────────────────────────────
# POST /scan/deep  — async Celery deep scan
# ────────────────────────────────────────────────────────────────────────────────

@router.post(
    "/deep",
    summary="Async deep scan (Celery)",
    description=(
        "Enqueue a deep scan task via Celery. Returns a `task_id` immediately. "
        "Poll `GET /scan/status/{task_id}` for the result."
    ),
    status_code=status.HTTP_202_ACCEPTED,
)
async def start_deep_scan(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
) -> dict:
    data = await _read_upload(file, _settings.max_file_size_bytes)
    _, _, sha256 = _compute_hashes(data)
    scan_id = str(uuid.uuid4())

    # Write to temp file for Celery worker to pick up
    import tempfile, os
    with tempfile.NamedTemporaryFile(
        suffix=".scan", delete=False, dir="/tmp/avscanner", prefix=f"{scan_id}_"
    ) as tmp:
        tmp.write(data)
        tmp_path = tmp.name

    task = deep_scan_task.apply_async(
        args=[tmp_path, scan_id],
        queue="deep_scan",
    )

    return {
        "scan_id": scan_id,
        "task_id": task.id,
        "status": "queued",
        "message": "Deep scan enqueued. Poll /scan/status/{task_id} for results.",
    }


# ────────────────────────────────────────────────────────────────────────────────
# GET /scan/status/{task_id}
# ────────────────────────────────────────────────────────────────────────────────

@router.get(
    "/status/{task_id}",
    summary="Poll async deep scan result",
    status_code=status.HTTP_200_OK,
)
async def get_scan_status(task_id: str) -> dict:
    from celery.result import AsyncResult
    from app.worker.celery_app import celery

    result = AsyncResult(task_id, app=celery)

    if result.state == "PENDING":
        return {"task_id": task_id, "state": "pending", "result": None}
    if result.state == "PROGRESS":
        return {"task_id": task_id, "state": "processing", "result": result.info}
    if result.state == "SUCCESS":
        return {"task_id": task_id, "state": "complete", "result": result.result}
    if result.state == "FAILURE":
        return {"task_id": task_id, "state": "failed", "error": str(result.result)}

    return {"task_id": task_id, "state": result.state, "result": None}
