from datetime import date, datetime, timedelta
from uuid import UUID

import pytest
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.finding import Finding
from tests.conftest import test_engine


@pytest.mark.asyncio
async def test_create_list_and_get_engagement(client):
    payload = {
        "title": "SOX Q3 Access Review",
        "client_name": "Acme Corp",
        "status": "in_progress",
        "risk_level": "high",
        "owner_name": "Jordan Lee",
        "description": "Quarterly review of privileged access and approval controls.",
        "audit_period_start": "2026-07-01",
        "audit_period_end": "2026-09-30",
    }

    create_response = await client.post("/api/v1/engagements", json=payload)
    assert create_response.status_code == 201
    created = create_response.json()
    assert created["title"] == payload["title"]
    assert created["status"] == payload["status"]
    assert created["risk_level"] == payload["risk_level"]

    list_response = await client.get("/api/v1/engagements")
    assert list_response.status_code == 200
    listed = list_response.json()
    assert listed["total"] == 1
    assert listed["items"][0]["id"] == created["id"]

    detail_response = await client.get(f"/api/v1/engagements/{created['id']}")
    assert detail_response.status_code == 200
    detail = detail_response.json()
    assert detail["client_name"] == payload["client_name"]
    assert detail["owner_name"] == payload["owner_name"]


@pytest.mark.asyncio
async def test_dashboard_summary_and_delete_engagement(client):
    first_payload = {
        "title": "Vendor Security Review",
        "client_name": "Northwind",
        "status": "planned",
        "risk_level": "medium",
    }
    second_payload = {
        "title": "Revenue Recognition Testing",
        "client_name": "Northwind",
        "status": "reporting",
        "risk_level": "critical",
    }

    first_response = await client.post("/api/v1/engagements", json=first_payload)
    second_response = await client.post("/api/v1/engagements", json=second_payload)
    first_id = first_response.json()["id"]
    second_id = second_response.json()["id"]

    summary_response = await client.get("/api/v1/dashboard/summary")
    assert summary_response.status_code == 200
    summary = summary_response.json()
    assert summary["total_engagements"] == 2
    assert summary["status_breakdown"]["planned"] == 1
    assert summary["status_breakdown"]["reporting"] == 1
    assert summary["risk_breakdown"]["medium"] == 1
    assert summary["risk_breakdown"]["critical"] == 1
    assert summary["open_requests"] == 0
    assert summary["overdue_requests"] == 0
    assert summary["total_findings"] == 0
    assert summary["open_findings"] == 0
    assert summary["overdue_findings"] == 0
    assert summary["finding_severity_breakdown"] == {}
    assert summary["finding_status_breakdown"] == {}
    assert summary["finding_aging_buckets"] == {
        "0_30": 0,
        "31_60": 0,
        "61_90": 0,
        "91_plus": 0,
    }
    assert summary["total_controls"] == 0
    assert summary["total_framework_requirements"] == 0
    assert summary["framework_breakdown"] == {}

    delete_response = await client.delete(f"/api/v1/engagements/{first_id}")
    assert delete_response.status_code == 204

    summary_after_delete = await client.get("/api/v1/dashboard/summary")
    assert summary_after_delete.status_code == 200
    assert summary_after_delete.json()["total_engagements"] == 1


@pytest.mark.asyncio
async def test_evidence_request_workflow(client):
    engagement_payload = {
        "title": "Access Review 2026",
        "client_name": "Test Corp",
        "status": "in_progress",
        "risk_level": "high",
    }
    engagement_response = await client.post("/api/v1/engagements", json=engagement_payload)
    assert engagement_response.status_code == 201
    engagement_id = engagement_response.json()["id"]

    request_payload = {
        "engagement_id": engagement_id,
        "title": "Privileged access report Q3",
        "description": "Quarterly admin access report",
        "request_owner": "Alice",
        "due_date": "2026-09-30",
        "status": "draft",
        "source_system": "Okta",
    }
    create_request_response = await client.post("/api/v1/evidence-requests", json=request_payload)
    assert create_request_response.status_code == 201
    created_request = create_request_response.json()
    assert created_request["title"] == request_payload["title"]
    assert created_request["status"] == "draft"

    list_requests_response = await client.get("/api/v1/evidence-requests")
    assert list_requests_response.status_code == 200
    requests_data = list_requests_response.json()
    assert requests_data["total"] == 1
    assert requests_data["items"][0]["engagement_id"] == engagement_id

    detail_response = await client.get(f"/api/v1/evidence-requests/{created_request['id']}")
    assert detail_response.status_code == 200
    detail = detail_response.json()
    assert detail["source_system"] == "Okta"

    delete_response = await client.delete(f"/api/v1/evidence-requests/{created_request['id']}")
    assert delete_response.status_code == 204


@pytest.mark.asyncio
async def test_finding_lifecycle(client):
    engagement_payload = {
        "title": "SOX Testing",
        "client_name": "Demo Inc",
        "status": "in_progress",
        "risk_level": "critical",
    }
    engagement_response = await client.post("/api/v1/engagements", json=engagement_payload)
    assert engagement_response.status_code == 201
    engagement_id = engagement_response.json()["id"]

    finding_payload = {
        "engagement_id": engagement_id,
        "title": "Access reviews incomplete",
        "description": "Terminated users still have admin access",
        "severity": "high",
        "status": "open",
        "root_cause": "HR offboarding not synced with IT",
        "recommendation": "Automate access revocation within 24 hours",
        "remediation_plan": "Implement SCIM connector between HRIS and IdP",
        "owner_name": "Bob",
        "due_date": "2026-08-15",
    }
    create_response = await client.post("/api/v1/findings", json=finding_payload)
    assert create_response.status_code == 201
    finding = create_response.json()
    assert finding["severity"] == "high"
    assert finding["status"] == "open"

    patch_response = await client.patch(
        f"/api/v1/findings/{finding['id']}",
        json={"status": "in_progress"},
    )
    assert patch_response.status_code == 200
    updated = patch_response.json()
    assert updated["status"] == "in_progress"

    list_response = await client.get("/api/v1/findings")
    assert list_response.status_code == 200
    findings_data = list_response.json()
    assert findings_data["total"] == 1

    delete_response = await client.delete(f"/api/v1/findings/{finding['id']}")
    assert delete_response.status_code == 204


@pytest.mark.asyncio
async def test_control_crud_and_gap_analysis(client):
    control_payload = {
        "name": "Privileged access review",
        "description": "Quarterly review of admin access",
        "framework": "sox",
        "control_owner": "Jordan Lee",
        "frequency": "Quarterly",
        "automated": False,
    }
    c_resp = await client.post("/api/v1/controls", json=control_payload)
    assert c_resp.status_code == 201
    control = c_resp.json()
    assert control["name"] == control_payload["name"]
    assert control["framework"] == "sox"

    list_resp = await client.get("/api/v1/controls")
    assert list_resp.status_code == 200
    assert list_resp.json()["total"] == 1

    req_payload = {
        "framework": "sox",
        "requirement_code": "SOX-302.1",
        "title": "Management certification",
        "description": "CEO/CFO must certify financials",
    }
    r_resp = await client.post("/api/v1/framework-requirements", json=req_payload)
    assert r_resp.status_code == 201
    requirement = r_resp.json()
    assert requirement["requirement_code"] == req_payload["requirement_code"]

    req_list = await client.get("/api/v1/framework-requirements")
    assert req_list.status_code == 200
    assert req_list.json()["total"] == 1

    map_payload = {
        "control_id": str(control["id"]),
        "framework_requirement_id": str(requirement["id"]),
        "coverage_status": "partial",
        "notes": "Covers financial reporting access only",
    }
    m_resp = await client.post("/api/v1/control-mappings", json=map_payload)
    assert m_resp.status_code == 201
    mapping = m_resp.json()
    assert mapping["coverage_status"] == "partial"

    gap_resp = await client.get("/api/v1/controls/gap-analysis")
    assert gap_resp.status_code == 200
    gaps = gap_resp.json()
    assert len(gaps) == 1
    assert gaps[0]["framework_requirement"]["requirement_code"] == "SOX-302.1"
    assert len(gaps[0]["mapped_controls"]) == 1

    await client.delete(f"/api/v1/control-mappings/{mapping['id']}")
    await client.delete(f"/api/v1/controls/{control['id']}")
    await client.delete(f"/api/v1/framework-requirements/{requirement['id']}")


@pytest.mark.asyncio
async def test_report_template_and_generation(client):
    eng_payload = {
        "title": "SOX Q4 Access Review",
        "client_name": "Acme Corp",
        "status": "in_progress",
        "risk_level": "high",
    }
    eng_resp = await client.post("/api/v1/engagements", json=eng_payload)
    assert eng_resp.status_code == 201
    engagement = eng_resp.json()

    template_payload = {
        "name": "Standard Audit Report",
        "description": "Standard internal audit report template",
        "sections": [
            "executive_summary",
            "scope",
            "findings",
            "recommendations",
            "conclusion",
        ],
    }
    t_resp = await client.post("/api/v1/report-templates", json=template_payload)
    assert t_resp.status_code == 201
    template = t_resp.json()
    assert template["name"] == template_payload["name"]

    t_list = await client.get("/api/v1/report-templates")
    assert t_list.status_code == 200
    assert t_list.json()["total"] == 1

    report_payload = {
        "engagement_id": str(engagement["id"]),
        "template_id": str(template["id"]),
        "title": "Q4 SOX Report",
    }
    sr_resp = await client.post("/api/v1/saved-reports", json=report_payload)
    assert sr_resp.status_code == 201
    saved_report = sr_resp.json()
    assert saved_report["title"] == report_payload["title"]
    assert saved_report["status"] == "draft"

    sr_list = await client.get("/api/v1/saved-reports")
    assert sr_list.status_code == 200
    assert sr_list.json()["total"] == 1

    patch_resp = await client.patch(
        f"/api/v1/saved-reports/{saved_report['id']}",
        json={
            "sections": {"executive_summary": "Test summary"},
            "status": "completed",
        },
    )
    assert patch_resp.status_code == 200
    updated = patch_resp.json()
    assert updated["sections"]["executive_summary"] == "Test summary"
    assert updated["status"] == "completed"

    await client.delete(f"/api/v1/saved-reports/{saved_report['id']}")
    await client.delete(f"/api/v1/report-templates/{template['id']}")


@pytest.mark.asyncio
async def test_ai_endpoints_without_key_return_503(client):
    eng_payload = {
        "title": "Vendor Security Review",
        "client_name": "Northwind",
        "status": "in_progress",
        "risk_level": "medium",
    }
    eng_resp = await client.post("/api/v1/engagements", json=eng_payload)
    assert eng_resp.status_code == 201
    engagement = eng_resp.json()
    eng_id = str(engagement["id"])

    for endpoint, payload in [
        ("/api/v1/ai/draft-evidence", {"engagement_id": eng_id}),
        ("/api/v1/ai/risk-copilot", {"engagement_id": eng_id}),
        ("/api/v1/ai/draft-finding", {"engagement_id": eng_id, "observation": "Missing logs"}),
        ("/api/v1/ai/generate-report", {"engagement_id": eng_id}),
    ]:
        resp = await client.post(endpoint, json=payload)
        assert resp.status_code == 503, f"Expected 503 for {endpoint}, got {resp.status_code}"
        body = resp.json()
        assert "detail" in body

    t_resp = await client.post(
        "/api/v1/report-templates",
        json={"name": "Test Template", "sections": ["executive_summary"]},
    )
    assert t_resp.status_code == 201
    template = t_resp.json()

    gen_resp = await client.post(
        "/api/v1/saved-reports/generate",
        json={
            "engagement_id": eng_id,
            "template_id": str(template["id"]),
            "title": "Test Report",
        },
    )
    assert gen_resp.status_code == 503

    await client.delete(f"/api/v1/engagements/{eng_id}")
    await client.delete(f"/api/v1/report-templates/{template['id']}")


@pytest.mark.asyncio
async def test_dashboard_includes_control_metrics(client):
    control_payload = {
        "name": "Access review control",
        "framework": "iso_27001",
        "control_owner": "Alice",
    }
    await client.post("/api/v1/controls", json=control_payload)

    req_payload = {
        "framework": "iso_27001",
        "requirement_code": "A.9.2.1",
        "title": "User registration",
    }
    await client.post("/api/v1/framework-requirements", json=req_payload)

    summary_resp = await client.get("/api/v1/dashboard/summary")
    assert summary_resp.status_code == 200
    summary = summary_resp.json()
    assert summary["total_controls"] == 1
    assert summary["total_framework_requirements"] == 1
    assert summary["framework_breakdown"]["iso_27001"] == 1
    assert len(summary["recent_controls"]) == 1

    controls = await client.get("/api/v1/controls")
    for c in controls.json()["items"]:
        await client.delete(f"/api/v1/controls/{c['id']}")
    reqs = await client.get("/api/v1/framework-requirements")
    for r in reqs.json()["items"]:
        await client.delete(f"/api/v1/framework-requirements/{r['id']}")
