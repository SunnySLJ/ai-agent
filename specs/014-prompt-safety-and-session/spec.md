# Feature 014: Prompt Safety and Multi-turn Session

## Why

Public JD analysis marks **Prompt 注入防御 (P08)** and **短期会话上下文 (M01)** as P0 gaps. Interviewers also ask how an Agent refuses jailbreak attempts and how follow-up questions reuse context.

## Scope

Add to `portfolio/agent-platform/`:

- `safety.py`: detect common prompt-injection patterns (EN + CN) before retrieval/tool calls.
- `session.py`: in-memory session store with up to 5 turns per session.
- Extend `AgentPlatform.ask(question, session_id=None)` to block unsafe prompts and prepend session history to the effective question.
- Extend FastAPI `/ask` with optional `session_id` and add `GET /sessions/{session_id}`.
- Return `session_id` and `safety_blocked` on `AgentResponse`.

## Out of Scope

- Persistent Redis session storage.
- LLM-based safety classifier.
- LangGraph orchestration (separate feature).

## Acceptance Criteria

### AC1: Normal questions still work

Given a valid business or RAG question,
When `AgentPlatform.ask()` runs,
Then the response is not `safety_blocked` and includes a `session_id`.

### AC2: Prompt injection is refused early

Given a question matching injection patterns such as "ignore previous instructions",
When `AgentPlatform.ask()` runs,
Then the response is refused, `safety_blocked=true`, and no tool calls are recorded.

### AC3: Follow-up questions reuse session context

Given a successful first turn with `session_id`,
When a second question uses the same `session_id`,
Then both turns are stored and the second response reuses the same session.

### AC4: API exposes session lookup

Given `POST /ask` returns `session_id`,
When `GET /sessions/{session_id}` is called,
Then stored turns are returned as question/answer pairs.
