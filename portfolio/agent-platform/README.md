# Agent Platform

Python-led AI Agent/RAG portfolio project.

This is the main portfolio project for the AI Agent career track. It uses Python for the AI layer and keeps Java as a separate business tool/API layer.

## Architecture

- Python: Agent orchestration, RAG, citations, refusal, traces, evaluation.
- Java: business tools such as order, ticket, todo, permissions, audit, idempotency.
- MCP/OpenAPI: integration boundary between the Python Agent and Java business systems.

The default MVP is offline and deterministic. It does not require model keys. An optional Java HTTP tool adapter can call the Java Business Tool Service for real cross-stack tool execution.

## Run Tests

```bash
cd portfolio/agent-platform
/Users/mac/.local/bin/python3.11 -m venv .venv
.venv/bin/python -m pip install -e .
.venv/bin/python -m unittest discover -s tests -v
```

Expected:

```text
Ran 17 tests
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

## What Works Now

- Ingest documents.
- Retrieve evidence with keyword scoring.
- Return answers with citations.
- Refuse when evidence is missing.
- Call deterministic business tools.
- Call Java Business Tool Service over HTTP.
- Record traces.
- Summarize evaluation metrics.
- Expose a FastAPI API for health, document ingestion, question answering, summary, and tool listing.

## Next Adapters

- LangGraph workflow adapter.
- LlamaIndex or LangChain retriever adapter.
- MCP tool server wrapper.
- Docker Compose for Python API + Java tool service.

## Interview Pitch

This project shows a pragmatic hybrid architecture. Python handles fast-moving Agent/RAG/evaluation work, while Java handles stable enterprise business systems and tool APIs. The value is not a chat demo; it is a testable Agent platform with citations, refusals, tool traces, and evaluation metrics.
