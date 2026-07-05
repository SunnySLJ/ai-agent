import fs from "fs";
import path from "path";
import {
  TOPICS,
  LEARNING_STEPS,
} from "../src/lib/curriculum/catalog";
import {
  getDb,
  migrate,
  upsertProgress,
  upsertLearningStep,
  insertAgentModule,
  listNotes,
  insertNote,
  insertNoteChunk,
  insertCard,
  insertInterviewQuestion,
  listAgentModules,
  listLearningSteps,
  listMaterials,
  insertMaterial,
  upsertMaterial,
  insertMaterialChunk,
  deleteMaterialChunksByMaterialId,
  getMaterialById,
} from "../src/lib/db";
import { chunkMarkdown } from "../src/lib/rag/chunk";
import { embedText } from "../src/lib/rag/embed";
import { generateCardsFromNote } from "../src/lib/ai/generate-cards";
import { generateInterviewFromNote } from "../src/lib/ai/generate-interview";
import { getDatabasePath, getProjectRoot } from "../src/lib/paths";

const DB_PATH = getDatabasePath();
const PROJECT_ROOT = getProjectRoot();

const NOTE_SOURCES = [
  {
    path: path.join(PROJECT_ROOT, "docs/21-w1-rag-eval-study-notes.md"),
    title: "W1 · RAG 基础架构 + Agent 评估",
    week: "W1",
    tags: ["rag", "eval", "W1", "part05", "part13"],
    source: "docs/21-w1-rag-eval-study-notes.md",
  },
  {
    path: path.join(PROJECT_ROOT, "docs/22-w2-verified-knowledge-study-notes.md"),
    title: "W2 · 查证型知识库 + 案例11",
    week: "W2",
    tags: ["rag", "查证", "claim-evidence", "W2", "part22", "案例11"],
    source: "docs/22-w2-verified-knowledge-study-notes.md",
  },
] as const;

/** 首次 seed 时的默认步骤状态 */
const STEP_DEFAULT_STATUS: Record<string, "todo" | "learning" | "done"> = {
  w1s1: "done",
  w1s2: "done",
  w1s3: "done",
  w1s4: "done",
  w1s5: "done",
  w1s6: "todo",
  w2s1: "learning",
  w2s2: "done",
  w2s3: "done",
  w2s4: "todo",
};

const AGENT_MODULES = [
  {
    id: "supervisor",
    name: "Supervisor",
    parent_id: null,
    description:
      "ProjectForge 九阶段编排中枢：接收产品想法，调度子 Agent 完成调研→原型→架构→PRD→开发→测试→部署→复盘。",
    code_path: "portfolio/agent-platform/src/agent_platform/project_forge.py",
    interview_script:
      "【情境】我在做 ProjectForge 时需要一个能串联九个工程阶段的编排层。【任务】我设计了 Supervisor 状态机，用 LangGraph 风格的有向图管理阶段转移与产物门禁。【行动】每个阶段有独立 Agent、结构化产出和 trace 记录；失败可回退、成功才解锁下一阶段。【结果】一句话需求能走到可部署仓库，面试可讲清编排、门禁与可观测性。",
  },
  {
    id: "deep-research",
    name: "DeepResearch",
    parent_id: "supervisor",
    description:
      "多轮外网搜索与子问题拆解，输出带脚注的调研报告，支撑需求调研阶段。",
    code_path: "portfolio/agent-platform/src/agent_platform/deep_research.py",
    interview_script:
      "【情境】需求调研需要竞品与行业信息，单靠静态知识库不够。【任务】实现 DeepResearch 子 Agent，把大问题拆成子查询并汇总。【行动】每轮子问题调用搜索 API，结果去重、排序并生成脚注引用；与 Supervisor 的 Research 阶段对接。【结果】调研报告可溯源，降低幻觉，体现 Agent 工具链设计能力。",
  },
  {
    id: "enterprise-rag",
    name: "企业 RAG",
    parent_id: "supervisor",
    description:
      "企业知识库混合检索：BM25 + 向量 + rerank，带 citation 与低置信拒答。",
    code_path: "portfolio/agent-platform/src/agent_platform/retrieval.py",
    interview_script:
      "【情境】架构选型需要检索内部文档与课程笔记。【任务】把 part05 RAG 能力封装为企业知识库引擎。【行动】Markdown/PDF 入库、chunk 策略、混合检索与 citation 回放；无证据时拒答。【结果】eval 通过率 100%，面试能讲清 RAG 八股与工程 trade-off。",
  },
  {
    id: "verified-knowledge",
    name: "查证知识库",
    parent_id: "supervisor",
    description:
      "Claim-Evidence 对齐与置信度门控，用于 PRD/架构文档的事实核验。",
    code_path:
      "portfolio/agent-platform/src/agent_platform/verified_knowledge.py",
    interview_script:
      "【情境】PRD 和架构文档容易出现无依据断言。【任务】实现查证型知识库，把主张与证据对齐。【行动】抽取 Claim → 检索 Top-K → 计算对齐分与 relation → 输出 VerificationReport，低置信建议拒答。【结果】文档审核式 AI 能力，对标案例11/12，体现 RAG 之上的治理层。",
  },
  {
    id: "infra",
    name: "基础设施",
    parent_id: null,
    description: "FastAPI 服务化、Eval 仪表盘、Docker Compose 部署与健康检查。",
    code_path: "portfolio/agent-platform/compose.yaml",
    interview_script:
      "【情境】Agent 能力需要可部署、可评估的工程底座。【任务】用 FastAPI 暴露 /ask、/verified-knowledge 等 API，配 eval 与 compose。【行动】Pydantic 校验、SSE 流式、健康检查、81+ 单测与 agent-eval-dashboard。【结果】完整 AI 应用而非 demo 脚本，面试强调服务化与质量闭环。",
  },
] as const;

function seedProgress(db: ReturnType<typeof getDb>) {
  for (const topic of TOPICS) {
    upsertProgress(
      {
        id: topic.id,
        week: topic.week,
        title: topic.title,
        status: topic.status,
        category: topic.category,
        course_part: topic.course,
        code_path: topic.code,
        standard: topic.standard,
      },
      db
    );
  }
  console.log(`  progress: ${TOPICS.length} topics (by category + week)`);
}

function seedLearningSteps(db: ReturnType<typeof getDb>) {
  const existing = listLearningSteps(undefined, db);
  if (existing.length >= LEARNING_STEPS.length) {
    console.log("  learning_steps: already seeded, refresh metadata");
  }

  for (const step of LEARNING_STEPS) {
    const prev = existing.find((s) => s.id === step.id);
    upsertLearningStep(
      {
        id: step.id,
        week: step.week,
        step_order: step.order,
        category: step.category,
        title: step.title,
        action: step.action,
        course_part: step.course,
        code_path: step.code,
        deliverable: step.deliverable,
        status:
          prev?.status ??
          STEP_DEFAULT_STATUS[step.id] ??
          (step.week === "W1" && step.order <= 5 ? "done" : "todo"),
      },
      db
    );
  }
  console.log(`  learning_steps: ${LEARNING_STEPS.length} ordered steps`);
}

function seedAgentModules(db: ReturnType<typeof getDb>) {
  if (listAgentModules(db).length > 0) {
    console.log("  agent_modules: already seeded, skip");
    return;
  }

  for (const mod of AGENT_MODULES) {
    insertAgentModule(mod, db);
  }
  console.log(`  agent_modules: ${AGENT_MODULES.length} items`);
}

async function ingestNote(
  spec: (typeof NOTE_SOURCES)[number],
  db: ReturnType<typeof getDb>
) {
  if (!fs.existsSync(spec.path)) {
    console.log(`  note: file not found (${spec.path}), skip`);
    return;
  }

  const content = fs.readFileSync(spec.path, "utf-8");
  const existing = listNotes(undefined, db).find((n) => n.title === spec.title);
  if (existing) {
    console.log(`  note: "${spec.title}" already exists, skip`);
    return;
  }

  const note = insertNote(
    {
      title: spec.title,
      content,
      week: spec.week,
      tags: [...spec.tags],
      source: spec.source,
    },
    db
  );

  const chunks = chunkMarkdown(content);
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await embedText(chunks[i]!);
    insertNoteChunk(
      {
        note_id: note.id,
        chunk_index: i,
        content: chunks[i]!,
        embedding: JSON.stringify(embedding),
      },
      db
    );
  }

  const cards = await generateCardsFromNote(note);
  for (const card of cards) {
    insertCard(
      {
        note_id: note.id,
        question: card.question,
        answer: card.answer,
      },
      db
    );
  }

  const questions = await generateInterviewFromNote(note);
  for (const q of questions) {
    insertInterviewQuestion(
      {
        topic: q.topic,
        question: q.question,
        answer: q.answer,
        difficulty: q.difficulty,
        note_id: note.id,
      },
      db
    );
  }

  console.log(
    `  note: "${spec.title}" (${chunks.length} chunks, ${cards.length} cards, ${questions.length} interview)`
  );
}

async function seedNotes(db: ReturnType<typeof getDb>) {
  for (const spec of NOTE_SOURCES) {
    await ingestNote(spec, db);
  }
}

/** 从 Markdown 文件导入或按步骤生成学习资料（存 SQLite） */
const MATERIAL_FILE_IMPORTS: {
  id: string;
  step_id?: string;
  topic_id?: string;
  week: string;
  category?: string;
  title: string;
  file: string;
}[] = [
  {
    id: "mat-daily-plan",
    week: "W1",
    title: "每日学习与开发计划",
    file: "docs/18-project-first-daily-plan.md",
  },
  {
    id: "mat-source-map",
    week: "W1",
    title: "课程资料映射",
    file: "docs/07-source-map.md",
  },
  {
    id: "mat-w1-study",
    step_id: "w1s4",
    week: "W1",
    category: "rag",
    title: "W1 · RAG + Eval 学习资料",
    file: "docs/21-w1-rag-eval-study-notes.md",
  },
  {
    id: "mat-w2-case11",
    step_id: "w2s1",
    week: "W2",
    category: "rag",
    title: "案例11 面试对照",
    file: "docs/20-case11-verified-knowledge-interview-map.md",
  },
  {
    id: "mat-w2-case11b",
    step_id: "w2s2",
    week: "W2",
    category: "rag",
    title: "案例11 对照文档",
    file: "docs/20-case11-verified-knowledge-interview-map.md",
  },
  {
    id: "mat-w2-study",
    step_id: "w2s3",
    week: "W2",
    category: "portfolio",
    title: "W2 · 查证知识库笔记",
    file: "docs/22-w2-verified-knowledge-study-notes.md",
  },
  {
    id: "mat-w3-adr",
    step_id: "w3s2",
    week: "W3",
    category: "agent",
    title: "ADR LangGraph 决策",
    file: "docs/decisions/0002-langgraph.md",
  },
  {
    id: "mat-w6-t05",
    step_id: "w6s3",
    week: "W6",
    category: "eval",
    title: "技能差距复盘模板",
    file: "docs/templates/T05-skills-gap-review.md",
  },
  {
    id: "mat-topic-p09",
    topic_id: "p09",
    week: "W2",
    category: "rag",
    title: "Claim-Evidence 查证",
    file: "docs/20-case11-verified-knowledge-interview-map.md",
  },
  {
    id: "mat-topic-p12",
    topic_id: "p12",
    week: "W3",
    category: "agent",
    title: "LangGraph ADR",
    file: "docs/decisions/0002-langgraph.md",
  },
];

function buildStepMaterialContent(step: (typeof LEARNING_STEPS)[number]): string {
  return `# ${step.title}

## 学习动作
${step.action ?? "（待补充）"}

## 参考课程
${step.course ?? "—"}

## 代码对照
${step.code ?? "—"}

## 产出目标
${step.deliverable ?? "—"}

---

> 在此记录本步骤的学习要点、代码截图说明与面试话术。保存后写入数据库。`;
}

async function indexMaterial(
  db: ReturnType<typeof getDb>,
  materialId: string,
  content: string
) {
  deleteMaterialChunksByMaterialId(materialId, db);
  const chunks = chunkMarkdown(content);
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await embedText(chunks[i]!);
    insertMaterialChunk(
      {
        material_id: materialId,
        chunk_index: i,
        content: chunks[i]!,
        embedding: JSON.stringify(embedding),
      },
      db
    );
  }
  return chunks.length;
}

async function seedMaterials(db: ReturnType<typeof getDb>) {
  for (const step of LEARNING_STEPS) {
    const matId = `mat-${step.id}`;
    if (getMaterialById(matId, db)) continue;

    const material = insertMaterial(
      {
        id: matId,
        title: step.title,
        content: buildStepMaterialContent(step),
        week: step.week,
        category: step.category,
        step_id: step.id,
        source: step.course ?? step.code ?? undefined,
      },
      db
    );
    await indexMaterial(db, material.id, material.content);
  }

  for (const spec of MATERIAL_FILE_IMPORTS) {
    const filePath = path.join(PROJECT_ROOT, spec.file);
    if (!fs.existsSync(filePath)) {
      console.log(`  material: skip missing ${spec.file}`);
      continue;
    }

    const content = fs.readFileSync(filePath, "utf-8");
    upsertMaterial(
      {
        id: spec.id,
        title: spec.title,
        content,
        week: spec.week,
        category: spec.category,
        step_id: spec.step_id,
        topic_id: spec.topic_id,
        source: spec.file,
      },
      db
    );
    await indexMaterial(db, spec.id, content);
  }

  console.log(`  materials: ${listMaterials(undefined, db).length} in database`);
}

async function main() {
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = getDb(DB_PATH);
  migrate(db);
  console.log("migrate: ok");

  seedProgress(db);
  seedLearningSteps(db);
  seedAgentModules(db);
  await seedMaterials(db);
  await seedNotes(db);

  console.log("seed: complete");
}

main().catch((err) => {
  console.error("seed failed:", err);
  process.exit(1);
});
