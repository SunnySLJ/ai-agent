#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const cwd = process.cwd();
const CONFIG_FILE = ".shuang-skill/config.json";

if (isTrue(args.help)) {
  printHelp();
  process.exit(0);
}

const report = {
  status: "pass",
  targetRoot: null,
  sourceRoot: null,
  file: args.file || null,
  stage: null,
  skill: null,
  prompt: null,
  steps: {
    install: null,
    projectDoctor: null,
    requestStart: null,
  },
  blockers: [],
  warnings: [],
};

try {
  if (!args.request && !args.file) {
    report.blockers.push("--request is required unless --file is provided");
    finish();
  }

  if (!args.target && isSourceRoot(cwd) && !readConfig(cwd, false)) {
    report.blockers.push("--target is required unless running inside an installed project");
    finish();
  }

  const targetRoot = args.target ? resolveExisting(args.target, "target") : cwd;
  const targetConfig = readConfig(targetRoot, false);
  const sourceRoot = resolveSourceRoot(targetRoot, targetConfig);
  report.targetRoot = targetRoot;
  report.sourceRoot = sourceRoot;

  if (!isTrue(args["skip-install"])) {
    if (!sourceRoot) {
      report.blockers.push("--source is required unless target .shuang-skill/config.json records sourceRoot");
      finish();
    }
    if (!isSourceRoot(sourceRoot)) {
      report.blockers.push(`not a shuang-skill source root: ${sourceRoot}`);
      finish();
    }
    if (path.resolve(sourceRoot) === path.resolve(targetRoot)) {
      report.blockers.push("source root and target root must differ unless --skip-install is used");
      finish();
    }

    const install = run(process.execPath, installArgs(sourceRoot, targetRoot), sourceRoot);
    report.steps.install = summarizeProcess(install);
    if (install.status !== 0) {
      report.blockers.push("install command failed");
      finish();
    }
  } else {
    report.steps.install = { exitCode: null, skipped: true, stdout: "", stderr: "" };
  }

  const doctorFile = path.join(targetRoot, "scripts", "project-doctor.mjs");
  if (!fs.existsSync(doctorFile)) {
    report.blockers.push("target missing scripts/project-doctor.mjs; run without --skip-install or install first");
    finish();
  }

  const projectDoctor = run(process.execPath, ["scripts/project-doctor.mjs"], targetRoot);
  report.steps.projectDoctor = summarizeProcess(projectDoctor);
  if (projectDoctor.status !== 0) {
    report.blockers.push("target project-doctor failed");
    finish();
  }

  const requestStartFile = path.join(targetRoot, "scripts", "vibe-request-start.mjs");
  if (!fs.existsSync(requestStartFile)) {
    report.blockers.push("target missing scripts/vibe-request-start.mjs; run without --skip-install or install first");
    finish();
  }

  const requestStart = run(process.execPath, requestStartArgs(), targetRoot);
  report.steps.requestStart = summarizeProcess(requestStart);
  const requestJson = parseJsonOutput(requestStart.stdout, "vibe-request-start");
  if (requestJson) {
    mergeRequestReport(requestJson);
  }
  if (requestStart.status !== 0) {
    if (!requestJson?.blockers?.length) report.blockers.push("vibe request start failed");
    finish();
  }
} catch (error) {
  report.blockers.push(error.message);
}

finish();

function resolveSourceRoot(targetRoot, targetConfig) {
  if (args.source) return resolveExisting(args.source, "source");
  if (targetConfig?.sourceRoot) return resolveExisting(targetConfig.sourceRoot, "source");
  if (isSourceRoot(cwd) && path.resolve(cwd) !== path.resolve(targetRoot)) return cwd;
  return null;
}

function installArgs(sourceRoot, targetRoot) {
  const argv = [
    "scripts/shuang-skill-manager.mjs",
    "install",
    "--target",
    targetRoot,
    "--source",
    sourceRoot,
  ];
  addOption(argv, "codex", args.codex);
  addOption(argv, "claude", args.claude);
  if (isTrue(args["with-hooks"])) argv.push("--with-hooks");
  return argv;
}

function requestStartArgs() {
  const argv = ["scripts/vibe-request-start.mjs"];
  if (args.file) {
    argv.push("--file", args.file);
  } else {
    argv.push("--request", args.request);
  }
  addOption(argv, "title", args.title);
  addOption(argv, "stage", args.stage);
  addOption(argv, "target-ai", args["target-ai"]);
  addOption(argv, "date", args.date);
  addOption(argv, "out-dir", args["out-dir"] || args.dir);
  if (isTrue(args.force)) argv.push("--force");
  argv.push("--json");
  return argv;
}

function mergeRequestReport(requestReport) {
  if (Array.isArray(requestReport.blockers)) {
    for (const blocker of requestReport.blockers) {
      if (!report.blockers.includes(blocker)) report.blockers.push(blocker);
    }
  }
  if (Array.isArray(requestReport.warnings)) {
    for (const warning of requestReport.warnings) {
      if (!report.warnings.includes(warning)) report.warnings.push(warning);
    }
  }
  report.file = requestReport.file || report.file;
  report.stage = requestReport.stage || report.stage;
  report.skill = requestReport.skill || report.skill;
  report.prompt = requestReport.prompt || report.prompt;
}

function parseJsonOutput(stdout, label) {
  const text = String(stdout || "").trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    report.blockers.push(`could not parse ${label} JSON output: ${error.message}`);
    return null;
  }
}

function run(command, argv, root) {
  return spawnSync(command, argv, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
}

function summarizeProcess(result) {
  return {
    exitCode: result.status,
    stdout: trimOutput(result.stdout || ""),
    stderr: trimOutput(result.stderr || ""),
  };
}

function trimOutput(value) {
  const text = String(value || "").trim();
  return text.length > 8000 ? `${text.slice(0, 8000)}\n...<truncated>` : text;
}

function readConfig(root, required = true) {
  const file = path.join(root, CONFIG_FILE);
  if (!fs.existsSync(file)) {
    if (required) throw new Error(`missing ${CONFIG_FILE}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function isSourceRoot(root) {
  return fs.existsSync(path.join(root, ".codex", "skills"))
    && fs.existsSync(path.join(root, "scripts", "shuang-skill-manager.mjs"));
}

function resolveExisting(value, name) {
  const resolved = path.resolve(value);
  if (!fs.existsSync(resolved)) throw new Error(`${name} root does not exist: ${resolved}`);
  return resolved;
}

function addOption(argv, key, value) {
  if (value !== undefined && value !== null && value !== false) argv.push(`--${key}`, String(value));
}

function isTrue(value) {
  return value === true || value === "true";
}

function finish() {
  report.status = report.blockers.length ? "fail" : "pass";

  if (isTrue(args.raw)) {
    if (report.prompt) console.log(report.prompt);
    else if (report.blockers.length) console.error(report.blockers.join("\n"));
  } else if (isTrue(args.json)) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printMarkdown(report);
  }

  process.exit(report.blockers.length ? 1 : 0);
}

function printMarkdown(out) {
  console.log("# Project Start");
  console.log("");
  console.log(`- Status: ${out.status}`);
  console.log(`- Target: \`${out.targetRoot || "unknown"}\``);
  if (out.sourceRoot) console.log(`- Source: \`${out.sourceRoot}\``);
  console.log(`- File: ${out.file ? `\`${out.file}\`` : "none"}`);
  if (out.stage) console.log(`- Stage: \`${out.stage}\``);
  if (out.skill) console.log(`- Skill: \`${out.skill}\``);
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
  console.log("## Verification");
  console.log("");
  for (const [name, step] of Object.entries(out.steps)) {
    if (!step) continue;
    const marker = step.skipped ? "skipped" : `exit ${step.exitCode}`;
    console.log(`- ${name}: ${marker}`);
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

function printHelp() {
  console.log(`Usage:
  node scripts/project-start.mjs --target <project> --request <short requirement> [--title <title>] [--stage <stage>] [--target-ai Codex] [--date YYYY-MM-DD] [--source <shuang-skill>] [--force] [--json|--raw]
  node scripts/project-start.mjs --target <project> --file <request.md> [--skip-install] [--json|--raw]
  node scripts/project-start.mjs --request <short requirement> [--title <title>] [--json|--raw]

Source-side usage installs or updates Shuang skills in the target project, runs
the target project doctor, creates or reads a Vibe request card, and prints the
copyable Agent prompt. The no-target form is only valid inside an installed
project with .shuang-skill/config.json.`);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith("--")) continue;
    const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
    out[key.slice(2)] = value;
  }
  return out;
}
