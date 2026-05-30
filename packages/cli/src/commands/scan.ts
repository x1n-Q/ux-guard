import { Command } from "commander";
import pc from "picocolors";
import {
  loadConfig,
  scan,
  renderTerminal,
  renderJson,
  renderAgentJson,
  type Severity,
} from "@x1n-q/uxlint-core";

type ScanFlags = {
  json?: boolean;
  forAgent?: boolean;
  failOn?: string;
  config?: string;
};

const SEV_ORDER: Record<Severity, number> = { info: 1, warn: 2, error: 3 };

export function registerScan(program: Command) {
  program
    .command("scan")
    .description("Scan a path for missing UX states (loading, empty, error, ...)")
    .argument("[path]", "File or directory to scan", ".")
    .option("--json", "Emit machine-readable JSON")
    .option("--for-agent", "Wrap JSON output as an AI-agent task (use with --json)")
    .option(
      "--fail-on <severity>",
      "Exit with non-zero code if any issue at or above this severity is found (info|warn|error)",
    )
    .action(async (target: string, flags: ScanFlags) => {
      const cwd = process.cwd();
      const config = loadConfig(cwd);
      const result = await scan({ cwd, target, config });

      if (flags.json) {
        const out = flags.forAgent ? renderAgentJson(result) : renderJson(result);
        process.stdout.write(out + "\n");
      } else {
        process.stdout.write(renderTerminal(result));
      }

      if (flags.failOn) {
        const threshold = flags.failOn.toLowerCase() as Severity;
        if (!SEV_ORDER[threshold]) {
          process.stderr.write(
            pc.red(`Invalid --fail-on value: ${flags.failOn}. Use info|warn|error.\n`),
          );
          process.exit(2);
        }
        const t = SEV_ORDER[threshold];
        const hit = result.issues.some((i) => SEV_ORDER[i.severity] >= t);
        if (hit) {
          if (!flags.json) {
            process.stderr.write(
              pc.red(
                `\nuxlint: failing because issues at or above "${threshold}" were found.\n`,
              ),
            );
          }
          process.exit(1);
        }
      }
    });
}
