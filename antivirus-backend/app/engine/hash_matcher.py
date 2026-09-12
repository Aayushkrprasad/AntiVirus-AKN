"""
app/engine/hash_matcher.py
───────────────────────────
Redis-first, PostgreSQL-fallback malware hash reputation lookup service.

Lookup strategy:
  1. Redis HGET for O(1) cache hit (TTL = 24 h, refreshed on definition update)
  2. On miss → query PostgreSQL `hash_signatures` table
  3. On PG hit → backfill Redis cache for future requests

This two-tier approach keeps average hash lookup latency < 2 ms for cached
hashes while maintaining a durable persistent store.

Usage:
    from app.engine.hash_matcher import HashMatcher

    matcher = HashMatcher(redis_client, db_session)
    results = await matcher.lookup_hashes(["sha256hex1", "sha256hex2"])
"""

from __future__ import annotations

import json
import logging
import uuid
from typing import List, Optional

from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.db_models import HashSignature
from app.models.schemas import (
    HashReputationItem,
    SeverityEnum,
    ThreatItem,
    ThreatTypeEnum,
)

log = logging.getLogger(__name__)
_settings = get_settings()

# Redis key prefix for hash lookups
_REDIS_PREFIX = "av:hash:"


class HashMatcher:
    """
    Async malware hash reputation lookup service.

    Args:
        redis: An async Redis client instance (from redis.asyncio).
        db: An async SQLAlchemy session.
    """

    def __init__(self, redis: Redis, db: AsyncSession) -> None:
        self._redis = redis
        self._db = db

    # ── Public API ─────────────────────────────────────────────────────────────

    async def lookup_hashes(self, hashes: List[str]) -> List[HashReputationItem]:
        """
        Batch hash reputation lookup.

        Args:
            hashes: List of MD5 or SHA-256 hex strings (already lowercase).

        Returns:
            List of HashReputationItem, one per input hash.
        """
        results: List[HashReputationItem] = []

        for h in hashes:
            item = await self._lookup_single(h)
            results.append(item)

        return results

    async def lookup_hashes_as_threats(
        self,
        hashes: List[str],
    ) -> List[ThreatItem]:
        """
        Convenience method that returns only malicious hashes as ThreatItems.

        Args:
            hashes: List of hex hash strings.

        Returns:
            List of ThreatItem for any malicious hashes found.
        """
        reputation_items = await self.lookup_hashes(hashes)
        threats: List[ThreatItem] = []

        for item in reputation_items:
            if item.is_malicious:
                threats.append(
                    ThreatItem(
                        id=str(uuid.uuid4()),
                        name=item.threat_name or "Unknown.Malware",
                        type=item.threat_type or ThreatTypeEnum.RISKWARE,
                        severity=item.severity,
                        file_hash=item.hash,
                        description=f"Hash {item.hash[:12]}... matched known malware signature.",
                        recommendation="Delete or quarantine this file immediately.",
                    )
                )

        return threats

    async def add_signature(
        self,
        hash_val: str,
        hash_type: str,
        threat_name: str,
        threat_type: str,
        severity: str,
        description: str = "",
        recommendation: str = "Remove immediately.",
        source: str = "manual",
    ) -> HashSignature:
        """
        Persist a new malware hash signature to PostgreSQL and cache in Redis.

        Args:
            hash_val: Hex hash string.
            hash_type: 'md5' | 'sha256'.
            threat_name: Human-readable threat name.
            threat_type: One of ThreatTypeEnum values.
            severity: One of SeverityEnum values.
            description: Optional human-readable description.
            recommendation: Optional remediation advice.
            source: Data source identifier.

        Returns:
            The newly created HashSignature ORM instance.
        """
        sig = HashSignature(
            hash=hash_val.lower(),
            hash_type=hash_type,
            threat_name=threat_name,
            threat_type=threat_type,
            severity=severity,
            description=description,
            recommendation=recommendation,
            source=source,
        )
        self._db.add(sig)
        await self._db.commit()
        await self._db.refresh(sig)

        # Backfill Redis
        await self._cache_signature(sig)
        log.info("New hash signature added: %s (%s)", hash_val[:12], threat_name)
        return sig

    # ── Internal helpers ───────────────────────────────────────────────────────

    async def _lookup_single(self, hash_val: str) -> HashReputationItem:
        """Lookup one hash — Redis first, then PostgreSQL."""
        # 1. Redis cache hit
        cached = await self._redis_get(hash_val)
        if cached is not None:
            log.debug("Cache HIT for hash %s", hash_val[:12])
            return cached

        # 2. PostgreSQL lookup
        stmt = select(HashSignature).where(HashSignature.hash == hash_val)
        result = await self._db.execute(stmt)
        sig: Optional[HashSignature] = result.scalar_one_or_none()

        if sig is None:
            return HashReputationItem(
                hash=hash_val,
                is_malicious=False,
                severity=SeverityEnum.SAFE,
                source="local_db",
            )

        # Backfill cache
        await self._cache_signature(sig)

        return HashReputationItem(
            hash=hash_val,
            is_malicious=True,
            threat_name=sig.threat_name,
            threat_type=ThreatTypeEnum(sig.threat_type),
            severity=SeverityEnum(sig.severity),
            source=sig.source,
        )

    async def _redis_get(self, hash_val: str) -> Optional[HashReputationItem]:
        """Retrieve cached hash result from Redis."""
        key = f"{_REDIS_PREFIX}{hash_val}"
        try:
            raw = await self._redis.get(key)
            if raw:
                data = json.loads(raw)
                return HashReputationItem(**data)
        except Exception as exc:
            log.warning("Redis get failed for %s: %s", hash_val[:12], exc)
        return None

    async def _cache_signature(self, sig: HashSignature) -> None:
        """Write a hash signature into Redis with configured TTL."""
        key = f"{_REDIS_PREFIX}{sig.hash}"
        payload = json.dumps(
            {
                "hash": sig.hash,
                "is_malicious": True,
                "threat_name": sig.threat_name,
                "threat_type": sig.threat_type,
                "severity": sig.severity,
                "source": sig.source,
            }
        )
        try:
            await self._redis.setex(key, _settings.redis_hash_ttl_seconds, payload)
        except Exception as exc:
            log.warning("Redis set failed for %s: %s", sig.hash[:12], exc)
