import statistics
from datetime import datetime
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.anomaly import AnomalyFlag, AnomalyFlagStatus, AnomalyFlagType, AnomalyTransaction
from app.repositories.base_repo import BaseRepository
from app.schemas.anomaly import AnomalyFlagUpdate, AnomalyTransactionIngest


class AnomalyTransactionRepository(BaseRepository[AnomalyTransaction]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, AnomalyTransaction)

    async def ingest(self, payload: AnomalyTransactionIngest) -> AnomalyTransaction:
        txn = AnomalyTransaction(**payload.model_dump())
        return await self.create(txn)

    async def list_transactions(
        self,
        limit: int = 50,
        offset: int = 0,
        engagement_id: UUID | None = None,
        batch_id: str | None = None,
    ) -> tuple[list[AnomalyTransaction], int]:
        query = select(AnomalyTransaction)
        count_query = select(func.count()).select_from(AnomalyTransaction)

        if engagement_id is not None:
            query = query.where(AnomalyTransaction.engagement_id == engagement_id)
            count_query = count_query.where(AnomalyTransaction.engagement_id == engagement_id)

        if batch_id is not None:
            query = query.where(AnomalyTransaction.batch_id == batch_id)
            count_query = count_query.where(AnomalyTransaction.batch_id == batch_id)

        query = query.order_by(AnomalyTransaction.created_at.desc()).limit(limit).offset(offset)
        result = await self.db.execute(query)
        items = list(result.scalars().all())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        return items, total

    async def run_statistical_detection(
        self, transactions: list[AnomalyTransaction]
    ) -> list[AnomalyFlag]:
        """Z-score + IQR based anomaly detection on transaction amounts."""
        amounts = [t.amount for t in transactions if t.amount is not None]
        if len(amounts) < 5:
            return []

        mean = statistics.mean(amounts)
        stdev = statistics.stdev(amounts) if len(amounts) > 1 else 0
        sorted_amounts = sorted(amounts)
        q1 = sorted_amounts[len(sorted_amounts) // 4]
        q3 = sorted_amounts[3 * len(sorted_amounts) // 4]
        iqr = q3 - q1
        iqr_lower = q1 - 1.5 * iqr
        iqr_upper = q3 + 1.5 * iqr

        flags = []
        for txn in transactions:
            if txn.amount is None:
                continue

            z_score = abs((txn.amount - mean) / stdev) if stdev > 0 else 0
            iqr_outlier = txn.amount < iqr_lower or txn.amount > iqr_upper

            if z_score > 3.0 or iqr_outlier:
                severity = "critical" if z_score > 4.0 else "high" if z_score > 3.0 else "medium"
                confidence = min(0.99, z_score / 5.0) if z_score > 0 else 0.5
                flag = AnomalyFlag(
                    transaction_id=txn.id,
                    flag_type=AnomalyFlagType.statistical,
                    severity=severity,
                    description=(
                        f"Amount {txn.amount:.2f} deviates significantly from mean {mean:.2f} "
                        f"(z-score={z_score:.2f}, IQR outlier={iqr_outlier})"
                    ),
                    confidence_score=round(confidence, 3),
                    status=AnomalyFlagStatus.flagged,
                )
                self.db.add(flag)
                flags.append(flag)

        if flags:
            await self.db.commit()

        return flags

    async def run_rule_detection(
        self, transactions: list[AnomalyTransaction]
    ) -> list[AnomalyFlag]:
        """Rule-based detection: round amounts, duplicate descriptions, large single txns."""
        flags = []
        seen_descriptions: dict[str, list[UUID]] = {}

        for txn in transactions:
            # Rule 1: Very large round amounts (possible fraud indicator)
            if txn.amount and txn.amount > 0 and txn.amount % 1000 == 0 and txn.amount >= 10000:
                flag = AnomalyFlag(
                    transaction_id=txn.id,
                    flag_type=AnomalyFlagType.rule_based,
                    severity="medium",
                    description=f"Round large amount {txn.amount:.0f} — may warrant review",
                    confidence_score=0.6,
                    status=AnomalyFlagStatus.flagged,
                )
                self.db.add(flag)
                flags.append(flag)

            # Rule 2: Duplicate descriptions
            if txn.description:
                key = txn.description.strip().lower()
                seen_descriptions.setdefault(key, []).append(txn.id)

        for desc, ids in seen_descriptions.items():
            if len(ids) > 2:
                for txn_id in ids:
                    flag = AnomalyFlag(
                        transaction_id=txn_id,
                        flag_type=AnomalyFlagType.rule_based,
                        severity="low",
                        description=f"Duplicate transaction description found {len(ids)} times",
                        confidence_score=0.5,
                        status=AnomalyFlagStatus.flagged,
                    )
                    self.db.add(flag)
                    flags.append(flag)

        if flags:
            await self.db.commit()

        return flags


class AnomalyFlagRepository(BaseRepository[AnomalyFlag]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, AnomalyFlag)

    async def list_flags(
        self,
        limit: int = 50,
        offset: int = 0,
        status: AnomalyFlagStatus | None = None,
        flag_type: AnomalyFlagType | None = None,
    ) -> tuple[list[AnomalyFlag], int]:
        query = select(AnomalyFlag)
        count_query = select(func.count()).select_from(AnomalyFlag)

        if status is not None:
            query = query.where(AnomalyFlag.status == status)
            count_query = count_query.where(AnomalyFlag.status == status)

        if flag_type is not None:
            query = query.where(AnomalyFlag.flag_type == flag_type)
            count_query = count_query.where(AnomalyFlag.flag_type == flag_type)

        query = query.order_by(AnomalyFlag.created_at.desc()).limit(limit).offset(offset)
        result = await self.db.execute(query)
        items = list(result.scalars().all())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0
        return items, total

    async def review_flag(self, flag: AnomalyFlag, payload: AnomalyFlagUpdate) -> AnomalyFlag:
        updates = payload.model_dump(exclude_unset=True)
        if "status" in updates and updates["status"] in (
            AnomalyFlagStatus.reviewed,
            AnomalyFlagStatus.cleared,
            AnomalyFlagStatus.escalated,
        ):
            updates["reviewed_at"] = datetime.utcnow()
        return await self.update(flag, updates)
