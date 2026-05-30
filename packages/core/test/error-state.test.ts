import { describe, it, expect } from "vitest";
import { errorStateRule } from "../src/rules/error-state";
import { runRule } from "./helpers";

describe("error-state rule", () => {
  it("flags a React component that fetches without error handling", () => {
    const src = `
      import React, { useEffect, useState } from "react";
      export function X() {
        const [data, setData] = useState<any>(null);
        useEffect(() => { fetch("/api").then(r => r.json()).then(setData); }, []);
        return <div>{data?.x}</div>;
      }
    `;
    const issues = runRule(errorStateRule, src, "X.tsx");
    expect(issues).toHaveLength(1);
    expect(issues[0].type).toBe("missing_error_state");
    expect(issues[0].severity).toBe("error");
  });

  it("does NOT flag when error state is handled", () => {
    const src = `
      import React, { useState } from "react";
      export function X() {
        const [error, setError] = useState<string | null>(null);
        const load = async () => {
          try { await fetch("/api"); } catch (e) { setError("oops"); }
        };
        if (error) return <div role="alert">{error}</div>;
        return <button onClick={load}>Go</button>;
      }
    `;
    const issues = runRule(errorStateRule, src, "X.tsx");
    expect(issues).toHaveLength(0);
  });

  it("does NOT flag non-React modules", () => {
    const src = `
      export async function f() { return (await fetch("/x")).json(); }
    `;
    const issues = runRule(errorStateRule, src, "f.ts");
    expect(issues).toHaveLength(0);
  });
});
