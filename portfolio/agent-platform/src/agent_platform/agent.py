from __future__ import annotations

import time
from collections.abc import Iterator
from typing import Protocol

from agent_platform.embeddings import EmbeddingModel
from agent_platform.evaluation import EvaluationRecorder
from agent_platform.graph_orchestrator import build_ask_graph, run_ask_graph
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
from agent_platform.retrieval import HybridRetriever, KeywordRetriever
from agent_platform.java_tools import JavaBusinessToolRegistry
from agent_platform.approval import ApprovalStore
from agent_platform.chunking import ChunkingStrategy
from agent_platform.safety import check_prompt_safety
from agent_platform.session import SessionStore
from agent_platform.streaming import format_sse, iter_text_deltas, to_json
from agent_platform.tools import BusinessToolRegistry
from agent_platform.vector_store import QdrantRetriever, QdrantVectorIndex


class AnswerGenerator(Protocol):
    def generate_answer(
        self,
        question: str,
        chunks: list[RetrievedChunk],
        tool_calls: list[ToolCall],
    ) -> str:
        ...


class AgentPlatform:
    def __init__(
        self,
        knowledge_base: KnowledgeBase,
        retriever: KeywordRetriever,
        tools,
        recorder: EvaluationRecorder,
        answer_generator: AnswerGenerator | None = None,
        session_store: SessionStore | None = None,
        approval_store: ApprovalStore | None = None,
        human_in_the_loop: bool = True,
    ) -> None:
        self._knowledge_base = knowledge_base
        self._retriever = retriever
        self._tools = tools
        self._recorder = recorder
        self._answer_generator = answer_generator
        self._session_store = session_store or SessionStore()
        self._approval_store = approval_store or ApprovalStore()
        self._human_in_the_loop = human_in_the_loop
        self._graph = build_ask_graph(
            retrieve=self._retriever.retrieve,
            invoke_tools=self._tools.invoke,
            compose=self._compose,
        )

    @classmethod
    def offline_demo(
        cls,
        answer_generator: AnswerGenerator | None = None,
        session_store: SessionStore | None = None,
        approval_store: ApprovalStore | None = None,
        human_in_the_loop: bool = True,
        embedding_model: EmbeddingModel | None = None,
        chunking_strategy: ChunkingStrategy = ChunkingStrategy.RECURSIVE,
    ) -> "AgentPlatform":
        knowledge_base = KnowledgeBase(chunking_strategy=chunking_strategy)
        return cls(
            knowledge_base=knowledge_base,
            retriever=HybridRetriever.from_knowledge_base(
                knowledge_base,
                embedding_model=embedding_model,
            ),
            tools=BusinessToolRegistry(),
            recorder=EvaluationRecorder(),
            answer_generator=answer_generator,
            session_store=session_store,
            approval_store=approval_store,
            human_in_the_loop=human_in_the_loop,
        )

    @classmethod
    def with_java_tools(
        cls,
        base_url: str,
        answer_generator: AnswerGenerator | None = None,
        session_store: SessionStore | None = None,
        approval_store: ApprovalStore | None = None,
        human_in_the_loop: bool = True,
        embedding_model: EmbeddingModel | None = None,
        chunking_strategy: ChunkingStrategy = ChunkingStrategy.RECURSIVE,
    ) -> "AgentPlatform":
        knowledge_base = KnowledgeBase(chunking_strategy=chunking_strategy)
        return cls(
            knowledge_base=knowledge_base,
            retriever=HybridRetriever.from_knowledge_base(
                knowledge_base,
                embedding_model=embedding_model,
            ),
            tools=JavaBusinessToolRegistry(base_url),
            recorder=EvaluationRecorder(),
            answer_generator=answer_generator,
            session_store=session_store,
            approval_store=approval_store,
            human_in_the_loop=human_in_the_loop,
        )

    @classmethod
    def with_qdrant(
        cls,
        index: QdrantVectorIndex,
        tools=None,
        answer_generator: AnswerGenerator | None = None,
        session_store: SessionStore | None = None,
        approval_store: ApprovalStore | None = None,
        human_in_the_loop: bool = True,
        chunking_strategy: ChunkingStrategy = ChunkingStrategy.RECURSIVE,
    ) -> "AgentPlatform":
        knowledge_base = KnowledgeBase(chunking_strategy=chunking_strategy)
        return cls(
            knowledge_base=knowledge_base,
            retriever=QdrantRetriever(index),
            tools=tools or BusinessToolRegistry(),
            recorder=EvaluationRecorder(),
            answer_generator=answer_generator,
            session_store=session_store,
            approval_store=approval_store,
            human_in_the_loop=human_in_the_loop,
        )

    def ingest(self, document: Document) -> None:
        self._knowledge_base.ingest(document)
        index_chunks = getattr(self._retriever, "index_chunks", None)
        if index_chunks:
            index_chunks(self._knowledge_base.chunks())

    def ask(self, question: str, session_id: str | None = None) -> AgentResponse:
        started = time.perf_counter()
        session = self._session_store.get_or_create(session_id)
        effective_question = self._with_session_context(question, session)

        pending = self._pending_approval(effective_question, session.session_id)
        if pending is not None:
            answer = (
                f"写操作 `{pending.tool_name}` 需要人工确认。"
                f"请调用 POST /approvals/{pending.approval_id}/confirm 完成确认。"
            )
            trace = AgentTrace(
                question=question,
                model_response=answer,
                latency_ms=max(0, (time.perf_counter() - started) * 1000),
                estimated_tokens=self._estimate_tokens(question, answer, []),
                session_id=session.session_id,
                approval_required=True,
                approval_id=pending.approval_id,
            )
            response = AgentResponse(
                answer=answer,
                refused=False,
                confidence=0.0,
                citations=[],
                trace=trace,
                session_id=session.session_id,
                approval_required=True,
                approval_id=pending.approval_id,
            )
            self._recorder.record(response)
            return response

        graph_state = run_ask_graph(
            self._graph,
            question=question,
            effective_question=effective_question,
        )
        if graph_state.get("halt"):
            answer = graph_state["answer"]
            trace = AgentTrace(
                question=question,
                model_response=answer,
                latency_ms=max(0, (time.perf_counter() - started) * 1000),
                estimated_tokens=self._estimate_tokens(question, answer, []),
                session_id=session.session_id,
                safety_blocked=True,
            )
            response = AgentResponse(
                answer=answer,
                refused=True,
                confidence=0,
                citations=[],
                trace=trace,
                session_id=session.session_id,
                safety_blocked=True,
            )
            self._recorder.record(response)
            return response

        chunks = graph_state.get("chunks", [])
        tool_calls = graph_state.get("tool_calls", [])
        answer = graph_state["answer"]
        refused = graph_state["refused"]
        confidence = graph_state["confidence"]
        trace = AgentTrace(
            question=question,
            retrieved_chunks=chunks,
            tool_calls=tool_calls,
            model_response=answer,
            latency_ms=max(0, (time.perf_counter() - started) * 1000),
            estimated_tokens=self._estimate_tokens(question, answer, chunks),
            session_id=session.session_id,
        )
        response = AgentResponse(
            answer=answer,
            refused=refused,
            confidence=confidence,
            citations=[] if refused else self._citations(chunks),
            trace=trace,
            session_id=session.session_id,
        )
        if not refused:
            session.add_turn(question, answer)
        self._recorder.record(response)
        return response

    def ask_stream(
        self,
        question: str,
        session_id: str | None = None,
    ) -> Iterator[str]:
        started = time.perf_counter()
        session = self._session_store.get_or_create(session_id)
        effective_question = self._with_session_context(question, session)

        pending = self._pending_approval(effective_question, session.session_id)
        if pending is not None:
            response = self._build_response(
                question=question,
                answer=(
                    f"写操作 `{pending.tool_name}` 需要人工确认。"
                    f"请调用 POST /approvals/{pending.approval_id}/confirm 完成确认。"
                ),
                refused=False,
                confidence=0.0,
                citations=[],
                chunks=[],
                tool_calls=[],
                session=session,
                started=started,
                approval_required=True,
                approval_id=pending.approval_id,
            )
            yield from self._emit_response_stream(response)
            return

        safety = check_prompt_safety(question)
        if safety.blocked:
            response = self._build_response(
                question=question,
                answer="检测到潜在 Prompt 注入或越权请求，已拒绝执行。请改写问题后重试。",
                refused=True,
                confidence=0,
                citations=[],
                chunks=[],
                tool_calls=[],
                session=session,
                started=started,
                safety_blocked=True,
            )
            yield from self._emit_response_stream(response)
            return

        chunks, tool_calls, refused, confidence, fallback_answer = self._prepare_stream_context(
            effective_question
        )
        citations = [] if refused else self._citations(chunks)

        yield format_sse(
            "meta",
            {
                "session_id": session.session_id,
                "refused": refused,
                "confidence": confidence,
                "citations": to_json(citations),
                "tool_calls": to_json(tool_calls),
            },
        )

        answer_parts: list[str] = []
        successful_tools = [call for call in tool_calls if call.success]
        for delta in self._stream_answer_deltas(
            effective_question,
            chunks,
            successful_tools,
            fallback_answer,
            refused,
        ):
            answer_parts.append(delta)
            yield format_sse("token", {"delta": delta})

        answer = "".join(answer_parts) if answer_parts else fallback_answer
        response = self._build_response(
            question=question,
            answer=answer,
            refused=refused,
            confidence=confidence,
            citations=citations,
            chunks=chunks,
            tool_calls=tool_calls,
            session=session,
            started=started,
        )
        if not refused:
            session.add_turn(question, answer)
        self._recorder.record(response)
        yield format_sse("done", to_json(response))

    def confirm_approval(self, approval_id: str) -> AgentResponse:
        started = time.perf_counter()
        approval = self._approval_store.confirm(approval_id)
        if approval is None:
            answer = f"审批 {approval_id} 不存在或已确认。"
            trace = AgentTrace(
                question=approval_id,
                model_response=answer,
                latency_ms=max(0, (time.perf_counter() - started) * 1000),
                estimated_tokens=1,
            )
            return AgentResponse(
                answer=answer,
                refused=True,
                confidence=0,
                citations=[],
                trace=trace,
            )

        execute = getattr(self._tools, "execute", None)
        if execute is None:
            tool_call = ToolCall(
                name=approval.tool_name,
                arguments=approval.arguments,
                result="当前工具注册表不支持审批后执行。",
                success=False,
            )
        else:
            tool_call = execute(
                {"name": approval.tool_name, "arguments": approval.arguments}
            )

        answer = tool_call.result
        session = self._session_store.get_or_create(approval.session_id)
        trace = AgentTrace(
            question=approval.question,
            tool_calls=[tool_call],
            model_response=answer,
            latency_ms=max(0, (time.perf_counter() - started) * 1000),
            estimated_tokens=self._estimate_tokens(approval.question, answer, []),
            session_id=session.session_id,
            approval_id=approval.approval_id,
        )
        response = AgentResponse(
            answer=answer,
            refused=not tool_call.success,
            confidence=0.8 if tool_call.success else 0,
            citations=[],
            trace=trace,
            session_id=session.session_id,
            approval_id=approval.approval_id,
        )
        if tool_call.success:
            session.add_turn(approval.question, answer)
        self._recorder.record(response)
        return response

    def get_approval(self, approval_id: str):
        return self._approval_store.get(approval_id)

    def get_session(self, session_id: str):
        return self._session_store.get(session_id)

    def summary(self) -> EvaluationSummary:
        return self._recorder.summary()

    def available_tools(self) -> list[str]:
        return self._tools.names()

    def _with_session_context(self, question: str, session) -> str:
        prefix = session.context_prefix()
        if not prefix:
            return question
        return f"{prefix}{question}"

    def _pending_approval(self, question: str, session_id: str | None):
        if not self._human_in_the_loop:
            return None
        requires_approval = getattr(self._tools, "requires_approval", None)
        if requires_approval is None:
            return None
        planned = requires_approval(question)
        if planned is None:
            return None
        return self._approval_store.create(
            question=question,
            tool_name=str(planned["name"]),
            arguments={key: str(value) for key, value in planned["arguments"].items()},
            session_id=session_id,
        )

    def _prepare_stream_context(
        self,
        effective_question: str,
    ) -> tuple[list[RetrievedChunk], list[ToolCall], bool, float, str]:
        chunks = self._retriever.retrieve(effective_question)
        tool_calls = self._tools.invoke(effective_question)
        successful_tools = [call for call in tool_calls if call.success]
        if not chunks and not successful_tools:
            return (
                chunks,
                tool_calls,
                True,
                0.0,
                "没有足够证据回答这个问题。请补充知识库资料或可调用业务工具。",
            )

        confidence = max([chunk.score for chunk in chunks] or [0.8])
        return (
            chunks,
            tool_calls,
            False,
            confidence,
            self._offline_answer_template(chunks, successful_tools),
        )

    def _offline_answer_template(
        self,
        chunks: list[RetrievedChunk],
        successful_tools: list[ToolCall],
    ) -> str:
        parts: list[str] = []
        if chunks:
            top = chunks[0]
            parts.append(f"基于资料《{top.title}》：{top.snippet}")
        if successful_tools:
            parts.append("工具结果：" + " ".join(call.result for call in successful_tools))
        return "\n".join(parts)

    def _compose(
        self,
        question: str,
        chunks: list[RetrievedChunk],
        tool_calls: list[ToolCall],
    ) -> tuple[str, bool, float]:
        successful_tools = [call for call in tool_calls if call.success]
        if not chunks and not successful_tools:
            return "没有足够证据回答这个问题。请补充知识库资料或可调用业务工具。", True, 0

        confidence = max([chunk.score for chunk in chunks] or [0.8])
        if self._answer_generator:
            return (
                self._answer_generator.generate_answer(question, chunks, successful_tools),
                False,
                confidence,
            )
        return self._offline_answer_template(chunks, successful_tools), False, confidence

    def _stream_answer_deltas(
        self,
        question: str,
        chunks: list[RetrievedChunk],
        successful_tools: list[ToolCall],
        fallback_answer: str,
        refused: bool,
    ) -> Iterator[str]:
        if refused:
            yield from iter_text_deltas(fallback_answer)
            return

        stream_answer = getattr(self._answer_generator, "stream_answer", None)
        if stream_answer is not None:
            yield from stream_answer(question, chunks, successful_tools)
            return

        yield from iter_text_deltas(fallback_answer)

    def _build_response(
        self,
        *,
        question: str,
        answer: str,
        refused: bool,
        confidence: float,
        citations: list[Citation],
        chunks: list[RetrievedChunk],
        tool_calls: list[ToolCall],
        session,
        started: float,
        safety_blocked: bool = False,
        approval_required: bool = False,
        approval_id: str | None = None,
    ) -> AgentResponse:
        trace = AgentTrace(
            question=question,
            retrieved_chunks=chunks,
            tool_calls=tool_calls,
            model_response=answer,
            latency_ms=max(0, (time.perf_counter() - started) * 1000),
            estimated_tokens=self._estimate_tokens(question, answer, chunks),
            session_id=session.session_id,
            safety_blocked=safety_blocked,
            approval_required=approval_required,
            approval_id=approval_id,
        )
        return AgentResponse(
            answer=answer,
            refused=refused,
            confidence=confidence,
            citations=citations,
            trace=trace,
            session_id=session.session_id,
            safety_blocked=safety_blocked,
            approval_required=approval_required,
            approval_id=approval_id,
        )

    def _emit_response_stream(self, response: AgentResponse) -> Iterator[str]:
        yield format_sse(
            "meta",
            {
                "session_id": response.session_id,
                "refused": response.refused,
                "confidence": response.confidence,
                "citations": to_json(response.citations),
                "tool_calls": to_json(response.trace.tool_calls),
                "safety_blocked": response.safety_blocked,
                "approval_required": response.approval_required,
                "approval_id": response.approval_id,
            },
        )
        for delta in iter_text_deltas(response.answer):
            yield format_sse("token", {"delta": delta})
        self._recorder.record(response)
        yield format_sse("done", to_json(response))

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
