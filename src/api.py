#Warden Api

from fastapi import FastAPI
from scoring_engine import run_pipeline

app = FastAPI(title="Warden", description="Player protection triage API")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/cases")
def get_cases():
    """Runs the scoring engine fresh and returns every flagged case."""
    cases = run_pipeline()
    return {"count": len(cases), "cases": cases}