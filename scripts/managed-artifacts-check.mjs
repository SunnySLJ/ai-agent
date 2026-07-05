#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const root = process.cwd();
const managerPath = path.resolve(args.manager || "scripts/shuang-skill-manager.mjs");
const doctorPath = path.resolve(args.doctor || "scripts/project-doctor.mjs");
const quickstartPath = path.resolve(args.quickstart || defaultQuickstartPath());

if (args.help === "true") {
  console.log(`Usage:
  node scripts/managed-artifacts-check.mjs [--manager <file>] [--doctor <file>] [--quickstart <file>] [--json]

Checks that artifacts copied by shuang-skill-manager install are also covered by
installed-target project-doctor checks, and that installed helper scripts are
listed in the new-project quickstart.`);
  process.exit(0);
}

const report = {
  status: "pass",
  manager: managerPath,
  doctor: doctorPath,
  quickstart: quickstartPath,
  managedArtifacts: [],
  managedScripts: [],
  installedDoctorPaths: [],
  quickstartScripts: [],
  blockers: [],
  warnings: [],
};

try {
  report.managedArtifacts = parseManagedTargets(readFile(managerPath));
  report.managedScripts = report.managedArtifacts.filter((item) => item.startsWith("scripts/")).sort();
  report.installedDoctorPaths = parseInstalledDoctorPaths(readFile(doctorPath));
  report.quickstartScripts = parseScriptMentions(readFile(quickstartPath));

  for (const artifact of report.managedArtifacts) {
    if (!report.installedDoctorPaths.includes(artifact)) {
      report.blockers.push(`project-doctor installed target missing managed artifact: ${artifact}`);
    }
  }

  for (const script of report.managedScripts) {
    if (!report.quickstartScripts.includes(script)) {
      report.blockers.push(`new-project quickstart missing managed script: ${script}`);
    }
  }
} catch (error) {
  report.blockers.push(error.message);
}

report.status = report.blockers.length ? "fail" : "pass";

if (args.json === "true") {
  console.log(JSON.stringify(report, null, 2));
} else {
  printMarkdown(report);
}

process.exit(report.blockers.length ? 1 : 0);

function parseManagedTargets(text) {
  const copyBlock = text.match(/copyFiles\(\s*\[([\s\S]*?)\]\s*,\s*sourceRoot/s);
  if (!copyBlock) {
    throw new Error("cannot find shuang-skill-manager copyFiles block");
  }
  const targets = [];
  for (const match of copyBlock[1].matchAll(/\[\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\]/g)) {
    targets.push(match[2]);
  }
  return unique(targets).sort();
}

function parseInstalledDoctorPaths(text) {
  const block = text.match(/if\s*\(\s*installedTarget\s*\)\s*\{([\s\S]*?)\}\s*else\s*\{/);
  if (!block) {
    throw new Error("cannot find project-doctor installedTarget branch");
  }
  return unique([...block[1].matchAll(/requirePath\(\s*"([^"]+)"/g)].map((match) => match[1])).sort();
}

function parseScriptMentions(text) {
  return unique([...text.matchAll(/`(scripts\/[^`]+?\.mjs)`/g)].map((match) => match[1])).sort();
}

function readFile(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`missing file: ${path.relative(root, file)}`);
  }
  return fs.readFileSync(file, "utf8");
}

function defaultQuickstartPath() {
  const sourcePath = path.join(root, "docs", "new-project-quickstart.md");
  const installedPath = path.join(root, "docs", "shuang-skill", "new-project-quickstart.md");
  if (fs.existsSync(sourcePath)) return sourcePath;
  return installedPath;
}

function printMarkdown(out) {
  console.log("# Managed Artifacts Check");
  console.log("");
  console.log(`- Status: ${out.status}`);
  console.log(`- Managed artifacts: ${out.managedArtifacts.length}`);
  console.log(`- Managed scripts: ${out.managedScripts.length}`);
  console.log("");
  console.log("## Blockers");
  console.log("");
  if (out.blockers.length) {
    for (const blocker of out.blockers) console.log(`- ${blocker}`);
  } else {
    console.log("- none");
  }
  console.log("");
  console.log("## Warnings");
  console.log("");
  if (out.warnings.length) {
    for (const warning of out.warnings) console.log(`- ${warning}`);
  } else {
    console.log("- none");
  }
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

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}
