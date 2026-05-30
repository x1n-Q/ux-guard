# uxlint

> **ESLint catches bad code. uxlint catches unfinished UX.**

[![npm version](https://img.shields.io/npm/v/uxlint.svg)](https://www.npmjs.com/package/uxlint)
[![CI](https://github.com/x1n-Q/uxlint/actions/workflows/test.yml/badge.svg)](https://github.com/x1n-Q/uxlint/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](./LICENSE)
[![Made for AI agents](https://img.shields.io/badge/Made%20for-AI%20agents-8A2BE2.svg)](./docs/ai-usage.md)

`uxlint` scans your React / Next.js code for the UI states humans and AI agents often forget:

- 🔄 **Loading** states
- 📭 **Empty** states
- ⚠️ **Error** states
- ✅ **Form validation**
- 🚫 **Disabled-while-submitting** buttons
- 🎉 **Success feedback** (toast / redirect / message)

It's the missing-state checker for modern web apps — built for **humans** *and* for **AI coding agents**.

---

## Why this exists

AI-generated UIs look complete. Then a user hits an empty list, a slow network, or a failed form submit — and the app falls apart.

`uxlint` is the linter for that gap. Run it before you ship; let your AI agent run it before it claims a feature is "done."

> **The missing-state checker for modern web apps.**

---

## Install / use

```bash
# One-off run
npx uxlint scan ./src

# Or install per-project
npm install -D uxlint
npx uxlint scan ./src
```

## Quick start

```bash
# Human-friendly terminal output
npx uxlint scan ./src

# Machine-readable JSON
npx uxlint scan ./src --json

# AI-agent mode: structured task with fix hints for each issue
npx uxlint scan ./src --json --for-agent

# Markdown report (great for PR comments)
npx uxlint report ./src --markdown

# Create a config file
npx uxlint init

# Fail CI when error-severity issues are found
npx uxlint scan ./src --fail-on error
```

Sample output:

```
uxlint  •  UX completeness scan

  Score    62/100   ████████████░░░░░░░░
  Framework: react    Files scanned: 23    Issues: 4

  src/app/checkout/page.tsx
    ✗ error  missing_error_state
        Async operation found with no error handling or error UI detected.
        → Render an error fallback when requests fail …
    ✗ warn  missing_empty_state:42
        List rendering (`items.map`) found without an empty fallback.
        → Add a fallback when the array is empty …
```

---

## Use with AI agents (MCP)

`uxlint` ships an [MCP server](https://modelcontextprotocol.io) so AI coding agents (Claude Desktop, Cursor, Blackbox Code, etc.) can call it as a native tool — **before** they declare a feature done.

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "uxlint": {
      "command": "npx",
      "args": ["-y", "@x1n-q/uxlint-mcp"]
    }
  }
}
```

Tools exposed:

| Tool                | Returns                                                       |
| ------------------- | ------------------------------------------------------------- |
| `uxlint_scan`       | Human-readable summary with score + per-issue fix hints       |
| `uxlint_scan_json`  | Raw agent-task JSON (`task`, `instruction`, `issues[]`)       |
| `uxlint_report`     | Markdown report (perfect for the agent to paste in a PR)      |
| `uxlint_list_rules` | All available rules with default severities                   |

See [`docs/ai-usage.md`](./docs/ai-usage.md).

---

## Next.js App Router awareness

`uxlint` understands route-level UX files. If your `app/dashboard/page.tsx` doesn't have a local `isLoading` check but `app/dashboard/loading.tsx` exists next to it, it **won't be flagged** — Next.js renders it for you.

```bash
npx uxlint scan ./examples/next-app-router
# → dashboard/page.tsx — silent (covered by loading.tsx + error.tsx)
# → settings/page.tsx  — flagged (no route-level files, no local handling)
```

See [`docs/next-app-router.md`](./docs/next-app-router.md).

---

## GitHub Action

Drop into any PR workflow:

```yaml
# .github/workflows/uxlint.yml
name: UX Lint
on:
  pull_request:

jobs:
  uxlint:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write   # for sticky PR comments
    steps:
      - uses: actions/checkout@v4
      - uses: x1n-Q/uxlint@v0.1.0
        with:
          path: ./src
          fail-on: error
          comment: "true"
```

You get:
- ✅ A CI status check that fails on `error`-severity UX issues
- 💬 A **sticky** PR comment with the markdown report (updates in-place, never spams)
- 📦 An artifact (`uxlint-report.json` + `uxlint-report.md`)

Full reference: [`docs/github-action.md`](./docs/github-action.md).

---

## Rules

| Config key         | Default | What it checks                                                                 |
| ------------------ | ------- | ------------------------------------------------------------------------------ |
| `loadingState`     | `warn`  | Async fetch with no loading UI / spinner / skeleton                            |
| `emptyState`       | `warn`  | `.map()` in JSX with no `length === 0` guard or `<EmptyState />`               |
| `errorState`       | `error` | Async logic with no `catch`, no `error` state, no error UI                     |
| `formValidation`   | `error` | `<form>` + `<input>` + submit, no validation props (`aria-invalid`, errors)    |
| `disabledSubmit`   | `warn`  | `<button type="submit">` with no `disabled` prop                               |
| `successFeedback`  | `warn`  | `handleSubmit` / `handleSave` etc. with no toast / redirect / success message  |

Full details and severity weighting: [`docs/rules.md`](./docs/rules.md).

Disable a rule:

```js
// uxlint.config.js
module.exports = {
  rules: {
    successFeedback: "off",
    emptyState: "info",
  },
};
```

---

## Packages

Monorepo:

| npm package              | Folder              | Purpose                                      |
| ------------------------ | ------------------- | -------------------------------------------- |
| **`uxlint`**             | `packages/cli`      | The CLI you run with `npx uxlint`            |
| `@x1n-q/uxlint-core`     | `packages/core`     | Scanner, rules engine, reporters             |
| `@x1n-q/uxlint-react`    | `packages/react`    | React/JSX-specific AST helpers               |
| `@x1n-q/uxlint-mcp`      | `packages/mcp`      | MCP server for AI agents                     |

---

## Development

```bash
git clone https://github.com/x1n-Q/uxlint.git
cd uxlint
npm install
npm run build          # build all 4 packages
npm test               # vitest unit tests (45 tests)
npm run test:example   # scan the bundled example app
npm run test:agent     # AI-agent JSON output
npm run test:report    # markdown report
```

### Testing strategy

| File                              | Tests | Covers                                                  |
| --------------------------------- | ----- | ------------------------------------------------------- |
| `loading-state.test.ts`           | 4     | flags fetch w/o loading; ignores guarded                |
| `empty-state.test.ts`             | 4     | flags `.map()` in JSX; respects length guards           |
| `error-state.test.ts`             | 3     | flags fetch w/o catch / error UI                        |
| `form-validation.test.ts`         | 3     | flags form+input+submit w/o errors                      |
| `disabled-submit.test.ts`         | 3     | flags `<button type="submit">` w/o `disabled`           |
| `success-feedback.test.ts`        | 4     | flags `handleSubmit` w/o toast                          |
| `app-router-rules.test.ts`        | 7     | Next.js route-level loading.tsx / error.tsx suppression |
| `route-context.test.ts`           | 7     | real-fs `buildRouteContext` cases + cache               |
| `scoring.test.ts`                 | 3     | weights, floor-at-0                                     |
| `text-utils.test.ts`              | 7     | comment / string stripping, React detection             |

---

## Contributing

PRs welcome — please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

The fastest contribution is **a real-world false positive**: open an issue with the smallest reproducible file we get wrong, and uxlint gets better for everyone.

---

## License

MIT © [Daniel Depaor (@x1n-Q)](https://github.com/x1n-Q)
