import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import pc from "picocolors";

const CONFIG_TS = `// uxlint configuration.
// Docs: https://github.com/x1n-Q/uxlint
//
// Rule levels: "off" | "info" | "warn" | "error"

export default {
  framework: "react",
  include: ["src/**/*.{tsx,jsx,ts,js}"],
  exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**", "**/build/**"],
  rules: {
    loadingState: "warn",
    emptyState: "warn",
    errorState: "error",
    formValidation: "error",
    disabledSubmit: "warn",
    successFeedback: "warn",
  },
};
`;

const CONFIG_JS = `// uxlint configuration.
/** @type {import('uxlint').UxLintConfig} */
module.exports = {
  framework: "react",
  include: ["src/**/*.{tsx,jsx,ts,js}"],
  exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**", "**/build/**"],
  rules: {
    loadingState: "warn",
    emptyState: "warn",
    errorState: "error",
    formValidation: "error",
    disabledSubmit: "warn",
    successFeedback: "warn",
  },
};
`;

export function registerInit(program: Command) {
  program
    .command("init")
    .description("Create a uxlint.config.{ts,js} file in the current directory.")
    .option("--js", "Create a JS config instead of TS")
    .option("--force", "Overwrite if the file already exists")
    .action((flags: { js?: boolean; force?: boolean }) => {
      const cwd = process.cwd();
      const ext = flags.js ? "js" : "ts";
      const file = path.join(cwd, `uxlint.config.${ext}`);
      if (fs.existsSync(file) && !flags.force) {
        process.stderr.write(
          pc.yellow(`uxlint.config.${ext} already exists. Use --force to overwrite.\n`),
        );
        process.exit(1);
      }
      fs.writeFileSync(file, flags.js ? CONFIG_JS : CONFIG_TS, "utf8");
      process.stdout.write(
        pc.green(`✓ Created `) + pc.bold(`uxlint.config.${ext}`) + "\n",
      );
      process.stdout.write(
        pc.gray(`  Next: run `) +
          pc.cyan(`npx uxlint scan ./src`) +
          pc.gray(` to scan your code.\n`),
      );
    });
}
