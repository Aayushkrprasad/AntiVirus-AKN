"""
app/engine/apk_inspector.py
────────────────────────────
Android APK static analysis engine using androguard.

Capabilities:
  - Parses AndroidManifest.xml to extract declared permissions
  - Detects dangerous individual permissions
  - Detects known dangerous permission COMBINATIONS (escalating risk)
  - Extracts APK signing certificate SHA-256 fingerprint
  - Scores overall risk: safe → warning → danger

Permission combination rules are modelled after real-world threat patterns
observed in the mock data (mockData.ts) and known Android malware families.

Usage:
    from app.engine.apk_inspector import APKInspector

    result = APKInspector.inspect(apk_bytes)
"""

from __future__ import annotations

import hashlib
import logging
import tempfile
import uuid
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple

from app.models.schemas import (
    APKPermissionRisk,
    APKScanResponse,
    SeverityEnum,
    ThreatItem,
    ThreatTypeEnum,
)

log = logging.getLogger(__name__)

# ── Individual dangerous permissions ──────────────────────────────────────────
# Source: Android developer docs — "Dangerous permissions" group
DANGEROUS_PERMISSIONS: Set[str] = {
    "android.permission.READ_CONTACTS",
    "android.permission.WRITE_CONTACTS",
    "android.permission.READ_CALL_LOG",
    "android.permission.WRITE_CALL_LOG",
    "android.permission.READ_EXTERNAL_STORAGE",
    "android.permission.WRITE_EXTERNAL_STORAGE",
    "android.permission.ACCESS_FINE_LOCATION",
    "android.permission.ACCESS_COARSE_LOCATION",
    "android.permission.ACCESS_BACKGROUND_LOCATION",
    "android.permission.CAMERA",
    "android.permission.RECORD_AUDIO",
    "android.permission.SEND_SMS",
    "android.permission.RECEIVE_SMS",
    "android.permission.READ_SMS",
    "android.permission.RECEIVE_MMS",
    "android.permission.CALL_PHONE",
    "android.permission.PROCESS_OUTGOING_CALLS",
    "android.permission.READ_PHONE_STATE",
    "android.permission.USE_SIP",
    "android.permission.BODY_SENSORS",
    "android.permission.GET_ACCOUNTS",
    "android.permission.USE_CREDENTIALS",
}

# ── Elevated risk: system-level or abuse-prone permissions ───────────────────
ELEVATED_PERMISSIONS: Set[str] = {
    "android.permission.SYSTEM_ALERT_WINDOW",    # overlay abuse
    "android.permission.BIND_DEVICE_ADMIN",      # device admin hijack
    "android.permission.RECEIVE_BOOT_COMPLETED", # persistence
    "android.permission.GET_TASKS",              # task snooping
    "android.permission.WRITE_SETTINGS",         # settings tampering
    "android.permission.INSTALL_PACKAGES",       # dropper behaviour
    "android.permission.DELETE_PACKAGES",        # app removal
    "android.permission.FOREGROUND_SERVICE",
    "android.permission.REQUEST_INSTALL_PACKAGES",
    "android.permission.KILL_BACKGROUND_PROCESSES",
}

# ── Dangerous permission COMBINATIONS ────────────────────────────────────────
# Each entry: (combo_name, frozenset of permission short names, threat_type, severity)
DANGEROUS_COMBOS: List[Tuple[str, frozenset, ThreatTypeEnum, SeverityEnum]] = [
    (
        "SMS Trojan Pattern",
        frozenset({"RECEIVE_BOOT_COMPLETED", "SEND_SMS", "RECEIVE_SMS", "READ_CONTACTS"}),
        ThreatTypeEnum.TROJAN,
        SeverityEnum.DANGER,
    ),
    (
        "Spyware Location Harvester",
        frozenset({"ACCESS_FINE_LOCATION", "ACCESS_BACKGROUND_LOCATION", "READ_CONTACTS", "CAMERA"}),
        ThreatTypeEnum.SPYWARE,
        SeverityEnum.DANGER,
    ),
    (
        "Overlay/Banking Trojan",
        frozenset({"SYSTEM_ALERT_WINDOW", "BIND_DEVICE_ADMIN", "GET_ACCOUNTS"}),
        ThreatTypeEnum.TROJAN,
        SeverityEnum.DANGER,
    ),
    (
        "Adware PUP Pattern",
        frozenset({"SYSTEM_ALERT_WINDOW", "GET_TASKS", "WRITE_SETTINGS"}),
        ThreatTypeEnum.ADWARE,
        SeverityEnum.WARNING,
    ),
    (
        "Dropper/Installer Riskware",
        frozenset({"INSTALL_PACKAGES", "REQUEST_INSTALL_PACKAGES", "RECEIVE_BOOT_COMPLETED"}),
        ThreatTypeEnum.RISKWARE,
        SeverityEnum.WARNING,
    ),
    (
        "Keylogger/Accessibility Abuse",
        frozenset({"RECORD_AUDIO", "READ_CONTACTS", "ACCESS_FINE_LOCATION", "RECEIVE_BOOT_COMPLETED"}),
        ThreatTypeEnum.SPYWARE,
        SeverityEnum.DANGER,
    ),
    (
        "Call Interceptor",
        frozenset({"READ_CALL_LOG", "PROCESS_OUTGOING_CALLS", "READ_PHONE_STATE", "INTERNET"}),
        ThreatTypeEnum.SPYWARE,
        SeverityEnum.DANGER,
    ),
]


def _short_name(permission: str) -> str:
    """Strip 'android.permission.' prefix for combo matching."""
    return permission.split(".")[-1]


class APKInspector:
    """Static APK analysis engine. All methods are class-level (no instance needed)."""

    @classmethod
    def inspect(cls, apk_bytes: bytes) -> APKScanResponse:
        """
        Full APK static analysis pipeline.

        Args:
            apk_bytes: Raw bytes of the .apk file.

        Returns:
            APKScanResponse with risk level, permissions, combos, and threats.
        """
        scan_id = str(uuid.uuid4())
        start = __import__("time").perf_counter()

        # Write to temp file — androguard requires a file path
        with tempfile.NamedTemporaryFile(suffix=".apk", delete=False) as tmp:
            tmp.write(apk_bytes)
            tmp_path = tmp.name

        try:
            return cls._analyse(tmp_path, scan_id, start)
        finally:
            Path(tmp_path).unlink(missing_ok=True)

    @classmethod
    def _analyse(cls, apk_path: str, scan_id: str, start: float) -> APKScanResponse:
        """Internal: run androguard analysis on a temp file path."""
        try:
            from androguard.misc import AnalyzeAPK
            apk, _, _ = AnalyzeAPK(apk_path)
        except Exception as exc:
            log.error("Androguard failed to parse APK: %s", exc)
            duration = __import__("time").perf_counter() - start
            return APKScanResponse(
                scan_id=scan_id,
                package_name="unknown",
                version_name="unknown",
                version_code=0,
                risk_level=SeverityEnum.WARNING,
                permissions=[],
                dangerous_combos_detected=["Parse Error — could not read AndroidManifest.xml"],
                threat_items=[],
                duration_seconds=round(duration, 3),
            )

        package_name = apk.get_package() or "unknown"
        version_name = apk.get_androidversion_name() or "unknown"
        try:
            version_code = int(apk.get_androidversion_code() or 0)
        except (ValueError, TypeError):
            version_code = 0

        declared_permissions: List[str] = apk.get_permissions() or []
        short_names: Set[str] = {_short_name(p) for p in declared_permissions}

        # ── Certificate fingerprint ────────────────────────────────────────────
        cert_sha256: Optional[str] = None
        try:
            certs = apk.get_certificates_der_v2() or apk.get_certificates_der_v3()
            if not certs:
                certs = [apk.get_certificate_der(apk.get_signature_names()[0])]
            if certs:
                cert_sha256 = hashlib.sha256(list(certs.values())[0] if isinstance(certs, dict) else certs[0]).hexdigest()
        except Exception:
            pass

        # ── Permission-level risk assessment ──────────────────────────────────
        permission_risks: List[APKPermissionRisk] = []
        for perm in declared_permissions:
            short = _short_name(perm)
            if perm in ELEVATED_PERMISSIONS or short in {_short_name(p) for p in ELEVATED_PERMISSIONS}:
                permission_risks.append(APKPermissionRisk(
                    permission=perm,
                    is_dangerous=True,
                    risk_reason="Elevated/system-level permission prone to abuse",
                ))
            elif perm in DANGEROUS_PERMISSIONS or short in {_short_name(p) for p in DANGEROUS_PERMISSIONS}:
                permission_risks.append(APKPermissionRisk(
                    permission=perm,
                    is_dangerous=True,
                    risk_reason="Android dangerous permission group",
                ))
            else:
                permission_risks.append(APKPermissionRisk(
                    permission=perm,
                    is_dangerous=False,
                ))

        # ── Combo detection ────────────────────────────────────────────────────
        combos_detected: List[str] = []
        threat_items: List[ThreatItem] = []
        overall_severity = SeverityEnum.SAFE

        for combo_name, required_set, threat_type, severity in DANGEROUS_COMBOS:
            if required_set.issubset(short_names):
                combos_detected.append(combo_name)
                threat_items.append(ThreatItem(
                    id=str(uuid.uuid4()),
                    name=f"APK.{threat_type.value}.PermissionAbuse",
                    type=threat_type,
                    severity=severity,
                    file_path=package_name,
                    file_hash=hashlib.sha256(apk_bytes_placeholder := b"").hexdigest(),
                    description=f"App declares the '{combo_name}' permission combination, "
                                f"a known indicator of {threat_type.value} behaviour.",
                    recommendation="Uninstall this application immediately and review your device for compromise.",
                ))
                # Escalate severity
                if severity == SeverityEnum.DANGER:
                    overall_severity = SeverityEnum.DANGER
                elif severity == SeverityEnum.WARNING and overall_severity == SeverityEnum.SAFE:
                    overall_severity = SeverityEnum.WARNING

        # If no combos but many dangerous permissions, warn
        dangerous_count = sum(1 for p in permission_risks if p.is_dangerous)
        if overall_severity == SeverityEnum.SAFE:
            if dangerous_count >= 5:
                overall_severity = SeverityEnum.WARNING
            elif dangerous_count >= 3:
                overall_severity = SeverityEnum.WARNING

        duration = round(__import__("time").perf_counter() - start, 3)

        return APKScanResponse(
            scan_id=scan_id,
            package_name=package_name,
            version_name=version_name,
            version_code=version_code,
            risk_level=overall_severity,
            permissions=permission_risks,
            dangerous_combos_detected=combos_detected,
            certificate_sha256=cert_sha256,
            threat_items=threat_items,
            duration_seconds=duration,
        )
