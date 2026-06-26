# Feature 012 Plan

## Files

```text
portfolio/agent-platform/src/agent_platform/retrieval.py
portfolio/agent-platform/src/agent_platform/agent.py
portfolio/agent-platform/tests/test_hybrid_retrieval.py
portfolio/agent-eval-dashboard/src/agent_eval_dashboard/retrieval_eval.py
portfolio/agent-eval-dashboard/tests/test_retrieval_eval.py
portfolio/agent-platform/data/retrieval_eval_dataset.jsonl
portfolio/agent-platform/README.md
docs/project-completion-audit.md
logs/daily/2026-06-26.md
specs/012-hybrid-retrieval-rerank/state.md
```

## Design

Keep the implementation deterministic and offline:

- `BM25Retriever` scores lexical evidence from the in-memory `KnowledgeBase`.
- `LocalVectorRetriever` embeds chunks with `HashingEmbeddingModel` and uses cosine similarity.
- `HybridRetriever` fuses both candidate sets, applies a lexical evidence gate to avoid random dense false positives, then reranks with source score, title match, and query-term coverage.
- `AgentPlatform.offline_demo()` uses `HybridRetriever`; Qdrant remains the env-driven production vector path.
- `retrieval_eval.py` seeds the same demo docs as the answer eval and compares retrievers against a labeled JSONL dataset.

```mermaid
flowchart LR
  KB[KnowledgeBase chunks] --> BM25[BM25 lexical]
  KB --> Dense[Hashing dense]
  BM25 --> Fusion[Candidate fusion]
  Dense --> Fusion
  Fusion --> Gate[Evidence gate]
  Gate --> Rerank[Lightweight rerank]
  Rerank --> Agent[Answer + citations]
```

## Verification

- RED: `cd portfolio/agent-platform && .venv/bin/python -m unittest tests.test_hybrid_retrieval -v` fails because hybrid retrieval classes do not exist.
- GREEN: same test passes after implementation.
- RED: `cd portfolio/agent-eval-dashboard && PYTHONPATH=../agent-platform/src:src python3 -m unittest tests.test_retrieval_eval -v` fails before retrieval eval helper exists.
- GREEN: same test passes after implementation.
- Full Agent Platform tests.
- Full Eval Dashboard tests and CLI report.
- Root Docker artifact tests.
- `docker compose -f compose.yaml config`.
