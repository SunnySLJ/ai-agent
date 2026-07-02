from __future__ import annotations

import re

from agent_platform.approval import MUTATING_TOOLS
from agent_platform.models import ToolCall


class BusinessToolRegistry:
    def names(self) -> list[str]:
        return ["get_order_status", "get_ticket_status", "create_todo"]

    def invoke(self, question: str) -> list[ToolCall]:
        calls: list[ToolCall] = []
        for planned in self.plan(question):
            calls.append(self.execute(planned))
        return calls

    def plan(self, question: str) -> list[dict[str, object]]:
        planned: list[dict[str, object]] = []
        order_match = re.search(r"ORD-\d+", question)
        if order_match:
            planned.append(
                {
                    "name": "get_order_status",
                    "arguments": {"order_id": order_match.group(0)},
                }
            )
        if "工单" in question:
            planned.append(
                {
                    "name": "get_ticket_status",
                    "arguments": {"ticket_id": "TCK-1001"},
                }
            )
        if "待办" in question or "todo" in question.lower():
            planned.append(
                {
                    "name": "create_todo",
                    "arguments": {"title": question},
                }
            )
        return planned

    def execute(self, planned: dict[str, object]) -> ToolCall:
        name = str(planned["name"])
        arguments = {key: str(value) for key, value in planned["arguments"].items()}
        if name == "get_order_status":
            return self._order_status(arguments["order_id"])
        if name == "get_ticket_status":
            return ToolCall(
                name="get_ticket_status",
                arguments=arguments,
                result="工单 TCK-1001 当前状态：处理中。",
                success=True,
            )
        if name == "create_todo":
            return ToolCall(
                name="create_todo",
                arguments=arguments,
                result="已创建待办 TODO-1。",
                success=True,
            )
        return ToolCall(
            name=name,
            arguments=arguments,
            result=f"未知工具 {name}",
            success=False,
        )

    def requires_approval(self, question: str) -> dict[str, object] | None:
        for planned in self.plan(question):
            if planned["name"] in MUTATING_TOOLS:
                return planned
        return None

    def _order_status(self, order_id: str) -> ToolCall:
        if order_id == "ORD-1001":
            return ToolCall(
                name="get_order_status",
                arguments={"order_id": order_id},
                result="订单 ORD-1001 当前状态：已发货，预计明日送达。",
                success=True,
            )
        return ToolCall(
            name="get_order_status",
            arguments={"order_id": order_id},
            result=f"未找到订单 {order_id}。",
            success=False,
        )
