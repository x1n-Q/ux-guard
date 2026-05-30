#!/usr/bin/env node
// Ensures the compiled CLI entry has a shebang and is executable.
const fs = require("fs");
const path = require("path");

const target = process.argv[2];
if (!target) {
  console.error("usage: add-shebang.js <file>");
  process.exit(1);
}
const abs = path.resolve(target);
if (!fs.existsSync(abs)) {
  console.error(`add-shebang: file not found: ${abs}`);
  process.exit(0);
}
const SHEBANG = "#!/usr/bin/env node\n";
let content = fs.readFileSync(abs, "utf8");
if (!content.startsWith("#!")) {
  content = SHEBANG + content;
  fs.writeFileSync(abs, content, "utf8");
}
try {
  fs.chmodSync(abs, 0o755);
} catch {
  // ignore on non-POSIX
}
console.log(`✓ shebang ensured on ${path.relative(process.cwd(), abs)}`);
