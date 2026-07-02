# 00 文档索引

> 更新：2026-07-01。所有项目文档按阅读/执行顺序编号。**从本文开始。**

---

## 一、入口（根目录）

| 序号 | 文档 | 用途 |
|---|---|---|
| — | [README.md](../README.md) | 项目总览、每日流程、成果标准、运行命令 |
| — | [AGENTS.md](../AGENTS.md) | Codex/Agent 执行规则 |
| — | [CLAUDE.md](../CLAUDE.md) | Claude 执行规则 |
| — | [agent.md](../agent.md) | Agent 入口摘要 |

---

## 二、规划与架构（01–07）

| 序号 | 文档 | 用途 | 何时读 |
|---|---|---|---|
| **02** | [02-30-day-sprint.md](02-30-day-sprint.md) | 30 天每日学习任务 | **每天第一件事** |
| **03** | [03-architecture-overview.md](03-architecture-overview.md) | 顶层架构定稿（五层 + 数据流） | 理解全局 / 面试前 |
| **04** | [decisions/0001-python-java-hybrid.md](decisions/0001-python-java-hybrid.md) | 技术栈决策：Python AI + Java 工具 | 技术取舍时 |
| **05** | [05-tech-stack-roadmap.md](05-tech-stack-roadmap.md) | 完整技术栈学习路线 | 选技术 / 排优先级 |
| **06** | [06-portfolio-projects.md](06-portfolio-projects.md) | 作品集交付标准 | 做 feature 前 |
| **07** | [07-source-map.md](07-source-map.md) | 本地 `agent/` 课程资料映射 | 每天学习时 |

---

## 三、求职与岗位（08–13）

| 序号 | 文档 | 用途 | 何时读 |
|---|---|---|---|
| **08** | [08-job-market-hangzhou.md](08-job-market-hangzhou.md) | 杭州岗位画像与关键词 | 筛岗前 |
| **09** | [09-job-skills-matrix.md](09-job-skills-matrix.md) | 90+ 项技能矩阵 | 对照差距时 |
| **10** | [10-application-conversion-kit.md](10-application-conversion-kit.md) | JD→项目证据、投递规则 | 写简历 / 投 BOSS |
| **11** | [11-resume-and-interview-pack.md](11-resume-and-interview-pack.md) | **简历+面试话术（可直接复制）** | 投递 / 面试前 |
| **12** | [12-interview-kit.md](12-interview-kit.md) | 面试材料精简版 | 快速复习 |
| **13** | [13-project-completion-audit.md](13-project-completion-audit.md) | 完成度审查与证据 | 复盘 / 门禁前 |

---

## 四、行业情报与长线（14–16）

| 序号 | 文档 | 用途 | 何时读 |
|---|---|---|---|
| **14** | [14-ai-industry-watch.md](14-ai-industry-watch.md) | 每日行业资讯规则 | 每天早上 |
| **14** | [14-industry-watch-sources.json](14-industry-watch-sources.json) | RSS 来源配置 | 脚本/自动化 |
| **15** | [15-5-year-growth-map.md](15-5-year-growth-map.md) | 30→35 岁成长路线 | 月度复盘 |
| **16** | [16-master-implementation-plan.md](16-master-implementation-plan.md) | 主实施计划与 Feature 015+ 路线 | 继续开发前 |

---

## 五、日志模板（T01–T05）

| 序号 | 模板 | 输出路径 |
|---|---|---|
| **T01** | [templates/T01-daily-log.md](templates/T01-daily-log.md) | `logs/daily/YYYY-MM-DD.md` |
| **T02** | [templates/T02-industry-news-log.md](templates/T02-industry-news-log.md) | `logs/industry/YYYY-MM-DD.md` |
| **T03** | [templates/T03-boss-message.md](templates/T03-boss-message.md) | BOSS 打招呼复制 |
| **T04** | [templates/T04-boss-screening-log.md](templates/T04-boss-screening-log.md) | `logs/applications/YYYY-MM-DD-boss-screening.md` |
| **T05** | [templates/T05-skills-gap-review.md](templates/T05-skills-gap-review.md) | `logs/applications/skills-gap-review.md` |

---

## 六、代码与规格（portfolio + specs）

### 作品集代码

| 组件 | README | 端口 |
|---|---|---|
| Agent Platform | [portfolio/agent-platform/README.md](../portfolio/agent-platform/README.md) | 8000 |
| Agent Web | [portfolio/agent-web/README.md](../portfolio/agent-web/README.md) | 3000 |
| Java 工具服务 | [portfolio/java-business-tool-service/README.md](../portfolio/java-business-tool-service/README.md) | 8080 |
| MCP Tool Server | [portfolio/mcp-tool-server/README.md](../portfolio/mcp-tool-server/README.md) | stdio |
| Eval Dashboard | [portfolio/agent-eval-dashboard/README.md](../portfolio/agent-eval-dashboard/README.md) | CLI |

### Feature 规格（按编号）

| Spec | 能力 |
|---|---|
| [001](../specs/001-agent-platform/) | Agent 核心 |
| [002](../specs/002-agent-platform-api/) | FastAPI |
| [003](../specs/003-java-business-tool-service/) | Java 工具服务 |
| [004](../specs/004-agent-java-tool-integration/) | Python↔Java 集成 |
| [005](../specs/005-openapi-mcp-tool-contract/) | OpenAPI/MCP 契约 |
| [006](../specs/006-docker-compose-runtime/) | Docker Compose |
| [007–009](../specs/007-agent-eval-dashboard/) | 评估 Dashboard |
| [010](../specs/010-openai-compatible-llm-adapter/) | LLM 适配器 |
| [011–012](../specs/011-qdrant-vector-retrieval/) | Qdrant + 混合检索 |
| [013](../specs/013-industry-watch-automation/) | 行业资讯自动化 |
| [014](../specs/014-prompt-safety-and-session/) | 安全 + 会话 |
| **015+** | 见 [16-master-implementation-plan.md](16-master-implementation-plan.md) |

---

## 七、每日执行顺序（推荐）

```text
1. 读 02-30-day-sprint.md 当天任务
2. 按 07-source-map.md 学课程
3. 跑 14 行业资讯 → 写 logs/industry/
4. 写 T01 每日日志 → logs/daily/
5. 推作品集代码或文档
6. 每 3 天：08 刷 BOSS + T04 筛岗表
7. 投递前：11 简历话术 + 12 面试复习
8. 周末：13 完成度审查 + T05 技能复盘
```

---

## 八、运行与门禁

```bash
# 完成门禁
python3 scripts/completion_gate.py --root .

# 全栈演示
docker compose up --build
# Web http://127.0.0.1:3000  API http://127.0.0.1:8000
```

---

## 九、归档（历史设计，非日常必读）

| 路径 | 说明 |
|---|---|
| [superpowers/plans/2026-06-26-ai-agent.md](superpowers/plans/2026-06-26-ai-agent.md) | 初始实施计划 |
| [superpowers/specs/2026-06-26-ai-agent-design.md](superpowers/specs/2026-06-26-ai-agent-design.md) | 初始设计 |
