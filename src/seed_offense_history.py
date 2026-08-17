from offense_store import init_db, record_offense

init_db()

# Fake prior history so the escalation ladder has something to actually escalate from.
record_offense("P9001", "cheating", "severe", "30 day ban (or permanent, depending on the case)")
record_offense("P8001", "matchmaking_abuse", "moderate", "7 day ban")
record_offense("P8001", "matchmaking_abuse", "moderate", "7 day ban")

print("Seeded offense history.")