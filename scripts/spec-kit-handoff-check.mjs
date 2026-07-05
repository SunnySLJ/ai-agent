#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const root = process.cwd();

if (args.help === "true") {
  console.log(`Usage:
  node scripts/spec-kit-handoff-check.mjs --feature <specs/00X-feature> [--json]

Checks whether a Spec-Kit feature directory is ready to hand off to shuang-tdd.`);
  process.exit(0);
}

const featureDir = resolveFeatureDir(args.feature || args._[0] || ".");
const report = analyzeFeature(featureDir);

if (args.json === "true") {
  console.log(JSON.stringify(report, null, 2));
} else {
  printMarkdown(report);
}

process.exit(report.ready ? 0 : 1);

function analyzeFeature(featureDir) {
  const blockers = [];
  const warnings = [];
  const metrics = {
    taskCount: 0,
    hasMermaid: false,
    hasGivenWhenThen: false,
  };

  if (!fs.existsSync(featureDir) || !fs.statSync(featureDir).isDirectory()) {
    blockers.push("feature directory missing");
    return buildReport(featureDir, blockers, warnings, metrics);
  }

  const spec = readOptional(path.join(featureDir, "spec.md"));
  const plan = readOptional(path.join(featureDir, "plan.md"));
  const tasks = readOptional(path.join(featureDir, "tasks.md"));

  if (!spec.exists) blockers.push("spec.md missing");
  else analyzeSpec(spec.text, blockers, warnings, metrics);

  if (!plan.exists) blockers.push("plan.md missing");
  else analyzePlan(plan.text, blockers, warnings, metrics);

  if (!tasks.exists) blockers.push("tasks.md missing");
  else analyzeTasks(tasks.text, blockers, warnings, metrics);

  return buildReport(featureDir, blockers, warnings, metrics);
}

function analyzeSpec(text, blockers, warnings, metrics) {
  metrics.hasGivenWhenThen = /\bGiven\b/i.test(text) && /\bWhen\b/i.test(text) && /\bThen\b/i.test(text);
  if (!metrics.hasGivenWhenThen) {
    blockers.push("spec.md missing Given/When/Then acceptance criteria");
  }
  if (!/\bFR-\d+\b|功能需求|Functional Requirements/i.test(text)) {
    warnings.push("spec.md has no obvious FR/functional requirement markers");
  }
  if (!/边界|非目标|MVP|scope|boundary/i.test(text)) {
    warnings.push("spec.md has no obvious boundary or non-goal section");
  }
}

function analyzePlan(text, blockers, warnings, metrics) {
  metrics.hasMermaid = /```mermaid/i.test(text);
  if (!metrics.hasMermaid) blockers.push("plan.md missing Mermaid data flow");
  if (!/^##\s+.*(?:risk|风险)/im.test(text)) blockers.push("plan.md missing risks section");
  if (!/^##\s+.*(?:file structure|文件结构|project structure)/im.test(text)) {
    warnings.push("plan.md missing file/project structure section");
  }
  if (!/^##\s+.*(?:dependenc|依赖)/im.test(text)) {
    warnings.push("plan.md missing dependencies section");
  }
  if (!/^##\s+.*(?:integration|集成)/im.test(text)) {
    warnings.push("plan.md missing integration points section");
  }
}

function analyzeTasks(text, blockers, warnings, metrics) {
  const taskLines = text
    .split(/\r?\n/)
    .filter((line) => /^\s*-\s+\[[ xX]\]\s+/.test(line));

  metrics.taskCount = taskLines.length;
  if (!taskLines.length) blockers.push("tasks.md has no checkbox tasks");
  if (taskLines.length && (taskLines.length < 12 || taskLines.length > 18)) {
    warnings.push("tasks.md task count is outside the recommended 12-18 range");
  }
  if (taskLines.length && !taskLines.some((line) => /\[(FE|BE|INT|TEST|DOC)\]/.test(line))) {
    warnings.push("tasks.md has no FE/BE/INT/TEST/DOC routing labels");
  }
  if (taskLines.length && !taskLines.every((line) => /验证|validation|test|check/i.test(line))) {
    blockers.push("tasks.md tasks missing validation evidence");
  }
  if (taskLines.length && !taskLines.every((line) => /FR-\d+|来源|AC-\d+|依赖任务|depends/i.test(line))) {
    warnings.push("tasks.md tasks are weakly traceable to FR/AC or dependencies");
  }
}

function buildReport(featureDir, blockers, warnings, metrics) {
  const ready = blockers.length === 0;
  return {
    featureDir,
    relativeFeatureDir: path.relative(root, featureDir) || ".",
    status: ready ? "ready" : "blocked",
    ready,
    blockers,
    warnings,
    metrics,
  };
}

function readOptional(file) {
  if (!fs.existsSync(file)) return { exists: false, text: "" };
  return { exists: true, text: fs.readFileSync(file, "utf8") };
}

function printMarkdown(report) {
  console.log("# Spec-Kit Handoff Check");
  console.log("");
  console.log(`- Feature: \`${report.relativeFeatureDir}\``);
  console.log(`- Status: ${report.status}`);
  console.log(`- Tasks: ${report.metrics.taskCount}`);
  console.log(`- Mermaid data flow: ${report.metrics.hasMermaid ? "yes" : "no"}`);
  console.log(`- Given/When/Then AC: ${report.metrics.hasGivenWhenThen ? "yes" : "no"}`);
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

function resolveFeatureDir(value) {
  return path.isAbsolute(value) ? value : path.join(root, value);
}

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith("--")) {
      out._.push(key);
      continue;
    }
    const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
    out[key.slice(2)] = value;
  }
  return out;
}
