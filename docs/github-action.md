# GitHub Action

Run ux-guard in CI on every pull request. Optionally post a markdown report
as a PR comment.

## Quick start

Create `.github/workflows/ux-guard.yml` in your repo:

```yaml
name: UX Guard
on:
  pull_request:
  push:
    branches: [main]

jobs:
  ux-guard:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write   # required for PR comments
    steps:
      - uses: actions/checkout@v4
      - uses: x1n-Q/ux-guard@v0.1.1
        with:
          path: ./src
          fail-on: error
          comment: "true"
```

That's it. On every PR you'll get:

1. A **status check** that fails if any `error`-severity UX issues are found.
2. A **sticky PR comment** with the full markdown report. The action updates
   the same comment on subsequent runs instead of spamming new ones.
3. An **artifact** called `ux-guard-report` containing both
   `ux-guard-report.json` and `ux-guard-report.md`.

## Inputs

| Input               | Default | Description                                                                 |
| ------------------- | ------- | --------------------------------------------------------------------------- |
| `path`              | `./src` | File or directory to scan, relative to the repo root.                       |
| `fail-on`           | `error` | Fail the job if issues at this severity or above exist. `off`/`info`/`warn`/`error`. |
| `comment`           | `true`  | Post (or update) a sticky PR comment with the markdown report.              |
| `version`           | `0.1.0` | ux-guard npm version. Override only when you intentionally want another version. |
| `working-directory` | `.`     | Subdirectory to run ux-guard in, for example in monorepos.                  |

## Outputs

| Output        | Description                              |
| ------------- | ---------------------------------------- |
| `score`       | ux-guard score, 0-100.                   |
| `issue-count` | Total number of issues.                  |
| `errors`      | Count of error-severity issues.          |
| `warnings`    | Count of warn-severity issues.           |

Example using outputs:

```yaml
- id: ux
  uses: x1n-Q/ux-guard@v0.1.1
  with:
    path: ./src
    fail-on: off
- run: echo "UX score is ${{ steps.ux.outputs.score }}/100"
```

## How the comment is updated

The action looks for an existing comment containing the hidden marker
`<!-- ux-guard-report -->` and **updates it in place** if found. Otherwise it
creates a new one. You'll never get a thread of stale ux-guard comments.

## Monorepos

Set `working-directory` to the package you want to scan:

```yaml
- uses: x1n-Q/ux-guard@v0.1.1
  with:
    working-directory: apps/web
    path: ./src
```

## Pinning a version

Use the current release tag: `x1n-Q/ux-guard@v0.1.1`

Or a specific commit: `x1n-Q/ux-guard@<sha>`

The `version` input controls the npm package version that the action runs:

```yaml
- uses: x1n-Q/ux-guard@v0.1.1
  with:
    version: "0.1.0"
```

## Local equivalent

The action is a thin wrapper. Anything it does, you can do locally:

```bash
npx ux-guard scan ./src --json > ux-guard-report.json
npx ux-guard report ./src --markdown > ux-guard-report.md
npx ux-guard scan ./src --fail-on error
```
