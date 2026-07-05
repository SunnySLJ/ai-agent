#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const root = process.cwd();

const REQUIRED_CAPABILITIES = [
  "intake",
  "brainstorm",
  "research",
  "prd",
  "arch",
  "design",
  "specs",
  "implement",
  "test",
  "api-handoff",
  "code-handoff",
  "prompt",
  "release-readiness",
  "evolve",
  "install-sync",
  "course",
];

const REQUIRED_SKILLS = [
  "shuang-flow",
  "shuang-brainstorm",
  "shuang-research",
  "shuang-prd",
  "shuang-arch",
  "shuang-design",
  "shuang-specs",
  "shuang-tdd",
  "shuang-router",
  "shuang-api-handoff",
  "shuang-code-handoff",
  "shuang-prompt",
  "shuang-evolve",
];

const REQUIRED_COMMANDS = [
  "node scripts/project-readiness.mjs",
  "node scripts/short-command-route-check.mjs",
  "node scripts/short-command-route-smoke.mjs",
  "node scripts/shuang-skill-manager.mjs drill --request \"<一句话需求>\" --json",
  "node scripts/shuang-skill-manager.mjs start --request \"<一句话需求>\"",
  "node scripts/shuang-skill-manager.mjs next --json",
  "node scripts/shuang-skill-manager.mjs request prompt --raw",
  "node scripts/shuang-skill-manager.mjs guard --json",
  "node scripts/project-start.mjs --request \"<一句话需求>\"",
  "node scripts/vibe-request-start.mjs --request \"<一句话需求>\"",
  "node scripts/vibe-request-prompt.mjs",
  "node scripts/shuang-skill-manager.mjs context --json",
  "node scripts/spec-kit-handoff-check.mjs --feature <feature-dir>",
  "node scripts/api-handoff-artifact-check.mjs --doc <handoff.md> --openapi <openapi.json>",
  "node scripts/evolution-inbox-status.mjs --limit 8",
  "node scripts/evolution-review.mjs --json",
  "node scripts/project-audit.mjs --target <project> --with-readiness --with-request-smoke --with-route-smoke",
  "node scripts/sync-back-smoke.mjs",
  "node scripts/course-source-health.mjs",
  "node scripts/course-source-inventory.mjs --json",
];

const MATRIX_SOURCE_PATH = "docs/vibe-coding-capability-matrix.md";
const MATRIX_INSTALLED_PATH = "docs/shuang-skill/vibe-coding-capability-matrix.md";
const DEV_ENV_SOURCE_PATH = "docs/dev-environment.md";
const DEV_ENV_INSTALLED_PATH = "docs/shuang-skill/dev-environment.md";

if (args.help === "true") {
  console.log(`Usage:
  node scripts/vibe-workflow-coverage-check.mjs [--matrix <file>] [--readme <file>] [--quickstart <file>] [--operating-map <file>] [--dev-env <file>] [--skill-root <dir>] [--json]

Checks that the Vibe Coding capability matrix covers the end-to-end workflow,
references required skills and validation commands, and is discoverable from
README, quickstart, the operating map, and development environment docs.`);
  process.exit(0);
}

const matrixPath = resolvePath(args.matrix || defaultMatrixPath());
const readmePath = resolvePath(args.readme || "README.md");
const quickstartPath = resolvePath(args.quickstart || defaultQuickstartPath());
const operatingMapPath = resolvePath(args["operating-map"] || "docs/vibe-coding-operating-map.md");
const devEnvPath = resolvePath(args["dev-env"] || defaultDevEnvPath());
const skillRoot = resolvePath(args["skill-root"] || ".codex/skills");
const matrixRel = path.relative(root, matrixPath).split(path.sep).join("/");
const sourceMatrixMode = matrixRel === MATRIX_SOURCE_PATH || !matrixRel.endsWith(MATRIX_INSTALLED_PATH);

const report = {
  status: "pass",
  matrix: path.relative(root, matrixPath) || ".",
  readme: path.relative(root, readmePath) || ".",
  quickstart: path.relative(root, quickstartPath) || ".",
  operatingMap: path.relative(root, operatingMapPath) || ".",
  devEnvironment: path.relative(root, devEnvPath) || ".",
  skillRoot: path.relative(root, skillRoot) || ".",
  capabilities: [],
  presentCapabilities: [],
  presentSkills: [],
  presentCommands: [],
  blockers: [],
  warnings: [],
};

try {
  const matrixText = readFile(matrixPath);
  report.capabilities = parseMatrix(matrixText);
  report.presentCapabilities = unique(report.capabilities.map((row) => row.id)).sort();
  report.presentSkills = extractSkills(matrixText).sort();
  report.presentCommands = REQUIRED_COMMANDS.filter((command) => matrixText.includes(command));

  for (const capability of REQUIRED_CAPABILITIES) {
    if (!report.presentCapabilities.includes(capability)) {
      report.blockers.push(`capability matrix missing capability: ${capability}`);
    }
  }

  for (const skill of REQUIRED_SKILLS) {
    if (!report.presentSkills.includes(skill)) {
      report.blockers.push(`capability matrix missing required skill: ${skill}`);
      continue;
    }
    const skillFile = path.join(skillRoot, skill, "SKILL.md");
    if (!fs.existsSync(skillFile)) {
      report.blockers.push(`required skill missing SKILL.md: ${skill}`);
    }
  }

  for (const command of REQUIRED_COMMANDS) {
    if (!report.presentCommands.includes(command)) {
      report.blockers.push(`capability matrix missing required command: ${command}`);
    }
  }

  if (sourceMatrixMode) {
    requireMention(readmePath, MATRIX_SOURCE_PATH, "README missing capability matrix mention");
  }
  requireMention(quickstartPath, MATRIX_INSTALLED_PATH, "quickstart missing capability matrix mention");
  requireMention(operatingMapPath, MATRIX_SOURCE_PATH, "operating map missing capability matrix mention");
  requireMention(devEnvPath, "scripts/short-command-route-smoke.mjs", "dev environment missing route smoke command");
  requireMention(devEnvPath, "node scripts/shuang-skill-manager.mjs request prompt --raw", "dev environment missing manager request prompt command");
  requireMention(devEnvPath, "--with-readiness", "dev environment missing audit readiness option");
  requireMention(devEnvPath, "--with-request-smoke", "dev environment missing audit request smoke option");
  requireMention(devEnvPath, "--with-route-smoke", "dev environment missing audit route smoke option");
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

function defaultMatrixPath() {
  if (fs.existsSync(path.join(root, MATRIX_SOURCE_PATH))) return MATRIX_SOURCE_PATH;
  return MATRIX_INSTALLED_PATH;
}

function defaultQuickstartPath() {
  if (fs.existsSync(path.join(root, "docs", "new-project-quickstart.md"))) {
    return "docs/new-project-quickstart.md";
  }
  return "docs/shuang-skill/new-project-quickstart.md";
}

function defaultDevEnvPath() {
  if (fs.existsSync(path.join(root, DEV_ENV_SOURCE_PATH))) return DEV_ENV_SOURCE_PATH;
  return DEV_ENV_INSTALLED_PATH;
}

function parseMatrix(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|") || /^[-|\s:]+$/.test(trimmed)) continue;
    const cells = splitRow(trimmed);
    if (cells.length < 4) continue;
    if (cells[0] === "能力ID") continue;
    rows.push({
      id: stripMarkup(cells[0]),
      skill: cells[1],
      command: cells[2],
      scope: stripMarkup(cells[3]),
    });
  }
  return rows;
}

function splitRow(row) {
  return row
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function stripMarkup(value) {
  return value
    .replace(/`/g, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSkills(text) {
  return unique([...text.matchAll(/`(shuang-[a-z0-9-]+)`/g)].map((match) => match[1]));
}

function requireMention(file, needle, message) {
  const text = readFile(file);
  if (!text.includes(needle)) report.blockers.push(message);
}

function readFile(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`missing file: ${path.relative(root, file) || file}`);
  }
  return fs.readFileSync(file, "utf8");
}

function resolvePath(value) {
  return path.resolve(root, value);
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

function printMarkdown(out) {
  console.log("# Vibe Workflow Coverage Check");
  console.log("");
  console.log(`- Status: ${out.status}`);
  console.log(`- Capabilities: ${out.presentCapabilities.length}/${REQUIRED_CAPABILITIES.length}`);
  console.log(`- Required skills referenced: ${out.presentSkills.filter((skill) => REQUIRED_SKILLS.includes(skill)).length}/${REQUIRED_SKILLS.length}`);
  console.log(`- Required commands referenced: ${out.presentCommands.length}/${REQUIRED_COMMANDS.length}`);
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
