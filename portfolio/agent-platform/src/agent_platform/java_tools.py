from __future__ import annotations

import hashlib
import json
import re
from typing import Any
from urllib import error, parse, request

from agent_platform.models import ToolCall


class JavaBusinessToolRegistry:
    def __init__(self, base_url: str, timeout_seconds: float = 5) -> None:
        self._base_url = base_url.rstrip("/")
        self._timeout_seconds = timeout_seconds

    def names(self) -> list[str]:
        status, payload = self._request_json("GET", "/tools")
        if status >= 400:
            return []
        return [tool["name"] for tool in payload.get("tools", []) if "name" in tool]

    def invoke(self, question: str) -> list[ToolCall]:
        calls: list[ToolCall] = []
        order_match = re.search(r"ORD-\d+", question)
        if order_match:
            calls.append(self._order_status(order_match.group(0)))

        ticket_match = re.search(r"TCK-\d+", question)
        if ticket_match:
            calls.append(self._ticket_status(ticket_match.group(0)))
        elif "工单" in question:
            calls.append(self._ticket_status("TCK-1001"))

        if "待办" in question or "todo" in question.lower():
            calls.append(self._create_todo(question))
        return calls

    def _order_status(self, order_id: str) -> ToolCall:
        status, payload = self._request_json("GET", f"/orders/{parse.quote(order_id)}")
        if status < 400:
            return ToolCall(
                name="get_order_status",
                arguments={"orderId": order_id},
                result=payload.get("summary", json.dumps(payload, ensure_ascii=False)),
                success=True,
            )
        return ToolCall(
            name="get_order_status",
            arguments={"orderId": order_id},
            result=self._error_result(payload),
            success=False,
        )

    def _ticket_status(self, ticket_id: str) -> ToolCall:
        status, payload = self._request_json("GET", f"/tickets/{parse.quote(ticket_id)}")
        if status < 400:
            return ToolCall(
                name="get_ticket_status",
                arguments={"ticketId": ticket_id},
                result=payload.get("summary", json.dumps(payload, ensure_ascii=False)),
                success=True,
            )
        return ToolCall(
            name="get_ticket_status",
            arguments={"ticketId": ticket_id},
            result=self._error_result(payload),
            success=False,
        )

    def _create_todo(self, question: str) -> ToolCall:
        payload = {
            "title": question.strip(),
            "idempotencyKey": self._idempotency_key(question),
        }
        status, response = self._request_json("POST", "/todos", payload)
        if status < 400:
            todo_id = response.get("todoId", "UNKNOWN")
            return ToolCall(
                name="create_todo",
                arguments=payload,
                result=f"已创建待办 {todo_id}。",
                success=True,
            )
        return ToolCall(
            name="create_todo",
            arguments=payload,
            result=self._error_result(response),
            success=False,
        )

    def _request_json(
        self,
        method: str,
        path: str,
        payload: dict[str, str] | None = None,
    ) -> tuple[int, dict[str, Any]]:
        body = None
        headers = {"accept": "application/json"}
        if payload is not None:
            body = json.dumps(payload).encode("utf-8")
            headers["content-type"] = "application/json"
        req = request.Request(
            f"{self._base_url}{path}",
            data=body,
            headers=headers,
            method=method,
        )
        try:
            with request.urlopen(req, timeout=self._timeout_seconds) as response:
                return response.status, self._decode_json(response.read())
        except error.HTTPError as exc:
            return exc.code, self._decode_json(exc.read())
        except (error.URLError, TimeoutError, OSError) as exc:
            return 599, {
                "code": "JAVA_TOOL_SERVICE_UNAVAILABLE",
                "message": str(exc),
            }

    def _decode_json(self, body: bytes) -> dict[str, Any]:
        if not body:
            return {}
        decoded = json.loads(body.decode("utf-8"))
        return decoded if isinstance(decoded, dict) else {"value": decoded}

    def _error_result(self, payload: dict[str, Any]) -> str:
        code = payload.get("code", "JAVA_TOOL_ERROR")
        message = payload.get("message", "Java tool call failed")
        return f"{code}: {message}"

    def _idempotency_key(self, question: str) -> str:
        digest = hashlib.sha256(question.encode("utf-8")).hexdigest()[:12]
        return f"agent-{digest}"
