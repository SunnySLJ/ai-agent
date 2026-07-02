from __future__ import annotations

import os
from dataclasses import asdict, is_dataclass
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from agent_platform.agent import AgentPlatform
from agent_platform.document_parser import parse_document_content
from agent_platform.embeddings import embedding_model_from_env
from agent_platform.java_tools import JavaBusinessToolRegistry
from agent_platform.llm import OpenAICompatibleChatClient
from agent_platform.models import Document
from agent_platform.tools import BusinessToolRegistry
from agent_platform.vector_store import QdrantVectorIndex


class DocumentPayload(BaseModel):
    doc_id: str = Field(min_length=1)
    title: str = Field(min_length=1)
    content: str = Field(min_length=1)
    content_type: str = "text/plain"


class QuestionPayload(BaseModel):
    question: str = Field(min_length=1)
    session_id: str | None = None


def create_app(platform: AgentPlatform | None = None) -> FastAPI:
    app = FastAPI(
        title="Agent Platform",
        version="0.1.0",
        description="Python Agent/RAG API for Java business tool integration",
    )
    agent = platform or _default_platform()

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

    return app


def _default_platform() -> AgentPlatform:
    java_tool_base_url = os.environ.get("JAVA_TOOL_BASE_URL")
    qdrant_base_url = os.environ.get("QDRANT_BASE_URL")
    answer_generator = _answer_generator_from_env()
    embedding_model = embedding_model_from_env()
    if qdrant_base_url:
        tools = (
            JavaBusinessToolRegistry(java_tool_base_url)
            if java_tool_base_url
            else BusinessToolRegistry()
        )
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
    if java_tool_base_url:
        return AgentPlatform.with_java_tools(
            java_tool_base_url,
            answer_generator,
            embedding_model=embedding_model,
        )
    return AgentPlatform.offline_demo(answer_generator, embedding_model=embedding_model)


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
