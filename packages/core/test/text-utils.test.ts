import { describe, it, expect } from "vitest";
import {
  stripCommentsAndStrings,
  looksLikeReactComponent,
} from "../src/text-utils";

describe("stripCommentsAndStrings", () => {
  it("strips line comments", () => {
    const out = stripCommentsAndStrings(`const x = 1; // loading\nconst y = 2;`);
    expect(out).not.toMatch(/loading/);
    expect(out).toMatch(/const x = 1/);
  });

  it("strips block comments including JSDoc", () => {
    const out = stripCommentsAndStrings(
      `/** error handler description */\nfunction f() {}`,
    );
    expect(out).not.toMatch(/error/);
    expect(out).toMatch(/function f/);
  });

  it("strips string literals (double, single, template)", () => {
    const out = stripCommentsAndStrings(
      `const a = "loading"; const b = 'error'; const c = \`success\`;`,
    );
    expect(out).not.toMatch(/loading|error|success/);
  });

  it("keeps template literal interpolations", () => {
    const out = stripCommentsAndStrings(
      "const url = `/api/${userId}/list`;",
    );
    expect(out).toMatch(/userId/);
    expect(out).not.toMatch(/\/api\//);
  });
});

describe("looksLikeReactComponent", () => {
  it("detects react imports after strings are stripped", () => {
    // We always feed cleanText (strings stripped) in production.
    const clean = stripCommentsAndStrings(`import React from "react";`);
    expect(looksLikeReactComponent(clean)).toBe(true);
  });

  it("detects JSX usage", () => {
    expect(looksLikeReactComponent(`const x = <div>hi</div>;`)).toBe(true);
    expect(looksLikeReactComponent(`const x = <Component />;`)).toBe(true);
    expect(looksLikeReactComponent(`return <br />;`)).toBe(true);
  });

  it("returns false for plain TS", () => {
    expect(
      looksLikeReactComponent(
        `export function add(a: number, b: number) { return a + b; }`,
      ),
    ).toBe(false);
  });
});
