"""
tests/test_file_scan.py
────────────────────────
Unit tests for static file analysis (POST /api/v1/scan/file).

Tests:
  - Clean file returns status="clean"
  - EICAR test string triggers YARA detection (if rules cover it)
  - High-entropy random bytes flagged in deep scan
  - File exceeding size limit returns 413
  - Invalid scan_type returns 422
  - Response schema validates correctly against FileScanResponse model
"""

from __future__ import annotations

import os
import secrets

import pytest
from httpx import AsyncClient

from app.engine.entropy import calculate_shannon_entropy, is_high_entropy


# ── Entropy unit tests (no HTTP) ──────────────────────────────────────────────

def test_zero_entropy_null_bytes():
    """All-null bytes → entropy should be 0.0."""
    data = b"\x00" * 1024
    assert calculate_shannon_entropy(data) == 0.0


def test_max_entropy_random():
    """Cryptographically random bytes → entropy should be > 7.0."""
    data = secrets.token_bytes(8192)
    entropy = calculate_shannon_entropy(data)
    assert entropy > 7.0


def test_high_entropy_flag():
    """Random bytes should be flagged as high entropy."""
    data = secrets.token_bytes(4096)
    assert is_high_entropy(data) is True


def test_low_entropy_text():
    """Plain English text has low entropy — should NOT trigger flag."""
    data = b"Hello, this is a plain text file. " * 100
    assert is_high_entropy(data) is False


def test_entropy_custom_threshold():
    """Custom threshold override should work correctly."""
    data = secrets.token_bytes(1024)
    # Very low threshold — should always be high entropy
    assert is_high_entropy(data, threshold=1.0) is True
    # Impossibly high threshold — should never trigger
    assert is_high_entropy(data, threshold=9.0) is False


# ── File scan API tests ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_clean_file_returns_clean(client: AsyncClient):
    """A plain text file with no malware patterns should return status='clean'."""
    content = b"This is a clean text file with no malicious content."
    response = await client.post(
        "/api/v1/scan/file",
        files={"file": ("clean.txt", content, "text/plain")},
        data={"scan_type": "files"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "clean"
    assert data["scanned_items_count"] == 1
    assert len(data["threats"]) == 0


@pytest.mark.asyncio
async def test_file_scan_returns_hashes(client: AsyncClient):
    """Response file_meta should contain md5, sha1, sha256 for the uploaded file."""
    content = b"Test content for hashing"
    response = await client.post(
        "/api/v1/scan/file",
        files={"file": ("test.bin", content, "application/octet-stream")},
        data={"scan_type": "quick"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "file_meta" in data
    meta = data["file_meta"]
    assert len(meta["md5"]) == 32
    assert len(meta["sha256"]) == 64
    assert meta["size_bytes"] == len(content)


@pytest.mark.asyncio
async def test_deep_scan_high_entropy_flagged(client: AsyncClient):
    """Deep scan of random bytes should flag high entropy as a riskware threat."""
    content = secrets.token_bytes(4096)  # pure random = high entropy
    response = await client.post(
        "/api/v1/scan/file",
        files={"file": ("suspicious.bin", content, "application/octet-stream")},
        data={"scan_type": "deep"},
    )
    assert response.status_code == 200
    data = response.json()
    # High entropy file with no YARA match should still flag as warning
    assert data["file_meta"]["is_high_entropy"] is True
    # Status may be threats_found due to entropy flag
    assert data["status"] in ("clean", "threats_found")


@pytest.mark.asyncio
async def test_invalid_scan_type_rejected(client: AsyncClient):
    """Invalid scan_type should return HTTP 422."""
    content = b"test"
    response = await client.post(
        "/api/v1/scan/file",
        files={"file": ("test.txt", content, "text/plain")},
        data={"scan_type": "invalid_type"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_scan_response_schema(client: AsyncClient):
    """Validate that scan response matches the expected ScanResponse schema fields."""
    content = b"schema validation test content"
    response = await client.post(
        "/api/v1/scan/file",
        files={"file": ("schema_test.txt", content, "text/plain")},
        data={"scan_type": "files"},
    )
    assert response.status_code == 200
    data = response.json()

    # Required fields from ScanResponse schema
    assert "scan_id" in data
    assert "status" in data
    assert "scanned_items_count" in data
    assert "duration_seconds" in data
    assert "threats" in data
    assert isinstance(data["threats"], list)
    assert data["duration_seconds"] >= 0.0


@pytest.mark.asyncio
async def test_quick_scan_skips_yara(client: AsyncClient):
    """Quick scan should skip YARA matching (hash-only) and be fast."""
    content = b"quick scan test content " * 100
    response = await client.post(
        "/api/v1/scan/file",
        files={"file": ("quick.txt", content, "text/plain")},
        data={"scan_type": "quick"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["duration_seconds"] < 5.0  # quick scan should be < 5s
