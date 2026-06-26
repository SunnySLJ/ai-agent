# Feature 005: OpenAPI and MCP-Ready Tool Contract

## Why

The Python Agent can now call the Java Business Tool Service over HTTP. The next portfolio gap is a stable tool contract that can be handed to an Agent runtime, frontend client, Apifox, or a future MCP server wrapper.

This feature makes the tool boundary explicit: HTTP endpoints, request/response schemas, errors, examples, and an MCP `tools/list`-style manifest with input schemas.

## Scope

Create contract artifacts under `portfolio/mcp-tool-server/`:

- `openapi.json`: OpenAPI 3.0.3 contract for the Java Business Tool Service.
- `mcp-tools.json`: MCP-ready tool definitions for `get_order_status`, `get_ticket_status`, and `create_todo`.
- `docs/api-handoff.md`: frontend/Agent handoff with code-path references, flow diagrams, error handling, and verification commands.
- Contract tests that parse the JSON artifacts and verify path/schema/tool alignment.

## Out of Scope

- A full MCP JSON-RPC runtime server.
- Uploading to Apifox.
- Authentication and authorization.
- Changing the Java service API.
- Changing the Python Agent adapter.

## Acceptance Criteria

### AC1: OpenAPI contract covers real Java routes

Given the Java controller exposes `/health`, `/tools`, `/orders/{orderId}`, `/tickets/{ticketId}`, `/todos`, and `/audit-events`,
When `portfolio/mcp-tool-server/openapi.json` is parsed,
Then those paths and methods exist with matching operation ids and schemas.

### AC2: Request and response schemas are documented

Given the Java records define `CreateTodoRequest`, `OrderResponse`, `TicketResponse`, `TodoResponse`, `ToolListResponse`, `AuditEventsResponse`, and `ErrorResponse`,
When the OpenAPI components are inspected,
Then every exposed field has a type, description, and example.

### AC3: MCP-ready tools expose input schemas

Given the future MCP wrapper needs tool metadata,
When `mcp-tools.json` is parsed,
Then it contains `get_order_status`, `get_ticket_status`, and `create_todo` with JSON Schema `inputSchema` and required parameters matching Java tool metadata.

### AC4: OpenAPI and MCP tools stay aligned

Given `mcp-tools.json` maps tools to HTTP endpoints,
When contract tests run,
Then each MCP tool references an existing OpenAPI operation.

### AC5: Handoff doc is useful for integration

Given an interviewer or frontend engineer reads the handoff,
When reviewing `docs/api-handoff.md`,
Then it shows endpoint inventory, code-path references, flow diagram, sequence diagram, error handling, and verification commands.

