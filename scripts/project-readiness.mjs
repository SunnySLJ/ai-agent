#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const cwd = process.cwd();
const targetRoot = path.resolve(args.target || cwd);
const installedTarget = fs.existsSync(path.join(targetRoot, ".shuang-skill", "config.json"));
const sourceMode = !installedTarget && fs.existsSync(path.join(targetRoot, "docs", "short-command-routes.md"));

if (args.help === "true") {
  console.log(`Usage:
  node scripts/project-readiness.mjs [--target <project>] [--json]

Checks whether a source or installed project is ready for a beginner to start
with a one-line Vibe Coding request.`);
  process.exit(0);
}

const requiredFiles = [
  "scripts/project-doctor.mjs",
  "scripts/project-context-pack.mjs",
  "scripts/short-command-route-smoke.mjs",
  "scripts/validate-skills.mjs",
  "scripts/shuang-skill-manager.mjs",
];

const report = {
  status: "pass",
  targetRoot,
  installedTarget,
  sourceMode,
  checks: {},
  nextActions: nextActions(),
  blockers: [],
  warnings: [],
};

for (const rel of requiredFiles) {
  if (!exists(rel)) report.blockers.push(`missing required file: ${rel}`);
}

if (exists("scripts/project-doctor.mjs")) {
  report.checks.projectDoctor = runCheck("scripts/project-doctor.mjs");
}

if (exists("scripts/validate-skills.mjs")) {
  report.checks.validateSkills = runCheck("scripts/validate-skills.mjs", [], { parseJson: true });
}

if (exists("scripts/project-context-pack.mjs")) {
  report.checks.contextPack = runCheck("scripts/project-context-pack.mjs", ["--json"], {
    parseJson: true,
    compactJson: (json) => ({
      projectName: json.projectName,
      files: json.files?.length ?? 0,
      frameworkSignals: json.frameworkSignals || [],
    }),
  });
}

if (exists("scripts/short-command-route-smoke.mjs")) {
  report.checks.routeSmoke = runCheck("scripts/short-command-route-smoke.mjs", ["--json"], {
    parseJson: true,
    compactJson: (json) => ({
      status: json.status,
      total: json.total,
      passed: json.passed,
      failed: json.failed,
    }),
  });
}

if (sourceMode && exists("scripts/vibe-workflow-coverage-check.mjs")) {
  report.checks.vibeWorkflowCoverage = runCheck("scripts/vibe-workflow-coverage-check.mjs");
}

for (const [name, check] of Object.entries(report.checks)) {
  if (check.exitCode !== 0) report.blockers.push(`${name} failed with exit ${check.exitCode}`);
}

if (report.checks.routeSmoke?.failed > 0) {
  report.blockers.push(`route smoke failed: ${report.checks.routeSmoke.failed}/${report.checks.routeSmoke.total}`);
}

report.status = report.blockers.length ? "fail" : "pass";

if (args.json === "true") {
  console.log(JSON.stringify(report, null, 2));
} else {
  printMarkdown(report);
}

process.exit(report.status === "pass" ? 0 : 1);

function runCheck(rel, extraArgs = [], options = {}) {
  const result = spawnSync(process.execPath, [path.join(targetRoot, rel), ...extraArgs], {
    cwd: targetRoot,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  const check = { exitCode: result.status ?? 1 };
  const output = (result.stdout || result.stderr || "").trim();

  if (options.parseJson && output) {
    try {
      const json = JSON.parse(result.stdout);
      Object.assign(check, options.compactJson ? options.compactJson(json) : { json });
    } catch {
      check.output = trim(output);
    }
  } else if (check.exitCode !== 0 && output) {
    check.output = trim(output);
  }

  return check;
}

function nextActions() {
  const docsPath = installedTarget
    ? "docs/shuang-skill/getting-started-for-beginners.md"
    : "docs/getting-started-for-beginners.md";
  const startCommand = path.resolve(cwd) === targetRoot
    ? 'node scripts/shuang-skill-manager.mjs start --request "<一句话需求>"'
    : `node scripts/shuang-skill-manager.mjs start --target "${targetRoot}" --request "<一句话需求>"`;
  const drillCommand = path.resolve(cwd) === targetRoot
    ? 'node scripts/shuang-skill-manager.mjs drill --request "<一句话需求>" --json'
    : `node scripts/shuang-skill-manager.mjs drill --target "${targetRoot}" --request "<一句话需求>" --json`;
  const routeSmokeCommand = path.resolve(cwd) === targetRoot
    ? "node scripts/shuang-skill-manager.mjs route-smoke --json"
    : `node scripts/shuang-skill-manager.mjs route-smoke --target "${targetRoot}" --json`;
  const contextCommand = path.resolve(cwd) === targetRoot
    ? "node scripts/shuang-skill-manager.mjs context --json"
    : `node scripts/shuang-skill-manager.mjs context --target "${targetRoot}" --json`;
  const auditCommand = path.resolve(cwd) === targetRoot
    ? "node scripts/shuang-skill-manager.mjs system-audit --json"
    : `node scripts/shuang-skill-manager.mjs system-audit --target "${targetRoot}" --json`;

  return [
    {
      label: "跑一遍新手演练",
      command: drillCommand,
    },
    {
      label: "开始一个新需求",
      command: startCommand,
    },
    {
      label: "阅读新手入门",
      path: docsPath,
    },
    {
      label: "生成项目上下文包",
      command: contextCommand,
    },
    {
      label: "审计整套系统能力",
      command: auditCommand,
    },
    {
      label: "验证短提示词路由",
      command: routeSmokeCommand,
    },
  ];
}

function exists(rel) {
  return fs.existsSync(path.join(targetRoot, rel));
}

function printMarkdown(out) {
  console.log("# Project Readiness");
  console.log("");
  console.log(`- Status: ${out.status}`);
  console.log(`- Target: ${out.targetRoot}`);
  console.log(`- Installed target: ${out.installedTarget ? "yes" : "no"}`);
  console.log("");
  console.log("## Checks");
  console.log("");
  for (const [name, check] of Object.entries(out.checks)) {
    const status = check.exitCode === 0 ? "pass" : "fail";
    const summary = name === "routeSmoke" && Number.isFinite(check.total)
      ? ` (${check.passed}/${check.total})`
      : "";
    console.log(`- ${name}: ${status}${summary}`);
  }
  console.log("");
  console.log("## Next Actions");
  console.log("");
  for (const action of out.nextActions) {
    if (action.command) console.log(`- ${action.label}: \`${action.command}\``);
    if (action.path) console.log(`- ${action.label}: \`${action.path}\``);
  }
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

function trim(value) {
  return String(value || "").slice(0, 4000);
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
