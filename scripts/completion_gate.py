from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path
from typing import Callable


CommandRunner = Callable[[list[str]], str]

SKILL_ID_PATTERN = re.compile(r"^[A-Z]\d{2}$")
VALID_STATUSES = {"作品证据", "已掌握", "学习中", "待补"}
MIN_P0_SKILLS_REVIEWED = 40


def evaluate_completion_gate(
    root: str | Path = ".",
    *,
    command_runner: CommandRunner | None = None,
) -> dict[str, object]:
    project_root = Path(root)
    run = command_runner or _run_command
    blockers: list[dict[str, str]] = []

    git_ahead, git_behind = _git_ahead_behind(run)
    unpushed_commits = _git_unpushed_commits(run) if git_ahead > 0 else []
    if git_ahead > 0:
        blockers.append(
            {
                "id": "git_unpushed_commits",
                "message": f"本地 main 还有 {git_ahead} 个提交未推送到 origin/main。",
            }
        )
    if git_behind > 0:
        blockers.append(
            {
                "id": "git_behind_origin",
                "message": f"本地 main 落后 origin/main {git_behind} 个提交，需要先同步。",
            }
        )

    workflow_scope = _has_workflow_scope(run)
    if not workflow_scope:
        blockers.append(
            {
                "id": "github_workflow_scope_missing",
                "message": "GitHub CLI token 缺少 workflow scope，不能推送 GitHub Actions workflow。",
            }
        )

    skills_review = _count_skills_gap_review(project_root)
    p0_reviewed = skills_review["p0_reviewed"]
    if p0_reviewed < MIN_P0_SKILLS_REVIEWED:
        blockers.append(
            {
                "id": "skills_gap_review_missing",
                "message": (
                    f"技能差距复盘只有 {p0_reviewed} 条 P0 技能已评估，"
                    f"需要至少 {MIN_P0_SKILLS_REVIEWED} 条。"
                ),
            }
        )
    next_actions = _next_actions(
        git_ahead=git_ahead,
        workflow_scope=workflow_scope,
        p0_reviewed=p0_reviewed,
    )

    return {
        "complete": not blockers,
        "blockers": blockers,
        "skills_reviewed_rows": skills_review["total_reviewed"],
        "p0_skills_reviewed": p0_reviewed,
        "git_ahead": git_ahead,
        "git_behind": git_behind,
        "unpushed_commits": unpushed_commits,
        "workflow_scope": workflow_scope,
        "next_actions": next_actions,
    }


def render_markdown(result: dict[str, object]) -> str:
    lines = [
        "# Final Completion Gate",
        "",
        f"- Complete: {'yes' if result['complete'] else 'no'}",
        f"- Git ahead: {result['git_ahead']}",
        f"- Git behind: {result['git_behind']}",
        f"- GitHub workflow scope: {'yes' if result['workflow_scope'] else 'no'}",
        f"- Skills reviewed rows: {result['skills_reviewed_rows']}",
        f"- P0 skills reviewed: {result['p0_skills_reviewed']}",
        "",
        "## Unpushed Commits",
        "",
    ]
    unpushed_commits = result.get("unpushed_commits", [])
    if unpushed_commits:
        for commit in unpushed_commits:
            lines.append(f"- {commit}")
    else:
        lines.append("- None.")
    lines.extend(
        [
            "",
            "## Next Actions",
            "",
        ]
    )
    next_actions = result.get("next_actions", [])
    if next_actions:
        for action in next_actions:
            lines.append(f"- `{action}`")
    else:
        lines.append("- None.")
    lines.extend(
        [
            "",
            "## Blockers",
            "",
        ]
    )
    blockers = result["blockers"]
    if blockers:
        for blocker in blockers:
            lines.append(f"- `{blocker['id']}`: {blocker['message']}")
    else:
        lines.append("- None.")
    return "\n".join(lines) + "\n"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Check final project completion gates.")
    parser.add_argument("--root", default=".")
    parser.add_argument("--json", action="store_true", help="Print JSON instead of Markdown.")
    args = parser.parse_args(argv)

    result = evaluate_completion_gate(args.root)
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(render_markdown(result), end="")
    return 0 if result["complete"] else 1


def _git_ahead_behind(run: CommandRunner) -> tuple[int, int]:
    try:
        output = run(["git", "rev-list", "--left-right", "--count", "origin/main...main"])
    except Exception:
        return 0, 0
    parts = output.strip().split()
    if len(parts) != 2:
        return 0, 0
    behind, ahead = int(parts[0]), int(parts[1])
    return ahead, behind


def _git_unpushed_commits(run: CommandRunner) -> list[str]:
    try:
        output = run(["git", "log", "--oneline", "origin/main..main"])
    except Exception:
        return []
    return [line.strip() for line in output.splitlines() if line.strip()]


def _has_workflow_scope(run: CommandRunner) -> bool:
    try:
        output = run(["gh", "auth", "status"])
    except Exception:
        return False
    return "workflow" in output


def _next_actions(
    *,
    git_ahead: int,
    workflow_scope: bool,
    p0_reviewed: int,
) -> list[str]:
    actions: list[str] = []
    if not workflow_scope:
        actions.append("gh auth refresh -h github.com -s workflow")
    if git_ahead > 0:
        actions.append("git push origin main")
    if p0_reviewed < MIN_P0_SKILLS_REVIEWED:
        actions.append(
            "对照 docs/09-job-skills-matrix.md 填写 logs/applications/skills-gap-review.md，"
            f"至少评估 {MIN_P0_SKILLS_REVIEWED} 条 P0 技能"
        )
    return actions


def _count_skills_gap_review(project_root: Path) -> dict[str, int]:
    logs_dir = project_root / "logs" / "applications"
    if not logs_dir.exists():
        return {"total_reviewed": 0, "p0_reviewed": 0}

    paths = sorted(logs_dir.glob("*skills-gap-review.md"))
    if not paths:
        return {"total_reviewed": 0, "p0_reviewed": 0}

    total_reviewed = 0
    p0_reviewed = 0
    for path in paths:
        for line in path.read_text(encoding="utf-8").splitlines():
            columns = [column.strip() for column in line.strip().strip("|").split("|")]
            if len(columns) < 4:
                continue
            skill_id = columns[0]
            if not SKILL_ID_PATTERN.match(skill_id):
                continue
            if len(columns) >= 6:
                priority = columns[2]
                status = columns[3]
            elif len(columns) == 5:
                priority = ""
                status = columns[2]
            else:
                priority = ""
                status = columns[2]
            if status not in VALID_STATUSES:
                continue
            total_reviewed += 1
            if priority == "P0":
                p0_reviewed += 1
    return {"total_reviewed": total_reviewed, "p0_reviewed": p0_reviewed}


def _run_command(command: list[str]) -> str:
    completed = subprocess.run(
        command,
        check=True,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    return completed.stdout


if __name__ == "__main__":
    raise SystemExit(main())
