"""
app/worker/tasks.py
────────────────────
Celery task definitions for async deep scan operations.

Tasks:
  deep_scan_task   — Full YARA + entropy analysis on a queued file
  seed_hash_db     — Admin task: bulk-seed hash signatures from a JSON feed

Each task updates the scan record in PostgreSQL on completion.
"""

from __future__ import annotations

import hashlib
import logging
import os
import uuid
from pathlib import Path
from typing import Any, Dict, List

from celery import shared_task
from celery.utils.log import get_task_logger

from app.engine.entropy import calculate_shannon_entropy, is_high_entropy
from app.engine.yara_engine import YaraEngine
from app.models.schemas import SeverityEnum, ThreatItem, ThreatTypeEnum

log = get_task_logger(__name__)


def _compute_hashes(data: bytes) -> tuple[str, str, str]:
    return (
        hashlib.md5(data).hexdigest(),
        hashlib.sha1(data).hexdigest(),
        hashlib.sha256(data).hexdigest(),
    )


def _persist_sync(scan_id: str, threats: List[Dict], duration: float) -> None:
    """
    Synchronous DB persist for Celery worker context.
    Uses a sync SQLAlchemy session (not async — Celery is sync by default).
    """
    try:
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker
        from app.core.config import get_settings
        from app.models.db_models import ScanRecord, ThreatRecord

        settings = get_settings()
        engine = create_engine(settings.database_url_sync, echo=False)
        Session = sessionmaker(bind=engine)

        with Session() as session:
            record = ScanRecord(
                id=scan_id,
                scan_type="deep",
                status="clean" if not threats else "threats_found",
                scanned_items_count=1,
                threat_count=len(threats),
                duration_seconds=duration,
            )
            session.add(record)
            for t in threats:
                session.add(ThreatRecord(**t))
            session.commit()
    except Exception as exc:
        log.error("Failed to persist deep scan %s: %s", scan_id, exc)


@shared_task(
    name="app.worker.tasks.deep_scan_task",
    bind=True,
    max_retries=2,
    default_retry_delay=10,
    queue="deep_scan",
)
def deep_scan_task(self, file_path: str, scan_id: str) -> Dict[str, Any]:
    """
    Full deep scan pipeline for a file previously written to disk.

    Steps:
      1. Read file bytes from temp path
      2. Compute MD5/SHA-256 hashes
      3. MIME type detection (python-magic)
      4. Shannon entropy analysis
      5. YARA rule matching (all rule sets)
      6. Persist results to PostgreSQL
      7. Delete temp file

    Args:
        file_path: Absolute path to the temp file written by the API endpoint.
        scan_id: UUID string for this scan session.

    Returns:
        Dict with scan_id, status, threats list, and duration.
    """
    import time
    start = time.perf_counter()
    threats_data: List[Dict] = []

    try:
        path = Path(file_path)
        if not path.exists():
            log.error("Temp file not found: %s", file_path)
            return {"scan_id": scan_id, "status": "error", "error": "File not found"}

        data = path.read_bytes()
        md5, sha1, sha256 = _compute_hashes(data)

        # MIME type
        mime_type = "application/octet-stream"
        try:
            import magic
            mime_type = magic.from_buffer(data, mime=True)
        except Exception:
            pass

        # Entropy
        entropy = calculate_shannon_entropy(data)
        high_entropy = is_high_entropy(data)

        # YARA scan
        engine = YaraEngine.get_instance()
        matches = engine.scan_bytes(data, timeout=60)
        threat_items: List[ThreatItem] = engine.to_threat_items(matches, sha256, file_path)

        # Entropy-based flag
        if high_entropy and not threat_items:
            threat_items.append(ThreatItem(
                id=str(uuid.uuid4()),
                name="Heuristic.HighEntropy.Packed",
                type=ThreatTypeEnum.RISKWARE,
                severity=SeverityEnum.WARNING,
                file_path=file_path,
                file_hash=sha256,
                description=f"High entropy ({entropy:.2f} bits/byte) — file likely packed/encrypted.",
                recommendation="Inspect with sandbox before executing. Delete if source is untrusted.",
            ))

        for t in threat_items:
            threats_data.append({
                "id": t.id,
                "scan_id": scan_id,
                "name": t.name,
                "threat_type": t.type,
                "severity": t.severity,
                "file_hash": t.file_hash,
                "file_path": t.file_path,
                "description": t.description,
                "recommendation": t.recommendation,
            })

        duration = round(time.perf_counter() - start, 4)
        _persist_sync(scan_id, threats_data, duration)

        result = {
            "scan_id": scan_id,
            "status": "clean" if not threats_data else "threats_found",
            "scanned_items_count": 1,
            "duration_seconds": duration,
            "sha256": sha256,
            "mime_type": mime_type,
            "entropy": entropy,
            "is_high_entropy": high_entropy,
            "threats": [t.model_dump() for t in threat_items],
        }

        log.info(
            "Deep scan complete [%s]: threats=%d | entropy=%.2f | %.4fs",
            scan_id, len(threat_items), entropy, duration,
        )
        return result

    except Exception as exc:
        log.error("Deep scan task failed for %s: %s", scan_id, exc)
        try:
            raise self.retry(exc=exc)
        except self.MaxRetriesExceededError:
            return {"scan_id": scan_id, "status": "failed", "error": str(exc)}
    finally:
        # Always clean up temp file
        try:
            os.unlink(file_path)
        except OSError:
            pass


@shared_task(name="app.worker.tasks.seed_hash_db", queue="default")
def seed_hash_db(signatures: List[Dict[str, str]]) -> Dict[str, Any]:
    """
    Admin task: bulk-seed hash signatures into PostgreSQL from a JSON list.

    Each dict in signatures must have keys:
        hash, hash_type, threat_name, threat_type, severity, source

    Args:
        signatures: List of hash signature dicts.

    Returns:
        Summary with inserted and skipped counts.
    """
    try:
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker
        from app.core.config import get_settings
        from app.models.db_models import HashSignature

        settings = get_settings()
        engine = create_engine(settings.database_url_sync, echo=False)
        Session = sessionmaker(bind=engine)

        inserted = 0
        skipped = 0

        with Session() as session:
            for sig in signatures:
                existing = session.get(HashSignature, sig["hash"].lower())
                if existing:
                    skipped += 1
                    continue
                session.add(HashSignature(
                    hash=sig["hash"].lower(),
                    hash_type=sig.get("hash_type", "sha256"),
                    threat_name=sig["threat_name"],
                    threat_type=sig["threat_type"],
                    severity=sig["severity"],
                    description=sig.get("description", ""),
                    recommendation=sig.get("recommendation", "Remove immediately."),
                    source=sig.get("source", "feed"),
                ))
                inserted += 1
            session.commit()

        log.info("Hash DB seeding: %d inserted, %d skipped.", inserted, skipped)
        return {"status": "ok", "inserted": inserted, "skipped": skipped}
    except Exception as exc:
        log.error("seed_hash_db failed: %s", exc)
        return {"status": "error", "error": str(exc)}
