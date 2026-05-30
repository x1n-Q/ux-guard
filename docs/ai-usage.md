# Using uxlint with AI coding agents

`uxlint` was designed from day one to be readable by AI coding agents
(Claude Code, Cursor, ChatGPT, Blackbox Code, etc.).

There are two ways to wire it in:

1. **MCP server** — the agent calls uxlint as a native tool ✨ (recommended)
2. **CLI + JSON** — the agent shells out to `uxlint` and parses the output

---

## 1. MCP server (recommended)

`@x1n-q/uxlint-mcp` exposes uxlint over the [Model Context Protocol](https://modelcontextprotocol.io).

### Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or
`%APPDATA%\Claude\claude_desktop_config.json` (Windows):

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

Restart Claude Desktop. You'll see 4 new tools available:

| Tool                | Purpose                                              |
| ------------------- | ---------------------------------------------------- |
| `uxlint_scan`       | Human summary + score + per-issue fix hints          |
| `uxlint_scan_json`  | Raw machine-readable agent task                      |
| `uxlint_report`     | Markdown report                                      |
| `uxlint_list_rules` | List all rules and their default severities          |

### Cursor / Continue / other MCP clients

Same idea — point the client at the `npx -y @x1n-q/uxlint-mcp` command via stdio.

---

## 2. CLI with `--for-agent`

If you don't have an MCP integration handy, the CLI emits the same structured payload:

```bash
npx uxlint scan ./src --json --for-agent
```

Output shape:

```json
{
  "task": "ux_completeness_scan",
  "instruction": "Fix issues with severity 'error' first, then 'warn'. ...",
  "score": 62,
  "framework": "react",
  "filesScanned": 23,
  "summary": { "errors": 2, "warnings": 4, "info": 0 },
  "issues": [
    {
      "type": "missing_empty_state",
      "file": "src/app/enrollment/page.tsx",
      "line": 42,
      "severity": "warn",
      "message": "List rendering (`programs.map`) found without an empty fallback.",
      "suggestion": "Add a fallback when programs.length === 0.",
      "aiFixHint": "Wrap the .map() in a conditional that renders an empty-state UI when the source array has zero items. Use the project's existing EmptyState component if one exists, otherwise render a friendly message like 'No items yet.'"
    }
  ]
}
```

The `aiFixHint` on every issue is written specifically for an AI agent — telling it *what* to do, in what order, and to prefer existing project components.

---

## Recommended agent workflow

1. Implement the requested UI feature.
2. **Before saying "done"**, call `uxlint_scan` (MCP) or
   `npx uxlint scan <feature-dir> --json --for-agent` (CLI).
3. For each issue in `issues[]`:
   - Read `aiFixHint`.
   - Prefer existing project components (search for similar imports first).
   - Apply the fix.
4. Re-run uxlint and confirm the score improved.

This loop is what makes AI-generated UIs *actually* feel finished.

---

## CI / GitHub Action

The agent's loop is great for development. For PR safety, also add the [GitHub Action](./github-action.md):

```yaml
- uses: x1n-Q/uxlint@v0.1.0
  with:
    path: ./src
    fail-on: error
```
