from __future__ import annotations

import base64
import re
from dataclasses import dataclass, field
from io import BytesIO


@dataclass(frozen=True)
class BookImage:
    image_id: str
    page_number: int
    mime_type: str
    data_base64: str
    width: int = 0
    height: int = 0

    def data_url(self) -> str:
        return f"data:{self.mime_type};base64,{self.data_base64}"


@dataclass
class BookPage:
    page_number: int
    text: str


@dataclass
class BookDocument:
    title_hint: str
    pages: list[BookPage] = field(default_factory=list)
    images: list[BookImage] = field(default_factory=list)

    @property
    def full_text(self) -> str:
        return "\n\n".join(
            f"【第{page.page_number}页】\n{page.text.strip()}"
            for page in self.pages
            if page.text.strip()
        )

    @property
    def page_count(self) -> int:
        return len(self.pages)


_MIME_BY_EXT = {
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "gif": "image/gif",
    "webp": "image/webp",
    "bmp": "image/bmp",
}


def parse_pdf_book(
    pdf_bytes: bytes,
    *,
    title_hint: str = "未命名书籍",
    max_pages: int = 80,
    max_images: int = 12,
    min_image_bytes: int = 8_000,
) -> BookDocument:
    if not pdf_bytes:
        raise ValueError("PDF content is empty")

    try:
        return _parse_with_pymupdf(
            pdf_bytes,
            title_hint=title_hint,
            max_pages=max_pages,
            max_images=max_images,
            min_image_bytes=min_image_bytes,
        )
    except ImportError:
        return _parse_with_pypdf(pdf_bytes, title_hint=title_hint, max_pages=max_pages)
    except Exception:
        return _parse_with_pypdf(pdf_bytes, title_hint=title_hint, max_pages=max_pages)


def _parse_with_pymupdf(
    pdf_bytes: bytes,
    *,
    title_hint: str,
    max_pages: int,
    max_images: int,
    min_image_bytes: int,
) -> BookDocument:
    import fitz  # pymupdf

    document = BookDocument(title_hint=title_hint)
    seen_xrefs: set[int] = set()

    with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
        for page_index in range(min(len(doc), max_pages)):
            page = doc[page_index]
            page_number = page_index + 1
            text = page.get_text("text").strip()
            document.pages.append(BookPage(page_number=page_number, text=text))

            if len(document.images) >= max_images:
                continue

            for image_index, image in enumerate(page.get_images(full=True)):
                if len(document.images) >= max_images:
                    break
                xref = int(image[0])
                if xref in seen_xrefs:
                    continue
                seen_xrefs.add(xref)
                try:
                    extracted = doc.extract_image(xref)
                except Exception:
                    continue
                image_bytes = extracted.get("image", b"")
                if len(image_bytes) < min_image_bytes:
                    continue
                ext = str(extracted.get("ext", "png")).lower()
                mime_type = _MIME_BY_EXT.get(ext, "image/png")
                document.images.append(
                    BookImage(
                        image_id=f"page-{page_number}-img-{image_index + 1}",
                        page_number=page_number,
                        mime_type=mime_type,
                        data_base64=base64.b64encode(image_bytes).decode("ascii"),
                        width=int(extracted.get("width", 0) or 0),
                        height=int(extracted.get("height", 0) or 0),
                    )
                )

    return document


def _parse_with_pypdf(pdf_bytes: bytes, *, title_hint: str, max_pages: int) -> BookDocument:
    from pypdf import PdfReader

    document = BookDocument(title_hint=title_hint)
    reader = PdfReader(BytesIO(pdf_bytes))
    for page_index, page in enumerate(reader.pages[:max_pages]):
        text = (page.extract_text() or "").strip()
        document.pages.append(BookPage(page_number=page_index + 1, text=text))
    return document


def guess_book_title(text: str, fallback: str) -> str:
    for line in text.splitlines():
        cleaned = line.strip()
        if 4 <= len(cleaned) <= 40 and not re.search(r"^\d+$", cleaned):
            return cleaned
    return fallback
