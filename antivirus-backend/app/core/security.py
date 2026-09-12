"""
app/core/security.py
─────────────────────
Optional API-key authentication middleware.

When `api_key_enabled = true` in Settings, every request to /api/v1/*
must carry the header:  X-API-Key: <configured key>

Uses `secrets.compare_digest` for constant-time comparison to prevent
timing-based key enumeration attacks.
"""

from __future__ import annotations

import secrets

from fastapi import Header, HTTPException, status

from app.core.config import get_settings

_settings = get_settings()


async def verify_api_key(x_api_key: str | None = Header(default=None)) -> None:
    """
    FastAPI dependency that validates the X-API-Key header.

    Usage::

        @router.post("/scan/file", dependencies=[Depends(verify_api_key)])
        async def scan_file(...): ...

    When `api_key_enabled` is False this dependency is a no-op, allowing
    unauthenticated access (suitable for local development).
    """
    if not _settings.api_key_enabled:
        return  # Auth disabled — pass through

    if x_api_key is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-API-Key header",
            headers={"WWW-Authenticate": "ApiKey"},
        )

    # Constant-time comparison to prevent timing attacks
    if not secrets.compare_digest(x_api_key.encode(), _settings.api_key.encode()):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API key",
        )
