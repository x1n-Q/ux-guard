import { Command } from "commander";
import {
  loadConfig,
  scan,
  renderMarkdown,
  renderTerminal,
} from "@x1n-q/uxlint-core";

type ReportFlags = {
  markdown?: boolean;
};

export function registerReport(program: Command) {
  program
    .command("report")
    .description("Generate a UX completeness report (terminal or markdown).")
    .argument("[path]", "File or directory to scan", ".")
    .option("--markdown", "Emit a markdown report (great for PR comments)")
    .action(async (target: string, flags: ReportFlags) => {
      const cwd = process.cwd();
      const config = loadConfig(cwd);
      const result = await scan({ cwd, target, config });
      if (flags.markdown) {
        process.stdout.write(renderMarkdown(result));
      } else {
        process.stdout.write(renderTerminal(result));
      }
    });
}
