from __future__ import annotations

import json
import re
import uuid
from dataclasses import dataclass, field
from enum import Enum

from agent_platform.knowledge_base import KnowledgeBase
from agent_platform.llm import OpenAICompatibleChatClient
from agent_platform.models import RetrievedChunk
from agent_platform.retrieval import HybridRetriever


class EvidenceSourceType(str, Enum):
    KNOWLEDGE_BASE = "knowledge_base"
    DEEP_RESEARCH = "deep_research"
    MANUAL = "manual"


class ClaimEvidenceRelation(str, Enum):
    SUPPORTS = "supports"
    PARTIAL = "partial"
    CONTRADICTS = "contradicts"
    UNRELATED = "unrelated"


class VerifiedClaimStatus(str, Enum):
    VERIFIED = "verified"
    PENDING_REVIEW = "pending_review"
    WEAK = "weak"  # 兼容旧客户端；新逻辑优先输出 pending_review
    UNVERIFIED = "unverified"
    CONTRADICTED = "contradicted"


@dataclass(frozen=True)
class Claim:
    claim_id: str
    text: str
    source_stage: str = "general"
    context: str = ""


@dataclass(frozen=True)
class Evidence:
    evidence_id: str
    doc_id: str
    title: str
    chunk_id: str
    snippet: str
    score: float
    source_type: EvidenceSourceType = EvidenceSourceType.KNOWLEDGE_BASE


@dataclass(frozen=True)
class ClaimEvidenceLink:
    claim_id: str
    evidence_id: str
    relation: ClaimEvidenceRelation
    alignment_score: float
    rationale: str


@dataclass
class VerifiedClaim:
    claim: Claim
    links: list[ClaimEvidenceLink] = field(default_factory=list)
    evidences: list[Evidence] = field(default_factory=list)
    status: VerifiedClaimStatus = VerifiedClaimStatus.UNVERIFIED
    confidence: float = 0.0


@dataclass
class VerificationReport:
    report_id: str
    source_text: str
    source_stage: str
    claims: list[VerifiedClaim]
    overall_confidence: float
    should_refuse: bool
    summary: str
    verify_threshold: float
    refuse_threshold: float


@dataclass(frozen=True)
class VerificationConfig:
    verify_threshold: float = 0.55
    refuse_threshold: float = 0.35
    min_evidence_score: float = 0.15
    evidence_limit: int = 3
    contradiction_penalty: float = 0.25


_CONTRADICTION_MARKERS = (
    "不是",
    "并非",
    "没有",
    "不支持",
    "错误",
    "相反",
    "not ",
    "no ",
    "without ",
)


def _extract_claims_llm(
    text: str,
    *,
    source_stage: str,
    max_claims: int,
    llm_client: OpenAICompatibleChatClient,
) -> list[Claim]:
    raw = llm_client.complete(
        system_prompt=(
            "你是文档审核助手。从用户文本中抽取可核验的事实主张（claim），"
            "每条 15～80 字，输出 JSON 数组字符串，不要 markdown。"
        ),
        user_prompt=f"来源阶段：{source_stage}\n\n文本：\n{text[:4000]}",
    )
    try:
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
            cleaned = re.sub(r"\s*```$", "", cleaned)
        payload = json.loads(cleaned)
        if not isinstance(payload, list):
            return []
        claims: list[Claim] = []
        for index, item in enumerate(payload[:max_claims]):
            claim_text = str(item).strip()
            if len(claim_text) >= 8:
                claims.append(
                    Claim(
                        claim_id=f"claim-{index + 1}",
                        text=claim_text,
                        source_stage=source_stage,
                        context=text[:240],
                    )
                )
        return claims
    except (json.JSONDecodeError, TypeError):
        return []


def extract_claims(
    text: str,
    *,
    source_stage: str = "general",
    max_claims: int = 12,
    llm_client: OpenAICompatibleChatClient | None = None,
) -> list[Claim]:
    normalized = text.strip()
    if not normalized:
        return []

    if llm_client is not None:
        llm_claims = _extract_claims_llm(
            normalized,
            source_stage=source_stage,
            max_claims=max_claims,
            llm_client=llm_client,
        )
        if llm_claims:
            return llm_claims

    candidates: list[str] = []
    for paragraph in re.split(r"\n{2,}", normalized):
        paragraph = paragraph.strip()
        if not paragraph:
            continue
        for sentence in re.split(r"(?<=[。！？!?；;])\s*|\n+", paragraph):
            cleaned = sentence.strip(" \t-•*")
            if len(cleaned) >= 12:
                candidates.append(cleaned)

    if not candidates:
        candidates = [line.strip() for line in normalized.splitlines() if len(line.strip()) >= 12]

    claims: list[Claim] = []
    for index, candidate in enumerate(candidates[:max_claims]):
        claims.append(
            Claim(
                claim_id=f"claim-{index + 1}",
                text=candidate,
                source_stage=source_stage,
                context=normalized[:240],
            )
        )
    return claims


def _terms(text: str) -> set[str]:
    ascii_terms = set(re.findall(r"[a-zA-Z][a-zA-Z0-9+-]*", text.lower()))
    cjk_terms = set(re.findall(r"[\u4e00-\u9fff]{2,8}", text))
    return {term for term in ascii_terms.union(cjk_terms) if len(term) >= 2}


def _alignment_score(claim_text: str, evidence_text: str) -> float:
    claim_terms = _terms(claim_text)
    evidence_terms = _terms(evidence_text)
    if not claim_terms or not evidence_terms:
        return 0.0
    overlap = claim_terms.intersection(evidence_terms)
    recall = len(overlap) / len(claim_terms)
    precision = len(overlap) / len(evidence_terms)
    if recall + precision == 0:
        return 0.0
    return (2 * recall * precision) / (recall + precision)


def _relation_for(claim_text: str, evidence_text: str, alignment_score: float) -> ClaimEvidenceRelation:
    lowered_claim = claim_text.lower()
    lowered_evidence = evidence_text.lower()
    if alignment_score < 0.12:
        return ClaimEvidenceRelation.UNRELATED
    if any(marker in lowered_evidence for marker in _CONTRADICTION_MARKERS) and alignment_score >= 0.2:
        if any(term in lowered_evidence for term in _terms(claim_text)):
            return ClaimEvidenceRelation.CONTRADICTS
    if alignment_score >= 0.45:
        return ClaimEvidenceRelation.SUPPORTS
    if alignment_score >= 0.2:
        return ClaimEvidenceRelation.PARTIAL
    return ClaimEvidenceRelation.UNRELATED


def _evidence_from_chunk(chunk: RetrievedChunk) -> Evidence:
    return Evidence(
        evidence_id=f"evidence-{chunk.chunk_id}",
        doc_id=chunk.doc_id,
        title=chunk.title,
        chunk_id=chunk.chunk_id,
        snippet=chunk.snippet,
        score=chunk.score,
        source_type=EvidenceSourceType.KNOWLEDGE_BASE,
    )


def _status_for_claim(
    links: list[ClaimEvidenceLink],
    confidence: float,
    config: VerificationConfig,
) -> VerifiedClaimStatus:
    if any(link.relation == ClaimEvidenceRelation.CONTRADICTS for link in links):
        return VerifiedClaimStatus.CONTRADICTED
    if confidence >= config.verify_threshold:
        return VerifiedClaimStatus.VERIFIED
    if confidence >= config.refuse_threshold:
        return VerifiedClaimStatus.PENDING_REVIEW
    return VerifiedClaimStatus.UNVERIFIED


def verify_claims(
    claims: list[Claim],
    retriever: HybridRetriever,
    *,
    config: VerificationConfig | None = None,
) -> list[VerifiedClaim]:
    settings = config or VerificationConfig()
    verified: list[VerifiedClaim] = []

    for claim in claims:
        retrieved = retriever.retrieve(claim.text, limit=settings.evidence_limit)
        evidences = [_evidence_from_chunk(chunk) for chunk in retrieved if chunk.score >= settings.min_evidence_score]
        links: list[ClaimEvidenceLink] = []
        scores: list[float] = []

        for evidence in evidences:
            alignment = _alignment_score(claim.text, f"{evidence.title} {evidence.snippet}")
            relation = _relation_for(claim.text, evidence.snippet, alignment)
            if relation == ClaimEvidenceRelation.UNRELATED:
                continue
            weighted = alignment * max(evidence.score, 0.1)
            if relation == ClaimEvidenceRelation.CONTRADICTS:
                weighted = max(weighted - settings.contradiction_penalty, 0.0)
            scores.append(weighted)
            links.append(
                ClaimEvidenceLink(
                    claim_id=claim.claim_id,
                    evidence_id=evidence.evidence_id,
                    relation=relation,
                    alignment_score=round(alignment, 4),
                    rationale=(
                        f"与《{evidence.title}》片段对齐分 {alignment:.2f}，"
                        f"关系判定为 {relation.value}"
                    ),
                )
            )

        confidence = max(scores) if scores else 0.0
        status = _status_for_claim(links, confidence, settings)
        verified.append(
            VerifiedClaim(
                claim=claim,
                links=links,
                evidences=evidences,
                status=status,
                confidence=round(confidence, 4),
            )
        )

    return verified


def verify_text(
    text: str,
    knowledge_base: KnowledgeBase,
    *,
    source_stage: str = "general",
    config: VerificationConfig | None = None,
    llm_client: OpenAICompatibleChatClient | None = None,
) -> VerificationReport:
    settings = config or VerificationConfig()
    claims = extract_claims(
        text,
        source_stage=source_stage,
        llm_client=llm_client,
    )
    retriever = HybridRetriever.from_knowledge_base(knowledge_base)
    verified_claims = verify_claims(claims, retriever, config=settings)

    if not verified_claims:
        return VerificationReport(
            report_id=str(uuid.uuid4()),
            source_text=text,
            source_stage=source_stage,
            claims=[],
            overall_confidence=0.0,
            should_refuse=True,
            summary="未抽取到可核验主张，建议补充更具体的陈述。",
            verify_threshold=settings.verify_threshold,
            refuse_threshold=settings.refuse_threshold,
        )

    confidences = [item.confidence for item in verified_claims]
    overall = sum(confidences) / len(confidences)
    contradicted = sum(1 for item in verified_claims if item.status == VerifiedClaimStatus.CONTRADICTED)
    verified_count = sum(1 for item in verified_claims if item.status == VerifiedClaimStatus.VERIFIED)
    should_refuse = overall < settings.refuse_threshold or contradicted > 0

    if should_refuse:
        summary = (
            f"整体置信 {overall:.2f} 低于门控或存在矛盾证据；"
            f"已验证 {verified_count}/{len(verified_claims)} 条主张，建议人工复核。"
        )
    else:
        summary = (
            f"整体置信 {overall:.2f}；"
            f"已验证 {verified_count}/{len(verified_claims)} 条主张，可进入下一阶段。"
        )

    return VerificationReport(
        report_id=str(uuid.uuid4()),
        source_text=text,
        source_stage=source_stage,
        claims=verified_claims,
        overall_confidence=round(overall, 4),
        should_refuse=should_refuse,
        summary=summary,
        verify_threshold=settings.verify_threshold,
        refuse_threshold=settings.refuse_threshold,
    )
