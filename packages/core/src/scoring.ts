import type { UxIssue } from "./types";

const WEIGHT: Record<UxIssue["severity"], number> = {
  error: 15,
  warn: 8,
  info: 3,
};

/**
 * Compute a 0..100 score. Start at 100, subtract weights per issue, floor at 0.
 * If there are zero scannable files, return 100 (nothing to complain about).
 */
export function computeScore(issues: UxIssue[]): number {
  let score = 100;
  for (const i of issues) {
    score -= WEIGHT[i.severity] ?? 0;
  }
  return Math.max(0, Math.min(100, score));
}
