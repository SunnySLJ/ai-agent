# Agent Platform

Python-led AI Agent/RAG portfolio project.

This is the main portfolio project for the AI Agent career track. It uses Python for the AI layer and keeps Java as a separate business tool/API layer.

## Architecture

- Python: Agent orchestration, RAG, citations, refusal, traces, evaluation.
- Java: business tools such as order, ticket, todo, permissions, audit, idempotency.
- MCP/OpenAPI: integration boundary between the Python Agent and Java business systems.

The current MVP is offline and deterministic. It does not require model keys.

## Run Tests

```bash
cd portfolio/agent-platform
PYTHONPATH=src /Users/mac/.local/bin/python3.11 -m unittest discover -s tests -v
```

Expected:

```text
Ran 4 tests
OK
```

## What Works Now

- Ingest documents.
- Retrieve evidence with keyword scoring.
- Return answers with citations.
- Refuse when evidence is missing.
- Call deterministic business tools.
- Record traces.
- Summarize evaluation metrics.

## Next Adapters

- FastAPI HTTP API.
- LangGraph workflow adapter.
- LlamaIndex or LangChain retriever adapter.
- Java business tool service integration.
- MCP tool server wrapper.

## Interview Pitch

This project shows a pragmatic hybrid architecture. Python handles fast-moving Agent/RAG/evaluation work, while Java handles stable enterprise business systems and tool APIs. The value is not a chat demo; it is a testable Agent platform with citations, refusals, tool traces, and evaluation metrics.

