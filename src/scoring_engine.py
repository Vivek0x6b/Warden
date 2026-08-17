"""
 This is Warden scoring engine it reads 'decision_matrix.json', 'match_stats.csv', 'player_reports.csv', 'account_links.csv'
 afterwards writes 'flagged_cases.json' and checks it's own result against 'answer_key.json' that how actually engine is performing
"""
import os 
import csv
import json
import statistics
from collections import defaultdict
from offense_store import get_offense_count, init_db

#it helps to find scoring_engine no matter which folder your terminal is in
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_PATH = os.path.join(BASE_DIR, "config", "decision_matrix.json")
DATA_FOLDER = os.path.join(BASE_DIR,"data")


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def load_csv(path):
    with open(path, encoding="utf-8") as f:
        return list(csv.DictReader(f))


def evaluate_tier(anomaly_confidence, report_count, evidence_requirements):
    """
    Looks at the strongest piece of evidence available for a case and
    returns which severity tier it clears, or None if it does not clear
    the lowest bar at all.
    """
    severe = evidence_requirements["severe"]
    moderate = evidence_requirements["moderate"]
    minor = evidence_requirements["minor"]

    if anomaly_confidence is not None and anomaly_confidence >= severe["min_anomaly_confidence"]:
        return "severe"
    if anomaly_confidence is not None and anomaly_confidence >= moderate["min_anomaly_confidence"]:
        return "moderate"
    if report_count >= moderate.get("or_min_reports", 999):
        return "moderate"
    if report_count >= minor.get("min_reports", 999):
        return "minor"
    if anomaly_confidence is not None and anomaly_confidence < minor.get("or_anomaly_confidence_below", 0):
        return "minor"
    return None


def detect_cheating_and_smurfs(match_rows):
    
    #Groups match rows by player, then looks for two patterns.

    #Cheating signal: reaction time barely changes between matches. A real
    #person naturally swings around match to match, a script does not.

    #Smurf signal: a very new account winning far more than a new player reasonably should.

    by_player = defaultdict(list)
    for row in match_rows:
        by_player[row["player_id"]].append(row)

    signals = {}
    for player_id, matches in by_player.items():
        reaction_times = [int(m["reaction_time_ms"]) for m in matches]
        wins = sum(1 for m in matches if m["result"] == "win")
        win_rate = wins / len(matches)
        account_age = int(matches[0]["account_age_days"])

        std_dev = statistics.pstdev(reaction_times) if len(reaction_times) > 1 else 999

        # a std dev under about 30ms across a dozen matches is a red flag,
        # real humans wobble more than that match to match. Below a
        # meaningful floor (0.3), there is no real flag, so it is None,
        # not a tiny number that could accidentally clear a "weak signal"
        # rule further down.
        raw_cheating_confidence = max(0.0, min(1.0, 1 - (std_dev / 30)))
        cheating_confidence = round(raw_cheating_confidence, 2) if raw_cheating_confidence >= 0.30 else None

        # brand new account, under 15 days old, with a high win rate.
        # If the account does not clear this gate at all, there is no
        # signal, so it is None, not a false-sounding 0.0.
        smurf_confidence = None
        if account_age <= 15 and win_rate >= 0.70:
            smurf_confidence = round(min(1.0, win_rate), 2)

        signals[player_id] = {
            "cheating_confidence": cheating_confidence,
            "smurf_confidence": smurf_confidence,
            "win_rate": round(win_rate, 2),
            "account_age_days": account_age,
            "reaction_time_std_dev": round(std_dev, 1),
        }
    return signals


def count_reports(report_rows):
    """Counts reports per player and category."""
    counts = defaultdict(int)
    for row in report_rows:
        key = (row["reported_id"], row["category"])
        counts[key] += 1
    return counts


def detect_ban_evasion(account_rows):
    
    #Finds accounts that share a device or payment fingerprint with a
    #banned account. Any match counts as confirmed evasion, since the
    #playbook treats evasion as severe by definition, no lower tier applies.
    
    banned = [a for a in account_rows if a["banned"] == "true"]
    active = [a for a in account_rows if a["banned"] == "false"]

    evaders = []
    for b in banned:
        for a in active:
            same_device = b["device_id"] == a["device_id"]
            same_payment = b["payment_fingerprint"] == a["payment_fingerprint"]
            if same_device or same_payment:
                evaders.append(a["account_id"])
    return evaders


def build_case(player_id, category, tier, matrix, reason):
    prior_offenses = get_offense_count(player_id)
    offense_number = prior_offenses + 1

    if offense_number == 1:
        offense_key = "offense_1"
    elif offense_number == 2:
        offense_key = "offense_2"
    else:
        offense_key = "offense_3_plus"

    action = matrix["escalation_ladder"][tier][offense_key]
    trigger_text = matrix["categories"][category]["triggers"].get(tier, "")
    return {
        "player_id": player_id,
        "category": category,
        "severity": tier,
        "reason": reason,
        "matches_playbook_trigger": trigger_text,
        "recommended_action": action,
        "offense_number": offense_number,
    }


def run_pipeline():
    """Runs the full scoring pipeline and returns the list of flagged cases."""
    init_db()
    matrix = load_json(CONFIG_PATH)
    match_rows = load_csv(f"{DATA_FOLDER}/match_stats.csv")
    report_rows = load_csv(f"{DATA_FOLDER}/player_reports.csv")
    account_rows = load_csv(f"{DATA_FOLDER}/account_links.csv")

    stat_signals = detect_cheating_and_smurfs(match_rows)
    report_counts = count_reports(report_rows)
    evidence_rules = matrix["evidence_requirements"]

    cases = []

    for player_id, sig in stat_signals.items():
        reports = report_counts.get((player_id, "cheating"), 0)
        tier = evaluate_tier(sig["cheating_confidence"], reports, evidence_rules)
        if tier:
            reason = (f"reaction time barely varies (std dev {sig['reaction_time_std_dev']}ms), "
                       f"anomaly confidence {sig['cheating_confidence']}, {reports} matching reports")
            cases.append(build_case(player_id, "cheating", tier, matrix, reason))

    for player_id, sig in stat_signals.items():
        reports = report_counts.get((player_id, "matchmaking_abuse"), 0)
        tier = evaluate_tier(sig["smurf_confidence"], reports, evidence_rules)
        if tier:
            reason = (f"account age {sig['account_age_days']} days, win rate {sig['win_rate']}, "
                       f"anomaly confidence {sig['smurf_confidence']}, {reports} matching reports")
            cases.append(build_case(player_id, "matchmaking_abuse", tier, matrix, reason))

    toxicity_reported_players = {pid for (pid, cat) in report_counts if cat == "toxicity"}
    for player_id in toxicity_reported_players:
        reports = report_counts.get((player_id, "toxicity"), 0)
        tier = evaluate_tier(None, reports, evidence_rules)
        if tier:
            reason = f"{reports} toxicity reports"
            cases.append(build_case(player_id, "toxicity", tier, matrix, reason))

    for player_id in detect_ban_evasion(account_rows):
        reason = "shares a device or payment fingerprint with a banned account"
        cases.append(build_case(player_id, "ban_evasion", "severe", matrix, reason))

    return cases

#Here fastapi can resue the logic
def main():
    cases = run_pipeline()
    with open(f"{DATA_FOLDER}/flagged_cases.json", "w", encoding="utf-8") as f:
        json.dump(cases, f, indent=2)
    print(f"wrote {len(cases)} flagged cases to {DATA_FOLDER}/flagged_cases.json")
    validate(cases)

def validate(cases):
    #Checks the flagged cases against the answer key
    
    try:
        answer_key = load_json(f"{DATA_FOLDER}/answer_key.json")
    except FileNotFoundError:
        print("no answer_key.json found, skipping validation")
        return

    flagged_cheating = {c["player_id"] for c in cases if c["category"] == "cheating"}
    flagged_smurfs = {c["player_id"] for c in cases if c["category"] == "matchmaking_abuse"}
    flagged_evasion = {c["player_id"] for c in cases if c["category"] == "ban_evasion"}

    true_cheaters = set(answer_key["scripted_cheaters"])
    true_smurfs = set(answer_key["smurf_accounts"])
    true_evaders = {p["alt_account"] for p in answer_key["ban_evasion_pairs"]}

    print("\n--- validation against answer_key.json ---")
    print(f"cheaters caught:  {len(flagged_cheating & true_cheaters)} / {len(true_cheaters)}"
          f"   (false positives: {len(flagged_cheating - true_cheaters)})")
    print(f"smurfs caught:    {len(flagged_smurfs & true_smurfs)} / {len(true_smurfs)}"
          f"   (false positives: {len(flagged_smurfs - true_smurfs)})")
    print(f"evaders caught:   {len(flagged_evasion & true_evaders)} / {len(true_evaders)}"
          f"   (false positives: {len(flagged_evasion - true_evaders)})")


if __name__ == "__main__":
    main()