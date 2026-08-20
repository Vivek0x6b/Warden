#Warden Api

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
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
from offense_store import (
    init_db,
    get_offense_count,
    record_offense,
    record_case_decision,
    get_case_decision,
    revert_case_decision,
)


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
    for case in cases:
        case["status"] = get_case_decision(case["player_id"], case["category"])
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
        case["status"] = get_case_decision(case["player_id"], case["category"])
    return {"count": len(cases), "cases": cases}


class DecisionRequest(BaseModel):
    category: str
    decision: str  # "approve" or "override"


@app.post("/cases/{player_id}/decision")
def decide_case(player_id: str, body: DecisionRequest):
    """Records a moderator's call on a flagged case. 'approve' confirms the recommended
    action and logs it as a real offense, feeding into future repeat-offender escalation.
    'override' dismisses the case as a false positive and does not escalate."""
    if body.decision not in ("approve", "override"):
        raise HTTPException(status_code=400, detail="decision must be 'approve' or 'override'")

    cases = run_pipeline()
    case = next(
        (c for c in cases if c["player_id"] == player_id and c["category"] == body.category),
        None,
    )
    if case is None:
        raise HTTPException(status_code=404, detail="No matching flagged case for that player/category")

    offense_id = None
    if body.decision == "approve":
        offense_id = record_offense(player_id, body.category, case["severity"], case["recommended_action"])

    status = "approved" if body.decision == "approve" else "overridden"
    record_case_decision(player_id, body.category, status, offense_id=offense_id)

    return {"player_id": player_id, "category": body.category, "status": status}


class RevertRequest(BaseModel):
    category: str


@app.post("/cases/{player_id}/revert")
def revert_case(player_id: str, body: RevertRequest):
    """Undoes the most recent moderator decision on a case, restoring it to pending.
    If the decision being undone was an approval, the offense record it created is
    removed too, so repeat-offender escalation isn't left inflated."""
    reverted = revert_case_decision(player_id, body.category)
    if not reverted:
        raise HTTPException(status_code=404, detail="No decision to revert for that player/category")
    return {"player_id": player_id, "category": body.category, "status": "pending"}