import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def load_json(relative_path: str) -> dict:
    with (ROOT / relative_path).open(encoding="utf-8") as file:
        return json.load(file)


class OpenApiContractTest(unittest.TestCase):
    def setUp(self):
        self.openapi = load_json("openapi.json")

    def test_declares_openapi_303(self):
        self.assertEqual("3.0.3", self.openapi["openapi"])
        self.assertEqual("Java Business Tool Service", self.openapi["info"]["title"])

    def test_covers_real_java_routes(self):
        expected = {
            ("/health", "get", "health"),
            ("/tools", "get", "listTools"),
            ("/orders/{orderId}", "get", "getOrderStatus"),
            ("/tickets/{ticketId}", "get", "getTicketStatus"),
            ("/todos", "post", "createTodo"),
            ("/audit-events", "get", "listAuditEvents"),
        }

        actual = {
            (path, method, operation["operationId"])
            for path, methods in self.openapi["paths"].items()
            for method, operation in methods.items()
        }

        self.assertTrue(expected.issubset(actual))

    def test_all_schema_properties_have_descriptions_and_examples(self):
        schemas = self.openapi["components"]["schemas"]

        for schema_name, schema in schemas.items():
            for property_name, property_schema in schema.get("properties", {}).items():
                with self.subTest(schema=schema_name, property=property_name):
                    self.assertIn("description", property_schema)
                    self.assertIn("example", property_schema)

    def test_create_todo_request_marks_required_fields(self):
        schema = self.openapi["components"]["schemas"]["CreateTodoRequest"]

        self.assertEqual(["title", "idempotencyKey"], schema["required"])


class McpToolsContractTest(unittest.TestCase):
    def setUp(self):
        self.openapi = load_json("openapi.json")
        self.manifest = load_json("mcp-tools.json")

    def test_declares_mcp_tools_reference(self):
        self.assertEqual(
            "https://modelcontextprotocol.io/specification/2025-06-18/server/tools",
            self.manifest["protocolReference"],
        )

    def test_exposes_expected_tools_with_input_schemas(self):
        tools = {tool["name"]: tool for tool in self.manifest["tools"]}

        self.assertEqual(
            {"get_order_status", "get_ticket_status", "create_todo"},
            set(tools),
        )
        self.assertEqual(
            ["orderId"],
            tools["get_order_status"]["inputSchema"]["required"],
        )
        self.assertEqual(
            ["ticketId"],
            tools["get_ticket_status"]["inputSchema"]["required"],
        )
        self.assertEqual(
            ["title", "idempotencyKey"],
            tools["create_todo"]["inputSchema"]["required"],
        )

    def test_mcp_tools_map_to_existing_openapi_operations(self):
        operations = {
            operation["operationId"]
            for methods in self.openapi["paths"].values()
            for operation in methods.values()
        }

        for tool in self.manifest["tools"]:
            with self.subTest(tool=tool["name"]):
                self.assertIn(tool["http"]["operationId"], operations)


if __name__ == "__main__":
    unittest.main()
