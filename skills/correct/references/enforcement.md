# Enforcement examples

Working examples for the levels in the correct skill that need configuration: a check whose error names the fix (level 3), and a Claude Code hook (level 5). Each one was run against a scratch project with the tool versions noted, and the failing case printed the message shown. Rename the paths and the replacements, and keep the shape.

## Rust: clippy's disallowed lists

Tested with clippy 0.1.97 (Rust 1.97).

`clippy.toml` at the workspace root. The `reason` is printed under the error, so write it as the instruction:

```toml
disallowed-methods = [
    { path = "std::time::SystemTime::now", reason = "read the time through `Clock` (src/clock.rs) so tests can control it" },
    { path = "std::sync::mpsc::channel", reason = "use the bounded `queue::channel`, so a slow consumer can't grow memory without limit" },
]
disallowed-types = [
    { path = "std::collections::HashMap", reason = "use `IndexMap` so iteration order, and with it the output, is stable" },
]
disallowed-macros = [
    { path = "std::println", reason = "library code logs with `tracing::info!` and friends" },
]
```

These lints only warn by default. Make them errors in `Cargo.toml`, so they fail without depending on `-D warnings`:

```toml
# single crate
[lints.clippy]
disallowed_methods = "deny"
disallowed_types = "deny"
disallowed_macros = "deny"

# workspace: put the table under [workspace.lints.clippy] in the root Cargo.toml,
# and add this to each member's Cargo.toml
[lints]
workspace = true
```

What the agent sees:

```
error: use of a disallowed method `std::time::SystemTime::now`
  = note: read the time through `Clock` (src/clock.rs) so tests can control it
```

The one legitimate use gets an exception on the item, with a reason. `expect` (unlike `allow`) warns once the exception is no longer needed:

```rust
#[expect(clippy::disallowed_methods, reason = "the Clock implementation is the one place that reads the system time")]
fn system_now() -> SystemTime {
    SystemTime::now()
}
```

## TypeScript and React: ESLint's restricted lists

Tested with ESLint 9.39, flat config.

```js
// eslint.config.js
export default [
  {
    files: ["app/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        paths: [
          { name: "axios", message: "Use the `api` client from app/lib/api.ts. It adds auth and retries." },
        ],
        patterns: [
          { group: ["lodash", "lodash/*"], message: "lodash isn't a dependency here. Use the standard library (Array methods, Object.groupBy, structuredClone)." },
        ],
      }],
      "no-restricted-syntax": ["error", {
        selector: "CallExpression[callee.name='fetch']",
        message: "Use the `api` client from app/lib/api.ts instead of calling fetch directly.",
      }],
    },
  },
];
```

What the agent sees:

```
1:1   error  'axios' import is restricted from being used. Use the `api` client from app/lib/api.ts. It adds auth and retries
7:10  error  Use the `api` client from app/lib/api.ts instead of calling fetch directly
```

A later config block that sets the same rule for some of the same files replaces these options for those files instead of adding to them. So keep each restricted rule in one block, or repeat the full list in the later block.

The exception goes on the line, with a reason after `--`:

```js
// eslint-disable-next-line no-restricted-syntax -- the health check must bypass the api client's retries
await fetch("/health");
```

## A script for what no linter sees

When the pattern is easy to grep for but no lint rule covers it, a short script is enough. This one also shows the allowlist for a pattern that is already common: files on the list may still have it, any other file fails, and the list only shrinks.

```bash
#!/usr/bin/env bash
# scripts/check-no-println.sh: library crates log through `tracing`; only the CLI prints to stdout.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
allow=scripts/no-println.allow   # files that still print; shrink this list, never grow it
found=$(git grep -l -E '\b(e?print(ln)?)!' -- crates ':!crates/cli' | sort -u || true)
new=$(comm -23 <(printf '%s\n' "$found" | sed '/^$/d') <(sort -u "$allow"))
if [ -n "$new" ]; then
  printf 'println! in a library crate. Log with tracing::info! (or debug!, warn!) instead:\n%s\n' "$new" >&2
  exit 1
fi
```

`git grep` reads tracked files, so a new file counts once it's added to git, which it is by the time CI runs. Run the script from the same place as the project's other checks (a `justfile`, a `package.json` script, or the CI workflow) so it runs locally and in CI the same way.

## Claude Code hooks

Checked against the hooks reference at code.claude.com/docs/en/hooks (October 2026), and each script was run with sample input.

A hook script gets the event as JSON on stdin. Exit code 2 blocks the action, and stderr goes to the agent as the reason, so stderr is where the instruction goes. Any other non-zero exit is reported as a hook error, and the action goes ahead.

Register the scripts in the project's `.claude/settings.json`. With `args` present the command runs directly instead of through a shell (exec form), which the docs recommend for paths built from `${CLAUDE_PROJECT_DIR}`:

```json
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "Edit|Write", "hooks": [{ "type": "command", "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/no-generated.sh", "args": [] }] },
      { "matcher": "Bash", "hooks": [{ "type": "command", "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/use-pnpm.sh", "args": [] }] }
    ],
    "Stop": [
      { "hooks": [{ "type": "command", "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/fmt-before-stop.sh", "args": [] }] }
    ]
  }
}
```

Make each script executable (`chmod +x`) and commit it with the settings.

### Block edits to generated files

```bash
#!/usr/bin/env bash
# .claude/hooks/no-generated.sh. PreToolUse on Edit|Write: src/generated/ is build output.
path=$(jq -r '.tool_input.file_path // empty')
case "$path" in
  */src/generated/*)
    echo "src/generated/ is written by 'cargo run -p codegen'. Change the generator in crates/codegen and rerun it." >&2
    exit 2 ;;
esac
```

`Edit` and `Write` both pass the target as `tool_input.file_path`, always as an absolute path.

### Redirect the wrong command

```bash
#!/usr/bin/env bash
# .claude/hooks/use-pnpm.sh. PreToolUse on Bash: this repo uses pnpm, and npm writes a second lockfile.
cmd=$(jq -r '.tool_input.command // empty')
if printf '%s\n' "$cmd" | grep -Eq '(^|[;&|[:space:]])(npm|npx)[[:space:]]'; then
  echo "This repo uses pnpm. Run the same command with pnpm (or pnpm dlx instead of npx)." >&2
  exit 2
fi
```

Tested: blocks `npm install zod` and `cd web && npx vite build`, and lets `pnpm install zod` and `grep -r npmrc .` through.

### Don't finish with a step skipped

```bash
#!/usr/bin/env bash
# .claude/hooks/fmt-before-stop.sh. Stop: don't finish with unformatted Rust. On the second try
# the agent may stop, so a formatting problem it can't fix doesn't trap it in a loop.
input=$(cat)
[ "$(jq -r '.stop_hook_active' <<<"$input")" = "true" ] && exit 0
cd "$(jq -r '.cwd' <<<"$input")" || exit 0
if ! cargo fmt --check >/dev/null 2>&1; then
  echo "cargo fmt --check fails. Run cargo fmt, then rerun the checks before finishing." >&2
  exit 2
fi
```

`stop_hook_active` is `true` when the agent is already continuing because of a stop hook. Claude Code also ends the turn after eight stop-hook continuations in a row. The script reads `cwd` from the input instead of using `CLAUDE_PROJECT_DIR`, because `CLAUDE_PROJECT_DIR` stays at the main checkout when the agent works in a worktree.

A Stop hook runs at the end of every turn, so keep it to checks that take a second or two. Leave slow suites to the agent's own checks and to CI.
