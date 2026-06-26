import json
import threading
import unittest
from contextlib import contextmanager
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from agent_platform.agent import AgentPlatform
from agent_platform.models import Document
from agent_platform.vector_store import HashingEmbeddingModel, QdrantVectorIndex


class FakeQdrantHandler(BaseHTTPRequestHandler):
    collection_requests = []
    upsert_requests = []
    query_requests = []
    points = []
    scores = []

    def do_PUT(self):
        body = self._read_json()
        if self.path.startswith("/collections/") and "/points" in self.path:
            FakeQdrantHandler.upsert_requests.append((self.path, body))
            FakeQdrantHandler.points = body["points"]
            self._send_json(200, {"result": {"operation_id": 1, "status": "completed"}})
            return
        if self.path.startswith("/collections/"):
            FakeQdrantHandler.collection_requests.append((self.path, body))
            self._send_json(200, {"result": True})
            return
        self._send_json(404, {"status": "not found"})

    def do_POST(self):
        body = self._read_json()
        if self.path.endswith("/points/query"):
            FakeQdrantHandler.query_requests.append((self.path, body))
            points = []
            for index, point in enumerate(FakeQdrantHandler.points):
                score = (
                    FakeQdrantHandler.scores[index]
                    if index < len(FakeQdrantHandler.scores)
                    else 0.92
                )
                points.append(
                    {
                        "id": point["id"],
                        "score": score,
                        "payload": point["payload"],
                    }
                )
            self._send_json(200, {"result": {"points": points}})
            return
        self._send_json(404, {"status": "not found"})

    def log_message(self, format, *args):
        return

    def _read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        return json.loads(self.rfile.read(length).decode("utf-8"))

    def _send_json(self, status, payload):
        encoded = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)


@contextmanager
def fake_qdrant_service():
    FakeQdrantHandler.collection_requests = []
    FakeQdrantHandler.upsert_requests = []
    FakeQdrantHandler.query_requests = []
    FakeQdrantHandler.points = []
    FakeQdrantHandler.scores = []
    server = ThreadingHTTPServer(("127.0.0.1", 0), FakeQdrantHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}"
    finally:
        server.shutdown()
        thread.join(timeout=2)
        server.server_close()


class VectorStoreTest(unittest.TestCase):
    def test_hashing_embedding_is_stable_and_normalized(self):
        model = HashingEmbeddingModel(size=8)

        first = model.embed("Python Agent RAG Java tools")
        second = model.embed("Python Agent RAG Java tools")

        self.assertEqual(first, second)
        self.assertEqual(8, len(first))
        self.assertAlmostEqual(1.0, sum(value * value for value in first) ** 0.5)

    def test_qdrant_vector_index_creates_collection_upserts_and_queries_chunks(self):
        with fake_qdrant_service() as base_url:
            index = QdrantVectorIndex(base_url=base_url, collection_name="agent_docs", vector_size=8)
            platform = AgentPlatform.with_qdrant(index)
            platform.ingest(
                Document(
                    doc_id="vector-rag",
                    title="Vector RAG",
                    content="Qdrant stores embeddings for Agent RAG retrieval with citations.",
                )
            )

            response = platform.ask("Agent RAG 为什么需要 Qdrant 向量库?")

        self.assertFalse(response.refused)
        self.assertEqual("Vector RAG", response.citations[0].title)
        self.assertIn("Qdrant", response.answer)
        self.assertEqual("/collections/agent_docs", FakeQdrantHandler.collection_requests[0][0])
        self.assertEqual(8, FakeQdrantHandler.collection_requests[0][1]["vectors"]["size"])
        self.assertEqual("/collections/agent_docs/points?wait=true", FakeQdrantHandler.upsert_requests[0][0])
        self.assertEqual(8, len(FakeQdrantHandler.upsert_requests[0][1]["points"][0]["vector"]))
        self.assertEqual("/collections/agent_docs/points/query", FakeQdrantHandler.query_requests[0][0])
        self.assertEqual(8, len(FakeQdrantHandler.query_requests[0][1]["query"]))

    def test_qdrant_vector_index_filters_non_positive_scores(self):
        with fake_qdrant_service() as base_url:
            FakeQdrantHandler.scores = [0.0, -0.2, 0.41]
            index = QdrantVectorIndex(base_url=base_url, collection_name="agent_docs", vector_size=8)
            platform = AgentPlatform.with_qdrant(index)
            platform.ingest(
                Document(
                    doc_id="vector-rag",
                    title="Vector RAG",
                    content=(
                        "Zero score chunk.\n\n"
                        "Negative score chunk.\n\n"
                        "Positive score chunk about Qdrant retrieval."
                    ),
                )
            )

            response = platform.ask("Qdrant retrieval")

        self.assertFalse(response.refused)
        self.assertEqual(1, len(response.trace.retrieved_chunks))
        self.assertEqual(0.41, response.trace.retrieved_chunks[0].score)
        self.assertIn("Positive score", response.trace.retrieved_chunks[0].snippet)


if __name__ == "__main__":
    unittest.main()
