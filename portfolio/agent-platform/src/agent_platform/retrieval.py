from __future__ import annotations

import re
from collections.abc import Iterable

from agent_platform.knowledge_base import DocumentChunk, KnowledgeBase
from agent_platform.models import RetrievedChunk


class KeywordRetriever:
    def __init__(self, knowledge_base: KnowledgeBase) -> None:
        self._knowledge_base = knowledge_base

    def retrieve(self, query: str, limit: int = 3) -> list[RetrievedChunk]:
        query_terms = self._terms(query)
        if not query_terms:
            return []

        scored = [
            self._score_chunk(chunk, query_terms)
            for chunk in self._knowledge_base.chunks()
        ]
        return sorted(
            [chunk for chunk in scored if chunk.score > 0],
            key=lambda chunk: chunk.score,
            reverse=True,
        )[:limit]

    def _score_chunk(self, chunk: DocumentChunk, query_terms: set[str]) -> RetrievedChunk:
        chunk_terms = self._terms(f"{chunk.title} {chunk.content}")
        matched = query_terms.intersection(chunk_terms)
        score = len(matched) / len(query_terms) if query_terms else 0
        return RetrievedChunk(
            chunk_id=chunk.chunk_id,
            doc_id=chunk.doc_id,
            title=chunk.title,
            snippet=self._snippet(chunk.content),
            score=score,
        )

    def _terms(self, text: str) -> set[str]:
        ascii_terms = re.findall(r"[a-zA-Z][a-zA-Z0-9+-]*|[A-Z]{2,}", text.lower())
        cjk_terms = self._known_cjk_terms(text)
        terms = set(ascii_terms).union(cjk_terms)
        return {term for term in terms if len(term) >= 2 and term not in self._stop_words()}

    def _known_cjk_terms(self, text: str) -> Iterable[str]:
        vocabulary = [
            "python",
            "java",
            "agent",
            "rag",
            "评估",
            "检索",
            "引用",
            "拒答",
            "工具",
            "订单",
            "业务",
            "知识库",
        ]
        lowered = text.lower()
        return [term for term in vocabulary if term in lowered]

    def _snippet(self, content: str) -> str:
        stripped = content.strip()
        return stripped if len(stripped) <= 180 else f"{stripped[:177]}..."

    def _stop_words(self) -> set[str]:
        return {"the", "and", "for", "with", "how", "what", "can"}

