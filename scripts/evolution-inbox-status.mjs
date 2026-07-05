#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const DEFAULT_INBOX = "docs/skill-evolution/inbox";
const STATUS_ORDER = {
  ready: 0,
  draft: 1,
  parked: 2,
  promoted: 3,
};
const PLACEHOLDERS = [
  "",
  "Write the future-facing rule in imperative form.",
  "Describe the exact change before editing any `SKILL.md`.",
];

const args = parseArgs(process.argv.slice(2));
const root = process.cwd();
const inbox = resolvePath(args.inbox || DEFAULT_INBOX);
const limit = args.limit ? Number(args.limit) : null;
const json = args.json === "true";

if (args.help === "true") {
  console.log(`Usage:
  node scripts/evolution-inbox-status.mjs [--inbox <dir>] [--limit <n>] [--json]

Scans docs/skill-evolution/inbox notes and reports draft, ready, parked, and promoted candidates.`);
  process.exit(0);
}

if (!fs.existsSync(inbox)) {
  console.error(`Missing inbox: ${path.relative(root, inbox)}`);
  process.exit(1);
}

const all = fs.readdirSync(inbox)
  .filter((file) => file.endsWith(".md"))
  .sort()
  .map((file) => analyzeNote(path.join(inbox, file)));

const notes = all
  .slice()
  .sort((a, b) => {
    const rankDiff = statusRank(a.status) - statusRank(b.status);
    if (rankDiff !== 0) return rankDiff;
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    return a.file.localeCompare(b.file);
  });

const selected = Number.isFinite(limit) ? notes.slice(0, limit) : notes;
const report = {
  inbox,
  totals: {
    notes: all.length,
    ready: all.filter((note) => note.status === "ready").length,
    draft: all.filter((note) => note.status === "draft").length,
    parked: all.filter((note) => note.status === "parked").length,
    promoted: all.filter((note) => note.status === "promoted").length,
    actionable: all.filter((note) => note.actionable).length,
  },
  notes: selected,
  all,
};

if (json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  printMarkdown(report);
}

function analyzeNote(file) {
  const text = fs.readFileSync(file, "utf8");
  const base = path.basename(file, ".md");
  const slug = base.replace(/^\d{4}-\d{2}-\d{2}-/, "");
  const title = firstMatch(text, /^#\s+(.+)$/m) || toTitle(slug);
  const sections = parseSections(text);

  const missing = [];
  requireField(sections.Context, "Source evidence", "Context.Source evidence", missing);
  requireField(sections.Signal, "What happened", "Signal.What happened", missing);
  requireField(sections.Signal, "User preference", "Signal.User preference", missing);
  requireField(sections.Signal, "Failure or friction", "Signal.Failure or friction", missing);
  requireSection(sections["Reusable Rule"], "Reusable Rule", missing);
  requireSection(sections["Proposed Diff"], "Proposed Diff", missing);
  requireField(sections.Validation, "Example trigger", "Validation.Example trigger", missing);
  requireField(sections.Validation, "Example non-trigger", "Validation.Example non-trigger", missing);

  const targetSkills = unique([
    ...extractSkills(fieldValue(sections.Context, "Related skill")),
    ...extractSkills(fieldValue(sections.Target, "Update skill")),
  ]);
  const updateRefs = extractInlineValues(fieldValue(sections.Target, "Update reference"));
  const updateDocs = extractInlineValues(fieldValue(sections.Target, "Update docs"));
  const hasValidationCommand = /`[^`]*(validate-skills|project-doctor|test|build)[^`]*`/.test(sections.Validation || "");
  const lifecycle = parseLifecycle(sections);
  const baseStatus = missing.length ? "draft" : "ready";
  const status = lifecycle.status || baseStatus;
  const actionable = status === "ready" || status === "draft";
  const priorityScore = scoreNote({
    status,
    actionable,
    targetSkills,
    updateRefs,
    updateDocs,
    hasValidationCommand,
    text,
  });

  return {
    file: path.relative(root, file),
    slug,
    title,
    status,
    actionable,
    priorityScore,
    targetSkills,
    updateRefs,
    updateDocs,
    lifecycle,
    hasValidationCommand,
    missing,
  };
}

function scoreNote(note) {
  if (!note.actionable) return 0;
  let score = note.status === "ready" ? 50 : 0;
  if (note.status === "draft") score += 20;
  score += Math.min(note.targetSkills.length, 4) * 8;
  score += Math.min(note.updateRefs.length, 3) * 4;
  score += Math.min(note.updateDocs.length, 3) * 3;
  if (note.hasValidationCommand) score += 8;
  if (/short|prompt|提示词|阶段|harness|test|验证|handoff|联调/i.test(note.text)) score += 6;
  return score;
}

function statusRank(status) {
  return STATUS_ORDER[status] ?? 99;
}

function parseSections(text) {
  const sections = {};
  const matches = [...text.matchAll(/^##\s+(.+)$/gm)];
  for (let i = 0; i < matches.length; i += 1) {
    const name = matches[i][1].trim();
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    sections[name] = text.slice(start, end).trim();
  }
  return sections;
}

function parseLifecycle(sections) {
  const section = sections.Lifecycle || sections.Status || "";
  const explicitStatus = normalizeLifecycleStatus(fieldValue(section, "Status"));
  const promotedBy = stripInlineCode(fieldValue(section, "Promoted by"));
  const evidence = fieldValue(section, "Evidence");
  const inferredStatus = promotedBy ? "promoted" : normalizeLifecycleStatus(section);

  return {
    status: explicitStatus || inferredStatus,
    promotedBy,
    evidence,
  };
}

function normalizeLifecycleStatus(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return "";
  if (/\bpromoted\b|\bapplied\b|\bmerged\b|已升级|已合入|已落地/.test(text)) return "promoted";
  if (/\bparked\b|\bdeferred\b|\bon hold\b|停放|暂缓|待验证/.test(text)) return "parked";
  return "";
}

function requireSection(value, label, missing) {
  if (isPlaceholder(value)) missing.push(label);
}

function requireField(section, key, label, missing) {
  if (isPlaceholder(fieldValue(section, key))) missing.push(label);
}

function fieldValue(section, key) {
  if (!section) return "";
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const lines = section.split(/\r?\n/);
  const linePattern = new RegExp(`^-\\s+${escaped}:[ \\t]*(.*)$`);
  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(linePattern);
    if (!match) continue;
    if (match[1].trim()) return match[1].trim();
    const continuation = [];
    for (let j = i + 1; j < lines.length; j += 1) {
      const line = lines[j];
      if (!line.trim()) continue;
      if (!/^[ \t]{2,}\S/.test(line)) break;
      continuation.push(line.trim());
    }
    return continuation.join("\n").trim();
  }
  return "";
}

function isPlaceholder(value) {
  const normalized = String(value || "").trim();
  return PLACEHOLDERS.includes(normalized);
}

function extractSkills(value) {
  return extractInlineValues(value)
    .flatMap((item) => item.split(","))
    .map((item) => item.trim().replace(/^[`'"]|[`'"]$/g, ""))
    .filter((item) => /^shuang-|^speckit-|^enhance-prompt$/.test(item));
}

function extractInlineValues(value) {
  const text = String(value || "").trim();
  if (!text) return [];
  const backticks = [...text.matchAll(/`([^`]+)`/g)].map((match) => match[1].trim());
  if (backticks.length) return backticks;
  if (/^none|^no\b|^不|^暂不/i.test(text)) return [];
  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function stripInlineCode(value) {
  return String(value || "")
    .trim()
    .replace(/^[`'"]|[`'"]$/g, "");
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function printMarkdown(report) {
  console.log(`# Evolution Inbox Status`);
  console.log("");
  console.log(`- Inbox: \`${path.relative(root, report.inbox) || "."}\``);
  console.log(`- Notes: ${report.totals.notes}`);
  console.log(`- Ready: ${report.totals.ready}`);
  console.log(`- Draft: ${report.totals.draft}`);
  console.log(`- Parked: ${report.totals.parked}`);
  console.log(`- Promoted: ${report.totals.promoted}`);
  console.log(`- Actionable: ${report.totals.actionable}`);
  console.log("");
  console.log(`| Status | Score | Note | Target skills | Missing |`);
  console.log(`|---|---:|---|---|---|`);
  for (const note of report.notes) {
    const targets = note.targetSkills.length ? note.targetSkills.map((skill) => `\`${skill}\``).join(", ") : "-";
    const missing = note.missing.length ? note.missing.join(", ") : "-";
    console.log(`| ${note.status} | ${note.priorityScore} | \`${note.file}\` | ${targets} | ${missing} |`);
  }
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

function firstMatch(text, pattern) {
  const match = text.match(pattern);
  return match ? match[1].trim() : "";
}

function toTitle(slug) {
  return slug.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim() || "Evolution Note";
}

function resolvePath(value) {
  return path.isAbsolute(value) ? value : path.join(root, value);
}
