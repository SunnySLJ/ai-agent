# AI Agent: Python Career Project

这个项目的目标很直接：用 1 个月把后端经验转成可面试、可展示、可持续成长的 **Python AI Agent/RAG 应用工程师** 能力。

当前定位：
- 城市：杭州
- 目标薪资：先冲 20K 左右，再看 20-40K 区间
- 背景：后端工程师转型，走 **纯 Python Agent/RAG 应用** 路线
- 技术栈：Python（FastAPI + LangGraph 风格编排 + Qdrant + 进程内业务工具）
- 时间窗口：2026-06-27 到 2026-07-26 第一轮冲刺
- 长线目标：35 岁前形成 AI Agent 工程能力、作品集、行业判断和可复用方法论

## 每天怎么用

0. **浏览器学习台**：运行 `./start-learn.sh`，打开 [http://localhost:3001](http://localhost:3001)（笔记、闪卡、路线、面试题、RAG 问答）。
1. 打开 [docs/02-30-day-sprint.md](docs/02-30-day-sprint.md)，执行当天任务。
2. 按 [docs/07-source-map.md](docs/07-source-map.md) 只学当天需要的 `../../agent/` 资料。
3. 按 [docs/14-ai-industry-watch.md](docs/14-ai-industry-watch.md) 每天定时收集 AI 行业资讯，写入 `logs/industry/YYYY-MM-DD.md`。
4. 每天写一份 `logs/daily/YYYY-MM-DD.md`，模板在 [docs/templates/T01-daily-log.md](docs/templates/T01-daily-log.md)。
5. 每周至少推进一个作品集交付，路径见 [portfolio](portfolio)。
6. 每 3 天用 [docs/08-job-market-hangzhou.md](docs/08-job-market-hangzhou.md) 刷一次 BOSS 直聘关键词，修正学习重点。

## 成果标准

一个月后必须能拿出去讲清楚：

- 一个 Python AI Agent/RAG 主项目：企业知识库 + 工具调用 + 可评估链路。
- 一个 Agent 评估与观测小项目：能解释命中率、召回率、幻觉、trace、回放。
- 一个 MCP/OpenAPI 契约小项目：描述 Agent Platform 的 RAG HTTP 接口。
- 一套面试材料：简历项目描述、自我介绍、BOSS 打招呼话术、技术问答。
- 一套 AI 行业情报日志：每天把最新资讯转成学习重点、作品集 backlog 和面试谈资。

## 当前已实现

- `portfolio/agent-platform/`：Python Agent/RAG core + FastAPI API，专注**企业知识库问答**（检索、引用、拒答、trace）。
- `portfolio/agent-eval-dashboard/`：Python eval runner，读取 JSONL 数据集并输出 Agent 评估 JSON/Markdown 报告。
- `OpenAICompatibleChatClient`：可选接入 OpenAI-compatible Chat Completion，默认仍保持离线确定性。
- `QdrantVectorIndex`：可选接入 Qdrant 向量库，支持 deterministic embedding、chunk upsert、vector query 和 citation。
- `safety.py` + `session.py`：Prompt 注入拦截、多轮会话 `session_id` 与 `GET /sessions/{id}`。
- `approval.py` + `POST /approvals/{id}/confirm`：Human-in-the-loop 基础设施（当前无写操作工具，预留扩展）。
- `graph_orchestrator.py`：LangGraph 风格状态机编排（safety → retrieve → tools → compose）。
- `document_parser.py`：`/documents` 支持 `content_type=application/pdf`（base64 编码）。
- `POST /ask/stream`：SSE 流式输出，事件类型 `meta` / `token` / `done`。
- `portfolio/agent-web/`：Next.js Web 控制台（:3000），连接 FastAPI，支持对话、流式、入库、审批和 eval 概览。
- `portfolio/learn-hub/`：浏览器学习台（:3001），SQLite 持久化笔记/闪卡/进度/面试题/RAG 问答。
- `embeddings.py`：`OpenAICompatibleEmbeddingModel` 接入 `/embeddings`；设置 `OPENAI_EMBEDDING_MODEL` 后 Qdrant 与混合检索自动切换真实向量。
- `specs/004-agent-java-tool-integration/`：历史文档（Java 集成已删除，业务工具现为纯 Python 演示）。
- `compose.yaml`：一键启动 Web + Python Agent API + Qdrant。

## Agent 评估演示

运行当前离线确定性评估集：

```bash
cd portfolio/agent-eval-dashboard
PYTHONPATH=../agent-platform/src:src python3 -m agent_eval_dashboard.cli \
  --dataset ../agent-platform/data/eval_dataset.jsonl \
  --json-out reports/latest.json \
  --md-out reports/latest.md
```

报告会输出通过率、拒答率、工具调用成功率、平均延迟、token 估算和失败分类。

## AI 行业资讯自动采集

手动运行每日行业资讯采集：

```bash
python3 scripts/industry_watch.py \
  --sources docs/14-industry-watch-sources.json \
  --out-dir logs/industry
```

GitHub Actions 会每天 01:00 UTC 自动运行一次，对应北京时间 09:00。脚本只使用 RSS/Atom 等一手来源；单个来源失败会写入日志的“待复核”，不会伪造成已验证资讯。

## 最终完成门禁

检查 GitHub 推送、workflow scope 和技能差距复盘是否都完成，并输出下一步动作：

```bash
python3 scripts/completion_gate.py --root .
```

返回 `Complete: yes` 前，不要把长期目标标记为完成；如果返回 `Complete: no`，按 `Next Actions` 顺序处理。

## Docker Compose 演示

服务依赖与健康检查已配置：`agent-platform` 通过 `curl /health` 探活，`agent-web` 等待 API healthy 后启动。

先校验 Compose 配置：

```bash
docker compose -f compose.yaml config
```

Docker daemon 已启动时运行：

```bash
docker compose up --build
```

访问 Web 控制台：<http://127.0.0.1:3000>（默认 Tab：ProjectForge 工作台）

验证：

```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8080/health
curl http://127.0.0.1:6333/healthz

curl -X POST http://127.0.0.1:8000/project-forge/demo \
  -H 'Content-Type: application/json' \
  -d '{"idea":"演示 ProjectForge 九阶段"}'

curl -X POST http://127.0.0.1:8000/deep-research/run \
  -H 'Content-Type: application/json' \
  -d '{"query":"AI Agent 企业知识库调研"}'
```

停止：

```bash
docker compose down
```

## 浏览器学习台

一键启动（SQLite 数据保存在 `data/learn.db`）：

```bash
./start-learn.sh
```

日常重启（跳过 seed）：

```bash
./start-learn.sh --skip-seed
```

访问 [http://localhost:3001](http://localhost:3001) — 笔记、闪卡、学习路线、面试题、RAG 问答。详见 [portfolio/learn-hub/README.md](portfolio/learn-hub/README.md)。

## Skill 制作与升级

本项目已安装 `shuang-skill` 工作流（39 个 skills + 进化脚本）。Cursor/Codex 打开 `work/ai-agent/` 时会自动发现 `.codex/skills/`。

**Skill Studio（Web 界面，制作 / 演化 skill）：**

```bash
./start-skill-studio.sh
```

访问 [http://localhost:3270](http://localhost:3270) — `/library` 浏览 skill，`/evolve/theater` 做 skill 升级演化。

**命令行升级 skill（任务复盘后）：**

```bash
node scripts/create-evolution-note.mjs --title "本次任务经验"
node scripts/evolution-review.mjs --json
node scripts/evolution-promotion-package.mjs --note docs/skill-evolution/inbox/xxx.md
```

升级后的 skill 可同步回源仓库：

```bash
node scripts/shuang-skill-manager.mjs sync-back --apply
```

详见 [docs/skill-evolution/auto-upgrade-system.md](docs/skill-evolution/auto-upgrade-system.md)、[docs/shuang-skill/new-project-quickstart.md](docs/shuang-skill/new-project-quickstart.md)。

## 文档地图

- [docs/00-document-index.md](docs/00-document-index.md)：**文档总索引（按序号，从这里开始）**
- [AGENTS.md](AGENTS.md)：给 Codex/Agent 的执行规则。
- [CLAUDE.md](CLAUDE.md)：给 Claude 的执行规则。
- [docs/03-architecture-overview.md](docs/03-architecture-overview.md)：项目顶层架构定稿。
- [docs/decisions/0001-python-java-hybrid.md](docs/decisions/0001-python-java-hybrid.md)：最终技术栈决策，明确 Python + Java 混合路线。
- [docs/08-job-market-hangzhou.md](docs/08-job-market-hangzhou.md)：杭州岗位画像。
- [docs/09-job-skills-matrix.md](docs/09-job-skills-matrix.md)：公开 JD 多源汇总的 90+ 项技能矩阵与缺口分析。
- [docs/14-ai-industry-watch.md](docs/14-ai-industry-watch.md)：每日 AI 行业资讯收集规则。
- [docs/05-tech-stack-roadmap.md](docs/05-tech-stack-roadmap.md)：完整技术栈路线。
- [docs/10-application-conversion-kit.md](docs/10-application-conversion-kit.md)：把项目转成简历、BOSS 话术和面试讲法。
- [logs/applications](logs/applications)：BOSS 岗位复核、投递和反馈日志。
- [docs/13-project-completion-audit.md](docs/13-project-completion-audit.md)：当前完成度、证据和剩余缺口。
- [docs/02-30-day-sprint.md](docs/02-30-day-sprint.md)：一个月冲刺计划。
- [docs/07-source-map.md](docs/07-source-map.md)：本地课程资料映射。
- [docs/06-portfolio-projects.md](docs/06-portfolio-projects.md)：作品集拆解。
- [docs/12-interview-kit.md](docs/12-interview-kit.md)：面试与求职材料。
- [docs/11-resume-and-interview-pack.md](docs/11-resume-and-interview-pack.md)：简历与面试话术包（可直接复制）。
- [docs/15-5-year-growth-map.md](docs/15-5-year-growth-map.md)：30 到 35 岁成长路线。
