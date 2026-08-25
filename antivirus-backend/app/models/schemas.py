"""
app/models/schemas.py
──────────────────────
Pydantic v2 request/response models for the AntiVirus-AKN backend.

All models are deliberately aligned with the TypeScript types defined in
the React Native client at:
  src/types/scanner.ts
  src/services/INativeScannerService.ts

Field naming follows camelCase-free snake_case on the Python side; the
mobile client can deserialise either via its own mapping layer.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


# ── Enumerations ──────────────────────────────────────────────────────────────

class SeverityEnum(str, Enum):
    """Maps to client RiskLevel: 'safe' | 'warning' | 'danger'."""
    SAFE = "safe"
    WARNING = "warning"
    DANGER = "danger"


class ThreatTypeEnum(str, Enum):
    """Maps to client threatCategory union type."""
    TROJAN = "Trojan"
    ADWARE = "Adware"
    SPYWARE = "Spyware"
    RANSOMWARE = "Ransomware"
    PUP = "PUP"
    RISKWARE = "Riskware"
    CLEAN = "Clean"


class ScanTypeEnum(str, Enum):
    """Maps to client ScanType: 'quick' | 'apps' | 'files' | 'deep'."""
    QUICK = "quick"
    APPS = "apps"
    FILES = "files"
    DEEP = "deep"


# ── Core Threat Model ─────────────────────────────────────────────────────────

class ThreatItem(BaseModel):
    """
    Single threat result item.

    Aligned with TypeScript ThreatItem in scanner.ts:
      id, name (← threatName), type (← threatCategory),
      severity (← riskLevel), file_path (← targetPath),
      file_hash, description, recommendation
    """
    id: str = Field(..., description="UUID of this threat record")
    name: str = Field(..., description="Threat signature name, e.g. 'Android.Trojan.SpySMS.AKN'")
    type: ThreatTypeEnum = Field(..., description="Threat category")
    severity: SeverityEnum = Field(..., description="Risk severity level")
    file_path: Optional[str] = Field(None, description="Path or package name of affected item")
    file_hash: str = Field(..., description="SHA-256 hex digest of the scanned item")
    description: str = Field(..., description="Human-readable threat explanation")
    recommendation: str = Field(..., description="Remediation action for the user")

    model_config = {"use_enum_values": True}


# ── Scan Response ─────────────────────────────────────────────────────────────

class ScanResponse(BaseModel):
    """
    Top-level scan result.

    Maps to client ScanResultSummary:
      id → scan_id, overallStatus → status,
      totalItemsScanned → scanned_items_count,
      durationSeconds → duration_seconds
    """
    scan_id: str = Field(..., description="UUID of this scan session")
    status: str = Field(
        ...,
        description="'clean' if no threats found, 'threats_found' otherwise",
        pattern=r"^(clean|threats_found)$",
    )
    scanned_items_count: int = Field(..., ge=0)
    duration_seconds: float = Field(..., ge=0.0)
    threats: List[ThreatItem] = Field(default_factory=list)
    scan_type: ScanTypeEnum = Field(ScanTypeEnum.QUICK)
    timestamp: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat() + "Z"
    )

    model_config = {"use_enum_values": True}


# ── Hash Scan ─────────────────────────────────────────────────────────────────

class HashScanRequest(BaseModel):
    """POST /scan/hash — body."""
    hashes: List[str] = Field(
        ...,
        min_length=1,
        max_length=100,
        description="List of MD5 or SHA-256 hex strings to look up",
    )

    @field_validator("hashes", mode="before")
    @classmethod
    def normalise_hashes(cls, v: list) -> list:
        """Strip whitespace and lowercase all hash strings."""
        return [h.strip().lower() for h in v if h and h.strip()]


class HashReputationItem(BaseModel):
    """Reputation result for a single hash."""
    hash: str
    is_malicious: bool
    threat_name: Optional[str] = None
    threat_type: Optional[ThreatTypeEnum] = None
    severity: SeverityEnum = SeverityEnum.SAFE
    source: str = "local_db"


class HashScanResponse(BaseModel):
    """POST /scan/hash — response envelope."""
    queried_count: int
    malicious_count: int
    results: List[HashReputationItem]
    duration_seconds: float


# ── File Scan ─────────────────────────────────────────────────────────────────

class FileScanMeta(BaseModel):
    """Metadata extracted from an uploaded file."""
    filename: str
    mime_type: str
    size_bytes: int
    md5: str
    sha1: str
    sha256: str
    entropy: float
    is_high_entropy: bool


class FileScanResponse(ScanResponse):
    """POST /scan/file — extended with file metadata."""
    file_meta: Optional[FileScanMeta] = None


# ── APK Scan ──────────────────────────────────────────────────────────────────

class APKPermissionRisk(BaseModel):
    """A single permission with its individual risk assessment."""
    permission: str
    is_dangerous: bool
    risk_reason: Optional[str] = None


class APKScanResponse(BaseModel):
    """POST /scan/apk — APK-specific result."""
    scan_id: str
    package_name: str
    version_name: str
    version_code: int
    risk_level: SeverityEnum
    permissions: List[APKPermissionRisk]
    dangerous_combos_detected: List[str] = Field(
        default_factory=list,
        description="List of dangerous permission combination names detected",
    )
    certificate_sha256: Optional[str] = None
    threat_items: List[ThreatItem] = Field(default_factory=list)
    duration_seconds: float
    timestamp: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat() + "Z"
    )

    model_config = {"use_enum_values": True}


# ── Definitions ───────────────────────────────────────────────────────────────

class DefinitionsResponse(BaseModel):
    """GET /definitions/latest — virus definition metadata."""
    version: str = Field(..., description="e.g. 'v2.0.2026.08'")
    released_at: str = Field(..., description="ISO-8601 timestamp")
    rule_count: int = Field(..., ge=0)
    md5_checksum: str
    sha256_checksum: str
    yara_rules_loaded: int = Field(
        0, description="Number of YARA rules currently compiled in memory"
    )


# ── Stats ─────────────────────────────────────────────────────────────────────

class ThreatBreakdown(BaseModel):
    threat_type: str
    count: int


class StatsSummaryResponse(BaseModel):
    """GET /stats/summary — aggregate scan statistics."""
    total_scans: int
    total_threats_found: int
    clean_scans: int
    threat_breakdown: List[ThreatBreakdown]
    most_recent_scan_at: Optional[str] = None


# ── Health ────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    """GET /health — service liveness check."""
    status: str = "ok"
    version: str
    redis_connected: bool
    db_connected: bool
    yara_rules_loaded: int
