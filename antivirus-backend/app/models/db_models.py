"""
app/models/db_models.py
────────────────────────
SQLAlchemy 2.0 ORM models (mapped_column / Mapped style).

Tables:
  scan_records      — one row per scan session
  threat_records    — child rows for each threat found in a scan
  hash_signatures   — malware hash reputation database
  definition_versions — virus definition release history
"""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def _uuid() -> str:
    return str(uuid4())


# ── Base ──────────────────────────────────────────────────────────────────────

class Base(DeclarativeBase):
    """Common declarative base for all ORM models."""
    pass


# ── Scan Records ──────────────────────────────────────────────────────────────

class ScanRecord(Base):
    """
    Persisted record of a completed scan session.

    Linked to ThreatRecord rows via scan_id foreign key.
    """
    __tablename__ = "scan_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    scan_type: Mapped[str] = mapped_column(String(16), nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False)
    scanned_items_count: Mapped[int] = mapped_column(Integer, default=0)
    threat_count: Mapped[int] = mapped_column(Integer, default=0)
    duration_seconds: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    threats: Mapped[List["ThreatRecord"]] = relationship(
        "ThreatRecord",
        back_populates="scan",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<ScanRecord id={self.id} type={self.scan_type} status={self.status}>"


# ── Threat Records ────────────────────────────────────────────────────────────

class ThreatRecord(Base):
    """
    Individual threat found during a scan session.
    Each row corresponds to one ThreatItem in the API response.
    """
    __tablename__ = "threat_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    scan_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("scan_records.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    threat_type: Mapped[str] = mapped_column(String(32), nullable=False)
    severity: Mapped[str] = mapped_column(String(16), nullable=False)
    file_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    file_path: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    recommendation: Mapped[str] = mapped_column(Text, nullable=False)
    detected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    scan: Mapped["ScanRecord"] = relationship("ScanRecord", back_populates="threats")

    def __repr__(self) -> str:  # pragma: no cover
        return f"<ThreatRecord id={self.id} name={self.name} severity={self.severity}>"


# ── Hash Signatures (Malware Database) ───────────────────────────────────────

class HashSignature(Base):
    """
    Known malware hash reputation record.

    Indexed on `hash` (primary key) for O(1) lookups.
    Populated from:
      - Manual ingestion via admin endpoint
      - Virus definition update feeds
    """
    __tablename__ = "hash_signatures"

    hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    hash_type: Mapped[str] = mapped_column(String(8), nullable=False)  # "md5"|"sha256"
    threat_name: Mapped[str] = mapped_column(String(128), nullable=False)
    threat_type: Mapped[str] = mapped_column(String(32), nullable=False)
    severity: Mapped[str] = mapped_column(String(16), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    recommendation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source: Mapped[str] = mapped_column(String(64), default="local_db")
    added_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<HashSignature hash={self.hash[:12]}... name={self.threat_name}>"


# ── Definition Versions ───────────────────────────────────────────────────────

class DefinitionVersion(Base):
    """
    Virus definition release record.

    The most recent row (by released_at) is returned by GET /definitions/latest.
    """
    __tablename__ = "definition_versions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    version_string: Mapped[str] = mapped_column(String(32), nullable=False, unique=True)
    rule_count: Mapped[int] = mapped_column(Integer, default=0)
    md5_checksum: Mapped[str] = mapped_column(String(32), nullable=False)
    sha256_checksum: Mapped[str] = mapped_column(String(64), nullable=False)
    released_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<DefinitionVersion {self.version_string}>"
