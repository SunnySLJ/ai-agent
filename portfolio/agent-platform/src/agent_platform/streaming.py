from __future__ import annotations

import json
from collections.abc import Iterator
from dataclasses import asdict, is_dataclass
from typing import Any


def format_sse(event: str, data: dict[str, Any]) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


def iter_text_deltas(text: str, chunk_size: int = 8) -> Iterator[str]:
    normalized = text.strip()
    if not normalized:
        return
    for index in range(0, len(normalized), chunk_size):
        yield normalized[index : index + chunk_size]


def to_json(value: Any) -> Any:
    if is_dataclass(value):
        return {key: to_json(item) for key, item in asdict(value).items()}
    if isinstance(value, list):
        return [to_json(item) for item in value]
    if isinstance(value, dict):
        return {key: to_json(item) for key, item in value.items()}
    return value
