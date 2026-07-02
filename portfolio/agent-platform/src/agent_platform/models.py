from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class Document:
    doc_id: str
    title: str
    content: str


@dataclass(frozen=True)
class RetrievedChunk:
    chunk_id: str
    doc_id: str
    title: str
    snippet: str
    score: float


@dataclass(frozen=True)
class Citation:
    doc_id: str
    title: str
    chunk_id: str
    snippet: str
    score: float


@dataclass(frozen=True)
class ToolCall:
    name: str
    arguments: dict[str, str]
    result: str
    success: bool


@dataclass(frozen=True)
class AgentTrace:
    question: str
    retrieved_chunks: list[RetrievedChunk] = field(default_factory=list)
    tool_calls: list[ToolCall] = field(default_factory=list)
    model_response: str = ""
    latency_ms: float = 0
    estimated_tokens: int = 0
    session_id: str | None = None
    safety_blocked: bool = False
    approval_required: bool = False
    approval_id: str | None = None


@dataclass(frozen=True)
class AgentResponse:
    answer: str
    refused: bool
    confidence: float
    citations: list[Citation]
    trace: AgentTrace
    session_id: str | None = None
    safety_blocked: bool = False
    approval_required: bool = False
    approval_id: str | None = None


@dataclass(frozen=True)
class EvaluationSummary:
    total_runs: int
    refusal_count: int
    tool_call_count: int
    tool_success_count: int
    average_latency_ms: float

