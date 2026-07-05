import unittest

from agent_platform.deep_research import ResearchSourceType, run_deep_research
from agent_platform.forge_context import inject_prior_context, summarize_prior_run_context
from agent_platform.knowledge_base import KnowledgeBase
from agent_platform.models import Document
from agent_platform.project_forge import run_project_forge_demo
from agent_platform.web_search import WebSearchResult


class FakeWebSearchClient:
    provider_name = "fake"

    def search(self, query: str, *, limit: int = 5) -> list[WebSearchResult]:
        return [
            WebSearchResult(
                title=f"Web result for {query[:20]}",
                url=f"https://example.com/{abs(hash(query)) % 10000}",
                snippet=f"External insight about {query}",
                score=0.9,
                provider=self.provider_name,
            )
        ]


class WebSearchDeepResearchTest(unittest.TestCase):
    def setUp(self):
        self.knowledge_base = KnowledgeBase()
        self.knowledge_base.ingest(
            Document(
                doc_id="kb",
                title="Internal KB",
                content="ProjectForge 是全链路造物智能体。",
            )
        )
        self.web_client = FakeWebSearchClient()

    def test_run_deep_research_merges_web_and_kb_sources(self):
        report = run_deep_research(
            "ProjectForge 造物智能体",
            self.knowledge_base,
            web_search_client=self.web_client,
        )
        self.assertGreater(report.web_source_count, 0)
        self.assertGreater(report.kb_source_count, 0)
        self.assertIn(report.generator, {"hybrid", "web"})
        self.assertTrue(any(source.url.startswith("https://") for source in report.sources))
        self.assertTrue(
            any(source.source_type == ResearchSourceType.WEB for source in report.sources)
        )

    def test_run_deep_research_web_only_when_kb_empty(self):
        report = run_deep_research(
            "竞品调研",
            KnowledgeBase(),
            web_search_client=self.web_client,
        )
        self.assertEqual("web", report.generator)
        self.assertGreaterEqual(len(report.sources), 1)


class ForgeContextTest(unittest.TestCase):
    def test_summarize_prior_run_context_includes_adr_and_prd(self):
        prior_run = {
            "run_id": "run-1",
            "idea": "第一轮想法",
            "stages": [
                {
                    "stage_id": "architecture",
                    "title": "架构 ADR",
                    "markdown": "推荐内嵌 verified_knowledge 模块。",
                },
                {
                    "stage_id": "prd",
                    "title": "PRD",
                    "markdown": "需要 POST /verified-knowledge/verify API。",
                },
            ],
        }
        context = summarize_prior_run_context(prior_run)
        self.assertIn("run-1", context)
        self.assertIn("架构 ADR", context)
        self.assertIn("verified_knowledge", context)
        self.assertIn("PRD", context)

    def test_second_forge_run_injects_prior_context(self):
        kb = KnowledgeBase()
        kb.ingest(Document(doc_id="d", title="T", content="查证型知识库降低幻觉。"))
        prior_context = summarize_prior_run_context(
            {
                "run_id": "parent",
                "idea": "旧项目",
                "stages": [
                    {
                        "stage_id": "architecture",
                        "title": "ADR",
                        "markdown": "继续使用内嵌查证模块。",
                    }
                ],
            }
        )
        run = run_project_forge_demo(
            "迭代查证工作台",
            kb,
            prior_context=prior_context,
            parent_run_id="parent",
        )
        self.assertEqual("parent", run.parent_run_id)
        arch = next(stage for stage in run.stages if stage.stage_id.value == "architecture")
        self.assertIn("继承上一轮决策", arch.markdown)
        self.assertIn("内嵌查证模块", arch.markdown)


class ForgeSecondRoundApiTest(unittest.TestCase):
    def test_project_forge_demo_with_prior_run_id(self):
        from fastapi.testclient import TestClient
        from agent_platform.api import create_app

        client = TestClient(create_app())
        first = client.post(
            "/project-forge/demo",
            json={"idea": "第一轮 Forge 演示"},
        )
        self.assertEqual(200, first.status_code)
        parent_id = first.json()["run_id"]

        second = client.post(
            "/project-forge/demo",
            json={"idea": "第二轮迭代", "prior_run_id": parent_id},
        )
        self.assertEqual(200, second.status_code)
        body = second.json()
        self.assertEqual(parent_id, body["parent_run_id"])
        arch = next(stage for stage in body["stages"] if stage["stage_id"] == "architecture")
        self.assertIn("继承上一轮决策", arch["markdown"])

    def test_deep_research_api_accepts_use_web_search_flag(self):
        from fastapi.testclient import TestClient
        from agent_platform.api import create_app

        client = TestClient(create_app())
        response = client.post(
            "/deep-research/run",
            json={"query": "AI Agent 调研", "use_web_search": False},
        )
        self.assertEqual(200, response.status_code)
        body = response.json()
        self.assertIn("sources", body)
        self.assertIn("web_source_count", body)


if __name__ == "__main__":
    unittest.main()
