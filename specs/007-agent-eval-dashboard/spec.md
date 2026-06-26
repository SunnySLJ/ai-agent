# Feature 007: Agent Eval Dashboard

## Why

The portfolio already has a Python Agent API, Java business tools, tool contracts, and Docker Compose runtime. To look like real AI Agent engineering instead of a chat demo, it needs repeatable evaluation: dataset execution, behavior scoring, failure categories, and a readable report.

## Scope

Build a Python-based eval dashboard runner under `portfolio/agent-eval-dashboard/`:

- Load JSONL eval cases from `portfolio/agent-platform/data/eval_dataset.jsonl`.
- Run cases against the Python `AgentPlatform.offline_demo()` stack.
- Seed deterministic demo knowledge documents required by the eval dataset.
- Score expected behaviors: `answer_with_citation`, `tool_call`, and `refusal`.
- Produce JSON and Markdown report content with pass rate, refusal rate, tool success rate, latency, and failure categories.
- Provide a CLI that writes report files.

## Out of Scope

- Web UI or TypeScript frontend.
- Calling paid model APIs.
- Dockerizing the eval runner.
- Replacing the existing Agent Platform evaluation recorder.

## Acceptance Criteria

### AC1: Dataset loader reads eval cases

Given the JSONL dataset,
When the eval runner loads it,
Then every case has id, question, expected behavior, and tags.

### AC2: Eval runner scores all current cases

Given the current deterministic Agent Platform,
When the runner executes the dataset,
Then all current cases pass with computed summary metrics.

### AC3: Failure categories are explicit

Given a case does not meet its expected behavior,
When it is scored,
Then the result has a stable failure category instead of only `false`.

### AC4: Markdown report is interview-readable

Given eval results,
When Markdown is rendered,
Then it includes headline metrics and per-case rows with expected behavior, pass state, and failure category.

### AC5: CLI writes JSON and Markdown files

Given output paths,
When the CLI runs,
Then it writes parseable JSON and a Markdown report without needing model keys.
