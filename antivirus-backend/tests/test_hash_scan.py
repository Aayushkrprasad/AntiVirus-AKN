"""
tests/test_hash_scan.py
────────────────────────
Unit tests for hash reputation lookup (POST /api/v1/scan/hash).

Tests:
  - Unknown hash returns safe/clean
  - Known malicious hash (seeded in DB) returns danger + threat info
  - Malformed hash is handled gracefully
  - Batch request returns one result per input hash
"""

from __future__ import annotations

import hashlib
import pytest
from httpx import AsyncClient


KNOWN_MALICIOUS_HASH = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
UNKNOWN_HASH = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"


@pytest.mark.asyncio
async def test_unknown_hash_returns_safe(client: AsyncClient):
    """Querying an unknown hash should return is_malicious=False and severity=safe."""
    response = await client.post(
        "/api/v1/scan/hash",
        json={"hashes": [UNKNOWN_HASH]},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["queried_count"] == 1
    assert data["malicious_count"] == 0
    assert len(data["results"]) == 1
    result = data["results"][0]
    assert result["is_malicious"] is False
    assert result["severity"] == "safe"


@pytest.mark.asyncio
async def test_hash_scan_seeded_malicious(client: AsyncClient, db_session):
    """
    Seed a known malicious hash into the DB,
    then verify the API returns it as dangerous.
    """
    from app.engine.hash_matcher import HashMatcher
    from unittest.mock import AsyncMock
    # Seed directly via engine
    matcher = HashMatcher(redis=AsyncMock(get=AsyncMock(return_value=None)), db=db_session)
    await matcher.add_signature(
        hash_val=KNOWN_MALICIOUS_HASH,
        hash_type="sha256",
        threat_name="Win32.Dropper.RansomAKN",
        threat_type="Ransomware",
        severity="danger",
        description="Test malicious hash.",
        recommendation="Delete immediately.",
        source="test",
    )

    response = await client.post(
        "/api/v1/scan/hash",
        json={"hashes": [KNOWN_MALICIOUS_HASH]},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["malicious_count"] == 1
    result = data["results"][0]
    assert result["is_malicious"] is True
    assert result["severity"] == "danger"
    assert "RansomAKN" in result["threat_name"]


@pytest.mark.asyncio
async def test_batch_hash_scan_count(client: AsyncClient):
    """Batch of N hashes should return exactly N results."""
    hashes = [
        hashlib.sha256(f"file_{i}".encode()).hexdigest() for i in range(5)
    ]
    response = await client.post("/api/v1/scan/hash", json={"hashes": hashes})
    assert response.status_code == 200
    data = response.json()
    assert data["queried_count"] == 5
    assert len(data["results"]) == 5


@pytest.mark.asyncio
async def test_empty_hash_list_rejected(client: AsyncClient):
    """An empty hashes list should return a 422 validation error."""
    response = await client.post("/api/v1/scan/hash", json={"hashes": []})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_hash_scan_duration_present(client: AsyncClient):
    """Response must contain a non-negative duration_seconds field."""
    response = await client.post(
        "/api/v1/scan/hash",
        json={"hashes": [UNKNOWN_HASH]},
    )
    data = response.json()
    assert "duration_seconds" in data
    assert data["duration_seconds"] >= 0.0
