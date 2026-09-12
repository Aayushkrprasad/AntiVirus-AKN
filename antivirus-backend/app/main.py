"""
app/main.py
────────────
AntiVirus-AKN FastAPI application factory.

Startup lifecycle:
  1. Compile YARA rules from rules directory (fail-safe: warns if empty)
  2. Create Redis connection pool
  3. Create/verify database tables (dev mode; use Alembic in production)

Middleware:
  - CORS: whitelisted origins from Settings.allowed_origins_list
  - Trusted hosts (production hardening)

Routes:
  GET  /health         — Liveness + dependency health check
  /api/v1/...          — All versioned API endpoints
"""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.api_router import api_router
from app.core.config import get_settings
from app.db.redis_client import close_redis, create_redis_pool, ping_redis
from app.db.session import create_all_tables
from app.engine.yara_engine import YaraEngine
from app.models.schemas import HealthResponse

# ── Logging setup ─────────────────────────────────────────────────────────────
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.stdlib.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.dev.ConsoleRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
)
log = structlog.get_logger(__name__)

_settings = get_settings()


# ── Application lifespan ──────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application startup and shutdown lifecycle manager.

    Startup:
      - Compile all YARA rules in one pass
      - Initialise Redis connection pool
      - Create DB tables (dev/test shortcut)

    Shutdown:
      - Close Redis connections gracefully
    """
    # 1. YARA compilation (fail-safe)
    log.info("Compiling YARA rules from: %s", _settings.yara_rules_path)
    engine = YaraEngine.compile(_settings.yara_rules_path)
    log.info("YARA engine ready — %d rule source file(s) compiled.", engine.rule_count)

    # 2. Redis pool
    log.info("Initialising Redis connection pool...")
    create_redis_pool()

    # 3. DB tables (non-destructive — safe to run on restart)
    log.info("Verifying database schema...")
    await create_all_tables()

    # 4. Ensure deep scan temp dir exists
    os.makedirs("/tmp/avscanner", exist_ok=True)

    log.info("AntiVirus-AKN backend startup complete. Serving requests...")
    yield

    # ── Shutdown ──────────────────────────────────────────────────────────────
    log.info("Shutting down AntiVirus-AKN backend...")
    await close_redis()
    log.info("Shutdown complete.")


# ── FastAPI application ────────────────────────────────────────────────────────

def create_app() -> FastAPI:
    """
    Application factory — returns the configured FastAPI instance.

    This pattern enables easier testing (create a fresh app per test suite).
    """
    application = FastAPI(
        title="AntiVirus-AKN Threat Detection API",
        description=(
            "High-performance antivirus & threat detection backend for the "
            "AntiVirus-AKN mobile application. Provides YARA-based file scanning, "
            "hash reputation lookups, APK analysis, and virus definition management."
        ),
        version=_settings.app_version,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # ── CORS ──────────────────────────────────────────────────────────────────
    application.add_middleware(
        CORSMiddleware,
        allow_origins=_settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

    # ── Routes ────────────────────────────────────────────────────────────────
    application.include_router(api_router, prefix="/api/v1")

    # ── Health endpoint ───────────────────────────────────────────────────────
    @application.get(
        "/health",
        response_model=HealthResponse,
        tags=["System"],
        summary="Service liveness and dependency health check",
    )
    async def health_check() -> HealthResponse:
        """
        Returns the operational status of the API and its dependencies.
        Used by Docker HEALTHCHECK and load-balancer probes.
        """
        redis_ok = await ping_redis()

        # Quick DB ping
        db_ok = False
        try:
            from app.db.session import engine
            async with engine.connect() as conn:
                await conn.execute(__import__("sqlalchemy").text("SELECT 1"))
            db_ok = True
        except Exception:
            pass

        yara_count = YaraEngine.get_instance().rule_count

        return HealthResponse(
            status="ok",
            version=_settings.app_version,
            redis_connected=redis_ok,
            db_connected=db_ok,
            yara_rules_loaded=yara_count,
        )

    return application


# ── Entrypoint ────────────────────────────────────────────────────────────────
app = create_app()
