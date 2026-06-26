import json
import threading
import unittest
from contextlib import contextmanager
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from agent_platform.agent import AgentPlatform
from agent_platform.java_tools import JavaBusinessToolRegistry


class JavaLikeToolHandler(BaseHTTPRequestHandler):
    todo_payloads: list[dict[str, str]] = []

    def do_GET(self):
        if self.path == "/tools":
            self._send_json(
                200,
                {
                    "tools": [
                        {
                            "name": "get_order_status",
                            "description": "Query order status by orderId.",
                            "requiredParameters": ["orderId"],
                        },
                        {
                            "name": "get_ticket_status",
                            "description": "Query ticket status by ticketId.",
                            "requiredParameters": ["ticketId"],
                        },
                        {
                            "name": "create_todo",
                            "description": "Create an idempotent todo item.",
                            "requiredParameters": ["title", "idempotencyKey"],
                        },
                    ]
                },
            )
            return
        if self.path == "/orders/ORD-1001":
            self._send_json(
                200,
                {
                    "orderId": "ORD-1001",
                    "status": "shipped",
                    "eta": "tomorrow",
                    "summary": "订单 ORD-1001 当前状态：已发货，预计明日送达。",
                },
            )
            return
        if self.path == "/orders/ORD-2002":
            self._send_json(
                200,
                {
                    "orderId": "ORD-2002",
                    "status": "ready",
                    "eta": "today",
                    "summary": "测试专属订单 ORD-2002 当前状态：已备货。",
                },
            )
            return
        if self.path.startswith("/orders/"):
            order_id = self.path.rsplit("/", 1)[-1]
            self._send_json(
                404,
                {
                    "code": "ORDER_NOT_FOUND",
                    "message": f"Order {order_id} was not found",
                },
            )
            return
        if self.path == "/tickets/TCK-1001":
            self._send_json(
                200,
                {
                    "ticketId": "TCK-1001",
                    "status": "processing",
                    "owner": "support-team",
                    "summary": "工单 TCK-1001 当前状态：处理中。",
                },
            )
            return
        self._send_json(404, {"code": "NOT_FOUND", "message": "Not found"})

    def do_POST(self):
        if self.path == "/todos":
            payload = self._read_json()
            JavaLikeToolHandler.todo_payloads.append(payload)
            self._send_json(
                200,
                {
                    "todoId": "TODO-1",
                    "title": payload["title"],
                    "status": "created",
                },
            )
            return
        self._send_json(404, {"code": "NOT_FOUND", "message": "Not found"})

    def log_message(self, format, *args):
        return

    def _read_json(self) -> dict[str, str]:
        length = int(self.headers.get("content-length", "0"))
        return json.loads(self.rfile.read(length).decode("utf-8"))

    def _send_json(self, status: int, payload: dict):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("content-type", "application/json")
        self.send_header("content-length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


@contextmanager
def java_like_tool_service():
    JavaLikeToolHandler.todo_payloads = []
    server = ThreadingHTTPServer(("127.0.0.1", 0), JavaLikeToolHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_address[1]}"
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)


class JavaBusinessToolRegistryTest(unittest.TestCase):
    def test_reads_tool_names_from_java_service(self):
        with java_like_tool_service() as base_url:
            registry = JavaBusinessToolRegistry(base_url)

            names = registry.names()

        self.assertEqual(
            ["get_order_status", "get_ticket_status", "create_todo"],
            names,
        )

    def test_invokes_order_tool_over_http(self):
        with java_like_tool_service() as base_url:
            registry = JavaBusinessToolRegistry(base_url)

            calls = registry.invoke("帮我查询订单 ORD-1001 的状态")

        self.assertEqual(1, len(calls))
        self.assertEqual("get_order_status", calls[0].name)
        self.assertTrue(calls[0].success)
        self.assertIn("已发货", calls[0].result)

    def test_invokes_ticket_tool_over_http(self):
        with java_like_tool_service() as base_url:
            registry = JavaBusinessToolRegistry(base_url)

            calls = registry.invoke("查询工单 TCK-1001 的状态")

        self.assertEqual(1, len(calls))
        self.assertEqual("get_ticket_status", calls[0].name)
        self.assertTrue(calls[0].success)
        self.assertIn("处理中", calls[0].result)

    def test_invokes_todo_tool_over_http_with_idempotency_key(self):
        with java_like_tool_service() as base_url:
            registry = JavaBusinessToolRegistry(base_url)

            calls = registry.invoke("请创建待办：跟进客户")

        self.assertEqual(1, len(calls))
        self.assertEqual("create_todo", calls[0].name)
        self.assertTrue(calls[0].success)
        self.assertIn("TODO-1", calls[0].result)
        self.assertEqual(1, len(JavaLikeToolHandler.todo_payloads))
        self.assertTrue(
            JavaLikeToolHandler.todo_payloads[0]["idempotencyKey"].startswith("agent-")
        )

    def test_maps_java_404_to_failed_tool_call(self):
        with java_like_tool_service() as base_url:
            registry = JavaBusinessToolRegistry(base_url)

            calls = registry.invoke("帮我查询订单 ORD-404 的状态")

        self.assertEqual(1, len(calls))
        self.assertEqual("get_order_status", calls[0].name)
        self.assertFalse(calls[0].success)
        self.assertIn("ORDER_NOT_FOUND", calls[0].result)
        self.assertIn("ORD-404", calls[0].result)


class AgentPlatformJavaToolsTest(unittest.TestCase):
    def test_agent_uses_java_order_tool(self):
        with java_like_tool_service() as base_url:
            platform = AgentPlatform.with_java_tools(base_url)

            response = platform.ask("查询订单 ORD-1001 的状态")

        self.assertFalse(response.refused)
        self.assertIn("已发货", response.answer)
        self.assertEqual("get_order_status", response.trace.tool_calls[0].name)
        self.assertTrue(response.trace.tool_calls[0].success)

    def test_agent_refuses_when_java_tool_fails_and_no_evidence_exists(self):
        with java_like_tool_service() as base_url:
            platform = AgentPlatform.with_java_tools(base_url)

            response = platform.ask("查询订单 ORD-404 的状态")

        self.assertTrue(response.refused)
        self.assertEqual("get_order_status", response.trace.tool_calls[0].name)
        self.assertFalse(response.trace.tool_calls[0].success)
        self.assertIn("ORDER_NOT_FOUND", response.trace.tool_calls[0].result)

    def test_offline_demo_keeps_existing_deterministic_tool(self):
        platform = AgentPlatform.offline_demo()

        response = platform.ask("帮我查询订单 ORD-1001 的状态")

        self.assertFalse(response.refused)
        self.assertIn("已发货", response.answer)
        self.assertEqual("get_order_status", response.trace.tool_calls[0].name)


if __name__ == "__main__":
    unittest.main()
