from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

from agent_eval_dashboard.runner import seed_demo_documents
from agent_platform.agent import AgentPlatform
from agent_platform.knowledge_base import KnowledgeBase
from agent_platform.retrieval import BM25Retriever, HybridRetriever, KeywordRetriever


@dataclass(frozen=True)
class RetrievalEvalCase:
    id: str
    query: str
    expected_doc_id: str
    tags: list[str]


@dataclass(frozen=True)
class RetrievalModeResult:
    case_id: str
    mode: str
    query: str
    expected_doc_id: str
    top_doc_ids: list[str]
    hit: bool
    reciprocal_rank: float
    tags: list[str]


def load_retrieval_dataset(path: str | Path) -> list[RetrievalEvalCase]:
    dataset_path = Path(path)
    cases: list[RetrievalEvalCase] = []
    for line_number, line in enumerate(dataset_path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        payload = json.loads(line)
        cases.append(
            RetrievalEvalCase(
                id=_required_string(payload, "id", line_number),
                query=_required_string(payload, "query", line_number),
                expected_doc_id=_required_string(payload, "expected_doc_id", line_number),
                tags=_string_list(payload.get("tags", []), line_number),
            )
        )
    return cases


def run_retrieval_eval(dataset_path: str | Path, *, limit: int = 3) -> dict[str, Any]:
    cases = load_retrieval_dataset(dataset_path)
    knowledge_base = KnowledgeBase()
    seed_demo_documents(
        AgentPlatform(
            knowledge_base=knowledge_base,
            retriever=KeywordRetriever(knowledge_base),
            tools=_NoopTools(),
            recorder=_NoopRecorder(),
        )
    )
    retrievers = {
        "keyword": KeywordRetriever(knowledge_base),
        "hybrid": HybridRetriever.from_knowledge_base(knowledge_base),
    }
    results = [
        _score_case(case, mode, retriever, limit)
        for case in cases
        for mode, retriever in retrievers.items()
    ]
    return {
        "summary": _summarize(cases, results),
        "results": [asdict(result) for result in results],
    }


def render_retrieval_markdown(report: dict[str, Any]) -> str:
    lines = [
        "# Retrieval Eval Report",
        "",
        "## Metrics",
        "",
        "| Mode | Hit rate | MRR |",
        "|---|---:|---:|",
    ]
    for mode, metrics in report["summary"]["modes"].items():
        lines.append(
            f"| {mode} | {_percent(metrics['hit_rate'])} | {metrics['mrr']:.3f} |"
        )

    lines.extend(
        [
            "",
            "## Cases",
            "",
            "| Case | Mode | Expected doc | Hit | Reciprocal rank | Top docs |",
            "|---|---|---|---:|---:|---|",
        ]
    )
    for result in report["results"]:
        hit = "yes" if result["hit"] else "no"
        top_docs = ", ".join(result["top_doc_ids"]) if result["top_doc_ids"] else "-"
        lines.append(
            "| {case_id} | {mode} | {expected_doc_id} | {hit} | {reciprocal_rank:.3f} | {top_docs} |".format(
                case_id=result["case_id"],
                mode=result["mode"],
                expected_doc_id=result["expected_doc_id"],
                hit=hit,
                reciprocal_rank=result["reciprocal_rank"],
                top_docs=top_docs,
            )
        )
    return "\n".join(lines) + "\n"


def write_retrieval_report_files(
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
    md_path.write_text(render_retrieval_markdown(report), encoding="utf-8")


def _score_case(
    case: RetrievalEvalCase,
    mode: str,
    retriever,
    limit: int,
) -> RetrievalModeResult:
    chunks = retriever.retrieve(case.query, limit=limit)
    top_doc_ids = [chunk.doc_id for chunk in chunks]
    reciprocal_rank = 0.0
    for index, doc_id in enumerate(top_doc_ids, 1):
        if doc_id == case.expected_doc_id:
            reciprocal_rank = 1 / index
            break
    return RetrievalModeResult(
        case_id=case.id,
        mode=mode,
        query=case.query,
        expected_doc_id=case.expected_doc_id,
        top_doc_ids=top_doc_ids,
        hit=reciprocal_rank > 0,
        reciprocal_rank=reciprocal_rank,
        tags=list(case.tags),
    )


def _summarize(
    cases: list[RetrievalEvalCase],
    results: list[RetrievalModeResult],
) -> dict[str, Any]:
    modes = sorted({result.mode for result in results})
    mode_metrics = {}
    for mode in modes:
        mode_results = [result for result in results if result.mode == mode]
        hit_count = sum(1 for result in mode_results if result.hit)
        reciprocal_rank_total = sum(result.reciprocal_rank for result in mode_results)
        mode_metrics[mode] = {
            "hit_count": hit_count,
            "hit_rate": hit_count / len(cases) if cases else 0,
            "mrr": reciprocal_rank_total / len(cases) if cases else 0,
        }
    return {
        "total_cases": len(cases),
        "modes": mode_metrics,
    }


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


class _NoopTools:
    def invoke(self, question: str) -> list:
        return []

    def names(self) -> list[str]:
        return []


class _NoopRecorder:
    def record(self, response) -> None:
        return None

    def summary(self):
        return None
