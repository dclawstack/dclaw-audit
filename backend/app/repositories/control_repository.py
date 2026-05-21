from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.control import Control
from app.models.control_mapping import ControlMapping, MappingCoverageStatus
from app.models.framework_requirement import FrameworkRequirement
from app.repositories.base_repo import BaseRepository
from app.schemas.control import ControlCreate, ControlMappingCreate, FrameworkRequirementCreate


class ControlRepository(BaseRepository[Control]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Control)

    async def create_control(self, payload: ControlCreate) -> Control:
        control = Control(**payload.model_dump())
        return await self.create(control)

    async def list_controls(
        self,
        limit: int = 20,
        offset: int = 0,
        framework: str | None = None,
    ) -> tuple[list[Control], int]:
        query = select(Control)
        count_query = select(func.count()).select_from(Control)

        if framework is not None:
            query = query.where(Control.framework == framework)
            count_query = count_query.where(Control.framework == framework)

        query = query.order_by(Control.name.asc()).limit(limit).offset(offset)

        result = await self.db.execute(query)
        items = list(result.scalars().all())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        return items, total

    async def list_recent(self, limit: int = 5) -> list[Control]:
        result = await self.db.execute(
            select(Control)
            .order_by(Control.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())


class FrameworkRequirementRepository(BaseRepository[FrameworkRequirement]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, FrameworkRequirement)

    async def create_requirement(self, payload: FrameworkRequirementCreate) -> FrameworkRequirement:
        requirement = FrameworkRequirement(**payload.model_dump())
        return await self.create(requirement)

    async def list_requirements(
        self,
        limit: int = 20,
        offset: int = 0,
        framework: str | None = None,
    ) -> tuple[list[FrameworkRequirement], int]:
        query = select(FrameworkRequirement)
        count_query = select(func.count()).select_from(FrameworkRequirement)

        if framework is not None:
            query = query.where(FrameworkRequirement.framework == framework)
            count_query = count_query.where(FrameworkRequirement.framework == framework)

        query = query.order_by(FrameworkRequirement.requirement_code.asc()).limit(limit).offset(offset)

        result = await self.db.execute(query)
        items = list(result.scalars().all())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        return items, total

    async def list_by_framework(self, framework: str) -> list[FrameworkRequirement]:
        result = await self.db.execute(
            select(FrameworkRequirement)
            .where(FrameworkRequirement.framework == framework)
            .order_by(FrameworkRequirement.requirement_code.asc())
        )
        return list(result.scalars().all())


class ControlMappingRepository(BaseRepository[ControlMapping]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, ControlMapping)

    async def create_mapping(self, payload: ControlMappingCreate) -> ControlMapping:
        mapping = ControlMapping(**payload.model_dump())
        return await self.create(mapping)

    async def list_mappings(
        self,
        limit: int = 20,
        offset: int = 0,
        control_id: UUID | None = None,
        framework_requirement_id: UUID | None = None,
    ) -> tuple[list[ControlMapping], int]:
        query = select(ControlMapping)
        count_query = select(func.count()).select_from(ControlMapping)

        if control_id is not None:
            query = query.where(ControlMapping.control_id == control_id)
            count_query = count_query.where(ControlMapping.control_id == control_id)

        if framework_requirement_id is not None:
            query = query.where(ControlMapping.framework_requirement_id == framework_requirement_id)
            count_query = count_query.where(ControlMapping.framework_requirement_id == framework_requirement_id)

        query = query.order_by(ControlMapping.created_at.desc()).limit(limit).offset(offset)

        result = await self.db.execute(query)
        items = list(result.scalars().all())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        return items, total

    async def get_gap_analysis(
        self,
        framework: str | None = None,
    ) -> list[dict]:
        """Return requirements with their mapped controls and coverage status."""
        query = (
            select(FrameworkRequirement, ControlMapping, Control)
            .outerjoin(
                ControlMapping,
                FrameworkRequirement.id == ControlMapping.framework_requirement_id,
            )
            .outerjoin(Control, ControlMapping.control_id == Control.id)
        )

        if framework is not None:
            query = query.where(FrameworkRequirement.framework == framework)

        query = query.order_by(FrameworkRequirement.requirement_code.asc())
        result = await self.db.execute(query)

        rows = result.all()
        gaps: dict[UUID, dict] = {}

        for req, mapping, control in rows:
            if req.id not in gaps:
                gaps[req.id] = {
                    "framework_requirement": req,
                    "mapped_controls": [],
                    "coverage_status": None,
                }
            if control is not None:
                gaps[req.id]["mapped_controls"].append(control)
            if mapping is not None and gaps[req.id]["coverage_status"] is None:
                gaps[req.id]["coverage_status"] = mapping.coverage_status

        return list(gaps.values())
