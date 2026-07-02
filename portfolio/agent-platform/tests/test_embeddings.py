from __future__ import annotations

import json
import unittest
from contextlib import contextmanager
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from unittest import mock

from agent_platform.embeddings import (
    HashingEmbeddingModel,
    OpenAICompatibleEmbeddingModel,
    default_embedding_vector_size,
    embedding_model_from_env,
)
from agent_platform.vector_store import QdrantVectorIndex
from test_vector_store import FakeQdrantHandler, fake_qdrant_service


class EmbeddingHandler(BaseHTTPRequestHandler):
    requests: list[dict[str, object]] = []
    vector_size = 8
    status_code = 200
    error_body: dict[str, object] | None = None

    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0"))
        payload = json.loads(self.rfile.read(length).decode("utf-8"))
        self.__class__.requests.append(
            {
                "path": self.path,
                "authorization": self.headers.get("Authorization"),
                "payload": payload,
            }
        )
        if self.__class__.status_code >= 400:
            body = self.__class__.error_body or {"error": {"message": "failed"}}
            encoded = json.dumps(body).encode("utf-8")
            self.send_response(self.__class__.status_code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(encoded)))
            self.end_headers()
            self.wfile.write(encoded)
            return

        text = str(payload.get("input", ""))
        vector = self._vector_for_text(text)
        body = {"data": [{"embedding": vector, "index": 0}]}
        encoded = json.dumps(body).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def log_message(self, format, *args):
        return

    def _vector_for_text(self, text: str) -> list[float]:
        size = self.__class__.vector_size
        seed = sum(ord(char) for char in text) % size
        vector = [0.0] * size
        vector[seed % size] = 1.0
        return vector


@contextmanager
def embedding_service(*, vector_size: int = 8, status_code: int = 200):
    EmbeddingHandler.requests = []
    EmbeddingHandler.vector_size = vector_size
    EmbeddingHandler.status_code = status_code
    server = ThreadingHTTPServer(("127.0.0.1", 0), EmbeddingHandler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}/v1"
    finally:
        server.shutdown()
        thread.join(timeout=2)
        server.server_close()


class EmbeddingModelTest(unittest.TestCase):
    def test_hashing_embedding_is_stable_and_normalized(self):
        model = HashingEmbeddingModel(size=8)

        first = model.embed("Python Agent RAG Java tools")
        second = model.embed("Python Agent RAG Java tools")

        self.assertEqual(first, second)
        self.assertEqual(8, model.vector_size)
        self.assertAlmostEqual(1.0, sum(value * value for value in first) ** 0.5)

    def test_openai_compatible_embedding_posts_embeddings_request(self):
        with embedding_service(vector_size=8) as base_url:
            model = OpenAICompatibleEmbeddingModel(
                base_url=base_url,
                api_key="test-key",
                model="text-embedding-test",
                vector_size=8,
            )

            vector = model.embed("Agent RAG retrieval")

        self.assertEqual(8, len(vector))
        self.assertEqual(1, len(EmbeddingHandler.requests))
        request = EmbeddingHandler.requests[0]
        self.assertEqual("/v1/embeddings", request["path"])
        self.assertEqual("Bearer test-key", request["authorization"])
        self.assertEqual("text-embedding-test", request["payload"]["model"])
        self.assertEqual("Agent RAG retrieval", request["payload"]["input"])

    def test_embedding_model_from_env_uses_openai_when_model_is_set(self):
        with mock.patch.dict(
            "os.environ",
            {
                "OPENAI_API_KEY": "test-key",
                "OPENAI_EMBEDDING_MODEL": "text-embedding-3-small",
                "OPENAI_EMBEDDING_DIMENSIONS": "8",
            },
            clear=True,
        ):
            model = embedding_model_from_env()

        self.assertIsInstance(model, OpenAICompatibleEmbeddingModel)
        self.assertEqual(8, model.vector_size)

    def test_embedding_model_from_env_falls_back_to_hashing(self):
        with mock.patch.dict("os.environ", {}, clear=True):
            model = embedding_model_from_env()

        self.assertIsInstance(model, HashingEmbeddingModel)
        self.assertEqual(64, model.vector_size)

    def test_default_embedding_vector_size_for_small_model(self):
        self.assertEqual(1536, default_embedding_vector_size("text-embedding-3-small"))

    def test_qdrant_uses_openai_embedding_vectors(self):
        with embedding_service(vector_size=8) as base_url:
            with fake_qdrant_service() as qdrant_base_url:
                model = OpenAICompatibleEmbeddingModel(
                    base_url=base_url,
                    api_key="test-key",
                    model="text-embedding-test",
                    vector_size=8,
                )
                index = QdrantVectorIndex(
                    base_url=qdrant_base_url,
                    collection_name="agent_docs",
                    vector_size=model.vector_size,
                    embedding_model=model,
                )
                from agent_platform.knowledge_base import DocumentChunk

                index.upsert(
                    [
                        DocumentChunk(
                            chunk_id="doc#1",
                            doc_id="doc",
                            title="Vector RAG",
                            content="Qdrant stores embeddings for retrieval.",
                        )
                    ]
                )

        self.assertEqual(1, len(EmbeddingHandler.requests))
        self.assertEqual(8, FakeQdrantHandler.collection_requests[0][1]["vectors"]["size"])
        self.assertEqual(8, len(FakeQdrantHandler.upsert_requests[0][1]["points"][0]["vector"]))


if __name__ == "__main__":
    unittest.main()
