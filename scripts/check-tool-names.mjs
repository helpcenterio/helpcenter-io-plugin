#!/usr/bin/env node
// Fails when a skill names a HelpCenter.io tool its server does not serve, or when the
// Claude and ChatGPT manifests point the same server at different addresses.
//
// Each skill is checked against one server in .mcp.json: `helpcenter` (the account
// connector) unless scripts/skill-servers.mjs names another.
//
//   node scripts/check-tool-names.mjs                        # against the live servers
//   node scripts/check-tool-names.mjs --tools tools.json     # `helpcenter` from a saved tools/list result
//   node scripts/check-tool-names.mjs --tools helpcenter-agent=agent.json   # any server by name
//
// tools/list needs no account: both servers list their tools to any caller. The bearer
// value below is a placeholder, not a credential, and the agent endpoint ignores it.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { serverOf } from "./skill-servers.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const claudeServers = JSON.parse(readFileSync(join(root, ".mcp.json"), "utf8")).mcpServers;
const openaiServers = JSON.parse(readFileSync(join(root, "openai", "mcp.json"), "utf8")).mcpServers;

const problems = [];
for (const [name, server] of Object.entries(openaiServers)) {
  if (claudeServers[name]?.url !== server.url) {
    problems.push(`openai/mcp.json points ${name} at ${server.url}, .mcp.json at ${claudeServers[name]?.url}`);
  }
}

const savedTools = new Map();
process.argv.forEach((arg, index) => {
  if (arg === "--tools") {
    const value = process.argv[index + 1];
    const [name, file] = value.includes("=") ? value.split("=", 2) : ["helpcenter", value];
    savedTools.set(name, file);
  }
});

async function toolNames(name) {
  if (savedTools.has(name)) {
    const saved = JSON.parse(readFileSync(savedTools.get(name), "utf8"));
    return (saved.result?.tools ?? saved.tools ?? saved).map((tool) => tool.name);
  }
  const response = await fetch(claudeServers[name].url, {
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

const known = new Map();
const mentions = new Map();
const skills = readdirSync(join(root, "skills"), { withFileTypes: true }).filter((entry) => entry.isDirectory());
for (const { name: skill } of skills) {
  const name = serverOf(skill);
  if (!claudeServers[name]) {
    problems.push(`skills/${skill} uses ${name}, which .mcp.json does not name`);
    continue;
  }
  if (!known.has(name)) {
    known.set(name, new Set(await toolNames(name)));
    mentions.set(name, 0);
  }
  for (const file of markdownFiles(join(root, "skills", skill))) {
    for (const tool of new Set(readFileSync(file, "utf8").match(/helpcenter_[a-z_]+/g) ?? [])) {
      mentions.set(name, mentions.get(name) + 1);
      if (!known.get(name).has(tool)) {
        problems.push(`${relative(root, file)} names ${tool}, which ${claudeServers[name].url} does not serve`);
      }
    }
  }
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}
for (const [name, tools] of known) {
  console.log(
    `OK: ${mentions.get(name)} tool mentions in the ${name} skills, all among the ${tools.size} tools ${claudeServers[name].url} serves.`,
  );
}
