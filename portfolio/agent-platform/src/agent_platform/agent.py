from __future__ import annotations

import time

from agent_platform.evaluation import EvaluationRecorder
from agent_platform.knowledge_base import KnowledgeBase
from agent_platform.models import (
    AgentResponse,
    AgentTrace,
    Citation,
    Document,
    EvaluationSummary,
    RetrievedChunk,
    ToolCall,
)
from agent_platform.retrieval import KeywordRetriever
from agent_platform.tools import BusinessToolRegistry


class AgentPlatform:
    def __init__(
        self,
        knowledge_base: KnowledgeBase,
        retriever: KeywordRetriever,
        tools: BusinessToolRegistry,
        recorder: EvaluationRecorder,
    ) -> None:
        self._knowledge_base = knowledge_base
        self._retriever = retriever
        self._tools = tools
        self._recorder = recorder

    @classmethod
    def offline_demo(cls) -> "AgentPlatform":
        knowledge_base = KnowledgeBase()
        return cls(
            knowledge_base=knowledge_base,
            retriever=KeywordRetriever(knowledge_base),
            tools=BusinessToolRegistry(),
            recorder=EvaluationRecorder(),
        )

    def ingest(self, document: Document) -> None:
        self._knowledge_base.ingest(document)

    def ask(self, question: str) -> AgentResponse:
        started = time.perf_counter()
        chunks = self._retriever.retrieve(question)
        tool_calls = self._tools.invoke(question)
        answer, refused, confidence = self._compose(question, chunks, tool_calls)
        trace = AgentTrace(
            question=question,
            retrieved_chunks=chunks,
            tool_calls=tool_calls,
            model_response=answer,
            latency_ms=max(0, (time.perf_counter() - started) * 1000),
            estimated_tokens=self._estimate_tokens(question, answer, chunks),
        )
        response = AgentResponse(
            answer=answer,
            refused=refused,
            confidence=confidence,
            citations=[] if refused else self._citations(chunks),
            trace=trace,
        )
        self._recorder.record(response)
        return response

    def summary(self) -> EvaluationSummary:
        return self._recorder.summary()

    def _compose(
        self,
        question: str,
        chunks: list[RetrievedChunk],
        tool_calls: list[ToolCall],
    ) -> tuple[str, bool, float]:
        successful_tools = [call for call in tool_calls if call.success]
        if not chunks and not successful_tools:
            return "没有足够证据回答这个问题。请补充知识库资料或可调用业务工具。", True, 0

        parts: list[str] = []
        if chunks:
            top = chunks[0]
            parts.append(
                f"基于资料《{top.title}》：{top.snippet}"
            )
        if successful_tools:
            parts.append("工具结果：" + " ".join(call.result for call in successful_tools))
        confidence = max([chunk.score for chunk in chunks] or [0.8])
        return "\n".join(parts), False, confidence

    def _citations(self, chunks: list[RetrievedChunk]) -> list[Citation]:
        return [
            Citation(
                doc_id=chunk.doc_id,
                title=chunk.title,
                chunk_id=chunk.chunk_id,
                snippet=chunk.snippet,
                score=chunk.score,
            )
            for chunk in chunks
        ]

    def _estimate_tokens(
        self,
        question: str,
        answer: str,
        chunks: list[RetrievedChunk],
    ) -> int:
        chars = len(question) + len(answer) + sum(len(chunk.snippet) for chunk in chunks)
        return max(1, chars // 4)

