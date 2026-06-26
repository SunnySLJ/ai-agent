# Feature 002: Agent Platform FastAPI Layer

## Why

The Agent Platform core already proves offline Agent/RAG behavior. To become a useful portfolio project, it needs an API layer that can be demonstrated, tested, and later connected to Java business tools, MCP wrappers, or a frontend.

## Scope

Add a FastAPI app under `portfolio/agent-platform/src/agent_platform/api.py` with endpoints:

- `GET /health`
- `POST /documents`
- `POST /ask`
- `GET /summary`
- `GET /tools`

## Out of Scope

- Authentication.
- Persistent storage.
- Streaming responses.
- Real LLM adapter.
- Java service calls.

## Acceptance Criteria

### AC1: Health

Given the API app is imported,
When `GET /health` is called,
Then it returns `{"status":"ok"}`.

### AC2: Document ingestion and question answering

Given a document is posted to `/documents`,
When a related question is posted to `/ask`,
Then the answer is not refused and includes citations.

### AC3: Refusal through API

Given no relevant evidence exists,
When an unrelated question is posted to `/ask`,
Then the response is refused.

### AC4: Tool call through API

Given a known order id is asked through `/ask`,
Then the response includes a successful `get_order_status` trace.

### AC5: Summary and tools

Given multiple calls have been made,
When `/summary` and `/tools` are requested,
Then summary metrics and available tool names are returned.

