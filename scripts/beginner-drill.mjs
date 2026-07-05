#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const root = process.cwd();
const request = String(args.request || "我是新手，帮我加一个新功能，按 Vibe Coding 流程走。").trim();
const title = String(args.title || "beginner drill").trim();
const date = String(args.date || "2099-01-04").trim();
const outDir = String(args["out-dir"] || ".shuang-skill/tmp-beginner-drill").trim();
const temporaryTarget = !args.target;
const targetRoot = temporaryTarget
  ? fs.mkdtempSync(path.join(os.tmpdir(), "shuang-skill-beginner-drill-"))
  : path.resolve(args.target);
const keep = args.keep === "true" || !temporaryTarget;

if (args.help === "true") {
  console.log(`Usage:
  node scripts/beginner-drill.mjs [--target <project>] [--request <short requirement>] [--title <title>] [--date YYYY-MM-DD] [--out-dir <dir>] [--json|--raw] [--keep]

Runs a beginner-facing end-to-end drill: install/update skills, readiness,
one-line start, request prompt extraction, context pack, and system audit.`);
  process.exit(0);
}

const report = {
  status: "pass",
  targetRoot,
  temporaryTarget,
  keptTarget: keep,
  request,
  title,
  date,
  outDir,
  steps: {
    install: null,
    readiness: null,
    start: null,
    requestPrompt: null,
    context: null,
    systemAudit: null,
  },
  start: {},
  context: {},
  systemAudit: {},
  prompt: null,
  probes: {},
  blockers: [],
  warnings: [],
  nextActions: [],
};

try {
  ensureTarget(targetRoot);

  const install = runManager(["install", "--target", targetRoot, "--source", root]);
  report.steps.install = summarizeProcess(install);
  if (install.status !== 0) report.blockers.push("install failed");

  const readiness = runManager(["readiness", "--target", targetRoot, "--json"]);
  report.steps.readiness = summarizeProcess(readiness);
  const readinessJson = parseJson(readiness.stdout, "readiness");
  if (readiness.status !== 0) report.blockers.push("readiness failed");

  const start = runManager([
    "start",
    "--target",
    targetRoot,
    "--request",
    request,
    "--title",
    title,
    "--date",
    date,
    "--out-dir",
    outDir,
    "--force",
    "--json",
  ]);
  report.steps.start = summarizeProcess(start);
  const startJson = parseJson(start.stdout, "start");
  if (startJson) {
    report.start = {
      file: startJson.file || null,
      stage: startJson.stage || null,
      skill: startJson.skill || null,
    };
    report.prompt = startJson.prompt || report.prompt;
  }
  if (start.status !== 0) report.blockers.push("start failed");

  const requestPrompt = runManager(["request", "prompt", "--target", targetRoot, "--dir", outDir, "--raw"]);
  report.steps.requestPrompt = summarizeProcess(requestPrompt);
  const promptText = String(requestPrompt.stdout || "").trim();
  if (promptText) report.prompt = promptText;
  if (requestPrompt.status !== 0) report.blockers.push("request prompt extraction failed");

  const context = runManager(["context", "--target", targetRoot, "--json"]);
  report.steps.context = summarizeProcess(context);
  const contextJson = parseJson(context.stdout, "context");
  if (contextJson) {
    report.context = {
      projectName: contextJson.projectName || null,
      files: Array.isArray(contextJson.files) ? contextJson.files.length : 0,
      frameworkSignals: contextJson.frameworkSignals || [],
    };
  }
  if (context.status !== 0) report.blockers.push("context pack failed");

  const systemAudit = runManager(["system-audit", "--target", targetRoot, "--json"]);
  report.steps.systemAudit = summarizeProcess(systemAudit);
  const systemAuditJson = parseJson(systemAudit.stdout, "system-audit");
  if (systemAuditJson) {
    report.systemAudit = {
      status: systemAuditJson.status || null,
      blockers: systemAuditJson.blockers || [],
    };
  }
  if (systemAudit.status !== 0) report.blockers.push("system audit failed");

  report.probes = {
    codexSkill: exists(targetRoot, ".codex/skills/shuang-flow/SKILL.md"),
    claudeSkill: exists(targetRoot, ".claude/skills/shuang-flow/SKILL.md"),
    readinessPass: readinessJson?.status === "pass",
    startPromptPresent: Boolean(startJson?.prompt || promptText),
    requestPromptMatchesStartPrompt: Boolean(startJson?.prompt && promptText && startJson.prompt.trim() === promptText),
    contextHasFiles: Number(report.context.files || 0) > 0,
    systemAuditPass: report.systemAudit.status === "pass",
  };

  for (const [name, ok] of Object.entries(report.probes)) {
    if (!ok) report.blockers.push(`probe failed: ${name}`);
  }

  report.nextActions = keep
    ? [
        `cd "${targetRoot}"`,
        `node scripts/shuang-skill-manager.mjs start --request "<一句话需求>"`,
        `node scripts/shuang-skill-manager.mjs request prompt --raw`,
        `node scripts/shuang-skill-manager.mjs system-audit --json`,
      ]
    : [
        "node scripts/shuang-skill-manager.mjs drill --keep --json",
        "node scripts/shuang-skill-manager.mjs drill --target /path/to/project --request \"<一句话需求>\" --json",
      ];
} catch (error) {
  report.blockers.push(error.message);
} finally {
  report.status = report.blockers.length ? "fail" : "pass";
  if (!keep) {
    fs.rmSync(targetRoot, { recursive: true, force: true });
  }
}

if (args.raw === "true") {
  if (report.prompt) console.log(report.prompt);
  else if (report.blockers.length) console.error(report.blockers.join("\n"));
} else if (args.json === "true") {
  console.log(JSON.stringify(report, null, 2));
} else {
  printMarkdown(report);
}

process.exit(report.status === "pass" ? 0 : 1);

function ensureTarget(dir) {
  fs.mkdirSync(dir, { recursive: true });
  const readme = path.join(dir, "README.md");
  if (!fs.existsSync(readme)) {
    fs.writeFileSync(readme, "# Beginner Drill Playground\n", "utf8");
  }
}

function runManager(argv) {
  return spawnSync(process.execPath, [
    path.join(root, "scripts", "shuang-skill-manager.mjs"),
    ...argv,
  ], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 40 * 1024 * 1024,
  });
}

function summarizeProcess(result) {
  return {
    exitCode: result.status ?? 1,
    stdout: trimOutput(result.stdout || ""),
    stderr: trimOutput(result.stderr || ""),
  };
}

function parseJson(stdout, label) {
  const text = String(stdout || "").trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    report.warnings.push(`could not parse ${label} JSON: ${error.message}`);
    return null;
  }
}

function exists(base, rel) {
  return fs.existsSync(path.join(base, rel));
}

function trimOutput(value) {
  const text = String(value || "").trim();
  return text.length > 8000 ? `${text.slice(0, 8000)}\n...<truncated>` : text;
}

function printMarkdown(out) {
  console.log("# Beginner Drill");
  console.log("");
  console.log(`- Status: ${out.status}`);
  console.log(`- Target: \`${out.targetRoot}\``);
  console.log(`- Temporary target: ${out.temporaryTarget ? "yes" : "no"}`);
  console.log(`- Kept target: ${out.keptTarget ? "yes" : "no"}`);
  console.log(`- Request file: ${out.start.file ? `\`${out.start.file}\`` : "none"}`);
  if (out.start.stage) console.log(`- Stage: \`${out.start.stage}\``);
  if (out.start.skill) console.log(`- Skill: \`${out.start.skill}\``);
  console.log("");
  console.log("## Prompt");
  console.log("");
  if (out.prompt) {
    console.log("```text");
    console.log(out.prompt);
    console.log("```");
  } else {
    console.log("- none");
  }
  console.log("");
  console.log("## Steps");
  console.log("");
  for (const [name, step] of Object.entries(out.steps)) {
    console.log(`- ${name}: exit ${step?.exitCode ?? "n/a"}`);
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
  for (const action of out.nextActions) console.log(`- \`${action}\``);
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
