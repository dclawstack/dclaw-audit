"""Grounded AI service for DClaw Audit.

Supports OpenRouter (cloud) and Ollama (local) backends.
All prompts include structured context from the database (engagements, findings, evidence, controls).
"""

import json
from datetime import date
from typing import Literal
from uuid import UUID

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.control_mapping import MappingCoverageStatus
from app.repositories.audit_engagement_repository import AuditEngagementRepository
from app.repositories.control_repository import ControlMappingRepository, ControlRepository
from app.repositories.evidence_request_repository import EvidenceRequestRepository
from app.repositories.finding_repository import FindingRepository

AIProvider = Literal["openrouter", "ollama"]

_SYSTEM_PROMPT_DRAFT_EVIDENCE = (
    "You are an expert internal auditor. Your task is to generate a list of evidence requests "
    "for an audit engagement based on the engagement scope, risk level, and existing findings. "
    "Output a JSON object with a single key 'evidence_requests' containing a list of objects, "
    "each with keys: 'title' (string), 'description' (string, optional), 'request_owner' (string, optional), "
    "'source_system' (string, optional). Be specific and actionable."
)

_SYSTEM_PROMPT_RISK_COPILOT = (
    "You are an audit risk copilot. Given an engagement description and risk level, suggest "
    "key risks, controls to test, and test ideas. Output a JSON object with keys: "
    "'risks' (list of strings), 'controls' (list of strings), 'test_ideas' (list of strings)."
)

_SYSTEM_PROMPT_DRAFT_FINDING = (
    "You are an experienced audit manager drafting a formal finding. Given evidence observations "
    "and exceptions, produce a structured draft finding. Output a JSON object with keys: "
    "'title' (string), 'description' (string), 'root_cause' (string), 'recommendation' (string), "
    "'severity' (one of: low, medium, high, critical)."
)

_SYSTEM_PROMPT_GENERATE_REPORT = (
    "You are an internal audit report writer. Given the engagement details, findings, and remediation "
    "status, draft an executive summary and key observation sections. Output a JSON object with keys: "
    "'executive_summary' (string), 'key_observations' (list of strings), 'overall_risk_rating' (string)."
)

_SYSTEM_PROMPT_EVIDENCE_COMPLETENESS = (
    "You are an audit quality reviewer. Given the engagement scope and list of evidence requests, "
    "assess whether the evidence collected is complete and sufficient. "
    "Output a JSON object with keys: "
    "'completeness_score' (integer 0-100), "
    "'missing_areas' (list of strings — what is missing), "
    "'recommendations' (list of strings — what to request next), "
    "'overall_assessment' (string)."
)

_SYSTEM_PROMPT_PRIORITIZE_FINDINGS = (
    "You are an audit manager prioritizing findings for remediation. "
    "Given a list of findings with severity, status, root causes, and due dates, "
    "rank them and provide a prioritized action plan. "
    "Output a JSON object with keys: "
    "'prioritized_findings' (list of objects, each with: 'finding_id' string, 'priority_rank' integer, 'reason' string), "
    "'critical_path' (list of strings — immediate actions required), "
    "'summary' (string)."
)

_SYSTEM_PROMPT_REMEDIATION_PLAN = (
    "You are an audit remediation specialist. Given a finding with its root cause and recommendation, "
    "generate a structured remediation plan. "
    "Output a JSON object with keys: "
    "'title' (string), "
    "'action_items' (string — newline-separated list of concrete steps), "
    "'owner_name' (string — suggested owner role), "
    "'estimated_days' (integer), "
    "'notes' (string)."
)


class AIServiceError(Exception):
    pass


class AIService:
    def __init__(self, provider: AIProvider = "openrouter"):
        self.provider = provider
        if provider == "openrouter":
            self.api_key = settings.openrouter_api_key
            self.model = settings.openrouter_model
            self.base_url = settings.openrouter_base_url
        else:
            self.model = settings.ollama_model
            self.base_url = settings.ollama_url

    async def _call_openrouter(self, messages: list[dict], temperature: float = 0.7) -> str:
        if not self.api_key:
            raise AIServiceError("OPENROUTER_API_KEY is not configured")

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://dclaw-audit.local",
                    "X-Title": "DClaw Audit",
                },
                json={
                    "model": self.model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": 2048,
                },
            )
            response.raise_for_status()
            data = response.json()
            if "choices" not in data or not data["choices"]:
                raise AIServiceError(f"OpenRouter returned no choices: {data}")
            return data["choices"][0]["message"]["content"]

    async def _call_ollama(self, messages: list[dict], temperature: float = 0.7) -> str:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{self.base_url}/api/chat",
                json={
                    "model": self.model,
                    "messages": messages,
                    "stream": False,
                    "options": {"temperature": temperature},
                },
            )
            response.raise_for_status()
            data = response.json()
            if "message" not in data:
                raise AIServiceError(f"Ollama returned unexpected response: {data}")
            return data["message"]["content"]

    async def _call_llm(self, messages: list[dict], temperature: float = 0.7) -> str:
        if self.provider == "openrouter":
            return await self._call_openrouter(messages, temperature)
        return await self._call_ollama(messages, temperature)

    @staticmethod
    def _try_parse_json(text: str) -> dict:
        """Attempt to extract and parse JSON from LLM output."""
        text = text.strip()
        # Try direct parse
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass
        # Try extracting from markdown code block
        if "```json" in text:
            start = text.index("```json") + 7
            end = text.find("```", start)
            if end > start:
                try:
                    return json.loads(text[start:end].strip())
                except json.JSONDecodeError:
                    pass
        if "```" in text:
            start = text.index("```") + 3
            end = text.find("```", start)
            if end > start:
                try:
                    return json.loads(text[start:end].strip())
                except json.JSONDecodeError:
                    pass
        raise AIServiceError(f"Could not parse JSON from LLM output: {text[:200]}")

    # ------------------------------------------------------------------
    # Context builders — always grounded in DB state
    # ------------------------------------------------------------------

    async def _build_engagement_context(self, db: AsyncSession, engagement_id: UUID) -> str:
        repo = AuditEngagementRepository(db)
        engagement = await repo.get_by_id(engagement_id)
        if engagement is None:
            raise AIServiceError("Engagement not found")

        finding_repo = FindingRepository(db)
        findings, _ = await finding_repo.list_findings(limit=100, engagement_id=engagement_id)
        request_repo = EvidenceRequestRepository(db)
        requests, _ = await request_repo.list_requests(limit=100, engagement_id=engagement_id)

        context = (
            f"# Engagement: {engagement.title}\n"
            f"- Client: {engagement.client_name}\n"
            f"- Status: {engagement.status.value}\n"
            f"- Risk Level: {engagement.risk_level.value}\n"
            f"- Owner: {engagement.owner_name or 'Unassigned'}\n"
            f"- Period: {engagement.audit_period_start} to {engagement.audit_period_end}\n"
            f"- Description: {engagement.description or 'N/A'}\n\n"
        )

        if findings:
            context += "## Existing Findings:\n"
            for f in findings:
                context += (
                    f"- [{f.severity.value.upper()}] {f.title} (status: {f.status.value})\n"
                    f"  Description: {f.description or 'N/A'}\n"
                )
            context += "\n"

        if requests:
            context += "## Existing Evidence Requests:\n"
            for r in requests:
                context += (
                    f"- {r.title} (status: {r.status.value}, due: {r.due_date or 'N/A'})\n"
                )
            context += "\n"

        return context

    async def _build_finding_context(self, db: AsyncSession, engagement_id: UUID) -> str:
        """Context for drafting findings from evidence."""
        engagement_ctx = await self._build_engagement_context(db, engagement_id)

        control_repo = ControlRepository(db)
        controls, _ = await control_repo.list_controls(limit=100)
        engagement_ctx += "## Control Inventory:\n"
        for c in controls:
            engagement_ctx += f"- {c.name} (framework: {c.framework.value if c.framework else 'N/A'}, owner: {c.control_owner or 'N/A'})\n"
        engagement_ctx += "\n"

        return engagement_ctx

    # ------------------------------------------------------------------
    # Public AI features
    # ------------------------------------------------------------------

    async def draft_evidence_requests(
        self, db: AsyncSession, engagement_id: UUID
    ) -> list[dict]:
        context = await self._build_engagement_context(db, engagement_id)
        messages = [
            {"role": "system", "content": _SYSTEM_PROMPT_DRAFT_EVIDENCE},
            {"role": "user", "content": context},
        ]
        response = await self._call_llm(messages, temperature=0.7)
        parsed = self._try_parse_json(response)
        return parsed.get("evidence_requests", [])

    async def risk_copilot(self, db: AsyncSession, engagement_id: UUID) -> dict:
        context = await self._build_engagement_context(db, engagement_id)
        messages = [
            {"role": "system", "content": _SYSTEM_PROMPT_RISK_COPILOT},
            {"role": "user", "content": context},
        ]
        response = await self._call_llm(messages, temperature=0.7)
        return self._try_parse_json(response)

    async def draft_finding(self, db: AsyncSession, engagement_id: UUID, observation: str) -> dict:
        context = await self._build_finding_context(db, engagement_id)
        messages = [
            {"role": "system", "content": _SYSTEM_PROMPT_DRAFT_FINDING},
            {
                "role": "user",
                "content": f"{context}\n\n## Auditor Observation:\n{observation}\n\nDraft a structured finding.",
            },
        ]
        response = await self._call_llm(messages, temperature=0.5)
        return self._try_parse_json(response)

    async def generate_report(self, db: AsyncSession, engagement_id: UUID) -> dict:
        context = await self._build_engagement_context(db, engagement_id)
        messages = [
            {"role": "system", "content": _SYSTEM_PROMPT_GENERATE_REPORT},
            {"role": "user", "content": context},
        ]
        response = await self._call_llm(messages, temperature=0.6)
        return self._try_parse_json(response)

    async def check_evidence_completeness(self, db: AsyncSession, engagement_id: UUID) -> dict:
        context = await self._build_engagement_context(db, engagement_id)
        messages = [
            {"role": "system", "content": _SYSTEM_PROMPT_EVIDENCE_COMPLETENESS},
            {"role": "user", "content": context},
        ]
        response = await self._call_llm(messages, temperature=0.4)
        return self._try_parse_json(response)

    async def prioritize_findings(self, db: AsyncSession, engagement_id: UUID) -> dict:
        context = await self._build_engagement_context(db, engagement_id)
        finding_repo = FindingRepository(db)
        findings, _ = await finding_repo.list_findings(limit=200, engagement_id=engagement_id)
        findings_text = "\n".join(
            f"- ID:{f.id} [{f.severity.value.upper()}] {f.title} | status:{f.status.value} | due:{f.due_date}"
            for f in findings
        )
        messages = [
            {"role": "system", "content": _SYSTEM_PROMPT_PRIORITIZE_FINDINGS},
            {"role": "user", "content": f"{context}\n\n## Findings to Prioritize:\n{findings_text}"},
        ]
        response = await self._call_llm(messages, temperature=0.3)
        return self._try_parse_json(response)

    async def generate_remediation_plan(
        self, db: AsyncSession, finding_id: UUID, engagement_id: UUID
    ) -> dict:
        from app.repositories.finding_repository import FindingRepository as FR
        fr = FR(db)
        finding = await fr.get_by_id(finding_id)
        if finding is None:
            raise AIServiceError("Finding not found")
        finding_text = (
            f"Finding: {finding.title}\n"
            f"Severity: {finding.severity.value}\n"
            f"Description: {finding.description or 'N/A'}\n"
            f"Root Cause: {finding.root_cause or 'N/A'}\n"
            f"Recommendation: {finding.recommendation or 'N/A'}\n"
        )
        messages = [
            {"role": "system", "content": _SYSTEM_PROMPT_REMEDIATION_PLAN},
            {"role": "user", "content": finding_text},
        ]
        response = await self._call_llm(messages, temperature=0.5)
        return self._try_parse_json(response)

    async def list_controls_for_engagement(
        self, db: AsyncSession, engagement_id: UUID
    ) -> list[dict]:
        """Return controls with their framework coverage mapped to an engagement's risk area."""
        mapping_repo = ControlMappingRepository(db)
        gaps = await mapping_repo.get_gap_analysis()
        return [
            {
                "requirement_code": g["framework_requirement"].requirement_code,
                "requirement_title": g["framework_requirement"].title,
                "framework": g["framework_requirement"].framework.value,
                "coverage": g["coverage_status"].value if g["coverage_status"] else "uncovered",
                "mapped_controls": [c.name for c in g["mapped_controls"]],
            }
            for g in gaps
        ]
