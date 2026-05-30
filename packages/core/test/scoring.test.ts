import { describe, it, expect } from "vitest";
import { computeScore } from "../src/scoring";
import type { UxIssue } from "../src/types";

const issue = (severity: UxIssue["severity"]): UxIssue => ({
  type: "x",
  file: "f",
  severity,
  message: "m",
  suggestion: "s",
});

describe("scoring", () => {
  it("returns 100 for zero issues", () => {
    expect(computeScore([])).toBe(100);
  });

  it("subtracts 15 per error, 8 per warn, 3 per info", () => {
    expect(computeScore([issue("error")])).toBe(85);
    expect(computeScore([issue("warn")])).toBe(92);
    expect(computeScore([issue("info")])).toBe(97);
    expect(computeScore([issue("error"), issue("warn"), issue("info")])).toBe(
      100 - 15 - 8 - 3,
    );
  });

  it("never goes below zero", () => {
    const many: UxIssue[] = Array.from({ length: 20 }, () => issue("error"));
    expect(computeScore(many)).toBe(0);
  });
});
