import type { Rule, UxIssue } from "../types";
import { Node } from "ts-morph";

export const disabledSubmitRule: Rule = {
  id: "missing_disabled_submit",
  defaultSeverity: "warn",
  description:
    "Submit button is not disabled while submitting, allowing double-submits.",
  check: (sf, ctx) => {
    const issues: UxIssue[] = [];

    const visit = (node: Node) => {
      const isOpening = Node.isJsxOpeningElement(node);
      const isSelfClosing = Node.isJsxSelfClosingElement(node);
      if (!isOpening && !isSelfClosing) return;

      const tag = node.getTagNameNode().getText();
      if (tag.toLowerCase() !== "button") return;

      const attrs = node.getAttributes();
      let isSubmit = false;
      let hasDisabled = false;

      for (const a of attrs) {
        if (!Node.isJsxAttribute(a)) continue;
        const name = a.getNameNode().getText();
        if (name === "type") {
          const init = a.getInitializer();
          if (init && Node.isStringLiteral(init) && init.getLiteralValue() === "submit") {
            isSubmit = true;
          }
        }
        if (name === "disabled") {
          hasDisabled = true;
        }
      }

      if (!isSubmit || hasDisabled) return;

      const { line } = sf.getLineAndColumnAtPos(node.getStart());
      issues.push({
        type: "missing_disabled_submit",
        file: ctx.relativePath,
        line,
        severity: "warn",
        message:
          "Submit button has no `disabled` prop — users can double-submit while a request is in flight.",
        suggestion:
          "Add `disabled={isSubmitting}` (or equivalent) to the submit button.",
        aiFixHint:
          "Track a submitting state (e.g. `const [isSubmitting, setIsSubmitting] = useState(false)`), set it true around the async call, and pass `disabled={isSubmitting}` to the submit button. Optionally show a spinner inside the button.",
      });
    };

    sf.forEachDescendant(visit);
    return issues;
  },
};
