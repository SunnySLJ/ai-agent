from __future__ import annotations

from dataclasses import dataclass, field
from uuid import uuid4


@dataclass
class ConversationTurn:
    question: str
    answer: str


@dataclass
class ConversationSession:
    session_id: str
    turns: list[ConversationTurn] = field(default_factory=list)
    max_turns: int = 5

    def add_turn(self, question: str, answer: str) -> None:
        self.turns.append(ConversationTurn(question=question, answer=answer))
        if len(self.turns) > self.max_turns:
            self.turns = self.turns[-self.max_turns :]

    def context_prefix(self) -> str:
        if not self.turns:
            return ""
        lines = ["以下是本会话历史："]
        for index, turn in enumerate(self.turns, start=1):
            lines.append(f"{index}. 用户：{turn.question}")
            lines.append(f"   助手：{turn.answer}")
        lines.append("当前问题：")
        return "\n".join(lines)


class SessionStore:
    def __init__(self) -> None:
        self._sessions: dict[str, ConversationSession] = {}

    def get_or_create(self, session_id: str | None) -> ConversationSession:
        if session_id and session_id in self._sessions:
            return self._sessions[session_id]
        new_id = session_id or uuid4().hex
        session = ConversationSession(session_id=new_id)
        self._sessions[new_id] = session
        return session

    def get(self, session_id: str) -> ConversationSession | None:
        return self._sessions.get(session_id)
