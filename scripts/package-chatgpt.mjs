#!/usr/bin/env node
// Builds the ChatGPT (agent-plugins.org) package from this repository:
// openai/plugin.json and openai/mcp.json at the ZIP root, beside assets/ and skills/.
//
//   node scripts/package-chatgpt.mjs [--review review.json]
//
// --review merges an `extensions.com.openai.review` object (OpenAI's reviewer test cases,
// kept outside this public repository) into the packaged plugin.json. Requires `zip`.
//
// A skill whose server (scripts/skill-servers.mjs) openai/mcp.json does not name stays out
// of the package: its tools would not be there.
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { serverOf } from "./skill-servers.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "openai", "plugin.json"), "utf8"));
const claude = JSON.parse(readFileSync(join(root, ".claude-plugin", "plugin.json"), "utf8"));
const servers = JSON.parse(readFileSync(join(root, "openai", "mcp.json"), "utf8")).mcpServers;

if (manifest.version !== claude.version) {
  console.error(`openai/plugin.json is ${manifest.version}, .claude-plugin/plugin.json is ${claude.version}: release them together.`);
  process.exit(1);
}

const reviewArg = process.argv.indexOf("--review");
if (reviewArg !== -1) {
  const review = JSON.parse(readFileSync(process.argv[reviewArg + 1], "utf8"));
  manifest.extensions["com.openai"].review = review.review ?? review;
}

const stage = mkdtempSync(join(tmpdir(), "helpcenter-io-chatgpt-"));
try {
  writeFileSync(join(stage, "plugin.json"), JSON.stringify(manifest, null, 2) + "\n");
  cpSync(join(root, "openai", "mcp.json"), join(stage, "mcp.json"));
  cpSync(join(root, "assets"), join(stage, "assets"), { recursive: true });
  for (const skill of readdirSync(join(root, "skills"), { withFileTypes: true })) {
    if (!skill.isDirectory()) {
      continue;
    }
    if (!servers[serverOf(skill.name)]) {
      console.log(`Left out skills/${skill.name}: it uses ${serverOf(skill.name)}, which openai/mcp.json does not name.`);
      continue;
    }
    cpSync(join(root, "skills", skill.name), join(stage, "skills", skill.name), { recursive: true });
  }

  const outDir = join(root, "dist");
  mkdirSync(outDir, { recursive: true });
  const archive = join(outDir, `${manifest.name}-${manifest.version}-chatgpt.zip`);
  rmSync(archive, { force: true });
  execFileSync("zip", ["-X", "-q", "-r", archive, "."], { cwd: stage });
  console.log(`ChatGPT package: ${archive}${reviewArg === -1 ? " (no review block: add --review for a submission)" : ""}`);
} finally {
  rmSync(stage, { recursive: true, force: true });
}
