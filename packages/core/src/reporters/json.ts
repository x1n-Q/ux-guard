import type { ScanResult } from "../types";

export type AgentPayload = {
  task: "ux_completeness_scan";
  instruction: string;
  score: number;
  framework: ScanResult["framework"];
  filesScanned: number;
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
  issues: ScanResult["issues"];
};

export function renderJson(result: ScanResult): string {
  return JSON.stringify(
    {
      score: result.score,
      framework: result.framework,
      filesScanned: result.filesScanned,
      issueCount: result.issues.length,
      issues: result.issues,
    },
    null,
    2,
  );
}

export function renderAgentJson(result: ScanResult): string {
  const summary = {
    errors: result.issues.filter((i) => i.severity === "error").length,
    warnings: result.issues.filter((i) => i.severity === "warn").length,
    info: result.issues.filter((i) => i.severity === "info").length,
  };
  const payload: AgentPayload = {
    task: "ux_completeness_scan",
    instruction:
      "Fix issues with severity 'error' first, then 'warn'. For each issue, follow the aiFixHint and prefer existing components/utilities already present in the project. Do not introduce new UI libraries unless none exist. After fixing, re-run uxlint to confirm the score improved.",
    score: result.score,
    framework: result.framework,
    filesScanned: result.filesScanned,
    summary,
    issues: result.issues,
  };
  return JSON.stringify(payload, null, 2);
}
