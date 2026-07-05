#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = parseArgs(process.argv.slice(2));
const root = process.cwd();
const scriptDir = path.dirname(fileURLToPath(import.meta.url));

if (args.help === "true") {
  printHelp();
  process.exit(0);
}

const report = {
  status: "pass",
  root,
  file: args.file || null,
  stage: null,
  skill: null,
  prompt: null,
  steps: {
    create: null,
    check: null,
    status: null,
    prompt: null,
  },
  blockers: [],
  warnings: [],
};

try {
  if (!args.file && !args.request) {
    report.blockers.push("--request is required");
    finish();
  }

  if (!args.file) {
    const create = runJson("create-feature-intake.mjs", createArgs());
    report.steps.create = summarizeProcess(create);
    mergeMessages(create.json);
    if (create.status !== 0) {
      addBlockers(create);
      finish();
    }
    report.file = create.json?.file || null;
    report.stage = create.json?.stage || null;
    report.skill = create.json?.skill || null;
  }

  if (!report.file) {
    report.blockers.push("request file was not selected");
    finish();
  }

  const check = runJson("vibe-request-check.mjs", ["--file", report.file, "--json"]);
  report.steps.check = summarizeProcess(check);
  mergeMessages(check.json);
  if (check.status !== 0) addBlockers(check);

  const status = runJson("vibe-request-status.mjs", ["--file", report.file, "--json"]);
  report.steps.status = summarizeProcess(status);
  mergeMessages(status.json);
  if (status.status !== 0) addBlockers(status);
  const requestStatus = status.json?.requests?.[0];
  if (requestStatus) {
    report.stage = requestStatus.stage || report.stage;
    report.skill = requestStatus.skill || report.skill;
  }

  const prompt = runJson("vibe-request-prompt.mjs", ["--file", report.file, "--json"]);
  report.steps.prompt = summarizeProcess(prompt);
  mergeMessages(prompt.json);
  if (prompt.status !== 0) addBlockers(prompt);
  if (prompt.json) {
    report.file = prompt.json.file || report.file;
    report.stage = prompt.json.stage || report.stage;
    report.skill = prompt.json.skill || report.skill;
    report.prompt = prompt.json.prompt || report.prompt;
  }
} catch (error) {
  report.blockers.push(error.message);
}

finish();

function createArgs() {
  const argv = ["--request", args.request, "--json"];
  addOption(argv, "title", args.title);
  addOption(argv, "stage", args.stage);
  addOption(argv, "target-ai", args["target-ai"]);
  addOption(argv, "date", args.date);
  addOption(argv, "out-dir", args["out-dir"] || args.dir);
  if (args.force === "true") argv.push("--force");
  return argv;
}

function runJson(scriptName, argv) {
  const result = spawnSync(process.execPath, [
    path.join(scriptDir, scriptName),
    ...argv,
  ], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });

  const stdout = result.stdout || "";
  let json = null;
  if (stdout.trim()) {
    try {
      json = JSON.parse(stdout);
    } catch (error) {
      return {
        ...result,
        json: null,
        parseError: `could not parse ${scriptName} JSON output: ${error.message}`,
      };
    }
  }

  return { ...result, json };
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

function addBlockers(result) {
  if (result.json?.blockers?.length) {
    for (const blocker of result.json.blockers) report.blockers.push(blocker);
    return;
  }
  if (result.parseError) {
    report.blockers.push(result.parseError);
    return;
  }
  report.blockers.push((result.stderr || result.stdout || "command failed").trim());
}

function mergeMessages(json) {
  if (!json) return;
  if (Array.isArray(json.warnings)) {
    for (const warning of json.warnings) {
      if (!report.warnings.includes(warning)) report.warnings.push(warning);
    }
  }
}

function addOption(argv, key, value) {
  if (value) argv.push(`--${key}`, value);
}

function finish() {
  report.status = report.blockers.length ? "fail" : "pass";

  if (args.raw === "true") {
    if (report.prompt) console.log(report.prompt);
  } else if (args.json === "true") {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printMarkdown(report);
  }

  process.exit(report.blockers.length ? 1 : 0);
}

function printMarkdown(out) {
  console.log("# Vibe Request Start");
  console.log("");
  console.log(`- Status: ${out.status}`);
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
    console.log(`- ${name}: exit ${step.exitCode}`);
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
  node scripts/vibe-request-start.mjs --request <short requirement> [--title <title>] [--stage auto|intake|brainstorm|research|prd|arch|design|specs|implement|test|api-handoff|code-handoff|prompt|release-readiness|evolve|course|install-sync] [--target-ai Codex] [--date YYYY-MM-DD] [--dir docs/vibe-requests|--out-dir docs/vibe-requests] [--force] [--json|--raw]
  node scripts/vibe-request-start.mjs --file <request.md> [--json|--raw]

Creates a Vibe request intake card, validates it, summarizes its route, and
prints the copyable Agent prompt in one command. Use --file to re-print an
existing card's prompt without creating a new card.`);
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
