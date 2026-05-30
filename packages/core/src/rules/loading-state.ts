import type { Rule } from "../types";
import { looksLikeReactComponent } from "../text-utils";

const ASYNC_PATTERNS = [
  /\bawait\s+fetch\b/,
  /\.then\s*\(/,
  /\buseQuery\s*\(/,
  /\buseSWR\s*\(/,
  /\buseMutation\s*\(/,
  /\buseEffect\s*\([^)]*fetch/,
  /\baxios\.[a-z]+\s*\(/,
];

const LOADING_PATTERNS = [
  /\bisLoading\b/,
  /\bloading\b/,
  /\bpending\b/,
  /\bisPending\b/,
  /\bisFetching\b/,
  /\bisSubmitting\b/,
  /<\s*Spinner\b/,
  /<\s*Skeleton\b/,
  /<\s*Loader\b/,
  /<\s*LoadingIndicator\b/,
  /\baria-busy\b/,
];

export const loadingStateRule: Rule = {
  id: "missing_loading_state",
  defaultSeverity: "warn",
  description: "Async data is fetched but no loading UI is rendered.",
  check: (_sf, ctx) => {
    const text = ctx.cleanText;
    if (!looksLikeReactComponent(text)) return [];
    // Next.js App Router: a sibling/ancestor `loading.tsx` covers Suspense
    // automatically. Don't double-flag.
    if (ctx.route.isAppRouter && ctx.route.hasLoadingFile) return [];
    const hasAsync = ASYNC_PATTERNS.some((re) => re.test(text));
    if (!hasAsync) return [];
    const hasLoading = LOADING_PATTERNS.some((re) => re.test(text));
    if (hasLoading) return [];
    return [
      {
        type: "missing_loading_state",
        file: ctx.relativePath,
        severity: "warn",
        message: "Async data fetching found but no loading UI was detected.",
        suggestion:
          "Render a spinner, skeleton, or `if (isLoading) return <Spinner />` while data is loading.",
        aiFixHint:
          "Add a loading state to the component. Track an `isLoading` boolean (from useState, useQuery, useSWR, etc.) and render a Skeleton or Spinner component while true. Use the project's existing loading components if any exist.",
      },
    ];
  },
};
