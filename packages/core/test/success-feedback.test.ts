import { describe, it, expect } from "vitest";
import { successFeedbackRule } from "../src/rules/success-feedback";
import { runRule } from "./helpers";

describe("success-feedback rule", () => {
  it("flags a handleSubmit in a React component with no feedback", () => {
    const src = `
      import React from "react";
      export function F() {
        async function handleSubmit(e: any) {
          e.preventDefault();
          await fetch("/api/signup", { method: "POST" });
        }
        return <form onSubmit={handleSubmit}><button type="submit">Go</button></form>;
      }
    `;
    const issues = runRule(successFeedbackRule, src, "F.tsx");
    expect(issues).toHaveLength(1);
    expect(issues[0].type).toBe("missing_success_feedback");
  });

  it("does NOT flag when toast.success is called", () => {
    const src = `
      import React from "react";
      import { toast } from "sonner";
      export function F() {
        async function handleSubmit(e: any) {
          e.preventDefault();
          await fetch("/api/signup", { method: "POST" });
          toast.success("Signed up!");
        }
        return <form onSubmit={handleSubmit}><button type="submit">Go</button></form>;
      }
    `;
    const issues = runRule(successFeedbackRule, src, "F.tsx");
    expect(issues).toHaveLength(0);
  });

  it("does NOT flag plain TS modules with createX/updateX (not user actions)", () => {
    const src = `
      export function createUpdater() {
        return { update: () => {}, save: () => {} };
      }
    `;
    const issues = runRule(successFeedbackRule, src, "lib.ts");
    expect(issues).toHaveLength(0);
  });

  it("does NOT flag factory-like createX in non-React files even with React-y names", () => {
    const src = `
      // A 2D game module
      export function createBreakout() {
        const update = () => {};
        return { update };
      }
    `;
    const issues = runRule(successFeedbackRule, src, "Breakout.ts");
    expect(issues).toHaveLength(0);
  });
});
