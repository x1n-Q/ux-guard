# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-05-30

### Changed

- Shortened the GitHub Action metadata description so the action can be published to GitHub Marketplace.
- Pinned the action's default npm package version to `0.1.0` for reproducible CI runs.
- Renamed the dogfood workflow and GitHub Action docs from `uxlint` to `ux-guard`.

### Fixed

- Updated the dogfood workflow to scan the covered dashboard route instead of the intentionally incomplete settings route.

## [0.1.0] - 2026-05-30

Initial public release. 🎉

### Added

- **CLI** (`ux-guard`)
  - `ux-guard scan <path>` — terminal report with 0–100 score
  - `ux-guard scan <path> --json` — machine-readable output
  - `ux-guard scan <path> --json --for-agent` — AI-agent task payload with `aiFixHint` per issue
  - `ux-guard scan <path> --fail-on <severity>` — CI-friendly exit codes
  - `ux-guard report <path> --markdown` — PR-comment-ready report
  - `ux-guard init [--js] [--force]` — write `ux-guard.config.{ts,js}`
- **Core rules** (6)
  - `missing_loading_state` (warn)
  - `missing_empty_state` (warn)
  - `missing_error_state` (error)
  - `missing_form_validation` (error)
  - `missing_disabled_submit` (warn)
  - `missing_success_feedback` (warn)
- **Reporters** — terminal (colorized), JSON, markdown
- **Config file** — `ux-guard.config.{js,json}` with per-rule severity overrides
- **Next.js App Router awareness** — automatically suppresses `missing_loading_state` /
  `missing_error_state` when a sibling or ancestor `loading.tsx` / `error.tsx` exists
- **MCP server** (`@x1n-q/ux-guard-mcp`) — exposes 4 tools (`ux-guard_scan`, `ux-guard_scan_json`,
  `ux-guard_report`, `ux-guard_list_rules`) over stdio for AI coding agents
- **GitHub Action** (`x1n-Q/ux-guard@v0.1.0`) — composite action with sticky PR comments,
  configurable `fail-on` severity, and report artifact upload
- **Test suite** — 45 vitest tests across 10 files
- **Example apps** — `examples/react-sample` and `examples/next-app-router`
- **Docs** — rules, AI usage, config, App Router awareness, GitHub Action

### Package map

| npm package              | Folder            |
| ------------------------ | ----------------- |
| `ux-guard`                 | `packages/cli`    |
| `@x1n-q/ux-guard-core`     | `packages/core`   |
| `@x1n-q/ux-guard-react`    | `packages/react`  |
| `@x1n-q/ux-guard-mcp`      | `packages/mcp`    |
