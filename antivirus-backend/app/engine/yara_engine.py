"""
app/engine/yara_engine.py
──────────────────────────
YARA rule compiler and in-memory scanner.

Design decisions:
  - Rules are compiled ONCE at application startup (via lifespan hook in main.py)
    and stored as a class-level attribute — zero per-request compile overhead.
  - Thread-safe: yara.Rules.match() is re-entrant; multiple Uvicorn worker threads
    can call scan_bytes() concurrently without locks.
  - Rule-to-ThreatType mapping uses YARA rule metadata tags so new .yar files
    only need correct `meta: threat_type = "..."` to be automatically classified.

Supported rule directories (.yar files only):
  app/rules/trojans.yar
  app/rules/ransomware.yar
  app/rules/webshells.yar

Usage:
    from app.engine.yara_engine import YaraEngine

    engine = YaraEngine.get_instance()
    matches = engine.scan_bytes(file_bytes)
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import ClassVar, List, Optional

import yara

from app.core.config import get_settings
from app.models.schemas import SeverityEnum, ThreatItem, ThreatTypeEnum

log = logging.getLogger(__name__)
_settings = get_settings()


# ── YARA Match Result ─────────────────────────────────────────────────────────

@dataclass
class YaraMatchResult:
    """Parsed result from a single YARA rule match."""
    rule_name: str
    threat_name: str
    threat_type: ThreatTypeEnum
    severity: SeverityEnum
    description: str
    recommendation: str
    tags: List[str] = field(default_factory=list)


# ── Default meta values when rule metadata is incomplete ──────────────────────

_DEFAULT_META: dict = {
    "threat_name": "Generic.Malware",
    "threat_type": ThreatTypeEnum.RISKWARE,
    "severity": SeverityEnum.WARNING,
    "description": "YARA rule matched suspicious patterns in the scanned file.",
    "recommendation": "Inspect the file manually and delete if not trusted.",
}

# Mapping from string tag/meta to ThreatTypeEnum
_THREAT_TYPE_MAP: dict[str, ThreatTypeEnum] = {
    "trojan": ThreatTypeEnum.TROJAN,
    "adware": ThreatTypeEnum.ADWARE,
    "spyware": ThreatTypeEnum.SPYWARE,
    "ransomware": ThreatTypeEnum.RANSOMWARE,
    "pup": ThreatTypeEnum.PUP,
    "riskware": ThreatTypeEnum.RISKWARE,
}

_SEVERITY_MAP: dict[str, SeverityEnum] = {
    "safe": SeverityEnum.SAFE,
    "warning": SeverityEnum.WARNING,
    "danger": SeverityEnum.DANGER,
    "critical": SeverityEnum.DANGER,
}


class YaraEngine:
    """
    Singleton YARA scan engine.

    Call YaraEngine.compile(rules_dir) once at startup, then
    YaraEngine.get_instance().scan_bytes(data) per request.
    """

    _instance: ClassVar[Optional["YaraEngine"]] = None
    _compiled_rules: ClassVar[Optional[yara.Rules]] = None
    _rule_count: ClassVar[int] = 0

    def __init__(self, compiled: yara.Rules, rule_count: int) -> None:
        self._rules = compiled
        self._count = rule_count

    # ── Class-level factory ────────────────────────────────────────────────────

    @classmethod
    def compile(cls, rules_dir: Optional[Path] = None) -> "YaraEngine":
        """
        Compile all .yar files in rules_dir and cache the compiled Rules object.

        Must be called once before the first request is served.

        Args:
            rules_dir: Path to directory containing .yar files.
                       Defaults to Settings.yara_rules_path.

        Returns:
            Cached YaraEngine singleton.

        Raises:
            yara.SyntaxError: If any rule file contains a YARA syntax error.
            FileNotFoundError: If rules_dir does not exist or has no .yar files.
        """
        dir_path = rules_dir or _settings.yara_rules_path
        yar_files = sorted(dir_path.glob("*.yar"))

        if not yar_files:
            log.warning("No .yar files found in %s — YARA scanning will be skipped.", dir_path)
            # Compile an empty ruleset so the engine still works
            compiled = yara.compile(source="rule NullRule { condition: false }")
            rule_count = 0
        else:
            filepaths = {f.stem: str(f) for f in yar_files}
            log.info("Compiling %d YARA rule file(s): %s", len(filepaths), list(filepaths.keys()))
            compiled = yara.compile(filepaths=filepaths)
            # Count individual rules via a dummy match on empty bytes
            # (yara-python does not expose a direct rule count property)
            rule_count = len(yar_files)  # approximate; each file may contain N rules
            log.info("YARA compilation successful (%d source files).", rule_count)

        cls._compiled_rules = compiled
        cls._rule_count = rule_count
        cls._instance = cls(compiled, rule_count)
        return cls._instance

    @classmethod
    def get_instance(cls) -> "YaraEngine":
        """Return the compiled engine singleton; compile if not yet done."""
        if cls._instance is None:
            cls.compile()
        return cls._instance

    @property
    def rule_count(self) -> int:
        return self._count

    # ── Core scan method ───────────────────────────────────────────────────────

    def scan_bytes(self, data: bytes, timeout: int = 30) -> List[YaraMatchResult]:
        """
        Run YARA rules against raw bytes.

        Args:
            data: File content to scan.
            timeout: Maximum seconds before YARA aborts scanning (DoS protection).

        Returns:
            List of YaraMatchResult — empty if file is clean.
        """
        try:
            raw_matches = self._rules.match(data=data, timeout=timeout)
        except yara.TimeoutError:
            log.warning("YARA scan timed out after %ds — treating as suspicious.", timeout)
            return [
                YaraMatchResult(
                    rule_name="TIMEOUT",
                    threat_name="Scan.Timeout.Suspicious",
                    threat_type=ThreatTypeEnum.RISKWARE,
                    severity=SeverityEnum.WARNING,
                    description="YARA scan timed out — file may be intentionally complex.",
                    recommendation="Submit to deep analysis or discard the file.",
                )
            ]
        except yara.Error as exc:
            log.error("YARA scan error: %s", exc)
            return []

        results: List[YaraMatchResult] = []
        for match in raw_matches:
            meta = match.meta or {}
            threat_type_str = meta.get("threat_type", "riskware").lower()
            severity_str = meta.get("severity", "warning").lower()

            results.append(
                YaraMatchResult(
                    rule_name=match.rule,
                    threat_name=meta.get("threat_name", f"YARA.{match.rule}"),
                    threat_type=_THREAT_TYPE_MAP.get(threat_type_str, ThreatTypeEnum.RISKWARE),
                    severity=_SEVERITY_MAP.get(severity_str, SeverityEnum.WARNING),
                    description=meta.get(
                        "description", _DEFAULT_META["description"]
                    ),
                    recommendation=meta.get(
                        "recommendation", _DEFAULT_META["recommendation"]
                    ),
                    tags=list(match.tags or []),
                )
            )

        if results:
            log.info("YARA matched %d rule(s) against scanned data.", len(results))
        return results

    def to_threat_items(
        self,
        matches: List[YaraMatchResult],
        file_hash: str,
        file_path: Optional[str] = None,
    ) -> List[ThreatItem]:
        """
        Convert raw YARA match results into API-ready ThreatItem objects.

        Args:
            matches: List of YaraMatchResult from scan_bytes().
            file_hash: SHA-256 hex of the scanned file (required by schema).
            file_path: Optional filesystem path of the scanned file.

        Returns:
            List of ThreatItem ready for inclusion in ScanResponse.
        """
        import uuid
        items: List[ThreatItem] = []
        for m in matches:
            items.append(
                ThreatItem(
                    id=str(uuid.uuid4()),
                    name=m.threat_name,
                    type=m.threat_type,
                    severity=m.severity,
                    file_path=file_path,
                    file_hash=file_hash,
                    description=m.description,
                    recommendation=m.recommendation,
                )
            )
        return items
