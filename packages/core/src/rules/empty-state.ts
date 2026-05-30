import type { Rule, UxIssue } from "../types";
import { SyntaxKind, Node } from "ts-morph";

const EMPTY_GUARDS = [
  /\.length\s*===?\s*0\b/,
  /\.length\s*<\s*1\b/,
  /\.length\s*<=\s*0\b/,
  /!\s*\w+(\.\w+)*\.length\b/,
  /<\s*EmptyState\b/,
  /<\s*NoResults\b/,
  /<\s*Empty\b/,
  /No\s+(items|results|data|records|entries)/i,
];

export const emptyStateRule: Rule = {
  id: "missing_empty_state",
  defaultSeverity: "warn",
  description: "A list is rendered with .map() but no empty fallback is shown.",
  check: (sf, ctx) => {
    const issues: UxIssue[] = [];
    const text = ctx.cleanText;
    const hasGuard = EMPTY_GUARDS.some((re) => re.test(text));
    if (hasGuard) return [];

    // Walk JSX-bearing call expressions: foo.map(...)
    sf.forEachDescendant((node) => {
      if (!Node.isCallExpression(node)) return;
      const expr = node.getExpression();
      if (!Node.isPropertyAccessExpression(expr)) return;
      if (expr.getName() !== "map") return;

      // Heuristic: is the result used inside JSX? Walk up to find a JSX ancestor.
      let parent: Node | undefined = node.getParent();
      let insideJsx = false;
      let depth = 0;
      while (parent && depth < 10) {
        const k = parent.getKind();
        if (
          k === SyntaxKind.JsxExpression ||
          k === SyntaxKind.JsxElement ||
          k === SyntaxKind.JsxFragment ||
          k === SyntaxKind.JsxSelfClosingElement
        ) {
          insideJsx = true;
          break;
        }
        parent = parent.getParent();
        depth++;
      }
      if (!insideJsx) return;

      const { line } = node.getSourceFile().getLineAndColumnAtPos(node.getStart());
      issues.push({
        type: "missing_empty_state",
        file: ctx.relativePath,
        line,
        severity: "warn",
        message: `List rendering (\`${expr.getText()}\`) found without an empty fallback.`,
        suggestion:
          "Add a fallback when the array is empty, e.g. `items.length === 0 ? <EmptyState /> : items.map(...)`.",
        aiFixHint:
          "Wrap the .map() in a conditional that renders an empty-state UI when the source array has zero items. Use the project's existing EmptyState component if one exists, otherwise render a friendly message like 'No items yet.'",
      });
    });

    // De-dupe: at most one issue per file for empty-state (less noisy).
    return issues.slice(0, 1);
  },
};
