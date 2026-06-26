# Decision 0001: Python + Java Hybrid Stack

Date: 2026-06-26

## Decision

This project uses a Python + Java hybrid stack.

- Python owns the AI chain: LLM API, prompt engineering, tool calling, Agent orchestration, RAG, embeddings, vector retrieval, rerank, citations, refusal, trace, eval, and FastAPI.
- Java owns the enterprise business tool layer: orders, tickets, todos, CRM/ERP-style APIs, validation, idempotency, audit, transactions, permissions, rate limiting, logging, and stable deployment.
- MCP, OpenAPI, and HTTP tool clients define the boundary between the Python Agent and Java business services.

## Not Chosen

- Not pure Python: this would waste the user's 5 years of Java backend experience.
- Not Python + TypeScript as the main stack: TypeScript can be added later for a frontend or dashboard, but it does not replace Java in this project.
- Not Java-only Agent/RAG in the first month: Spring AI is useful for comparison and Java-side extension, but the fastest job-search path keeps Agent/RAG implementation in Python.

## Interview Positioning

The interview story is:

> I use Python to build the Agent/RAG decision and orchestration layer, and Java to expose reliable enterprise business capabilities as controlled tools. The project is not just a chatbot; it is a deployable AI application that can retrieve knowledge, call business systems, trace behavior, and be evaluated.

## Implementation Mapping

- Python Agent/RAG: `portfolio/agent-platform/`
- Java business tools: `portfolio/java-business-tool-service/`
- Tool contract: `portfolio/mcp-tool-server/`
- Runtime integration: `compose.yaml`
- Learning and job-search route: `docs/30-day-sprint.md`, `docs/tech-stack-roadmap.md`, `docs/application-conversion-kit.md`
