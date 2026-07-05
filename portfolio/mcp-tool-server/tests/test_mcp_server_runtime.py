import json
import unittest
from pathlib import Path
from unittest.mock import patch

from mcp_server import McpToolServer


ROOT = Path(__file__).resolve().parents[1]


class McpServerRuntimeTest(unittest.TestCase):
    def setUp(self):
        self.server = McpToolServer(
            base_url="http://agent-platform.test",
            manifest_path=ROOT / "mcp-tools.json",
        )

    def test_initialize_returns_server_info(self):
        response = self.server.handle(
            {"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {}}
        )

        self.assertEqual(1, response["id"])
        self.assertEqual("ai-agent-rag-platform", response["result"]["serverInfo"]["name"])

    def test_tools_list_returns_empty_manifest(self):
        response = self.server.handle(
            {"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}
        )

        self.assertEqual([], response["result"]["tools"])

    def test_tools_call_unknown_tool_raises(self):
        with self.assertRaises(ValueError):
            self.server.handle(
                {
                    "jsonrpc": "2.0",
                    "id": 3,
                    "method": "tools/call",
                    "params": {"name": "missing_tool", "arguments": {}},
                }
            )


if __name__ == "__main__":
    unittest.main()
