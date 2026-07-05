#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const root = process.cwd();
const defaultDir = path.join(root, "docs", "vibe-requests");

const REQUIRED_SECTIONS = [
  "## 原始短需求",
  "## 短命令意图卡",
  "## 必读入口",
  "## 给 Agent 的可复制提示词",
  "## 验证命令",
];

const REQUIRED_PHRASES = [
  "原话",
  "推断阶段",
  "推荐入口 skill",
  "下一触发",
  "停止点",
  "```text",
  "```bash",
];

if (args.help === "true") {
  console.log(`Usage:
  node scripts/vibe-request-check.mjs [--dir docs/vibe-requests] [--file <request.md>] [--json]

Checks generated Vibe request intake cards for the sections and phrases needed
to route a short requirement into the Shuang Vibe Coding workflow.`);
  process.exit(0);
}

const report = {
  status: "pass",
  root,
  requests: [],
  blockers: [],
  warnings: [],
};
let displayBase = root;

try {
  const files = collectFiles();
  for (const file of files) {
    checkFile(file);
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

function collectFiles() {
  if (args.file) {
    const file = path.resolve(root, args.file);
    if (!fs.existsSync(file)) throw new Error(`request file not found: ${display(file)}`);
    return [file];
  }

  const dir = path.resolve(root, args.dir || defaultDir);
  if (!fs.existsSync(dir)) return [];
  const rootRelative = path.relative(root, dir);
  displayBase = rootRelative.startsWith("..") ? path.dirname(dir) : root;

  return fs.readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => path.join(dir, name));
}

function checkFile(file) {
  const text = fs.readFileSync(file, "utf8");
  const rel = display(file);
  const request = {
    file: rel,
    stage: extractBacktickValue(text, "推断阶段"),
    skill: extractBacktickValue(text, "推荐入口 skill"),
  };

  report.requests.push(request);

  for (const section of REQUIRED_SECTIONS) {
    if (!text.includes(section)) {
      report.blockers.push(`${rel} missing section: ${section}`);
    }
  }

  for (const phrase of REQUIRED_PHRASES) {
    if (!text.includes(phrase)) {
      report.blockers.push(`${rel} missing required phrase: ${phrase}`);
    }
  }

  if (!request.stage) report.blockers.push(`${rel} missing inferred stage value`);
  if (!request.skill) report.blockers.push(`${rel} missing recommended skill value`);
}

function extractBacktickValue(text, label) {
  const escaped = escapeRegExp(label);
  const row = text.match(new RegExp("\\|\\s*" + escaped + "\\s*\\|\\s*`([^`]+)`\\s*\\|"));
  if (row) return row[1].trim();
  const inline = text.match(new RegExp(escaped + "[^\\n]*`([^`]+)`"));
  return inline ? inline[1].trim() : null;
}

function display(file) {
  const normalized = file.split(path.sep).join("/");
  const marker = "/docs/vibe-requests/";
  const index = normalized.indexOf(marker);
  if (index !== -1) return normalized.slice(index + 1);
  return path.relative(displayBase, file) || ".";
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

function printMarkdown(out) {
  console.log("# Vibe Request Check");
  console.log("");
  console.log(`- Status: ${out.status}`);
  console.log(`- Requests: ${out.requests.length}`);
  console.log("");
  console.log("## Requests");
  console.log("");
  if (out.requests.length) {
    for (const request of out.requests) {
      console.log(`- \`${request.file}\`: stage=\`${request.stage || "missing"}\`, skill=\`${request.skill || "missing"}\``);
    }
  } else {
    console.log("- none");
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
