from __future__ import annotations

import json
import sys
import tempfile
import unittest
from collections import Counter
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DASHBOARD_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT / "agent-platform/src"))
sys.path.insert(0, str(DASHBOARD_ROOT / "src"))

from agent_eval_dashboard.runner import (  # noqa: E402
    EvalCase,
    load_dataset,
    render_markdown,
    run_eval,
    score_response,
    write_report_files,
)
from agent_eval_dashboard.cli import main as cli_main  # noqa: E402
from agent_platform.models import AgentResponse, AgentTrace  # noqa: E402


DATASET = PROJECT_ROOT / "agent-platform/data/eval_dataset.jsonl"


class AgentEvalDashboardTest(unittest.TestCase):
    def test_load_dataset_reads_current_eval_cases(self):
        cases = load_dataset(DATASET)

        self.assertGreaterEqual(len(cases), 20)
        self.assertEqual("eval-001", cases[0].id)
        self.assertEqual("answer_with_citation", cases[0].expected_behavior)
        self.assertIn("hybrid-stack", cases[0].tags)
        self.assertEqual(len(cases), len({case.id for case in cases}))

    def test_dataset_covers_core_behavior_classes(self):
        cases = load_dataset(DATASET)

        counts = Counter(case.expected_behavior for case in cases)

        self.assertGreaterEqual(counts["answer_with_citation"], 8)
        self.assertGreaterEqual(counts["tool_call"], 6)
        self.assertGreaterEqual(counts["refusal"], 4)

    def test_run_eval_scores_current_dataset(self):
        report = run_eval(DATASET)

        self.assertEqual(20, report["summary"]["total_cases"])
        self.assertEqual(20, report["summary"]["pass_count"])
        self.assertEqual(1.0, report["summary"]["pass_rate"])
        self.assertEqual(0.25, report["summary"]["refusal_rate"])
        self.assertEqual(1.0, report["summary"]["tool_success_rate"])
        self.assertEqual({"passed": 20}, report["summary"]["failure_counts"])

    def test_score_response_uses_stable_failure_category(self):
        case = EvalCase(
            id="eval-x",
            question="需要引用的问题",
            expected_behavior="answer_with_citation",
            tags=["regression"],
        )
        response = AgentResponse(
            answer="没有引用的回答",
            refused=False,
            confidence=0.5,
            citations=[],
            trace=AgentTrace(question=case.question),
        )

        result = score_response(case, response)

        self.assertFalse(result.passed)
        self.assertEqual("expected_citation_missing", result.failure_category)

    def test_render_markdown_includes_metrics_and_case_rows(self):
        report = run_eval(DATASET)

        markdown = render_markdown(report)

        self.assertIn("# Agent Eval Report", markdown)
        self.assertIn("| Pass rate | 100.0% |", markdown)
        self.assertIn("eval-002", markdown)
        self.assertIn("tool_call", markdown)
        self.assertIn("get_order_status", markdown)

    def test_write_report_files_outputs_json_and_markdown(self):
        report = run_eval(DATASET)
        with tempfile.TemporaryDirectory() as tmpdir:
            json_out = Path(tmpdir) / "latest.json"
            md_out = Path(tmpdir) / "latest.md"

            write_report_files(report, json_out=json_out, md_out=md_out)

            parsed = json.loads(json_out.read_text(encoding="utf-8"))
            self.assertEqual(20, parsed["summary"]["total_cases"])
            self.assertIn("# Agent Eval Report", md_out.read_text(encoding="utf-8"))

    def test_cli_writes_json_and_markdown_reports(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            json_out = Path(tmpdir) / "cli.json"
            md_out = Path(tmpdir) / "cli.md"

            exit_code = cli_main(
                [
                    "--dataset",
                    str(DATASET),
                    "--json-out",
                    str(json_out),
                    "--md-out",
                    str(md_out),
                ]
            )

            self.assertEqual(0, exit_code)
            self.assertEqual(
                1.0,
                json.loads(json_out.read_text(encoding="utf-8"))["summary"]["pass_rate"],
            )
            self.assertIn("eval-004", md_out.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
