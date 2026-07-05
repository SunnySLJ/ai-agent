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
    agent = platform or AgentPlatform.offline_demo(human_in_the_loop=False)
    seed_demo_documents(agent)
    results = [score_response(case, agent.ask(case.question)) for case in cases]
    return {
        "summary": summarize(results),
        "results": [asdict(result) for result in results],
    }


def seed_demo_documents(platform: AgentPlatform) -> None:
    platform.ingest(
        Document(
            doc_id="agent-platform-architecture",
            title="Agent Platform Architecture",
            content=(
                "Python Agent 平台专注企业知识库 RAG：文档入库、混合检索、"
                "带 citation 的回答、低证据拒答和 trace 评估。"
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
    platform.ingest(
        Document(
            doc_id="agent-trace-observability",
            title="Agent Trace Observability",
            content=(
                "Agent trace 记录 question、retrieved chunks、tool calls、"
                "model response、latency、estimated tokens 和 failure category，"
                "用于回放工具调用、定位问题和优化评估。"
            ),
        )
    )
    platform.ingest(
        Document(
            doc_id="citation-and-refusal",
            title="Citation and Refusal Policy",
            content=(
                "企业知识库答案必须提供引用来源。低证据、实时未知、"
                "预测性或不在知识库和工具范围内的问题应该拒答，避免幻觉。"
            ),
        )
    )
    platform.ingest(
        Document(
            doc_id="tool-contract-runtime",
            title="Tool Contract Runtime",
            content=(
                "MCP 和 OpenAPI 可描述 Agent Platform 的 HTTP 契约。"
                "Docker Compose 负责一键启动 Python Agent API 和 Qdrant。"
            ),
        )
    )
    platform.ingest(
        Document(
            doc_id="cost-control",
            title="Agent Cost Control",
            content=(
                "Agent 项目通过 token 预算、检索上下文压缩、缓存、模型路由、"
                "降级策略和 eval dataset 控制成本。"
            ),
        )
    )
    platform.ingest(
        Document(
            doc_id="document-parsing",
            title="Document Parsing Pipeline",
            content=(
                "PDF 和 Markdown 文档通过 document_parser 解析为纯文本，"
                "再由 knowledge_base 递归切分后入库，供 RAG 检索引用。"
            ),
        )
    )
    platform.ingest(
        Document(
            doc_id="hybrid-retrieval",
            title="Hybrid Retrieval Strategy",
            content=(
                "混合检索融合 BM25 关键词分数与向量相似度，"
                "比纯关键词检索更稳，能覆盖同义表达并提升 citation 命中率。"
            ),
        )
    )
    platform.ingest(
        Document(
            doc_id="streaming-and-sse",
            title="Streaming and SSE",
            content=(
                "SSE 流式问答通过 POST /ask/stream 返回 meta、token、done 事件，"
                "前端可逐字显示 Agent 回答并保留 citation 与 tool trace。"
            ),
        )
    )
    platform.ingest(
        Document(
            doc_id="project-forge",
            title="ProjectForge Workflow",
            content=(
                "ProjectForge 九阶段流水线包含需求调研、画面原型、架构选项、"
                "解决方案、PRD 书写、代码开发、测试、上线部署和复盘。"
            ),
        )
    )
    platform.ingest(
        Document(
            doc_id="verified-knowledge",
            title="Verified Knowledge Base",
            content=(
                "查证型知识库通过 Claim-Evidence 对齐核验架构和 PRD 断言，"
                "降低幻觉并在低置信时建议拒答或人工复核。"
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
