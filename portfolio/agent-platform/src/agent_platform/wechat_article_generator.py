from __future__ import annotations

import json
import re
import textwrap
import uuid
from dataclasses import dataclass, field
from html import escape

from agent_platform.book_parser import BookDocument, BookImage, guess_book_title
from agent_platform.llm import OpenAICompatibleChatClient


@dataclass
class ArticleSection:
    heading: str
    body: str
    image_id: str | None = None
    quote: str | None = None


@dataclass
class WechatArticle:
    article_id: str
    title: str
    subtitle: str
    hook: str
    essence: list[str]
    action_items: list[str]
    sections: list[ArticleSection]
    html: str
    markdown: str
    images: list[BookImage]
    generator: str
    page_count: int
    publish_tips: list[str] = field(default_factory=list)


def generate_wechat_article(
    book: BookDocument,
    *,
    book_title: str | None = None,
    author: str | None = None,
    llm_client: OpenAICompatibleChatClient | None = None,
    max_source_chars: int = 24_000,
) -> WechatArticle:
    source_text = book.full_text[:max_source_chars]
    resolved_title = book_title or guess_book_title(source_text, book.title_hint)

    if llm_client is not None and source_text.strip():
        draft = _generate_with_llm(
            llm_client,
            book_title=resolved_title,
            author=author,
            source_text=source_text,
            image_count=len(book.images),
        )
        generator = "llm"
    else:
        draft = _generate_offline(
            book_title=resolved_title,
            author=author,
            source_text=source_text,
        )
        generator = "offline"

    sections = _attach_images(draft["sections"], book.images)
    essence = list(draft.get("essence", []))
    action_items = list(draft.get("action_items", []))
    article_id = str(uuid.uuid4())

    markdown = _render_markdown(
        title=draft["title"],
        subtitle=draft["subtitle"],
        hook=draft["hook"],
        essence=essence,
        sections=sections,
        action_items=action_items,
        images=book.images,
        author=author,
    )
    html = _render_html(
        title=draft["title"],
        subtitle=draft["subtitle"],
        hook=draft["hook"],
        essence=essence,
        sections=sections,
        action_items=action_items,
        images=book.images,
        author=author,
    )

    return WechatArticle(
        article_id=article_id,
        title=draft["title"],
        subtitle=draft["subtitle"],
        hook=draft["hook"],
        essence=essence,
        action_items=action_items,
        sections=sections,
        html=html,
        markdown=markdown,
        images=book.images,
        generator=generator,
        page_count=book.page_count,
        publish_tips=_publish_tips(),
    )


def _generate_with_llm(
    llm_client: OpenAICompatibleChatClient,
    *,
    book_title: str,
    author: str | None,
    source_text: str,
    image_count: int,
) -> dict:
    system_prompt = (
        "你是资深读书博主和公众号主编。请基于提供的书籍原文摘录，"
        "生成一篇可直接发布的微信公众号文章 JSON。"
        "文章要让读者快速掌握全书精髓，同时保持可读性和传播性。"
        "不要编造书中没有的观点；信息不足时保守概括。"
    )
    user_prompt = textwrap.dedent(
        f"""
        书名：{book_title}
        作者：{author or "未知"}
        可用配图数量：{image_count}

        请输出 JSON（不要 markdown 代码块），字段：
        {{
          "title": "公众号标题，20-28字，吸引人",
          "subtitle": "副标题，补充价值",
          "hook": "开篇引子，2-3句",
          "essence": ["全书精髓1", "精髓2", "精髓3", "精髓4", "精髓5"],
          "action_items": ["学以致用建议1", "建议2", "建议3"],
          "sections": [
            {{
              "heading": "小标题",
              "body": "正文段落，200-350字，口语化但专业",
              "quote": "可选金句"
            }}
          ]
        }}

        要求：
        - sections 数量 4-6 个
        - essence 5 条，每条一句话，适合学习复盘
        - 语气适合中文公众号，段落短，便于手机阅读

        书籍原文摘录：
        {source_text}
        """
    ).strip()
    raw = llm_client.complete(system_prompt=system_prompt, user_prompt=user_prompt)
    return _parse_llm_json(raw, fallback_title=book_title)


def _parse_llm_json(raw: str, *, fallback_title: str) -> dict:
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        payload = json.loads(cleaned)
    except json.JSONDecodeError:
        return _generate_offline(book_title=fallback_title, author=None, source_text=cleaned)

    sections = []
    for item in payload.get("sections", []):
        if not isinstance(item, dict):
            continue
        heading = str(item.get("heading", "")).strip()
        body = str(item.get("body", "")).strip()
        if heading and body:
            quote = str(item.get("quote", "")).strip() or None
            sections.append({"heading": heading, "body": body, "quote": quote})

    if not sections:
        return _generate_offline(
            book_title=str(payload.get("title", fallback_title)),
            author=None,
            source_text=cleaned,
        )

    return {
        "title": str(payload.get("title", fallback_title)).strip() or fallback_title,
        "subtitle": str(payload.get("subtitle", "一本书读懂核心方法")).strip(),
        "hook": str(payload.get("hook", "")).strip()
        or "这本书值得你用一篇推文的时间，换一套更清晰的认知框架。",
        "essence": [
            str(item).strip()
            for item in payload.get("essence", [])
            if str(item).strip()
        ][:6],
        "action_items": [
            str(item).strip()
            for item in payload.get("action_items", [])
            if str(item).strip()
        ][:5],
        "sections": sections,
    }


def _generate_offline(
    *,
    book_title: str,
    author: str | None,
    source_text: str,
) -> dict:
    paragraphs = [
        paragraph.strip()
        for paragraph in re.split(r"\n{2,}", source_text)
        if len(paragraph.strip()) >= 40
    ]
    if not paragraphs:
        paragraphs = [line.strip() for line in source_text.splitlines() if line.strip()]

    lead = paragraphs[0][:180] if paragraphs else f"《{book_title}》值得精读。"
    chunks = paragraphs[1:7] if len(paragraphs) > 1 else paragraphs
    if not chunks:
        chunks = [lead]

    sections = []
    headings = [
        "这本书解决什么问题",
        "最值得记住的核心观点",
        "作者的方法论亮点",
        "对读者的现实启发",
        "你可以立刻行动的一件事",
    ]
    for index, chunk in enumerate(chunks[:5]):
        heading = headings[index] if index < len(headings) else f"关键洞察 {index + 1}"
        body = textwrap.fill(chunk[:500], width=36)
        sections.append({"heading": heading, "body": body, "quote": None})

    essence = []
    for chunk in chunks[:5]:
        for sentence in re.split(r"[。！？!?，,；;]", chunk):
            cleaned = sentence.strip()
            if len(cleaned) >= 12:
                essence.append(cleaned[:60])
            if len(essence) >= 5:
                break
        if len(essence) >= 5:
            break
    if len(essence) < 3:
        essence.extend(
            [
                f"《{book_title}》的核心价值在于提供可执行的方法，而不是空泛概念。",
                "阅读时要关注问题定义、解决路径和边界条件。",
                "把书里的框架转成自己的检查清单，才算真正读懂。",
            ]
        )

    return {
        "title": f"读完《{book_title}》，我提炼了 {len(essence)} 条精髓",
        "subtitle": f"{author + ' 著 · ' if author else ''}读书复盘笔记",
        "hook": (
            f"如果你没时间通读全书，这篇帮你用 5 分钟抓住《{book_title}》的主线。"
            f"{lead}"
        ),
        "essence": essence[:5],
        "action_items": [
            "把精髓写成 3 条自己的话复述一遍",
            "选 1 个场景在本周内做最小实践",
            "把最有共鸣的一段截图收藏，月底复盘",
        ],
        "sections": sections,
    }


def _attach_images(
    sections: list[dict],
    images: list[BookImage],
) -> list[ArticleSection]:
    if not images:
        return [
            ArticleSection(
                heading=item["heading"],
                body=item["body"],
                quote=item.get("quote"),
            )
            for item in sections
        ]

    result: list[ArticleSection] = []
    for index, item in enumerate(sections):
        image = images[index % len(images)] if images else None
        result.append(
            ArticleSection(
                heading=item["heading"],
                body=item["body"],
                quote=item.get("quote"),
                image_id=image.image_id if image else None,
            )
        )
    return result


def _image_by_id(images: list[BookImage]) -> dict[str, BookImage]:
    return {image.image_id: image for image in images}


def _render_markdown(
    *,
    title: str,
    subtitle: str,
    hook: str,
    essence: list[str],
    sections: list[ArticleSection],
    action_items: list[str],
    images: list[BookImage],
    author: str | None,
) -> str:
    lookup = _image_by_id(images)
    lines = [
        f"# {title}",
        "",
        f"_{subtitle}_",
        "",
        hook,
        "",
        "## 全书精髓（学习卡片）",
        "",
    ]
    for index, item in enumerate(essence, start=1):
        lines.append(f"{index}. {item}")
    lines.extend(["", "---", ""])
    for section in sections:
        lines.append(f"## {section.heading}")
        lines.append("")
        lines.append(section.body)
        if section.quote:
            lines.append("")
            lines.append(f"> {section.quote}")
        if section.image_id and section.image_id in lookup:
            image = lookup[section.image_id]
            lines.append("")
            lines.append(f"![配图-第{image.page_number}页]({image.data_url()})")
        lines.append("")
    if action_items:
        lines.append("## 学以致用")
        lines.append("")
        for item in action_items:
            lines.append(f"- {item}")
        lines.append("")
    if author:
        lines.append(f"\n*整理自 {author} 《{title}》*")
    return "\n".join(lines).strip() + "\n"


def _render_html(
    *,
    title: str,
    subtitle: str,
    hook: str,
    essence: list[str],
    sections: list[ArticleSection],
    action_items: list[str],
    images: list[BookImage],
    author: str | None,
) -> str:
    lookup = _image_by_id(images)
    essence_html = "".join(
        f'<li style="margin-bottom:10px;">{escape(item)}</li>' for item in essence
    )
    sections_html = []
    for section in sections:
        quote_html = ""
        if section.quote:
            quote_html = (
                f'<blockquote style="margin:16px 0;padding:12px 16px;border-left:4px solid #0f6cbd;'
                f'background:#f5f9ff;color:#334155;">{escape(section.quote)}</blockquote>'
            )
        image_html = ""
        if section.image_id and section.image_id in lookup:
            image = lookup[section.image_id]
            image_html = (
                f'<p style="margin:18px 0;text-align:center;">'
                f'<img src="{image.data_url()}" alt="配图" '
                f'style="max-width:100%;border-radius:12px;" />'
                f'<br /><span style="color:#64748b;font-size:13px;">'
                f'图源：原书第 {image.page_number} 页</span></p>'
            )
        sections_html.append(
            f"""
            <section style="margin:28px 0;">
              <h2 style="font-size:20px;color:#0f172a;border-left:4px solid #0f6cbd;padding-left:12px;">
                {escape(section.heading)}
              </h2>
              <p style="font-size:16px;line-height:1.9;color:#334155;margin:14px 0;">
                {escape(section.body).replace(chr(10), '<br />')}
              </p>
              {quote_html}
              {image_html}
            </section>
            """
        )

    action_html = ""
    if action_items:
        action_html = (
            "<h2 style=\"font-size:20px;color:#0f172a;\">学以致用</h2><ul>"
            + "".join(f"<li style='margin-bottom:8px;'>{escape(item)}</li>" for item in action_items)
            + "</ul>"
        )

    author_html = (
        f'<p style="color:#64748b;font-size:14px;margin-top:28px;">整理自 {escape(author)}</p>'
        if author
        else ""
    )

    return textwrap.dedent(
        f"""
        <section style="max-width:680px;margin:0 auto;padding:8px 12px 32px;font-family:'PingFang SC','Helvetica Neue',sans-serif;">
          <h1 style="font-size:26px;line-height:1.45;color:#0f172a;margin:0 0 10px;">{escape(title)}</h1>
          <p style="font-size:15px;color:#64748b;margin:0 0 18px;">{escape(subtitle)}</p>
          <p style="font-size:16px;line-height:1.9;color:#334155;margin:0 0 24px;">{escape(hook)}</p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:18px 20px;margin-bottom:24px;">
            <h2 style="font-size:18px;margin:0 0 12px;color:#0f172a;">全书精髓（建议收藏）</h2>
            <ol style="margin:0;padding-left:20px;color:#334155;line-height:1.8;">{essence_html}</ol>
          </div>
          {''.join(sections_html)}
          {action_html}
          {author_html}
        </section>
        """
    ).strip()


def _publish_tips() -> list[str]:
    return [
        "复制 HTML 到公众号编辑器（或壹伴/秀米）后，检查图片是否正常显示。",
        "若图片未自动上传，请使用下方图片包逐张插入对应段落。",
        "发布前把「全书精髓」区块单独截图，可作为朋友圈传播素材。",
        "建议标题保留数字或问题句式，提升打开率。",
    ]
