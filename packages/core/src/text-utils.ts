/**
 * Heuristic: does this file content look like it renders React UI?
 * Uses the *clean* text (no comments/strings) so we don't false-positive
 * on documentation or string content.
 */
export function looksLikeReactComponent(cleanText: string): boolean {
  return (
    // `import React ...` (most React files have this; survives string-stripping)
    /\bimport\s+React\b/.test(cleanText) ||
    // `from "react"` — strings become a single space so this still matches
    /\bfrom\s+react\b/.test(cleanText) ||
    // JSX closing tag (any case): `</div>`, `</Foo>`
    /<\/[A-Za-z]/.test(cleanText) ||
    // JSX with a capitalized component (e.g. <Foo />)
    /<[A-Z][A-Za-z0-9]*[\s/>]/.test(cleanText) ||
    // Self-closing lowercase JSX (e.g. <div />, <br/>) — common in React
    /<[a-z][a-zA-Z0-9-]*\s*\/>/.test(cleanText)
  );
}

/**
 * Strip JS/TS comments (line, block, JSDoc) from a source string.
 * Conservative regex; good enough for rule heuristics (we don't need
 * a real parser here because ts-morph handles structural rules).
 *
 * Also strips string literals so words like "loading" inside a
 * URL or message do not trigger false positives.
 */
export function stripCommentsAndStrings(src: string): string {
  let out = "";
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    const c2 = src[i + 1];

    // Line comment
    if (c === "/" && c2 === "/") {
      while (i < n && src[i] !== "\n") i++;
      continue;
    }
    // Block comment
    if (c === "/" && c2 === "*") {
      i += 2;
      while (i < n && !(src[i] === "*" && src[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    // String literals: ", ', `
    if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      i++;
      while (i < n) {
        if (src[i] === "\\") {
          i += 2;
          continue;
        }
        if (src[i] === quote) {
          i++;
          break;
        }
        // Template literal interpolation — keep the inner expression.
        if (quote === "`" && src[i] === "$" && src[i + 1] === "{") {
          out += " ";
          i += 2;
          let depth = 1;
          while (i < n && depth > 0) {
            if (src[i] === "{") depth++;
            else if (src[i] === "}") depth--;
            if (depth > 0) {
              out += src[i];
              i++;
            }
          }
          i++; // skip closing }
          continue;
        }
        i++;
      }
      out += " ";
      continue;
    }
    out += c;
    i++;
  }
  return out;
}
