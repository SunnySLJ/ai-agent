# Agent Platform

Python AI Agent/RAG core for a Python + Java hybrid portfolio project.

This is the main portfolio project for the AI Agent career track. It uses Python for the AI layer and keeps Java as a separate business tool/API layer.

## Architecture

- Python: Agent orchestration, RAG, citations, refusal, traces, evaluation.
- Java: business tools such as order, ticket, todo, permissions, audit, idempotency.
- MCP/OpenAPI: integration boundary between the Python Agent and Java business systems.

The default MVP is offline and deterministic. It does not require model keys. Offline retrieval now uses deterministic hybrid retrieval: BM25-style lexical scoring plus local hashing-vector candidates and a lightweight reranker. Optional adapters can call the Java Business Tool Service, OpenAI-compatible chat APIs, and Qdrant.

## Run Tests

```bash
cd portfolio/agent-platform
/Users/mac/.local/bin/python3.11 -m venv .venv
.venv/bin/python -m pip install -e .
.venv/bin/python -m unittest discover -s tests -v
```

Expected:

```text
Ran 26 tests
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

## Run With Java Tools From Environment

When `JAVA_TOOL_BASE_URL` is set, `agent_platform.api:create_app()` uses Java-backed tools by default:

```bash
cd portfolio/agent-platform
JAVA_TOOL_BASE_URL=http://127.0.0.1:8080 .venv/bin/uvicorn agent_platform.api:app --reload
```

## Run With OpenAI-Compatible LLM

The default app is offline and deterministic. Set `OPENAI_API_KEY` to enable a real OpenAI-compatible chat completion endpoint:

```bash
cd portfolio/agent-platform
OPENAI_API_KEY=your-key \
OPENAI_BASE_URL=https://api.openai.com/v1 \
OPENAI_MODEL=gpt-4o-mini \
.venv/bin/uvicorn agent_platform.api:app --reload
```

For local or domestic OpenAI-compatible providers, replace `OPENAI_BASE_URL` and `OPENAI_MODEL`. The Agent still refuses before calling the model when there is no retrieved evidence or successful tool result.

## Run With Qdrant Vector Retrieval

The default offline retriever is deterministic hybrid retrieval. Set `QDRANT_BASE_URL` to store chunks in Qdrant and retrieve citations through vector query:

```bash
cd portfolio/agent-platform
QDRANT_BASE_URL=http://127.0.0.1:6333 \
QDRANT_COLLECTION=agent_docs \
.venv/bin/uvicorn agent_platform.api:app --reload
```

The local embedding path uses `HashingEmbeddingModel`, so tests and demos do not require paid embedding keys. A production upgrade can replace it with a provider embedding model without changing the Qdrant boundary.

## Call Java Business Tools

Terminal 1:

```bash
cd portfolio/java-business-tool-service
mvn spring-boot:run
```

Terminal 2:

```bash
cd portfolio/agent-platform
.venv/bin/python - <<'PY'
from agent_platform.agent import AgentPlatform

platform = AgentPlatform.with_java_tools("http://127.0.0.1:8080")
response = platform.ask("查询订单 ORD-1001 的状态")
print(response.answer)
print(response.trace.tool_calls[0])
PY
```

## Docker

From the repository root:

```bash
docker compose -f compose.yaml config
docker compose up --build
```

The Compose runtime exposes:

- Python Agent API: `http://127.0.0.1:8000`
- Java Business Tool Service: `http://127.0.0.1:8080`
- Qdrant HTTP API: `http://127.0.0.1:6333`
- Python container env: `JAVA_TOOL_BASE_URL=http://java-business-tool-service:8080`
- Python container env: `QDRANT_BASE_URL=http://qdrant:6333`
- Python container env: `QDRANT_COLLECTION=agent_docs`

## What Works Now

- Ingest documents.
- Retrieve offline evidence through hybrid BM25 + local dense retrieval with lightweight rerank.
- Return answers with citations.
- Refuse when evidence is missing.
- Call deterministic business tools.
- Call Java Business Tool Service over HTTP.
- Optionally call an OpenAI-compatible chat completion API.
- Optionally store and retrieve document chunks through Qdrant vector search.
- Record traces.
- Summarize evaluation metrics.
- Expose a FastAPI API for health, document ingestion, question answering, summary, and tool listing.

## Next Adapters

- LangGraph workflow adapter.
- LlamaIndex or LangChain retriever adapter.
- MCP tool server wrapper.
- External embedding and rerank model adapters.

## Interview Pitch

This project shows a pragmatic hybrid architecture. Python handles fast-moving Agent/RAG/evaluation work, while Java handles stable enterprise business systems and tool APIs. The value is not a chat demo; it is a testable Agent platform with citations, refusals, tool traces, and evaluation metrics.
