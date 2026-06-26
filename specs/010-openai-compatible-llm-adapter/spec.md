# Feature 010: OpenAI-Compatible LLM Adapter

## Why

The completion audit still lists "real model interface" as a gap. The Agent Platform is deterministic and interview-friendly, but it needs a configurable path to call a real OpenAI-compatible chat completion API without breaking offline tests.

## Scope

- Add a stdlib OpenAI-compatible chat completion client.
- Let `AgentPlatform` optionally use an LLM answer generator when evidence or successful tool results exist.
- Preserve default deterministic offline behavior when no model env is configured.
- Let FastAPI env wiring enable the LLM path with `OPENAI_API_KEY`, `OPENAI_BASE_URL`, and `OPENAI_MODEL`.
- Document how to run with an OpenAI-compatible endpoint.

## Out of Scope

- Streaming responses.
- Model routing.
- Embeddings or vector database.
- Provider-specific SDKs.
- Storing real API keys.

## Acceptance Criteria

### AC1: Client sends chat completion requests

Given an OpenAI-compatible base URL, API key, and model,
When `OpenAICompatibleChatClient.generate_answer()` is called,
Then it posts to `/chat/completions` with bearer auth, model, system message, user message, evidence, and tool results.

### AC2: Agent can use LLM answer generation

Given an `AgentPlatform` has an answer generator and relevant evidence,
When `ask()` is called,
Then the final answer comes from the answer generator while citations and trace are still recorded.

### AC3: Agent still refuses without evidence

Given an `AgentPlatform` has an answer generator but no evidence or successful tools,
When `ask()` is called,
Then it refuses and does not call the answer generator.

### AC4: API env wiring enables LLM mode

Given `OPENAI_API_KEY`, `OPENAI_BASE_URL`, and `OPENAI_MODEL` are set,
When `create_app()` is called without an explicit platform,
Then `/ask` can use the configured OpenAI-compatible endpoint.

### AC5: Offline default is unchanged

Given no LLM environment variables are set,
When existing tests run,
Then deterministic offline behavior remains unchanged.
