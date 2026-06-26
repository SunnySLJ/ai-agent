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
/Users/mac/.local/bin/python3.11 -m venv .venv
.venv/bin/python -m pip install -e .
.venv/bin/python -m unittest discover -s tests -v
```

Expected:

```text
Ran 9 tests
OK
```

## Run API

```bash
cd portfolio/agent-platform
.venv/bin/uvicorn agent_platform.api:app --reload
```

Useful requests:

```bash
curl http://127.0.0.1:8000/health

curl -X POST http://127.0.0.1:8000/documents \
  -H 'Content-Type: application/json' \
  -d '{"doc_id":"hybrid","title":"Hybrid Agent Architecture","content":"Python owns Agent RAG orchestration while Java exposes business tool APIs."}'

curl -X POST http://127.0.0.1:8000/ask \
  -H 'Content-Type: application/json' \
  -d '{"question":"Python 和 Java 怎么分工?"}'

curl http://127.0.0.1:8000/summary
curl http://127.0.0.1:8000/tools
```

## What Works Now

- Ingest documents.
- Retrieve evidence with keyword scoring.
- Return answers with citations.
- Refuse when evidence is missing.
- Call deterministic business tools.
- Record traces.
- Summarize evaluation metrics.
- Expose a FastAPI API for health, document ingestion, question answering, summary, and tool listing.

## Next Adapters

- FastAPI HTTP API.
- LangGraph workflow adapter.
- LlamaIndex or LangChain retriever adapter.
- Java business tool service integration.
- MCP tool server wrapper.

## Interview Pitch

This project shows a pragmatic hybrid architecture. Python handles fast-moving Agent/RAG/evaluation work, while Java handles stable enterprise business systems and tool APIs. The value is not a chat demo; it is a testable Agent platform with citations, refusals, tool traces, and evaluation metrics.
