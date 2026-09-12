"""
app/api/v1/endpoints/stats.py
──────────────────────────────
Aggregate scan statistics endpoints.

Endpoints:
  GET /api/v1/stats/summary   — Global scan counts, threat breakdown, last scan time
"""

from __future__ import annotations

import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_api_key
from app.db.session import get_db
from app.models.db_models import ScanRecord, ThreatRecord
from app.models.schemas import StatsSummaryResponse, ThreatBreakdown

log = logging.getLogger(__name__)
router = APIRouter(dependencies=[Depends(verify_api_key)])


@router.get(
    "/summary",
    response_model=StatsSummaryResponse,
    summary="Global scan statistics summary",
    description=(
        "Returns aggregate statistics across all scan sessions:\n"
        "- Total scans performed\n"
        "- Total threats found\n"
        "- Clean scan count\n"
        "- Threat breakdown by category\n"
        "- Most recent scan timestamp"
    ),
    status_code=status.HTTP_200_OK,
)
async def get_stats_summary(
    db: AsyncSession = Depends(get_db),
) -> StatsSummaryResponse:
    # Total scans
    total_scans_result = await db.execute(select(func.count(ScanRecord.id)))
    total_scans: int = total_scans_result.scalar_one() or 0

    # Clean scans
    clean_scans_result = await db.execute(
        select(func.count(ScanRecord.id)).where(ScanRecord.status == "clean")
    )
    clean_scans: int = clean_scans_result.scalar_one() or 0

    # Total threats
    total_threats_result = await db.execute(select(func.count(ThreatRecord.id)))
    total_threats: int = total_threats_result.scalar_one() or 0

    # Threat breakdown by type
    breakdown_result = await db.execute(
        select(ThreatRecord.threat_type, func.count(ThreatRecord.id))
        .group_by(ThreatRecord.threat_type)
        .order_by(func.count(ThreatRecord.id).desc())
    )
    breakdown: List[ThreatBreakdown] = [
        ThreatBreakdown(threat_type=row[0], count=row[1])
        for row in breakdown_result.all()
    ]

    # Most recent scan
    recent_result = await db.execute(
        select(ScanRecord.created_at)
        .order_by(ScanRecord.created_at.desc())
        .limit(1)
    )
    recent_row = recent_result.scalar_one_or_none()
    most_recent: Optional[str] = recent_row.isoformat() + "Z" if recent_row else None

    return StatsSummaryResponse(
        total_scans=total_scans,
        total_threats_found=total_threats,
        clean_scans=clean_scans,
        threat_breakdown=breakdown,
        most_recent_scan_at=most_recent,
    )
