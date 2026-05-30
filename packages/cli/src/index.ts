#!/usr/bin/env node
import { Command } from "commander";
import pc from "picocolors";
import { registerScan } from "./commands/scan";
import { registerReport } from "./commands/report";
import { registerInit } from "./commands/init";

const program = new Command();

program
  .name("uxlint")
  .description(
    "ESLint catches bad code. uxlint catches unfinished UX.\n" +
      "Scan React / Next.js code for missing UX states (loading, empty, error, validation, etc).",
  )
  .version("0.1.0");

registerScan(program);
registerReport(program);
registerInit(program);

program.parseAsync(process.argv).catch((err) => {
  // eslint-disable-next-line no-console
  console.error(pc.red("uxlint crashed:"), err?.stack || err?.message || err);
  process.exit(2);
});
