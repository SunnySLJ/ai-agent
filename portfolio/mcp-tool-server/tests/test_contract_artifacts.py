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
        self.assertEqual("Agent Platform RAG API", self.openapi["info"]["title"])

    def test_covers_rag_routes(self):
        expected = {
            ("/health", "get", "health"),
            ("/documents", "post", "ingestDocument"),
            ("/ask", "post", "askQuestion"),
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


class McpToolsContractTest(unittest.TestCase):
    def setUp(self):
        self.openapi = load_json("openapi.json")
        self.manifest = load_json("mcp-tools.json")

    def test_declares_mcp_tools_reference(self):
        self.assertEqual(
            "https://modelcontextprotocol.io/specification/2025-06-18/server/tools",
            self.manifest["protocolReference"],
        )

    def test_exposes_no_business_tools_in_rag_only_mode(self):
        self.assertEqual([], self.manifest["tools"])


if __name__ == "__main__":
    unittest.main()
