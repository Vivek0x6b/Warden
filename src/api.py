#Warden Api

from fastapi import FastAPI
from scoring_engine import run_pipeline
from writeup_generator import generate_writeup

app = FastAPI(title="Warden", description="Player protection triage API")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/cases")
def get_cases():
    """Runs the scoring engine fresh and returns every flagged case."""
    cases = run_pipeline()
    return {"count": len(cases), "cases": cases}

@app.get("/cases/writeups")
def get_cases_with_writeups():
    """Runs the scoring engine and adds an AI write up to every case."""
    cases = run_pipeline()
    for case in cases:
        case["ai_writeup"] = generate_writeup(case)
    return {"count": len(cases), "cases": cases}