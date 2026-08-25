"""
app/api/v1/endpoints/definitions.py
─────────────────────────────────────
Virus definition version endpoints.

Endpoints:
  GET /api/v1/definitions/latest  — Current definition version & checksums
  GET /api/v1/definitions/history — All historic definition versions
"""

from __future__ import annotations

import hashlib
import logging
from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import verify_api_key
from app.db.session import get_db
from app.engine.yara_engine import YaraEngine
from app.models.db_models import DefinitionVersion
from app.models.schemas import DefinitionsResponse

log = logging.getLogger(__name__)
_settings = get_settings()

router = APIRouter(dependencies=[Depends(verify_api_key)])


def _compute_rules_checksum(rules_dir: Path) -> tuple[str, str]:
    """
    Compute MD5 and SHA-256 checksums over all .yar files in rules_dir.
    Files are sorted for deterministic output.

    Returns:
        (md5_hex, sha256_hex) tuple.
    """
    md5_h = hashlib.md5()
    sha256_h = hashlib.sha256()

    for yar_file in sorted(rules_dir.glob("*.yar")):
        content = yar_file.read_bytes()
        md5_h.update(content)
        sha256_h.update(content)

    return md5_h.hexdigest(), sha256_h.hexdigest()


@router.get(
    "/latest",
    response_model=DefinitionsResponse,
    summary="Get latest virus definition version",
    description=(
        "Returns the current virus definition version, release timestamp, "
        "total rule count, and integrity checksums.\n\n"
        "The client uses `virusDefinitionsVersion` in `SystemStats` to display "
        "the current definition version to the user."
    ),
    status_code=status.HTTP_200_OK,
)
async def get_latest_definitions(
    db: AsyncSession = Depends(get_db),
) -> DefinitionsResponse:
    # Query DB for latest definition record
    stmt = (
        select(DefinitionVersion)
        .order_by(DefinitionVersion.released_at.desc())
        .limit(1)
    )
    result = await db.execute(stmt)
    db_version: DefinitionVersion | None = result.scalar_one_or_none()

    # Compute live checksums from rules directory
    rules_dir = _settings.yara_rules_path
    md5_checksum, sha256_checksum = _compute_rules_checksum(rules_dir)

    # Get currently loaded YARA rule count
    engine = YaraEngine.get_instance()
    loaded_rules = engine.rule_count

    if db_version:
        return DefinitionsResponse(
            version=db_version.version_string,
            released_at=db_version.released_at.isoformat() + "Z",
            rule_count=db_version.rule_count,
            md5_checksum=md5_checksum,
            sha256_checksum=sha256_checksum,
            yara_rules_loaded=loaded_rules,
        )

    # Fallback: derive from settings if no DB record exists yet
    yar_files = list(rules_dir.glob("*.yar"))
    return DefinitionsResponse(
        version=_settings.definitions_version,
        released_at="2026-08-25T00:00:00Z",
        rule_count=len(yar_files),
        md5_checksum=md5_checksum,
        sha256_checksum=sha256_checksum,
        yara_rules_loaded=loaded_rules,
    )


@router.get(
    "/history",
    response_model=List[DefinitionsResponse],
    summary="List all definition versions",
    status_code=status.HTTP_200_OK,
)
async def get_definitions_history(
    db: AsyncSession = Depends(get_db),
) -> List[DefinitionsResponse]:
    stmt = select(DefinitionVersion).order_by(DefinitionVersion.released_at.desc())
    result = await db.execute(stmt)
    versions = result.scalars().all()

    return [
        DefinitionsResponse(
            version=v.version_string,
            released_at=v.released_at.isoformat() + "Z",
            rule_count=v.rule_count,
            md5_checksum=v.md5_checksum,
            sha256_checksum=v.sha256_checksum,
            yara_rules_loaded=YaraEngine.get_instance().rule_count,
        )
        for v in versions
    ]
