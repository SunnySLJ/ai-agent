from __future__ import annotations

from agent_platform.models import AgentResponse, EvaluationSummary


class EvaluationRecorder:
    def __init__(self) -> None:
        self._runs: list[AgentResponse] = []

    def record(self, response: AgentResponse) -> None:
        self._runs.append(response)

    def summary(self) -> EvaluationSummary:
        total = len(self._runs)
        refusal_count = sum(1 for run in self._runs if run.refused)
        tool_call_count = sum(len(run.trace.tool_calls) for run in self._runs)
        tool_success_count = sum(
            1
            for run in self._runs
            for call in run.trace.tool_calls
            if call.success
        )
        average_latency_ms = (
            sum(run.trace.latency_ms for run in self._runs) / total if total else 0
        )
        return EvaluationSummary(
            total_runs=total,
            refusal_count=refusal_count,
            tool_call_count=tool_call_count,
            tool_success_count=tool_success_count,
            average_latency_ms=average_latency_ms,
        )

