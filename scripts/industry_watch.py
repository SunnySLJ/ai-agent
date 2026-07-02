from __future__ import annotations

import argparse
import email.utils
import html
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Callable


DEFAULT_KEYWORDS = [
    "agent",
    "rag",
    "retrieval",
    "rerank",
    "mcp",
    "openapi",
    "tool",
    "function calling",
    "llm",
    "model",
    "embedding",
    "vector",
    "qdrant",
    "langchain",
    "llamaindex",
    "spring ai",
    "大模型",
    "智能体",
    "知识库",
    "检索",
    "向量",
    "评估",
    "工具调用",
]


@dataclass(frozen=True)
class Source:
    name: str
    url: str
    credibility: str
    keywords: list[str]
    impact: list[str]
    enabled: bool = True


@dataclass(frozen=True)
class NewsItem:
    source: str
    title: str
    link: str
    published_date: str
    summary: str
    credibility: str
    impact: list[str]
    next_action: str


def load_sources(path: str | Path) -> list[Source]:
    payload = json.loads(Path(path).read_text(encoding="utf-8"))
    raw_sources = payload.get("sources")
    if not isinstance(raw_sources, list) or not raw_sources:
        raise ValueError("sources must be a non-empty list")
    sources = []
    for index, raw_source in enumerate(raw_sources, 1):
        if not isinstance(raw_source, dict):
            raise ValueError(f"sources[{index}] must be an object")
        source = Source(
            name=_required_string(raw_source, "name", index),
            url=_required_string(raw_source, "url", index),
            credibility=_required_string(raw_source, "credibility", index),
            keywords=_string_list(raw_source.get("keywords", []), index),
            impact=_string_list(raw_source.get("impact", []), index),
            enabled=bool(raw_source.get("enabled", True)),
        )
        sources.append(source)
    return [source for source in sources if source.enabled]


def collect_items(
    sources: list[Source],
    *,
    fetcher: Callable[[str], str] | None = None,
    max_items: int = 8,
    today: str | None = None,
    max_age_days: int = 30,
) -> tuple[list[NewsItem], list[str]]:
    fetch = fetcher or fetch_url
    failures = []
    items = []
    for source in sources:
        try:
            feed_text = fetch(source.url)
            items.extend(parse_feed(feed_text, source))
        except Exception as exc:  # noqa: BLE001 - failure is logged as daily follow-up.
            failures.append(f"{source.name}: {exc}")

    cutoff = _parse_date(today or date.today().isoformat()) - timedelta(days=max_age_days)
    seen = set()
    filtered = []
    for item in sorted(items, key=lambda value: value.published_date, reverse=True):
        key = item.link or f"{item.source}:{item.title}"
        if key in seen:
            continue
        seen.add(key)
        if not _is_recent(item.published_date, cutoff):
            continue
        if not _is_relevant(item):
            continue
        filtered.append(item)
        if len(filtered) >= max_items:
            break
    return filtered, failures


def parse_feed(feed_text: str, source: Source) -> list[NewsItem]:
    root = ET.fromstring(feed_text)
    if _local_name(root.tag) == "rss":
        entries = root.findall("./channel/item")
        return [_rss_item(entry, source) for entry in entries]
    if _local_name(root.tag) == "feed":
        entries = [
            child
            for child in list(root)
            if _local_name(child.tag) == "entry"
        ]
        return [_atom_item(entry, source) for entry in entries]
    raise ValueError(f"Unsupported feed root: {_local_name(root.tag)}")


def render_markdown(date: str, items: list[NewsItem], failures: list[str]) -> str:
    lines = [
        f"# {date} AI Industry Watch",
        "",
        "## 今日摘要",
        "",
    ]
    if items:
        lines.append(f"- 收集到 {len(items)} 条与 Agent/RAG 求职项目相关的资讯。")
        top_impacts = sorted({impact for item in items for impact in item.impact})
        if top_impacts:
            lines.append(f"- 今日主要影响方向：{'、'.join(top_impacts)}。")
    else:
        lines.append("- 今日没有抓到可直接转化为项目行动的资讯，需人工复核来源。")

    lines.extend(
        [
            "",
            "## 资讯记录",
            "",
            "| 来源 | 日期 | 主题 | 可信度 | 摘要 | 项目影响 | 下一步动作 |",
            "|---|---|---|---|---|---|---|",
        ]
    )
    if items:
        for item in items:
            lines.append(
                "| {source} | {published_date} | [{title}]({link}) | {credibility} | "
                "{summary} | {impact} | {next_action} |".format(
                    source=_escape_table(item.source),
                    published_date=_escape_table(item.published_date),
                    title=_escape_table(item.title),
                    link=item.link,
                    credibility=_escape_table(item.credibility),
                    summary=_escape_table(item.summary),
                    impact=_escape_table("、".join(item.impact)),
                    next_action=_escape_table(item.next_action),
                )
            )
    else:
        lines.append("| - | - | - | - | - | - | 人工复核默认来源是否可访问 |")

    lines.extend(["", "## 对今日计划的影响", ""])
    impact_actions = _unique([item.next_action for item in items])
    lines.extend([f"- {action}" for action in impact_actions] or ["- 暂无自动转化动作。"])

    lines.extend(["", "## 进入 backlog 的事项", ""])
    backlog = [item for item in items if "代码" in item.impact or "文档" in item.impact]
    lines.extend(
        [f"- {item.title} -> {item.next_action}" for item in backlog]
        or ["- 暂无新增 backlog。"]
    )

    lines.extend(["", "## 面试可用表达", ""])
    interview_items = [item for item in items if "面试" in item.impact]
    lines.extend(
        [
            f"- 可以结合 {item.source} 的 {item.title} 说明：AI Agent 工程要持续跟踪一手发布，并转化为可验证功能。"
            for item in interview_items[:3]
        ]
        or ["- 暂无新增面试表达。"]
    )

    lines.extend(["", "## 待复核", ""])
    lines.extend([f"- {failure}" for failure in failures] or ["- 无。"])
    return "\n".join(lines) + "\n"


def write_daily_log(
    *,
    sources_path: str | Path,
    out_dir: str | Path,
    target_date: str,
    max_items: int,
    max_age_days: int,
) -> Path:
    sources = load_sources(sources_path)
    items, failures = collect_items(
        sources,
        max_items=max_items,
        today=target_date,
        max_age_days=max_age_days,
    )
    out_path = Path(out_dir) / f"{target_date}.md"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(render_markdown(target_date, items, failures), encoding="utf-8")
    return out_path


def fetch_url(url: str) -> str:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "ai-agent-industry-watch/1.0"},
    )
    with urllib.request.urlopen(request, timeout=20) as response:
        return response.read().decode("utf-8", errors="replace")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Collect daily AI industry watch feeds.")
    parser.add_argument("--sources", default="docs/14-industry-watch-sources.json")
    parser.add_argument("--out-dir", default="logs/industry")
    parser.add_argument("--date", default=date.today().isoformat())
    parser.add_argument("--max-items", type=int, default=8)
    parser.add_argument("--max-age-days", type=int, default=30)
    args = parser.parse_args(argv)

    out_path = write_daily_log(
        sources_path=args.sources,
        out_dir=args.out_dir,
        target_date=args.date,
        max_items=args.max_items,
        max_age_days=args.max_age_days,
    )
    print(f"wrote industry watch log: {out_path}")
    return 0


def _rss_item(entry: ET.Element, source: Source) -> NewsItem:
    title = _text(entry, "title")
    link = _text(entry, "link")
    raw_date = _text(entry, "pubDate") or _text(entry, "dc:date")
    summary = _clean_summary(_text(entry, "description"))
    return _news_item(source, title, link, raw_date, summary)


def _atom_item(entry: ET.Element, source: Source) -> NewsItem:
    title = _child_text(entry, "title")
    link = _atom_link(entry)
    raw_date = _child_text(entry, "updated") or _child_text(entry, "published")
    summary = _clean_summary(_child_text(entry, "summary") or _child_text(entry, "content"))
    return _news_item(source, title, link, raw_date, summary)


def _news_item(
    source: Source,
    title: str,
    link: str,
    raw_date: str,
    summary: str,
) -> NewsItem:
    text = f"{title} {summary}"
    impact = _impact(source, text)
    return NewsItem(
        source=source.name,
        title=title.strip() or "Untitled",
        link=link.strip(),
        published_date=_format_date(raw_date),
        summary=_shorten(summary or title),
        credibility=source.credibility,
        impact=impact,
        next_action=_next_action(text, impact),
    )


def _text(entry: ET.Element, tag: str) -> str:
    found = entry.find(tag)
    return found.text.strip() if found is not None and found.text else ""


def _child_text(entry: ET.Element, local_name: str) -> str:
    for child in list(entry):
        if _local_name(child.tag) == local_name and child.text:
            return child.text.strip()
    return ""


def _atom_link(entry: ET.Element) -> str:
    for child in list(entry):
        if _local_name(child.tag) == "link":
            return child.attrib.get("href", "").strip()
    return ""


def _local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def _clean_summary(value: str) -> str:
    without_tags = re.sub(r"<[^>]+>", " ", value)
    return " ".join(html.unescape(without_tags).split())


def _shorten(value: str, limit: int = 80) -> str:
    stripped = " ".join(value.split())
    return stripped if len(stripped) <= limit else f"{stripped[: limit - 3]}..."


def _format_date(value: str) -> str:
    parsed = _try_parse_datetime(value)
    return parsed.date().isoformat() if parsed else date.today().isoformat()


def _parse_date(value: str) -> date:
    try:
        return datetime.fromisoformat(value).date()
    except ValueError:
        return date.today()


def _try_parse_datetime(value: str) -> datetime | None:
    if not value:
        return None
    try:
        email_date = email.utils.parsedate_to_datetime(value)
        if email_date:
            return email_date.astimezone(timezone.utc)
    except (TypeError, ValueError):
        pass
    try:
        normalized = value.replace("Z", "+00:00")
        return datetime.fromisoformat(normalized)
    except ValueError:
        return None


def _is_recent(value: str, cutoff: date) -> bool:
    try:
        return datetime.fromisoformat(value).date() >= cutoff
    except ValueError:
        return True


def _is_relevant(item: NewsItem) -> bool:
    haystack = f"{item.title} {item.summary}".lower()
    return any(keyword.lower() in haystack for keyword in DEFAULT_KEYWORDS)


def _impact(source: Source, text: str) -> list[str]:
    lowered = text.lower()
    impacts = set(source.impact)
    if any(keyword in lowered for keyword in ["release", "sdk", "api", "mcp", "openapi", "tool"]):
        impacts.update(["代码", "面试"])
    if any(keyword in lowered for keyword in ["rag", "retrieval", "rerank", "eval", "评估", "检索"]):
        impacts.update(["学习", "代码", "面试"])
    if any(keyword in lowered for keyword in ["job", "hiring", "岗位", "招聘"]):
        impacts.update(["求职"])
    return sorted(impacts or {"学习"})


def _next_action(text: str, impact: list[str]) -> str:
    lowered = text.lower()
    if any(keyword in lowered for keyword in ["eval", "评估", "hit rate", "mrr"]):
        return "复核 `portfolio/agent-eval-dashboard/` 评估指标和面试讲法"
    if any(keyword in lowered for keyword in ["mcp", "openapi", "tool"]):
        return "复核 `portfolio/mcp-tool-server/` 工具契约说明"
    if any(keyword in lowered for keyword in ["rag", "retrieval", "rerank", "embedding"]):
        return "复核 `portfolio/agent-platform/` 检索 backlog"
    if "求职" in impact:
        return "更新 `docs/08-job-market-hangzhou.md` 岗位关键词"
    return "写入 `logs/daily/` 的学习和面试表达"


def _unique(values: list[str]) -> list[str]:
    seen = set()
    result = []
    for value in values:
        if value in seen:
            continue
        seen.add(value)
        result.append(value)
    return result


def _escape_table(value: str) -> str:
    return value.replace("|", "\\|").replace("\n", " ")


def _required_string(payload: dict, key: str, index: int) -> str:
    value = payload.get(key)
    if not isinstance(value, str) or not value:
        raise ValueError(f"sources[{index}].{key} must be a non-empty string")
    return value


def _string_list(value, index: int) -> list[str]:
    if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
        raise ValueError(f"sources[{index}] list fields must contain strings")
    return value


if __name__ == "__main__":
    raise SystemExit(main())
