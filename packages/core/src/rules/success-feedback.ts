import type { Rule } from "../types";
import { looksLikeReactComponent } from "../text-utils";

// Only treat as an action handler if the name *starts with* handle/on
// (event handler convention) OR is a function whose name starts with handle/on
// and contains a strong action verb. This avoids false positives on factory
// functions like createBreakout, updateFrame, etc.
// NOTE: We intentionally do NOT include generic `Click` here — onClick is too
// broad (lots of buttons don't need a success toast, e.g. "Try again", "Close").
// We only flag handlers that map to clear *mutations* of state.
const HANDLER_NAME =
  /\b(handle|on)(Submit|Save|Create|Update|Delete|Enroll|Register|Signup|Login)\b/;
const ACTION_FUNC_NAME =
  /\b(?:async\s+function|function|const)\s+(?:handle|on)\w*(?:Submit|Save|Create|Update|Delete|Enroll|Register|Signup|Login)\b/;

const FEEDBACK_PATTERNS = [
  /\btoast\b/i,
  /\bnotify\b/i,
  /\bnotification\b/i,
  /\bsuccess\b/i,
  /\bsetMessage\b/,
  /\brouter\.push\b/,
  /\bredirect\s*\(/,
  /\bnavigate\s*\(/,
  /\balert\s*\(/,
  /<\s*SuccessMessage\b/,
];

export const successFeedbackRule: Rule = {
  id: "missing_success_feedback",
  defaultSeverity: "warn",
  description:
    "An action handler (submit/save/etc) runs but no user-visible success feedback follows.",
  check: (_sf, ctx) => {
    const text = ctx.cleanText;

    // Only check React/JSX files — plain TS modules (game loops, utilities, etc.)
    // commonly have function names like createX/updateX with no UI implication.
    if (!looksLikeReactComponent(text)) return [];

    const hasAction = HANDLER_NAME.test(text) || ACTION_FUNC_NAME.test(text);
    if (!hasAction) return [];
    const hasFeedback = FEEDBACK_PATTERNS.some((re) => re.test(text));
    if (hasFeedback) return [];
    return [
      {
        type: "missing_success_feedback",
        file: ctx.relativePath,
        severity: "warn",
        message:
          "Action handler found (handleSubmit/handleSave/...) but no success feedback (toast / redirect / message) was detected.",
        suggestion:
          "Show a success toast, redirect to a confirmation page, or render a success message after the action completes.",
        aiFixHint:
          "After the successful async call, give the user feedback: call `toast.success(...)`, navigate with `router.push(...)`, or set a local success message. Use the project's existing toast/notification component if one is already imported elsewhere.",
      },
    ];
  },
};
