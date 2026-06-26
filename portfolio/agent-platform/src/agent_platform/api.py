from __future__ import annotations

import os
from dataclasses import asdict, is_dataclass
from typing import Any

from fastapi import FastAPI
from pydantic import BaseModel, Field

from agent_platform.agent import AgentPlatform
from agent_platform.models import Document


class DocumentPayload(BaseModel):
    doc_id: str = Field(min_length=1)
    title: str = Field(min_length=1)
    content: str = Field(min_length=1)


class QuestionPayload(BaseModel):
    question: str = Field(min_length=1)


def create_app(platform: AgentPlatform | None = None) -> FastAPI:
    app = FastAPI(
        title="Agent Platform",
        version="0.1.0",
        description="Python-led Agent/RAG platform API",
    )
    agent = platform or _default_platform()

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.post("/documents")
    def ingest_document(payload: DocumentPayload) -> dict[str, Any]:
        agent.ingest(
            Document(
                doc_id=payload.doc_id,
                title=payload.title,
                content=payload.content,
            )
        )
        return {"accepted": True, "doc_id": payload.doc_id}

    @app.post("/ask")
    def ask(payload: QuestionPayload) -> dict[str, Any]:
        return to_json(agent.ask(payload.question))

    @app.get("/summary")
    def summary() -> dict[str, Any]:
        return to_json(agent.summary())

    @app.get("/tools")
    def tools() -> dict[str, list[str]]:
        return {"tools": agent.available_tools()}

    return app


def _default_platform() -> AgentPlatform:
    java_tool_base_url = os.environ.get("JAVA_TOOL_BASE_URL")
    if java_tool_base_url:
        return AgentPlatform.with_java_tools(java_tool_base_url)
    return AgentPlatform.offline_demo()


app = create_app()


def to_json(value: Any) -> Any:
    if is_dataclass(value):
        return {key: to_json(item) for key, item in asdict(value).items()}
    if isinstance(value, list):
        return [to_json(item) for item in value]
    if isinstance(value, dict):
        return {key: to_json(item) for key, item in value.items()}
    return value
