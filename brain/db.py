import sqlite3
import os
from pathlib import Path
from datetime import datetime, date
from typing import Optional

DB_PATH = Path(os.environ.get("BRAIN_DB", Path.home() / ".second-brain" / "brain.db"))


def _connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db() -> None:
    with _connect() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS notes (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                content     TEXT NOT NULL,
                created_at  TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
                content,
                content=notes,
                content_rowid=id
            );

            CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
                INSERT INTO notes_fts(rowid, content) VALUES (new.id, new.content);
            END;

            CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
                INSERT INTO notes_fts(notes_fts, rowid, content) VALUES ('delete', old.id, old.content);
            END;

            CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
                INSERT INTO notes_fts(notes_fts, rowid, content) VALUES ('delete', old.id, old.content);
                INSERT INTO notes_fts(rowid, content) VALUES (new.id, new.content);
            END;

            CREATE TABLE IF NOT EXISTS tags (
                id   INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            );

            CREATE TABLE IF NOT EXISTS note_tags (
                note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
                tag_id  INTEGER NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
                PRIMARY KEY (note_id, tag_id)
            );

            CREATE TABLE IF NOT EXISTS note_links (
                source_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
                target_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
                PRIMARY KEY (source_id, target_id),
                CHECK (source_id != target_id)
            );
        """)


def add_note(content: str, tags: list[str] | None = None) -> int:
    init_db()
    with _connect() as conn:
        cur = conn.execute(
            "INSERT INTO notes (content) VALUES (?)", (content.strip(),)
        )
        note_id = cur.lastrowid
        if tags:
            for tag in tags:
                tag = tag.strip().lower()
                if not tag:
                    continue
                conn.execute("INSERT OR IGNORE INTO tags (name) VALUES (?)", (tag,))
                tag_id = conn.execute("SELECT id FROM tags WHERE name = ?", (tag,)).fetchone()["id"]
                conn.execute("INSERT OR IGNORE INTO note_tags VALUES (?, ?)", (note_id, tag_id))
        return note_id


def get_note(note_id: int) -> Optional[sqlite3.Row]:
    init_db()
    with _connect() as conn:
        return conn.execute("SELECT * FROM notes WHERE id = ?", (note_id,)).fetchone()


def list_notes(limit: int = 20, tag: str | None = None) -> list[sqlite3.Row]:
    init_db()
    with _connect() as conn:
        if tag:
            return conn.execute("""
                SELECT n.* FROM notes n
                JOIN note_tags nt ON n.id = nt.note_id
                JOIN tags t ON nt.tag_id = t.id
                WHERE t.name = ?
                ORDER BY n.created_at DESC LIMIT ?
            """, (tag.lower(), limit)).fetchall()
        return conn.execute(
            "SELECT * FROM notes ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()


def notes_for_date(d: date) -> list[sqlite3.Row]:
    init_db()
    with _connect() as conn:
        return conn.execute(
            "SELECT * FROM notes WHERE date(created_at) = ? ORDER BY created_at ASC",
            (d.isoformat(),)
        ).fetchall()


def search_notes(query: str, limit: int = 10) -> list[sqlite3.Row]:
    init_db()
    with _connect() as conn:
        return conn.execute("""
            SELECT n.*, snippet(notes_fts, 0, '[', ']', '…', 12) AS snippet
            FROM notes_fts
            JOIN notes n ON n.id = notes_fts.rowid
            WHERE notes_fts MATCH ?
            ORDER BY rank LIMIT ?
        """, (query, limit)).fetchall()


def get_tags(note_id: int) -> list[str]:
    init_db()
    with _connect() as conn:
        rows = conn.execute("""
            SELECT t.name FROM tags t
            JOIN note_tags nt ON t.id = nt.tag_id
            WHERE nt.note_id = ?
        """, (note_id,)).fetchall()
        return [r["name"] for r in rows]


def get_links(note_id: int) -> list[sqlite3.Row]:
    init_db()
    with _connect() as conn:
        return conn.execute("""
            SELECT n.* FROM notes n
            JOIN note_links nl ON (nl.target_id = n.id OR nl.source_id = n.id)
            WHERE (nl.source_id = ? OR nl.target_id = ?) AND n.id != ?
        """, (note_id, note_id, note_id)).fetchall()


def add_link(source_id: int, target_id: int) -> None:
    init_db()
    a, b = min(source_id, target_id), max(source_id, target_id)
    with _connect() as conn:
        conn.execute("INSERT OR IGNORE INTO note_links VALUES (?, ?)", (a, b))


def delete_note(note_id: int) -> bool:
    init_db()
    with _connect() as conn:
        cur = conn.execute("DELETE FROM notes WHERE id = ?", (note_id,))
        return cur.rowcount > 0


def all_notes_for_similarity() -> list[sqlite3.Row]:
    init_db()
    with _connect() as conn:
        return conn.execute("SELECT id, content FROM notes ORDER BY created_at DESC").fetchall()


def list_all_tags() -> list[sqlite3.Row]:
    init_db()
    with _connect() as conn:
        return conn.execute("""
            SELECT t.name, COUNT(nt.note_id) as count
            FROM tags t
            JOIN note_tags nt ON t.id = nt.tag_id
            GROUP BY t.id ORDER BY count DESC
        """).fetchall()
