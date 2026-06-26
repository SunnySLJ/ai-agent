from __future__ import annotations

import re
from dataclasses import dataclass

from agent_platform.models import Document


@dataclass(frozen=True)
class DocumentChunk:
    chunk_id: str
    doc_id: str
    title: str
    content: str


class KnowledgeBase:
    def __init__(self) -> None:
        self._chunks: list[DocumentChunk] = []

    def ingest(self, document: Document) -> None:
        self._chunks = [chunk for chunk in self._chunks if chunk.doc_id != document.doc_id]
        for index, content in enumerate(self._split(document.content), start=1):
            self._chunks.append(
                DocumentChunk(
                    chunk_id=f"{document.doc_id}#chunk-{index}",
                    doc_id=document.doc_id,
                    title=document.title,
                    content=content,
                )
            )

    def chunks(self) -> list[DocumentChunk]:
        return list(self._chunks)

    def _split(self, content: str) -> list[str]:
        normalized = content.strip()
        if not normalized:
            return []
        parts = [part.strip() for part in re.split(r"\n{2,}|(?<=[.!?。])\s+", normalized)]
        return [part for part in parts if part] or [normalized]

