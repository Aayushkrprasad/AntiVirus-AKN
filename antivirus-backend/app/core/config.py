"""
app/core/config.py
──────────────────
Centralised application settings loaded from environment variables / .env file.
Uses Pydantic v2 BaseSettings for automatic validation and type coercion.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic import AnyUrl, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """All application configuration loaded from environment or .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ────────────────────────────────────────────────────────────
    app_name: str = "AntiVirus-AKN Backend"
    app_version: str = "1.0.0"
    debug: bool = False
    log_level: str = "info"

    # ── Security ───────────────────────────────────────────────────────────────
    secret_key: str = "change-me-in-production"
    api_key_enabled: bool = False
    api_key: str = ""

    # ── Database ───────────────────────────────────────────────────────────────
    database_url: str = (
        "postgresql+asyncpg://avuser:avpassword@localhost:5432/antivirus_db"
    )
    database_url_sync: str = (
        "postgresql+psycopg2://avuser:avpassword@localhost:5432/antivirus_db"
    )
    db_pool_size: int = 10
    db_max_overflow: int = 20
    db_echo: bool = False

    # ── Redis ──────────────────────────────────────────────────────────────────
    redis_url: str = "redis://localhost:6379/0"
    # Hash TTL in seconds (24 hours by default — refreshed by definition updates)
    redis_hash_ttl_seconds: int = 86_400

    # ── YARA / Scan Engine ─────────────────────────────────────────────────────
    yara_rules_dir: str = "./app/rules"
    max_file_size_mb: int = 50
    high_entropy_threshold: float = 7.2

    # ── CORS ───────────────────────────────────────────────────────────────────
    allowed_origins: str = "http://localhost:19006,http://localhost:8081"

    # ── Definitions versioning ─────────────────────────────────────────────────
    definitions_version: str = "v2.0.2026.08"

    # ── Computed helpers ───────────────────────────────────────────────────────

    @property
    def max_file_size_bytes(self) -> int:
        return self.max_file_size_mb * 1024 * 1024

    @property
    def yara_rules_path(self) -> Path:
        return Path(self.yara_rules_dir).resolve()

    @property
    def allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @field_validator("log_level")
    @classmethod
    def normalise_log_level(cls, v: str) -> str:
        return v.lower()


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached singleton Settings instance."""
    return Settings()
