# Feature 005 Plan

## File Structure

```text
portfolio/mcp-tool-server/
  README.md
  openapi.json
  mcp-tools.json
  docs/
    api-handoff.md
  tests/
    test_contract_artifacts.py
specs/005-openapi-mcp-tool-contract/
  spec.md
  plan.md
  tasks.md
  state.md
  session.md
```

## Source of Truth

The contract must match real code:

- Controller routes: `portfolio/java-business-tool-service/src/main/java/com/shuang/aiagent/tools/api/BusinessToolController.java`
- Business behavior and fixtures: `portfolio/java-business-tool-service/src/main/java/com/shuang/aiagent/tools/core/BusinessToolService.java`
- Records/schemas: `portfolio/java-business-tool-service/src/main/java/com/shuang/aiagent/tools/model/*.java`
- Python tool consumer: `portfolio/agent-platform/src/agent_platform/java_tools.py`

## Contract Shape

### OpenAPI

- OpenAPI version: `3.0.3`.
- Server default: `http://127.0.0.1:8080`.
- Include only externally useful tool endpoints.
- All schema properties need `description` and `example`.
- Error responses use `ErrorResponse`.

### MCP-ready manifest

`mcp-tools.json` is not a full MCP server. It is a `tools/list`-style handoff artifact:

```json
{
  "protocolReference": "https://modelcontextprotocol.io/specification/2025-06-18/server/tools",
  "tools": [
    {
      "name": "get_order_status",
      "description": "...",
      "inputSchema": {"type": "object", "properties": {"orderId": {"type": "string"}}, "required": ["orderId"]},
      "http": {"method": "GET", "path": "/orders/{orderId}", "operationId": "getOrderStatus"}
    }
  ]
}
```

## Tests

Use Python stdlib `unittest` and `json` only:

- Parse `openapi.json`.
- Parse `mcp-tools.json`.
- Verify routes/methods/operation ids.
- Verify component schemas and field metadata.
- Verify MCP tools map to OpenAPI operations.

## Verification

Run:

```bash
cd portfolio/mcp-tool-server
python3 -m unittest discover -s tests -v
python3 -m json.tool openapi.json >/tmp/ai-agent-openapi.json
python3 -m json.tool mcp-tools.json >/tmp/ai-agent-mcp-tools.json
```

