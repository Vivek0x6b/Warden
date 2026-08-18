""" 
This takes a flagged case and asks llm to turn it into a short,
plain language summmary so moderator can read in few seconds instead of parsing raw json

It requires GROQ_API_KEY 

"""
import os
import time
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq, RateLimitError

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
MODEL = "openai/gpt-oss-20b"

SYSTEM_PROMPT = """ You are writing incident summaries for a player protection moderation team.
You will be given structured case data about a player flagged by an automated system: the offense category, 
how severe it looks, the specific numbers or reports that triggered the flag, the matching playbook rule, 
and the recommended action.

Write a short summary a moderator can read in a few seconds before deciding whether to approve the recommended action. 

Follow these rules:
1. Only use the facts given to you. Do not invent details, guess motives, or add anything not in the data.
2. Match your tone to the severity and confidence level. If the evidence is weak or the severity is minor, say so plainly, do not make it sound more serious than the data supports. If it is severe and high confidence, be direct about that too.
3. Structure it as one sentence on what was flagged and why, one sentence on how strong the evidence is, one sentence clearly stating the recommended action.
4. Write in plain English, 2 to 4 sentences total, no bullet points, no jargon, no dramatic language.
5. End with the recommended action so it is the last thing the moderator reads before deciding.
"""
def generate_writeup(case):
    case_text = (
        f"Player: {case['player_id']}\n"
        f"Category: {case['category']}\n"
        f"Severity: {case['severity']}\n"
        f"Reason flagged: {case['reason']}\n"
        f"Matches playbook rule: {case['matches_playbook_trigger']}\n"
        f"Recommended action: {case['recommended_action']}"
    )
    for attempt in range(3):
        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": case_text},
                ],
                temperature=0.3,
                max_tokens=350,
                reasoning_effort="low",
            )
            return response.choices[0].message.content.strip()
        except RateLimitError:
            if attempt == 2:
                raise
            time.sleep(4)


if __name__ == "__main__":
    test_case = {
        "player_id": "P9001",
        "category": "cheating",
        "severity": "severe",
        "reason": "reaction time barely varies (std dev 2.6ms), anomaly confidence 0.91, 4 matching reports",
        "matches_playbook_trigger": "Confirmed script use across multiple sessions, or unusually high win rates that match automated play",
        "recommended_action": "30 day ban (or permanent, depending on the case)",
    }
    print(generate_writeup(test_case))