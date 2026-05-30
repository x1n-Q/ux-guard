import { Project, ScriptTarget } from "ts-morph";
import type { Rule, RuleContext, UxIssue } from "../src/types";
import type { RouteContext } from "../src/route-context";
import { stripCommentsAndStrings } from "../src/text-utils";

const DEFAULT_ROUTE: RouteContext = {
  isAppRouter: false,
  hasLoadingFile: false,
  hasErrorFile: false,
  hasNotFoundFile: false,
};

/**
 * Run a single rule against an in-memory source file.
 * Returns the issues the rule produced.
 *
 * Optional `route` overrides the Next.js App Router context (useful for
 * tests that simulate sibling loading.tsx / error.tsx files).
 */
export function runRule(
  rule: Rule,
  source: string,
  filename = "test.tsx",
  route: Partial<RouteContext> = {},
): UxIssue[] {
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      target: ScriptTarget.ES2020,
      allowJs: true,
      jsx: 4 /* Preserve */,
    },
  });
  const sf = project.createSourceFile(filename, source, { overwrite: true });
  const ctx: RuleContext = {
    relativePath: filename,
    text: source,
    cleanText: stripCommentsAndStrings(source),
    route: { ...DEFAULT_ROUTE, ...route },
  };
  return rule.check(sf, ctx);
}

/** Assert helper: returns true if any issue matches the given type. */
export function hasIssue(issues: UxIssue[], type: string): boolean {
  return issues.some((i) => i.type === type);
}
