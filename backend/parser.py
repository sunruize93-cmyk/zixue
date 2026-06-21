"""PDF parsing utilities.

All parsing happens in memory — uploaded files are never written to disk.
The raw bytes are read into a BytesIO buffer, opened with pdfplumber, and
discarded as soon as text extraction finishes.
"""

from __future__ import annotations

import io

import pdfplumber

# Cap how much text we keep per document so a single huge PDF can't blow up
# the prompt. ~120k chars is comfortably within the model's context window
# while leaving room for the rest of the prompt and the response.
MAX_CHARS_PER_DOC = 120_000


def extract_text(file_bytes: bytes) -> str:
    """Extract text from PDF bytes.

    Returns the concatenated text of every page. Raises ValueError if the
    bytes don't look like a parseable PDF.
    """
    text_parts: list[str] = []
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text() or ""
                if page_text:
                    text_parts.append(page_text)
    except Exception as exc:  # pdfplumber raises a variety of errors
        raise ValueError(f"Could not parse PDF: {exc}") from exc

    text = "\n\n".join(text_parts).strip()
    if len(text) > MAX_CHARS_PER_DOC:
        text = text[:MAX_CHARS_PER_DOC] + "\n\n[...truncated...]"
    return text
