from __future__ import annotations

from agent_platform.models import ToolCall


class NoOpToolRegistry:
    """RAG-only mode: no external or mock business tools are registered."""

    def names(self) -> list[str]:
        return []

    def invoke(self, question: str) -> list[ToolCall]:
        return []

    def plan(self, question: str) -> list[dict[str, object]]:
        return []

    def requires_approval(self, question: str) -> dict[str, object] | None:
        return None
