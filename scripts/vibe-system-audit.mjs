#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const cwd = process.cwd();
const targetRoot = path.resolve(args.target || cwd);

if (args.help === "true") {
  console.log(`Usage:
  node scripts/vibe-system-audit.mjs [--target <project>] [--json] [--with-skill-studio] [--with-install-smoke] [--with-sync-smoke]

Aggregates the core Vibe Coding system checks into one report: skill structure,
workflow coverage, managed artifacts, beginner readiness, and evolution inbox
health. Optional flags add heavier Skill Studio, fresh install, and sync-back
smoke tests.`);
  process.exit(0);
}

const report = {
  status: "pass",
  targetRoot,
  checks: {},
  blockers: [],
  warnings: [],
  nextActions: [
    "node scripts/shuang-skill-manager.mjs drill --request \"<一句话需求>\" --json",
    "node scripts/shuang-skill-manager.mjs start --request \"<一句话需求>\"",
    "node scripts/shuang-skill-manager.mjs next --json",
    "node scripts/shuang-skill-manager.mjs context --json",
    "node scripts/shuang-skill-manager.mjs system-audit --json --with-skill-studio",
  ],
};

runCoreChecks();
runOptionalChecks();
evaluateChecks();

report.status = report.blockers.length ? "fail" : "pass";

if (args.json === "true") {
  console.log(JSON.stringify(report, null, 2));
} else {
  printMarkdown(report);
}

process.exit(report.status === "pass" ? 0 : 1);

function runCoreChecks() {
  report.checks.validateSkills = runJsonCheck("validateSkills", "scripts/validate-skills.mjs", [], (json) => ({
    activeSkills: json.activeSkills,
    archivedSkills: json.archivedSkills,
    groups: json.groups,
    errors: json.errors || [],
  }));

  report.checks.workflowCoverage = runJsonCheck("workflowCoverage", "scripts/vibe-workflow-coverage-check.mjs", ["--json"], (json) => ({
    status: json.status,
    capabilities: `${json.presentCapabilities?.length ?? 0}/${json.capabilities?.length ?? 0}`,
    requiredCommands: json.presentCommands?.length ?? null,
    blockers: json.blockers || [],
  }));

  report.checks.managedArtifacts = runJsonCheck("managedArtifacts", "scripts/managed-artifacts-check.mjs", ["--json"], (json) => ({
    status: json.status,
    managedArtifacts: json.managedArtifacts?.length ?? 0,
    managedScripts: json.managedScripts?.length ?? 0,
    blockers: json.blockers || [],
  }));

  report.checks.requirementAudit = runJsonCheck("requirementAudit", "scripts/vibe-requirement-audit-check.mjs", ["--json"], (json) => ({
    status: json.status,
    requirements: `${json.presentRequirements?.length ?? 0}/${json.requirements?.length ?? 0}`,
    requiredCommands: `${json.presentCommands?.length ?? 0}/${json.requiredCommands?.length ?? 0}`,
    blockers: json.blockers || [],
  }));

  report.checks.projectReadiness = runJsonCheck("projectReadiness", "scripts/project-readiness.mjs", ["--json"], (json) => ({
    status: json.status,
    routeSmokePassed: json.checks?.routeSmoke?.passed ?? null,
    routeSmokeTotal: json.checks?.routeSmoke?.total ?? null,
    blockers: json.blockers || [],
  }));

  report.checks.evolutionReview = runJsonCheck("evolutionReview", "scripts/evolution-review.mjs", ["--json"], (json) => ({
    status: json.status,
    ready: json.totals?.ready ?? null,
    draft: json.totals?.draft ?? null,
    promoted: json.totals?.promoted ?? null,
    actionable: json.totals?.actionable ?? null,
    blockers: json.blockers || [],
  }));
}

function runOptionalChecks() {
  if (args["with-skill-studio"] === "true") {
    report.checks.skillStudio = runJsonCheck(
      "skillStudio",
      "scripts/skill-studio-route-smoke.mjs",
      ["--json", "--timeout-ms", args["timeout-ms"] || "60000"],
      (json) => ({
        status: json.status,
        homeLaunchPad: Boolean(json.homeSignals?.projectLaunchPad),
        theaterContextHandoff: Boolean(json.theaterSignals?.contextHandoff),
        blockers: json.blockers || [],
      })
    );
  }

  if (args["with-install-smoke"] === "true") {
    report.checks.freshInstall = runProcessCheck("freshInstall", "scripts/fresh-install-smoke.mjs");
  }

  if (args["with-sync-smoke"] === "true") {
    report.checks.syncBack = runProcessCheck("syncBack", "scripts/sync-back-smoke.mjs");
  }
}

function evaluateChecks() {
  for (const [name, check] of Object.entries(report.checks)) {
    if (check.exitCode !== 0) {
      report.blockers.push(`${name} failed with exit ${check.exitCode}`);
    }
  }

  if (report.checks.validateSkills?.errors?.length) {
    report.blockers.push(`validateSkills has ${report.checks.validateSkills.errors.length} errors`);
  }

  for (const name of ["workflowCoverage", "managedArtifacts", "requirementAudit", "projectReadiness", "evolutionReview", "skillStudio"]) {
    const check = report.checks[name];
    if (check?.status && check.status !== "pass") {
      report.blockers.push(`${name} status is ${check.status}`);
    }
  }

  if (Number(report.checks.evolutionReview?.actionable || 0) > 0) {
    report.blockers.push(`evolution inbox has ${report.checks.evolutionReview.actionable} actionable candidates`);
  }
}

function runJsonCheck(name, relScript, extraArgs = [], compact = (json) => ({ json })) {
  const result = runScript(relScript, extraArgs);
  const check = { exitCode: result.status ?? 1 };
  const output = (result.stdout || result.stderr || "").trim();

  if (!fs.existsSync(path.join(targetRoot, relScript))) {
    check.missing = relScript;
    return check;
  }

  if (output) {
    try {
      Object.assign(check, compact(JSON.parse(result.stdout)));
    } catch {
      check.output = trimOutput(output);
    }
  }

  if (check.exitCode !== 0 && check.output === undefined && output) {
    check.output = trimOutput(output);
  }
  return check;
}

function runProcessCheck(name, relScript, extraArgs = []) {
  if (!fs.existsSync(path.join(targetRoot, relScript))) {
    return { exitCode: 1, missing: relScript };
  }
  const result = runScript(relScript, extraArgs);
  const output = (result.stdout || result.stderr || "").trim();
  return {
    exitCode: result.status ?? 1,
    output: output ? trimOutput(output) : "",
  };
}

function runScript(relScript, extraArgs = []) {
  const script = path.join(targetRoot, relScript);
  if (!fs.existsSync(script)) {
    return { status: 1, stdout: "", stderr: `missing ${relScript}` };
  }
  return spawnSync(process.execPath, [script, ...extraArgs], {
    cwd: targetRoot,
    encoding: "utf8",
    maxBuffer: 30 * 1024 * 1024,
  });
}

function printMarkdown(out) {
  console.log("# Vibe System Audit");
  console.log("");
  console.log(`- Status: ${out.status}`);
  console.log(`- Target: \`${out.targetRoot}\``);
  console.log("");
  console.log("## Checks");
  console.log("");
  for (const [name, check] of Object.entries(out.checks)) {
    const status = check.exitCode === 0 && (!check.status || check.status === "pass") ? "pass" : "fail";
    console.log(`- ${name}: ${status}`);
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
  console.log("## Next Actions");
  console.log("");
  for (const action of out.nextActions) {
    console.log(`- \`${action}\``);
  }
}

function trimOutput(value) {
  const text = String(value || "").trim();
  return text.length > 6000 ? `${text.slice(0, 6000)}\n...<truncated>` : text;
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
