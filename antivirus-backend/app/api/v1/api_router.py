"""
app/api/v1/api_router.py
─────────────────────────
Aggregates all v1 sub-routers under a single APIRouter.

Mount order matters for OpenAPI tag grouping:
  /scan        — file/hash/APK scanning operations
  /definitions — virus definition metadata
  /stats       — aggregate scan statistics
"""

from fastapi import APIRouter

from app.api.v1.endpoints import definitions, scan, stats

api_router = APIRouter()

api_router.include_router(
    scan.router,
    prefix="/scan",
    tags=["Scanning"],
)

api_router.include_router(
    definitions.router,
    prefix="/definitions",
    tags=["Definitions"],
)

api_router.include_router(
    stats.router,
    prefix="/stats",
    tags=["Statistics"],
)
