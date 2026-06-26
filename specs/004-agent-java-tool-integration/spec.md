# Feature 004: Python Agent to Java Tool Integration

## Why

The portfolio now has two separate verified pieces: a Python Agent Platform and a Java Business Tool Service. To prove the hybrid architecture, the Python Agent must call the Java service over a real HTTP boundary instead of only using deterministic in-process tools.

This feature turns the project story from "two demos" into one cross-stack Agent system: Python owns Agent/RAG/evaluation, Java owns business tools, and the integration boundary is explicit and testable.

## Scope

Add a Python HTTP tool adapter under `portfolio/agent-platform/` that can call the Java Business Tool Service:

- Fetch tool metadata from `GET /tools`.
- Query order status through `GET /orders/{orderId}`.
- Query ticket status through `GET /tickets/{ticketId}`.
- Create todos through `POST /todos`.
- Convert Java success and error responses into Python `ToolCall` traces.
- Keep `AgentPlatform.offline_demo()` on deterministic local tools.
- Add `AgentPlatform.with_java_tools(base_url=...)` for HTTP-backed tools.

## Out of Scope

- Real MCP server implementation.
- Authentication.
- Persistent storage.
- Real LLM calls.
- Replacing the Java service API.
- Full frontend E2E.

## Acceptance Criteria

### AC1: Java tool metadata is visible to Python

Given a Java Business Tool Service base URL,
When a Python Java tool registry is created,
Then `names()` returns the tool names exposed by Java `/tools`.

### AC2: Python Agent can answer from Java order tool

Given the Java service has order `ORD-1001`,
When `AgentPlatform.with_java_tools(base_url)` handles "查询订单 ORD-1001 的状态",
Then the response is not refused, includes the shipped summary, and the trace contains a successful `get_order_status` tool call.

### AC3: Python Agent can answer from Java ticket tool

Given the Java service has ticket `TCK-1001`,
When the Python Agent handles a ticket question,
Then the trace contains a successful `get_ticket_status` tool call with the Java summary.

### AC4: Python Agent can create todo through Java

Given a question asks to create a todo,
When the Python Agent handles it through Java tools,
Then it calls `POST /todos`, includes the returned todo id, and records `create_todo` in the trace.

### AC5: Java errors become failed tool traces

Given Java returns `404 {"code":"ORDER_NOT_FOUND", ...}`,
When Python asks for an unknown order id,
Then the Agent refuses if no other evidence exists and records a failed `get_order_status` tool call with the Java error code/message.

### AC6: Offline demo remains deterministic

Given no Java service is running,
When `AgentPlatform.offline_demo()` handles `ORD-1001`,
Then existing offline behavior remains unchanged.

