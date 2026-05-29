from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.api.routes import health
from app.api.v1 import audit, ai, report, risk, activity, anomalies, testing, signals, intelligence, demo


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    version="1.5.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(audit.router, prefix="/api/v1", tags=["audit"])
app.include_router(ai.router, prefix="/api/v1", tags=["ai"])
app.include_router(report.router, prefix="/api/v1", tags=["report"])
app.include_router(risk.router, prefix="/api/v1", tags=["risk"])
app.include_router(activity.router, prefix="/api/v1", tags=["activity"])
app.include_router(anomalies.router, prefix="/api/v1", tags=["anomalies"])
app.include_router(testing.router, prefix="/api/v1", tags=["testing"])
app.include_router(signals.router, prefix="/api/v1", tags=["signals"])
app.include_router(intelligence.router, prefix="/api/v1", tags=["intelligence"])
app.include_router(demo.router, prefix="/api/v1", tags=["demo"])
