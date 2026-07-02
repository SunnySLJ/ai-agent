from __future__ import annotations

import json
import re
import urllib.error
import urllib.request
from collections.abc import Iterator, Sequence

from agent_platform.models import RetrievedChunk, ToolCall


class LlmClientError(RuntimeError):
    pass


class OpenAICompatibleChatClient:
    def __init__(
        self,
        *,
        base_url: str,
        api_key: str,
        model: str,
        timeout_seconds: float = 30,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._api_key = api_key
        self._model = model
        self._timeout_seconds = timeout_seconds

    def generate_answer(
        self,
        question: str,
        chunks: Sequence[RetrievedChunk],
        tool_calls: Sequence[ToolCall],
    ) -> str:
        payload = {
            "model": self._model,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "你是企业 AI Agent 应用助手。只能基于给定证据和工具结果回答，"
                        "回答要简洁，并保留可追溯性。"
                    ),
                },
                {
                    "role": "user",
                    "content": self._build_user_message(question, chunks, tool_calls),
                },
            ],
        }
        request = urllib.request.Request(
            f"{self._base_url}/chat/completions",
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self._api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(
                request,
                timeout=self._timeout_seconds,
            ) as response:
                body = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise LlmClientError(
                f"LLM request failed with HTTP {exc.code}: {self._redact_secrets(detail)}"
            ) from exc
        except urllib.error.URLError as exc:
            raise LlmClientError(f"LLM request failed: {exc.reason}") from exc

        try:
            content = body["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise LlmClientError("LLM response did not contain choices[0].message.content") from exc
        if not isinstance(content, str) or not content.strip():
            raise LlmClientError("LLM response content was empty")
        return content.strip()

    def stream_answer(
        self,
        question: str,
        chunks: Sequence[RetrievedChunk],
        tool_calls: Sequence[ToolCall],
    ) -> Iterator[str]:
        payload = {
            "model": self._model,
            "stream": True,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "你是企业 AI Agent 应用助手。只能基于给定证据和工具结果回答，"
                        "回答要简洁，并保留可追溯性。"
                    ),
                },
                {
                    "role": "user",
                    "content": self._build_user_message(question, chunks, tool_calls),
                },
            ],
        }
        request = urllib.request.Request(
            f"{self._base_url}/chat/completions",
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self._api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(
                request,
                timeout=self._timeout_seconds,
            ) as response:
                for delta in self._iter_sse_deltas(response):
                    if delta:
                        yield delta
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise LlmClientError(
                f"LLM request failed with HTTP {exc.code}: {self._redact_secrets(detail)}"
            ) from exc
        except urllib.error.URLError as exc:
            raise LlmClientError(f"LLM request failed: {exc.reason}") from exc

    def _iter_sse_deltas(self, response) -> Iterator[str]:
        for raw_line in response:
            line = raw_line.decode("utf-8", errors="replace").strip()
            if not line or not line.startswith("data:"):
                continue
            payload = line[5:].strip()
            if payload == "[DONE]":
                break
            try:
                body = json.loads(payload)
            except json.JSONDecodeError:
                continue
            try:
                content = body["choices"][0]["delta"]["content"]
            except (KeyError, IndexError, TypeError):
                continue
            if isinstance(content, str) and content:
                yield content

    def _redact_secrets(self, detail: str) -> str:
        redacted = detail.replace(self._api_key, "[REDACTED_API_KEY]")
        redacted = re.sub(r"sk-[A-Za-z0-9_*.-]+", "[REDACTED_API_KEY]", redacted)
        redacted = re.sub(
            r"Bearer\s+[A-Za-z0-9._~+/=-]+",
            "Bearer [REDACTED_API_KEY]",
            redacted,
            flags=re.IGNORECASE,
        )
        return redacted

    def _build_user_message(
        self,
        question: str,
        chunks: Sequence[RetrievedChunk],
        tool_calls: Sequence[ToolCall],
    ) -> str:
        lines = [
            f"用户问题：{question}",
            "",
            "检索证据：",
        ]
        if chunks:
            for index, chunk in enumerate(chunks, 1):
                lines.append(
                    f"{index}. [{chunk.title}] {chunk.snippet} "
                    f"(doc_id={chunk.doc_id}, score={chunk.score:.3f})"
                )
        else:
            lines.append("- 无")

        lines.extend(["", "工具结果："])
        if tool_calls:
            for call in tool_calls:
                status = "success" if call.success else "failed"
                lines.append(
                    f"- {call.name}({json.dumps(call.arguments, ensure_ascii=False)}) "
                    f"=> {status}: {call.result}"
                )
        else:
            lines.append("- 无")

        lines.extend(
            [
                "",
                "请基于以上证据和工具结果回答；不要编造未提供的信息。",
            ]
        )
        return "\n".join(lines)
