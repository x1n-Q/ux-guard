# GitHub Action

Run uxlint in CI on every pull request. Optionally post a markdown report
as a PR comment.

## Quick start

Create `.github/workflows/uxlint.yml` in your repo:

```yaml
name: UX Lint
on:
  pull_request:
  push:
    branches: [main]

jobs:
  uxlint:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write   # required for PR comments
    steps:
      - uses: actions/checkout@v4
      - uses: x1n-Q/uxlint@v1      # 👈 replace with the published action
        with:
          path: ./src
          fail-on: error
          comment: "true"
```

That's it. On every PR you'll get:

1. A **status check** that fails if any `error`-severity UX issues are found.
2. A **sticky PR comment** with the full markdown report (the action updates
   the same comment on subsequent runs instead of spamming new ones).
3. An **artifact** called `uxlint-report` containing both `uxlint-report.json`
   and `uxlint-report.md`.

## Inputs

| Input               | Default       | Description                                                                 |
| ------------------- | ------------- | --------------------------------------------------------------------------- |
| `path`              | `./src`       | File or directory to scan, relative to the repo root.                       |
| `fail-on`           | `error`       | Fail the job if issues at this severity or above exist. `off`/`info`/`warn`/`error`. |
| `comment`           | `true`        | Post (or update) a sticky PR comment with the markdown report.              |
| `version`           | `latest`      | uxlint npm version. Pin like `0.1.0` for reproducibility.                   |
| `working-directory` | `.`           | Subdirectory to run uxlint in (e.g. for monorepos).                         |

## Outputs

| Output        | Description                              |
| ------------- | ---------------------------------------- |
| `score`       | uxlint score, 0–100.                     |
| `issue-count` | Total number of issues.                  |
| `errors`      | Count of error-severity issues.          |
| `warnings`    | Count of warn-severity issues.           |

Example using outputs:

```yaml
- id: ux
  uses: x1n-Q/uxlint@v1
  with: { path: ./src, fail-on: off }
- run: echo "UX score is ${{ steps.ux.outputs.score }}/100"
```

## How the comment is updated

The action looks for an existing comment containing the hidden marker
`<!-- uxlint-report -->` and **updates it in place** if found. Otherwise it
creates a new one. You'll never get a thread of stale uxlint comments.

## Monorepos

Set `working-directory` to the package you want to scan:

```yaml
- uses: x1n-Q/uxlint@v1
  with:
    working-directory: apps/web
    path: ./src
```

## Pinning a version

Use a major-version tag (recommended): `x1n-Q/uxlint@v1`

Or a specific commit: `x1n-Q/uxlint@<sha>`

## Local equivalent

The action is a thin wrapper. Anything it does, you can do locally:

```bash
npx uxlint scan ./src --json > uxlint-report.json
npx uxlint report ./src --markdown > uxlint-report.md
npx uxlint scan ./src --fail-on error    # mirrors the fail-on input
```
