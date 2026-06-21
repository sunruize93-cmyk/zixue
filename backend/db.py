"""SQLite persistence for the Zixue plan library.

The whole point of the library is to avoid re-calling the model API for a
course that has already been generated. A plan is generated once (one API
call), stored here, and served for free to everyone who looks up the same
course afterwards.

Stored data is generated *plans* and course metadata — never the uploaded
files, which are still parsed in memory and discarded.
"""

from __future__ import annotations

import os
import re
import sqlite3
from datetime import datetime, timezone

DB_PATH = os.environ.get(
    "ZIXUE_DB", os.path.join(os.path.dirname(__file__), "zixue.db")
)


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS plans (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                course_key  TEXT NOT NULL,
                university  TEXT NOT NULL,
                course_code TEXT NOT NULL,
                course_name TEXT NOT NULL,
                department  TEXT,
                professor   TEXT,
                semester    TEXT,
                contributor TEXT,
                plan        TEXT NOT NULL,
                created_at  TEXT NOT NULL
            )
            """
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_plans_course_key ON plans(course_key)"
        )


def _norm(value: str | None) -> str:
    return re.sub(r"\s+", " ", (value or "").strip().lower())


def course_key(university: str, course_code: str, course_name: str) -> str:
    """A normalized key so 'CS 101' and 'cs 101' map to the same course."""
    return "|".join([_norm(university), _norm(course_code), _norm(course_name)])


def find_plan_by_course(
    university: str, course_code: str, course_name: str
) -> dict | None:
    key = course_key(university, course_code, course_name)
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM plans WHERE course_key = ? ORDER BY created_at DESC LIMIT 1",
            (key,),
        ).fetchone()
        return dict(row) if row else None


def insert_plan(course: dict, contributor: str, plan: str) -> int:
    key = course_key(
        course["university"], course["course_code"], course["course_name"]
    )
    now = datetime.now(timezone.utc).isoformat()
    with _connect() as conn:
        cur = conn.execute(
            """
            INSERT INTO plans (course_key, university, course_code, course_name,
                department, professor, semester, contributor, plan, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                key,
                course["university"],
                course["course_code"],
                course["course_name"],
                course.get("department") or None,
                course.get("professor") or None,
                course.get("semester") or None,
                contributor or None,
                plan,
                now,
            ),
        )
        return int(cur.lastrowid)


def get_plan(plan_id: int) -> dict | None:
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM plans WHERE id = ?", (plan_id,)
        ).fetchone()
        return dict(row) if row else None


def list_plans() -> list[dict]:
    """All saved plans, newest first. Excludes the (large) plan body."""
    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT id, university, course_code, course_name, department,
                   professor, semester, contributor, created_at
            FROM plans ORDER BY created_at DESC
            """
        ).fetchall()
        return [dict(r) for r in rows]


def leaderboard() -> list[dict]:
    """Universities ranked by how many plans have been contributed for them."""
    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT university, COUNT(*) AS count
            FROM plans
            GROUP BY LOWER(TRIM(university))
            ORDER BY count DESC, university ASC
            """
        ).fetchall()
        return [dict(r) for r in rows]
