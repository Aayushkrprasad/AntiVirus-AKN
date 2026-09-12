"""
tests/conftest.py
──────────────────
Pytest fixtures for the AntiVirus-AKN backend test suite.

Fixtures:
  anyio_backend    — use asyncio for all async tests
  test_app         — fresh FastAPI application instance (no lifespan)
  client           — async HTTPX test client
  db_session       — in-memory SQLite async session
  mock_redis       — fakeredis async client
  yara_engine      — pre-compiled YARA engine pointing at test rules
"""

from __future__ import annotations

import asyncio
from pathlib import Path
from typing import AsyncGenerator
from unittest.mock import AsyncMock, MagicMock

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.models.db_models import Base

# ── Use asyncio backend for all async tests ────────────────────────────────────
pytest_plugins = ("anyio",)


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


# ── In-memory SQLite DB (per test session) ────────────────────────────────────

@pytest_asyncio.fixture(scope="session")
async def db_engine():
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
        future=True,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(db_engine) -> AsyncGenerator[AsyncSession, None]:
    factory = async_sessionmaker(db_engine, expire_on_commit=False, autoflush=False)
    async with factory() as session:
        yield session
        await session.rollback()


# ── Fake Redis ────────────────────────────────────────────────────────────────

@pytest.fixture
def mock_redis():
    """AsyncMock Redis client with basic get/set/setex/ping behaviour."""
    redis = AsyncMock()
    _store: dict = {}

    async def _get(key):
        return _store.get(key)

    async def _set(key, value):
        _store[key] = value

    async def _setex(key, ttl, value):
        _store[key] = value

    async def _ping():
        return True

    redis.get = _get
    redis.set = _set
    redis.setex = _setex
    redis.ping = _ping
    return redis


# ── YARA engine fixture ───────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def yara_engine():
    """Compile the real YARA rules for use in tests."""
    from app.engine.yara_engine import YaraEngine
    rules_dir = Path(__file__).parent.parent / "app" / "rules"
    return YaraEngine.compile(rules_dir)


# ── FastAPI test client ────────────────────────────────────────────────────────

@pytest_asyncio.fixture
async def client(db_session, mock_redis) -> AsyncGenerator[AsyncClient, None]:
    """
    Async HTTPX test client wired to the FastAPI app with dependency overrides.
    Bypasses the full lifespan (no YARA recompile, no real DB/Redis connections).
    """
    from app.main import create_app
    from app.db.session import get_db
    from app.db.redis_client import get_redis

    app = create_app()

    # Override dependencies
    app.dependency_overrides[get_db] = lambda: db_session
    app.dependency_overrides[get_redis] = lambda: mock_redis

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://testserver"
    ) as ac:
        yield ac
