import pc from "picocolors";
import type { ScanResult, Severity } from "../types";

const SEV_LABEL: Record<Severity, string> = {
  error: pc.red("error"),
  warn: pc.yellow("warn"),
  info: pc.cyan("info"),
};

function bar(score: number): string {
  const filled = Math.round(score / 5); // 20 segments
  const empty = 20 - filled;
  const color = score >= 80 ? pc.green : score >= 60 ? pc.yellow : pc.red;
  return color("█".repeat(filled)) + pc.gray("░".repeat(empty));
}

export function renderTerminal(result: ScanResult): string {
  const lines: string[] = [];

  lines.push("");
  lines.push(pc.bold(pc.cyan("ux-guard")) + pc.gray("  •  UX completeness scan"));
  lines.push("");
  lines.push(
    `  ${pc.bold("Score")}    ${pc.bold(String(result.score))}${pc.gray(
      "/100",
    )}   ${bar(result.score)}`,
  );
  lines.push(
    `  ${pc.gray("Framework")}: ${result.framework}    ${pc.gray("Files scanned")}: ${result.filesScanned}    ${pc.gray("Issues")}: ${result.issues.length}`,
  );
  lines.push("");

  if (result.issues.length === 0) {
    lines.push("  " + pc.green("✓ No UX completeness issues found. Ship it!"));
    lines.push("");
    return lines.join("\n");
  }

  const files = Object.keys(result.byFile).sort();
  for (const file of files) {
    const issues = result.byFile[file];
    lines.push("  " + pc.underline(pc.bold(file)));
    for (const i of issues) {
      const loc = i.line ? pc.gray(`:${i.line}`) : "";
      lines.push(
        `    ${pc.red("✗")} ${SEV_LABEL[i.severity]}  ${pc.bold(i.type)}${loc}`,
      );
      lines.push(`        ${i.message}`);
      lines.push(`        ${pc.gray("→ " + i.suggestion)}`);
    }
    lines.push("");
  }

  // Footer hint
  lines.push(
    pc.gray(
      "  Tip: run with --json --for-agent to get machine-readable output for AI coding agents.",
    ),
  );
  lines.push("");
  return lines.join("\n");
}
