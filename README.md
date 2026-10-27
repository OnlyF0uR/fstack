# fstack

A personal Claude Code plugin for working fast without code review. It holds the working style and a loop that keeps improving it. The domain knowledge lives in other skill collections: [Atroxabot/skills](https://github.com/Atroxabot/skills) for Rust and writing, and [OnlyF0uR/ngd](https://github.com/OnlyF0uR/ngd) for websites, stores and panels.

When changes go in quickly and nobody reviews them, two things keep the code healthy. The agent proves its own work before it says done, and a mistake made twice becomes a check so it can't happen a third time. fstack is built around those two.

| Skill | What it does |
|-------|--------------|
| [four-mode](./skills/four-mode) | The working style. Acts without asking on reversible work, counts a change as done only with real check output in the reply, reproduces bugs and fixes them where they start, and proves the one fact a risky change is safe because of. Routes Rust to rust-dev and rust-gui, web builds to the ngd skills, and prose to humanizer. |
| [reflect](./skills/reflect) | Reviews a session for lessons and edits the skill that owns each one: four-mode for working style, the Atroxabot or ngd skill for domain knowledge. Shows the edits for one approval, then commits them in each skill's source repository. |
| [correct](./skills/correct) | Makes a mistake agents keep repeating in a project impossible to repeat, at the strongest level that works: the design, types, a clippy or ESLint check whose error names the fix, a test, a Claude Code hook, and a written rule only last. Proves each check fails on the real mistake. |

## How the three fit together

1. Start a session with `/fstack:four-mode`. Its instructions stay in the conversation from then on.
2. When you correct the agent for the same thing twice, run `/fstack:correct`. The fix lands in the project as a check, so the next session can't repeat it.
3. When a skill gave wrong or missing guidance, or a session took far longer than it should have, run `/fstack:reflect` at the end. The fix lands in the skill.

All three run only when you type them (`disable-model-invocation: true`), so they never start on their own in the middle of other work.

## Install

```text
/plugin marketplace add OnlyF0uR/fstack
/plugin install fstack@fstack
```

The skills then appear as `/fstack:four-mode`, `/fstack:reflect` and `/fstack:correct`. `plugin.json` has no `version`, so installs track the latest commit. Update with `claude plugin marketplace update fstack && claude plugin update fstack@fstack`, or turn on auto-update for the marketplace in `/plugin`.

four-mode routes to skills from two other marketplaces. Install those too:

```text
/plugin marketplace add Atroxabot/skills
/plugin install engineering-skills@atroxabot-skills
/plugin install writing-skills@atroxabot-skills
/plugin marketplace add OnlyF0uR/ngd
/plugin install ngd@ngd
```

To use one skill without the plugin, copy its folder into `~/.claude/skills/`. It's then `/four-mode` instead of `/fstack:four-mode`.

## Maintaining

- `node scripts/check.mjs` checks every skill's frontmatter, its size and its links, the plugin manifests, and this table. CI runs it on every push.
- `claude plugin validate .` checks the manifests against Claude Code's own rules.
- reflect edits these skills too. Review what it changes in four-mode the way you'd review any rule that every session will follow.

## Credits

The ideas behind fstack come from [pstack](https://github.com/cursor/plugins/tree/main/pstack) by Lauren Tan, especially its reflect and correct skills and its rule that a change is done only with evidence. The text here is written from scratch for Claude Code and for a workflow without review.
