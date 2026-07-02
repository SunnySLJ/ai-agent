from __future__ import annotations

import json
import urllib.error
import urllib.parse
import urllib.request
import uuid
from collections.abc import Sequence

from agent_platform.embeddings import EmbeddingModel, HashingEmbeddingModel
from agent_platform.knowledge_base import DocumentChunk
from agent_platform.models import RetrievedChunk


class VectorStoreError(RuntimeError):
    pass


class QdrantVectorIndex:
    def __init__(
        self,
        *,
        base_url: str,
        collection_name: str,
        vector_size: int = 64,
        timeout_seconds: float = 30,
        embedding_model: EmbeddingModel | None = None,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._collection_name = collection_name
        self._embedding_model = embedding_model or HashingEmbeddingModel(size=vector_size)
        self._vector_size = vector_size or self._embedding_model.vector_size
        self._timeout_seconds = timeout_seconds

    def ensure_collection(self) -> None:
        self._request(
            "PUT",
            f"/collections/{self._collection()}",
            {
                "vectors": {
                    "size": self._vector_size,
                    "distance": "Cosine",
                }
            },
        )

    def upsert(self, chunks: Sequence[DocumentChunk]) -> None:
        if not chunks:
            return
        self.ensure_collection()
        points = []
        for chunk in chunks:
            points.append(
                {
                    "id": str(uuid.uuid5(uuid.NAMESPACE_URL, chunk.chunk_id)),
                    "vector": self._embedding_model.embed(f"{chunk.title}\n{chunk.content}"),
                    "payload": {
                        "chunk_id": chunk.chunk_id,
                        "doc_id": chunk.doc_id,
                        "title": chunk.title,
                        "content": chunk.content,
                        "snippet": self._snippet(chunk.content),
                    },
                }
            )
        self._request(
            "PUT",
            f"/collections/{self._collection()}/points?wait=true",
            {"points": points},
        )

    def search(self, query: str, limit: int = 3) -> list[RetrievedChunk]:
        response = self._request(
            "POST",
            f"/collections/{self._collection()}/points/query",
            {
                "query": self._embedding_model.embed(query),
                "limit": limit,
                "with_payload": True,
            },
        )
        return self._parse_points(response)[:limit]

    def _request(self, method: str, path: str, payload: dict) -> dict:
        request = urllib.request.Request(
            f"{self._base_url}{path}",
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method=method,
        )
        try:
            with urllib.request.urlopen(request, timeout=self._timeout_seconds) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise VectorStoreError(f"Qdrant request failed with HTTP {exc.code}: {detail}") from exc
        except urllib.error.URLError as exc:
            raise VectorStoreError(f"Qdrant request failed: {exc.reason}") from exc

    def _parse_points(self, response: dict) -> list[RetrievedChunk]:
        result = response.get("result", {})
        if isinstance(result, list):
            raw_points = result
        else:
            raw_points = result.get("points", [])

        chunks: list[RetrievedChunk] = []
        for point in raw_points:
            payload = point.get("payload") or {}
            score = float(point.get("score", 0))
            if score <= 0:
                continue
            chunks.append(
                RetrievedChunk(
                    chunk_id=str(payload.get("chunk_id", point.get("id", ""))),
                    doc_id=str(payload.get("doc_id", "")),
                    title=str(payload.get("title", "")),
                    snippet=str(payload.get("snippet") or self._snippet(str(payload.get("content", "")))),
                    score=score,
                )
            )
        return [chunk for chunk in chunks if chunk.doc_id and chunk.title]

    def _collection(self) -> str:
        return urllib.parse.quote(self._collection_name, safe="")

    def _snippet(self, content: str) -> str:
        stripped = content.strip()
        return stripped if len(stripped) <= 180 else f"{stripped[:177]}..."


class QdrantRetriever:
    def __init__(self, index: QdrantVectorIndex) -> None:
        self._index = index

    def index_chunks(self, chunks: Sequence[DocumentChunk]) -> None:
        self._index.upsert(chunks)

    def retrieve(self, query: str, limit: int = 3) -> list[RetrievedChunk]:
        return self._index.search(query, limit=limit)
