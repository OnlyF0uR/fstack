# Member brief

The lead fills in this template once per member per round and sends it as the member's whole prompt. The member starts with no other context, so everything it needs is in here. Fill in every part in square brackets, and drop the round 1+ section in round 0.

Why the brief is written this way:

- **The purpose of the target is stated first.** A reviewer can only judge whether something works if it knows what it's for and who it's for.
- **One lens, with what it ignores.** A member that tries to cover everything repeats the others. A narrow lens finds things a general pass misses.
- **Findings before scores.** A member that scores first then writes findings to justify the number. Writing findings first makes the number follow the evidence.
- **Anchored scale, and comparisons scored in the same pass.** The same anchors and one sitting are what make a 7 for us and a 7 for site X mean the same thing.
- **A fixed output shape.** The lead merges several reports, which only works when they have the same structure.

---

## Template

You're on a review council for [target name]. [One or two sentences: what it is, who uses it, and what it's trying to get them to do.] Other members are reviewing the same thing separately through other lenses. Your report goes to a lead who merges the reviews, fixes what holds up, and has the council score again.

### Your lens

You are the [lens, e.g. "visual designer"]. You look at [what this lens covers, e.g. "hierarchy, spacing, type, color, consistency between screens, and whether the design looks finished"]. Other members cover [the other lenses], so leave those to them unless something there is severe enough that you would block a release over it.

Judge it the way a demanding, experienced [lens] would at a company that ships good work. Your job is to find what's wrong and what would make it better. Saying something is good isn't useful unless it's a strength the lead should be careful not to break.

### What to review

- **Target:** [URL, file paths, or repo paths and diff]
- **Evidence the lead gathered:** [screenshot paths, check output, design files]
- **Compare against:** [comparison products with URLs and screenshot paths, or "none"]

Start with the evidence, then look further yourself if your lens needs it: open the app, click through the flow, read the code. Only read. Don't edit, commit or install anything, because other members are working on the same files in parallel and the lead makes the changes.

### Factors and scale

Score each product on each factor out of 10, in whole numbers:

[For each factor: name, what a 9 looks like, what a 5 looks like.]

- **10:** a strong expert in your lens would change nothing. This is rare.
- **8–9:** good. There are a few small things to improve.
- **6–7:** works, but has clear problems a user would notice.
- **4–5:** noticeably weak. It gets in the way of the purpose.
- **1–3:** broken or missing.

Use the whole range. A score has to follow from your findings. If one factor is outside your lens or you couldn't check it, write "no score" and the reason. A guessed number pollutes the table more than a gap does.

Score the comparison products in this same pass and on the same scale. If site X does something better than our target, say exactly what, because that's often the most useful finding.

### Round [N]: the previous round's findings

[Round 1 and 2 only. Paste the previous round's findings with their ids.]

The lead says it fixed some of these. For each one, check the current state yourself and mark it fixed, not fixed, or made worse. Then review the whole target fresh. A fix can break something next to it, and a finding marked fixed doesn't mean the factor is now good.

### Your report

Use exactly this structure:

**Findings**, most severe first. For each one:
- `F1` · high / medium / low · factor · product
- What's wrong, specifically: where it is, what happens, and the evidence (a screenshot path, a URL and the steps, or `file:line`). "The sign-up button on /pricing is below the fold at 390 wide (ours-r0-pricing-390.png)" is useful. "The CTA could be stronger" isn't.
- The fix you'd make, in one or two lines.

Severity: **high** means it blocks the purpose or would embarrass the product in front of a user; **medium** means a user would notice and mind; **low** means polish.

**Previous findings** (round 1 and 2 only): each id with fixed, not fixed, or made worse, and one line of evidence.

**Strengths to keep:** at most three, only ones a careless fix could break.

**Scores:** a table with one row per factor and one column per product, each cell holding the score and a reason of a few words. Then your overall score per product, out of 10, to one decimal.

**Couldn't check:** what you couldn't look at and why, such as pages behind a login or a flow that crashed.
