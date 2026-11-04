# fstack: working in this repo

fstack is a Claude Code plugin marketplace for one person's way of working. The `fstack` plugin holds the core loop: four-mode (the working style), reflect (session lessons into skill edits) and correct (repeated mistakes into checks in a project). The `fstack-extras` plugin holds other personal skills, such as council. Domain skills live in their own repositories, Atroxabot/skills and OnlyF0uR/ngd. fstack refers to them by name and never copies them, because a copy drifts from its original.

## Layout

```
skills/<skill-name>/
  SKILL.md          # frontmatter (name, description, disable-model-invocation) + instructions
  references/       # optional: long material, linked from SKILL.md
.claude-plugin/marketplace.json  # every plugin, each listing its own skills
scripts/check.mjs   # validates skills, plugins and the README table
.claude/settings.json  # Stop hook that runs the check before Claude finishes a turn here
```

## Adding a skill

Whether a skill belongs in fstack at all is decided by the "New skills" table in `skills/four-mode/SKILL.md`. That table is the only copy, so the choice comes out the same in any project. If it belongs here:

1. **Pick the plugin.** `fstack` holds the core loop and anything those three skills need to work, because it's installed everywhere and every skill in it costs every session. Every other skill goes in `fstack-extras`, which can be left off without losing the core.
2. **Create `skills/<name>/SKILL.md`.** The `name` equals the folder (kebab-case, at most 64 characters), and the `description` is at most 1024 characters with no angle brackets.
3. **Decide how it starts.** A skill the model should pick up on its own needs a description that lists the phrases the user types, and that description goes into every session. A skill the user types as a command gets `disable-model-invocation: true`, so it never fires by surprise. Compare a new description with rust-dev, ngd and humanizer, because overlapping descriptions make the wrong skill fire.
4. **Add `"./skills/<name>"` to that plugin's `skills` list** in `.claude-plugin/marketplace.json`. Never leave a plugin with an empty `skills` list. Claude Code then loads every folder in `skills/`, so that plugin would install the core skills a second time.
5. **Add a row to the README table**, with the plugin in the second column.
6. **Run `node scripts/check.mjs`.** It fails on a skill that no plugin lists, a skill in two plugins, an empty plugin, and a README row with the wrong plugin. The Stop hook runs the same check before Claude finishes a turn in this repo, so a skill can't be left half added.

## Rules

- **Work on `main`.** There are no long-lived branches. Commit small changes that pass the checks and push.
- **Run the checks before every commit.** `node scripts/check.mjs` (CI and the Stop hook run it too) and `claude plugin validate .`. A skill with broken frontmatter fails silently: it just never shows up.
- **No `plugin.json`.** The plugins are defined in `marketplace.json`, because one repository holds several plugins and each lists its own skills. A root `plugin.json` conflicts with those lists and the plugins fail to load. The check script fails if one appears.
- **No version on the plugin entries.** Installs track the latest commit, which suits a repo that changes often.
- **Self-contained skills.** A skill folder may be installed or uploaded on its own, so it never links to files outside itself. The check script enforces this.
- **Keep four-mode short and cross-cutting.** It stays in the context window for the whole session, so every line costs attention on every turn. Rules about one domain belong in that domain's skill (rust-dev, ngd-*), and rules about one project belong in that project.
- **Explain why.** Give the reason with each rule instead of a bare MUST. The model applies a reason to cases the rule never names.
- **Write in your own words.** pstack inspired this repo and is credited in the README. Don't paste its text, because copied text brings its license and notice requirements with it.
