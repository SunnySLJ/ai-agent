#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const DEFAULT_REGISTRY = ".shuang-skill/course-sources.local.json";
const args = parseArgs(process.argv.slice(2));
const root = resolveRoot(args.root || process.cwd());
const registryPath = resolvePath(args.registry || DEFAULT_REGISTRY, root);
const json = args.json === "true";

if (args.help === "true") {
  console.log(`Usage:
  node scripts/course-source-health.mjs [--root <project>] [--registry <file>] [--json]

Checks local-only course source registry health without reading course bodies.`);
  process.exit(0);
}

const report = analyzeRegistry(root, registryPath);

if (json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  printMarkdown(report);
}

process.exit(report.ready ? 0 : 1);

function analyzeRegistry(root, registryPath) {
  const blockers = [];
  const warnings = [];
  const sources = [];
  const policy = {
    registry: path.relative(root, registryPath) || ".",
    registryExists: fs.existsSync(registryPath),
    localDirIgnored: isLocalDirIgnored(root),
  };

  if (!policy.localDirIgnored) blockers.push(".shuang-skill/ is not ignored by .gitignore");

  if (!policy.registryExists) {
    blockers.push(`registry missing: ${policy.registry}`);
    return buildReport(blockers, warnings, sources, policy);
  }

  let registry;
  try {
    registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  } catch (error) {
    blockers.push(`registry JSON invalid: ${error.message}`);
    return buildReport(blockers, warnings, sources, policy);
  }

  const rawSources = Array.isArray(registry) ? registry : registry.sources;
  if (!Array.isArray(rawSources)) {
    blockers.push('registry must be an array or { "sources": [...] }');
    return buildReport(blockers, warnings, sources, policy);
  }

  const seenIds = new Set();
  for (const source of rawSources) {
    const id = String(source.id || "").trim();
    const label = id || "<missing-id>";
    const item = {
      id: label,
      title: String(source.title || "").trim(),
      path: String(source.path || "").trim(),
      exists: false,
      targetSkills: Array.isArray(source.targetSkills) ? source.targetSkills : [],
    };
    sources.push(item);

    if (!id) blockers.push("source id missing");
    else if (seenIds.has(id)) blockers.push(`duplicate source id: ${id}`);
    else seenIds.add(id);

    if (!item.title) warnings.push(`source title missing: ${label}`);
    if (!item.path) blockers.push(`source path missing: ${label}`);
    else if (!path.isAbsolute(item.path)) blockers.push(`source path must be absolute: ${label}`);

    item.exists = item.path ? fs.existsSync(item.path) : false;
    if (item.path && path.isAbsolute(item.path) && !item.exists) {
      blockers.push(`source path missing: ${label}`);
    }

    if (!Array.isArray(source.targetSkills)) {
      blockers.push(`targetSkills must be an array: ${label}`);
    } else if (!source.targetSkills.length) {
      blockers.push(`targetSkills empty: ${label}`);
    } else {
      for (const skill of source.targetSkills) {
        if (!isKnownSkillName(skill)) warnings.push(`unknown target skill: ${skill}`);
      }
    }

    if (!String(source.notes || "").trim()) warnings.push(`notes missing: ${label}`);
  }

  if (!sources.length) blockers.push("registry has no sources");
  return buildReport(blockers, warnings, sources, policy);
}

function buildReport(blockers, warnings, sources, policy) {
  const ready = blockers.length === 0;
  return {
    status: ready ? "pass" : "fail",
    ready,
    policy,
    totals: {
      sources: sources.length,
      existingSources: sources.filter((source) => source.exists).length,
      blockers: blockers.length,
      warnings: warnings.length,
    },
    blockers,
    warnings,
    sources,
  };
}

function isKnownSkillName(skill) {
  return /^(shuang-|speckit-|source-command-|figma-to-|enhance-prompt$)/.test(String(skill || ""));
}

function isLocalDirIgnored(root) {
  const gitignore = path.join(root, ".gitignore");
  if (!fs.existsSync(gitignore)) return false;
  const text = fs.readFileSync(gitignore, "utf8");
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .some((line) => line === ".shuang-skill/" || line === ".shuang-skill" || line === "/.shuang-skill/");
}

function printMarkdown(report) {
  console.log("# Course Source Health");
  console.log("");
  console.log(`- Status: ${report.status}`);
  console.log(`- Registry: \`${report.policy.registry}\``);
  console.log(`- Sources: ${report.totals.sources}`);
  console.log(`- Existing sources: ${report.totals.existingSources}`);
  console.log(`- .shuang-skill ignored: ${report.policy.localDirIgnored ? "yes" : "no"}`);
  console.log("");
  printList("Blockers", report.blockers);
  printList("Warnings", report.warnings);
}

function printList(title, items) {
  console.log(`## ${title}`);
  console.log("");
  if (!items.length) {
    console.log("- none");
    console.log("");
    return;
  }
  for (const item of items) console.log(`- ${item}`);
  console.log("");
}

function resolveRoot(value) {
  return path.resolve(value);
}

function resolvePath(value, root) {
  return path.isAbsolute(value) ? value : path.join(root, value);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith("--")) continue;
    const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
    out[key.slice(2)] = value;
  }
  return out;
}
