#Warden Api

from fastapi import FastAPI
from scoring_engine import run_pipeline
from writeup_generator import generate_writeup
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Warden", description="Player protection triage API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://wardenpp.vercel.app",
        "https://warden-mauve-eight.vercel.app",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)
from offense_store import init_db, get_offense_count, record_offense


@app.on_event("startup")
def seed_on_startup():
    init_db()
    if get_offense_count("P9001") == 0:
        record_offense("P9001", "cheating", "severe", "30 day ban (or permanent, depending on the case)")
    if get_offense_count("P8001") == 0:
        record_offense("P8001", "matchmaking_abuse", "moderate", "7 day ban")
        record_offense("P8001", "matchmaking_abuse", "moderate", "7 day ban")

@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/cases")
def get_cases():
    """Runs the scoring engine fresh and returns every flagged case."""
    cases = run_pipeline()
    return {"count": len(cases), "cases": cases}

_writeup_cache = {}


@app.get("/cases/writeups")
def get_cases_with_writeups():
    """Runs the scoring engine and adds an AI write up to every case, caching each write-up so repeat requests don't re-call the AI for the same case and avoid token burning."""
    cases = run_pipeline()
    for case in cases:
        if case["player_id"] not in _writeup_cache:
            _writeup_cache[case["player_id"]] = generate_writeup(case)
        case["ai_writeup"] = _writeup_cache[case["player_id"]]
    return {"count": len(cases), "cases": cases}