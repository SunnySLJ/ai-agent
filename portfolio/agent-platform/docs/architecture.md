# Agent Platform Architecture

## Why Python First

Python is the better first implementation language for the AI layer because most practical Agent/RAG work happens around fast experiments:

- document parsing,
- chunking and retrieval,
- prompt and tool orchestration,
- LangGraph/LangChain workflows,
- LlamaIndex experiments,
- eval datasets,
- trace replay,
- future multimodal/OCR work.

The first month should optimize for learning speed, interview demos, and the ability to explain Agent/RAG internals. Python fits that better than forcing every AI concern into Java.

## Why Keep Java

Java remains the user's advantage. Enterprise AI Agents need to call real systems:

- orders,
- tickets,
- CRM/ERP records,
- permissions,
- audit logs,
- transactions,
- idempotent writes,
- stable deployment.

Those are Java backend strengths. The right interview story is not "I abandoned Java"; it is "I use Python for AI orchestration and Java for reliable enterprise tools."

## Boundary

```mermaid
flowchart LR
  User[User] --> Python[Python Agent Platform]
  Python --> RAG[RAG Retrieval + Citations]
  Python --> Eval[Trace + Evaluation]
  Python --> Tool[MCP/OpenAPI Tool Boundary]
  Tool --> Java[Java Business Tool Service]
  Java --> Data[(Business Data)]
```

## Current MVP

The default MVP is deterministic:

- no model key,
- no vector database,
- no network dependency for `offline_demo()`,
- standard-library tests,
- explicit trace and evaluation outputs.

The optional Java HTTP tool adapter calls the Java Business Tool Service through a real local HTTP boundary, while keeping offline tests deterministic.

## Upgrade Path

1. Replace keyword retrieval with embeddings and Qdrant/pgvector.
2. FastAPI endpoints for ingestion, question answering, traces, and summaries. Done.
3. Add LangGraph for stateful Agent workflows.
4. Add LlamaIndex for document ingestion and indexing experiments.
5. Java Business Tool Service plus Python HTTP tool adapter. Done.
6. Add MCP/OpenAPI wrapper.
7. Add Docker Compose for Python + Java + vector database.
