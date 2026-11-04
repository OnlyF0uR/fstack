---
name: council
description: Runs a council of independent reviewer subagents over an app, site, design or codebase. Each member gets one lens chosen to fit the target and scores it out of 10 on factors picked for that target, with evidence. Round 0 is the baseline, then the lead fixes what the council found and the members score again in round 1 and round 2, with screenshots and the project's checks each round. Other products the user names are scored on the same factors so the table compares them. Ends with a verdict and a score table. Use whenever the user mentions the council, such as "use the council", "ask the council", "council review", "let the council score this" or "add X and Y to the council table".
---

# Council

A council is a few reviewers who each look at the same target through one lens, without seeing each other's work, and score it on shared factors. Separate contexts are the point. One reviewer drifts toward its first impression, while three with different lenses disagree in useful places. You are the lead: you set the council up, gather the evidence, apply the fixes and write the report. The members only look and score.

## 1. Set up

Work these out from the request and the target, state them in a few lines, and start. Don't wait for approval, since a wrong choice costs one round.

- **Target.** The thing being reviewed: a running app or URL, a design (mockup, screenshot, Figma export, artifact), or code (a repo, a feature, a diff).
- **Comparisons.** Other products the user names ("also look at site X and site Y"). They're scored on the same factors but never changed.
- **Members.** Three by default, and up to five only when the target spans more lenses than that. Pick lenses that fit this target and don't overlap, because two members with the same lens produce the same findings at twice the cost. If the user names members, use theirs. Some examples:

  | Target | Lenses that usually fit |
  |---|---|
  | Web app or site | visual designer, product and UX, frontend engineer |
  | Design with no code yet | visual designer, UX and flows, copy and brand |
  | Code, a library or a backend | correctness and tests, architecture and API, security and operability |
  | Store or landing page | conversion, visual designer, performance and accessibility |

- **Factors.** Four to seven things to score, chosen for this target and the user's goal, so a checkout gets "trust" and "checkout friction" while a library gets "API clarity" and "error handling". Use the user's factors if they give any. For each factor, write one line on what a 9 looks like and one on what a 5 looks like. Every member scores every product in every round against those same anchors, which is what makes the numbers comparable.

## 2. Evidence

Gather the shared evidence yourself before each round, so every member judges the same state:

- **Anything with a screen:** screenshots of the main screens and the main flow at desktop (1440 wide) and phone (390 wide) width, using Playwright or whatever the project already uses. Take them for the comparisons too in round 0. Name the files by product, round and screen, such as `ours-r1-pricing-390.png`.
- **A design:** the files themselves, plus any brief or notes that came with them.
- **Code:** the paths in scope, the diff if there is one, and the output of the project's checks.

Members may look further on their own (open the app, read more code), but only to read.

## 3. Rounds

There are three rounds: **round 0** is the baseline, then **round 1** and **round 2** each come after a set of fixes. The comparisons are scored in round 0 only, alongside the target and by the same members, so all products land on one scale. Their scores carry forward unchanged.

For each round:

1. **Brief the members** with [references/member-brief.md](references/member-brief.md), filled in for this target and round. Spawn them all in one message so they run in parallel, and spawn new ones each round. A member who remembers its last score anchors on it. In round 1 and round 2, include the previous round's findings for the members to check, but not the scores.
2. **Collect.** For each factor, the score is the median of the members who scored it. The overall score is the mean of the factor scores, to one decimal. A member who gave no score for something is recorded as "no score". Never fill in a number for them.
3. **Choose fixes** (after round 0 and round 1 only). Fix the findings you agree with that are rated high, or raised by two or more members. Leave out anything that changes what the product does or how it should feel, such as pricing, positioning or a new feature, and list it for the user instead. Keep fixes inside the target, because a council round invites scope creep.
4. **Fix and prove it.** Make the fixes, run the project's checks, and retake the screenshots. If a fix breaks a check, revert it and note that in the report. Don't push it through. In a repository, commit each round's fixes on their own so a bad round is easy to undo.

Stop early only if, after round 1, every factor is at 9 or higher and no high finding is open. Say so in the report.

When the target can't be changed from here (someone else's site, or a design you have only as images), run round 0 only and report recommendations instead of fixes.

## 4. Report

Give the user, in the final reply:

1. **The verdict** in two or three sentences: where the target stands, what moved it, and how it compares.
2. **The score table.** Factors are rows and products and rounds are columns, with an overall row at the bottom:

   | Factor | Ours R0 | Ours R1 | Ours R2 | Site X | Site Y |
   |---|---|---|---|---|---|
   | Clarity of the main action | 5 | 7 | 8 | 7 | 6 |
   | Overall | 5.4 | 6.9 | 7.8 | 7.1 | 6.2 |

3. **The members table**, with each member's overall score per round, so the user can see whose view moved and whose didn't.
4. **What changed** in each round, what was reverted and why, and the paths of the before and after screenshots.
5. **What's still open**: the remaining high findings, and the product and taste calls left for the user, each with your recommendation.

If the work is in a pull request, add the same tables to its description under "Council review".
