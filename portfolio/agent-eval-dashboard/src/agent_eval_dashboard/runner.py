from __future__ import annotations

import json
from collections import Counter
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

from agent_platform.agent import AgentPlatform
from agent_platform.models import AgentResponse, Document


@dataclass(frozen=True)
class EvalCase:
    id: str
    question: str
    expected_behavior: str
    tags: list[str]


@dataclass(frozen=True)
class EvalResult:
    case_id: str
    question: str
    expected_behavior: str
    passed: bool
    failure_category: str
    answer: str
    refused: bool
    citation_count: int
    tool_calls: list[str]
    successful_tool_calls: int
    latency_ms: float
    estimated_tokens: int
    tags: list[str]


def load_dataset(path: str | Path) -> list[EvalCase]:
    dataset_path = Path(path)
    cases: list[EvalCase] = []
    for line_number, line in enumerate(dataset_path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        payload = json.loads(line)
        cases.append(
            EvalCase(
                id=_required_string(payload, "id", line_number),
                question=_required_string(payload, "question", line_number),
                expected_behavior=_required_string(
                    payload, "expected_behavior", line_number
                ),
                tags=_string_list(payload.get("tags", []), line_number),
            )
        )
    return cases


def run_eval(dataset_path: str | Path, platform: AgentPlatform | None = None) -> dict[str, Any]:
    cases = load_dataset(dataset_path)
    agent = platform or AgentPlatform.offline_demo()
    seed_demo_documents(agent)
    results = [score_response(case, agent.ask(case.question)) for case in cases]
    return {
        "summary": summarize(results),
        "results": [asdict(result) for result in results],
    }


def seed_demo_documents(platform: AgentPlatform) -> None:
    platform.ingest(
        Document(
            doc_id="hybrid-agent-architecture",
            title="Hybrid Agent Architecture",
            content=(
                "Python 负责 Agent、RAG、检索、引用、评估和工具编排；"
                "Java 负责订单、工单、权限、审计、幂等和稳定业务 API。"
            ),
        )
    )
    platform.ingest(
        Document(
            doc_id="rag-evaluation",
            title="RAG Evaluation",
            content=(
                "RAG 评估记录检索命中、引用覆盖、拒答、工具调用成功率、"
                "延迟、token 成本和失败分类。"
            ),
        )
    )


def score_response(case: EvalCase, response: AgentResponse) -> EvalResult:
    failure_category = _failure_category(case, response)
    tool_calls = response.trace.tool_calls
    return EvalResult(
        case_id=case.id,
        question=case.question,
        expected_behavior=case.expected_behavior,
        passed=failure_category == "passed",
        failure_category=failure_category,
        answer=response.answer,
        refused=response.refused,
        citation_count=len(response.citations),
        tool_calls=[call.name for call in tool_calls],
        successful_tool_calls=sum(1 for call in tool_calls if call.success),
        latency_ms=response.trace.latency_ms,
        estimated_tokens=response.trace.estimated_tokens,
        tags=list(case.tags),
    )


def summarize(results: list[EvalResult]) -> dict[str, Any]:
    total = len(results)
    pass_count = sum(1 for result in results if result.passed)
    refusal_count = sum(1 for result in results if result.refused)
    tool_call_count = sum(len(result.tool_calls) for result in results)
    tool_success_count = sum(result.successful_tool_calls for result in results)
    latency_total = sum(result.latency_ms for result in results)
    token_total = sum(result.estimated_tokens for result in results)
    failure_counts = Counter(result.failure_category for result in results)
    return {
        "total_cases": total,
        "pass_count": pass_count,
        "pass_rate": pass_count / total if total else 0,
        "refusal_rate": refusal_count / total if total else 0,
        "tool_call_count": tool_call_count,
        "tool_success_count": tool_success_count,
        "tool_success_rate": tool_success_count / tool_call_count
        if tool_call_count
        else 0,
        "average_latency_ms": latency_total / total if total else 0,
        "estimated_token_total": token_total,
        "failure_counts": dict(sorted(failure_counts.items())),
    }


def render_markdown(report: dict[str, Any]) -> str:
    summary = report["summary"]
    lines = [
        "# Agent Eval Report",
        "",
        "## Metrics",
        "",
        "| Metric | Value |",
        "|---|---:|",
        f"| Total cases | {summary['total_cases']} |",
        f"| Passed | {summary['pass_count']} |",
        f"| Pass rate | {_percent(summary['pass_rate'])} |",
        f"| Refusal rate | {_percent(summary['refusal_rate'])} |",
        f"| Tool success rate | {_percent(summary['tool_success_rate'])} |",
        f"| Average latency | {summary['average_latency_ms']:.2f} ms |",
        f"| Estimated tokens | {summary['estimated_token_total']} |",
        "",
        "## Failure Categories",
        "",
        "| Category | Count |",
        "|---|---:|",
    ]
    for category, count in summary["failure_counts"].items():
        lines.append(f"| {category} | {count} |")

    lines.extend(
        [
            "",
            "## Cases",
            "",
            "| Case | Expected | Passed | Failure | Citations | Tools |",
            "|---|---|---:|---|---:|---|",
        ]
    )
    for result in report["results"]:
        tools = ", ".join(result["tool_calls"]) if result["tool_calls"] else "-"
        passed = "yes" if result["passed"] else "no"
        lines.append(
            "| {case_id} | {expected_behavior} | {passed} | {failure_category} | "
            "{citation_count} | {tools} |".format(
                case_id=result["case_id"],
                expected_behavior=result["expected_behavior"],
                passed=passed,
                failure_category=result["failure_category"],
                citation_count=result["citation_count"],
                tools=tools,
            )
        )
    return "\n".join(lines) + "\n"


def write_report_files(
    report: dict[str, Any],
    *,
    json_out: str | Path,
    md_out: str | Path,
) -> None:
    json_path = Path(json_out)
    md_path = Path(md_out)
    json_path.parent.mkdir(parents=True, exist_ok=True)
    md_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    md_path.write_text(render_markdown(report), encoding="utf-8")


def _failure_category(case: EvalCase, response: AgentResponse) -> str:
    expected = case.expected_behavior
    successful_tools = [call for call in response.trace.tool_calls if call.success]
    if expected == "answer_with_citation":
        if response.refused:
            return "unexpected_refusal"
        if not response.citations:
            return "expected_citation_missing"
        return "passed"
    if expected == "tool_call":
        if response.refused:
            return "unexpected_refusal"
        if not response.trace.tool_calls:
            return "expected_tool_call_missing"
        if not successful_tools:
            return "tool_call_failed"
        return "passed"
    if expected == "refusal":
        return "passed" if response.refused else "expected_refusal_missing"
    return "unknown_expected_behavior"


def _required_string(payload: dict[str, Any], key: str, line_number: int) -> str:
    value = payload.get(key)
    if not isinstance(value, str) or not value:
        raise ValueError(f"Line {line_number}: {key} must be a non-empty string")
    return value


def _string_list(value: Any, line_number: int) -> list[str]:
    if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
        raise ValueError(f"Line {line_number}: tags must be a list of strings")
    return value


def _percent(value: float) -> str:
    return f"{value * 100:.1f}%"
