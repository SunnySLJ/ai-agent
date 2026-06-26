import unittest

from agent_platform.agent import AgentPlatform
from agent_platform.knowledge_base import KnowledgeBase
from agent_platform.models import Document
from agent_platform.retrieval import BM25Retriever, HybridRetriever, LocalVectorRetriever


class HybridRetrievalTest(unittest.TestCase):
    def test_hybrid_retriever_reranks_stronger_evidence_first(self):
        knowledge_base = KnowledgeBase()
        knowledge_base.ingest(
            Document(
                doc_id="tool-trace",
                title="Agent Tool Trace",
                content="Agent trace records tool calls, latency, model response, and replay evidence.",
            )
        )
        knowledge_base.ingest(
            Document(
                doc_id="rag-evaluation",
                title="RAG Evaluation Metrics",
                content="RAG evaluation measures retrieval hit rate, citation coverage, MRR, and refusal quality.",
            )
        )
        knowledge_base.ingest(
            Document(
                doc_id="java-tools",
                title="Java Business Tools",
                content="Java exposes order and ticket APIs for the Python Agent tool calling layer.",
            )
        )
        retriever = HybridRetriever(
            lexical_retriever=BM25Retriever(knowledge_base),
            dense_retriever=LocalVectorRetriever(knowledge_base),
        )

        chunks = retriever.retrieve("RAG 评估 hit rate 和 MRR 怎么看?", limit=2)

        self.assertGreaterEqual(len(chunks), 1)
        self.assertEqual("rag-evaluation", chunks[0].doc_id)
        self.assertGreater(chunks[0].score, 0)
        self.assertGreaterEqual(chunks[0].score, chunks[-1].score)

    def test_offline_agent_uses_hybrid_retrieval_and_still_refuses_unrelated_question(self):
        platform = AgentPlatform.offline_demo()
        platform.ingest(
            Document(
                doc_id="hybrid-agent",
                title="Hybrid Agent Architecture",
                content="Python handles Agent RAG retrieval while Java exposes stable business tools.",
            )
        )

        grounded = platform.ask("Python 和 Java 在 Agent RAG 里怎么分工?")
        unrelated = platform.ask("明天杭州天气怎么样?")

        self.assertFalse(grounded.refused)
        self.assertEqual("hybrid-agent", grounded.citations[0].doc_id)
        self.assertTrue(unrelated.refused)
        self.assertEqual([], unrelated.citations)


if __name__ == "__main__":
    unittest.main()
