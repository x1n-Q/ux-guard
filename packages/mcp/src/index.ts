#!/usr/bin/env node
/**
 * uxaudit MCP server
 * -----------------
 * Exposes uxaudit as a Model Context Protocol (MCP) server so AI coding agents
 * (Claude Desktop, Cursor, Blackbox Code, etc.) can call it directly as a tool
 * before declaring a UI feature "done".
 *
 * Tools provided:
 *   - uxaudit_scan        : scan a path, return human-readable summary + issues
 *   - uxaudit_scan_json   : scan a path, return raw machine-readable JSON
 *   - uxaudit_report      : scan a path, return a markdown report
 *   - uxaudit_list_rules  : list all available rules and their default severities
 *
 * Transport: stdio (the standard for editor/desktop MCP clients).
 *
 * Install in Claude Desktop (~/Library/Application Support/Claude/claude_desktop_config.json):
 * {
 *   "mcpServers": {
 *     "uxaudit": { "command": "npx", "args": ["-y", "uxaudit-mcp"] }
 *   }
 * }
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import * as path from "path";
import {
  scan,
  loadConfig,
  renderAgentJson,
  renderMarkdown,
  ALL_RULES,
  type ScanResult,
} from "uxaudit-core";

// ---------- Tool input schemas ----------

const ScanInput = z.object({
  path: z
    .string()
    .describe(
      "File or directory to scan, relative to cwd or absolute. Example: './src' or './src/app/checkout'.",
    ),
  cwd: z
    .string()
    .optional()
    .describe(
      "Optional working directory to resolve relative paths and to look for uxaudit.config.* in. Defaults to process.cwd().",
    ),
});

type ScanInputT = z.infer<typeof ScanInput>;

// ---------- Helpers ----------

function summarize(result: ScanResult): string {
  const errors = result.issues.filter((i) => i.severity === "error").length;
  const warns = result.issues.filter((i) => i.severity === "warn").length;
  const infos = result.issues.filter((i) => i.severity === "info").length;
  const lines: string[] = [];
  lines.push(
    `uxaudit score: ${result.score}/100   (${result.filesScanned} files, ${result.issues.length} issues: ${errors} error, ${warns} warn, ${infos} info)`,
  );
  if (result.issues.length === 0) {
    lines.push("");
    lines.push("✅ No UX completeness issues found.");
    return lines.join("\n");
  }
  lines.push("");
  lines.push("Issues (fix `error` first, then `warn`):");
  for (const i of result.issues.slice(0, 50)) {
    const loc = i.line ? `:${i.line}` : "";
    lines.push(
      `  [${i.severity}] ${i.file}${loc}  — ${i.type}: ${i.message}`,
    );
    if (i.aiFixHint) lines.push(`    fix: ${i.aiFixHint}`);
  }
  if (result.issues.length > 50) {
    lines.push(
      `  …and ${result.issues.length - 50} more. Call uxaudit_scan_json for the full list.`,
    );
  }
  return lines.join("\n");
}

async function runScan(input: ScanInputT): Promise<ScanResult> {
  const cwd = input.cwd ? path.resolve(input.cwd) : process.cwd();
  const config = loadConfig(cwd);
  return scan({ cwd, target: input.path, config });
}

// ---------- Server ----------

const server = new Server(
  {
    name: "uxaudit",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "uxaudit_scan",
        description:
          "Scan a React/Next.js path for missing UX states (loading, empty, error, validation, disabled submit, success feedback). Returns a human-readable summary with a 0–100 completeness score and per-issue fix hints. Call this BEFORE declaring a UI feature 'done'.",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description:
                "File or directory to scan (relative or absolute). E.g. './src/app/checkout'.",
            },
            cwd: {
              type: "string",
              description:
                "Optional working directory. Defaults to current process cwd.",
            },
          },
          required: ["path"],
        },
      },
      {
        name: "uxaudit_scan_json",
        description:
          "Same as uxaudit_scan but returns raw machine-readable JSON wrapped as an AI-agent task (with `task`, `instruction`, `summary`, `issues[]` including `aiFixHint`). Use this when you want to programmatically iterate over issues to fix them.",
        inputSchema: {
          type: "object",
          properties: {
            path: { type: "string" },
            cwd: { type: "string" },
          },
          required: ["path"],
        },
      },
      {
        name: "uxaudit_report",
        description:
          "Generate a markdown UX completeness report for the given path. Great for PR comments or sharing with humans.",
        inputSchema: {
          type: "object",
          properties: {
            path: { type: "string" },
            cwd: { type: "string" },
          },
          required: ["path"],
        },
      },
      {
        name: "uxaudit_list_rules",
        description:
          "List all available uxaudit rules with their default severities and descriptions.",
        inputSchema: { type: "object", properties: {} },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const name = req.params.name;
  const args = (req.params.arguments ?? {}) as Record<string, unknown>;

  try {
    if (name === "uxaudit_scan") {
      const input = ScanInput.parse(args);
      const result = await runScan(input);
      return {
        content: [{ type: "text", text: summarize(result) }],
      };
    }

    if (name === "uxaudit_scan_json") {
      const input = ScanInput.parse(args);
      const result = await runScan(input);
      return {
        content: [{ type: "text", text: renderAgentJson(result) }],
      };
    }

    if (name === "uxaudit_report") {
      const input = ScanInput.parse(args);
      const result = await runScan(input);
      return {
        content: [{ type: "text", text: renderMarkdown(result) }],
      };
    }

    if (name === "uxaudit_list_rules") {
      const rows = ALL_RULES.map(
        (r) => `- ${r.id} (${r.defaultSeverity}): ${r.description}`,
      ).join("\n");
      return {
        content: [
          {
            type: "text",
            text: `uxaudit rules:\n\n${rows}\n\nConfigure in uxaudit.config.{js,json} under the "rules" key.`,
          },
        ],
      };
    }

    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text", text: `uxaudit error: ${msg}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Log to stderr so it doesn't interfere with stdio transport on stdout.
  process.stderr.write("uxaudit MCP server running on stdio.\n");
}

main().catch((err) => {
  process.stderr.write(`uxaudit-mcp fatal: ${err?.stack || err}\n`);
  process.exit(1);
});
