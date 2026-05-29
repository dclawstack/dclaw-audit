"""Landing-page demo seed/reset endpoints (REMOVABLE feature).

To remove the demo feature entirely, delete these 3 things:
  1. this file (app/api/v1/demo.py)
  2. app/services/demo.py
  3. the demo router import + include_router line in app/api/main.py
(and optionally the enable_demo_mode / demo_owner_email fields in core/config.py)
"""

from dataclasses import asdict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.services.demo import gather_status, reset_demo, seed_demo

router = APIRouter()


def _require_enabled() -> None:
    if not settings.enable_demo_mode:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Demo mode is disabled (set ENABLE_DEMO_MODE=true)",
        )


@router.get("/demo/status")
async def demo_status(db: AsyncSession = Depends(get_db)) -> dict:
    """Probe — returns enabled:false (200) when the flag is off so the
    landing page can hide the section quietly instead of erroring."""
    return asdict(await gather_status(db, enabled=settings.enable_demo_mode))


@router.post("/demo/seed")
async def demo_seed(db: AsyncSession = Depends(get_db)) -> dict:
    _require_enabled()
    return asdict(await seed_demo(db))


@router.delete("/demo/reset")
async def demo_reset(db: AsyncSession = Depends(get_db)) -> dict:
    _require_enabled()
    return asdict(await reset_demo(db))
