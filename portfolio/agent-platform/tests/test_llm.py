from __future__ import annotations

import json
import unittest
from contextlib import contextmanager
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread

from agent_platform.llm import OpenAICompatibleChatClient
from agent_platform.models import RetrievedChunk, ToolCall


class ChatCompletionHandler(BaseHTTPRequestHandler):
    requests: list[dict[str, object]] = []
    response_content = "模型回答：基于证据生成。"
    status_code = 200
    error_body: dict[str, object] | None = None

    def do_POST(self):  # noqa: N802
        length = int(self.headers.get("Content-Length", "0"))
        payload = json.loads(self.rfile.read(length).decode("utf-8"))
        self.__class__.requests.append(
            {
                "path": self.path,
                "authorization": self.headers.get("Authorization"),
                "payload": payload,
            }
        )
        if self.__class__.status_code >= 400:
            body = self.__class__.error_body or {"error": {"message": "failed"}}
            encoded = json.dumps(body).encode("utf-8")
            self.send_response(self.__class__.status_code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(encoded)))
            self.end_headers()
            self.wfile.write(encoded)
            return

        body = {
            "choices": [
                {
                    "message": {
                        "content": self.__class__.response_content,
                    }
                }
            ]
        }
        encoded = json.dumps(body).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def log_message(self, format, *args):  # noqa: A002
        return


@contextmanager
def chat_completion_service(
    content: str = "模型回答：基于证据生成。",
    *,
    status_code: int = 200,
    error_body: dict[str, object] | None = None,
):
    ChatCompletionHandler.requests = []
    ChatCompletionHandler.response_content = content
    ChatCompletionHandler.status_code = status_code
    ChatCompletionHandler.error_body = error_body
    server = ThreadingHTTPServer(("127.0.0.1", 0), ChatCompletionHandler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}/v1"
    finally:
        server.shutdown()
        thread.join(timeout=2)
        server.server_close()


class OpenAICompatibleChatClientTest(unittest.TestCase):
    def test_generate_answer_posts_chat_completion_request(self):
        with chat_completion_service("模型回答：Python 负责 Agent，Java 负责工具。") as base_url:
            client = OpenAICompatibleChatClient(
                base_url=base_url,
                api_key="test-key",
                model="test-model",
            )

            answer = client.generate_answer(
                question="Python 和 Java 怎么分工?",
                chunks=[
                    RetrievedChunk(
                        chunk_id="chunk-1",
                        doc_id="doc-1",
                        title="Hybrid",
                        snippet="Python handles Agent orchestration. Java exposes tools.",
                        score=1.0,
                    )
                ],
                tool_calls=[
                    ToolCall(
                        name="get_order_status",
                        arguments={"order_id": "ORD-1001"},
                        result="订单已发货。",
                        success=True,
                    )
                ],
            )

        self.assertEqual("模型回答：Python 负责 Agent，Java 负责工具。", answer)
        self.assertEqual(1, len(ChatCompletionHandler.requests))
        request = ChatCompletionHandler.requests[0]
        self.assertEqual("/v1/chat/completions", request["path"])
        self.assertEqual("Bearer test-key", request["authorization"])
        payload = request["payload"]
        self.assertEqual("test-model", payload["model"])
        self.assertEqual("system", payload["messages"][0]["role"])
        user_content = payload["messages"][1]["content"]
        self.assertIn("Python 和 Java 怎么分工?", user_content)
        self.assertIn("Hybrid", user_content)
        self.assertIn("get_order_status", user_content)

    def test_http_error_redacts_api_keys_from_provider_detail(self):
        with chat_completion_service(
            status_code=401,
            error_body={
                "error": {
                    "message": "Incorrect API key provided: sk-testSECRET1234567890.",
                }
            },
        ) as base_url:
            client = OpenAICompatibleChatClient(
                base_url=base_url,
                api_key="sk-testSECRET1234567890",
                model="test-model",
            )

            with self.assertRaisesRegex(Exception, "HTTP 401") as raised:
                client.generate_answer(
                    question="Python 和 Java 怎么分工?",
                    chunks=[
                        RetrievedChunk(
                            chunk_id="chunk-1",
                            doc_id="doc-1",
                            title="Hybrid",
                            snippet="Python handles Agent orchestration.",
                            score=1.0,
                        )
                    ],
                    tool_calls=[],
                )

        message = str(raised.exception)
        self.assertIn("[REDACTED_API_KEY]", message)
        self.assertNotIn("sk-testSECRET1234567890", message)


if __name__ == "__main__":
    unittest.main()
