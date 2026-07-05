from __future__ import annotations

import json
import re
import uuid
from dataclasses import dataclass, field
from enum import Enum

from agent_platform.knowledge_base import KnowledgeBase
from agent_platform.llm import OpenAICompatibleChatClient
from agent_platform.retrieval import HybridRetriever
from agent_platform.web_search import WebSearchClient, WebSearchError


class ResearchSourceType(str, Enum):
    KNOWLEDGE_BASE = "knowledge_base"
    WEB = "web"


@dataclass(frozen=True)
class ResearchSource:
    source_id: str
    title: str
    snippet: str
    doc_id: str | None = None
    url: str = ""
    score: float = 0.0
    source_type: ResearchSourceType = ResearchSourceType.KNOWLEDGE_BASE
    provider: str = ""


@dataclass
class DeepResearchReport:
    report_id: str
    query: str
    sub_questions: list[str]
    markdown: str
    sources: list[ResearchSource] = field(default_factory=list)
    generator: str = "offline"
    uncertainty_notes: list[str] = field(default_factory=list)
    web_source_count: int = 0
    kb_source_count: int = 0


_DEFAULT_SUB_QUESTION_TEMPLATES = (
    "这个主题的核心问题是什么？",
    "现有方案或竞品有哪些？",
    "技术实现的关键约束是什么？",
    "风险与不确定性在哪里？",
)


def plan_sub_questions(query: str, *, llm_client: OpenAICompatibleChatClient | None = None) -> list[str]:
    if llm_client is not None:
        raw = llm_client.complete(
            system_prompt="你是调研规划助手。把用户问题拆成 3-5 个可检索子问题，输出 JSON 数组。",
            user_prompt=f"主题：{query}",
        )
        try:
            cleaned = raw.strip()
            if cleaned.startswith("```"):
                cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
                cleaned = re.sub(r"\s*```$", "", cleaned)
            payload = json.loads(cleaned)
            if isinstance(payload, list):
                items = [str(item).strip() for item in payload if str(item).strip()]
                if items:
                    return items[:5]
        except (json.JSONDecodeError, TypeError):
            pass

    trimmed = query.strip() or "未命名调研主题"
    return [
        f"{trimmed}：{template}"
        for template in _DEFAULT_SUB_QUESTION_TEMPLATES[:4]
    ]


def _collect_kb_sources(
    knowledge_base: KnowledgeBase,
    sub_questions: list[str],
    *,
    limit_per_question: int = 2,
) -> list[ResearchSource]:
    retriever = HybridRetriever.from_knowledge_base(knowledge_base)
    seen: set[str] = set()
    sources: list[ResearchSource] = []

    for question in sub_questions:
        for chunk in retriever.retrieve(question, limit=limit_per_question):
            if chunk.chunk_id in seen:
                continue
            seen.add(chunk.chunk_id)
            sources.append(
                ResearchSource(
                    source_id=f"src-{len(sources) + 1}",
                    title=chunk.title,
                    snippet=chunk.snippet,
                    doc_id=chunk.doc_id,
                    url=f"kb://{chunk.doc_id}/{chunk.chunk_id}",
                    score=chunk.score,
                    source_type=ResearchSourceType.KNOWLEDGE_BASE,
                    provider="hybrid_retriever",
                )
            )
    return sources


def _collect_web_sources(
    web_search_client: WebSearchClient,
    sub_questions: list[str],
    *,
    limit_per_question: int = 3,
) -> list[ResearchSource]:
    seen_urls: set[str] = set()
    sources: list[ResearchSource] = []

    for question in sub_questions:
        try:
            results = web_search_client.search(question, limit=limit_per_question)
        except WebSearchError:
            continue
        for result in results:
            if result.url in seen_urls:
                continue
            seen_urls.add(result.url)
            sources.append(
                ResearchSource(
                    source_id=f"src-{len(sources) + 1}",
                    title=result.title,
                    snippet=result.snippet,
                    url=result.url,
                    score=result.score,
                    source_type=ResearchSourceType.WEB,
                    provider=result.provider,
                )
            )
    return sources


def _merge_sources(
    web_sources: list[ResearchSource],
    kb_sources: list[ResearchSource],
    *,
    max_sources: int = 12,
) -> list[ResearchSource]:
    merged: list[ResearchSource] = []
    seen: set[str] = set()

    for source in web_sources + kb_sources:
        key = source.url or source.source_id
        if key in seen:
            continue
        seen.add(key)
        merged.append(
            ResearchSource(
                source_id=f"src-{len(merged) + 1}",
                title=source.title,
                snippet=source.snippet,
                doc_id=source.doc_id,
                url=source.url,
                score=source.score,
                source_type=source.source_type,
                provider=source.provider,
            )
        )
        if len(merged) >= max_sources:
            break
    return merged


def _render_markdown(
    query: str,
    sub_questions: list[str],
    sources: list[ResearchSource],
    *,
    uncertainty_notes: list[str],
) -> str:
    lines = [
        f"# Deep Research 报告：{query}",
        "",
        "## 子问题",
        "",
    ]
    for index, question in enumerate(sub_questions, start=1):
        lines.append(f"{index}. {question}")
    lines.extend(["", "## 综合结论", ""])
    for index, question in enumerate(sub_questions, start=1):
        related = sources[(index - 1) % len(sources)] if sources else None
        footnote = f"[^{index}]" if related else ""
        body = related.snippet if related else "暂无足够资料，建议补充检索。"
        lines.append(f"### {index}. {question}")
        lines.append("")
        lines.append(f"{body}{footnote}")
        lines.append("")
    if uncertainty_notes:
        lines.extend(["## 不确定性说明", ""])
        for note in uncertainty_notes:
            lines.append(f"- {note}")
        lines.append("")
    if sources:
        lines.extend(["## 脚注", ""])
        for index, source in enumerate(sources, start=1):
            source_label = "外网" if source.source_type == ResearchSourceType.WEB else "内部"
            lines.append(
                f"[^{index}]: [{source_label}] 《{source.title}》({source.url}) — {source.snippet[:120]}"
            )
        lines.append("")
    return "\n".join(lines).strip() + "\n"


def _resolve_generator(
    *,
    llm_client: OpenAICompatibleChatClient | None,
    web_sources: list[ResearchSource],
    kb_sources: list[ResearchSource],
) -> str:
    if web_sources and kb_sources:
        return "hybrid"
    if web_sources:
        return "web"
    if llm_client:
        return "llm"
    return "offline"


def run_deep_research(
    query: str,
    knowledge_base: KnowledgeBase,
    *,
    llm_client: OpenAICompatibleChatClient | None = None,
    web_search_client: WebSearchClient | None = None,
) -> DeepResearchReport:
    sub_questions = plan_sub_questions(query, llm_client=llm_client)
    kb_sources = _collect_kb_sources(knowledge_base, sub_questions)
    web_sources: list[ResearchSource] = []
    if web_search_client is not None:
        web_sources = _collect_web_sources(web_search_client, sub_questions)
    sources = _merge_sources(web_sources, kb_sources)

    uncertainty: list[str] = []
    if not web_sources and web_search_client is None:
        uncertainty.append(
            "未配置外网搜索（TAVILY_API_KEY 或 SERPER_API_KEY），当前仅使用内部知识库。"
        )
    elif web_search_client is not None and not web_sources:
        uncertainty.append("外网搜索未返回有效结果，已回退到内部知识库。")
    if len(sources) < 2:
        uncertainty.append("可用来源较少，结论置信度有限，建议人工复核。")
    if not llm_client:
        uncertainty.append("当前为离线子问题规划；配置 OPENAI_API_KEY 后可增强拆解质量。")

    markdown = _render_markdown(
        query,
        sub_questions,
        sources,
        uncertainty_notes=uncertainty,
    )
    return DeepResearchReport(
        report_id=str(uuid.uuid4()),
        query=query.strip() or "未命名调研",
        sub_questions=sub_questions,
        markdown=markdown,
        sources=sources,
        generator=_resolve_generator(
            llm_client=llm_client,
            web_sources=web_sources,
            kb_sources=kb_sources,
        ),
        uncertainty_notes=uncertainty,
        web_source_count=len(web_sources),
        kb_source_count=len(kb_sources),
    )
