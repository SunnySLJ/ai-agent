# Feature 011: Qdrant Vector Retrieval

## Why

The completion audit still lists "向量库" as a production-readiness gap. The current Agent Platform uses keyword retrieval, which is useful for deterministic demos but does not prove vector database integration.

## Scope

- Add a deterministic local embedding model for offline tests and demos.
- Add a Qdrant-compatible HTTP vector index.
- Let `AgentPlatform` ingest chunks into Qdrant and retrieve chunks through vector search.
- Let FastAPI env wiring enable Qdrant mode with `QDRANT_BASE_URL` and `QDRANT_COLLECTION`.
- Add Qdrant to Docker Compose so the portfolio can demonstrate Python + Java + vector database runtime.

## Out of Scope

- Paid embedding provider integration.
- Rerank model integration.
- Hybrid BM25 + dense retrieval.
- Multi-tenant collection management.

## Acceptance Criteria

### AC1: Embedding is deterministic

Given the same text,
When `HashingEmbeddingModel.embed()` is called twice,
Then it returns the same normalized vector with the configured size.

### AC2: Qdrant collection and points are written

Given a Qdrant base URL and collection,
When a document is ingested,
Then the platform creates the collection and upserts document chunks as vectors with traceable payload.

### AC3: Qdrant query returns citations

Given Qdrant returns scored points,
When `ask()` is called,
Then the Agent response includes retrieved chunks, citations, and a non-refusal answer.

### AC4: API env wiring enables Qdrant mode

Given `QDRANT_BASE_URL` and `QDRANT_COLLECTION` are set,
When `create_app()` is called,
Then document ingestion and `/ask` use the Qdrant retriever path.

### AC5: Compose includes vector database

Given Docker daemon is running,
When `docker compose -f compose.yaml up --build -d` is run,
Then Python Agent API, Java Business Tool Service, and Qdrant can start together.
