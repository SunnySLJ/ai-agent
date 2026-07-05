#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));

if (!args.topic) {
  console.error("Usage: node scripts/create-evolution-note.mjs --topic <topic> [--skill <skill>] [--task <summary>]");
  process.exit(1);
}

const root = process.cwd();
const inboxDir = path.join(root, "docs", "skill-evolution", "inbox");
fs.mkdirSync(inboxDir, { recursive: true });

const date = new Date().toISOString().slice(0, 10);
const slug = slugify(args.topic);
const file = path.join(inboxDir, `${date}-${slug}.md`);

if (fs.existsSync(file)) {
  console.log(path.relative(root, file));
  process.exit(0);
}

const title = toTitle(args.topic);
const targetSkill = args.skill ?? "";
const task = args.task ?? "";

const content = `# ${title} Evolution Note

## Context

- Task: ${task}
- Project: shuang-skill
- Related skill: ${targetSkill}
- Source evidence:

## Signal

- What happened:
- User preference:
- Failure or friction:

## Reusable Rule

Write the future-facing rule in imperative form.

## Target

- Update skill: ${targetSkill}
- Update reference:
- Update docs:
- No update yet:

## Proposed Diff

Describe the exact change before editing any \`SKILL.md\`.

## Validation

- Structural check: \`node scripts/validate-skills.mjs\`
- Example trigger:
- Example non-trigger:
`;

fs.writeFileSync(file, content, "utf8");
console.log(path.relative(root, file));

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

function slugify(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "skill-evolution";
}

function toTitle(input) {
  return input
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    || "Skill Evolution";
}
