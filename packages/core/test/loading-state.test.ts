import { describe, it, expect } from "vitest";
import { loadingStateRule } from "../src/rules/loading-state";
import { runRule } from "./helpers";

describe("loading-state rule", () => {
  it("flags a React component that fetches without a loading UI", () => {
    const src = `
      import React, { useEffect, useState } from "react";
      export function X() {
        const [data, setData] = useState<any>(null);
        useEffect(() => { fetch("/api").then(r => r.json()).then(setData); }, []);
        return <div>{data?.name}</div>;
      }
    `;
    const issues = runRule(loadingStateRule, src, "X.tsx");
    expect(issues).toHaveLength(1);
    expect(issues[0].type).toBe("missing_loading_state");
  });

  it("does NOT flag a React component that uses isLoading", () => {
    const src = `
      import React, { useEffect, useState } from "react";
      export function X() {
        const [isLoading, setIsLoading] = useState(true);
        useEffect(() => { fetch("/api").then(() => setIsLoading(false)); }, []);
        if (isLoading) return <div>Loading…</div>;
        return <div>ok</div>;
      }
    `;
    const issues = runRule(loadingStateRule, src, "X.tsx");
    expect(issues).toHaveLength(0);
  });

  it("does NOT flag a non-React file even if it fetches", () => {
    const src = `
      export async function loadStuff() {
        const r = await fetch("/api");
        return r.json();
      }
    `;
    const issues = runRule(loadingStateRule, src, "util.ts");
    expect(issues).toHaveLength(0);
  });

  it("does NOT trigger on the word 'loading' inside a comment", () => {
    // The comment says "no loading UI"; cleanText should strip it,
    // so the rule should still fire (because the file is React + fetches).
    const src = `
      // no loading UI here, deliberately
      import React from "react";
      export function X() {
        fetch("/api").then(() => {});
        return <div />;
      }
    `;
    const issues = runRule(loadingStateRule, src, "X.tsx");
    expect(issues).toHaveLength(1);
  });
});
