---
name: council
description: Runs a review council of specialist subagents over an app, game, design or codebase. Picks every specialist from its roster that applies, such as web design, motion design, humanoid animation, rendering, accessibility or Rust, and each scores the target on a 1–7 scale. Round 0 is the baseline, and after the lead fixes what the specialists found, fresh specialists score again in round 1 and round 2. Products the user names are scored alongside. Use when the user asks for the council, such as "use the council", "ask the council", "council review" or "add these to the council table". Not for a council that is the subject of the user's own project, such as a city council site.
---

# Council

Specialists review the same target separately, each through their own discipline, and score it. A prompt with a practitioner's standards and methods finds more than a general reviewer does. You are the lead: you pick the specialists, gather evidence, fix, and report. Specialists only observe and score.

## 1. Set up

- **Target:** what's under review: a running app, a game, a design, or code. "Products" means the target and its comparisons.
- **Comparisons:** other products the user names. Scored by the same specialists, never changed, and never ours to probe.
- **Ownership:** whether the target can be changed from here. If it can't (someone else's site, a design you only have as images), the run is round 0 only, with recommendations instead of fixes.
- **Specialists:** every roster entry whose "applies when" fits the target. Skip any that would have nothing to inspect, since they can only guess. If the user names specialists and says "only" or "just", run only those; otherwise add them. If the target needs a discipline the roster lacks, write that specialist in the shape described under the roster, save it in the run folder as `<name>/specialist.md`, reuse it every pass, and list it under Open as a roster gap.
- **Run folder:** a folder outside the project (your scratchpad, or a temp folder) holding `shared/` and one folder per specialist. Evidence, briefs and reports live here, never in the project, so they aren't committed and survive a compacted conversation.
- **Tools:** check once what's available: Playwright and its browser, ffmpeg, a display or GPU, the project's own scripts, and the paths of related skills that specialist files mention (rust-dev, humanizer). Every brief lists them, so no specialist discovers a gap alone.
- **Project state:** if fixes will change files in a repository, check `git status`. If the tree has uncommitted changes, ask before starting, because fixes and reverts must not mix with the user's work. Install dependencies and build once, so specialists only run things, then run the project's checks and save the output as the baseline.

Post the target, comparisons, specialists and agent count (specialists × planned rounds) in a few lines, then start without waiting.

### Roster

"Runs" says how a specialist is scheduled. **Alone:** it measures timing, so it runs by itself after the others, because parallel load skews its numbers. **Own data:** it changes app state, so on a target we own it gets its own test account or data.

| Specialist | Applies when the target has | Runs |
|---|---|---|
| [web-design](references/specialists/web-design.md) | pages for visitors: a site, store or landing page | |
| [visual-design](references/specialists/visual-design.md) | an app, panel, tool or game interface. A product with both a public site and an app gets both, each with its own screens. | |
| [ux-product](references/specialists/ux-product.md) | screens a user moves through to get something done | own data |
| [copywriting](references/specialists/copywriting.md) | text a user reads: headings, labels, errors, marketing, docs | |
| [motion-design](references/specialists/motion-design.md) | transitions, animated UI or loading motion | alone |
| [humanoid-animation](references/specialists/humanoid-animation.md) | animated humanoid characters | alone |
| [game-feel](references/specialists/game-feel.md) | real-time player control | alone |
| [art-direction](references/specialists/art-direction.md) | a visual style that is part of the product: a game, illustration, 3D | |
| [realtime-rendering](references/specialists/realtime-rendering.md) | its own rendering or GPU code | alone |
| [conversion](references/specialists/conversion.md) | a purchase, sign-up or other funnel | own data |
| [data-visualization](references/specialists/data-visualization.md) | charts, dashboards or KPIs | |
| [accessibility](references/specialists/accessibility.md) | a user interface | |
| [web-performance](references/specialists/web-performance.md) | pages served to a browser | alone |
| [seo](references/specialists/seo.md) | public pages meant to be found through search | |
| [qa](references/specialists/qa.md) | anything that runs | own data |
| [rust](references/specialists/rust.md) | Rust source code | |
| [code-correctness](references/specialists/code-correctness.md) | source code with logic and tests | |
| [software-architecture](references/specialists/software-architecture.md) | a codebase or public API beyond a few files | |
| [security](references/specialists/security.md) | auth, user data, payments, uploads, or network exposure | own data |
| [reliability](references/specialists/reliability.md) | a service or worker that runs unattended | |
| [systems-performance](references/specialists/systems-performance.md) | code where speed or memory matters outside a browser | alone |

Every specialist file has these parts in order: a short "who you are" paragraph and any precedence notes, What you judge, an optional section of domain rules, How you inspect, Failures you're known for catching, and Calibration with a **Strong** and a **Weak** anchor. A new specialist follows the same shape. Adding it to the roster is a separate change to this skill.

## 2. Evidence

A pass is one round of specialist reviews: `r0`, `r1`, `r2`, or `c1`, `c2` and so on for comparisons added later. Before each pass, gather the evidence all specialists share, in `shared/`, so they judge the same state. A target can need several of these; a game, say, needs all but the design files.

- **Targets with a screen:** screenshots of the main screens and flow at desktop and phone size (or the app's window sizes), named by product, pass and screen, like `target-r1-checkout-390.png`. In r0 and each c pass, the same set for each comparison.
- **Targets that run:** start the app and pass the URL or run command.
- **Designs:** the files and any brief.
- **Code:** the paths in scope, the diff against the baseline from round 1 on, and the check output.

## 3. Rounds

Round 0 is the baseline. Round 1 and round 2 each follow a set of fixes. Comparisons are scored only in r0 and c passes, in the same pass as the target, so all products share one scale.

Each round:

1. **Brief.** Build each prompt from [references/brief.md](references/brief.md) with the specialist's file pasted in whole: subagents don't load this skill or know where its files are, and pasting guarantees they see all of it. Use a general-purpose subagent that can run commands. Save each brief as `<specialist>/brief-<pass>.md`.
2. **Spawn** new specialists each round, because one that remembers its score anchors on it. Run them in parallel, then the "alone" specialists one at a time.
3. **Collect.** Save each report as `<specialist>/report-<pass>.md`. A score must be one whole number from 1 to 7. If it isn't, continue the subagent if your tools allow it, or spawn it again with its report and ask only for the score. If a specialist fails, or couldn't score because evidence was missing that you can supply, supply it and spawn it once more. Otherwise record "no score", never a number of your own. A specialist that can't score because a tool is missing (no display for game-feel, say) is left out of later rounds and listed under Open.
4. **Fix** (after rounds 0 and 1). Fix every high and medium finding you agree with, and lows that are cheap. Two findings are the same when they point at the same place and cause, whichever specialists raised them. Where specialists conflict, decide and note the trade-off. Don't make product decisions (pricing, positioning, new features, the intended style or mood): list those for the user. Record every finding you declined, with the reason.
5. **Prove**, one fix at a time: make it, run the checks, and revert it if it adds a failing test, error or warning kind that isn't in the baseline (compare by test name and warning kind, not line numbers, and rerun once before reverting a flaky failure). Check it against the specialists' "strengths to keep". Commit it alone, touching only its files, with its finding ids in the message. Findings that change the same lines are one fix. After the last fix, retake the shared evidence.

From round 1, each specialist gets its own previous findings, each marked with your decision (fixed, declined and why, or reverted and why), but not its scores.

After round 1, skip round 2 if every specialist that ran in round 1 scored 6 or higher and no high finding is open (a declined high counts as open). A "no score" in round 1 prevents the skip; specialists left out for a missing tool don't count, and their later cells read "—". If you skip, still make round 1's fixes and mark them "not rescored" under Changes.

**A target score.** If the user sets one ("keep going until the mean is above 6"), keep fixing and running passes after round 2 (`r3`, `r4` and so on) until it's met. Stop early, and say why, if two passes in a row don't raise the mean, because the remaining findings then need the user's decisions rather than more rounds.

**Adding comparisons later.** When the user asks to add products to an existing table, run the next c pass (`c1`, then `c2`) with the same specialists over the target's current state and the new products together, building briefs from the template for that pass. If the earlier table isn't in this conversation, take it from the pull request's "Council review" section or ask the user for it. Add a column "Now" for the target, then the new products.

## 4. Report

1. **Verdict:** two or three sentences on where the target stands, what moved it, and how it compares.
2. **Score table:** one row per specialist, plus a mean row. Columns are the target's rounds, then one column per comparison, named after that product. The last column says what drove the final score. With no comparisons, leave out the comparison columns. The mean leaves out "no score" cells and says how many scores it averages when that differs between columns.

   | Specialist | R0 | R1 | R2 | Comparison name | … | What drove it |
   |---|---|---|---|---|---|---|

3. **Changes:** what was fixed each round, what was declined or reverted and why, and the before and after evidence paths. For a target that can't be changed, this section is **Recommendations** instead: every finding you agree with, by severity.
4. **Open:** remaining high findings, unfixed mediums from the last pass with a recommendation, specialist conflicts, specialists left unscored, roster gaps, and decisions for the user, each with your recommendation.

If the work is in a pull request, put the table in its description under "Council review".
