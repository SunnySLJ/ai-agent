from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DASHBOARD_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT / "agent-platform/src"))
sys.path.insert(0, str(DASHBOARD_ROOT / "src"))

from agent_eval_dashboard.retrieval_eval import (  # noqa: E402
    render_retrieval_markdown,
    run_retrieval_eval,
    write_retrieval_report_files,
)


DATASET = PROJECT_ROOT / "agent-platform/data/retrieval_eval_dataset.jsonl"


class RetrievalEvalTest(unittest.TestCase):
    def test_run_retrieval_eval_compares_keyword_and_hybrid_modes(self):
        report = run_retrieval_eval(DATASET)

        self.assertEqual(5, report["summary"]["total_cases"])
        self.assertIn("keyword", report["summary"]["modes"])
        self.assertIn("hybrid", report["summary"]["modes"])
        self.assertGreaterEqual(
            report["summary"]["modes"]["hybrid"]["hit_rate"],
            report["summary"]["modes"]["keyword"]["hit_rate"],
        )
        self.assertGreaterEqual(report["summary"]["modes"]["hybrid"]["mrr"], 0.8)

    def test_render_retrieval_markdown_includes_mode_metrics_and_cases(self):
        report = run_retrieval_eval(DATASET)

        markdown = render_retrieval_markdown(report)

        self.assertIn("# Retrieval Eval Report", markdown)
        self.assertIn("| hybrid |", markdown)
        self.assertIn("retrieval-001", markdown)
        self.assertIn("rag-evaluation", markdown)

    def test_write_retrieval_report_files_outputs_json_and_markdown(self):
        report = run_retrieval_eval(DATASET)
        with tempfile.TemporaryDirectory() as tmpdir:
            json_out = Path(tmpdir) / "retrieval.json"
            md_out = Path(tmpdir) / "retrieval.md"

            write_retrieval_report_files(report, json_out=json_out, md_out=md_out)

            parsed = json.loads(json_out.read_text(encoding="utf-8"))
            self.assertEqual(5, parsed["summary"]["total_cases"])
            self.assertIn("# Retrieval Eval Report", md_out.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
