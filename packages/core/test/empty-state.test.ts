import { describe, it, expect } from "vitest";
import { emptyStateRule } from "../src/rules/empty-state";
import { runRule } from "./helpers";

describe("empty-state rule", () => {
  it("flags a .map() in JSX with no length guard", () => {
    const src = `
      import React from "react";
      export function L({ users }: { users: { id: string }[] }) {
        return <ul>{users.map(u => <li key={u.id}>{u.id}</li>)}</ul>;
      }
    `;
    const issues = runRule(emptyStateRule, src, "L.tsx");
    expect(issues).toHaveLength(1);
    expect(issues[0].type).toBe("missing_empty_state");
    expect(issues[0].line).toBeGreaterThan(0);
  });

  it("does NOT flag when an empty guard exists", () => {
    const src = `
      import React from "react";
      export function L({ users }: { users: { id: string }[] }) {
        if (users.length === 0) return <p>No users.</p>;
        return <ul>{users.map(u => <li key={u.id}>{u.id}</li>)}</ul>;
      }
    `;
    const issues = runRule(emptyStateRule, src, "L.tsx");
    expect(issues).toHaveLength(0);
  });

  it("does NOT flag .map() outside JSX (e.g. data transform)", () => {
    const src = `
      const ids = [1,2,3].map(n => n + 1);
      export default ids;
    `;
    const issues = runRule(emptyStateRule, src, "data.ts");
    expect(issues).toHaveLength(0);
  });

  it("does NOT flag when EmptyState component is rendered nearby", () => {
    const src = `
      import React from "react";
      import { EmptyState } from "./EmptyState";
      export function L({ users }: { users: any[] }) {
        return users.length ? <ul>{users.map(u => <li key={u.id}>{u.id}</li>)}</ul> : <EmptyState />;
      }
    `;
    const issues = runRule(emptyStateRule, src, "L.tsx");
    expect(issues).toHaveLength(0);
  });
});
