from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass(frozen=True)
class SafetyVerdict:
    blocked: bool
    reason: str = ""


_INJECTION_PATTERNS: tuple[re.Pattern[str], ...] = tuple(
    re.compile(pattern, re.IGNORECASE)
    for pattern in (
        r"ignore\s+(all\s+)?(previous|prior|above)\s+instructions",
        r"disregard\s+.*(system|developer)\s+prompt",
        r"forget\s+(everything|all)\s+(you|that)\s+(know|were\s+told)",
        r"you\s+are\s+now\s+(in\s+)?(developer|admin|root)\s+mode",
        r"reveal\s+(the\s+)?(system|hidden)\s+prompt",
        r"show\s+me\s+(your|the)\s+(system|hidden)\s+prompt",
        r"忽略(之前|以上|所有)(的)?(指令|规则|提示)",
        r"无视(系统|开发者)(提示|指令|规则)",
        r"输出(系统|隐藏)(提示|指令|prompt)",
        r"进入(开发者|管理员|调试)模式",
    )
)


def check_prompt_safety(question: str) -> SafetyVerdict:
    normalized = question.strip()
    if not normalized:
        return SafetyVerdict(blocked=True, reason="empty_question")

    for pattern in _INJECTION_PATTERNS:
        if pattern.search(normalized):
            return SafetyVerdict(blocked=True, reason="prompt_injection_detected")

    return SafetyVerdict(blocked=False)
