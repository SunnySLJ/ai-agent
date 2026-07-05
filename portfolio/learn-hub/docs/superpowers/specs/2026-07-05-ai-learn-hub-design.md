# AI Learn Hub 设计规格

> **日期：** 2026-07-05  
> **状态：** 已确认  
> **参考 UI：** `../../shuang-skill/Skill-Distiller`（Linear 暗色 + emerald 品牌色）

---

## 1. 背景与目标

用户当前通过 Markdown 文档 + Cursor Agent 学习 Python AI Agent/RAG 课程，但缺少**可在浏览器打开**的统一学习入口。

**目标：** 新建独立 Web 项目 `ai-learn-hub`，提供：

- 学习笔记浏览（Agent 自动生成写入）
- 六周学习路线与进度
- 翻转闪卡复习
- 全局 AI 提问（基于所有已学笔记 RAG）
- 面试题库（按主题、可自测）
- ProjectForge Agent 架构讲解（面试话术）

**非目标（MVP 不做）：**

- 公网部署 / 多用户账号
- 手动 Markdown 编辑器（Agent 写入为主）
- 接入 ProjectForge FastAPI 作为问答后端（独立轻量 RAG 即可）

---

## 2. 技术方案（方案 B · 已确认）

| 层 | 选型 | 说明 |
|---|---|---|
| 前端 | Next.js 14 App Router + Tailwind v4 | 复用 Skill-Distiller 视觉 token |
| API | Next.js Route Handlers | 笔记 CRUD、闪卡、聊天、进度 |
| 数据库 | SQLite + better-sqlite3 | 单文件 `data/learn.db`，零运维 |
| AI | OpenAI 兼容 API | Embedding + Chat；可用现有 LanYi 端点 |
| 向量检索 | SQLite 存 chunk embedding + 内存 cosine | MVP 笔记量 <500 足够 |

**项目位置：** `../../ai-learn-hub/`（与 `work/ai-agent`、`shuang-skill` 同级）

---

## 3. 信息架构 · 7 个页面

| 路由 | 页面 | 核心功能 |
|---|---|---|
| `/` | 首页仪表盘 | 今日学习、进度概览、快捷入口 |
| `/notes` | 笔记列表 | 按周次/标签筛选 |
| `/notes/[id]` | 笔记详情 | Markdown 渲染、关联闪卡/面试题 |
| `/review` | 闪卡复习 | 翻转卡片、标记已掌握 |
| `/chat` | AI 提问 | 全局 RAG 对话、历史记录 |
| `/roadmap` | 学习路线 | W1–W6 主题、§8.1 知识点打勾 |
| `/interview` | 面试题库 | 主题筛选、点击看答案、掌握进度 |
| `/my-agent` | 我的 Agent | ProjectForge 架构树 + 面试讲法 |

导航：左侧固定 Sidebar（与 Skill-Distiller 一致）。

---

## 4. 数据模型（SQLite）

### 4.1 `notes`

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT PK | uuid |
| title | TEXT | 笔记标题 |
| content | TEXT | Markdown 正文 |
| week | TEXT | W1–W6 |
| tags | TEXT | JSON 数组，如 `["RAG","part05"]` |
| source | TEXT | 可选，课程路径 |
| created_at | TEXT | ISO8601 |
| updated_at | TEXT | ISO8601 |

### 4.2 `note_chunks`（RAG 用）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT PK | uuid |
| note_id | TEXT FK | 所属笔记 |
| chunk_index | INTEGER | 序号 |
| content | TEXT | 切片文本 |
| embedding | TEXT | JSON 浮点数组 |

### 4.3 `cards`

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT PK | uuid |
| note_id | TEXT FK | 来源笔记 |
| question | TEXT | 正面 |
| answer | TEXT | 背面 |
| mastered | INTEGER | 0/1 |
| review_count | INTEGER | 复习次数 |
| last_reviewed | TEXT | ISO8601 |

### 4.4 `interview_questions`

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT PK | uuid |
| topic | TEXT | RAG / Agent / Eval / LangGraph / ProjectForge |
| question | TEXT | 面试题 |
| answer | TEXT | 标准答案 |
| difficulty | TEXT | easy / medium / hard |
| mastered | INTEGER | 0/1 |
| note_id | TEXT | 可选关联笔记 |

### 4.5 `chat_messages`

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT PK | uuid |
| session_id | TEXT | 会话分组 |
| role | TEXT | user / assistant |
| content | TEXT | 消息正文 |
| citations | TEXT | JSON，引用的 note/chunk id |
| created_at | TEXT | ISO8601 |

### 4.6 `progress`

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT PK | topic_id，如 `rag-hybrid-search` |
| week | TEXT | W1–W6 |
| title | TEXT | 知识点名称 |
| status | TEXT | done / learning / todo |
| updated_at | TEXT | ISO8601 |

### 4.7 `agent_modules`（/my-agent 静态内容，可种子数据）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT PK | 模块 id |
| name | TEXT | 如 DeepResearch |
| parent_id | TEXT | Supervisor 子节点 |
| description | TEXT | 职责说明 |
| code_path | TEXT | 如 `retrieval.py` |
| interview_script | TEXT | 「面试时这样说」 |

---

## 5. API 设计

### 5.1 笔记（Agent 主入口）

```
POST /api/notes
Body: { title, content, week, tags?, source?, generateCards?, generateInterview? }
→ 写入 notes → 切分 chunk → embedding → 可选生成 cards + interview_questions
```

```
GET /api/notes?week=W1&tag=RAG
GET /api/notes/[id]
```

### 5.2 闪卡

```
GET /api/cards?week=W1&mastered=0
PATCH /api/cards/[id]  { mastered, review_count }
POST /api/cards/generate  { noteId }  // 从单篇笔记 LLM 提取 QA
```

### 5.3 面试题

```
GET /api/interview?topic=RAG
PATCH /api/interview/[id]  { mastered }
POST /api/interview/generate  { noteId }
```

### 5.4 AI 问答

```
POST /api/chat
Body: { message, sessionId? }
→ embed query → top-k chunks → LLM + citations → 存 chat_messages
```

### 5.5 进度

```
GET /api/progress
PATCH /api/progress/[id]  { status }
POST /api/progress/seed   // 从 shuang-plan §8.1 初始化 18 条
```

---

## 6. Agent 写入工作流

```text
用户在 Cursor 说「agent 课程学习开始」
  → Agent 读 ../../agent/partXX notebook
  → Agent 对照 work/ai-agent 代码写笔记
  → Agent 调用 POST http://localhost:3001/api/notes
  → 服务端：入库 + embedding + 自动生成闪卡/面试题
  → 用户打开浏览器刷新即可见
```

**Agent 约定（写入 AGENTS.md）：**

- 学完一个 part/章节 → 调一次 `POST /api/notes`
- `generateCards: true`, `generateInterview: true` 默认开启
- 同步 `PATCH /api/progress` 更新知识点状态

---

## 7. UI 规范

复用 Skill-Distiller `globals.css` 设计 token：

- 背景：`hsl(240 5% 5%)`
- 品牌色：emerald `hsl(158 80% 45%)`
- 卡片：`.card` 细边框 + hover
- 字体：Inter / PingFang SC + JetBrains Mono

**闪卡交互：** CSS 3D flip，正面问题 / 背面答案，按钮「掌握了 / 再看一遍」。

**面试题：** 默认隐藏答案，点击展开（非 flip，列表更适合）。

---

## 8. 种子数据（MVP 首日可见）

启动时 `scripts/seed.ts` 导入：

1. `work/ai-agent/docs/21-w1-rag-eval-study-notes.md` → note W1
2. `work/ai-agent/shuang-plan.md` §8.1 → progress 18 条
3. `work/ai-agent/docs/17-project-forge-master-plan.md` → agent_modules 树
4. 笔记内已有面试 Q&A → interview_questions

---

## 9. 运行方式

```bash
cd ai-learn-hub
pnpm install
pnpm db:migrate
pnpm seed
pnpm dev   # http://localhost:3001
```

环境变量 `.env.local`：

```
OPENAI_API_KEY=...
OPENAI_BASE_URL=...   # 可选，LanYi 兼容端点
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

---

## 10. 测试策略

- `lib/db/*.test.ts`：SQLite CRUD
- `lib/rag/search.test.ts`：cosine top-k 确定性
- `app/api/notes/route.test.ts`：POST 笔记 + chunk 数量
- 手动：浏览器走通 7 页 + Agent POST 一条笔记

---

## 11. 与现有仓库关系

```text
../../agent/              课程（只读）
work/ai-agent/            作品集 + 学习源文档
../../shuang-skill/       UI 参考
ai-learn-hub/             本项目的 Web 学习台（新建）
```

---

## 12. 后续迭代（非 MVP）

-  spaced repetition 算法（SM-2）调度闪卡
-  与 ProjectForge API 联合 demo
-  导出 PDF 面试小抄
-  公网部署

---

## 13. 验收标准

- [ ] `pnpm dev` 可打开 7 个页面，风格接近 Skill-Distiller
- [ ] `POST /api/notes` 写入后笔记、闪卡、面试题可见
- [ ] `/chat` 能基于已入库笔记回答并显示引用
- [ ] `/review` 翻转闪卡 + 掌握状态持久化
- [ ] `/my-agent` 展示 ProjectForge 三引擎 + 面试话术
- [ ] `/roadmap` 展示 W1–W6 + 18 知识点进度
