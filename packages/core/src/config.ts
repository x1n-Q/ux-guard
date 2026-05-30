import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import type { UxLintConfig } from "./types";

const RuleSettingSchema = z.enum(["off", "info", "warn", "error"]);

export const ConfigSchema = z.object({
  framework: z.enum(["react", "nextjs"]).default("react"),
  include: z.array(z.string()).default(["**/*.{tsx,jsx,ts,js}"]),
  exclude: z
    .array(z.string())
    .default(["**/node_modules/**", "**/dist/**", "**/.next/**", "**/build/**"]),
  rules: z
    .record(RuleSettingSchema)
    .default({
      loadingState: "warn",
      emptyState: "warn",
      errorState: "error",
      formValidation: "error",
      disabledSubmit: "warn",
      successFeedback: "warn",
    }),
});

export const DEFAULT_CONFIG: UxLintConfig = ConfigSchema.parse({});

/**
 * Load ux-guard.config.{ts,js,json,cjs,mjs} from a given working directory.
 * Falls back to defaults if no config exists.
 *
 * For TS configs we do a very small "transpile-less" trick: we try to require
 * via JS; if that fails we just return defaults with a console warning.
 * This keeps the MVP zero-dependency for tsx loading.
 */
export function loadConfig(cwd: string): UxLintConfig {
  const candidates = [
    "ux-guard.config.js",
    "ux-guard.config.cjs",
    "ux-guard.config.json",
    "ux-guard.config.mjs",
    "ux-guard.config.ts",
  ];
  for (const name of candidates) {
    const p = path.join(cwd, name);
    if (!fs.existsSync(p)) continue;
    try {
      if (name.endsWith(".json")) {
        const raw = JSON.parse(fs.readFileSync(p, "utf8"));
        return ConfigSchema.parse(raw);
      }
      if (name.endsWith(".js") || name.endsWith(".cjs")) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require(p);
        const raw = mod.default ?? mod;
        return ConfigSchema.parse(raw);
      }
      // .ts / .mjs: skip require in MVP, return defaults but warn.
      console.warn(
        `[ux-guard] Found ${name} but TS/ESM configs are not loaded in MVP — using defaults. Use ux-guard.config.js or .json for now.`,
      );
      return DEFAULT_CONFIG;
    } catch (err) {
      console.warn(`[ux-guard] Failed to load ${name}: ${(err as Error).message}`);
      return DEFAULT_CONFIG;
    }
  }
  return DEFAULT_CONFIG;
}
