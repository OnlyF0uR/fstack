#!/usr/bin/env node

// Checks that every skill installs and loads on its own: frontmatter, size, links that stay inside the skill folder,
// the plugin manifests, and the README table. Exits 1 and prints each problem when something is off.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS = join(ROOT, "skills");
const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LINK = /\]\(<?([^)\s>]+)>?(?:\s+"[^"]*")?\)/g;
const MAX_LINES = 500;

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
  const text = readFileSync(file, "utf8").replace(/```[\s\S]*?```/g, "");
  for (const { 1: href } of text.matchAll(LINK)) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("#")) continue;
    const target = resolve(dirname(file), href.split("#")[0]);
    if (target !== skillDir && !target.startsWith(skillDir + sep)) {
      fail(file, `links to ${href}, outside the skill folder. A skill must work when installed on its own.`);
    } else if (!existsSync(target)) {
      fail(file, `links to ${href}, which does not exist`);
    }
  }
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
  for (const file of walk(dir).filter((path) => path.endsWith(".md"))) checkLinks(file, dir);
}

const manifestDir = join(ROOT, ".claude-plugin");
const readJson = (file) => {
  try {
    return JSON.parse(readFileSync(join(manifestDir, file), "utf8"));
  } catch (error) {
    fail(join(manifestDir, file), `can't be read as JSON: ${error.message}`);
    return null;
  }
};
const plugin = readJson("plugin.json");
const marketplace = readJson("marketplace.json");
if (plugin && marketplace) {
  const local = (marketplace.plugins ?? []).filter((entry) => ["./", "."].includes(entry.source));
  if (local.length !== 1) fail(manifestDir, "marketplace.json should list this repository as exactly one plugin with source \"./\"");
  else if (local[0].name !== plugin.name) {
    fail(manifestDir, `marketplace entry "${local[0].name}" and plugin.json name "${plugin.name}" differ, so installs fail`);
  }
  if ("version" in plugin) {
    fail(manifestDir, "plugin.json has a version, so installs update only when it's bumped. fstack tracks the latest commit.");
  }
}

const readme = readFileSync(join(ROOT, "README.md"), "utf8");
for (const name of skills) {
  if (!readme.includes(`(./skills/${name})`)) fail(join(ROOT, "README.md"), `the skills table does not link ./skills/${name}`);
}

console.log(`${skills.length} skills: ${skills.join(", ")}`);
for (const problem of problems) console.log(`FAIL ${problem}`);
console.log(`${problems.length} problems`);
if (problems.length > 0) process.exit(1);
