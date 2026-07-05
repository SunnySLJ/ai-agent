#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const CORE_VALIDATION_COMMANDS = [
  "node scripts/agent-workbench-boundary-check.mjs",
  "node scripts/memory-placement-check.mjs",
  "node scripts/validate-skills.mjs",
  "node scripts/evolution-inbox-status.mjs --limit 8",
];

const COURSE_VALIDATION_COMMANDS = [
  "node scripts/course-source-health.mjs",
  "node scripts/course-source-inventory.mjs",
  "node scripts/course-extract-to-notes.mjs --dry-run",
];

const SHORT_COMMAND_ROUTE_VALIDATION_COMMANDS = [
  "node scripts/short-command-route-check.mjs",
];

const SYNC_BACK_VALIDATION_COMMANDS = [
  "node scripts/sync-back-smoke.mjs",
];

const SKILL_STUDIO_VALIDATION_COMMANDS = [
  "cd Skill-Distiller && OPENROUTER_API_KEY=placeholder pnpm build",
];
const EVIDENCE_SIGNAL_COUNT = 7;

const args = parseArgs(process.argv.slice(2));

if (args.help === "true" || !args.note) {
  console.log(`Usage:
  node scripts/evolution-promotion-package.mjs --note <inbox-note.md> [--json]

Turns one evolution note into a promotion package: target placement, evidence gates,
recommended next action, and validation commands.`);
  process.exit(args.note ? 0 : 1);
}

const root = process.cwd();
const notePath = path.resolve(args.note);
if (!fs.existsSync(notePath)) {
  console.error(`Missing note: ${path.relative(root, notePath)}`);
  process.exit(1);
}

const report = buildPromotionPackage(notePath);

if (args.json === "true") {
  console.log(JSON.stringify(report, null, 2));
} else {
  printMarkdown(report);
}

function buildPromotionPackage(file) {
  const text = fs.readFileSync(file, "utf8");
  const sections = parseSections(text);
  const missing = missingRequiredFields(sections);
  const lifecycle = parseLifecycle(sections);
  const status = lifecycle.status || (missing.length ? "draft" : "ready");
  const targetSkills = unique([
    ...extractSkills(fieldValue(sections.Context, "Related skill")),
    ...extractSkills(fieldValue(sections.Target, "Update skill")),
  ]);
  const updateRefs = extractInlineValues(fieldValue(sections.Target, "Update reference"));
  const updateDocs = extractInlineValues(fieldValue(sections.Target, "Update docs"));
  const trigger = fieldValue(sections.Validation, "Example trigger");
  const nonTrigger = fieldValue(sections.Validation, "Example non-trigger");
  const hasValidationCommand = /`[^`]*(validate-skills|project-doctor|test|build|course-source|course-extract|short-command-route-check|sync-back-smoke)[^`]*`/.test(sections.Validation || "");
  const isCourseNote = /Course Evolution Note|## Source Handling|Course inventory check|readableSignals=|topTypes=/i.test(text);
  const isSkillStudioNote = /Skill Studio|Skill-Distiller|\/evolve\/theater|\/library/i.test(text);
  const isShortCommandRouteNote = /short-command-routes\.md|short command route|短提示词|短命令|一句话需求/i.test(text);
  const isSyncBackNote = /sync-back|sync back|sync-back-smoke|同步回|回流/i.test(text);

  const evidenceMatches = evidenceSignals({
    sections,
    targetSkills,
    updateRefs,
    updateDocs,
    trigger,
    nonTrigger,
    hasValidationCommand,
  });

  const gates = [
    {
      id: "note-completeness",
      status: missing.length ? "fail" : "pass",
      detail: missing.length ? `missing: ${missing.join(", ")}` : "required note fields are present",
    },
    {
      id: "minimum-evidence",
      status: evidenceMatches.length >= 4 ? "pass" : evidenceMatches.length >= 2 ? "warn" : "fail",
      detail: `${evidenceMatches.length}/${EVIDENCE_SIGNAL_COUNT} reusable promotion signals present`,
      matched: evidenceMatches,
    },
    {
      id: "target-placement",
      status: targetSkills.length || updateRefs.length || updateDocs.length ? "pass" : "fail",
      detail: targetSkills.length
        ? `target skills: ${targetSkills.join(", ")}`
        : "no target skill, reference, or doc location found",
    },
    {
      id: "trigger-boundary",
      status: trigger && nonTrigger && normalize(trigger) !== normalize(nonTrigger) ? "pass" : "warn",
      detail: trigger && nonTrigger ? "trigger and non-trigger are present" : "add distinct trigger and non-trigger examples",
    },
    {
      id: "validation-plan",
      status: hasValidationCommand ? "pass" : "warn",
      detail: hasValidationCommand ? "note includes at least one validation command" : "add exact validation commands before promotion",
    },
  ];

  if (isCourseNote) {
    gates.push({
      id: "course-source-boundary",
      status: sections["Source Handling"] || /topTypes=|readableSignals=/.test(text) ? "pass" : "warn",
      detail: "course notes must keep raw materials in local-only storage and promote only original rules",
    });
  }

  gates.push({
    id: "lifecycle",
    status: lifecycle.status ? "pass" : "warn",
    detail: lifecycle.status ? `lifecycle status: ${lifecycle.status}` : "add Lifecycle after promoting or parking the note",
  });

  const validationCommands = unique([
    ...CORE_VALIDATION_COMMANDS,
    ...(isCourseNote ? COURSE_VALIDATION_COMMANDS : []),
    ...(isShortCommandRouteNote ? SHORT_COMMAND_ROUTE_VALIDATION_COMMANDS : []),
    ...(isSyncBackNote ? SYNC_BACK_VALIDATION_COMMANDS : []),
    ...(isSkillStudioNote ? SKILL_STUDIO_VALIDATION_COMMANDS : []),
  ]);

  return {
    note: file,
    status,
    title: firstMatch(text, /^#\s+(.+)$/m) || path.basename(file, ".md"),
    targetSkills,
    updateRefs,
    updateDocs,
    isCourseNote,
    gates,
    recommendation: recommendationFor(status, gates),
    validationCommands,
  };
}

function missingRequiredFields(sections) {
  const missing = [];
  requireField(sections.Context, "Source evidence", "Context.Source evidence", missing);
  requireField(sections.Signal, "What happened", "Signal.What happened", missing);
  requireField(sections.Signal, "User preference", "Signal.User preference", missing);
  requireField(sections.Signal, "Failure or friction", "Signal.Failure or friction", missing);
  requireSection(sections["Reusable Rule"], "Reusable Rule", missing);
  requireSection(sections["Proposed Diff"], "Proposed Diff", missing);
  requireField(sections.Validation, "Example trigger", "Validation.Example trigger", missing);
  requireField(sections.Validation, "Example non-trigger", "Validation.Example non-trigger", missing);
  return missing;
}

function evidenceSignals(input) {
  const matches = [];
  if (!isPlaceholder(fieldValue(input.sections.Context, "Source evidence"))) matches.push("source-evidence");
  if (!isPlaceholder(fieldValue(input.sections.Signal, "User preference"))) matches.push("user-preference");
  if (!isPlaceholder(fieldValue(input.sections.Signal, "Failure or friction"))) matches.push("friction");
  if (!isPlaceholder(input.sections["Reusable Rule"])) matches.push("reusable-rule");
  if (input.targetSkills.length || input.updateRefs.length || input.updateDocs.length) matches.push("target-placement");
  if (input.trigger && input.nonTrigger && normalize(input.trigger) !== normalize(input.nonTrigger)) matches.push("trigger-boundary");
  if (input.hasValidationCommand) matches.push("validation-command");
  return matches;
}

function recommendationFor(status, gates) {
  const failures = gates.filter((gate) => gate.status === "fail");
  if (status === "promoted") {
    return { action: "already-promoted", reason: "note lifecycle says promoted" };
  }
  if (status === "parked") {
    return { action: "keep-parked", reason: "note lifecycle says parked" };
  }
  if (status === "draft" || failures.length) {
    return {
      action: "complete-note",
      reason: failures.length ? `resolve failing gates: ${failures.map((gate) => gate.id).join(", ")}` : "note is still draft",
    };
  }
  const validationGate = gates.find((gate) => gate.id === "validation-plan");
  if (validationGate?.status === "warn") {
    return { action: "promote-after-validation-plan", reason: "ready note needs exact validation commands" };
  }
  return { action: "promote", reason: "ready note has target placement, evidence, trigger boundary, and validation plan" };
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
  const status = normalizeLifecycleStatus(fieldValue(section, "Status")) || normalizeLifecycleStatus(section);
  return { status };
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
  return [
    "",
    "Write the future-facing rule in imperative form.",
    "Describe the exact change before editing any `SKILL.md`.",
  ].includes(normalized);
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

function firstMatch(text, regex) {
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}

function normalize(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function printMarkdown(report) {
  console.log(`# Evolution Promotion Package`);
  console.log("");
  console.log(`- Note: \`${path.relative(root, report.note)}\``);
  console.log(`- Status: ${report.status}`);
  console.log(`- Recommendation: ${report.recommendation.action} - ${report.recommendation.reason}`);
  console.log(`- Target skills: ${report.targetSkills.length ? report.targetSkills.map((skill) => `\`${skill}\``).join(", ") : "-"}`);
  console.log(`- Course note: ${report.isCourseNote ? "yes" : "no"}`);
  console.log("");
  console.log(`## Gates`);
  console.log("");
  console.log(`| Gate | Status | Detail |`);
  console.log(`|---|---|---|`);
  for (const gate of report.gates) {
    console.log(`| ${gate.id} | ${gate.status} | ${escapeTable(gate.detail)} |`);
  }
  console.log("");
  console.log(`## Validation Commands`);
  console.log("");
  for (const command of report.validationCommands) {
    console.log(`- \`${command}\``);
  }
}

function escapeTable(value) {
  return String(value || "").replace(/\|/g, "\\|");
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
