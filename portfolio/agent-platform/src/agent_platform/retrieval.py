from __future__ import annotations

import re
import math
from collections import Counter
from collections.abc import Iterable

from agent_platform.knowledge_base import DocumentChunk, KnowledgeBase
from agent_platform.models import RetrievedChunk
from agent_platform.vector_store import HashingEmbeddingModel


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
        return set(TermAnalyzer().terms(text))

    def _known_cjk_terms(self, text: str) -> Iterable[str]:
        return TermAnalyzer().known_cjk_terms(text)

    def _snippet(self, content: str) -> str:
        stripped = content.strip()
        return stripped if len(stripped) <= 180 else f"{stripped[:177]}..."

    def _stop_words(self) -> set[str]:
        return TermAnalyzer().stop_words()


class TermAnalyzer:
    def terms(self, text: str) -> list[str]:
        ascii_terms = re.findall(r"[a-zA-Z][a-zA-Z0-9+-]*|[A-Z]{2,}", text.lower())
        cjk_terms = self.known_cjk_terms(text)
        return [
            term
            for term in ascii_terms + list(cjk_terms)
            if len(term) >= 2 and term not in self.stop_words()
        ]

    def known_cjk_terms(self, text: str) -> Iterable[str]:
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
            "trace",
            "docker",
            "compose",
            "mcp",
            "openapi",
            "token",
            "成本",
            "来源",
            "幻觉",
            "向量",
            "qdrant",
            "重排",
            "混合",
            "bm25",
            "hit",
            "rate",
            "mrr",
            "召回",
            "排序",
            "指标",
            "证据",
            "低证据",
        ]
        lowered = text.lower()
        return [term for term in vocabulary if term in lowered]

    def stop_words(self) -> set[str]:
        return {"the", "and", "for", "with", "how", "what", "can"}


class BM25Retriever:
    def __init__(self, knowledge_base: KnowledgeBase, *, k1: float = 1.2, b: float = 0.75) -> None:
        self._knowledge_base = knowledge_base
        self._k1 = k1
        self._b = b
        self._analyzer = TermAnalyzer()

    def retrieve(self, query: str, limit: int = 3) -> list[RetrievedChunk]:
        query_terms = self._analyzer.terms(query)
        if not query_terms:
            return []

        chunks = self._knowledge_base.chunks()
        if not chunks:
            return []

        chunk_terms = {
            chunk.chunk_id: self._analyzer.terms(f"{chunk.title} {chunk.content}")
            for chunk in chunks
        }
        document_count = len(chunks)
        avg_length = sum(len(terms) for terms in chunk_terms.values()) / document_count
        document_frequency = Counter(
            term
            for terms in chunk_terms.values()
            for term in set(terms)
        )

        scored = [
            self._score_chunk(
                chunk,
                query_terms,
                chunk_terms[chunk.chunk_id],
                document_count,
                avg_length,
                document_frequency,
            )
            for chunk in chunks
        ]
        return sorted(
            [chunk for chunk in scored if chunk.score > 0],
            key=lambda chunk: chunk.score,
            reverse=True,
        )[:limit]

    def _score_chunk(
        self,
        chunk: DocumentChunk,
        query_terms: list[str],
        terms: list[str],
        document_count: int,
        avg_length: float,
        document_frequency: Counter[str],
    ) -> RetrievedChunk:
        term_counts = Counter(terms)
        doc_length = len(terms) or 1
        score = 0.0
        for term in query_terms:
            tf = term_counts[term]
            if tf == 0:
                continue
            df = document_frequency[term]
            idf = math.log(1 + (document_count - df + 0.5) / (df + 0.5))
            denominator = tf + self._k1 * (1 - self._b + self._b * doc_length / (avg_length or 1))
            score += idf * (tf * (self._k1 + 1) / denominator)
        return RetrievedChunk(
            chunk_id=chunk.chunk_id,
            doc_id=chunk.doc_id,
            title=chunk.title,
            snippet=self._snippet(chunk.content),
            score=score,
        )

    def _snippet(self, content: str) -> str:
        stripped = content.strip()
        return stripped if len(stripped) <= 180 else f"{stripped[:177]}..."


class LocalVectorRetriever:
    def __init__(
        self,
        knowledge_base: KnowledgeBase,
        *,
        embedding_model: HashingEmbeddingModel | None = None,
    ) -> None:
        self._knowledge_base = knowledge_base
        self._embedding_model = embedding_model or HashingEmbeddingModel()

    def retrieve(self, query: str, limit: int = 3) -> list[RetrievedChunk]:
        query_vector = self._embedding_model.embed(query)
        if not any(query_vector):
            return []
        scored = []
        for chunk in self._knowledge_base.chunks():
            chunk_vector = self._embedding_model.embed(f"{chunk.title}\n{chunk.content}")
            score = self._cosine(query_vector, chunk_vector)
            if score > 0:
                scored.append(
                    RetrievedChunk(
                        chunk_id=chunk.chunk_id,
                        doc_id=chunk.doc_id,
                        title=chunk.title,
                        snippet=self._snippet(chunk.content),
                        score=score,
                    )
                )
        return sorted(scored, key=lambda chunk: chunk.score, reverse=True)[:limit]

    def _cosine(self, left: list[float], right: list[float]) -> float:
        return sum(left_value * right_value for left_value, right_value in zip(left, right))

    def _snippet(self, content: str) -> str:
        stripped = content.strip()
        return stripped if len(stripped) <= 180 else f"{stripped[:177]}..."


class HybridRetriever:
    def __init__(
        self,
        *,
        lexical_retriever: BM25Retriever,
        dense_retriever: LocalVectorRetriever,
    ) -> None:
        self._lexical_retriever = lexical_retriever
        self._dense_retriever = dense_retriever
        self._analyzer = TermAnalyzer()

    @classmethod
    def from_knowledge_base(cls, knowledge_base: KnowledgeBase) -> "HybridRetriever":
        return cls(
            lexical_retriever=BM25Retriever(knowledge_base),
            dense_retriever=LocalVectorRetriever(knowledge_base),
        )

    def retrieve(self, query: str, limit: int = 3) -> list[RetrievedChunk]:
        query_terms = set(self._analyzer.terms(query))
        if not query_terms:
            return []

        lexical = self._lexical_retriever.retrieve(query, limit=max(limit * 4, 8))
        dense = self._dense_retriever.retrieve(query, limit=max(limit * 4, 8))
        candidates: dict[str, RetrievedChunk] = {}
        source_scores: dict[str, dict[str, float]] = {"lexical": {}, "dense": {}}

        for chunk in lexical:
            candidates[chunk.chunk_id] = chunk
            source_scores["lexical"][chunk.chunk_id] = chunk.score
        for chunk in dense:
            candidates.setdefault(chunk.chunk_id, chunk)
            source_scores["dense"][chunk.chunk_id] = chunk.score

        lexical_max = max(source_scores["lexical"].values(), default=1.0)
        dense_max = max(source_scores["dense"].values(), default=1.0)
        reranked = []
        for chunk_id, chunk in candidates.items():
            evidence_terms = set(self._analyzer.terms(f"{chunk.title} {chunk.snippet}"))
            coverage = len(query_terms.intersection(evidence_terms)) / len(query_terms)
            if coverage <= 0:
                continue
            title_terms = set(self._analyzer.terms(chunk.title))
            title_overlap = len(query_terms.intersection(title_terms)) / len(query_terms)
            lexical_score = source_scores["lexical"].get(chunk_id, 0.0) / lexical_max
            dense_score = source_scores["dense"].get(chunk_id, 0.0) / dense_max
            score = (
                0.55 * lexical_score
                + 0.25 * dense_score
                + 0.15 * coverage
                + 0.05 * title_overlap
            )
            if score > 0:
                reranked.append(
                    RetrievedChunk(
                        chunk_id=chunk.chunk_id,
                        doc_id=chunk.doc_id,
                        title=chunk.title,
                        snippet=chunk.snippet,
                        score=round(score, 6),
                    )
                )

        return sorted(reranked, key=lambda chunk: chunk.score, reverse=True)[:limit]
