from __future__ import annotations

import secrets
import time
from dataclasses import dataclass


MUTATING_TOOLS = frozenset({"create_todo"})


@dataclass(frozen=True)
class PendingApproval:
    approval_id: str
    question: str
    tool_name: str
    arguments: dict[str, str]
    session_id: str | None
    created_at: float
    confirmed: bool = False


class ApprovalStore:
    def __init__(self) -> None:
        self._pending: dict[str, PendingApproval] = {}

    def create(
        self,
        question: str,
        tool_name: str,
        arguments: dict[str, str],
        session_id: str | None = None,
    ) -> PendingApproval:
        approval = PendingApproval(
            approval_id=f"apr-{secrets.token_hex(4)}",
            question=question,
            tool_name=tool_name,
            arguments=arguments,
            session_id=session_id,
            created_at=time.time(),
        )
        self._pending[approval.approval_id] = approval
        return approval

    def get(self, approval_id: str) -> PendingApproval | None:
        return self._pending.get(approval_id)

    def confirm(self, approval_id: str) -> PendingApproval | None:
        approval = self._pending.get(approval_id)
        if approval is None or approval.confirmed:
            return None
        confirmed = PendingApproval(
            approval_id=approval.approval_id,
            question=approval.question,
            tool_name=approval.tool_name,
            arguments=approval.arguments,
            session_id=approval.session_id,
            created_at=approval.created_at,
            confirmed=True,
        )
        self._pending[approval_id] = confirmed
        return confirmed
