import unittest

from agent_platform.knowledge_base import KnowledgeBase
from agent_platform.models import Document
from agent_platform.verified_knowledge import (
    ClaimEvidenceRelation,
    VerifiedClaimStatus,
    extract_claims,
    verify_text,
)
from fastapi.testclient import TestClient

from agent_platform.api import create_app


class VerifiedKnowledgeTest(unittest.TestCase):
    def setUp(self):
        self.knowledge_base = KnowledgeBase()
        self.knowledge_base.ingest(
            Document(
                doc_id="project-forge-plan",
                title="ProjectForge Master Plan",
                content=(
                    "查证型知识库通过 Claim-Evidence 对齐降低幻觉。"
                    "企业知识库 RAG 支持 citation 与低置信拒答。"
                    "DeepResearch 用于多步外网调研与脚注报告。"
                ),
            )
        )

    def test_extract_claims_splits_sentences(self):
        claims = extract_claims(
            "查证型知识库可以降低幻觉。企业知识库必须带 citation。",
            source_stage="prd",
        )

        self.assertGreaterEqual(len(claims), 2)
        self.assertEqual("prd", claims[0].source_stage)

    def test_verify_text_returns_claim_evidence_links(self):
        report = verify_text(
            "查证型知识库通过 Claim-Evidence 对齐降低幻觉。",
            self.knowledge_base,
            source_stage="architecture",
        )

        self.assertGreaterEqual(len(report.claims), 1)
        first = report.claims[0]
        self.assertGreater(len(first.links), 0)
        self.assertIn(
            first.links[0].relation,
            {
                ClaimEvidenceRelation.SUPPORTS,
                ClaimEvidenceRelation.PARTIAL,
            },
        )
        self.assertGreater(report.overall_confidence, 0.0)

    def test_verify_text_marks_weak_claims_for_refusal(self):
        report = verify_text(
            "量子咖啡机可以自动修复所有生产事故。",
            self.knowledge_base,
            source_stage="architecture",
        )

        self.assertTrue(report.claims)
        self.assertTrue(report.should_refuse or report.overall_confidence < 0.55)
        self.assertIn(
            report.claims[0].status,
            {
                VerifiedClaimStatus.UNVERIFIED,
                VerifiedClaimStatus.WEAK,
                VerifiedClaimStatus.PENDING_REVIEW,
            },
        )


class ProjectForgeApiTest(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(create_app())

    def test_project_forge_stages_lists_nine_stages(self):
        response = self.client.get("/project-forge/stages")

        self.assertEqual(200, response.status_code)
        body = response.json()
        self.assertEqual(9, len(body["stages"]))
        self.assertEqual("research", body["stages"][0]["stage_id"])
        self.assertEqual("retrospective", body["stages"][-1]["stage_id"])
        self.assertEqual(9, len(body["supervisor_plan"]))
        self.assertEqual("deep_research", body["supervisor_plan"][0]["agent_kind"])

    def test_project_forge_demo_returns_full_pipeline(self):
        response = self.client.post(
            "/project-forge/demo",
            json={"idea": "为 agent-platform 增加查证型知识库与工作台"},
        )

        self.assertEqual(200, response.status_code)
        body = response.json()
        self.assertEqual(9, len(body["stages"]))
        self.assertIn("run_id", body)
        self.assertEqual("deep_research", body["stages"][0]["engine"])
        verified_stages = [stage for stage in body["stages"] if stage["verification"]]
        self.assertGreaterEqual(len(verified_stages), 2)

    def test_verify_knowledge_api(self):
        response = self.client.post(
            "/verified-knowledge/verify",
            json={
                "text": "查证型知识库通过 Claim-Evidence 对齐降低幻觉。",
                "source_stage": "prd",
            },
        )

        self.assertEqual(200, response.status_code)
        body = response.json()
        self.assertIn("claims", body)
        self.assertIn("overall_confidence", body)
        self.assertIn("summary", body)


if __name__ == "__main__":
    unittest.main()
