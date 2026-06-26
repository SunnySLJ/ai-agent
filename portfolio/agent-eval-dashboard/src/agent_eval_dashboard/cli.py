from __future__ import annotations

import argparse
from pathlib import Path

from agent_eval_dashboard.runner import run_eval, write_report_files


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Run Agent Platform eval report")
    parser.add_argument(
        "--dataset",
        default="../agent-platform/data/eval_dataset.jsonl",
        help="Path to eval JSONL dataset.",
    )
    parser.add_argument(
        "--json-out",
        default="reports/latest.json",
        help="Path to write JSON report.",
    )
    parser.add_argument(
        "--md-out",
        default="reports/latest.md",
        help="Path to write Markdown report.",
    )
    args = parser.parse_args(argv)

    report = run_eval(Path(args.dataset))
    write_report_files(report, json_out=Path(args.json_out), md_out=Path(args.md_out))
    print(
        "wrote eval report: "
        f"{args.json_out}, {args.md_out}; "
        f"pass_rate={report['summary']['pass_rate']:.3f}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
