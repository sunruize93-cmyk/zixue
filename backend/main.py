"""Zixue (自学) FastAPI backend.

A single stateless endpoint, `/generate`, accepts course metadata plus an
optional set of PDF uploads (labeled by type) and returns an AI-generated
bilingual weekly study plan.

No uploaded file is ever persisted: each PDF is read into memory, parsed, and
discarded within the request. No database, no session state.
"""

from __future__ import annotations

import os

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from agent import generate_plan
from parser import extract_text

# Document-type labels the frontend may attach to each uploaded file.
VALID_DOC_TYPES = {"syllabus", "past exam", "lecture notes"}

app = FastAPI(
    title="Zixue (自学)",
    description="AI-powered study plan generator for international students.",
    version="0.1.0",
)

_origins = os.environ.get(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _origins.split(",") if o.strip()],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/generate")
async def generate(
    university: str = Form(...),
    course_code: str = Form(...),
    course_name: str = Form(...),
    department: str = Form(""),
    professor: str = Form(""),
    semester: str = Form(""),
    contributor: str = Form(""),
    # Files and their parallel type labels. files[i] is described by
    # file_types[i]; the frontend sends them in matching order.
    files: list[UploadFile] = File(default=[]),
    file_types: list[str] = Form(default=[]),
) -> dict:
    """Generate a bilingual weekly study plan.

    Returns JSON: { "plan": <markdown str>, "contributor": <str> }.
    """
    documents: list[dict] = []
    for index, upload in enumerate(files):
        raw = await upload.read()  # read into memory; never written to disk
        if not raw:
            continue
        try:
            text = extract_text(raw)
        except ValueError as exc:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to parse '{upload.filename}': {exc}",
            ) from exc
        finally:
            del raw  # drop the bytes as soon as we're done with them

        label = file_types[index] if index < len(file_types) else "lecture notes"
        if label not in VALID_DOC_TYPES:
            label = "lecture notes"

        documents.append(
            {
                "label": label,
                "filename": upload.filename or f"document-{index + 1}.pdf",
                "text": text,
            }
        )

    course = {
        "university": university,
        "course_code": course_code,
        "course_name": course_name,
        "department": department,
        "professor": professor,
        "semester": semester,
    }

    try:
        plan = generate_plan(course, documents)
    except RuntimeError as exc:
        # Missing API key, etc. — a configuration problem, not the client's fault.
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:  # surface upstream API errors cleanly
        raise HTTPException(
            status_code=502, detail=f"Study plan generation failed: {exc}"
        ) from exc

    return {"plan": plan, "contributor": contributor}
