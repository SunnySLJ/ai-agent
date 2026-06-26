# Feature 001: Python + Java Hybrid Agent Platform

## Why

The previous Java-first direction is not ideal for AI Agent engineering. Python has stronger practical ecosystems for Agent orchestration, RAG experimentation, evaluation, document parsing, and future LangGraph/LlamaIndex integration. Java remains valuable as the user's existing strength for business systems, permissions, integration, and tool APIs.

## Product Position

Build a hybrid portfolio:

- Python is the primary AI layer: Agent workflow, RAG, tool calling, evaluation, trace replay, future FastAPI/LangGraph/LlamaIndex adapters.
- Java is the business backend/tool layer: order, ticket, CRM/ERP-like APIs, audit, permissions, idempotency.
- MCP is the integration layer: expose business capabilities as safe Agent tools.

## MVP Scope

Create a runnable Python core under `portfolio/agent-platform/`:

- Ingest documents.
- Retrieve evidence with keyword scoring.
- Return cited answers when evidence exists.
- Refuse when evidence is insufficient.
- Call deterministic business tools.
- Record traces.
- Summarize evaluation metrics.

## Out of Scope

- Real vector database.
- Real LLM API call.
- FastAPI server implementation.
- Java business service implementation.
- MCP server implementation.

These remain next features after the Python core proves the core behavior.

## Acceptance Criteria

### AC1: Cited RAG answer

Given a relevant document has been ingested,
When the user asks a related question,
Then the platform returns an answer with at least one citation and records retrieved chunks in the trace.

### AC2: Evidence refusal

Given there is no relevant evidence or tool result,
When the user asks an unrelated question,
Then the platform refuses and explains that there is not enough evidence.

### AC3: Tool call

Given a question mentions a known order id,
When the platform handles the question,
Then it calls the order status tool and includes the result in both answer and trace.

### AC4: Evaluation summary

Given multiple runs have been recorded,
When the summary is requested,
Then it reports total runs, refusals, tool calls, tool success count, and average latency.

### AC5: Architecture docs

Given the user needs to explain the project in interviews,
When reading the docs,
Then the project clearly explains why Python owns the AI layer and Java owns the business/tool layer.
