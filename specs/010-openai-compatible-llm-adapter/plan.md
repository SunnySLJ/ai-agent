# Feature 010 Plan

## Files

```text
portfolio/agent-platform/src/agent_platform/llm.py
portfolio/agent-platform/src/agent_platform/agent.py
portfolio/agent-platform/src/agent_platform/api.py
portfolio/agent-platform/tests/test_llm.py
portfolio/agent-platform/tests/test_agent_core.py
portfolio/agent-platform/tests/test_api.py
portfolio/agent-platform/README.md
docs/project-completion-audit.md
specs/010-openai-compatible-llm-adapter/
```

## Design

Use stdlib `urllib.request` to avoid adding SDK or provider lock-in.

```mermaid
flowchart LR
  API[FastAPI create_app] --> Env[OPENAI_* env]
  Env --> Client[OpenAICompatibleChatClient]
  Client --> Agent[AgentPlatform answer_generator]
  Agent --> Retriever[Retrieved chunks]
  Agent --> Tools[Tool calls]
  Agent --> Chat[/v1/chat/completions]
```

## Env Variables

- `OPENAI_API_KEY`: required to enable LLM mode.
- `OPENAI_BASE_URL`: optional, default `https://api.openai.com/v1`.
- `OPENAI_MODEL`: optional, default `gpt-4o-mini`.

## Fallback

The LLM is used only after the Agent has evidence or successful tool calls. Refusal behavior stays deterministic and does not call the model.

## Verification

- `cd portfolio/agent-platform && .venv/bin/python -m unittest discover -s tests -v`
- `git diff --check`
