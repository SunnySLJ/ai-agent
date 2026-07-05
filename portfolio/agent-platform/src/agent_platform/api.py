from __future__ import annotations

import os
from dataclasses import asdict, is_dataclass
from typing import Any

from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from agent_platform.agent import AgentPlatform
from agent_platform.book_parser import parse_pdf_book
from agent_platform.document_parser import parse_document_content
from agent_platform.embeddings import embedding_model_from_env
from agent_platform.llm import OpenAICompatibleChatClient
from agent_platform.models import Document
from agent_platform.tools import NoOpToolRegistry
from agent_platform.vector_store import QdrantVectorIndex
from agent_platform.deep_research import run_deep_research
from agent_platform.forge_context import summarize_prior_run_context
from agent_platform.forge_store import ForgeRunStore
from agent_platform.forge_supervisor import supervisor_plan
from agent_platform.project_forge import (
    STAGE_AGENTS,
    STAGE_LABELS,
    STAGE_ORDER,
    run_project_forge_demo,
)
from agent_platform.verified_knowledge import verify_text
from agent_platform.wechat_article_generator import WechatArticle, generate_wechat_article
from agent_platform.web_search import web_search_client_from_env


class DocumentPayload(BaseModel):
    doc_id: str = Field(min_length=1)
    title: str = Field(min_length=1)
    content: str = Field(min_length=1)
    content_type: str = "text/plain"


class QuestionPayload(BaseModel):
    question: str = Field(min_length=1)
    session_id: str | None = None


class VerifyTextPayload(BaseModel):
    text: str = Field(min_length=1)
    source_stage: str = "general"
    use_llm: bool = False


class ProjectForgeDemoPayload(BaseModel):
    idea: str = Field(min_length=1)
    prior_run_id: str | None = None


class DeepResearchPayload(BaseModel):
    query: str = Field(min_length=1)
    use_web_search: bool = True


_FORGE_SEED_CONTENT = """
ProjectForge Agent 是全链路造物智能体，覆盖需求调研、原型、架构、PRD、开发、测试与部署。
查证型知识库通过 Claim-Evidence 对齐降低幻觉，架构阶段与 PRD 阶段必须经过查证门控。
企业知识库 RAG 支持 Markdown 与 PDF 入库，回答必须带 citation，低置信度需要拒答。
DeepResearch 用于多步外网调研、子问题拆解与脚注报告，适合竞品与行业扫描。
推荐方案是将 verified_knowledge 内嵌到 agent-platform，配合 project_forge 九阶段编排与 Next.js 工作台。
""".strip()


def create_app(platform: AgentPlatform | None = None) -> FastAPI:
    app = FastAPI(
        title="Agent Platform",
        version="0.1.0",
        description="Python Agent/RAG API focused on knowledge-base Q&A with citations",
    )
    agent = platform or _default_platform()
    forge_store = _default_forge_store()
    forge_store.load_from_disk()

    cors_origins = os.environ.get(
        "CORS_ALLOW_ORIGINS",
        "http://127.0.0.1:3000,http://localhost:3000",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[origin.strip() for origin in cors_origins.split(",") if origin.strip()],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.post("/documents")
    def ingest_document(payload: DocumentPayload) -> dict[str, Any]:
        parsed_content = parse_document_content(payload.content, payload.content_type)
        agent.ingest(
            Document(
                doc_id=payload.doc_id,
                title=payload.title,
                content=parsed_content,
            )
        )
        return {
            "accepted": True,
            "doc_id": payload.doc_id,
            "content_type": payload.content_type,
        }

    @app.post("/ask")
    def ask(payload: QuestionPayload) -> dict[str, Any]:
        return to_json(agent.ask(payload.question, session_id=payload.session_id))

    @app.post("/ask/stream")
    def ask_stream(payload: QuestionPayload) -> StreamingResponse:
        return StreamingResponse(
            agent.ask_stream(payload.question, session_id=payload.session_id),
            media_type="text/event-stream",
        )

    @app.get("/sessions/{session_id}")
    def get_session(session_id: str) -> dict[str, Any]:
        session = agent.get_session(session_id)
        if session is None:
            return {"session_id": session_id, "turns": []}
        return {
            "session_id": session.session_id,
            "turns": [
                {"question": turn.question, "answer": turn.answer}
                for turn in session.turns
            ],
        }

    @app.get("/approvals/{approval_id}")
    def get_approval(approval_id: str) -> dict[str, Any]:
        approval = agent.get_approval(approval_id)
        if approval is None:
            return {"approval_id": approval_id, "status": "not_found"}
        return {
            "approval_id": approval.approval_id,
            "tool_name": approval.tool_name,
            "arguments": approval.arguments,
            "question": approval.question,
            "session_id": approval.session_id,
            "status": "confirmed" if approval.confirmed else "pending",
        }

    @app.post("/approvals/{approval_id}/confirm")
    def confirm_approval(approval_id: str) -> dict[str, Any]:
        return to_json(agent.confirm_approval(approval_id))

    @app.get("/summary")
    def summary() -> dict[str, Any]:
        return to_json(agent.summary())

    @app.get("/tools")
    def tools() -> dict[str, list[str]]:
        return {"tools": agent.available_tools()}

    @app.post("/wechat-articles/generate")
    async def generate_wechat_article_from_book(
        file: UploadFile = File(...),
        book_title: str | None = Form(default=None),
        author: str | None = Form(default=None),
    ) -> dict[str, Any]:
        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="请上传 PDF 格式的书籍文件")
        pdf_bytes = await file.read()
        if not pdf_bytes:
            raise HTTPException(status_code=400, detail="上传文件为空")

        try:
            book = parse_pdf_book(
                pdf_bytes,
                title_hint=book_title or file.filename.rsplit(".", 1)[0],
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

        article = generate_wechat_article(
            book,
            book_title=book_title,
            author=author,
            llm_client=_answer_generator_from_env(),
        )
        return {"accepted": True, **wechat_article_to_json(article)}

    @app.get("/project-forge/stages")
    def project_forge_stages() -> dict[str, Any]:
        return {
            "stages": [
                {
                    "stage_id": stage.value,
                    "label": STAGE_LABELS[stage],
                    "agent": STAGE_AGENTS[stage],
                    "order": index + 1,
                }
                for index, stage in enumerate(STAGE_ORDER)
            ],
            "supervisor_plan": [
                {
                    "stage_id": route.stage_id,
                    "agent_name": route.agent_name,
                    "agent_kind": route.agent_kind.value,
                    "requires_verification": route.requires_verification,
                }
                for route in supervisor_plan()
            ],
        }

    @app.post("/deep-research/run")
    def deep_research_run(payload: DeepResearchPayload) -> dict[str, Any]:
        _ensure_forge_seed_docs(agent)
        web_client = web_search_client_from_env() if payload.use_web_search else None
        report = run_deep_research(
            payload.query,
            agent.knowledge_base,
            llm_client=_answer_generator_from_env(),
            web_search_client=web_client,
        )
        return deep_research_report_to_json(report)

    @app.post("/verified-knowledge/verify")
    def verify_knowledge_text(payload: VerifyTextPayload) -> dict[str, Any]:
        _ensure_forge_seed_docs(agent)
        llm_client = _answer_generator_from_env() if payload.use_llm else None
        report = verify_text(
            payload.text,
            agent.knowledge_base,
            source_stage=payload.source_stage,
            llm_client=llm_client,
        )
        return verification_report_to_json(report)

    @app.post("/project-forge/demo")
    def project_forge_demo(payload: ProjectForgeDemoPayload) -> dict[str, Any]:
        _ensure_forge_seed_docs(agent)
        prior_context = ""
        parent_run_id = payload.prior_run_id
        if parent_run_id:
            prior_run = forge_store.get(parent_run_id)
            if prior_run is None:
                raise HTTPException(status_code=404, detail="prior run not found")
            prior_context = summarize_prior_run_context(prior_run)

        run = run_project_forge_demo(
            payload.idea,
            agent.knowledge_base,
            llm_client=_answer_generator_from_env(),
            web_search_client=web_search_client_from_env(),
            artifacts_dir=_artifacts_dir(),
            prior_context=prior_context,
            parent_run_id=parent_run_id,
        )
        forge_store.save(run)
        return project_forge_run_to_json(run)

    @app.get("/project-forge/runs")
    def project_forge_runs() -> dict[str, Any]:
        return {"runs": forge_store.list_runs()}

    @app.get("/project-forge/runs/{run_id}")
    def project_forge_run_detail(run_id: str) -> dict[str, Any]:
        payload = forge_store.get(run_id)
        if payload is None:
            raise HTTPException(status_code=404, detail="run not found")
        return payload

    return app


def _artifacts_dir() -> Path:
    return Path(
        os.environ.get(
            "FORGE_ARTIFACTS_DIR",
            str(Path(__file__).resolve().parents[2] / "project-forge" / "artifacts"),
        )
    )


def _default_forge_store() -> ForgeRunStore:
    persist_path = os.environ.get("FORGE_RUNS_PATH")
    return ForgeRunStore(
        persist_path=Path(persist_path) if persist_path else _artifacts_dir().parent / "runs.json",
    )


def _ensure_forge_seed_docs(agent: AgentPlatform) -> None:
    if agent.knowledge_base.chunks():
        return
    agent.ingest(
        Document(
            doc_id="project-forge-plan",
            title="ProjectForge Master Plan",
            content=_FORGE_SEED_CONTENT,
        )
    )


def _default_platform() -> AgentPlatform:
    qdrant_base_url = os.environ.get("QDRANT_BASE_URL")
    answer_generator = _answer_generator_from_env()
    embedding_model = embedding_model_from_env()
    tools = NoOpToolRegistry()
    if qdrant_base_url:
        return AgentPlatform.with_qdrant(
            QdrantVectorIndex(
                base_url=qdrant_base_url,
                collection_name=os.environ.get("QDRANT_COLLECTION", "agent_docs"),
                vector_size=embedding_model.vector_size,
                embedding_model=embedding_model,
            ),
            tools=tools,
            answer_generator=answer_generator,
        )
    return AgentPlatform.offline_demo(
        answer_generator,
        embedding_model=embedding_model,
    )


def _answer_generator_from_env() -> OpenAICompatibleChatClient | None:
    api_key = os.environ.get("OPENAI_API_KEY")
    model = os.environ.get("OPENAI_MODEL")
    if not api_key or not model:
        return None
    return OpenAICompatibleChatClient(
        base_url=os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1"),
        api_key=api_key,
        model=model,
    )


app = create_app()


def to_json(value: Any) -> Any:
    if is_dataclass(value):
        return {key: to_json(item) for key, item in asdict(value).items()}
    if isinstance(value, list):
        return [to_json(item) for item in value]
    if isinstance(value, dict):
        return {key: to_json(item) for key, item in value.items()}
    return value


def wechat_article_to_json(article: WechatArticle) -> dict[str, Any]:
    return {
        "article_id": article.article_id,
        "title": article.title,
        "subtitle": article.subtitle,
        "hook": article.hook,
        "essence": article.essence,
        "action_items": article.action_items,
        "sections": [
            {
                "heading": section.heading,
                "body": section.body,
                "image_id": section.image_id,
                "quote": section.quote,
            }
            for section in article.sections
        ],
        "html": article.html,
        "markdown": article.markdown,
        "images": [
            {
                "image_id": image.image_id,
                "page_number": image.page_number,
                "mime_type": image.mime_type,
                "data_base64": image.data_base64,
                "width": image.width,
                "height": image.height,
            }
            for image in article.images
        ],
        "generator": article.generator,
        "page_count": article.page_count,
        "publish_tips": article.publish_tips,
    }


def deep_research_report_to_json(report) -> dict[str, Any]:
    return {
        "report_id": report.report_id,
        "query": report.query,
        "sub_questions": report.sub_questions,
        "markdown": report.markdown,
        "generator": report.generator,
        "uncertainty_notes": report.uncertainty_notes,
        "web_source_count": report.web_source_count,
        "kb_source_count": report.kb_source_count,
        "sources": [
            {
                "source_id": source.source_id,
                "title": source.title,
                "snippet": source.snippet,
                "doc_id": source.doc_id,
                "url": source.url,
                "score": source.score,
                "source_type": source.source_type.value,
                "provider": source.provider,
            }
            for source in report.sources
        ],
    }


def verification_report_to_json(report) -> dict[str, Any]:
    return {
        "report_id": report.report_id,
        "source_text": report.source_text,
        "source_stage": report.source_stage,
        "overall_confidence": report.overall_confidence,
        "should_refuse": report.should_refuse,
        "summary": report.summary,
        "verify_threshold": report.verify_threshold,
        "refuse_threshold": report.refuse_threshold,
        "claims": [
            {
                "claim_id": item.claim.claim_id,
                "text": item.claim.text,
                "source_stage": item.claim.source_stage,
                "status": item.status.value,
                "confidence": item.confidence,
                "links": [
                    {
                        "claim_id": link.claim_id,
                        "evidence_id": link.evidence_id,
                        "relation": link.relation.value,
                        "alignment_score": link.alignment_score,
                        "rationale": link.rationale,
                    }
                    for link in item.links
                ],
                "evidences": [
                    {
                        "evidence_id": evidence.evidence_id,
                        "doc_id": evidence.doc_id,
                        "title": evidence.title,
                        "chunk_id": evidence.chunk_id,
                        "snippet": evidence.snippet,
                        "score": evidence.score,
                        "source_type": evidence.source_type.value,
                    }
                    for evidence in item.evidences
                ],
            }
            for item in report.claims
        ],
    }


def project_forge_run_to_json(run) -> dict[str, Any]:
    return {
        "run_id": run.run_id,
        "idea": run.idea,
        "overall_status": run.overall_status,
        "current_stage": run.current_stage.value,
        "deploy_url": run.deploy_url,
        "repository": run.repository,
        "parent_run_id": run.parent_run_id,
        "stages": [
            {
                "stage_id": stage.stage_id.value,
                "label": STAGE_LABELS[stage.stage_id],
                "agent": STAGE_AGENTS[stage.stage_id],
                "title": stage.title,
                "summary": stage.summary,
                "markdown": stage.markdown,
                "engine": stage.engine,
                "status": stage.status,
                "verification": (
                    verification_report_to_json(stage.verification)
                    if stage.verification is not None
                    else None
                ),
            }
            for stage in run.stages
        ],
    }
