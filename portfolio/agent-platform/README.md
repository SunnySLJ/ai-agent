# Agent Platform

Python AI Agent/RAG core focused on **knowledge-base Q&A with citations**.

## Architecture

- Python: Agent orchestration, RAG retrieval, citations, refusal, traces, evaluation.
- No mock business tools: order/ticket/todo demos were removed; out-of-scope questions are refused.
- Optional adapters: OpenAI-compatible chat APIs and Qdrant vector retrieval.

The default MVP is offline and deterministic. It does not require model keys.

## Run Tests

```bash
cd portfolio/agent-platform
/Users/mac/.local/bin/python3.11 -m venv .venv
.venv/bin/python -m pip install -e .
.venv/bin/python -m unittest discover -s tests -v
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
  -d '{"doc_id":"rag","title":"RAG Evaluation","content":"RAG evaluation records retrieval hits, citations, refusals, and traces."}'

curl -X POST http://127.0.0.1:8000/ask \
  -H 'Content-Type: application/json' \
  -d '{"question":"RAG 评估记录什么?"}'

curl http://127.0.0.1:8000/summary
curl http://127.0.0.1:8000/tools
```

## Docker

From the repository root:

```bash
docker compose -f compose.yaml config
docker compose up --build
```

The Compose runtime exposes:

- Python Agent API: `http://127.0.0.1:8000`
- Qdrant HTTP API: `http://127.0.0.1:6333`

## What Works Now

- Ingest documents (text/PDF).
- Retrieve evidence through hybrid BM25 + local dense retrieval.
- Return answers with citations.
- Refuse when evidence is missing (including order/ticket questions outside the KB).
- Record traces and evaluation metrics.
- Expose FastAPI endpoints for health, ingest, ask, stream, summary, ProjectForge, and verified knowledge.

## Interview Pitch

This project demonstrates a production-minded RAG Agent: citations, refusals, traces, eval dataset, and Docker deployment—not a chat demo with fake business APIs.
