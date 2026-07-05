#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const DEFAULT_REGISTRY = ".shuang-skill/course-sources.local.json";
const DEFAULT_INVENTORY = ".shuang-skill/course-source-inventory.local.json";

const args = parseArgs(process.argv.slice(2));
const root = process.cwd();

if (!args.theme) {
  console.error(`Usage:
  node scripts/create-course-evolution-note.mjs --theme <slug> --sources <id,id> --targets <skill,skill> --rule <rule> [--signal <text>] [--update <text>]

Examples:
  node scripts/create-course-evolution-note.mjs \\
    --theme file-first-memory \\
    --sources openclaw-digital-worker,openclaw-memory-practice \\
    --targets shuang-evolve,shuang-flow \\
    --rule "把记忆类课程资料先提炼为文件化复盘协议，再决定是否升级 skill。"`);
  process.exit(1);
}

const registryPath = path.join(root, args.registry || DEFAULT_REGISTRY);
const inventoryPath = path.join(root, args.inventory || DEFAULT_INVENTORY);

if (!fs.existsSync(registryPath)) {
  fail(`Missing registry: ${path.relative(root, registryPath)}. Create it from docs/skill-evolution/course-source-registry.example.json.`);
}
if (!fs.existsSync(inventoryPath)) {
  fail(`Missing inventory: ${path.relative(root, inventoryPath)}. Run node scripts/course-source-inventory.mjs first.`);
}

const registry = readJson(registryPath);
const registrySources = Array.isArray(registry) ? registry : registry.sources;
const inventory = readJson(inventoryPath);
const inventoryById = new Map((inventory.sources || []).map((source) => [source.id, source]));
const registryById = new Map((registrySources || []).map((source) => [source.id, source]));
const sourceIds = splitList(args.sources);
const targetSkills = splitList(args.targets);
if (!sourceIds.length) fail("--sources is required");
if (!targetSkills.length) fail("--targets is required");

const sources = sourceIds.map((id) => {
  const reg = registryById.get(id);
  const inv = inventoryById.get(id);
  if (!reg && !inv) fail(`Unknown source id: ${id}`);
  return summarizeSource(id, reg, inv);
});

const date = new Date().toISOString().slice(0, 10);
const slug = slugify(args.theme);
const title = toTitle(args.title || args.theme);
const inboxDir = path.join(root, "docs", "skill-evolution", "inbox");
const file = path.join(inboxDir, `${date}-${slug}.md`);
if (fs.existsSync(file) && args.force !== "true") {
  console.log(path.relative(root, file));
  process.exit(0);
}

fs.mkdirSync(inboxDir, { recursive: true });

const content = `# ${title} Course Evolution Note

## Context

- Task: 从本机学习资料中提炼主题：${title}
- Project: shuang-skill
- Related skill: ${targetSkills.map((skill) => `\`${skill}\``).join(", ")}
- Source evidence:
${sources.map(formatSource).join("\n")}

## Signal

- What happened: ${args.signal || "多个学习资料源都指向同一类可复用 workflow，需要沉淀为 skill 规则而不是临时聊天结论。"}
- User preference: 用户希望用这些资料持续完善 skills，并最终用短提示词触发成熟流程。
- Failure or friction: 如果没有主题化 note，课程知识会停留在资料堆里，无法稳定升级到目标 skill。

## Reusable Rule

${args.rule || "TODO: 写成面向未来的可执行规则。"}

## Source Handling

- 公开 note 只保存资料源 ID、标题、文件类型和原创规则。
- 不保存课程原文、PDF 正文、截图、zip、模型文件、真实 key 或个人隐私。
- 本机完整路径只保存在 \`.shuang-skill/course-sources.local.json\`，该目录不提交。

## Target

- Update skill: ${targetSkills.map((skill) => `\`${skill}\``).join(", ")}
- Update reference: ${args.reference || "按需新增或更新目标 skill 的 references。"}
- Update docs: ${args.update || "按需更新课程资料接入文档或 Vibe Coding 路线图。"}
- No update yet: 原始课程资料、PDF 正文、截图和源码包不进入仓库。

## Proposed Diff

${args.diff || "先更新 reference/docs 里的提炼流程；只有触发条件或核心步骤需要改变时，才最小化修改 `SKILL.md`。"}

## Validation

- Structural check: \`node scripts/validate-skills.mjs\`
- Course inventory check: \`node scripts/course-source-inventory.mjs\`
- Example trigger: ${args.trigger || "“请从这些课程资料里提炼这个主题，并升级我的 skills。”"}
- Example non-trigger: ${args.nontrigger || "“把这份课程 PDF 原文全文搬进 skill。”"}
`;

fs.writeFileSync(file, content, "utf8");
console.log(path.relative(root, file));

function summarizeSource(id, reg, inv) {
  return {
    id,
    title: reg?.title || inv?.title || id,
    targetSkills: reg?.targetSkills || inv?.targetSkills || [],
    exists: inv?.exists ?? fs.existsSync(reg?.path || ""),
    fileCount: inv?.fileCount ?? 0,
    dirCount: inv?.dirCount ?? 0,
    topExtensions: (inv?.topExtensions || []).slice(0, 5),
    markdownHeadings: (inv?.markdownHeadings || []).length,
    notebookHeadings: (inv?.notebookHeadings || []).length,
    excalidrawTexts: (inv?.excalidrawTexts || []).length,
    pdfFiles: (inv?.pdfFiles || []).length,
  };
}

function formatSource(source) {
  const types = source.topExtensions
    .map((item) => `${item.ext}:${item.count}`)
    .join(", ") || "none";
  return `  - \`${source.id}\`：${source.title}；exists=${source.exists}；files=${source.fileCount}；dirs=${source.dirCount}；topTypes=${types}；readableSignals=md:${source.markdownHeadings}, ipynb:${source.notebookHeadings}, excalidraw:${source.excalidrawTexts}, pdf:${source.pdfFiles}`;
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

function splitList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "course-evolution";
}

function toTitle(input) {
  return String(input || "")
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    || "Course Evolution";
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
