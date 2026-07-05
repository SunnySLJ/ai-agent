#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const REQUIRED_STAGES = [
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
  "course",
  "install-sync",
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

const args = parseArgs(process.argv.slice(2));
const root = process.cwd();
const routesPath = path.resolve(args.routes || defaultRoutePath());
const readmePath = args.readme ? path.resolve(args.readme) : defaultReadmePath();
const quickstartPath = path.resolve(args.quickstart || defaultQuickstartPath());
const flowPath = path.resolve(args.flow || defaultSkillPath("shuang-flow"));
const evolvePath = path.resolve(args.evolve || defaultSkillPath("shuang-evolve"));
const promptPath = path.resolve(args.prompt || defaultSkillPath("shuang-prompt"));
const intakePath = path.resolve(args.intake || defaultIntakePath());

if (args.help === "true") {
  console.log(`Usage:
  node scripts/short-command-route-check.mjs [--routes <file>] [--readme <file>] [--quickstart <file>] [--flow <file>] [--evolve <file>] [--prompt <file>] [--intake <file>] [--json]

Checks that the short-command route catalog covers the core Vibe Coding stages,
and that README/quickstart docs, shuang-flow/shuang-evolve/shuang-prompt, and
the intake generator point to it and its dynamic route smoke.`);
  process.exit(0);
}

const report = {
  status: "pass",
  routesFile: routesPath,
  readme: readmePath,
  quickstart: quickstartPath,
  flowSkill: flowPath,
  evolveSkill: evolvePath,
  promptSkill: promptPath,
  intakeScript: intakePath,
  routes: [],
  presentStages: [],
  presentSkills: [],
  blockers: [],
  warnings: [],
};

try {
  const routesText = readFile(routesPath, "route catalog");
  const readmeText = readOptionalFile(readmePath);
  const quickstartText = readFile(quickstartPath, "quickstart");
  const flowText = readFile(flowPath, "shuang-flow");
  const evolveText = readFile(evolvePath, "shuang-evolve");
  const promptText = readFile(promptPath, "shuang-prompt");
  const intakeText = readFile(intakePath, "create-feature-intake");

  report.routes = parseRoutes(routesText);
  report.presentStages = unique(report.routes.map((route) => route.stageId)).sort();
  report.presentSkills = unique(report.routes.flatMap((route) => route.skills)).sort();

  if (!report.routes.length) {
    report.blockers.push("route catalog has no parseable route table");
  }

  for (const stage of REQUIRED_STAGES) {
    if (!report.presentStages.includes(stage)) {
      report.blockers.push(`route catalog missing stage: ${stage}`);
    }
  }

  for (const skill of REQUIRED_SKILLS) {
    if (!report.presentSkills.includes(skill)) {
      report.blockers.push(`route catalog missing required skill: ${skill}`);
    }
  }

  for (const route of report.routes) {
    const label = route.stageId || route.shortCommand || "unknown route";
    if (!route.stageId) report.blockers.push(`route row missing stage id: ${label}`);
    if (!route.shortCommand) report.blockers.push(`route row missing short command: ${label}`);
    if (!route.skills.length) report.blockers.push(`route row missing entry skill: ${label}`);
    if (!route.nextTrigger) report.blockers.push(`route row missing next trigger: ${label}`);
    if (!route.stopGate) report.blockers.push(`route row missing stop gate: ${label}`);
  }

  if (!/short-command-routes\.md/.test(quickstartText)) {
    report.blockers.push("quickstart missing route catalog mention");
  }
  if (!/scripts\/short-command-route-check\.mjs/.test(quickstartText)) {
    report.blockers.push("quickstart missing route check command");
  }
  if (!/scripts\/short-command-route-smoke\.mjs/.test(routesText)) {
    report.blockers.push("route catalog missing route smoke command");
  }
  if (readmeText) {
    if (!/scripts\/short-command-route-smoke\.mjs/.test(readmeText)) {
      report.blockers.push("README missing route smoke command");
    }
    if (!/--with-route-smoke/.test(readmeText)) {
      report.blockers.push("README missing audit route smoke option");
    }
  }
  if (!/scripts\/short-command-route-smoke\.mjs/.test(quickstartText)) {
    report.blockers.push("quickstart missing route smoke command");
  }

  if (!/短提示词展开规则/.test(flowText)) {
    report.blockers.push("shuang-flow missing short prompt expansion rule");
  }
  if (!/阶段门输出格式/.test(flowText)) {
    report.blockers.push("shuang-flow missing stage gate output contract");
  }
  if (!/short-command-routes\.md/.test(flowText)) {
    report.blockers.push("shuang-flow missing route catalog mention");
  }
  if (!/scripts\/short-command-route-smoke\.mjs/.test(flowText)) {
    report.blockers.push("shuang-flow missing route smoke command");
  }

  if (!/scripts\/short-command-route-smoke\.mjs/.test(evolveText)) {
    report.blockers.push("shuang-evolve missing route smoke validation command");
  }

  if (!/短命令意图卡/.test(promptText)) {
    report.blockers.push("shuang-prompt missing short command intent card rule");
  }
  if (!/上下文预算/.test(promptText) || !/不把长文档全文塞进提示词/.test(promptText)) {
    report.blockers.push("shuang-prompt missing context budget rule");
  }
  if (!/short-command-routes\.md/.test(promptText)) {
    report.blockers.push("shuang-prompt missing route catalog mention");
  }
  if (!/scripts\/short-command-route-smoke\.mjs/.test(promptText)) {
    report.blockers.push("shuang-prompt missing route smoke command");
  }

  for (const stage of REQUIRED_STAGES) {
    if (!hasRouteStage(intakeText, stage)) {
      report.blockers.push(`create-feature-intake missing route stage: ${stage}`);
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

function parseRoutes(text) {
  const lines = text.split(/\r?\n/);
  const routes = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (!isTableLine(lines[i]) || !/阶段ID/.test(lines[i]) || !/入口 skill/.test(lines[i])) continue;
    const headers = splitCells(lines[i]);
    const stageIndex = headers.indexOf("阶段ID");
    const commandIndex = headers.indexOf("短提示词");
    const skillIndex = headers.indexOf("入口 skill");
    const nextIndex = headers.indexOf("下一触发");
    const stopIndex = headers.indexOf("停止点");
    for (let j = i + 2; j < lines.length; j += 1) {
      if (!isTableLine(lines[j])) break;
      if (isSeparatorLine(lines[j])) continue;
      const cells = splitCells(lines[j]);
      const stageId = normalizeStage(cells[stageIndex]);
      routes.push({
        stageId,
        shortCommand: cleanCell(cells[commandIndex]),
        skills: extractSkills(cells[skillIndex]),
        nextTrigger: cleanCell(cells[nextIndex]),
        stopGate: cleanCell(cells[stopIndex]),
      });
    }
    break;
  }
  return routes;
}

function splitCells(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cleanCell(cell));
}

function cleanCell(value) {
  return String(value || "").replace(/<br\s*\/?>/gi, " ").replace(/\s+/g, " ").trim();
}

function normalizeStage(value) {
  return cleanCell(value).toLowerCase().replace(/`/g, "");
}

function extractSkills(value) {
  return unique([...String(value || "").matchAll(/\b(?:shuang|speckit)-[a-z0-9-]+\b/g)].map((match) => match[0]));
}

function isTableLine(line) {
  return /^\s*\|.*\|\s*$/.test(line);
}

function isSeparatorLine(line) {
  return /^\s*\|[\s:|\-]+\|\s*$/.test(line);
}

function readFile(file, label) {
  if (!fs.existsSync(file)) {
    throw new Error(`missing ${label}: ${path.relative(root, file)}`);
  }
  return fs.readFileSync(file, "utf8");
}

function readOptionalFile(file) {
  if (!file || !fs.existsSync(file)) return "";
  return fs.readFileSync(file, "utf8");
}

function defaultReadmePath() {
  const sourcePath = path.join(root, "README.md");
  const installedTarget = fs.existsSync(path.join(root, ".shuang-skill", "config.json"));
  if (installedTarget) return null;
  if (fs.existsSync(sourcePath)) return sourcePath;
  return null;
}

function defaultRoutePath() {
  const sourcePath = path.join(root, "docs", "short-command-routes.md");
  const installedPath = path.join(root, "docs", "shuang-skill", "short-command-routes.md");
  if (fs.existsSync(sourcePath)) return sourcePath;
  return installedPath;
}

function defaultQuickstartPath() {
  const sourcePath = path.join(root, "docs", "new-project-quickstart.md");
  const installedPath = path.join(root, "docs", "shuang-skill", "new-project-quickstart.md");
  if (fs.existsSync(sourcePath)) return sourcePath;
  return installedPath;
}

function defaultSkillPath(skillName) {
  const codexPath = path.join(root, ".codex", "skills", skillName, "SKILL.md");
  const claudePath = path.join(root, ".claude", "skills", skillName, "SKILL.md");
  if (fs.existsSync(codexPath)) return codexPath;
  return claudePath;
}

function defaultIntakePath() {
  return path.join(root, "scripts", "create-feature-intake.mjs");
}

function hasRouteStage(text, stage) {
  const escaped = escapeRegExp(stage);
  return new RegExp(`(?:^|\\n)\\s*(?:["']${escaped}["']|${escaped})\\s*:`, "m").test(text);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function printMarkdown(out) {
  console.log("# Short Command Route Check");
  console.log("");
  console.log(`- Status: ${out.status}`);
  console.log(`- Routes: ${out.routes.length}`);
  console.log(`- Stages: ${out.presentStages.length}/${REQUIRED_STAGES.length}`);
  console.log(`- Required skills: ${REQUIRED_SKILLS.filter((skill) => out.presentSkills.includes(skill)).length}/${REQUIRED_SKILLS.length}`);
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
