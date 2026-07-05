import unittest

from agent_platform.deep_research import plan_sub_questions, run_deep_research
from agent_platform.knowledge_base import KnowledgeBase
from agent_platform.models import Document


class DeepResearchTest(unittest.TestCase):
    def setUp(self):
        self.knowledge_base = KnowledgeBase()
        self.knowledge_base.ingest(
            Document(
                doc_id="forge-plan",
                title="ProjectForge Plan",
                content=(
                    "ProjectForge 是全链路造物智能体。"
                    "DeepResearch 用于多步调研与脚注报告。"
                    "查证型知识库通过 Claim-Evidence 对齐降低幻觉。"
                ),
            )
        )

    def test_plan_sub_questions_offline(self):
        questions = plan_sub_questions("AI Agent 企业知识库")
        self.assertGreaterEqual(len(questions), 3)
        self.assertTrue(all(len(item) > 5 for item in questions))

    def test_run_deep_research_returns_footnotes(self):
        report = run_deep_research("ProjectForge 造物智能体", self.knowledge_base)
        self.assertIn("Deep Research 报告", report.markdown)
        self.assertGreaterEqual(len(report.sub_questions), 3)
        self.assertGreaterEqual(len(report.sources), 1)
        self.assertIn("[^1]", report.markdown)

    def test_run_deep_research_marks_uncertainty_offline(self):
        report = run_deep_research("量子咖啡机行业调研", KnowledgeBase())
        self.assertEqual("offline", report.generator)
        self.assertTrue(report.uncertainty_notes)


if __name__ == "__main__":
    unittest.main()
