import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const activeDir = path.join(root, ".codex", "skills");
const archiveDir = path.join(root, ".codex", "skill-archive");

function listSkillFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skill = path.join(dir, entry.name, "SKILL.md");
    if (fs.existsSync(skill)) out.push(skill);
  }
  return out.sort();
}

function listArchiveSkillFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const group of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!group.isDirectory()) continue;
    const groupDir = path.join(dir, group.name);
    for (const entry of fs.readdirSync(groupDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const skill = path.join(groupDir, entry.name, "SKILL.md");
      if (fs.existsSync(skill)) out.push(skill);
    }
  }
  return out.sort();
}

function parseFrontmatter(file) {
  const text = fs.readFileSync(file, "utf8");
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return { text, fields: {}, error: "missing frontmatter" };
  const fields = {};
  const lines = match[1].split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    const rawValue = m[2];
    if (rawValue === ">-" || rawValue === ">" || rawValue === "|" || rawValue === "|-") {
      const folded = [];
      while (index + 1 < lines.length && (/^\s+/.test(lines[index + 1]) || lines[index + 1].trim() === "")) {
        index += 1;
        const next = lines[index];
        if (next.trim()) folded.push(next.trim());
      }
      fields[key] = folded.join(" ");
    } else {
      fields[key] = rawValue.replace(/^["']|["']$/g, "");
    }
  }
  return { text, fields };
}

function descriptionSummarizesWorkflow(description) {
  const text = description.replace(/\s+/g, " ").trim();
  const patterns = [
    /(?:先|首先).*(?:再|然后).*(?:最后|最终|然后)/,
    /\b(?:first|firstly)\b.*\bthen\b.*\b(?:then|finally)\b/i,
    /(?:->|→).*(?:->|→)/,
  ];
  return patterns.some((pattern) => pattern.test(text));
}

const active = listSkillFiles(activeDir);
const archived = listArchiveSkillFiles(archiveDir);
const errors = [];
const names = new Map();

for (const file of active) {
  const rel = path.relative(root, file);
  const { fields, error } = parseFrontmatter(file);
  if (error) errors.push(`${rel}: ${error}`);
  if (!fields.name) errors.push(`${rel}: missing name`);
  if (!fields.description) errors.push(`${rel}: missing description`);
  if (fields.description && descriptionSummarizesWorkflow(fields.description)) {
    errors.push(`${rel}: description summarizes workflow; keep description to trigger conditions`);
  }
  if (fields.name && !/^[a-z0-9-]+$/.test(fields.name)) errors.push(`${rel}: invalid name ${fields.name}`);
  if (fields.name && names.has(fields.name)) errors.push(`${rel}: duplicate name ${fields.name}, first ${names.get(fields.name)}`);
  if (fields.name) names.set(fields.name, rel);
}

for (const file of archived) {
  const rel = path.relative(root, file);
  const { fields, error } = parseFrontmatter(file);
  if (error) errors.push(`${rel}: ${error}`);
  if (!fields.name) errors.push(`${rel}: archived missing name`);
}

const groupIndexes = [
  ".codex/skill-groups/README.md",
  ".codex/skill-groups/00-core-flow/INDEX.md",
  ".codex/skill-groups/10-research-prd-architecture/INDEX.md",
  ".codex/skill-groups/20-design-frontend/INDEX.md",
  ".codex/skill-groups/30-implementation/INDEX.md",
  ".codex/skill-groups/40-testing/INDEX.md",
  ".codex/skill-groups/50-spec-kit/INDEX.md",
  ".codex/skill-groups/60-handoff-tools/INDEX.md",
  ".codex/skill-groups/90-archive/INDEX.md",
];

for (const rel of groupIndexes) {
  if (!fs.existsSync(path.join(root, rel))) errors.push(`${rel}: missing group index`);
}

console.log(JSON.stringify({
  activeSkills: active.length,
  archivedSkills: archived.length,
  groups: groupIndexes.length,
  errors,
}, null, 2));

if (errors.length) process.exit(1);
