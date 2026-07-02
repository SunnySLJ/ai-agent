from __future__ import annotations

from dataclasses import dataclass

from agent_platform.chunking import ChunkingStrategy, split_document
from agent_platform.models import Document


@dataclass(frozen=True)
class DocumentChunk:
    chunk_id: str
    doc_id: str
    title: str
    content: str


class KnowledgeBase:
    def __init__(
        self,
        *,
        chunking_strategy: ChunkingStrategy = ChunkingStrategy.RECURSIVE,
        max_chunk_chars: int = 480,
        chunk_overlap: int = 40,
    ) -> None:
        self._chunks: list[DocumentChunk] = []
        self._chunking_strategy = chunking_strategy
        self._max_chunk_chars = max_chunk_chars
        self._chunk_overlap = chunk_overlap

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
        return split_document(
            content,
            strategy=self._chunking_strategy,
            max_chars=self._max_chunk_chars,
            overlap=self._chunk_overlap,
        )

