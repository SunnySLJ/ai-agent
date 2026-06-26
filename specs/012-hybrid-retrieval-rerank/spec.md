# Feature 012: Hybrid Retrieval and Rerank

## Why

The completion audit still lists rerank and hybrid retrieval as an evidence gap. Feature 011 proves Qdrant vector database integration, but the offline demo still depends on simple keyword scoring and cannot explain recall/ranking tradeoffs in interviews.

## Scope

- Add a deterministic local BM25-style lexical retriever.
- Add a deterministic local dense retriever using `HashingEmbeddingModel`.
- Add a hybrid retriever that fuses lexical and dense candidates, then reranks with a lightweight evidence-first score.
- Make `AgentPlatform.offline_demo()` use the hybrid retriever by default.
- Add a retrieval evaluation report that compares keyword-only and hybrid retrieval on a small labeled dataset.
- Update docs and completion evidence.

## Out of Scope

- Paid embedding provider integration.
- External rerank model integration.
- LangChain, LlamaIndex, or LangGraph adapters.
- Replacing the Qdrant production vector path.

## Acceptance Criteria

### AC1: Hybrid retriever ranks stronger evidence first

Given multiple documents with overlapping Agent/RAG terms,
When a query asks about a specific capability,
Then `HybridRetriever.retrieve()` returns the most relevant chunk first and keeps scores positive.

### AC2: Hybrid retriever does not answer unsupported questions

Given only Agent/RAG project documents,
When a realtime or unrelated question is asked,
Then retrieval returns no chunks and the Agent refuses.

### AC3: Offline Agent uses hybrid retrieval

Given `AgentPlatform.offline_demo()`,
When documents are ingested and a grounded question is asked,
Then citations come from the hybrid retriever without requiring Qdrant or model keys.

### AC4: Retrieval evaluation compares keyword and hybrid modes

Given a labeled retrieval dataset,
When the eval helper runs keyword-only and hybrid retrieval,
Then the report includes per-mode hit rate, MRR, and per-case top documents.

### AC5: Documentation records the remaining external blockers honestly

Given the project still lacks BOSS login-state screening and may lack real model smoke evidence,
When docs are updated,
Then they distinguish completed hybrid retrieval from external account/key-dependent checks.
