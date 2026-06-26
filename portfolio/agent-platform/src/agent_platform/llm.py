from __future__ import annotations

import json
import urllib.error
import urllib.request
from collections.abc import Sequence

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
            raise LlmClientError(f"LLM request failed with HTTP {exc.code}: {detail}") from exc
        except urllib.error.URLError as exc:
            raise LlmClientError(f"LLM request failed: {exc.reason}") from exc

        try:
            content = body["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise LlmClientError("LLM response did not contain choices[0].message.content") from exc
        if not isinstance(content, str) or not content.strip():
            raise LlmClientError("LLM response content was empty")
        return content.strip()

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
