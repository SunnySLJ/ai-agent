from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable

from agent_platform.models import AgentResponse, RetrievedChunk, ToolCall
from agent_platform.safety import SafetyVerdict, check_prompt_safety


GraphState = dict[str, Any]
GraphNode = Callable[[GraphState], GraphState]


@dataclass
class AgentGraph:
    """LangGraph-style state machine for the ask pipeline."""

    nodes: dict[str, GraphNode] = field(default_factory=dict)
    edges: dict[str, str] = field(default_factory=dict)
    entry_point: str = "safety"

    def add_node(self, name: str, handler: GraphNode) -> None:
        self.nodes[name] = handler

    def add_edge(self, source: str, target: str) -> None:
        self.edges[source] = target

    def run(self, initial_state: GraphState) -> GraphState:
        current = self.entry_point
        state = dict(initial_state)
        while current:
            handler = self.nodes[current]
            state = handler(state)
            if state.get("halt"):
                break
            current = self.edges.get(current, "")
        return state


def build_ask_graph(
    *,
    retrieve: Callable[[str], list[RetrievedChunk]],
    invoke_tools: Callable[[str], list[ToolCall]],
    compose: Callable[[str, list[RetrievedChunk], list[ToolCall]], tuple[str, bool, float]],
) -> AgentGraph:
    graph = AgentGraph()

    def safety_node(state: GraphState) -> GraphState:
        safety: SafetyVerdict = check_prompt_safety(state["question"])
        state["safety"] = safety
        if safety.blocked:
            state["halt"] = True
            state["refused"] = True
            state["answer"] = (
                "检测到潜在 Prompt 注入或越权请求，已拒绝执行。请改写问题后重试。"
            )
            state["confidence"] = 0.0
            state["chunks"] = []
            state["tool_calls"] = []
        return state

    def retrieve_node(state: GraphState) -> GraphState:
        question = state["effective_question"]
        state["chunks"] = retrieve(question)
        return state

    def tools_node(state: GraphState) -> GraphState:
        question = state["effective_question"]
        state["tool_calls"] = invoke_tools(question)
        return state

    def compose_node(state: GraphState) -> GraphState:
        answer, refused, confidence = compose(
            state["effective_question"],
            state.get("chunks", []),
            state.get("tool_calls", []),
        )
        state["answer"] = answer
        state["refused"] = refused
        state["confidence"] = confidence
        return state

    graph.add_node("safety", safety_node)
    graph.add_node("retrieve", retrieve_node)
    graph.add_node("tools", tools_node)
    graph.add_node("compose", compose_node)
    graph.add_edge("safety", "retrieve")
    graph.add_edge("retrieve", "tools")
    graph.add_edge("tools", "compose")
    return graph


def run_ask_graph(
    graph: AgentGraph,
    *,
    question: str,
    effective_question: str,
) -> GraphState:
    return graph.run(
        {
            "question": question,
            "effective_question": effective_question,
            "chunks": [],
            "tool_calls": [],
        }
    )
