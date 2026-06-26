import unittest
from unittest import mock

from fastapi.testclient import TestClient

from agent_platform.api import create_app
from test_java_tools import java_like_tool_service
from test_llm import chat_completion_service
from test_vector_store import FakeQdrantHandler, fake_qdrant_service


class AgentPlatformApiTest(unittest.TestCase):
    def setUp(self):
        self.env_patcher = mock.patch.dict("os.environ", {}, clear=True)
        self.env_patcher.start()

    def tearDown(self):
        self.env_patcher.stop()

    def test_health_returns_ok(self):
        client = TestClient(create_app())

        response = client.get("/health")

        self.assertEqual(200, response.status_code)
        self.assertEqual({"status": "ok"}, response.json())

    def test_ingests_document_and_answers_with_citation(self):
        client = TestClient(create_app())
        client.post(
            "/documents",
            json={
                "doc_id": "hybrid",
                "title": "Hybrid Agent Architecture",
                "content": "Python owns Agent RAG orchestration while Java exposes business tool APIs.",
            },
        )

        response = client.post("/ask", json={"question": "Python 和 Java 怎么分工?"})

        body = response.json()
        self.assertEqual(200, response.status_code)
        self.assertFalse(body["refused"])
        self.assertIn("Python", body["answer"])
        self.assertEqual("Hybrid Agent Architecture", body["citations"][0]["title"])

    def test_refuses_unrelated_question_through_api(self):
        client = TestClient(create_app())
        client.post(
            "/documents",
            json={
                "doc_id": "agent",
                "title": "Agent Basics",
                "content": "Agent systems call tools and record traces.",
            },
        )

        response = client.post("/ask", json={"question": "今天股票会涨吗?"})

        body = response.json()
        self.assertEqual(200, response.status_code)
        self.assertTrue(body["refused"])
        self.assertIn("没有足够证据", body["answer"])

    def test_calls_order_tool_through_api(self):
        client = TestClient(create_app())

        response = client.post("/ask", json={"question": "查询订单 ORD-1001 的状态"})

        body = response.json()
        self.assertFalse(body["refused"])
        self.assertIn("已发货", body["answer"])
        self.assertEqual("get_order_status", body["trace"]["tool_calls"][0]["name"])
        self.assertTrue(body["trace"]["tool_calls"][0]["success"])

    def test_summary_and_tools_are_available(self):
        client = TestClient(create_app())
        client.post("/ask", json={"question": "查询订单 ORD-1001 的状态"})
        client.post("/ask", json={"question": "未知问题"})

        summary = client.get("/summary").json()
        tools = client.get("/tools").json()

        self.assertEqual(2, summary["total_runs"])
        self.assertEqual(1, summary["tool_call_count"])
        self.assertIn("get_order_status", tools["tools"])
        self.assertIn("create_todo", tools["tools"])

    def test_create_app_uses_java_tools_when_env_is_set(self):
        with java_like_tool_service() as base_url:
            with mock.patch.dict("os.environ", {"JAVA_TOOL_BASE_URL": base_url}):
                client = TestClient(create_app())

                response = client.post("/ask", json={"question": "查询订单 ORD-2002 的状态"})

        body = response.json()
        self.assertFalse(body["refused"])
        self.assertIn("测试专属订单", body["answer"])
        self.assertEqual("get_order_status", body["trace"]["tool_calls"][0]["name"])
        self.assertTrue(body["trace"]["tool_calls"][0]["success"])

    def test_create_app_uses_openai_compatible_llm_when_env_is_set(self):
        with chat_completion_service("模型回答：API 环境变量已接入。") as base_url:
            with mock.patch.dict(
                "os.environ",
                {
                    "OPENAI_API_KEY": "test-key",
                    "OPENAI_BASE_URL": base_url,
                    "OPENAI_MODEL": "test-model",
                },
                clear=True,
            ):
                client = TestClient(create_app())
                client.post(
                    "/documents",
                    json={
                        "doc_id": "hybrid",
                        "title": "Hybrid",
                        "content": "Python handles Agent RAG and Java handles tools.",
                    },
                )

                response = client.post("/ask", json={"question": "Python 和 Java 怎么分工?"})

        body = response.json()
        self.assertFalse(body["refused"])
        self.assertEqual("模型回答：API 环境变量已接入。", body["answer"])
        self.assertEqual("Hybrid", body["citations"][0]["title"])

    def test_create_app_uses_qdrant_when_env_is_set(self):
        with fake_qdrant_service() as base_url:
            with mock.patch.dict(
                "os.environ",
                {
                    "QDRANT_BASE_URL": base_url,
                    "QDRANT_COLLECTION": "agent_docs",
                },
                clear=True,
            ):
                client = TestClient(create_app())
                client.post(
                    "/documents",
                    json={
                        "doc_id": "vector-rag",
                        "title": "Vector RAG",
                        "content": "Qdrant stores embeddings for Agent RAG retrieval with citations.",
                    },
                )

                response = client.post("/ask", json={"question": "Agent RAG 为什么需要 Qdrant 向量库?"})

        body = response.json()
        self.assertFalse(body["refused"])
        self.assertEqual("Vector RAG", body["citations"][0]["title"])
        self.assertIn("Qdrant", body["answer"])
        self.assertGreaterEqual(len(FakeQdrantHandler.upsert_requests), 1)
        self.assertGreaterEqual(len(FakeQdrantHandler.query_requests), 1)


if __name__ == "__main__":
    unittest.main()
