import unittest

from agent_platform.agent import AgentPlatform
from agent_platform.models import Document


class AgentPlatformTest(unittest.TestCase):
    def test_answers_with_citation_when_relevant_document_exists(self):
        platform = AgentPlatform.offline_demo()
        platform.ingest(
            Document(
                doc_id="spring-ai",
                title="Spring AI and RAG",
                content="Spring AI can expose Java business systems while Python handles Agent RAG orchestration.",
            )
        )

        response = platform.ask("Python 和 Java 在 Agent RAG 项目里怎么分工?")

        self.assertFalse(response.refused)
        self.assertIn("Python", response.answer)
        self.assertGreaterEqual(len(response.citations), 1)
        self.assertEqual("Spring AI and RAG", response.citations[0].title)
        self.assertGreaterEqual(len(response.trace.retrieved_chunks), 1)

    def test_refuses_when_evidence_is_missing(self):
        platform = AgentPlatform.offline_demo()
        platform.ingest(
            Document(
                doc_id="agent",
                title="Agent Basics",
                content="Agent systems use tools, memory, context, and traces.",
            )
        )

        response = platform.ask("明天杭州天气怎么样?")

        self.assertTrue(response.refused)
        self.assertIn("没有足够证据", response.answer)
        self.assertEqual([], response.citations)

    def test_calls_order_tool_for_known_order(self):
        platform = AgentPlatform.offline_demo()

        response = platform.ask("帮我查询订单 ORD-1001 的状态")

        self.assertFalse(response.refused)
        self.assertIn("ORD-1001", response.answer)
        self.assertIn("已发货", response.answer)
        self.assertEqual("get_order_status", response.trace.tool_calls[0].name)
        self.assertTrue(response.trace.tool_calls[0].success)

    def test_records_evaluation_summary(self):
        platform = AgentPlatform.offline_demo()
        platform.ingest(
            Document(
                doc_id="rag",
                title="RAG Evaluation",
                content="RAG evaluation records retrieval hits, citations, refusals, and tool calls.",
            )
        )

        platform.ask("RAG 评估记录什么?")
        platform.ask("帮我查询订单 ORD-1001 的状态")
        platform.ask("今天股票会涨吗?")

        summary = platform.summary()

        self.assertEqual(3, summary.total_runs)
        self.assertEqual(1, summary.refusal_count)
        self.assertEqual(1, summary.tool_call_count)
        self.assertEqual(1, summary.tool_success_count)
        self.assertGreaterEqual(summary.average_latency_ms, 0)


if __name__ == "__main__":
    unittest.main()

