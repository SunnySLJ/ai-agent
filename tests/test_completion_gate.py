from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from scripts.completion_gate import evaluate_completion_gate, render_markdown


class CompletionGateTest(unittest.TestCase):
    def test_reports_blockers_when_repo_has_unpushed_commits_and_no_boss_log(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            root = Path(tmpdir)
            (root / "logs/applications").mkdir(parents=True)

            def command_runner(command: list[str]) -> str:
                if command[:3] == ["git", "rev-list", "--left-right"]:
                    return "0\t4\n"
                if command[:3] == ["git", "log", "--oneline"]:
                    return "abcd123 feat: local work\n"
                return "Token scopes: 'repo'\n"

            result = evaluate_completion_gate(
                root,
                command_runner=command_runner,
            )

        blocker_ids = {blocker["id"] for blocker in result["blockers"]}
        self.assertFalse(result["complete"])
        self.assertIn("git_unpushed_commits", blocker_ids)
        self.assertIn("github_workflow_scope_missing", blocker_ids)
        self.assertIn("boss_screening_missing", blocker_ids)
        self.assertEqual(["abcd123 feat: local work"], result["unpushed_commits"])
        self.assertIn(
            "gh auth refresh -h github.com -s workflow",
            result["next_actions"],
        )
        self.assertIn("git push origin main", result["next_actions"])
        self.assertIn(
            "Chrome 扩展可用且 BOSS 已登录后，按 logs/applications/YYYY-MM-DD-boss-screening.md 记录 20 个 BOSS 登录态岗位",
            result["next_actions"],
        )

    def test_accepts_boss_log_with_twenty_reviewed_rows_and_clean_push_state(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            root = Path(tmpdir)
            logs_dir = root / "logs/applications"
            logs_dir.mkdir(parents=True)
            rows = [
                "| 序号 | 搜索词 | 公司 | 岗位 | 薪资 | 地点 | 经验 | JD 关键词 | 匹配级别 | 风险点 | 下一步 |",
                "|---|---|---|---|---|---|---|---|---|---|---|",
            ]
            for index in range(1, 21):
                rows.append(
                    f"| {index} | AI Agent | 公司{index} | AI Agent 工程师 | 20K | 杭州 | 3-5年 | RAG,Agent | P0 | 无 | 沟通 |"
                )
            (logs_dir / "2026-06-26-boss-screening.md").write_text(
                "\n".join(rows),
                encoding="utf-8",
            )

            result = evaluate_completion_gate(
                root,
                command_runner=lambda command: "0\t0\n"
                if command[:3] == ["git", "rev-list", "--left-right"]
                else "Token scopes: 'repo', 'workflow'\n",
            )

        self.assertTrue(result["complete"])
        self.assertEqual([], result["blockers"])
        self.assertEqual(20, result["boss_reviewed_rows"])

    def test_render_markdown_lists_blockers(self):
        markdown = render_markdown(
            {
                "complete": False,
                "blockers": [
                    {"id": "boss_screening_missing", "message": "缺少 BOSS 复核。"},
                ],
                "boss_reviewed_rows": 0,
                "git_ahead": 0,
                "git_behind": 0,
                "workflow_scope": False,
                "unpushed_commits": ["abcd123 feat: local work"],
                "next_actions": [
                    "gh auth refresh -h github.com -s workflow",
                    "git push origin main",
                ],
            }
        )

        self.assertIn("Final Completion Gate", markdown)
        self.assertIn("boss_screening_missing", markdown)
        self.assertIn("缺少 BOSS 复核。", markdown)
        self.assertIn("abcd123 feat: local work", markdown)
        self.assertIn("gh auth refresh -h github.com -s workflow", markdown)


if __name__ == "__main__":
    unittest.main()
