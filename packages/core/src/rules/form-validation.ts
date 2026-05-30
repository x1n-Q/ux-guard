import type { Rule, UxIssue } from "../types";
import { Node, SyntaxKind } from "ts-morph";

const VALIDATION_PATTERNS = [
  /\berror\b/i,
  /\binvalid\b/i,
  /\baria-invalid\b/,
  /\bvalidationMessage\b/i,
  /\brequired\b/,
  /\bzod\b/i,
  /\byup\b/i,
  /\bresolver\b/,
  /errors?\.[a-zA-Z_]+/,
];

export const formValidationRule: Rule = {
  id: "missing_form_validation",
  defaultSeverity: "error",
  description: "Form has inputs and a submit button but no validation feedback.",
  check: (sf, ctx) => {
    const issues: UxIssue[] = [];
    const text = ctx.text;

    // Quick guard: only look at files with both <form> and <input>
    if (!/<\s*form\b/i.test(text) || !/<\s*input\b/i.test(text)) return [];

    // Find each <form> element and check its descendants.
    sf.forEachDescendant((node) => {
      if (!Node.isJsxElement(node)) return;
      const tag = node.getOpeningElement().getTagNameNode().getText();
      if (tag.toLowerCase() !== "form") return;

      const formText = node.getText();
      const hasInput = /<\s*input\b/i.test(formText);
      const hasSubmit =
        /type\s*=\s*["']submit["']/i.test(formText) ||
        /onSubmit\s*=/.test(formText);
      if (!hasInput || !hasSubmit) return;

      const hasValidation = VALIDATION_PATTERNS.some((re) => re.test(formText));
      if (hasValidation) return;

      const { line } = sf.getLineAndColumnAtPos(node.getStart());
      issues.push({
        type: "missing_form_validation",
        file: ctx.relativePath,
        line,
        severity: "error",
        message:
          "Form has inputs and submit but no validation messages or error props.",
        suggestion:
          "Show validation messages near each field. Set `aria-invalid` and render an error message when invalid.",
        aiFixHint:
          "Add validation: integrate react-hook-form + zod (or the project's existing validation library). Render an error message under each invalid input and set `aria-invalid={true}` for accessibility.",
      });
    });

    return issues;
  },
};
