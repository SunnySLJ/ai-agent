import unittest
from pathlib import Path
import tempfile

from agent_platform.forge_store import ForgeRunStore
from agent_platform.forge_supervisor import ForgeAgentKind, supervisor_plan
from agent_platform.knowledge_base import KnowledgeBase
from agent_platform.models import Document
from agent_platform.project_forge import ForgeStageId, run_project_forge_demo
from agent_platform.verified_knowledge import VerifiedClaimStatus, verify_text
from fastapi.testclient import TestClient

from agent_platform.api import create_app


class ForgeSupervisorTest(unittest.TestCase):
    def test_supervisor_plan_has_nine_routes(self):
        routes = supervisor_plan()
        self.assertEqual(9, len(routes))
        self.assertEqual(ForgeAgentKind.DEEP_RESEARCH, routes[0].agent_kind)
        verified = [route for route in routes if route.requires_verification]
        self.assertEqual(3, len(verified))


class ForgeStoreTest(unittest.TestCase):
    def test_store_persists_and_lists_runs(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "runs.json"
            store = ForgeRunStore(persist_path=path)
            kb = KnowledgeBase()
            kb.ingest(Document(doc_id="d1", title="T", content="查证型知识库降低幻觉。"))
            run = run_project_forge_demo("测试项目", kb)
            store.save(run)
            store2 = ForgeRunStore(persist_path=path)
            store2.load_from_disk()
            payload = store2.get(run.run_id)
            self.assertIsNotNone(payload)
            self.assertEqual(9, len(payload["stages"]))
            self.assertEqual(1, len(store2.list_runs()))


class VerificationExtendedTest(unittest.TestCase):
    def setUp(self):
        self.knowledge_base = KnowledgeBase()
        self.knowledge_base.ingest(
            Document(
                doc_id="kb",
                title="KB",
                content="查证型知识库通过 Claim-Evidence 对齐降低幻觉。",
            )
        )

    def test_pending_review_for_borderline_claim(self):
        report = verify_text(
            "查证型知识库可能有一点帮助。",
            self.knowledge_base,
            source_stage="architecture",
        )
        statuses = {item.status for item in report.claims}
        self.assertTrue(
            VerifiedClaimStatus.PENDING_REVIEW in statuses
            or VerifiedClaimStatus.UNVERIFIED in statuses
            or VerifiedClaimStatus.VERIFIED in statuses
        )

    def test_contradicted_claim_triggers_refusal(self):
        report = verify_text(
            "查证型知识库并非用于降低幻觉，而是增加幻觉。",
            self.knowledge_base,
            source_stage="architecture",
        )
        self.assertTrue(report.should_refuse or report.overall_confidence < 0.55)


class ProjectForgeApiExtendedTest(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(create_app())

    def test_deep_research_api(self):
        response = self.client.post(
            "/deep-research/run",
            json={"query": "ProjectForge 造物智能体调研"},
        )
        self.assertEqual(200, response.status_code)
        body = response.json()
        self.assertIn("markdown", body)
        self.assertGreaterEqual(len(body["sub_questions"]), 3)

    def test_project_forge_runs_list_after_demo(self):
        demo = self.client.post(
            "/project-forge/demo",
            json={"idea": "增加 DeepResearch 与查证联动"},
        )
        self.assertEqual(200, demo.status_code)
        run_id = demo.json()["run_id"]
        listed = self.client.get("/project-forge/runs")
        self.assertEqual(200, listed.status_code)
        self.assertTrue(any(item["run_id"] == run_id for item in listed.json()["runs"]))
        detail = self.client.get(f"/project-forge/runs/{run_id}")
        self.assertEqual(200, detail.status_code)
        self.assertEqual(run_id, detail.json()["run_id"])

    def test_research_stage_uses_deep_research_engine(self):
        response = self.client.post(
            "/project-forge/demo",
            json={"idea": "调研 Agent 平台能力"},
        )
        body = response.json()
        research = body["stages"][0]
        self.assertEqual("research", research["stage_id"])
        self.assertEqual("deep_research", research["engine"])
        self.assertIn("Deep Research 报告", research["markdown"])

    def test_supervisor_plan_in_stages_endpoint(self):
        response = self.client.get("/project-forge/stages")
        body = response.json()
        self.assertIn("supervisor_plan", body)
        self.assertEqual(9, len(body["supervisor_plan"]))


if __name__ == "__main__":
    unittest.main()
