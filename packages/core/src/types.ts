import type { SourceFile } from "ts-morph";

export type Severity = "info" | "warn" | "error";

export type UxIssue = {
  /** Rule id, e.g. "missing_empty_state" */
  type: string;
  /** Absolute or workspace-relative file path */
  file: string;
  /** 1-based line number when known */
  line?: number;
  /** 1-based column when known */
  column?: number;
  severity: Severity;
  message: string;
  suggestion: string;
  /** Extra hint for AI coding agents to write a fix */
  aiFixHint?: string;
};

import type { RouteContext } from "./route-context";

export type RuleContext = {
  /** Resolved file path relative to cwd */
  relativePath: string;
  /** The full file content (cached) */
  text: string;
  /** File content with comments and string literals stripped — use for keyword heuristics */
  cleanText: string;
  /**
   * Next.js App Router context. Always present; for non-Next.js / non-app/
   * files it has `isAppRouter: false` and all flags false.
   */
  route: RouteContext;
};

export type Rule = {
  /** Stable rule id */
  id: string;
  /** Default severity (config can override) */
  defaultSeverity: Severity;
  /** Short human description */
  description: string;
  /** Returns 0..N issues for the file */
  check: (sf: SourceFile, ctx: RuleContext) => UxIssue[];
};

export type RuleSetting = "off" | "info" | "warn" | "error";

export type UxLintConfig = {
  framework: "react" | "nextjs";
  include: string[];
  exclude: string[];
  rules: Record<string, RuleSetting>;
};

export type ScanResult = {
  score: number;
  framework: UxLintConfig["framework"];
  filesScanned: number;
  issues: UxIssue[];
  /** Per-file roll-up for quick rendering */
  byFile: Record<string, UxIssue[]>;
};
