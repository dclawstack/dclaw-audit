import random
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class CreateTrailRequest(BaseModel):
    system_name: str


class AuditTrail(BaseModel):
    id: str
    system_name: str
    events_captured: int
    anomalies_detected: int
    compliance_status: str
    created_at: str


class AuditEvent(BaseModel):
    id: str
    trail_id: str
    event_type: str
    description: str
    severity: str
    timestamp: str


@router.post("/trails", response_model=AuditTrail)
async def create_trail(req: CreateTrailRequest):
    return AuditTrail(
        id=str(uuid.uuid4()),
        system_name=req.system_name,
        events_captured=random.randint(1000, 50000),
        anomalies_detected=random.randint(0, 15),
        compliance_status="partial",
        created_at=datetime.now(timezone.utc).isoformat(),
    )


@router.get("/trails/{id}/events", response_model=list[AuditEvent])
async def get_trail_events(id: str):
    events = []
    event_types = ["login", "data_access", "config_change", "permission_grant", "logout"]
    severities = ["low", "medium", "high"]
    for i in range(5):
        events.append(
            AuditEvent(
                id=str(uuid.uuid4()),
                trail_id=id,
                event_type=event_types[i],
                description=f"Mock audit event {i + 1} for trail {id}",
                severity=severities[i % len(severities)],
                timestamp=datetime.now(timezone.utc).isoformat(),
            )
        )
    return events
