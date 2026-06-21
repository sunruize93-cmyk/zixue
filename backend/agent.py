"""Claude-powered study-plan generation.

Wraps a single Claude call: it takes course metadata plus the text extracted
from any uploaded PDFs and asks the model to produce a structured, bilingual
weekly study plan. If past-exam material is provided, the model is instructed
to analyze recurring patterns and weight the plan accordingly.
"""

from __future__ import annotations

import os

import anthropic

# The user explicitly requested this model for the MVP.
MODEL = "claude-sonnet-4-6"

# Generous ceiling — a full bilingual weekly plan is long. We stream the
# request (see generate_plan) so the large max_tokens won't hit HTTP timeouts.
MAX_TOKENS = 16_000

SYSTEM_PROMPT = """\
You are Zixue (自学), an expert academic advisor for international students. \
Your mission is to eliminate the information gap that international students \
face: they often don't know how a course is really structured, what professors \
actually test, or how local students prepare. You turn a syllabus, past exams, \
and lecture notes into a concrete, week-by-week study plan.

You will be given:
- Course metadata (university, course code, name, department, professor, semester).
- Extracted text from uploaded documents, each labeled by type
  (syllabus / past exam / lecture notes).

Produce a study plan that follows these rules:

1. Output the ENTIRE plan TWICE: first in English, then in Simplified Chinese
   (中文). Separate the two with a line containing only `---`. The Chinese
   version must be a faithful translation, not a summary.

2. Structure each language version as a week-by-week plan. For every week give:
   - The topics/readings to focus on.
   - Concrete study actions (problem sets, review, practice).
   - An estimated time budget.

3. If syllabus text is present, anchor the weekly breakdown to its schedule,
   grading weights, and key deadlines.

4. If past-exam text is present, analyze recurring patterns — question types,
   frequently tested topics, difficulty distribution — and call out which weeks
   to prioritize because of them. Add a short "Exam Pattern Analysis" section.

5. If lecture-notes text is present, use it to identify the concepts the
   professor emphasizes and reflect that emphasis in the plan.

6. Open each language version with a brief 2-3 sentence overview of the course
   and the strategy behind the plan.

7. Format everything in clean Markdown with clear headings. Be specific and
   actionable — avoid generic advice. If a document type is missing, work with
   what you have and note any assumptions you made.
"""


def _build_user_message(course: dict, documents: list[dict]) -> str:
    """Assemble the user-turn text from metadata and parsed documents."""
    lines = ["# Course Information", ""]
    fields = [
        ("University", course.get("university")),
        ("Course code", course.get("course_code")),
        ("Course name", course.get("course_name")),
        ("Department", course.get("department")),
        ("Professor", course.get("professor")),
        ("Semester", course.get("semester")),
    ]
    for label, value in fields:
        if value:
            lines.append(f"- **{label}:** {value}")

    if documents:
        lines.append("")
        lines.append("# Uploaded Documents")
        for doc in documents:
            lines.append("")
            lines.append(f"## {doc['label']} — {doc['filename']}")
            lines.append("")
            lines.append(doc["text"] or "(no extractable text)")
    else:
        lines.append("")
        lines.append(
            "# Uploaded Documents\n\n(No documents were uploaded. Build the best "
            "general plan you can from the course metadata, and note the "
            "assumptions you make.)"
        )

    lines.append("")
    lines.append(
        "Now produce the bilingual weekly study plan following all the rules "
        "in your instructions."
    )
    return "\n".join(lines)


def generate_plan(course: dict, documents: list[dict]) -> str:
    """Generate a bilingual weekly study plan.

    `course` is a dict of metadata fields. `documents` is a list of
    {"label": str, "filename": str, "text": str}.

    Returns the plan as a Markdown string.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError(
            "ANTHROPIC_API_KEY is not set. Copy backend/.env.example to "
            "backend/.env and add your key."
        )

    client = anthropic.Anthropic(api_key=api_key)
    user_message = _build_user_message(course, documents)

    # Stream the response: a full bilingual plan can be long, and streaming
    # avoids SDK HTTP timeouts on large max_tokens. We let Claude decide how
    # much to think via adaptive thinking.
    with client.messages.stream(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        thinking={"type": "adaptive"},
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    ) as stream:
        final = stream.get_final_message()

    return "".join(
        block.text for block in final.content if block.type == "text"
    ).strip()
