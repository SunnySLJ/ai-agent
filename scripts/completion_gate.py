from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path
from typing import Callable


CommandRunner = Callable[[list[str]], str]


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

    boss_reviewed_rows = _count_boss_screening_rows(project_root)
    if boss_reviewed_rows < 20:
        blockers.append(
            {
                "id": "boss_screening_missing",
                "message": f"BOSS 登录态岗位复核只有 {boss_reviewed_rows} 条，需要至少 20 条。",
            }
        )
    next_actions = _next_actions(
        git_ahead=git_ahead,
        workflow_scope=workflow_scope,
        boss_reviewed_rows=boss_reviewed_rows,
    )

    return {
        "complete": not blockers,
        "blockers": blockers,
        "boss_reviewed_rows": boss_reviewed_rows,
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
        f"- BOSS reviewed rows: {result['boss_reviewed_rows']}",
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
    boss_reviewed_rows: int,
) -> list[str]:
    actions: list[str] = []
    if not workflow_scope:
        actions.append("gh auth refresh -h github.com -s workflow")
    if git_ahead > 0:
        actions.append("git push origin main")
    if boss_reviewed_rows < 20:
        actions.append("Chrome 扩展可用且 BOSS 已登录后，按 logs/applications/YYYY-MM-DD-boss-screening.md 记录 20 个 BOSS 登录态岗位")
    return actions


def _count_boss_screening_rows(project_root: Path) -> int:
    logs_dir = project_root / "logs" / "applications"
    if not logs_dir.exists():
        return 0
    reviewed = 0
    for path in logs_dir.glob("*-boss-screening.md"):
        for line in path.read_text(encoding="utf-8").splitlines():
            columns = [column.strip() for column in line.strip().strip("|").split("|")]
            if len(columns) < 11:
                continue
            if not columns[0].isdigit():
                continue
            required = columns[1:9]
            if all(required):
                reviewed += 1
    return reviewed


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
