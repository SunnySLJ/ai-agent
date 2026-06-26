from __future__ import annotations

import re

from agent_platform.models import ToolCall


class BusinessToolRegistry:
    def invoke(self, question: str) -> list[ToolCall]:
        calls: list[ToolCall] = []
        order_match = re.search(r"ORD-\d+", question)
        if order_match:
            calls.append(self._order_status(order_match.group(0)))
        if "工单" in question:
            calls.append(
                ToolCall(
                    name="get_ticket_status",
                    arguments={"ticket_id": "TCK-1001"},
                    result="工单 TCK-1001 当前状态：处理中。",
                    success=True,
                )
            )
        if "待办" in question or "todo" in question.lower():
            calls.append(
                ToolCall(
                    name="create_todo",
                    arguments={"title": question},
                    result="已创建待办 TODO-1。",
                    success=True,
                )
            )
        return calls

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

