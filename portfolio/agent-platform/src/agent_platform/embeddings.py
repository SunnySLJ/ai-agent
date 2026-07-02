from __future__ import annotations

import hashlib
import json
import math
import os
import re
import urllib.error
import urllib.request
from typing import Protocol


class EmbeddingError(RuntimeError):
    pass


class EmbeddingModel(Protocol):
    @property
    def vector_size(self) -> int:
        ...

    def embed(self, text: str) -> list[float]:
        ...


class HashingEmbeddingModel:
    def __init__(self, size: int = 64) -> None:
        if size <= 0:
            raise ValueError("size must be positive")
        self._size = size

    @property
    def vector_size(self) -> int:
        return self._size

    def embed(self, text: str) -> list[float]:
        vector = [0.0] * self._size
        for token in self._tokens(text):
            digest = hashlib.sha256(token.encode("utf-8")).digest()
            index = int.from_bytes(digest[:4], "big") % self._size
            sign = 1.0 if digest[4] % 2 == 0 else -1.0
            vector[index] += sign
        norm = math.sqrt(sum(value * value for value in vector))
        if norm == 0:
            return vector
        return [value / norm for value in vector]

    def _tokens(self, text: str) -> list[str]:
        ascii_terms = re.findall(r"[a-zA-Z][a-zA-Z0-9+-]*|[A-Z]{2,}", text.lower())
        cjk_terms = [char for char in text if "\u4e00" <= char <= "\u9fff"]
        return ascii_terms + cjk_terms


class OpenAICompatibleEmbeddingModel:
    def __init__(
        self,
        *,
        base_url: str,
        api_key: str,
        model: str,
        vector_size: int,
        timeout_seconds: float = 30,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._api_key = api_key
        self._model = model
        self._vector_size = vector_size
        self._timeout_seconds = timeout_seconds

    @property
    def vector_size(self) -> int:
        return self._vector_size

    def embed(self, text: str) -> list[float]:
        payload = {"model": self._model, "input": text}
        request = urllib.request.Request(
            f"{self._base_url}/embeddings",
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self._api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=self._timeout_seconds) as response:
                body = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise EmbeddingError(
                f"Embedding request failed with HTTP {exc.code}: {detail}"
            ) from exc
        except urllib.error.URLError as exc:
            raise EmbeddingError(f"Embedding request failed: {exc.reason}") from exc

        try:
            vector = body["data"][0]["embedding"]
        except (KeyError, IndexError, TypeError) as exc:
            raise EmbeddingError("Embedding response did not contain data[0].embedding") from exc
        if not isinstance(vector, list) or not vector:
            raise EmbeddingError("Embedding response vector was empty")
        if len(vector) != self._vector_size:
            raise EmbeddingError(
                f"Embedding dimension mismatch: expected {self._vector_size}, got {len(vector)}"
            )
        return [float(value) for value in vector]


def default_embedding_vector_size(model: str) -> int:
    normalized = model.strip().lower()
    if normalized.endswith("large"):
        return 3072
    if normalized.endswith("small") or "embedding" in normalized:
        return 1536
    return int(os.environ.get("QDRANT_VECTOR_SIZE", "1536"))


def embedding_model_from_env() -> EmbeddingModel:
    api_key = os.environ.get("OPENAI_API_KEY")
    model = os.environ.get("OPENAI_EMBEDDING_MODEL")
    if api_key and model:
        vector_size = int(
            os.environ.get(
                "OPENAI_EMBEDDING_DIMENSIONS",
                str(default_embedding_vector_size(model)),
            )
        )
        return OpenAICompatibleEmbeddingModel(
            base_url=os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1"),
            api_key=api_key,
            model=model,
            vector_size=vector_size,
        )

    vector_size = int(os.environ.get("QDRANT_VECTOR_SIZE", "64"))
    return HashingEmbeddingModel(size=vector_size)
