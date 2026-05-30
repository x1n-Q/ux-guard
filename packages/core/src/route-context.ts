import * as fs from "fs";
import * as path from "path";

/**
 * Next.js App Router context for a given source file.
 *
 * In the App Router, route-level UX states live in sibling files:
 *   - `loading.tsx`    → auto-rendered during Suspense (covers `missing_loading_state`)
 *   - `error.tsx`      → error boundary (covers `missing_error_state`)
 *   - `not-found.tsx`  → renders for `notFound()` calls
 *
 * These files are inherited by *all* descendant route segments, so when a
 * file at `app/dashboard/users/page.tsx` fetches data without a local
 * `isLoading` check, we should NOT flag it if `app/loading.tsx` (or
 * `app/dashboard/loading.tsx`) exists.
 */
export type RouteContext = {
  /** True if the file lives inside an `app/` directory (App Router). */
  isAppRouter: boolean;
  /** A loading.{tsx,jsx,ts,js} exists at this segment or any ancestor under app/. */
  hasLoadingFile: boolean;
  /** An error.{tsx,jsx,ts,js} exists at this segment or any ancestor under app/. */
  hasErrorFile: boolean;
  /** A not-found.{tsx,jsx,ts,js} exists at this segment or any ancestor under app/. */
  hasNotFoundFile: boolean;
};

const EXTS = ["tsx", "jsx", "ts", "js"] as const;

function fileExistsAny(dir: string, base: string): boolean {
  for (const ext of EXTS) {
    if (fs.existsSync(path.join(dir, `${base}.${ext}`))) return true;
  }
  return false;
}

/**
 * Walk up from `dir`, stopping when we hit (and exit) the nearest `app/`
 * directory or when we reach `stopAt` / filesystem root.
 *
 * Returns a list of directory paths to check, starting from `dir` and
 * walking up to and including the `app/` directory (inclusive).
 * Returns null if the file is not inside an `app/` directory.
 */
function collectAppSegments(
  fileDir: string,
  stopAt: string,
): string[] | null {
  const segments: string[] = [];
  let cur = fileDir;
  const root = path.parse(cur).root;
  let foundApp = false;
  for (let i = 0; i < 64; i++) {
    segments.push(cur);
    const base = path.basename(cur);
    if (base === "app") {
      foundApp = true;
      break;
    }
    if (cur === stopAt || cur === root) break;
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return foundApp ? segments : null;
}

/**
 * Build the RouteContext for a given absolute file path.
 *
 * `projectRoot` should be the cwd uxaudit was invoked from (used as a
 * safety stop so we don't walk past the project boundary).
 *
 * This call is cheap (a few `fs.existsSync` calls per segment) and the
 * scanner caches results per-directory for the whole run.
 */
export function buildRouteContext(
  absFile: string,
  projectRoot: string,
): RouteContext {
  const fileDir = path.dirname(absFile);
  const segments = collectAppSegments(fileDir, projectRoot);

  if (!segments) {
    return {
      isAppRouter: false,
      hasLoadingFile: false,
      hasErrorFile: false,
      hasNotFoundFile: false,
    };
  }

  let hasLoadingFile = false;
  let hasErrorFile = false;
  let hasNotFoundFile = false;
  for (const seg of segments) {
    if (!hasLoadingFile && fileExistsAny(seg, "loading")) hasLoadingFile = true;
    if (!hasErrorFile && fileExistsAny(seg, "error")) hasErrorFile = true;
    if (!hasNotFoundFile && fileExistsAny(seg, "not-found"))
      hasNotFoundFile = true;
    if (hasLoadingFile && hasErrorFile && hasNotFoundFile) break;
  }

  return {
    isAppRouter: true,
    hasLoadingFile,
    hasErrorFile,
    hasNotFoundFile,
  };
}

/**
 * Tiny per-directory cache for the scanner. Many files share a directory
 * (and the same set of ancestor segments), so caching by directory avoids
 * redundant fs.existsSync calls.
 */
export class RouteContextCache {
  private cache = new Map<string, RouteContext>();

  constructor(private projectRoot: string) {}

  get(absFile: string): RouteContext {
    const dir = path.dirname(absFile);
    const cached = this.cache.get(dir);
    if (cached) return cached;
    const ctx = buildRouteContext(absFile, this.projectRoot);
    this.cache.set(dir, ctx);
    return ctx;
  }
}
