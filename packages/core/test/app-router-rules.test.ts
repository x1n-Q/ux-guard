import { describe, it, expect } from "vitest";
import { loadingStateRule } from "../src/rules/loading-state";
import { errorStateRule } from "../src/rules/error-state";
import { runRule } from "./helpers";

/**
 * Same source on disk, different RouteContext. Demonstrates that the
 * Next.js App Router file-presence shortcut correctly suppresses rules.
 */
const FETCH_NO_LOADING_NO_ERROR = `
  import React, { useEffect, useState } from "react";
  export default function Page() {
    const [data, setData] = useState<any>(null);
    useEffect(() => { fetch("/api").then(r => r.json()).then(setData); }, []);
    return <div>{data?.x}</div>;
  }
`;

describe("App Router awareness — loading-state rule", () => {
  it("flags when no sibling loading.tsx exists (not App Router)", () => {
    const issues = runRule(loadingStateRule, FETCH_NO_LOADING_NO_ERROR);
    expect(issues).toHaveLength(1);
  });

  it("does NOT flag when an ancestor loading.tsx exists", () => {
    const issues = runRule(
      loadingStateRule,
      FETCH_NO_LOADING_NO_ERROR,
      "page.tsx",
      { isAppRouter: true, hasLoadingFile: true },
    );
    expect(issues).toHaveLength(0);
  });

  it("still flags when isAppRouter is true but no loading.tsx exists", () => {
    const issues = runRule(
      loadingStateRule,
      FETCH_NO_LOADING_NO_ERROR,
      "page.tsx",
      { isAppRouter: true, hasLoadingFile: false },
    );
    expect(issues).toHaveLength(1);
  });
});

describe("App Router awareness — error-state rule", () => {
  it("flags when no sibling error.tsx exists", () => {
    const issues = runRule(errorStateRule, FETCH_NO_LOADING_NO_ERROR);
    expect(issues).toHaveLength(1);
  });

  it("does NOT flag when an ancestor error.tsx exists", () => {
    const issues = runRule(
      errorStateRule,
      FETCH_NO_LOADING_NO_ERROR,
      "page.tsx",
      { isAppRouter: true, hasErrorFile: true },
    );
    expect(issues).toHaveLength(0);
  });

  it("still flags when isAppRouter is true but no error.tsx exists", () => {
    const issues = runRule(
      errorStateRule,
      FETCH_NO_LOADING_NO_ERROR,
      "page.tsx",
      { isAppRouter: true, hasErrorFile: false },
    );
    expect(issues).toHaveLength(1);
  });

  it("does NOT suppress error rule just because loading.tsx exists", () => {
    // Sanity: the two file types are independent.
    const issues = runRule(
      errorStateRule,
      FETCH_NO_LOADING_NO_ERROR,
      "page.tsx",
      { isAppRouter: true, hasLoadingFile: true, hasErrorFile: false },
    );
    expect(issues).toHaveLength(1);
  });
});
