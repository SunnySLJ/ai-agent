from __future__ import annotations

import re
from enum import Enum


class ChunkingStrategy(str, Enum):
    PARAGRAPH = "paragraph"
    RECURSIVE = "recursive"


_PARAGRAPH_SPLIT = re.compile(r"\n{2,}")
_SENTENCE_SPLIT = re.compile(r"(?<=[.!?。])\s+")


def split_document(
    content: str,
    *,
    strategy: ChunkingStrategy = ChunkingStrategy.RECURSIVE,
    max_chars: int = 480,
    overlap: int = 40,
) -> list[str]:
    normalized = content.strip()
    if not normalized:
        return []

    if strategy is ChunkingStrategy.PARAGRAPH:
        return _split_paragraphs(normalized)

    return _split_recursive(normalized, max_chars=max_chars, overlap=overlap)


def _split_paragraphs(content: str) -> list[str]:
    parts = [part.strip() for part in _PARAGRAPH_SPLIT.split(content)]
    parts = [part for part in parts if part]
    if not parts:
        return [content]
    sentence_parts: list[str] = []
    for part in parts:
        sentence_parts.extend(
            segment.strip()
            for segment in _SENTENCE_SPLIT.split(part)
            if segment.strip()
        )
    return sentence_parts or [content]


def _split_recursive(content: str, *, max_chars: int, overlap: int) -> list[str]:
    units = _split_paragraphs(content)
    chunks: list[str] = []
    buffer = ""

    for unit in units:
        if len(unit) > max_chars:
            if buffer:
                chunks.append(buffer)
                buffer = ""
            chunks.extend(_hard_split(unit, max_chars=max_chars, overlap=overlap))
            continue

        candidate = f"{buffer}\n\n{unit}".strip() if buffer else unit
        if len(candidate) <= max_chars:
            buffer = candidate
            continue

        if buffer:
            chunks.append(buffer)
        buffer = unit

    if buffer:
        chunks.append(buffer)

    return chunks or [content]


def _hard_split(text: str, *, max_chars: int, overlap: int) -> list[str]:
    if len(text) <= max_chars:
        return [text]

    sentences = [
        segment.strip() for segment in _SENTENCE_SPLIT.split(text) if segment.strip()
    ]
    if len(sentences) <= 1:
        return _fixed_windows(text, max_chars=max_chars, overlap=overlap)

    chunks: list[str] = []
    buffer = ""
    for sentence in sentences:
        if len(sentence) > max_chars:
            if buffer:
                chunks.append(buffer)
                buffer = ""
            chunks.extend(_fixed_windows(sentence, max_chars=max_chars, overlap=overlap))
            continue

        candidate = f"{buffer} {sentence}".strip() if buffer else sentence
        if len(candidate) <= max_chars:
            buffer = candidate
            continue

        if buffer:
            chunks.append(buffer)
        buffer = sentence

    if buffer:
        chunks.append(buffer)
    return chunks


def _fixed_windows(text: str, *, max_chars: int, overlap: int) -> list[str]:
    if len(text) <= max_chars:
        return [text]

    step = max(1, max_chars - overlap)
    return [text[index : index + max_chars] for index in range(0, len(text), step)]
