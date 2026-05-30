# Contributing to ux-guard

Thanks for considering a contribution! `ux-guard` is an early-stage project and
the most valuable contributions right now are **real-world false positives**
and **new rules** for things AI agents commonly forget.

## Quick wins (great first contributions)

- **Report a false positive** — open an issue with the smallest reproducible
  `.tsx` snippet that ux-guard flags incorrectly. We treat these as bugs.
- **Suggest a new rule** — open an issue with a concrete example of a UX gap
  that's easy to miss. Bonus points for showing how Vue / Svelte handle it.
- **Improve `aiFixHint` wording** — small word changes that help AI agents
  write better fixes are huge.

## Getting set up

```bash
git clone https://github.com/x1n-Q/ux-guard.git
cd ux-guard
npm install
npm run build
npm test
```

Should see all 45 tests pass.

## Project layout

```
packages/
  core/    # Scanner, 6 rules, 3 reporters, route-context. Most logic lives here.
  react/   # JSX/AST helpers (currently small; grows as we add Vue/Svelte adapters).
  cli/     # `ux-guard` CLI — commander + scan/report/init commands.
  mcp/     # MCP server (Model Context Protocol stdio).
examples/
  react-sample/       # Bad + good components, used in README and tests.
  next-app-router/    # Demonstrates route-level loading.tsx / error.tsx awareness.
docs/                 # rules, AI usage, config, App Router, GitHub Action.
```

## Writing a new rule

1. Add a new file at `packages/core/src/rules/<your-rule>.ts`.
2. Export a `Rule` object: `{ id, defaultSeverity, description, check }`.
3. Register it in `packages/core/src/rules/index.ts` (both `ALL_RULES` and
   `CONFIG_KEY_TO_RULE_ID`).
4. Add at least 2 tests at `packages/core/test/<your-rule>.test.ts`:
   one positive ("should flag") and one negative ("should not flag").
5. Add a row in [`docs/rules.md`](./docs/rules.md).

### Rule design principles

- **Low false positives > high recall.** If you have to choose, err on the
  side of staying silent. Linters that cry wolf get disabled.
- **Use `ctx.cleanText` for keyword heuristics** (it has comments and string
  literals stripped — see `text-utils.ts`).
- **Use `ts-morph` AST** for structural checks (the empty-state and form
  rules are good references).
- **Gate React rules** with `looksLikeReactComponent(ctx.cleanText)` so they
  don't fire on plain Node / library code.
- **Respect `ctx.route`** for App-Router-aware suppression.
- **Always include `aiFixHint`** — assume an AI agent will be reading it.

## Running ux-guard locally during development

```bash
node packages/cli/dist/index.js scan ./examples/react-sample
node packages/cli/dist/index.js scan ./examples/next-app-router
```

## MCP server locally

```bash
npm run build
node packages/mcp/test-smoke.js   # end-to-end smoke test
```

## Pull requests

- Open a draft PR early if you want feedback.
- Run `npm test` and `npm run build` before pushing.
- Keep PRs small. One rule per PR is ideal.

## License

By contributing, you agree that your contributions will be licensed under the
project's [MIT License](./LICENSE).
