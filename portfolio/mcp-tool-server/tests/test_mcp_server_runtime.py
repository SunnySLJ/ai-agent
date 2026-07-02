import json
import unittest
from pathlib import Path
from unittest.mock import patch

from mcp_server import McpToolServer


ROOT = Path(__file__).resolve().parents[1]


class McpServerRuntimeTest(unittest.TestCase):
    def setUp(self):
        self.server = McpToolServer(
            base_url="http://java-tools.test",
            manifest_path=ROOT / "mcp-tools.json",
        )

    def test_initialize_returns_server_info(self):
        response = self.server.handle(
            {"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {}}
        )

        self.assertEqual(1, response["id"])
        self.assertEqual("ai-agent-java-business-tools", response["result"]["serverInfo"]["name"])

    def test_tools_list_returns_manifest_tools(self):
        response = self.server.handle(
            {"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}
        )

        names = {tool["name"] for tool in response["result"]["tools"]}
        self.assertEqual(
            {"get_order_status", "get_ticket_status", "create_todo"},
            names,
        )

    @patch("mcp_server.request.urlopen")
    def test_tools_call_invokes_java_http_endpoint(self, urlopen_mock):
        class FakeResponse:
            status = 200

            def __enter__(self):
                return self

            def __exit__(self, exc_type, exc, tb):
                return False

            def read(self):
                return json.dumps(
                    {"orderId": "ORD-1001", "summary": "订单 ORD-1001 当前状态：已发货。"}
                ).encode("utf-8")

        urlopen_mock.return_value = FakeResponse()

        response = self.server.handle(
            {
                "jsonrpc": "2.0",
                "id": 3,
                "method": "tools/call",
                "params": {
                    "name": "get_order_status",
                    "arguments": {"orderId": "ORD-1001"},
                },
            }
        )

        self.assertIn("已发货", response["result"]["content"][0]["text"])
        self.assertFalse(response["result"]["isError"])


if __name__ == "__main__":
    unittest.main()
