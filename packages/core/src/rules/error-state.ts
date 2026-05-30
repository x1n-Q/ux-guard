import type { Rule } from "../types";
import { looksLikeReactComponent } from "../text-utils";

const ASYNC_PATTERNS = [
  /\bawait\s+fetch\b/,
  /\.then\s*\(/,
  /\buseQuery\s*\(/,
  /\buseSWR\s*\(/,
  /\buseMutation\s*\(/,
  /\baxios\.[a-z]+\s*\(/,
];

const ERROR_PATTERNS = [
  /\bisError\b/,
  /\berror\b/,
  /\berr\b/,
  /<\s*ErrorMessage\b/,
  /<\s*ErrorBoundary\b/,
  /<\s*Alert\b/,
  /\bcatch\s*\(/,
  /\bcatch\s*\{/,
  /\.catch\s*\(/,
  /\btoast\.error\b/,
  /\bsetError\s*\(/,
  /\brole\s*=\s*["']alert["']/,
];

export const errorStateRule: Rule = {
  id: "missing_error_state",
  defaultSeverity: "error",
  description: "Async logic exists with no visible error handling or UI.",
  check: (_sf, ctx) => {
    const text = ctx.cleanText;
    if (!looksLikeReactComponent(text)) return [];
    // Next.js App Router: a sibling/ancestor `error.tsx` boundary handles
    // thrown errors automatically. Don't double-flag.
    if (ctx.route.isAppRouter && ctx.route.hasErrorFile) return [];
    const hasAsync = ASYNC_PATTERNS.some((re) => re.test(text));
    if (!hasAsync) return [];
    const hasError = ERROR_PATTERNS.some((re) => re.test(text));
    if (hasError) return [];
    return [
      {
        type: "missing_error_state",
        file: ctx.relativePath,
        severity: "error",
        message:
          "Async operation found with no error handling or error UI detected.",
        suggestion:
          "Render an error fallback when requests fail, e.g. `if (error) return <ErrorMessage />`, or surface failures via a toast.",
        aiFixHint:
          "Add error handling: capture errors from the async call (try/catch, .catch, or the hook's `error` field) and render an error UI. Prefer the project's existing ErrorMessage / Alert / toast component. Include a retry action when reasonable.",
      },
    ];
  },
};
