#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const DEFAULT_EXTRACT_DIR = ".shuang-skill/extracts.local";
const DEFAULT_INBOX_DIR = "docs/skill-evolution/inbox";

const TOPIC_RULES = {
  "skill-protocol": {
    title: "Skill Protocol",
    targets: ["shuang-skill-rules", "shuang-evolve"],
    rule: "把 skill 相关资料提炼为触发条件、渐进加载、description 边界和验证规则；不要把课程说明或案例原文直接写进 SKILL.md。",
    update: "如果已有 skill-protocol note，只合并为后续候选，不重复建新入口。",
    aliases: ["skill-protocol-progressive-loading"],
  },
  "harness-stage-gates": {
    title: "Harness Stage Gates",
    targets: ["shuang-flow", "shuang-tdd", "shuang-router"],
    rule: "把 harness 资料提炼为输入、产物、停止点、下一触发和验证门，让短提示词也能进入可控开发流程。",
    update: "优先更新 shuang-flow 或 shuang-tdd 的 references。",
    aliases: ["harness-stage-gates"],
  },
  "file-first-memory": {
    title: "File First Memory",
    targets: ["shuang-evolve", "shuang-flow", "shuang-claude-md"],
    rule: "把记忆类资料提炼为文件化上下文协议，区分项目指导、用户偏好、长期记忆、任务复盘和跨项目 workflow。",
    update: "优先更新 course-distillation 或 project guidance references。",
    aliases: ["file-first-memory"],
  },
  "agent-workbench-boundaries": {
    title: "Agent Workbench Boundaries",
    targets: ["shuang-claude-md", "shuang-skill-rules", "shuang-prompt"],
    rule: "把工作台和源码解读资料提炼为上下文、工具、权限、hooks/plugins 和多 agent 的边界规则，不把内部实现直接写成通用行为要求。",
    update: "优先更新项目指导文件和 hooks/plugins 路线图。",
    aliases: ["agent-workbench-boundaries"],
  },
  "ocr-ingestion-safety": {
    title: "OCR Ingestion Safety",
    targets: ["shuang-evolve"],
    rule: "对 PDF/OCR/图片资料先生成本机私有摘要，再把原创规则写入 evolution note；公开仓库不保存抽取正文、截图、模型权重或缓存。",
    update: "优先更新 course-distillation 的 PDF/OCR 路线。",
    aliases: ["ocr-ingestion-safety"],
  },
  "spec-kit-handoff": {
    title: "Spec Kit Handoff",
    targets: ["shuang-flow", "shuang-specs", "shuang-tdd", "shuang-prompt"],
    rule: "把 Spec-Kit/OpenSpec 类资料提炼为 brainstorm -> spec -> clarify -> plan -> tasks -> TDD 的交接协议，明确每一步的输入、产物、停止点和验证门。",
    update: "优先更新 shuang-flow、shuang-specs 和 shuang-tdd 的 references。",
    aliases: ["spec-kit-handoff", "spec-kit-handoff-from-extract"],
  },
};

const args = parseArgs(process.argv.slice(2));
const root = process.cwd();
const extractDir = path.join(root, args.extracts || DEFAULT_EXTRACT_DIR);
const inboxDir = path.join(root, args.inbox || DEFAULT_INBOX_DIR);
const minScore = Number(args["min-score"] || 1);
const dryRun = args["dry-run"] === "true";
const force = args.force === "true";
const wantedTopics = new Set(splitList(args.topics));

if (!fs.existsSync(extractDir)) {
  fail(`Missing extracts dir: ${path.relative(root, extractDir)}. Run node scripts/course-local-extract.mjs first.`);
}

const extracts = loadExtracts(extractDir);
const grouped = groupTopics(extracts);
const actions = [];

fs.mkdirSync(inboxDir, { recursive: true });
for (const [topic, entries] of grouped) {
  if (wantedTopics.size && !wantedTopics.has(topic)) continue;
  const score = entries.reduce((sum, entry) => sum + entry.score, 0);
  if (score < minScore) continue;
  const rule = TOPIC_RULES[topic] || {
    title: toTitle(topic),
    targets: ["shuang-evolve"],
    rule: "把本机私有摘要中的重复信号提炼为跨项目可复用的 workflow 规则，并先进入 evolution note。",
    update: "先观察，不直接修改 SKILL.md。",
    aliases: [topic],
  };
  const existing = findExistingNote(rule.aliases || [topic]);
  if (existing && !force) {
    actions.push({ type: "skip-existing", topic, path: path.relative(root, existing), score });
    continue;
  }
  const file = path.join(inboxDir, `${new Date().toISOString().slice(0, 10)}-${slugify(topic)}.md`);
  const content = renderNote(topic, rule, entries, score);
  if (!dryRun) fs.writeFileSync(file, content, "utf8");
  actions.push({
    type: dryRun ? "would-create-note" : "create-note",
    topic,
    path: path.relative(root, file),
    score,
    sources: entries.length,
  });
}

console.log(JSON.stringify({
  extracts: extracts.length,
  topics: grouped.size,
  actions,
}, null, 2));

function loadExtracts(dir) {
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const full = path.join(dir, file);
      const data = JSON.parse(fs.readFileSync(full, "utf8"));
      return { file: full, data };
    });
}

function groupTopics(extracts) {
  const grouped = new Map();
  for (const extract of extracts) {
    const data = extract.data;
    for (const candidate of data.topicCandidates || []) {
      const topic = candidate.topic;
      if (!topic) continue;
      const entries = grouped.get(topic) || [];
      entries.push({
        sourceId: data.source?.id || path.basename(extract.file, ".json"),
        title: data.source?.title || data.source?.id || "unknown",
        score: Number(candidate.score || 0),
        textSignals: data.textSignals?.length || 0,
        pdfPending: data.pendingPdf?.length || 0,
        imagePending: data.pendingImages?.length || 0,
        skipped: data.skippedLargeOrBinary?.length || 0,
      });
      grouped.set(topic, entries);
    }
  }
  return new Map([...grouped.entries()].sort((a, b) => {
    const scoreA = a[1].reduce((sum, entry) => sum + entry.score, 0);
    const scoreB = b[1].reduce((sum, entry) => sum + entry.score, 0);
    return scoreB - scoreA;
  }));
}

function findExistingNote(aliases) {
  if (!fs.existsSync(inboxDir)) return null;
  const files = fs.readdirSync(inboxDir).filter((file) => file.endsWith(".md"));
  for (const alias of aliases) {
    const slug = slugify(alias);
    const found = files.find((file) => file.includes(slug));
    if (found) return path.join(inboxDir, found);
  }
  return null;
}

function renderNote(topic, rule, entries, score) {
  const sources = entries
    .sort((a, b) => b.score - a.score)
    .map((entry) => `  - \`${entry.sourceId}\`：${entry.title}；score=${entry.score}；textSignals=${entry.textSignals}；pdfPending=${entry.pdfPending}；imagePending=${entry.imagePending}；skipped=${entry.skipped}`)
    .join("\n");

  return `# ${rule.title} Extract Evolution Note

## Context

- Task: 从本机私有摘要中批量提炼主题：${topic}
- Project: shuang-skill
- Related skill: ${rule.targets.map((skill) => `\`${skill}\``).join(", ")}
- Source evidence:
${sources}

## Signal

- What happened: 本机私有 extract 中出现主题候选 \`${topic}\`，累计 score=${score}。
- User preference: 用户希望课程资料持续完善 skills，并最终用短提示词触发成熟流程。
- Failure or friction: 如果只停留在 \`.shuang-skill/extracts.local/\`，这些信号不会进入可审查、可验证、可同步的 skill 进化闭环。

## Reusable Rule

${rule.rule}

## Source Handling

- 公开 note 只保存 source id、统计信号和原创规则。
- 不保存课程原文、PDF 正文、截图、zip、模型文件、真实 key 或个人隐私。
- 本机 extract 仍保留在 \`.shuang-skill/extracts.local/\`，该目录不提交。

## Target

- Update skill: ${rule.targets.map((skill) => `\`${skill}\``).join(", ")}
- Update reference: ${rule.update}
- Update docs: 如进入长期化，再更新对应路线图或 reference。
- No update yet: 原始资料和私有 extract 不进入仓库。

## Proposed Diff

先把该主题作为候选保留在 inbox；满足长期化标准后，只更新目标 skill 的触发、步骤、验证门或 reference，不复制资料原文。

## Validation

- Structural check: \`node scripts/validate-skills.mjs\`
- Course inventory check: \`node scripts/course-source-inventory.mjs\`
- Local extract check: \`node scripts/course-local-extract.mjs --sources "<source-id>"\`
- Example trigger: “请从本机课程摘要里批量提炼可以升级的主题。”
- Example non-trigger: “把 extracts.local 里的原文全部提交到仓库。”
`;
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
    .slice(0, 80) || "course-extract-topic";
}

function toTitle(input) {
  return String(input || "")
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    || "Course Extract Topic";
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
