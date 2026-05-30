import type { SourceFile } from "ts-morph";

/**
 * Quick heuristic: is this file a React/JSX file we should lint?
 * - .tsx / .jsx extension, OR
 * - contains `from "react"` import, OR
 * - contains JSX syntax
 */
export function isReactFile(sf: SourceFile): boolean {
  const fp = sf.getFilePath().toLowerCase();
  if (fp.endsWith(".tsx") || fp.endsWith(".jsx")) return true;
  const text = sf.getFullText();
  if (/from\s+["']react["']/.test(text)) return true;
  if (/<[A-Za-z][A-Za-z0-9]*[\s/>]/.test(text)) return true;
  return false;
}
