#!/usr/bin/env node

// Checks that every skill installs and loads on its own: frontmatter, size, links that stay inside the skill folder,
// references reachable from SKILL.md, exactly one plugin per skill in marketplace.json, and the README table. Exits 1 and prints each problem when
// something is off. With --hook it runs as the repo's Claude Code Stop hook: silent when everything passes, exit 2
// with the problems on stderr when not, so the agent fixes them before it finishes.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS = join(ROOT, "skills");
const MANIFESTS = join(ROOT, ".claude-plugin");
const MARKETPLACE = join(MANIFESTS, "marketplace.json");
const README = join(ROOT, "README.md");
const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LINK = /\]\(<?([^)\s>]+)>?(?:\s+"[^"]*")?\)/g;
const MAX_LINES = 500;

const hook = process.argv.includes("--hook");
if (hook) {
  let input = {};
  try {
    input = JSON.parse(readFileSync(0, "utf8"));
  } catch {}
  if (input.stop_hook_active) process.exit(0);
}

const problems = [];
const fail = (where, message) => problems.push(`${relative(ROOT, where) || "."}: ${message}`);

function frontmatter(path) {
  const text = readFileSync(path, "utf8");
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split("\n")) {
    const pair = line.match(/^([a-z][a-z0-9-]*):\s*(.*)$/);
    if (pair) fields[pair[1]] = pair[2].replace(/^(["'])(.*)\1$/, "$2");
  }
  return fields;
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function checkLinks(file, skillDir) {
  const targets = [];
  const text = readFileSync(file, "utf8").replace(/```[\s\S]*?```/g, "");
  for (const { 1: href } of text.matchAll(LINK)) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("#")) continue;
    const target = resolve(dirname(file), href.split("#")[0]);
    if (target !== skillDir && !target.startsWith(skillDir + sep)) {
      fail(file, `links to ${href}, outside the skill folder. A skill must work when installed on its own.`);
    } else if (!existsSync(target)) {
      fail(file, `links to ${href}, which does not exist`);
    } else {
      targets.push(target);
    }
  }
  return targets;
}

const skills = existsSync(SKILLS) ? readdirSync(SKILLS).filter((name) => statSync(join(SKILLS, name)).isDirectory()) : [];
if (skills.length === 0) fail(SKILLS, "no skills found");

for (const name of skills) {
  const dir = join(SKILLS, name);
  const skillFile = join(dir, "SKILL.md");
  if (!existsSync(skillFile)) {
    fail(dir, "has no SKILL.md");
    continue;
  }
  const fields = frontmatter(skillFile);
  if (!fields) {
    fail(skillFile, "has no frontmatter block between --- lines");
    continue;
  }
  if (fields.name !== name) fail(skillFile, `name is "${fields.name ?? ""}", but the folder is "${name}"`);
  if (!NAME.test(name) || name.length > 64) fail(dir, "folder name must be kebab-case and at most 64 characters");
  const description = fields.description ?? "";
  if (!description) fail(skillFile, "has no description");
  if (description.length > 1024) fail(skillFile, `description is ${description.length} characters, over the 1024 limit`);
  if (/[<>]/.test(description)) fail(skillFile, "description contains an angle bracket");
  const lines = readFileSync(skillFile, "utf8").split("\n").length;
  if (lines > MAX_LINES) fail(skillFile, `is ${lines} lines. Move long material to references/ to stay under ${MAX_LINES}.`);
  const links = new Map(walk(dir).filter((path) => path.endsWith(".md")).map((file) => [file, checkLinks(file, dir)]));
  // A reference that SKILL.md doesn't lead to, directly or through other files, is never read.
  const reached = new Set([skillFile]);
  const queue = [skillFile];
  while (queue.length > 0) {
    for (const target of links.get(queue.shift()) ?? []) {
      if (!reached.has(target)) reached.add(target), queue.push(target);
    }
  }
  for (const file of walk(dir).filter((path) => path.startsWith(join(dir, "references") + sep))) {
    if (!reached.has(file)) fail(file, "can't be reached by following links from SKILL.md, so it is never read. Link it, or delete it.");
  }
}

if (existsSync(join(MANIFESTS, "plugin.json"))) {
  fail(MANIFESTS, "has a plugin.json. It conflicts with the skills lists in marketplace.json and the plugins fail to load. Put plugin fields on the marketplace entries instead.");
}

let marketplace = null;
try {
  marketplace = JSON.parse(readFileSync(MARKETPLACE, "utf8"));
} catch (error) {
  fail(MARKETPLACE, `can't be read as JSON: ${error.message}`);
}

const plugins = new Map();
for (const entry of marketplace?.plugins ?? []) {
  const label = `plugin "${entry.name}"`;
  if (entry.source !== "./" || entry.strict !== false) fail(MARKETPLACE, `${label} needs "source": "./" and "strict": false, like the others`);
  if ("version" in entry) fail(MARKETPLACE, `${label} has a version, so installs update only when it's bumped. fstack tracks the latest commit.`);
  const listed = entry.skills ?? [];
  if (listed.length === 0) {
    fail(MARKETPLACE, `${label} lists no skills. Claude Code then loads every folder in skills/, so remove the entry until it has a skill.`);
  }
  for (const path of listed) {
    const name = path.match(/^\.\/skills\/([^/]+)\/?$/)?.[1];
    if (!name || !skills.includes(name)) fail(MARKETPLACE, `${label} lists ${path}, which isn't a folder under skills/`);
    else plugins.set(name, [...(plugins.get(name) ?? []), entry.name]);
  }
}
for (const name of skills) {
  const owners = plugins.get(name) ?? [];
  if (owners.length === 0) {
    fail(join(SKILLS, name), `is in no plugin, so it never installs. Add "./skills/${name}" to a plugin in marketplace.json. CLAUDE.md says which one.`);
  }
  if (owners.length > 1) fail(join(SKILLS, name), `is in more than one plugin (${owners.join(", ")}). List it once.`);
}

const rows = readFileSync(README, "utf8").split("\n").filter((line) => line.startsWith("|"));
for (const name of skills) {
  const row = rows.find((line) => line.includes(`(./skills/${name})`));
  if (!row) {
    fail(README, `the skills table has no row linking ./skills/${name}`);
    continue;
  }
  const cell = row.split("|")[2]?.trim();
  const owner = plugins.get(name)?.[0];
  if (owner && cell !== `\`${owner}\``) fail(README, `the row for ${name} says ${cell || "no plugin"}, but marketplace.json puts it in \`${owner}\``);
}

if (hook) {
  if (problems.length > 0) {
    process.stderr.write(`fstack's checks fail. Fix these before finishing:\n${problems.map((p) => `- ${p}`).join("\n")}\n`);
    process.exit(2);
  }
  process.exit(0);
}

console.log(`${skills.length} skills: ${skills.join(", ")}`);
for (const problem of problems) console.log(`FAIL ${problem}`);
console.log(`${problems.length} problems`);
if (problems.length > 0) process.exit(1);
