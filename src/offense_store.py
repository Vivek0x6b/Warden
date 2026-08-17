import sqlite3
import os
from datetime import datetime, timezone

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "offense_history.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS offenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id TEXT NOT NULL,
            category TEXT NOT NULL,
            severity TEXT NOT NULL,
            action_taken TEXT NOT NULL,
            recorded_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


def get_offense_count(player_id):
    conn = get_connection()
    row = conn.execute(
        "SELECT COUNT(*) as count FROM offenses WHERE player_id = ?",
        (player_id,),
    ).fetchone()
    conn.close()
    return row["count"]


def record_offense(player_id, category, severity, action_taken):
    conn = get_connection()
    conn.execute(
        "INSERT INTO offenses (player_id, category, severity, action_taken, recorded_at) VALUES (?, ?, ?, ?, ?)",
        (player_id, category, severity, action_taken, datetime.now(timezone.utc).isoformat()),
    )
    conn.commit()
    conn.close()


def get_offense_history(player_id):
    conn = get_connection()
    rows = conn.execute(
        "SELECT category, severity, action_taken, recorded_at FROM offenses WHERE player_id = ? ORDER BY recorded_at",
        (player_id,),
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]