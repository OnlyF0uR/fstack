---
name: reflect
description: Reviews the current Claude Code session for lessons that should change a skill and routes each one to the skill that owns it. Working style goes to four-mode, Rust to rust-dev or rust-gui, web builds to the ngd skills, and prose to humanizer and the other writing skills. Shows the proposed edits for one approval, then applies them in each skill's source repository, runs that repository's checks and commits. Use for /reflect, "reflect on this session", "capture what we learned" or "update the skills from this session".
disable-model-invocation: true
---

# Reflect

Turn what went wrong (or unexpectedly right) in this session into edits to the skills, so the next session starts from the corrected version. A skill edit changes every future session in every project that uses the skill. So this skill proposes first and applies only what the user approves.

Reflect improves skills. A mistake that belongs to one project, such as a convention in this repo or a helper agents keep bypassing, goes to the correct skill (`/fstack:correct`) instead. The fix there is a lint, a type or a test in the project, not more skill text.

## 1. Gather the session

Work from the conversation in context. If it was compacted, or the user asks about an earlier session, read the transcript. Claude Code keeps it at `~/.claude/projects/<slug>/<session-id>.jsonl`, where the slug is the working directory with each `/` and `.` replaced by `-`, so `/home/me/app` becomes `-home-me-app`. The newest `.jsonl` in that folder is the current session. Read only this project's folder, because the others hold private chats from unrelated projects.

Transcripts get large, so pull out the user's own messages first:

```bash
jq -r 'select(.type == "user") | .message.content
  | if type == "string" then . else (map(select(.type == "text") | .text) | join("\n")) end
  | select(length > 0 and (startswith("<system-reminder>") | not))' TRANSCRIPT.jsonl
```

Then read around the turns that matter. For a long transcript, give the reading to a subagent and have it return the candidate lessons with short quotes.

## 2. Find the lessons

Look for:

- **Corrections.** The user said no, "I said", "don't" or "why did you", undid a change, or redirected the work.
- **Bad skill guidance.** A skill's instruction was wrong, outdated or missing, or it led the agent the wrong way.
- **Detours.** The agent retried a failing approach, searched for something a skill could have told it, or worked out again a recipe it has needed before.
- **Wins nobody wrote down.** A command, an order of steps or a check that worked and that no skill mentions.

Then drop:

- **One-offs.** Something specific to this task, or a preference stated once. A lesson has to change a decision in a future session.
- **Rules that existed and got ignored.** More text rarely fixes that. Check whether the instruction is buried, vague or contradicted elsewhere, and fix that instead.
- **Anything a check could enforce.** That's the correct skill's job, and a check holds where text doesn't.

## 3. Route each lesson to its owner

| The lesson is about | It goes to |
|---|---|
| This project only | Not reflect. The project's CLAUDE.md, or the correct skill. |
| How the user likes to work, in any project | OnlyF0uR/fstack: `skills/four-mode/SKILL.md` |
| Another fstack skill | OnlyF0uR/fstack: that skill's folder under `skills/` |
| Rust in general | Atroxabot/skills: `skills/rust-dev/` or `skills/rust-gui/` |
| Building sites, stores or panels | OnlyF0uR/ngd. Shared material lives in `shared/`, so edit it there and never in a skill's synced copy. Some council specialists in fstack copy from ngd. When an ngd file changes, update every specialist whose `Source:` line names it (`grep -rn "Source: OnlyF0uR/ngd" skills/council` in fstack) in the same session. |
| Writing | Atroxabot/skills: `skills/humanizer/` and the format skills. The humanizer's catalog and scanner are the originals of copies in three other skills, and of the condensed list in any council specialist whose `Source:` line names it (`grep -rn "Source: Atroxabot/skills" skills/council` in fstack), so update all of them in the same session. |
| A skill that should have triggered and didn't | That skill's `description` |
| A workflow that keeps coming back and that no skill covers | A new skill, in the home that the New skills table in the four-mode skill gives it. This is rare: propose it, but don't write it in this pass. |

Fix a skill at its source, not with an override in four-mode. "When ngd says X, do Y" leaves ngd wrong for every other session, and four-mode turns into a pile of patches that contradict the skills it routes to.

**Find the source checkout.** The installed copy under `~/.claude/plugins/` is a cache that the next update overwrites, so never edit it. Look for a local clone:

```bash
find ~ /workspace -maxdepth 4 -name .git -type d 2>/dev/null | while read -r g; do
  d=${g%/.git}; echo "$(git -C "$d" remote get-url origin 2>/dev/null) $d"
done | grep -iE 'OnlyF0uR/fstack|Atroxabot/skills|OnlyF0uR/ngd'
```

If there isn't one, clone the repository into a scratch directory. If that fails too, write the change as a patch file and say where it is in the reply.

Before drafting, read the target repository's CLAUDE.md and follow it. Atroxabot/skills asks for a reason with every rule, for your own words instead of copied text, and for the copy-and-compare step after a change to the humanizer's files. ngd changes shared files in `shared/` and then syncs them into each skill.

## 4. Propose

For each lesson, draft the smallest edit that would change the decision:

- the repository and the file,
- the change, as the text before and after,
- the evidence, as a short quote or the moment in the session,
- what a future session would do differently.

Prefer fixing or deleting a wrong line over adding a new one. Give the reason with any new rule, because a model handles cases a rule never names when it knows why the rule exists. Keep each `SKILL.md` under 500 lines by moving long material to `references/`.

Show all the proposals in one message, numbered. Then ask once which ones to apply, and whether to push after committing. Use the question tool with multi-select when the proposals fit its option limit, and otherwise ask in plain text by number. Wait for the answer: a single session can mislead, and a bad edit spreads to every future session.

## 5. Apply

For each approved edit, in each repository:

1. Make the edit in the source checkout.
2. Run the repository's own checks:
   - OnlyF0uR/fstack: `node scripts/check.mjs`
   - OnlyF0uR/ngd: `node scripts/sync-shared.mjs`, then `node scripts/sync-shared.mjs --check`
   - Atroxabot/skills: the copy-and-compare loop from its CLAUDE.md, after any change to the humanizer's catalog or scanner
3. Commit on the checkout's current branch. The message names the skill and the lesson, for example `rust-dev: say when to reach for parking_lot (from a session on the cache crate)`.
4. Push if the user approved pushing. Otherwise list the commits that aren't pushed yet.

If the edited skill has eval prompts in an `evals/` folder that cover the change, name them in the reply so the user can run them. Don't run them by default, because they're slow and a small edit rarely needs them.

## 6. Reply

- **Applied.** The repository, the file and one line per edit, with its commit.
- **Sent elsewhere.** Lessons that went to the correct skill or to a project's CLAUDE.md.
- **Dropped.** One line each, with the reason.
