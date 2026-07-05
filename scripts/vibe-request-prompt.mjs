#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const root = process.cwd();
const defaultDir = path.join(root, "docs", "vibe-requests");

if (args.help === "true") {
  console.log(`Usage:
  node scripts/vibe-request-prompt.mjs [--dir docs/vibe-requests] [--file <request.md>] [--json] [--raw]

Prints the copyable prompt from a Vibe request intake card. By default it reads
the latest Markdown file in docs/vibe-requests. Missing docs/vibe-requests is
treated as an empty queue.`);
  process.exit(0);
}

const report = {
  status: "pass",
  root,
  file: null,
  title: null,
  date: null,
  targetAi: null,
  originalRequest: null,
  stage: null,
  skill: null,
  contextPack: null,
  prompt: null,
  blockers: [],
  warnings: [],
};
let displayBase = root;

try {
  const file = selectFile();
  if (file) {
    Object.assign(report, parseRequest(file));
    if (!report.prompt) {
      report.blockers.push(`${report.file} missing copyable prompt fenced text block`);
    } else {
      report.contextPack = loadContextPack();
      if (report.contextPack?.status === "pass" && !report.prompt.includes("项目上下文包")) {
        report.prompt = withContextPack(report.prompt, report.contextPack);
      }
    }
  }
} catch (error) {
  report.blockers.push(error.message);
}

report.status = report.blockers.length ? "fail" : "pass";

if (args.raw === "true") {
  if (report.prompt) console.log(report.prompt);
} else if (args.json === "true") {
  console.log(JSON.stringify(report, null, 2));
} else {
  printMarkdown(report);
}

process.exit(report.blockers.length ? 1 : 0);

function selectFile() {
  if (args.file) {
    const file = path.resolve(root, args.file);
    if (!fs.existsSync(file)) throw new Error(`request file not found: ${display(file)}`);
    return file;
  }

  const dir = path.resolve(root, args.dir || defaultDir);
  if (!fs.existsSync(dir)) return null;
  const rootRelative = path.relative(root, dir);
  displayBase = rootRelative.startsWith("..") ? path.dirname(dir) : root;

  const files = fs.readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => path.join(dir, name));
  return files.at(-1) || null;
}

function parseRequest(file) {
  const text = fs.readFileSync(file, "utf8");
  return {
    file: display(file),
    title: extractTitle(text),
    date: extractLineValue(text, "Date"),
    targetAi: extractLineValue(text, "Target AI"),
    originalRequest: extractSectionText(text, "## 原始短需求"),
    stage: extractBacktickValue(text, "推断阶段"),
    skill: extractBacktickValue(text, "推荐入口 skill"),
    prompt: extractPrompt(text),
  };
}

function extractTitle(text) {
  const match = text.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function extractLineValue(text, label) {
  const match = text.match(new RegExp(`^${escapeRegExp(label)}:\\s*(.+)$`, "m"));
  return match ? match[1].trim() : null;
}

function extractSectionText(text, heading) {
  const start = text.indexOf(heading);
  if (start === -1) return null;
  const afterHeading = text.slice(start + heading.length);
  const nextHeading = afterHeading.search(/\n##\s+/);
  const body = nextHeading === -1 ? afterHeading : afterHeading.slice(0, nextHeading);
  return body.trim() || null;
}

function extractPrompt(text) {
  const section = extractSectionText(text, "## 给 Agent 的可复制提示词");
  if (!section) return null;
  const fenced = section.match(/```(?:text)?\s*\n([\s\S]*?)\n```/);
  return fenced ? fenced[1].trim() : null;
}

function extractBacktickValue(text, label) {
  const escaped = escapeRegExp(label);
  const row = text.match(new RegExp("\\|\\s*" + escaped + "\\s*\\|\\s*`([^`]+)`\\s*\\|"));
  if (row) return row[1].trim();
  const inline = text.match(new RegExp(escaped + "[^\\n]*`([^`]+)`"));
  return inline ? inline[1].trim() : null;
}

function loadContextPack() {
  const script = path.join(root, "scripts", "project-context-pack.mjs");
  if (!fs.existsSync(script)) return null;

  const result = spawnSync(process.execPath, [script, "--json"], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });

  if (result.status !== 0) {
    const message = trimOutput(result.stderr || result.stdout || "project context pack failed");
    report.warnings.push(`project context pack failed: ${message}`);
    return {
      status: "fail",
      error: message,
    };
  }

  try {
    const pack = JSON.parse(result.stdout);
    return {
      status: "pass",
      projectName: pack.projectName || path.basename(root),
      packageManagers: pack.packageManagers || [],
      frameworkSignals: pack.frameworkSignals || [],
      suggestedReadOrder: (pack.suggestedReadOrder || []).slice(0, 8),
      files: Array.isArray(pack.files) ? pack.files.length : 0,
    };
  } catch (error) {
    report.warnings.push(`project context pack JSON parse failed: ${error.message}`);
    return {
      status: "fail",
      error: error.message,
    };
  }
}

function withContextPack(prompt, contextPack) {
  const readOrder = contextPack.suggestedReadOrder.length
    ? contextPack.suggestedReadOrder.map((item) => `\`${item}\``).join(" -> ")
    : "none detected";
  return [
    "项目上下文包（自动生成，来源：`node scripts/project-context-pack.mjs --json`）：",
    `- 项目：${contextPack.projectName}`,
    `- 包管理器：${contextPack.packageManagers.length ? contextPack.packageManagers.join(", ") : "none detected"}`,
    `- 技术信号：${contextPack.frameworkSignals.length ? contextPack.frameworkSignals.join(", ") : "none detected"}`,
    `- 建议先读：${readOrder}`,
    `- 已读取入口文件数：${contextPack.files}`,
    "",
    "使用要求：先按上述阅读顺序取证；不要让用户重复描述这些项目背景。",
    "",
    prompt.trim(),
  ].join("\n");
}

function display(file) {
  const normalized = file.split(path.sep).join("/");
  const marker = "/docs/vibe-requests/";
  const index = normalized.indexOf(marker);
  if (index !== -1) return normalized.slice(index + 1);
  return path.relative(displayBase, file) || ".";
}

function trimOutput(value) {
  const text = String(value || "").trim();
  return text.length > 800 ? `${text.slice(0, 800)}...<truncated>` : text;
}

function printMarkdown(out) {
  console.log("# Vibe Request Prompt");
  console.log("");
  console.log(`- Status: ${out.status}`);
  console.log(`- File: ${out.file ? `\`${out.file}\`` : "none"}`);
  if (out.title) console.log(`- Title: ${out.title}`);
  if (out.stage) console.log(`- Stage: \`${out.stage}\``);
  if (out.skill) console.log(`- Skill: \`${out.skill}\``);
  if (out.contextPack?.status) console.log(`- Context pack: ${out.contextPack.status}`);
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
