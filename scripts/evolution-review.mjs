#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const DEFAULT_INBOX = "docs/skill-evolution/inbox";

const args = parseArgs(process.argv.slice(2));
const root = process.cwd();
const inbox = path.resolve(args.inbox || DEFAULT_INBOX);
const limit = args.limit ? Number(args.limit) : 8;

if (args.help === "true") {
  console.log(`Usage:
  node scripts/evolution-review.mjs [--inbox <dir>] [--limit <n>] [--json]

Builds a batch review report for evolution inbox notes: promotion candidates,
draft fixes, close/park recommendations, parked notes to revisit, and promoted
notes with weak lifecycle evidence.`);
  process.exit(0);
}

const status = runStatus(inbox);
const notes = status.all.map((note) => enrichNote(note));
const queues = buildQueues(notes, limit);
const nextActions = buildNextActions(queues);
const attentionCount = Object.values(queues).reduce((sum, items) => sum + items.length, 0);

const report = {
  status: attentionCount ? "attention" : "pass",
  inbox,
  totals: status.totals,
  queues,
  nextActions,
};

if (args.json === "true") {
  console.log(JSON.stringify(report, null, 2));
} else {
  printMarkdown(report);
}

function runStatus(inboxDir) {
  const result = spawnSync(process.execPath, [
    "scripts/evolution-inbox-status.mjs",
    "--inbox",
    inboxDir,
    "--json",
  ], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    process.exit(result.status || 1);
  }
  return JSON.parse(result.stdout);
}

function enrichNote(note) {
  const absoluteFile = path.resolve(root, note.file);
  const text = fs.existsSync(absoluteFile) ? fs.readFileSync(absoluteFile, "utf8") : "";
  const sections = parseSections(text);
  const noUpdate = fieldValue(sections.Target, "No update yet");
  return {
    ...note,
    text,
    noUpdate,
    closeReason: closeReason({ ...note, text, noUpdate }),
    lifecycleEvidenceWeak: lifecycleEvidenceWeak(note),
  };
}

function buildQueues(notes, maxItems) {
  const ready = notes
    .filter((note) => note.status === "ready" && !note.closeReason)
    .sort(byPriority)
    .slice(0, maxItems)
    .map((note) => ({
      file: note.file,
      slug: note.slug,
      title: note.title,
      score: note.priorityScore,
      targetSkills: note.targetSkills,
      reason: "ready note with reusable signal and validation plan",
      nextCommand: `node scripts/evolution-promotion-package.mjs --note ${note.file}`,
    }));

  const drafts = notes
    .filter((note) => note.status === "draft")
    .sort(byPriority)
    .slice(0, maxItems)
    .map((note) => ({
      file: note.file,
      slug: note.slug,
      title: note.title,
      missing: note.missing,
      next: "complete missing fields before promotion review",
    }));

  const close = notes
    .filter((note) => note.closeReason && (note.status === "ready" || note.status === "draft"))
    .sort(byPriority)
    .slice(0, maxItems)
    .map((note) => ({
      file: note.file,
      slug: note.slug,
      title: note.title,
      reason: note.closeReason,
      recommendedLifecycle: "parked",
      next: "append Lifecycle with Status: parked and explain what evidence would reopen it",
    }));

  const parked = notes
    .filter((note) => note.status === "parked")
    .sort((a, b) => a.file.localeCompare(b.file))
    .slice(0, maxItems)
    .map((note) => ({
      file: note.file,
      slug: note.slug,
      title: note.title,
      evidence: note.lifecycle.evidence || "",
      next: "revisit only after another real task confirms the rule",
    }));

  const promotedEvidenceGaps = notes
    .filter((note) => note.lifecycleEvidenceWeak)
    .sort((a, b) => a.file.localeCompare(b.file))
    .slice(0, maxItems)
    .map((note) => ({
      file: note.file,
      slug: note.slug,
      title: note.title,
      reason: "promoted lifecycle is missing Promoted by or Evidence",
      next: "add command or commit evidence to the Lifecycle section",
    }));

  return {
    promoteCandidates: ready,
    draftFixes: drafts,
    closeCandidates: close,
    parkedRevisit: parked,
    promotedEvidenceGaps,
  };
}

function buildNextActions(queues) {
  const actions = [];
  const firstPromotion = queues.promoteCandidates[0];
  if (firstPromotion) {
    actions.push({
      type: "promote",
      file: firstPromotion.file,
      command: firstPromotion.nextCommand,
    });
  }
  const firstDraft = queues.draftFixes[0];
  if (firstDraft) {
    actions.push({
      type: "complete-draft",
      file: firstDraft.file,
      missing: firstDraft.missing,
    });
  }
  const firstClose = queues.closeCandidates[0];
  if (firstClose) {
    actions.push({
      type: "park-or-close",
      file: firstClose.file,
      reason: firstClose.reason,
    });
  }
  const firstEvidenceGap = queues.promotedEvidenceGaps[0];
  if (firstEvidenceGap) {
    actions.push({
      type: "repair-lifecycle-evidence",
      file: firstEvidenceGap.file,
      reason: firstEvidenceGap.reason,
    });
  }
  if (!actions.length) {
    actions.push({
      type: "none",
      message: "inbox has no actionable candidates",
    });
  }
  return actions;
}

function closeReason(note) {
  const text = note.noUpdate;
  if (/(一次性|one[- ]off|temporary|临时|不长期升级|不升级长期|不要升级|do not upgrade|not reusable)/i.test(text)) {
    return "note is marked as one-off or not suitable for long-term skill promotion";
  }
  if (note.status === "ready" && !note.targetSkills.length && !note.updateRefs.length && !note.updateDocs.length) {
    return "ready note has no durable target skill, reference, or doc";
  }
  return "";
}

function lifecycleEvidenceWeak(note) {
  if (note.status !== "promoted") return false;
  const lifecycle = note.lifecycle || {};
  return !String(lifecycle.promotedBy || "").trim() || !String(lifecycle.evidence || "").trim();
}

function byPriority(a, b) {
  if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
  return a.file.localeCompare(b.file);
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

function printMarkdown(out) {
  console.log("# Evolution Review");
  console.log("");
  console.log(`- Status: ${out.status}`);
  console.log(`- Inbox: \`${path.relative(root, out.inbox) || "."}\``);
  console.log(`- Notes: ${out.totals.notes}`);
  console.log(`- Ready: ${out.totals.ready}`);
  console.log(`- Draft: ${out.totals.draft}`);
  console.log(`- Parked: ${out.totals.parked}`);
  console.log(`- Promoted: ${out.totals.promoted}`);
  printQueue("Promotion candidates", out.queues.promoteCandidates);
  printQueue("Draft fixes", out.queues.draftFixes);
  printQueue("Close candidates", out.queues.closeCandidates);
  printQueue("Parked revisit", out.queues.parkedRevisit);
  printQueue("Promoted evidence gaps", out.queues.promotedEvidenceGaps);
  console.log("");
  console.log("## Next Actions");
  console.log("");
  for (const action of out.nextActions) {
    if (action.command) console.log(`- ${action.type}: \`${action.command}\``);
    else if (action.file) console.log(`- ${action.type}: \`${action.file}\``);
    else console.log(`- ${action.type}: ${action.message}`);
  }
}

function printQueue(title, items) {
  console.log("");
  console.log(`## ${title}`);
  console.log("");
  if (!items.length) {
    console.log("- none");
    return;
  }
  for (const item of items) {
    const detail = item.reason || item.next || "";
    console.log(`- \`${item.file}\`${detail ? ` - ${detail}` : ""}`);
  }
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--json") out.json = "true";
    else if (arg === "--help" || arg === "-h") out.help = "true";
    else if (arg === "--inbox") out.inbox = argv[++i];
    else if (arg === "--limit") out.limit = argv[++i];
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return out;
}
