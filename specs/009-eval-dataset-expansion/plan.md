# Feature 009 Plan

## Files

```text
portfolio/agent-platform/data/eval_dataset.jsonl
portfolio/agent-eval-dashboard/src/agent_eval_dashboard/runner.py
portfolio/agent-eval-dashboard/tests/test_eval_dashboard.py
portfolio/agent-eval-dashboard/README.md
docs/project-completion-audit.md
specs/009-eval-dataset-expansion/
```

## Dataset Shape

The dataset stays JSONL:

```json
{"id":"eval-001","question":"...","expected_behavior":"answer_with_citation","tags":["..."]}
```

## Deterministic Coverage

Use the current offline agent behavior:

- Citation cases pass when seeded documents share known terms with the question.
- Tool cases pass when the question includes `ORD-1001`, `工单`, `待办`, or `todo`.
- Refusal cases pass when the question has no matching seed terms and no tool trigger.

## Verification

- `PYTHONPATH=../agent-platform/src:src python3 -m unittest discover -s tests -v`
- `PYTHONPATH=../agent-platform/src:src python3 -m agent_eval_dashboard.cli --dataset ../agent-platform/data/eval_dataset.jsonl --json-out reports/latest.json --md-out reports/latest.md`
- `python3 -m unittest discover -s tests -v` at repo root
- `git diff --check`
