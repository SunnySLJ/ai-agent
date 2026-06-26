# Feature 009: Eval Dataset Expansion

## Why

The completion audit says the current eval dataset has only 4 cases. That is enough for a smoke demo but too weak for an interview story about evaluation and failure analysis. The portfolio needs at least 20 deterministic eval cases that cover citation answers, tool calling, and refusal.

## Scope

- Expand `portfolio/agent-platform/data/eval_dataset.jsonl` to at least 20 cases.
- Keep the dataset deterministic and offline.
- Cover all supported expected behaviors:
  - `answer_with_citation`
  - `tool_call`
  - `refusal`
- Seed enough demo documents in the eval runner so citation cases pass intentionally.
- Update eval dashboard tests and docs to reflect the 20-case gate.
- Regenerate the local eval report.

## Out of Scope

- Real LLM calls.
- Vector database integration.
- RAGAS/DeepEval integration.
- BOSS job-search automation.

## Acceptance Criteria

### AC1: Dataset has 20+ cases

Given `eval_dataset.jsonl`,
When the dashboard loads it,
Then it contains at least 20 cases with unique ids.

### AC2: Behavior coverage is broad

Given the dataset,
When expected behavior counts are computed,
Then it includes at least 8 citation cases, 6 tool-call cases, and 4 refusal cases.

### AC3: Current deterministic eval passes

Given the offline demo Agent Platform,
When the dashboard runner executes the dataset,
Then every current case passes.

### AC4: Markdown report reflects 20 cases

Given the eval report,
When Markdown is rendered,
Then it shows 20 total cases and includes examples from each behavior class.

### AC5: Completion audit is updated

Given the previous audit listed the eval dataset as too small,
When this feature is complete,
Then the audit marks the 20-case eval dataset gap as addressed.
