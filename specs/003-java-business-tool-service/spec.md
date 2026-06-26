# Feature 003: Java Business Tool Service

## Why

The project positioning is Python Agent/RAG plus Java business tools. The Java side must prove the user's existing Java backend experience still matters: stable business APIs, validation, audit, idempotency, and controlled tool exposure for Agents.

## Scope

Build a Spring Boot service under `portfolio/java-business-tool-service/` with deterministic in-memory business tools:

- `GET /health`
- `GET /tools`
- `GET /orders/{orderId}`
- `GET /tickets/{ticketId}`
- `POST /todos`
- `GET /audit-events`

## Out of Scope

- Database persistence.
- Authentication.
- Real MCP server.
- Calling the Python Agent service.

## Acceptance Criteria

### AC1: Tool metadata

Given the Java service is running,
When `GET /tools` is called,
Then it returns tool names and JSON-like parameter schema metadata for order, ticket, and todo tools.

### AC2: Order lookup

Given a known order id `ORD-1001`,
When `GET /orders/ORD-1001` is called,
Then it returns shipped status, ETA, and an audit event is recorded.

### AC3: Ticket lookup

Given a known ticket id `TCK-1001`,
When `GET /tickets/TCK-1001` is called,
Then it returns processing status and an audit event is recorded.

### AC4: Idempotent todo creation

Given an idempotency key,
When the same `POST /todos` request is sent twice,
Then both responses return the same todo id and only one todo creation audit event is recorded.

### AC5: Not found response

Given an unknown order id,
When the order endpoint is called,
Then it returns HTTP 404 with a structured error code.

