#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const cwd = process.cwd();
const CONFIG_FILE = ".shuang-skill/config.json";

const REQUIRED_FILES = [
  "AGENTS.md",
  "CLAUDE.md",
  ".shuang-skill/config.json",
  ".codex/skills/shuang-flow/SKILL.md",
  ".codex/skills/shuang-evolve/SKILL.md",
  ".claude/skills/shuang-flow/SKILL.md",
  ".claude/skills/shuang-evolve/SKILL.md",
  "docs/vibe-coding-operating-map.md",
  "docs/shuang-skill/new-project-quickstart.md",
  "docs/shuang-skill/vibe-coding-capability-matrix.md",
  "docs/shuang-skill/vibe-system-requirement-audit.md",
  "docs/shuang-skill/short-command-routes.md",
  "docs/skill-evolution/inbox",
  "scripts/project-audit.mjs",
  "scripts/project-readiness.mjs",
  "scripts/project-context-pack.mjs",
  "scripts/project-start.mjs",
  "scripts/beginner-drill.mjs",
  "scripts/short-command-route-smoke.mjs",
  "scripts/vibe-request-start.mjs",
  "scripts/evolution-review.mjs",
  "scripts/vibe-requirement-audit-check.mjs",
  "scripts/project-doctor.mjs",
  "scripts/validate-skills.mjs",
  "scripts/shuang-skill-manager.mjs",
];

if (isTrue(args.help)) {
  printHelp();
  process.exit(0);
}

const report = {
  status: "pass",
  sourceRoot: resolveSourceRoot(),
  targets: collectTargets(),
  projects: [],
  blockers: [],
  warnings: [],
};

try {
  if (!report.targets.length) {
    report.blockers.push("no targets provided; pass --target <project> or --targets <a,b>");
    finish();
  }

  for (const target of report.targets) {
    const project = auditProject(target);
    report.projects.push(project);
    for (const blocker of project.blockers) {
      report.blockers.push(`${project.targetRoot}: ${blocker}`);
    }
    for (const warning of project.warnings) {
      report.warnings.push(`${project.targetRoot}: ${warning}`);
    }
  }
} catch (error) {
  report.blockers.push(error.message);
}

finish();

function auditProject(target) {
  const targetRoot = path.resolve(target);
  const project = {
    targetRoot,
    status: "pass",
    config: null,
    checks: {
      config: null,
      requiredFiles: {},
      projectDoctor: null,
      validateSkills: null,
      hooks: null,
      readiness: null,
      startSmoke: null,
      requestSmoke: null,
      routeSmoke: null,
      gitStatus: null,
    },
    blockers: [],
    warnings: [],
  };

  if (!fs.existsSync(targetRoot)) {
    project.blockers.push(`target root does not exist: ${targetRoot}`);
    return finalizeProject(project);
  }

  auditConfig(project);
  auditRequiredFiles(project);
  auditGitStatus(project);
  auditCommand(project, "projectDoctor", ["scripts/project-doctor.mjs"], "target project-doctor failed");
  auditCommand(project, "validateSkills", ["scripts/validate-skills.mjs"], "target validate-skills failed");
  auditHooks(project);
  if (isTrue(args["with-readiness"])) auditReadiness(project);
  if (isTrue(args["with-start-smoke"])) auditStartSmoke(project);
  if (isTrue(args["with-request-smoke"])) auditRequestSmoke(project);
  if (isTrue(args["with-route-smoke"])) auditRouteSmoke(project);

  return finalizeProject(project);
}

function auditConfig(project) {
  const file = path.join(project.targetRoot, CONFIG_FILE);
  if (!fs.existsSync(file)) {
    project.checks.config = { status: "fail", path: CONFIG_FILE };
    project.blockers.push(`missing required file: ${CONFIG_FILE}`);
    return;
  }
  try {
    const config = JSON.parse(fs.readFileSync(file, "utf8"));
    project.config = config;
    project.checks.config = { status: "pass", path: CONFIG_FILE, sourceRoot: config.sourceRoot || null };
    if (report.sourceRoot && config.sourceRoot && path.resolve(config.sourceRoot) !== path.resolve(report.sourceRoot)) {
      project.warnings.push(`config sourceRoot differs from audit source: ${config.sourceRoot}`);
    }
  } catch (error) {
    project.checks.config = { status: "fail", path: CONFIG_FILE, error: error.message };
    project.blockers.push(`invalid ${CONFIG_FILE}: ${error.message}`);
  }
}

function auditRequiredFiles(project) {
  for (const rel of REQUIRED_FILES) {
    const exists = fs.existsSync(path.join(project.targetRoot, rel));
    project.checks.requiredFiles[rel] = exists ? "pass" : "fail";
    if (!exists) project.blockers.push(`missing required file: ${rel}`);
  }
}

function auditGitStatus(project) {
  if (!fs.existsSync(path.join(project.targetRoot, ".git"))) {
    project.checks.gitStatus = { exitCode: null, dirty: null, stdout: "", stderr: "" };
    project.warnings.push("target is not a git worktree");
    return;
  }
  const result = run(["git", "status", "--short"], project.targetRoot);
  project.checks.gitStatus = {
    exitCode: result.status,
    dirty: !!(result.stdout || "").trim(),
    stdout: trimOutput(result.stdout || ""),
    stderr: trimOutput(result.stderr || ""),
  };
  if (result.status !== 0) {
    project.warnings.push("git status failed");
  } else if (project.checks.gitStatus.dirty) {
    project.warnings.push("git worktree has local changes");
  }
}

function auditCommand(project, key, argv, failureMessage) {
  const scriptPath = path.join(project.targetRoot, argv[0]);
  if (!fs.existsSync(scriptPath)) {
    project.checks[key] = { exitCode: null, stdout: "", stderr: "", skipped: true };
    return;
  }
  const result = run([process.execPath, ...argv], project.targetRoot);
  project.checks[key] = summarizeProcess(result);
  if (result.status !== 0) project.blockers.push(failureMessage);
}

function auditHooks(project) {
  const manager = path.join(project.targetRoot, "scripts", "shuang-skill-manager.mjs");
  if (!fs.existsSync(manager)) {
    project.checks.hooks = { exitCode: null, stdout: "", stderr: "", skipped: true };
    return;
  }
  const result = run([process.execPath, "scripts/shuang-skill-manager.mjs", "hooks", "status"], project.targetRoot);
  const hookCheck = summarizeProcess(result);
  hookCheck.managedHookActive = /\[PASS\] managed pre-push hook/.test(result.stdout || "");
  hookCheck.hookTemplateExists = /\[PASS\] hook template/.test(result.stdout || "");
  project.checks.hooks = hookCheck;
  if (result.status !== 0) {
    project.warnings.push("hook status command failed");
    return;
  }
  if (!hookCheck.managedHookActive) project.warnings.push("managed pre-push hook is not active");
  if (!hookCheck.hookTemplateExists) {
    project.warnings.push("managed hook template is not present; run node scripts/shuang-skill-manager.mjs hooks template");
  }
}

function auditStartSmoke(project) {
  const script = path.join(project.targetRoot, "scripts", "project-start.mjs");
  if (!fs.existsSync(script)) {
    project.checks.startSmoke = { exitCode: null, stdout: "", stderr: "", skipped: true };
    project.blockers.push("start smoke cannot run without scripts/project-start.mjs");
    return;
  }
  const result = run([
    process.execPath,
    "scripts/project-start.mjs",
    "--request",
    "审计烟测",
    "--title",
    "audit smoke",
    "--date",
    "2099-01-01",
    "--out-dir",
    ".shuang-skill/tmp-audit",
    "--force",
    "--skip-install",
    "--json",
  ], project.targetRoot);
  const check = summarizeProcess(result);
  const json = parseJson(result.stdout);
  if (json) {
    check.file = json.file || null;
    check.stage = json.stage || null;
    check.skill = json.skill || null;
    check.prompt = json.prompt || null;
  }
  project.checks.startSmoke = check;
  if (result.status !== 0) project.blockers.push("project-start smoke failed");
}

function auditRequestSmoke(project) {
  const manager = path.join(project.targetRoot, "scripts", "shuang-skill-manager.mjs");
  const requestStart = path.join(project.targetRoot, "scripts", "vibe-request-start.mjs");
  if (!fs.existsSync(manager)) {
    project.checks.requestSmoke = { exitCode: null, stdout: "", stderr: "", skipped: true };
    project.blockers.push("request smoke cannot run without scripts/shuang-skill-manager.mjs");
    return;
  }
  if (!fs.existsSync(requestStart)) {
    project.checks.requestSmoke = { exitCode: null, stdout: "", stderr: "", skipped: true };
    project.blockers.push("request smoke cannot run without scripts/vibe-request-start.mjs");
    return;
  }

  const outDir = ".shuang-skill/tmp-audit-request";
  const create = run([
    process.execPath,
    "scripts/vibe-request-start.mjs",
    "--request",
    "审计请求队列烟测",
    "--title",
    "audit request smoke",
    "--date",
    "2099-01-03",
    "--out-dir",
    outDir,
    "--force",
    "--json",
  ], project.targetRoot);
  const createJson = parseJson(create.stdout);

  const prompt = run([
    process.execPath,
    "scripts/shuang-skill-manager.mjs",
    "request",
    "prompt",
    "--dir",
    outDir,
    "--raw",
  ], project.targetRoot);
  const next = run([
    process.execPath,
    "scripts/shuang-skill-manager.mjs",
    "next",
    "--dir",
    outDir,
    "--json",
  ], project.targetRoot);
  const nextJson = parseJson(next.stdout);

  const check = summarizeProcess(prompt);
  check.createExitCode = create.status;
  check.file = createJson?.file || null;
  check.stage = createJson?.stage || null;
  check.skill = createJson?.skill || null;
  check.prompt = trimOutput(prompt.stdout || "");
  check.nextExitCode = next.status;
  check.nextLatestRequest = nextJson?.latestRequest || null;
  check.nextPrompt = trimOutput(nextJson?.nextPrompt || "");
  project.checks.requestSmoke = check;

  if (create.status !== 0) project.blockers.push("request smoke intake creation failed");
  if (prompt.status !== 0) project.blockers.push("request smoke prompt extraction failed");
  if (next.status !== 0) project.blockers.push("request smoke next failed");
}

function auditReadiness(project) {
  const script = path.join(project.targetRoot, "scripts", "project-readiness.mjs");
  if (!fs.existsSync(script)) {
    project.checks.readiness = { exitCode: null, stdout: "", stderr: "", skipped: true };
    project.blockers.push("readiness cannot run without scripts/project-readiness.mjs");
    return;
  }
  const result = run([
    process.execPath,
    "scripts/project-readiness.mjs",
    "--json",
  ], project.targetRoot);
  const check = summarizeProcess(result);
  const json = parseJson(result.stdout);
  if (json) {
    check.status = json.status || null;
    check.routeSmokePassed = json.checks?.routeSmoke?.passed ?? null;
    check.routeSmokeTotal = json.checks?.routeSmoke?.total ?? null;
    check.blockers = Array.isArray(json.blockers) ? json.blockers : [];
    check.warnings = Array.isArray(json.warnings) ? json.warnings : [];
  }
  project.checks.readiness = check;
  if (result.status !== 0 || check.status === "fail") {
    project.blockers.push("project-readiness failed");
  }
}

function auditRouteSmoke(project) {
  const script = path.join(project.targetRoot, "scripts", "short-command-route-smoke.mjs");
  if (!fs.existsSync(script)) {
    project.checks.routeSmoke = { exitCode: null, stdout: "", stderr: "", skipped: true };
    project.blockers.push("route smoke cannot run without scripts/short-command-route-smoke.mjs");
    return;
  }
  const result = run([
    process.execPath,
    "scripts/short-command-route-smoke.mjs",
    "--date",
    "2099-01-02",
    "--out-dir",
    ".shuang-skill/tmp-route-smoke",
    "--json",
  ], project.targetRoot);
  const check = summarizeProcess(result);
  const json = parseJson(result.stdout);
  if (json) {
    check.total = json.total ?? null;
    check.passed = json.passed ?? null;
    check.failed = json.failed ?? null;
  }
  project.checks.routeSmoke = check;
  if (result.status !== 0) project.blockers.push("short command route smoke failed");
}

function finalizeProject(project) {
  project.status = project.blockers.length ? "fail" : "pass";
  return project;
}

function resolveSourceRoot() {
  if (args.source) return path.resolve(args.source);
  const config = readConfig(cwd);
  if (config?.sourceRoot) return path.resolve(config.sourceRoot);
  if (isSourceRoot(cwd)) return cwd;
  return null;
}

function collectTargets() {
  const targets = [];
  for (const value of args.target || []) targets.push(value);
  for (const value of args.targets || []) {
    for (const item of String(value).split(",")) {
      if (item.trim()) targets.push(item.trim());
    }
  }
  if (!targets.length && readConfig(cwd)) targets.push(cwd);
  return unique(targets).map((target) => path.resolve(target));
}

function run(command, root) {
  const [cmd, ...argv] = command;
  return spawnSync(cmd, argv, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
}

function summarizeProcess(result) {
  const includeOutput = isTrue(args["include-output"]) || result.status !== 0;
  return {
    exitCode: result.status,
    stdout: includeOutput ? trimOutput(result.stdout || "") : "",
    stderr: includeOutput ? trimOutput(result.stderr || "") : "",
  };
}

function parseJson(stdout) {
  const text = String(stdout || "").trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function trimOutput(value) {
  const text = String(value || "").trim();
  return text.length > 8000 ? `${text.slice(0, 8000)}\n...<truncated>` : text;
}

function readConfig(root) {
  const file = path.join(root, CONFIG_FILE);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function isSourceRoot(root) {
  return fs.existsSync(path.join(root, ".codex", "skills"))
    && fs.existsSync(path.join(root, "scripts", "shuang-skill-manager.mjs"));
}

function finish() {
  report.status = report.blockers.length ? "fail" : "pass";
  if (isTrue(args.json)) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printMarkdown(report);
  }
  process.exit(report.blockers.length ? 1 : 0);
}

function printMarkdown(out) {
  console.log("# Project Audit");
  console.log("");
  console.log(`- Status: ${out.status}`);
  if (out.sourceRoot) console.log(`- Source: \`${out.sourceRoot}\``);
  console.log(`- Projects: ${out.projects.length}`);
  console.log("");
  console.log("## Projects");
  console.log("");
  if (!out.projects.length) {
    console.log("- none");
  } else {
    for (const project of out.projects) {
      console.log(`- ${project.status}: \`${project.targetRoot}\``);
      console.log(`  - project-doctor: ${formatExit(project.checks.projectDoctor)}`);
      console.log(`  - validate-skills: ${formatExit(project.checks.validateSkills)}`);
      console.log(`  - hooks: ${formatExit(project.checks.hooks)}`);
      if (project.checks.readiness) console.log(`  - readiness: ${formatExit(project.checks.readiness)}`);
      if (project.checks.startSmoke) console.log(`  - start-smoke: ${formatExit(project.checks.startSmoke)}`);
      if (project.checks.requestSmoke) console.log(`  - request-smoke: ${formatExit(project.checks.requestSmoke)}`);
      if (project.checks.routeSmoke) console.log(`  - route-smoke: ${formatExit(project.checks.routeSmoke)}`);
      if (project.blockers.length) console.log(`  - blockers: ${project.blockers.length}`);
      if (project.warnings.length) console.log(`  - warnings: ${project.warnings.length}`);
    }
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

function formatExit(check) {
  if (!check) return "not run";
  if (check.skipped) return "skipped";
  if (check.exitCode === null || check.exitCode === undefined) return "not run";
  return `exit ${check.exitCode}`;
}

function printHelp() {
  console.log(`Usage:
  node scripts/project-audit.mjs --target <project> [--target <project2>] [--with-readiness] [--with-start-smoke] [--with-request-smoke] [--with-route-smoke] [--json] [--include-output]
  node scripts/project-audit.mjs --targets "/path/a,/path/b" [--with-readiness] [--with-start-smoke] [--with-request-smoke] [--with-route-smoke] [--json] [--include-output]

Audits installed shuang-skill projects by checking required managed files,
target project-doctor, validate-skills, hook status, optional beginner readiness,
optional project-start smoke, optional request queue smoke, optional short-command
route smoke, and local git dirtiness. Missing hook activation is a warning because
managed hooks are explicit opt-in. Successful command stdout/stderr is omitted by
default; pass --include-output for raw logs.`);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith("--")) continue;
    const name = key.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
    if (name === "target" || name === "targets") {
      out[name] ??= [];
      out[name].push(value);
    } else {
      out[name] = value;
    }
  }
  return out;
}

function isTrue(value) {
  return value === true || value === "true";
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}
