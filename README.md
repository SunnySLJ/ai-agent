# AI Agent Engineer Career

这个项目的目标很直接：用 1 个月把 5 年 Java 后端经验转成可面试、可展示、可持续成长的 AI Agent/RAG 应用工程师能力。

当前定位：
- 城市：杭州
- 目标薪资：先冲 20K 左右，再看 20-40K 区间
- 背景：5 年 Java 工程师，不转纯算法岗，走 Python Agent/RAG + Java 业务后端的混合工程路线
- 时间窗口：2026-06-27 到 2026-07-26 第一轮冲刺
- 长线目标：35 岁前形成 AI Agent 工程能力、作品集、行业判断和可复用方法论

## 每天怎么用

1. 打开 [docs/30-day-sprint.md](docs/30-day-sprint.md)，执行当天任务。
2. 按 [docs/source-map.md](docs/source-map.md) 只学当天需要的 `../../agent/` 资料。
3. 每天写一份 `logs/daily/YYYY-MM-DD.md`，模板在 [docs/templates/daily-log.md](docs/templates/daily-log.md)。
4. 每周至少推进一个作品集交付，路径见 [portfolio](portfolio)。
5. 每 3 天用 [docs/job-market-hangzhou.md](docs/job-market-hangzhou.md) 刷一次 BOSS 直聘关键词，修正学习重点。

## 成果标准

一个月后必须能拿出去讲清楚：

- 一个 Python AI Agent/RAG 主项目：企业知识库 + 工具调用 + 可评估链路。
- 一个 Agent 评估与观测小项目：能解释命中率、召回率、幻觉、trace、回放。
- 一个 Java 业务工具服务 + MCP 工具小项目：能把 Java 后端服务包装成 Agent 可调用工具。
- 一套面试材料：简历项目描述、自我介绍、BOSS 打招呼话术、技术问答。

## 当前已实现

- `portfolio/agent-platform/`：Python Agent/RAG core + FastAPI API + Java HTTP tool adapter。
- `portfolio/agent-eval-dashboard/`：Python eval runner，读取 JSONL 数据集并输出 Agent 评估 JSON/Markdown 报告。
- `portfolio/java-business-tool-service/`：Spring Boot 业务工具服务，包含订单、工单、待办、审计和结构化错误。
- `specs/004-agent-java-tool-integration/`：Python Agent 调 Java 工具服务的集成 feature 文档和 TDD 任务。
- `compose.yaml`：一键启动 Python Agent API + Java Business Tool Service，并通过 `JAVA_TOOL_BASE_URL` 自动接入 Java 工具。

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

## Docker Compose 演示

先校验 Compose 配置：

```bash
docker compose -f compose.yaml config
```

Docker daemon 已启动时运行：

```bash
docker compose up --build
```

验证：

```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8080/health

curl -X POST http://127.0.0.1:8000/ask \
  -H 'Content-Type: application/json' \
  -d '{"question":"查询订单 ORD-1001 的状态"}'
```

停止：

```bash
docker compose down
```

## 文档地图

- [AGENTS.md](AGENTS.md)：给 Codex/Agent 的执行规则。
- [CLAUDE.md](CLAUDE.md)：给 Claude 的执行规则。
- [docs/job-market-hangzhou.md](docs/job-market-hangzhou.md)：杭州岗位画像。
- [docs/tech-stack-roadmap.md](docs/tech-stack-roadmap.md)：完整技术栈路线。
- [docs/application-conversion-kit.md](docs/application-conversion-kit.md)：把项目转成简历、BOSS 话术和面试讲法。
- [docs/30-day-sprint.md](docs/30-day-sprint.md)：一个月冲刺计划。
- [docs/source-map.md](docs/source-map.md)：本地课程资料映射。
- [docs/portfolio-projects.md](docs/portfolio-projects.md)：作品集拆解。
- [docs/interview-kit.md](docs/interview-kit.md)：面试与求职材料。
- [docs/5-year-growth-map.md](docs/5-year-growth-map.md)：30 到 35 岁成长路线。
