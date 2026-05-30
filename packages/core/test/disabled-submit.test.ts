import { describe, it, expect } from "vitest";
import { disabledSubmitRule } from "../src/rules/disabled-submit";
import { runRule } from "./helpers";

describe("disabled-submit rule", () => {
  it("flags a submit button with no disabled prop", () => {
    const src = `
      import React from "react";
      export function F() {
        return <button type="submit">Go</button>;
      }
    `;
    const issues = runRule(disabledSubmitRule, src, "F.tsx");
    expect(issues).toHaveLength(1);
    expect(issues[0].type).toBe("missing_disabled_submit");
  });

  it("does NOT flag a submit button with disabled prop", () => {
    const src = `
      import React from "react";
      export function F({ busy }: { busy: boolean }) {
        return <button type="submit" disabled={busy}>Go</button>;
      }
    `;
    const issues = runRule(disabledSubmitRule, src, "F.tsx");
    expect(issues).toHaveLength(0);
  });

  it("does NOT flag a non-submit button without disabled", () => {
    const src = `
      import React from "react";
      export function F() {
        return <button onClick={() => {}}>Click</button>;
      }
    `;
    const issues = runRule(disabledSubmitRule, src, "F.tsx");
    expect(issues).toHaveLength(0);
  });
});
