"""
app/db/redis_client.py
───────────────────────
Async Redis client factory and FastAPI dependency.

Uses redis.asyncio (bundled with redis-py >= 4.2) for full async support.
The client is created once per application lifecycle (not per request) using
a connection pool for efficiency.

Usage::

    from app.db.redis_client import get_redis

    @router.get("/")
    async def handler(redis: Redis = Depends(get_redis)):
        await redis.set("key", "value")
"""

from __future__ import annotations

import logging
from typing import AsyncGenerator, Optional

from redis.asyncio import Redis, ConnectionPool
from redis.exceptions import RedisError

from app.core.config import get_settings

log = logging.getLogger(__name__)
_settings = get_settings()

# Module-level connection pool (shared across all requests)
_pool: Optional[ConnectionPool] = None
_redis_client: Optional[Redis] = None


def create_redis_pool() -> ConnectionPool:
    """Create and return a Redis connection pool from the configured URL."""
    global _pool
    _pool = ConnectionPool.from_url(
        _settings.redis_url,
        max_connections=50,
        decode_responses=False,  # keep bytes for JSON payloads
    )
    log.info("Redis connection pool created: %s", _settings.redis_url)
    return _pool


def get_redis_client() -> Redis:
    """Return the module-level Redis client, creating it if needed."""
    global _redis_client
    if _redis_client is None:
        pool = _pool or create_redis_pool()
        _redis_client = Redis(connection_pool=pool)
    return _redis_client


async def close_redis() -> None:
    """Close the Redis connection pool on application shutdown."""
    global _redis_client
    if _redis_client:
        await _redis_client.aclose()
        _redis_client = None
        log.info("Redis connection closed.")


async def ping_redis() -> bool:
    """Health-check: return True if Redis is reachable."""
    try:
        client = get_redis_client()
        return await client.ping()
    except RedisError as exc:
        log.warning("Redis ping failed: %s", exc)
        return False


async def get_redis() -> AsyncGenerator[Redis, None]:
    """
    FastAPI dependency that yields the shared Redis client.

    Does NOT open/close a connection per request — uses the pool.
    """
    yield get_redis_client()
