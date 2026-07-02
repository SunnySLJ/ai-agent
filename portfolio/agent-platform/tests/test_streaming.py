import json
import unittest

from agent_platform.agent import AgentPlatform
from agent_platform.models import Document
from agent_platform.streaming import format_sse, iter_text_deltas


def parse_sse_events(payload: str) -> list[tuple[str, dict]]:
    events: list[tuple[str, dict]] = []
    for block in payload.strip().split("\n\n"):
        if not block.strip():
            continue
        event_name = "message"
        data_line = ""
        for line in block.splitlines():
            if line.startswith("event:"):
                event_name = line[len("event:") :].strip()
            elif line.startswith("data:"):
                data_line = line[len("data:") :].strip()
        events.append((event_name, json.loads(data_line)))
    return events


class StreamingHelpersTest(unittest.TestCase):
    def test_format_sse_contains_event_and_json_data(self):
        rendered = format_sse("token", {"delta": "你好"})

        self.assertIn("event: token\n", rendered)
        self.assertIn('"delta": "你好"', rendered)
        self.assertTrue(rendered.endswith("\n\n"))

    def test_iter_text_deltas_chunks_text(self):
        self.assertEqual(["Python A", "gent"], list(iter_text_deltas("Python Agent", chunk_size=8)))


class AgentPlatformStreamingTest(unittest.TestCase):
    def test_ask_stream_emits_meta_token_and_done_events(self):
        platform = AgentPlatform.offline_demo(human_in_the_loop=False)
        platform.ingest(
            Document(
                doc_id="hybrid",
                title="Hybrid Agent Architecture",
                content="Python owns Agent RAG orchestration while Java exposes business tool APIs.",
            )
        )

        payload = "".join(platform.ask_stream("Python 和 Java 怎么分工?"))
        events = parse_sse_events(payload)

        self.assertEqual("meta", events[0][0])
        self.assertEqual("done", events[-1][0])
        self.assertTrue(any(name == "token" for name, _ in events))
        self.assertFalse(events[0][1]["refused"])
        self.assertIn("Python", "".join(item["delta"] for name, item in events if name == "token"))
        self.assertIn("Python", events[-1][1]["answer"])
        self.assertGreaterEqual(len(events[-1][1]["citations"]), 1)

    def test_ask_stream_refuses_without_evidence(self):
        platform = AgentPlatform.offline_demo(human_in_the_loop=False)

        payload = "".join(platform.ask_stream("今天股票会涨吗?"))
        events = parse_sse_events(payload)

        self.assertTrue(events[0][1]["refused"])
        self.assertTrue(events[-1][1]["refused"])
        self.assertIn("没有足够证据", events[-1][1]["answer"])


if __name__ == "__main__":
    unittest.main()
