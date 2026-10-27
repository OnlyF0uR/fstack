---
name: correct
description: Makes a mistake that agents keep repeating in a project hard or impossible to repeat. Finds the mistake class from the session and the git history, then fixes it at the strongest level that works. The levels, in order, are the design, types, a clippy, ESLint or script check whose error names the fix, a test, a Claude Code hook, and only last a written rule. Proves each new check fails on the real mistake and keeps a rule table in the project's CLAUDE.md. Use for /correct, "you keep doing X", "stop making this mistake" or "make sure agents never do Y again".
disable-model-invocation: true
---

# Correct

The user keeps correcting agents in this project for the same mistake. Change the project so the next agent can't make it.

Assume the next agent sees only the files it opens, copies the nearest example, and takes the shortest path that compiles. A rule in a document doesn't stop that agent, because nothing fails when it skips the rule. A private module, a type or a lint error does stop it. So fix each mistake at the strongest level that works, and write a rule only when nothing stronger can hold it.

Correct changes the project. A mistake that comes from a skill's advice, such as rust-dev recommending an API that has since changed, goes to the reflect skill (`/fstack:reflect`) instead.

## 1. Name the mistake

If the user named it, start there. Their saying so counts as evidence. Otherwise collect it from:

- corrections in this session,
- reverts and quick follow-up fixes in the project's history (`git log --oneline -i --grep=revert -50`, and commits that fix files a recent commit had just changed),
- rules in the project's CLAUDE.md that keep getting broken,
- earlier sessions in `~/.claude/projects/<slug>/`, where the slug is the project path with each `/` and `.` replaced by `-`. Read this project's folder only, because the others are private chats from unrelated projects.

Group what you find into classes. A class counts once it has happened twice. Write each one as: agents do X, they should do Y, seen at these commits or moments in the session.

## 2. Fix it at the strongest level that works

Go down this list and stop at the first level that can stop the mistake. [references/enforcement.md](references/enforcement.md) has tested examples for levels 3 and 5.

1. **Design, so the wrong thing can't be reached.** Make internals private: `pub(crate)` with no re-export in Rust, and not exported from the package entry point in TypeScript. Give each job one supported way, and delete the old ways and the dead examples an agent would copy. Replace lists that are kept in sync by hand with one source that generates the rest.
2. **Types, so the wrong state can't be written.** In Rust: newtypes such as `UserId(u64)`, enums instead of flags, constructors that validate behind private fields, typestate for "call A before B", `#[must_use]` and `#[non_exhaustive]`. In TypeScript: branded types, discriminated unions, `satisfies`, and strict compiler options such as `noUncheckedIndexedAccess`.
3. **A check whose error names the fix.** The message matters most: the agent reads it and does the right thing without another round with the user.
   - Rust: `disallowed-methods`, `disallowed-types` and `disallowed-macros` in `clippy.toml`, each with a `reason` that names the replacement, set to `deny` in the `[lints]` table.
   - React and TypeScript: ESLint's `no-restricted-imports` and `no-restricted-syntax`, each with a `message`.
   - Anything no linter can see: a short script (a `git grep` is fine) that prints the file and what to use instead, run the same way locally and in CI.
   - If the pattern is already common, fail only on new occurrences with an allowlist of the files that still have it, and shrink that list over time.
4. **A test that fails when the behavior breaks.** Also fix or delete tests that still pass with the behavior broken. They're often how the mistake got through.
5. **A Claude Code hook**, for mistakes in what the agent does rather than in the code it writes, such as running the wrong command, editing generated files, or finishing with a step skipped. A `PreToolUse` hook in the project's `.claude/settings.json` reads the tool call as JSON on stdin and blocks it by exiting with code 2. Its stderr reaches the agent, so write the instruction there. A `Stop` hook that exits with code 2 sends the agent back to work instead of letting it finish. Hooks run on every matching call, so keep them fast.
6. **A written rule in the project's CLAUDE.md**, only for judgment calls that nothing above can check.

For each class, say why the levels above the one you picked don't work.

## 3. Prove the check works

A check you never saw fail is a guess. For each new check:

1. Bring back the real mistake (from the commit or the moment in the session where it happened) as a scratch change.
2. Run the check and confirm it fails with a message that names the fix.
3. Undo the scratch change and confirm the check passes.

Put both outputs in the reply. Run the check the way the project already runs its checks, and add it to CI when the project has CI.

Allow an exception only on the line that needs it, with a reason the next reader can judge. In Rust that's `#[expect(clippy::disallowed_methods, reason = "...")]`, which also warns once the exception is no longer needed. In TypeScript it's `// eslint-disable-next-line no-restricted-syntax -- reason`.

## 4. Commit and record

Make one commit per class, named after the class and the level, such as `correct: read the time through Clock, not SystemTime::now (clippy)`.

Keep a table in the project's CLAUDE.md that pairs each rule with what enforces it. Add the section the first time:

```markdown
## Rules and what enforces them

| Rule | Enforced by |
|---|---|
| Read the time through `Clock`, never `SystemTime::now()` | clippy `disallowed-methods` (clippy.toml) |
| Never edit files under `src/generated/` | PreToolUse hook (.claude/hooks/no-generated.sh) |
| One query per page, not one per row | written rule only |
```

When the user corrects a mistake that's already in the table as "written rule only", it has repeated. Move it up a level now, in the same change. Remove a row once the design makes the mistake impossible, because there's nothing left to remember.

## Reply

For each class: the evidence, the level you picked and why the higher levels don't work, the check's failing and passing output, and the commit.
