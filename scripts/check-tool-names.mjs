#!/usr/bin/env node
// Fails when a skill names a HelpCenter.io tool the connector does not serve, or when the
// Claude and ChatGPT manifests point at different servers.
//
//   node scripts/check-tool-names.mjs                 # against https://mcp.helpcenter.io
//   node scripts/check-tool-names.mjs --tools tools.json   # against a saved tools/list result
//
// tools/list needs no account: the connector lists its tools to any caller. The bearer
// value below is a placeholder, not a credential.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const claudeMcp = JSON.parse(readFileSync(join(root, ".mcp.json"), "utf8"));
const openaiMcp = JSON.parse(readFileSync(join(root, "openai", "mcp.json"), "utf8"));
const serverUrl = claudeMcp.mcpServers.helpcenter.url;

const problems = [];
if (openaiMcp.mcpServers.helpcenter.url !== serverUrl) {
  problems.push(`openai/mcp.json points at ${openaiMcp.mcpServers.helpcenter.url}, .mcp.json at ${serverUrl}`);
}

async function liveToolNames() {
  const toolsArg = process.argv.indexOf("--tools");
  if (toolsArg !== -1) {
    const saved = JSON.parse(readFileSync(process.argv[toolsArg + 1], "utf8"));
    return (saved.result?.tools ?? saved.tools ?? saved).map((tool) => tool.name);
  }
  const response = await fetch(serverUrl, {
    method: "POST",
    headers: {
      Authorization: "Bearer tools-list",
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
  });
  let text = await response.text();
  if (text.startsWith("event:") || text.startsWith("data:")) {
    text = text
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5))
      .join("");
  }
  return JSON.parse(text).result.tools.map((tool) => tool.name);
}

function markdownFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) {
      return markdownFiles(path);
    }
    return name.endsWith(".md") ? [path] : [];
  });
}

const known = new Set(await liveToolNames());
let mentions = 0;
for (const file of markdownFiles(join(root, "skills"))) {
  for (const name of new Set(readFileSync(file, "utf8").match(/helpcenter_[a-z_]+/g) ?? [])) {
    mentions += 1;
    if (!known.has(name)) {
      problems.push(`${relative(root, file)} names ${name}, which ${serverUrl} does not serve`);
    }
  }
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`OK: ${mentions} tool mentions across the skills, all among the ${known.size} tools ${serverUrl} serves.`);
