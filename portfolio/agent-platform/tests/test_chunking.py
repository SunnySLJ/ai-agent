from __future__ import annotations

import unittest

from agent_platform.chunking import ChunkingStrategy, split_document


class ChunkingTest(unittest.TestCase):
    def test_paragraph_strategy_splits_on_blank_lines_and_sentences(self):
        content = "第一段第一句。第一段第二句。\n\n第二段内容。"
        chunks = split_document(content, strategy=ChunkingStrategy.PARAGRAPH)

        self.assertGreaterEqual(len(chunks), 2)
        self.assertIn("第一段第一句。", chunks[0])

    def test_recursive_strategy_merges_small_paragraphs(self):
        content = "短段 A。\n\n短段 B。\n\n短段 C。"
        chunks = split_document(
            content,
            strategy=ChunkingStrategy.RECURSIVE,
            max_chars=80,
        )

        self.assertGreaterEqual(len(chunks), 1)
        self.assertLessEqual(len(chunks[0]), 80)

    def test_recursive_strategy_splits_oversized_paragraph(self):
        sentence = "这是一句很长的中文测试句子。" * 20
        chunks = split_document(
            sentence,
            strategy=ChunkingStrategy.RECURSIVE,
            max_chars=120,
            overlap=20,
        )

        self.assertGreater(len(chunks), 1)
        self.assertTrue(all(len(chunk) <= 120 for chunk in chunks))

    def test_empty_content_returns_empty_list(self):
        self.assertEqual([], split_document("   "))


if __name__ == "__main__":
    unittest.main()
