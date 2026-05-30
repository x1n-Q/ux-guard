import * as path from "path";
import * as fs from "fs";
import fg from "fast-glob";
import { Project, ScriptTarget, IndentationText } from "ts-morph";
import type {
  Rule,
  RuleContext,
  ScanResult,
  UxIssue,
  UxLintConfig,
  Severity,
  RuleSetting,
} from "./types";
import { ALL_RULES, CONFIG_KEY_TO_RULE_ID } from "./rules";
import { computeScore } from "./scoring";
import { stripCommentsAndStrings } from "./text-utils";
import { RouteContextCache } from "./route-context";

export type ScanOptions = {
  cwd: string;
  /** Target path the user passed on the CLI (file or dir, absolute or relative). */
  target: string;
  config: UxLintConfig;
};

/**
 * Resolve user-provided target into glob patterns.
 * - If target is a directory: scan config.include rooted at target.
 * - If target is a single file: scan that file (if its extension matches).
 */
function buildPatterns(opts: ScanOptions): { patterns: string[]; root: string } {
  const abs = path.resolve(opts.cwd, opts.target);
  if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
    return { patterns: [abs.replace(/\\/g, "/")], root: path.dirname(abs) };
  }
  const root = abs;
  const patterns = opts.config.include.map((p) =>
    path.posix.join(root.replace(/\\/g, "/"), p),
  );
  return { patterns, root };
}

function effectiveSeverity(
  rule: Rule,
  config: UxLintConfig,
): Severity | "off" {
  const entry = Object.entries(CONFIG_KEY_TO_RULE_ID).find(
    ([, id]) => id === rule.id,
  );
  if (!entry) return rule.defaultSeverity;
  const [key] = entry;
  const setting: RuleSetting | undefined = config.rules[key] as
    | RuleSetting
    | undefined;
  if (!setting) return rule.defaultSeverity;
  if (setting === "off") return "off";
  return setting;
}

export async function scan(opts: ScanOptions): Promise<ScanResult> {
  const { patterns } = buildPatterns(opts);
  const files = await fg(patterns, {
    ignore: opts.config.exclude,
    onlyFiles: true,
    absolute: true,
    dot: false,
  });

  const project = new Project({
    useInMemoryFileSystem: false,
    skipAddingFilesFromTsConfig: true,
    skipFileDependencyResolution: true,
    compilerOptions: {
      target: ScriptTarget.ES2020,
      allowJs: true,
      jsx: 4 /* Preserve */,
    },
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
    },
  });

  const allIssues: UxIssue[] = [];
  const routeCache = new RouteContextCache(opts.cwd);

  for (const file of files) {
    let text: string;
    try {
      text = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const sf = project.createSourceFile(file, text, { overwrite: true });
    const ctx: RuleContext = {
      relativePath: path.relative(opts.cwd, file) || file,
      text,
      cleanText: stripCommentsAndStrings(text),
      route: routeCache.get(file),
    };
    for (const rule of ALL_RULES) {
      const sev = effectiveSeverity(rule, opts.config);
      if (sev === "off") continue;
      try {
        const issues = rule.check(sf, ctx);
        for (const i of issues) {
          i.severity = sev;
          allIssues.push(i);
        }
      } catch (err) {
        // Never let a rule crash the scan.
        // eslint-disable-next-line no-console
        console.warn(
          `[uxlint] rule "${rule.id}" failed on ${ctx.relativePath}: ${
            (err as Error).message
          }`,
        );
      }
    }
    // Free memory on huge codebases.
    project.removeSourceFile(sf);
  }

  // Group per file
  const byFile: Record<string, UxIssue[]> = {};
  for (const i of allIssues) {
    if (!byFile[i.file]) byFile[i.file] = [];
    byFile[i.file].push(i);
  }

  return {
    score: computeScore(allIssues),
    framework: opts.config.framework,
    filesScanned: files.length,
    issues: allIssues,
    byFile,
  };
}

export { ALL_RULES };
