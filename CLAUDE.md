# fstack: working in this repo

fstack is a Claude Code plugin with three skills: four-mode (the working style), reflect (session lessons into skill edits) and correct (repeated mistakes into checks in a project). Domain skills live in their own repositories, Atroxabot/skills and OnlyF0uR/ngd. fstack refers to them by name and never copies them, because a copy drifts from its original.

## Layout

```
skills/<skill-name>/
  SKILL.md        # frontmatter (name, description, disable-model-invocation) + instructions
  references/     # optional: long material, linked from SKILL.md
scripts/check.mjs # validates skills, manifests and the README table
.claude-plugin/   # plugin.json and marketplace.json (one plugin, source "./")
```

## Rules

- **Work on `main`.** There are no long-lived branches. Commit small changes that pass the checks and push.
- **Run the checks before every commit.** `node scripts/check.mjs` (CI runs it too) and `claude plugin validate .`. A skill with broken frontmatter fails silently: it just never shows up.
- **Self-contained skills.** A skill folder may be installed or uploaded on its own, so it never links to files outside itself. The check script enforces this.
- **Keep four-mode short and cross-cutting.** It stays in the context window for the whole session, so every line costs attention on every turn. Rules about one domain belong in that domain's skill (rust-dev, ngd-*), and rules about one project belong in that project.
- **Explain why.** Give the reason with each rule instead of a bare MUST. The model applies a reason to cases the rule never names.
- **Write in your own words.** pstack inspired this repo and is credited in the README. Don't paste its text, because copied text brings its license and notice requirements with it.
- **No version in plugin.json.** Installs track the latest commit, which suits a repo that changes often. The check script fails if a version appears.
- **New skill:** add `skills/<name>/SKILL.md` (name equals the folder, kebab-case, description at most 1024 characters with no angle brackets), and a row in the README table.
