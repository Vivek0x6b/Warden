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
    conn.execute("""
        CREATE TABLE IF NOT EXISTS case_decisions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id TEXT NOT NULL,
            category TEXT NOT NULL,
            decision TEXT NOT NULL,
            offense_id INTEGER,
            decided_at TEXT NOT NULL
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
    """Inserts an offense record and returns its row id, so a later revert can
    delete this exact row without touching the player's other offenses."""
    conn = get_connection()
    cursor = conn.execute(
        "INSERT INTO offenses (player_id, category, severity, action_taken, recorded_at) VALUES (?, ?, ?, ?, ?)",
        (player_id, category, severity, action_taken, datetime.now(timezone.utc).isoformat()),
    )
    conn.commit()
    offense_id = cursor.lastrowid
    conn.close()
    return offense_id


def get_offense_history(player_id):
    conn = get_connection()
    rows = conn.execute(
        "SELECT category, severity, action_taken, recorded_at FROM offenses WHERE player_id = ? ORDER BY recorded_at",
        (player_id,),
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]


def record_case_decision(player_id, category, decision, offense_id=None):
    """Records a moderator's decision (approved/overridden/reverted) on a specific
    flagged case. offense_id links an 'approved' decision to the offense row it
    created, so a later revert knows exactly which offense to undo."""
    conn = get_connection()
    conn.execute(
        "INSERT INTO case_decisions (player_id, category, decision, offense_id, decided_at) VALUES (?, ?, ?, ?, ?)",
        (player_id, category, decision, offense_id, datetime.now(timezone.utc).isoformat()),
    )
    conn.commit()
    conn.close()


def get_case_decision(player_id, category):
    """Returns the case's effective status: 'pending' if no decision has been made
    yet (or the most recent one was reverted), otherwise the latest decision."""
    conn = get_connection()
    row = conn.execute(
        "SELECT decision FROM case_decisions WHERE player_id = ? AND category = ? ORDER BY decided_at DESC LIMIT 1",
        (player_id, category),
    ).fetchone()
    conn.close()
    if row is None or row["decision"] == "reverted":
        return "pending"
    return row["decision"]


def get_latest_decision(player_id, category):
    """Returns the full most recent decision row (decision + offense_id), or None."""
    conn = get_connection()
    row = conn.execute(
        "SELECT decision, offense_id FROM case_decisions WHERE player_id = ? AND category = ? ORDER BY decided_at DESC LIMIT 1",
        (player_id, category),
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def revert_case_decision(player_id, category):
    """Undoes the most recent decision on a case, restoring it to pending. If that
    decision was an approval, also deletes the offense row it created so
    repeat-offender escalation stays accurate. Logs a 'reverted' entry rather than
    deleting history, so the original decision still shows up in an audit trail.
    Returns False if there was nothing pending to revert."""
    latest = get_latest_decision(player_id, category)
    if latest is None or latest["decision"] == "reverted":
        return False

    conn = get_connection()
    if latest["decision"] == "approved" and latest["offense_id"] is not None:
        conn.execute("DELETE FROM offenses WHERE id = ?", (latest["offense_id"],))

    conn.execute(
        "INSERT INTO case_decisions (player_id, category, decision, offense_id, decided_at) VALUES (?, ?, ?, ?, ?)",
        (player_id, category, "reverted", None, datetime.now(timezone.utc).isoformat()),
    )
    conn.commit()
    conn.close()
    return True