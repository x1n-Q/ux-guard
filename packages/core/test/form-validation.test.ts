import { describe, it, expect } from "vitest";
import { formValidationRule } from "../src/rules/form-validation";
import { runRule } from "./helpers";

describe("form-validation rule", () => {
  it("flags a form with input + submit but no validation", () => {
    const src = `
      import React from "react";
      export function F() {
        return (
          <form onSubmit={() => {}}>
            <input type="email" />
            <button type="submit">Go</button>
          </form>
        );
      }
    `;
    const issues = runRule(formValidationRule, src, "F.tsx");
    expect(issues).toHaveLength(1);
    expect(issues[0].type).toBe("missing_form_validation");
  });

  it("does NOT flag a form that has aria-invalid and an error message", () => {
    const src = `
      import React from "react";
      export function F({ error }: { error?: string }) {
        return (
          <form onSubmit={() => {}}>
            <input type="email" aria-invalid={!!error} required />
            {error ? <p role="alert">{error}</p> : null}
            <button type="submit">Go</button>
          </form>
        );
      }
    `;
    const issues = runRule(formValidationRule, src, "F.tsx");
    expect(issues).toHaveLength(0);
  });

  it("does NOT flag a form without inputs (e.g. confirmation form)", () => {
    const src = `
      import React from "react";
      export function F() {
        return <form onSubmit={() => {}}><button type="submit">Confirm</button></form>;
      }
    `;
    const issues = runRule(formValidationRule, src, "F.tsx");
    expect(issues).toHaveLength(0);
  });
});
