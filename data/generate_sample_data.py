"""
Makes fake data for the Warden project to test on.
This creates three files:
1. match_stats.csv:fake match results, used to catch cheaters and smurfs
2. player_reports.csv:fake player reports, used for the toxicity and matchmaking abuse categories
3. account_links.csv:fake account data, used to catch ban evasion
"""

import csv
import json
import random

random.seed(42)  # same fake data every time this runs, easier to test with

OUTPUT_FOLDER = "data"
NUM_NORMAL_PLAYERS = 80
NUM_SCRIPTED_CHEATERS = 3
NUM_SMURFS = 3
NUM_BAN_EVADERS = 3
MATCHES_PER_PLAYER = 12


def make_player_ids():
    normal = [f"P{i:04d}" for i in range(1, NUM_NORMAL_PLAYERS + 1)]
    cheaters = [f"P9{i:03d}" for i in range(1, NUM_SCRIPTED_CHEATERS + 1)]
    smurfs = [f"P8{i:03d}" for i in range(1, NUM_SMURFS + 1)]
    return normal, cheaters, smurfs


def make_match_stats(normal_ids, cheater_ids, smurf_ids):
    """
    Builds one row per match per player.

    Normal players: reaction time and win rate vary a normal amount,
    like a real person would.

    Scripted cheaters: reaction time barely changes at all between
    matches. A real human can't be that consistent, that's the signal.

    Smurfs: very new account, but winning far more than a new player
    should.
    """
    rows = []

    for pid in normal_ids:
        account_age = random.randint(30, 900)
        base_reaction = random.randint(180, 320)
        for match_num in range(MATCHES_PER_PLAYER):
            reaction_time = base_reaction + random.randint(-60, 60)
            win = random.random() < 0.50  # normal players hover near 50%
            rows.append({
                "match_id": f"M{pid}_{match_num}",
                "player_id": pid,
                "result": "win" if win else "loss",
                "session_length_min": random.randint(8, 45),
                "reaction_time_ms": reaction_time,
                "damage_per_hit": random.randint(15, 40),
                "account_age_days": account_age,
                "rank_mmr": random.randint(800, 2200),
            })

    for pid in cheater_ids:
        account_age = random.randint(60, 900)
        scripted_reaction = random.randint(90, 130)  # unnaturally fast
        for match_num in range(MATCHES_PER_PLAYER):
            # only a few ms of jitter, a real person can't be this steady
            reaction_time = scripted_reaction + random.randint(-4, 4)
            win = random.random() < 0.85  # wins way more than they should
            rows.append({
                "match_id": f"M{pid}_{match_num}",
                "player_id": pid,
                "result": "win" if win else "loss",
                "session_length_min": random.randint(8, 45),
                "reaction_time_ms": reaction_time,
                "damage_per_hit": random.randint(30, 45),
                "account_age_days": account_age,
                "rank_mmr": random.randint(1800, 2400),
            })

    for pid in smurf_ids:
        account_age = random.randint(1, 10)  # brand new account
        base_reaction = random.randint(180, 260)
        for match_num in range(MATCHES_PER_PLAYER):
            reaction_time = base_reaction + random.randint(-50, 50)
            win = random.random() < 0.80  # crushing low-skill lobbies
            rows.append({
                "match_id": f"M{pid}_{match_num}",
                "player_id": pid,
                "result": "win" if win else "loss",
                "session_length_min": random.randint(8, 45),
                "reaction_time_ms": reaction_time,
                "damage_per_hit": random.randint(20, 38),
                "account_age_days": account_age,
                "rank_mmr": random.randint(600, 1000),
            })

    return rows


TOXIC_NOTES = [
    "called me slurs after losing the duel",
    "kept spamming insults in match chat",
    "threatened to find me after the match",
    "was targeting and harassing one player the whole game",
]
CHEAT_NOTES = [
    "every parry looked frame perfect, felt scripted",
    "reaction time was inhuman all match",
    "clearly using some kind of auto block tool",
]
MATCHMAKING_NOTES = [
    "brand new account destroying a low rank lobby, feels like a smurf",
    "this player is way too good for how new the account is",
]


def make_player_reports(cheater_ids, smurf_ids, normal_ids):
    rows = []
    report_id = 1

    # real reports pointing at the players we planted as suspicious
    for pid in cheater_ids:
        for _ in range(random.randint(3, 6)):
            rows.append({
                "report_id": f"R{report_id:04d}",
                "reporter_id": random.choice(normal_ids),
                "reported_id": pid,
                "category": "cheating",
                "note": random.choice(CHEAT_NOTES),
            })
            report_id += 1

    for pid in smurf_ids:
        for _ in range(random.randint(2, 5)):
            rows.append({
                "report_id": f"R{report_id:04d}",
                "reporter_id": random.choice(normal_ids),
                "reported_id": pid,
                "category": "matchmaking_abuse",
                "note": random.choice(MATCHMAKING_NOTES),
            })
            report_id += 1

    # some ordinary toxicity reports scattered on normal players,
    # this is noise, most of it should NOT trigger any real action
    for _ in range(15):
        rows.append({
            "report_id": f"R{report_id:04d}",
            "reporter_id": random.choice(normal_ids),
            "reported_id": random.choice(normal_ids),
            "category": "toxicity",
            "note": random.choice(TOXIC_NOTES),
        })
        report_id += 1

    # a handful of one-off, low signal reports, single complaints that
    # shouldn't be enough on their own to act on
    for _ in range(10):
        rows.append({
            "report_id": f"R{report_id:04d}",
            "reporter_id": random.choice(normal_ids),
            "reported_id": random.choice(normal_ids),
            "category": random.choice(["cheating", "toxicity"]),
            "note": "salty single report after a close loss",
        })
        report_id += 1

    return rows


def make_account_links(normal_ids):
    rows = []

    # normal accounts, each with their own unique device and payment info
    for pid in normal_ids:
        rows.append({
            "account_id": pid,
            "device_id": f"DEV{random.randint(100000, 999999)}",
            "payment_fingerprint": f"PAY{random.randint(100000, 999999)}",
            "banned": "false",
        })

    # ban evasion pairs: an old banned account and a new alt account
    # that shares the same device and payment info
    evader_ids = []
    for i in range(1, NUM_BAN_EVADERS + 1):
        banned_account = f"PBANNED{i:03d}"
        alt_account = f"PALT{i:03d}"
        shared_device = f"DEV{random.randint(100000, 999999)}"
        shared_payment = f"PAY{random.randint(100000, 999999)}"

        rows.append({
            "account_id": banned_account,
            "device_id": shared_device,
            "payment_fingerprint": shared_payment,
            "banned": "true",
        })
        rows.append({
            "account_id": alt_account,
            "device_id": shared_device,
            "payment_fingerprint": shared_payment,
            "banned": "false",
        })
        evader_ids.append({"banned_account": banned_account, "alt_account": alt_account})

    return rows, evader_ids


def write_csv(filename, rows, fieldnames):
    import os
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)
    path = os.path.join(OUTPUT_FOLDER, filename)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"wrote {len(rows)} rows to {path}")


def main():
    normal_ids, cheater_ids, smurf_ids = make_player_ids()

    match_rows = make_match_stats(normal_ids, cheater_ids, smurf_ids)
    write_csv(
        "match_stats.csv",
        match_rows,
        ["match_id", "player_id", "result", "session_length_min",
         "reaction_time_ms", "damage_per_hit", "account_age_days", "rank_mmr"],
    )

    report_rows = make_player_reports(cheater_ids, smurf_ids, normal_ids)
    write_csv(
        "player_reports.csv",
        report_rows,
        ["report_id", "reporter_id", "reported_id", "category", "note"],
    )

    account_rows, evader_ids = make_account_links(normal_ids)
    write_csv(
        "account_links.csv",
        account_rows,
        ["account_id", "device_id", "payment_fingerprint", "banned"],
    )

    answer_key = {
        "note": "Ground truth for testing the scoring engine later. Do not let the detection code read this file, that would defeat the point.",
        "scripted_cheaters": cheater_ids,
        "smurf_accounts": smurf_ids,
        "ban_evasion_pairs": evader_ids,
    }
    import os
    with open(os.path.join(OUTPUT_FOLDER, "answer_key.json"), "w", encoding="utf-8") as f:
        json.dump(answer_key, f, indent=2)
    print(f"wrote answer key to {OUTPUT_FOLDER}/answer_key.json")


if __name__ == "__main__":
    main()