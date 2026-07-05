#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const root = process.cwd();
const defaultDir = path.join(root, "docs", "vibe-requests");

if (args.help === "true") {
  console.log(`Usage:
  node scripts/vibe-request-status.mjs [--dir docs/vibe-requests] [--file <request.md>] [--json] [--limit <n>]

Summarizes Vibe request intake cards by inferred stage and recommended skill.
Missing docs/vibe-requests is treated as an empty queue.`);
  process.exit(0);
}

const report = {
  status: "pass",
  root,
  requests: [],
  countsByStage: {},
  countsBySkill: {},
  blockers: [],
  warnings: [],
};
let displayBase = root;

try {
  const files = collectFiles();
  for (const file of files) {
    const request = parseRequest(file);
    report.requests.push(request);
    addCount(report.countsByStage, request.stage);
    addCount(report.countsBySkill, request.skill);
    if (!request.stage) report.blockers.push(`${request.file} missing inferred stage value`);
    if (!request.skill) report.blockers.push(`${request.file} missing recommended skill value`);
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

  const files = fs.readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => path.join(dir, name));

  const limit = Number(args.limit || 0);
  return limit > 0 ? files.slice(0, limit) : files;
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
    next: extractTableValue(text, "下一触发"),
    stop: extractTableValue(text, "停止点"),
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

function extractBacktickValue(text, label) {
  const value = extractTableValue(text, label);
  const match = value?.match(/`([^`]+)`/);
  if (match) return match[1].trim();
  const inline = text.match(new RegExp(escapeRegExp(label) + "[^\\n]*`([^`]+)`"));
  return inline ? inline[1].trim() : null;
}

function extractTableValue(text, label) {
  const escaped = escapeRegExp(label);
  const row = text.match(new RegExp("\\|\\s*" + escaped + "\\s*\\|\\s*([^|]+?)\\s*\\|"));
  return row ? row[1].trim() : null;
}

function addCount(counts, key) {
  if (!key) return;
  counts[key] = (counts[key] || 0) + 1;
}

function display(file) {
  const normalized = file.split(path.sep).join("/");
  const marker = "/docs/vibe-requests/";
  const index = normalized.indexOf(marker);
  if (index !== -1) return normalized.slice(index + 1);
  return path.relative(displayBase, file) || ".";
}

function printMarkdown(out) {
  console.log("# Vibe Request Status");
  console.log("");
  console.log(`- Status: ${out.status}`);
  console.log(`- Requests: ${out.requests.length}`);
  console.log("");
  console.log("## Queue");
  console.log("");
  if (out.requests.length) {
    console.log("| File | Date | Stage | Skill | Next | Stop |");
    console.log("|---|---|---|---|---|---|");
    for (const request of out.requests) {
      console.log([
        `| \`${request.file}\``,
        request.date || "-",
        formatCode(request.stage),
        formatCode(request.skill),
        escapeCell(request.next || "-"),
        `${escapeCell(request.stop || "-")} |`,
      ].join(" | "));
    }
  } else {
    console.log("- none");
  }
  console.log("");
  console.log("## Counts By Stage");
  console.log("");
  printCounts(out.countsByStage);
  console.log("");
  console.log("## Counts By Skill");
  console.log("");
  printCounts(out.countsBySkill);
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

function printCounts(counts) {
  const entries = Object.entries(counts);
  if (!entries.length) {
    console.log("- none");
    return;
  }
  for (const [key, value] of entries) {
    console.log(`- \`${key}\`: ${value}`);
  }
}

function formatCode(value) {
  return value ? `\`${value}\`` : "`missing`";
}

function escapeCell(value) {
  return String(value).replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
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
