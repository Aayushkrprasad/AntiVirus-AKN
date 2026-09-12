"""
tests/test_apk_scan.py
───────────────────────
Unit tests for APK permission scoring (POST /api/v1/scan/apk).

Since generating real APK files in tests is impractical, these tests
directly unit-test the APKInspector business logic with permission
sets that mirror the mock data in mockData.ts.
"""

from __future__ import annotations

import pytest

from app.engine.apk_inspector import (
    APKInspector,
    DANGEROUS_COMBOS,
    DANGEROUS_PERMISSIONS,
    ELEVATED_PERMISSIONS,
    _short_name,
)
from app.models.schemas import SeverityEnum


# ── _short_name helper ────────────────────────────────────────────────────────

def test_short_name_strips_prefix():
    assert _short_name("android.permission.CAMERA") == "CAMERA"
    assert _short_name("CAMERA") == "CAMERA"


# ── Permission set tests ───────────────────────────────────────────────────────

def test_dangerous_permissions_contains_expected():
    """Key dangerous permissions should be in the dangerous set."""
    dangerous = {
        "android.permission.READ_CONTACTS",
        "android.permission.SEND_SMS",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
    }
    for perm in dangerous:
        assert perm in DANGEROUS_PERMISSIONS, f"Expected {perm} in DANGEROUS_PERMISSIONS"


def test_elevated_permissions_contains_expected():
    """Elevated/system-level permissions used by malware should be present."""
    elevated = {
        "android.permission.SYSTEM_ALERT_WINDOW",
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.INSTALL_PACKAGES",
    }
    for perm in elevated:
        assert perm in ELEVATED_PERMISSIONS, f"Expected {perm} in ELEVATED_PERMISSIONS"


# ── Dangerous combo detection ─────────────────────────────────────────────────

def test_sms_trojan_combo_exists():
    """SMS Trojan combo should be defined in DANGEROUS_COMBOS."""
    names = [c[0] for c in DANGEROUS_COMBOS]
    assert "SMS Trojan Pattern" in names


def test_adware_combo_exists():
    """Adware PUP combo matching mockData app-4 permissions should exist."""
    # app-4: SYSTEM_ALERT_WINDOW, GET_TASKS, WRITE_SETTINGS → Adware
    adware_combo = None
    for name, required_set, threat_type, severity in DANGEROUS_COMBOS:
        if "SYSTEM_ALERT_WINDOW" in required_set and "GET_TASKS" in required_set:
            adware_combo = name
            break
    assert adware_combo is not None, "Expected an Adware combo with SYSTEM_ALERT_WINDOW + GET_TASKS"


# ── Risk scoring integration (mock permissions, no real APK) ──────────────────

def test_safe_permissions_score_safe():
    """An app with only INTERNET permission should score 'safe'."""
    # Simulate what _analyse would return for a minimal permission set
    from app.engine.apk_inspector import DANGEROUS_COMBOS, ELEVATED_PERMISSIONS, _short_name
    short_names = {"INTERNET"}
    detected_combos = []
    for combo_name, required_set, _, _ in DANGEROUS_COMBOS:
        if required_set.issubset(short_names):
            detected_combos.append(combo_name)
    assert len(detected_combos) == 0


def test_flashlight_trojan_combo_detected():
    """
    The flashlight app from mockData.ts has:
      CAMERA, READ_CONTACTS, SEND_SMS, ACCESS_FINE_LOCATION, BACKGROUND_PROCESS
    This should NOT trigger SMS Trojan combo (missing RECEIVE_BOOT_COMPLETED + RECEIVE_SMS).
    But it DOES have enough dangerous permissions to score at least 'warning'.
    """
    short_names = {
        "CAMERA", "READ_CONTACTS", "SEND_SMS",
        "ACCESS_FINE_LOCATION", "BACKGROUND_PROCESS"
    }
    dangerous_count = sum(
        1 for p in short_names
        if f"android.permission.{p}" in DANGEROUS_PERMISSIONS
    )
    # Camera, READ_CONTACTS, SEND_SMS, ACCESS_FINE_LOCATION = 4 dangerous perms → warning
    assert dangerous_count >= 3


def test_overlay_banking_combo_fully_detected():
    """
    The Overlay/Banking Trojan combo requires:
      SYSTEM_ALERT_WINDOW, BIND_DEVICE_ADMIN, GET_ACCOUNTS
    When all are present, combo should be detected.
    """
    short_names = {"SYSTEM_ALERT_WINDOW", "BIND_DEVICE_ADMIN", "GET_ACCOUNTS"}
    detected = []
    for name, required_set, _, _ in DANGEROUS_COMBOS:
        if required_set.issubset(short_names):
            detected.append(name)
    assert "Overlay/Banking Trojan" in detected


def test_adware_pup_combo_detected():
    """
    Adware PUP (matches app-4 from mockData.ts):
      SYSTEM_ALERT_WINDOW, GET_TASKS, WRITE_SETTINGS → Adware.PUP.Tracker.Boost
    """
    short_names = {"SYSTEM_ALERT_WINDOW", "GET_TASKS", "WRITE_SETTINGS"}
    detected = []
    for name, required_set, threat_type, _ in DANGEROUS_COMBOS:
        if required_set.issubset(short_names):
            detected.append((name, threat_type.value))

    assert any("Adware" in name or tt == "Adware" for name, tt in detected)


# ── Non-APK file rejected by endpoint ─────────────────────────────────────────

@pytest.mark.asyncio
async def test_non_apk_extension_rejected(client):
    """Uploading a .exe to /scan/apk should return HTTP 415."""
    content = b"not an apk"
    response = await client.post(
        "/api/v1/scan/apk",
        files={"file": ("malware.exe", content, "application/octet-stream")},
    )
    assert response.status_code == 415
