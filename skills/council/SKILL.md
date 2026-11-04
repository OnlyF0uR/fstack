---
name: council
description: Runs a council of specialist reviewer subagents over an app, game, design or codebase. Picks every specialist from its roster that applies to the target, such as web design, motion design, humanoid animation, rendering, accessibility, conversion, security or Rust, and each one judges the target by its own discipline's standards and scores it on a 1–7 scale. Round 0 is the baseline, then the lead fixes what the council found and the specialists score again in round 1 and round 2, with screenshots and the project's checks each round. Other products the user names are scored by the same specialists for comparison. Ends with a verdict and a score table. Use whenever the user mentions the council, such as "use the council", "ask the council", "council review", "let the council score this" or "add these to the council table".
---

# Council

Specialists review the same target separately, each through their own discipline, and score it. A specialist prompt with a practitioner's standards and methods finds more than a general reviewer does. You are the lead: you pick the specialists, gather evidence, fix, and report. Specialists only observe and score.

## 1. Pick the council

- **Target:** what's under review: a running app, a game, a design, or code.
- **Comparisons:** other products the user names. Scored by the same specialists, never changed.
- **Specialists:** every roster entry whose "applies when" fits the target. Skip any that would have nothing to inspect, since they can only guess. Add any the user names. If the target needs a discipline the roster lacks, write that specialist in the same shape as the roster files and say in the report that the roster should get it.

Post the target, comparisons, specialists and agent count (specialists × 3 rounds) in a few lines, then start without waiting.

### Roster

| Specialist | Applies when the target has |
|---|---|
| [web-design](references/specialists/web-design.md) | a website or store for visitors (instead of visual-design) |
| [visual-design](references/specialists/visual-design.md) | an app, panel, tool or game interface (instead of web-design) |
| [ux-product](references/specialists/ux-product.md) | screens a user moves through to get something done |
| [copywriting](references/specialists/copywriting.md) | text a user reads: headings, labels, errors, marketing |
| [motion-design](references/specialists/motion-design.md) | transitions, animated UI or loading motion |
| [humanoid-animation](references/specialists/humanoid-animation.md) | animated humanoid characters |
| [game-feel](references/specialists/game-feel.md) | real-time player control |
| [art-direction](references/specialists/art-direction.md) | a visual style that is part of the product: a game, illustration, 3D |
| [realtime-rendering](references/specialists/realtime-rendering.md) | its own rendering or GPU code |
| [conversion](references/specialists/conversion.md) | a purchase, sign-up or other funnel |
| [data-visualization](references/specialists/data-visualization.md) | charts, dashboards or KPIs |
| [accessibility](references/specialists/accessibility.md) | a user interface |
| [web-performance](references/specialists/web-performance.md) | pages served to a browser |
| [seo](references/specialists/seo.md) | public pages meant to be found through search |
| [qa](references/specialists/qa.md) | anything that runs |
| [rust](references/specialists/rust.md) | Rust source code |
| [code-correctness](references/specialists/code-correctness.md) | source code with logic and tests |
| [software-architecture](references/specialists/software-architecture.md) | a codebase or public API beyond a few files |
| [security](references/specialists/security.md) | auth, user data, payments, uploads, or network exposure |
| [reliability](references/specialists/reliability.md) | a service or worker that runs unattended |
| [systems-performance](references/specialists/systems-performance.md) | code where speed or memory matters outside a browser |

## 2. Evidence

Before each round, gather what every specialist shares, so they judge the same state:

- **A screen:** screenshots of the main screens and flow at desktop and phone size (or the app's window sizes), named by product, round and screen, like `ours-r1-checkout-390.png`. In round 0, the same set for each comparison.
- **A running app:** start it and pass the URL or run command.
- **A design:** the files and any brief.
- **Code:** the paths in scope, the diff, and the project's check output.

Give each specialist its own evidence folder for what it captures (video, traces, audit output).

## 3. Rounds

Round 0 is the baseline. Round 1 and round 2 each follow a set of fixes. Comparisons are scored only in round 0, in the same pass as the target, so all products share one scale.

Each round:

1. **Brief.** Build each prompt from [references/brief.md](references/brief.md) with the specialist's roster file pasted in whole, since subagents can't read this skill's files. Spawn all specialists in one message. Spawn new ones each round, because a specialist that remembers its score anchors on it. From round 1, include that specialist's previous findings but not its scores.
2. **Collect** one score per specialist per product. Record "no score" where none was given, never a number of your own.
3. **Fix** (after rounds 0 and 1). Fix findings you agree with that are high severity or raised by two or more specialists. Where specialists conflict, decide and note the trade-off. Don't change what the product does or how it should feel (pricing, positioning, new features): list those for the user.
4. **Prove.** Run the project's checks and retake the screenshots. Revert any fix that breaks a check. Commit each round separately.

Skip round 2 only if every round 1 score is 6 or higher with no high finding open, and say so. If the target can't be changed from here, run round 0 only and report recommendations.

## 4. Report

1. **Verdict:** two or three sentences on where the target stands, what moved it, and how it compares.
2. **Score table:** one row per specialist, plus a mean row. Columns are the target's rounds, then one column per comparison, named after that product. The last column says what drove the final score. With no comparisons, the table has only the round columns:

   | Specialist | R0 | R1 | R2 | Comparison name | … | What drove it |
   |---|---|---|---|---|---|---|

3. **Changes:** what was fixed each round, what was reverted and why, and the before and after evidence paths.
4. **Open:** remaining high findings, specialist conflicts, and decisions for the user, each with your recommendation.

If the work is in a pull request, put the table in its description under "Council review".
