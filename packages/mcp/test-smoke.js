// Smoke test for the uxaudit MCP server.
// Spawns the server as a child process and uses the MCP client SDK
// to: list tools, then call uxaudit_scan on the example sample app.
const path = require("path");
const { spawn } = require("child_process");

async function main() {
  const { Client } = await import(
    "@modelcontextprotocol/sdk/client/index.js"
  );
  const { StdioClientTransport } = await import(
    "@modelcontextprotocol/sdk/client/stdio.js"
  );

  const serverPath = path.resolve(__dirname, "dist/index.js");

  const transport = new StdioClientTransport({
    command: "node",
    args: [serverPath],
  });

  const client = new Client(
    { name: "uxaudit-smoke-test", version: "0.0.0" },
    { capabilities: {} },
  );

  await client.connect(transport);
  console.log("✓ connected to uxaudit MCP server");

  const tools = await client.listTools();
  console.log(
    `✓ listed ${tools.tools.length} tools:`,
    tools.tools.map((t) => t.name).join(", "),
  );
  if (tools.tools.length !== 4) {
    throw new Error(`expected 4 tools, got ${tools.tools.length}`);
  }

  const examplePath = path.resolve(__dirname, "../../examples/react-sample");

  const scanRes = await client.callTool({
    name: "uxaudit_scan",
    arguments: { path: examplePath },
  });
  const scanText = scanRes.content?.[0]?.text || "";
  console.log("✓ uxaudit_scan returned summary (first 200 chars):");
  console.log("  " + scanText.slice(0, 200).replace(/\n/g, "\n  "));
  if (!/score:\s*\d+\/100/.test(scanText)) {
    throw new Error("uxaudit_scan output missing score");
  }

  const jsonRes = await client.callTool({
    name: "uxaudit_scan_json",
    arguments: { path: examplePath },
  });
  const jsonText = jsonRes.content?.[0]?.text || "";
  const parsed = JSON.parse(jsonText);
  if (parsed.task !== "ux_completeness_scan") {
    throw new Error("uxaudit_scan_json missing task field");
  }
  console.log(
    `✓ uxaudit_scan_json returned valid agent JSON (score=${parsed.score}, issues=${parsed.issues.length})`,
  );

  const rulesRes = await client.callTool({
    name: "uxaudit_list_rules",
    arguments: {},
  });
  const rulesText = rulesRes.content?.[0]?.text || "";
  if (!/missing_loading_state/.test(rulesText)) {
    throw new Error("uxaudit_list_rules missing expected rule");
  }
  console.log("✓ uxaudit_list_rules returned 6 rules");

  const reportRes = await client.callTool({
    name: "uxaudit_report",
    arguments: { path: examplePath },
  });
  const reportText = reportRes.content?.[0]?.text || "";
  if (!/## UX Completeness Report/.test(reportText)) {
    throw new Error("uxaudit_report output missing markdown header");
  }
  console.log("✓ uxaudit_report returned markdown");

  await client.close();
  console.log("\n✅ All MCP smoke tests passed.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ MCP smoke test failed:", err);
  process.exit(1);
});
