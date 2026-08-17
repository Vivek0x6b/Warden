# Player Protection Playbook & Decision Matrix

This document explains how I would handle player protection cases for an online multiplayer game. It is built with a ranked PvP game in mind, but the same ideas work for most online games that let players report bad behavior and have a ranked ladder. The goal is not just to catch people doing bad things. It is to make sure two different moderators looking at the same case make the same decision. Being consistent is the whole point. A fair system is one you can predict.

This document is also the source that the triage tool follows. The file `decision_matrix.json` holds the same rules, written so the code can read and use them automatically, so no one has to read this whole document every time.

---

## 1. Types of Bad Behavior

I split bad behavior into five groups. Some of these overlap in real life, for example, a boosted account is often also a smurf account. But keeping them separate makes it easier to decide what proof is needed and what punishment fits each one.

| Type | What it covers |
|---|---|
| **Cheating / Hacking** | Using outside software or scripts to get an unfair advantage, like auto parry scripts, input macros, wallhack style vision tools, or scripts that change damage or speed |
| **Exploitation** | Using a bug or a broken game feature instead of outside software, like duplicating progress, getting outside the map, broken hit detection, or combos that never end |
| **Matchmaking Abuse** | Tricking the matchmaking or ranked system, like making a new account to beat up on low skill players, paying someone to boost your rank, or manipulating the queue on purpose |
| **Toxicity & Abusive Behavior** | Harassment, hate speech, threats, or targeted abuse through chat, voice chat, or emotes |
| **Ban Evasion & Account Abuse** | Making a new account to get around an active ban, or sharing and selling accounts for boosting or to get around a ban |

## 2. Severity Levels

There are three levels. They work the same way for every type, so the bar for taking action does not quietly change depending on what kind of offense it is.

| Level | What it means | Cheating example | Toxicity example |
|---|---|---|---|
| **Minor** | A one time thing, low impact, might not even be on purpose | A cosmetic FPS unlocker with no real gameplay effect | One heated insult mid match |
| **Moderate** | Clearly on purpose, real impact, first time we have seen it | Confirmed macro use in a single ranked session | Repeated targeted insults in one match |
| **Severe** | Happens a lot, high impact, or keeps repeating | Confirmed script use across many sessions | Threats, sharing someone's private info, or a group harassing someone together |

## 3. What Counts as Proof

No one gets punished just because someone has a feeling. Each level has a minimum amount of proof needed before any punishment happens.

| Level | What you need |
|---|---|
| Minor | 3 or more separate player reports, or an unusual activity flag with less than 70% confidence |
| Moderate | An unusual activity flag with 70% confidence or more, a clip or log that was checked, or 5 or more reports that support each other |
| Severe | An unusual activity flag with 90% confidence or more, plus extra proof like logs, clips, or several separate reports |

If something does not meet the proof needed for its level, it is not ignored. It just does not trigger an automatic punishment. It gets saved and sent to a person to look at later. This matters because even weak signals are useful for spotting trends, even when they are not strong enough to act on by themselves.

## 4. Punishment Steps

For a first offense, we try to correct the behavior when the level allows it. Severe offenses or repeat offenses do not get that chance.

| Level | 1st offense | 2nd offense | 3rd or more |
|---|---|---|---|
| Minor | Warning plus in game notice | 24 hour restriction | 7 day ban |
| Moderate | 7 day ban | 30 day ban | Permanent ban |
| Severe | 30 day ban (or permanent, depending on the case) | Permanent ban | Permanent ban plus flagged for evasion monitoring |

One exception. If we confirm ban evasion on a new account, the punishment steps do not start over at zero. They continue from where the original account left off. The evasion itself also counts as its own separate severe offense. If a ban could reset the counter, evasion would give players a free restart, and that would make the whole system pointless.

## 5. Appeals

1. **Submit**: the player has 14 days after the punishment to send an appeal with more information.
2. **Review**: someone other than the person who made the first decision looks at the case again using this document. They do not see what punishment was already given, so it does not affect their judgment.
3. **Resolve**: the punishment stays the same, gets reduced, or gets removed. The reason for the decision gets written down and matched to the exact rules that were or were not met.

If the same kind of detection keeps getting overturned on appeal, that is not bad luck. It is a sign that the detection system or the process needs fixing. It should be tracked as a pattern, not brushed off one case at a time.

## 6. Decision Matrix (Summary)

This is the short version. This table becomes `decision_matrix.json`.

| Type | Minor trigger | Moderate trigger | Severe trigger |
|---|---|---|---|
| Cheating / Hacking | Cosmetic or utility tool, no gameplay effect | Confirmed macro or script, single session | Confirmed script use across many sessions, or unusually high win rates |
| Exploitation | Minor cosmetic glitch abuse | Confirmed exploit used for real advantage | The same exploit used again and again across many matches |
| Matchmaking Abuse | Unclear sign of a possible smurf account | Confirmed paid boosting or rank manipulation | A group of people working together to boost accounts or manipulate ranks |
| Toxicity | Single incident, not targeted at one person | Repeated or targeted harassment | Threats, hate speech, or a group harassing someone together |
| Ban Evasion | N/A (Severe by definition) | N/A | Any confirmed alt account bypassing an active ban |

---

*This same table, written as JSON, is what the triage system reads directly. See `decision_matrix.json`.*