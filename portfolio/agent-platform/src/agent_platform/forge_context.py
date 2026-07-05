from __future__ import annotations

from typing import Any


def extract_prior_stage_markdown(
    prior_run: dict[str, Any],
    *,
    stage_ids: tuple[str, ...] = ("architecture", "prd"),
    max_chars_per_stage: int = 2000,
) -> dict[str, str]:
    stages = {
        stage["stage_id"]: stage
        for stage in prior_run.get("stages", [])
        if isinstance(stage, dict) and stage.get("stage_id")
    }
    extracted: dict[str, str] = {}
    for stage_id in stage_ids:
        stage = stages.get(stage_id)
        if not stage:
            continue
        markdown = str(stage.get("markdown", "")).strip()
        if markdown:
            extracted[stage_id] = markdown[:max_chars_per_stage]
    return extracted


def summarize_prior_run_context(
    prior_run: dict[str, Any],
    *,
    max_chars: int = 3200,
) -> str:
    idea = str(prior_run.get("idea", "")).strip()
    run_id = str(prior_run.get("run_id", "")).strip()
    extracted = extract_prior_stage_markdown(prior_run)

    if not extracted and not idea:
        return ""

    lines = ["# 上一轮 Forge 上下文", ""]
    if run_id:
        lines.append(f"- 来源 run_id: `{run_id}`")
    if idea:
        lines.append(f"- 上一轮想法: {idea}")
    lines.append("")

    labels = {
        "architecture": "架构 ADR",
        "prd": "PRD",
        "solution": "解决方案",
    }
    for stage_id, markdown in extracted.items():
        label = labels.get(stage_id, stage_id)
        lines.extend([f"## {label}", "", markdown, ""])

    context = "\n".join(lines).strip()
    if len(context) > max_chars:
        return context[:max_chars] + "\n\n...(已截断)"
    return context


def inject_prior_context(markdown: str, prior_context: str) -> str:
    if not prior_context.strip():
        return markdown
    return (
        f"{markdown.rstrip()}\n\n"
        f"---\n\n"
        f"## 继承上一轮决策\n\n"
        f"{prior_context.strip()}\n"
    )
