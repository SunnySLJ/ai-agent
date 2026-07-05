# AI Learn Hub

`work/ai-agent` 项目内的浏览器学习台：笔记、闪卡、RAG 问答、面试题库、学习路线与 ProjectForge 架构浏览。

## 一键启动（推荐）

在项目根目录 `work/ai-agent/`：

```bash
./start-learn.sh
```

日常重启（跳过 seed，更快）：

```bash
./start-learn.sh --skip-seed
```

浏览器打开 [http://localhost:3001](http://localhost:3001)

## 手动启动

```bash
cd portfolio/learn-hub
export DATABASE_PATH=../../data/learn.db
pnpm install
pnpm db:migrate
pnpm seed
pnpm dev
```

## 数据持久化

所有学习数据保存在 **`work/ai-agent/data/learn.db`**（SQLite），包括：

- 笔记与 RAG 向量块
- 闪卡、面试题
- 学习进度与学习步骤
- AI 聊天记录

重启服务后数据不会丢失。

## 环境变量（可选）

在 `portfolio/learn-hub/.env.local` 创建：

```env
DATABASE_PATH=../../data/learn.db
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

无 API Key 时：embedding 使用 hash 回退，闪卡/面试题使用规则生成。

## 脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 开发服务器（端口 3001） |
| `pnpm build` | 生产构建 |
| `pnpm db:migrate` | 初始化 SQLite 表 |
| `pnpm seed` | 导入 §8.1 进度、ProjectForge 树、W1/W2 笔记 |
| `pnpm test` | Vitest 单元测试 |

## 页面

| 路由 | 功能 |
|------|------|
| `/` | 仪表盘：最新笔记、待复习闪卡、面试掌握率、当前周 |
| `/notes` | 笔记列表 |
| `/review` | 闪卡复习 |
| `/chat` | RAG 问答 |
| `/roadmap` | W1–W6 学习路线与知识点打勾 |
| `/interview` | 面试题库 |
| `/my-agent` | ProjectForge 架构树与面试讲法 |

## Agent 写入

学完 agent 课程章节后，由 Cursor Agent 调用 `POST /api/notes` 写入笔记。详见 [AGENTS.md](./AGENTS.md)。
