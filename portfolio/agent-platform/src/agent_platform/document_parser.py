from __future__ import annotations

import base64
import re


def parse_document_content(content: str, content_type: str = "text/plain") -> str:
    normalized = (content_type or "text/plain").lower().strip()
    if normalized in {"text/plain", "text/markdown", "markdown"}:
        return content.strip()
    if normalized == "application/pdf":
        return parse_pdf_base64(content)
    raise ValueError(f"Unsupported content_type: {content_type}")


def parse_pdf_base64(encoded: str) -> str:
    payload = encoded.strip()
    if payload.startswith("data:"):
        payload = payload.split(",", 1)[1]
    pdf_bytes = base64.b64decode(payload, validate=True)
    return extract_pdf_text(pdf_bytes)


def extract_pdf_text(pdf_bytes: bytes) -> str:
    try:
        from pypdf import PdfReader
    except ImportError as exc:
        raise RuntimeError(
            "PDF parsing requires pypdf. Install with: pip install pypdf"
        ) from exc

    from io import BytesIO

    reader = PdfReader(BytesIO(pdf_bytes))
    pages = [page.extract_text() or "" for page in reader.pages]
    text = "\n\n".join(page.strip() for page in pages if page.strip())
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    if not text:
        raise ValueError("PDF contains no extractable text")
    return text
