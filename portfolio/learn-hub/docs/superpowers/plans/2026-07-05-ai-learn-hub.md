# AI Learn Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新建独立 Web 项目 `ai-learn-hub`，在浏览器中浏览学习笔记、复习闪卡、练面试题、问 AI，并展示 ProjectForge Agent 架构。

**Architecture:** Next.js 14 全栈 App Router；SQLite 存笔记/闪卡/面试题/进度；OpenAI 兼容 API 做 embedding + 生成；内存 cosine 检索所有 note_chunks 回答全局问题。UI 复用 Skill-Distiller 暗色 emerald 设计 token。

**Tech Stack:** Next.js 15、React 19、Tailwind v4、better-sqlite3、Vercel AI SDK、lucide-react、framer-motion、react-markdown

**Spec:** [2026-07-05-ai-learn-hub-design.md](../specs/2026-07-05-ai-learn-hub-design.md)

---

## File Map（新建项目根：`ai-learn-hub/`）

| 路径 | 职责 |
|---|---|
| `src/app/layout.tsx` | 根布局 + Sidebar |
| `src/app/page.tsx` | 首页仪表盘 |
| `src/app/notes/page.tsx` | 笔记列表 |
| `src/app/notes/[id]/page.tsx` | 笔记详情 |
| `src/app/review/page.tsx` | 闪卡复习 |
| `src/app/chat/page.tsx` | AI 问答 |
| `src/app/roadmap/page.tsx` | 学习路线 |
| `src/app/interview/page.tsx` | 面试题库 |
| `src/app/my-agent/page.tsx` | Agent 架构 |
| `src/app/api/notes/route.ts` | 笔记 CRUD + 自动生成 |
| `src/app/api/chat/route.ts` | RAG 问答 |
| `src/app/api/cards/route.ts` | 闪卡 |
| `src/app/api/interview/route.ts` | 面试题 |
| `src/app/api/progress/route.ts` | 进度 |
| `src/lib/db/index.ts` | SQLite 连接 + migrate |
| `src/lib/db/schema.sql` | 表结构 |
| `src/lib/rag/chunk.ts` | Markdown 切分 |
| `src/lib/rag/embed.ts` | Embedding 客户端 |
| `src/lib/rag/search.ts` | cosine top-k |
| `src/lib/ai/generate-cards.ts` | LLM 提取闪卡 |
| `src/lib/ai/generate-interview.ts` | LLM 提取面试题 |
| `src/components/nav/sidebar.tsx` | 左侧导航 |
| `src/components/notes/note-viewer.tsx` | Markdown 渲染 |
| `src/components/review/flip-card.tsx` | 翻转闪卡 |
| `src/components/chat/chat-panel.tsx` | 对话 UI |
| `scripts/seed.ts` | 种子数据 |
| `AGENTS.md` | Cursor Agent 写入约定 |

---

### Task 1: 项目脚手架

**Files:**
- Create: `ai-learn-hub/package.json`
- Create: `ai-learn-hub/next.config.ts`
- Create: `ai-learn-hub/tsconfig.json`
- Create: `ai-learn-hub/postcss.config.mjs`
- Create: `ai-learn-hub/.env.example`
- Create: `ai-learn-hub/.gitignore`

- [ ] **Step 1: 初始化 Next.js 项目**

```bash
cd /Users/mac/Desktop/shuang-kuai/shuang-agent
pnpm create next-app@15 ai-learn-hub --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
cd ai-learn-hub
pnpm add better-sqlite3 uuid react-markdown remark-gfm lucide-react framer-motion clsx tailwind-merge zod
pnpm add -D @types/better-sqlite3 vitest @vitejs/plugin-react
```

- [ ] **Step 2: 配置 dev 端口 3001**

`package.json`:

```json
"scripts": {
  "dev": "next dev -p 3001",
  "build": "next build",
  "start": "next start -p 3001",
  "db:migrate": "tsx scripts/migrate.ts",
  "seed": "tsx scripts/seed.ts",
  "test": "vitest run"
}
```

- [ ] **Step 3: 添加 `.env.example`**

```
OPENAI_API_KEY=
OPENAI_BASE_URL=
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
DATABASE_PATH=./data/learn.db
```

- [ ] **Step 4: 验证启动**

Run: `pnpm dev`  
Expected: `http://localhost:3001` 可访问默认页

---

### Task 2: 设计系统（Skill-Distiller 风格）

**Files:**
- Create: `src/app/globals.css`
- Create: `src/lib/utils.ts`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: 复制并精简 Skill-Distiller CSS token**

从 `../../shuang-skill/Skill-Distiller/src/app/globals.css` 复制 `@theme` 变量与 `.card`、`.section-pad`、`.btn-brand` 类到 `globals.css`（去掉 Distiller 专用动画）。

- [ ] **Step 2: 实现 `cn()` helper**

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: 根 layout 暗色底**

```tsx
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
        <div className="flex min-h-screen">{children}</div>
      </body>
    </html>
  );
}
```

---

### Task 3: SQLite 层

**Files:**
- Create: `src/lib/db/schema.sql`
- Create: `src/lib/db/index.ts`
- Create: `scripts/migrate.ts`
- Create: `src/lib/db/notes.test.ts`

- [ ] **Step 1: 写 schema.sql**

包含 spec 中 7 张表：`notes`, `note_chunks`, `cards`, `interview_questions`, `chat_messages`, `progress`, `agent_modules`。

- [ ] **Step 2: 写 failing test**

```typescript
// src/lib/db/notes.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { getDb, insertNote, getNoteById } from "./index";

describe("notes", () => {
  beforeEach(() => {
    process.env.DATABASE_PATH = ":memory:";
  });
  it("inserts and reads a note", () => {
    const id = insertNote({ title: "RAG", content: "# test", week: "W1", tags: ["RAG"] });
    const note = getNoteById(id);
    expect(note?.title).toBe("RAG");
  });
});
```

- [ ] **Step 3: 实现 `getDb()` + CRUD**

Run: `pnpm test src/lib/db/notes.test.ts`  
Expected: PASS

- [ ] **Step 4: migrate 脚本**

```bash
pnpm db:migrate
```

Expected: 创建 `data/learn.db`

---

### Task 4: Sidebar + 路由壳

**Files:**
- Create: `src/components/nav/sidebar.tsx`
- Modify: `src/app/layout.tsx`
- Create: 7 个 page.tsx 占位（各返回标题）

- [ ] **Step 1: Sidebar 导航项**

链接：`/`、`/notes`、`/review`、`/chat`、`/roadmap`、`/interview`、`/my-agent`  
底部显示总进度条（读 progress 表 done/total）。

- [ ] **Step 2: layout 包裹 Sidebar + main**

```tsx
<Sidebar />
<main className="flex-1 overflow-y-auto">{children}</main>
```

- [ ] **Step 3: 浏览器点遍 7 个链接无 404**

---

### Task 5: 笔记 API + 列表/详情页

**Files:**
- Create: `src/app/api/notes/route.ts`
- Create: `src/app/api/notes/[id]/route.ts`
- Create: `src/components/notes/note-viewer.tsx`
- Create: `src/app/notes/page.tsx`
- Create: `src/app/notes/[id]/page.tsx`
- Create: `src/lib/rag/chunk.ts`

- [ ] **Step 1: chunk 函数（纯函数测试）**

```typescript
// src/lib/rag/chunk.ts
export function chunkMarkdown(text: string, maxChars = 800): string[] {
  const paragraphs = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let buf = "";
  for (const p of paragraphs) {
    if ((buf + "\n\n" + p).length > maxChars && buf) {
      chunks.push(buf);
      buf = p;
    } else {
      buf = buf ? `${buf}\n\n${p}` : p;
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}
```

- [ ] **Step 2: POST /api/notes**

Body:

```json
{
  "title": "W1 RAG 核心架构",
  "content": "# markdown...",
  "week": "W1",
  "tags": ["RAG", "part05"],
  "generateCards": true,
  "generateInterview": true
}
```

逻辑：insert note → chunk → embed each chunk → insert note_chunks → 可选 LLM 生成 cards/interview。

- [ ] **Step 3: 笔记列表页**

按 week 分组卡片展示；点击进入 `/notes/[id]`。

- [ ] **Step 4: NoteViewer 用 react-markdown 渲染**

- [ ] **Step 5: curl 验证**

```bash
curl -X POST http://localhost:3001/api/notes \
  -H 'Content-Type: application/json' \
  -d '{"title":"测试","content":"# hello","week":"W1","tags":["test"]}'
```

Expected: 返回 `{ id, title }`；浏览器 `/notes` 可见

---

### Task 6: RAG 检索 + AI 问答

**Files:**
- Create: `src/lib/rag/embed.ts`
- Create: `src/lib/rag/search.ts`
- Create: `src/lib/rag/search.test.ts`
- Create: `src/app/api/chat/route.ts`
- Create: `src/components/chat/chat-panel.tsx`
- Create: `src/app/chat/page.tsx`

- [ ] **Step 1: cosine 单测**

```typescript
// search.test.ts
import { cosineSimilarity, searchChunks } from "./search";
it("ranks closer vectors higher", () => {
  const q = [1, 0];
  const results = searchChunks(q, [
    { id: "a", embedding: [1, 0], content: "match" },
    { id: "b", embedding: [0, 1], content: "miss" },
  ], 1);
  expect(results[0].id).toBe("a");
});
```

- [ ] **Step 2: embed.ts 调 OpenAI /embeddings**

无 API key 时 fallback：确定性 hash embedding（与 agent-platform 一致，便于离线 dev）。

- [ ] **Step 3: POST /api/chat**

流程：embed(message) → searchChunks top 5 → 拼 system prompt「仅基于以下笔记回答」→ chat completion → 存 chat_messages + citations JSON。

- [ ] **Step 4: ChatPanel UI**

左侧历史 / 右侧消息气泡；输入框 + 发送；展示引用 note 标题。

---

### Task 7: 闪卡复习

**Files:**
- Create: `src/components/review/flip-card.tsx`
- Create: `src/app/api/cards/route.ts`
- Create: `src/app/api/cards/[id]/route.ts`
- Create: `src/app/review/page.tsx`
- Create: `src/lib/ai/generate-cards.ts`

- [ ] **Step 1: FlipCard 3D CSS**

点击卡片 flip；正面 question，背面 answer。

- [ ] **Step 2: GET /api/cards?mastered=0**

返回待复习列表；review 页一次展示一张。

- [ ] **Step 3: PATCH mastered**

按钮「掌握了」→ `mastered=1`, `review_count++`

- [ ] **Step 4: generate-cards.ts**

Prompt：从 note content 提取 5–8 个 QA 对，JSON 数组 `[{question, answer}]`，写入 cards 表。

---

### Task 8: 面试题库

**Files:**
- Create: `src/app/api/interview/route.ts`
- Create: `src/app/api/interview/[id]/route.ts`
- Create: `src/app/interview/page.tsx`
- Create: `src/lib/ai/generate-interview.ts`

- [ ] **Step 1: 页面布局**

顶部 topic chips：全部 / RAG / Agent / Eval / LangGraph / ProjectForge  
进度条：mastered / total

- [ ] **Step 2: 题目卡片**

默认隐藏 answer；点击「查看答案」展开；标记「已掌握」。

- [ ] **Step 3: generate-interview.ts**

从 note 提取 3–5 道面试题，带 topic + difficulty。

---

### Task 9: 学习路线 + 进度

**Files:**
- Create: `src/app/api/progress/route.ts`
- Create: `src/app/roadmap/page.tsx`
- Create: `scripts/seed-progress.ts`（或合入 seed.ts）

- [ ] **Step 1: seed 18 条 progress**

从 `work/ai-agent/shuang-plan.md` §8.1 硬编码 topic 列表（id, week, title, status）。

- [ ] **Step 2: roadmap 页**

W1–W6 折叠面板；每知识点显示 ✅/🔄/⬜；点击切换 status（PATCH）。

---

### Task 10: 我的 Agent 架构页

**Files:**
- Create: `src/app/my-agent/page.tsx`
- Create: `src/app/api/agent-modules/route.ts`
- Seed: `agent_modules` 表数据

- [ ] **Step 1: seed ProjectForge 树**

```
Supervisor (project_forge.py)
├─ DeepResearch (deep_research.py)
├─ 企业 RAG (retrieval.py)
└─ 查证知识库 (verified_knowledge.py)
基础设施: FastAPI · Eval · Docker
```

每条含 `interview_script` 一段 STAR 话术。

- [ ] **Step 2: 页面渲染**

左侧架构树 + 右侧选中模块详情（description, code_path, interview_script 高亮框）。

---

### Task 11: 首页仪表盘

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: 四块卡片**

今日最新笔记、待复习闪卡数、面试题掌握率、当前周主题（W1 RAG）。

- [ ] **Step 2: 快捷入口按钮**

→ `/notes` `/review` `/chat` `/interview`

---

### Task 12: 种子数据 + Agent 约定

**Files:**
- Create: `scripts/seed.ts`
- Create: `AGENTS.md`
- Create: `README.md`

- [ ] **Step 1: seed.ts 导入现有笔记**

读取 `../work/ai-agent/docs/21-w1-rag-eval-study-notes.md`，POST 等价逻辑写入 DB。

- [ ] **Step 2: AGENTS.md 写入约定**

```markdown
学完 agent 课程一个章节后：
curl -X POST http://localhost:3001/api/notes -H 'Content-Type: application/json' -d @note.json
并 PATCH /api/progress 更新对应 topic status=done
```

- [ ] **Step 3: README 启动说明**

`pnpm install && pnpm db:migrate && pnpm seed && pnpm dev`

---

### Task 13: 验收

- [ ] **Step 1: 全路由手动走通**

7 页 + POST note + chat 提问「什么是 RRF」有引用

- [ ] **Step 2: vitest 全绿**

Run: `pnpm test`  
Expected: db + search tests PASS

- [ ] **Step 3: 更新 work/ai-agent/shuang-plan.md**

在 §七 增加 ai-learn-hub 链接与启动命令

---

## Spec Coverage Check

| Spec 需求 | Task |
|---|---|
| 7 页面 | Task 4, 5, 7, 8, 9, 10, 11 |
| Agent POST 笔记 | Task 5 |
| 全局 RAG 问答 | Task 6 |
| 翻转闪卡 | Task 7 |
| 面试题库 | Task 8 |
| Agent 架构页 | Task 10 |
| SQLite 四表+ | Task 3 |
| Skill-Distiller UI | Task 2 |
| 种子数据 | Task 12 |

## Execution Handoff

Plan saved to `ai-learn-hub/docs/superpowers/plans/2026-07-05-ai-learn-hub.md`.

**两种执行方式：**

1. **Subagent-Driven（推荐）** — 每个 Task 派生子 agent，逐 task  review  
2. **Inline Execution** — 本会话直接按 Task 1→13 实现，每 2–3 task 汇报进度

你想用哪种方式开始写代码？
