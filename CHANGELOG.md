# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-05-30

Initial public release. 🎉

### Added

- **CLI** (`uxaudit`)
  - `uxaudit scan <path>` — terminal report with 0–100 score
  - `uxaudit scan <path> --json` — machine-readable output
  - `uxaudit scan <path> --json --for-agent` — AI-agent task payload with `aiFixHint` per issue
  - `uxaudit scan <path> --fail-on <severity>` — CI-friendly exit codes
  - `uxaudit report <path> --markdown` — PR-comment-ready report
  - `uxaudit init [--js] [--force]` — write `uxaudit.config.{ts,js}`
- **Core rules** (6)
  - `missing_loading_state` (warn)
  - `missing_empty_state` (warn)
  - `missing_error_state` (error)
  - `missing_form_validation` (error)
  - `missing_disabled_submit` (warn)
  - `missing_success_feedback` (warn)
- **Reporters** — terminal (colorized), JSON, markdown
- **Config file** — `uxaudit.config.{js,json}` with per-rule severity overrides
- **Next.js App Router awareness** — automatically suppresses `missing_loading_state` /
  `missing_error_state` when a sibling or ancestor `loading.tsx` / `error.tsx` exists
- **MCP server** (`@x1n-q/uxaudit-mcp`) — exposes 4 tools (`uxaudit_scan`, `uxaudit_scan_json`,
  `uxaudit_report`, `uxaudit_list_rules`) over stdio for AI coding agents
- **GitHub Action** (`x1n-Q/uxaudit@v0.1.0`) — composite action with sticky PR comments,
  configurable `fail-on` severity, and report artifact upload
- **Test suite** — 45 vitest tests across 10 files
- **Example apps** — `examples/react-sample` and `examples/next-app-router`
- **Docs** — rules, AI usage, config, App Router awareness, GitHub Action

### Package map

| npm package              | Folder            |
| ------------------------ | ----------------- |
| `uxaudit`                 | `packages/cli`    |
| `@x1n-q/uxaudit-core`     | `packages/core`   |
| `@x1n-q/uxaudit-react`    | `packages/react`  |
| `@x1n-q/uxaudit-mcp`      | `packages/mcp`    |
