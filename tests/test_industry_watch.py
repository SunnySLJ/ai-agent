from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from scripts.industry_watch import (
    Source,
    collect_items,
    load_sources,
    main,
    parse_feed,
    render_markdown,
)


RSS_FEED = """<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>AI News</title>
    <item>
      <title>New Agent RAG evaluation release</title>
      <link>https://example.com/agent-rag</link>
      <pubDate>Fri, 26 Jun 2026 09:00:00 GMT</pubDate>
      <description><![CDATA[Agent RAG evaluation now tracks hit rate and MRR for enterprise search.]]></description>
    </item>
    <item>
      <title>Unrelated finance story</title>
      <link>https://example.com/finance</link>
      <pubDate>Fri, 26 Jun 2026 08:00:00 GMT</pubDate>
      <description>Market commentary without AI engineering relevance.</description>
    </item>
  </channel>
</rss>
"""


ATOM_FEED = """<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Release Feed</title>
  <entry>
    <title>MCP tool contract release</title>
    <link href="https://example.com/mcp-release"/>
    <updated>2026-06-26T07:00:00Z</updated>
    <summary>MCP tooling adds OpenAPI schema improvements for Agent tool calls.</summary>
  </entry>
</feed>
"""


class IndustryWatchTest(unittest.TestCase):
    def test_parse_feed_reads_rss_and_atom_items(self):
        source = Source(
            name="Example",
            url="https://example.com/feed.xml",
            credibility="high",
            keywords=["agent", "rag", "mcp"],
            impact=["学习", "代码", "面试"],
        )

        rss_items = parse_feed(RSS_FEED, source)
        atom_items = parse_feed(ATOM_FEED, source)

        self.assertEqual("New Agent RAG evaluation release", rss_items[0].title)
        self.assertEqual("https://example.com/agent-rag", rss_items[0].link)
        self.assertEqual("2026-06-26", rss_items[0].published_date)
        self.assertEqual("MCP tool contract release", atom_items[0].title)
        self.assertEqual("https://example.com/mcp-release", atom_items[0].link)

    def test_collect_items_filters_relevant_entries_and_deduplicates_links(self):
        source = Source(
            name="Example",
            url="https://example.com/feed.xml",
            credibility="high",
            keywords=["agent", "rag"],
            impact=["学习", "代码"],
        )
        duplicate_feed = RSS_FEED.replace("https://example.com/finance", "https://example.com/agent-rag")

        items, failures = collect_items(
            [source],
            fetcher=lambda _: duplicate_feed,
            max_items=5,
            today="2026-06-26",
            max_age_days=30,
        )

        self.assertEqual([], failures)
        self.assertEqual(1, len(items))
        self.assertEqual("https://example.com/agent-rag", items[0].link)
        self.assertIn("评估", items[0].next_action)

    def test_render_markdown_contains_required_sections_and_failures(self):
        source = Source(
            name="Example",
            url="https://example.com/feed.xml",
            credibility="high",
            keywords=["agent", "rag"],
            impact=["学习", "代码"],
        )
        items = parse_feed(RSS_FEED, source)[:1]

        markdown = render_markdown(
            date="2026-06-26",
            items=items,
            failures=["Broken Source: timeout"],
        )

        self.assertIn("# 2026-06-26 AI Industry Watch", markdown)
        self.assertIn("## 今日摘要", markdown)
        self.assertIn("## 资讯记录", markdown)
        self.assertIn("## 对今日计划的影响", markdown)
        self.assertIn("## 进入 backlog 的事项", markdown)
        self.assertIn("## 面试可用表达", markdown)
        self.assertIn("## 待复核", markdown)
        self.assertIn("Broken Source: timeout", markdown)

    def test_cli_writes_daily_log_from_configured_file_source(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            root = Path(tmpdir)
            feed_path = root / "feed.xml"
            feed_path.write_text(RSS_FEED, encoding="utf-8")
            sources_path = root / "sources.json"
            sources_path.write_text(
                json.dumps(
                    {
                        "sources": [
                            {
                                "name": "Fixture",
                                "url": feed_path.as_uri(),
                                "credibility": "high",
                                "keywords": ["agent", "rag"],
                                "impact": ["学习", "代码"],
                            }
                        ]
                    },
                    ensure_ascii=False,
                ),
                encoding="utf-8",
            )
            out_dir = root / "logs"

            exit_code = main(
                [
                    "--sources",
                    str(sources_path),
                    "--out-dir",
                    str(out_dir),
                    "--date",
                    "2026-06-26",
                    "--max-items",
                    "5",
                ]
            )

            output = out_dir / "2026-06-26.md"
            self.assertEqual(0, exit_code)
            self.assertTrue(output.exists())
            content = output.read_text(encoding="utf-8")
            self.assertIn("New Agent RAG evaluation release", content)
            self.assertIn("https://example.com/agent-rag", content)

    def test_load_sources_rejects_missing_sources_list(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            path = Path(tmpdir) / "bad.json"
            path.write_text("{}", encoding="utf-8")

            with self.assertRaises(ValueError):
                load_sources(path)

    def test_github_workflow_detects_untracked_daily_logs(self):
        workflow = Path(".github/workflows/industry-watch.yml").read_text(encoding="utf-8")

        self.assertIn("cron: \"0 1 * * *\"", workflow)
        self.assertIn("python scripts/industry_watch.py", workflow)
        self.assertIn("git status --porcelain -- logs/industry", workflow)


if __name__ == "__main__":
    unittest.main()
