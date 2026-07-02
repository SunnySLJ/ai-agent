# AGENTS.md

## 项目使命

帮助一名 5 年 Java 工程师在 1 个月内完成 AI Agent/RAG 应用工程师求职准备，并在 35 岁前持续成长为能独立设计、落地、评估和维护 AI Agent 系统的工程师。

## 固定约束

- 不移动、不重命名、不改写 `../../agent/` 课程资料。
- 所有学习计划必须从杭州 AI Agent/RAG/大模型应用岗位倒推。
- 默认岗位方向是 Python Agent/RAG + Java 后端业务集成工程师，不是纯算法研究岗。
- 技术路线必须保留 Java 业务工具层；TypeScript 可以作为以后前端展示补充，但不能替代 Java 在本项目里的位置。
- 最终技术栈决策见 `docs/decisions/0001-python-java-hybrid.md`；后续规划和实现不得绕开这个边界。
- 文档必须服务求职和作品集，不写空泛鸡血内容。
- 目标薪资先按杭州 20K 左右设计，能力目标向 20-40K 区间靠近。
- 所有新增项目资料放在本目录内，不污染父级课程目录。

## 工作方式

每次处理学习或求职任务时：

1. 先读 [README.md](README.md) 和相关主题文档。
2. 如果涉及学习安排，先查 [docs/07-source-map.md](docs/07-source-map.md)，只引用当天需要的 `../../agent/` 资料。
3. 如果涉及岗位判断，先查 [docs/08-job-market-hangzhou.md](docs/08-job-market-hangzhou.md)，再结合最新招聘结果修正。
4. 如果涉及技术取舍，按 [docs/05-tech-stack-roadmap.md](docs/05-tech-stack-roadmap.md) 的优先级执行。
5. 如果涉及作品集，按 [docs/06-portfolio-projects.md](docs/06-portfolio-projects.md) 的交付标准推进。
6. 每天按 [docs/14-ai-industry-watch.md](docs/14-ai-industry-watch.md) 定时收集 AI 行业资讯：自动入口是 `.github/workflows/industry-watch.yml`，手动入口是 `python3 scripts/industry_watch.py --sources docs/14-industry-watch-sources.json --out-dir logs/industry`；输出写入 `logs/industry/YYYY-MM-DD.md`，并转成学习、作品集或求职动作。
7. 每次学习后更新 `logs/daily/`，沉淀今天学了什么、做了什么、明天要补什么。

## Agent 可调用的本地资料

核心资料都在父级 `../../agent/`：

- LLM API 与本地部署：`../../agent/part01-agent-api`、`../../agent/part02-agent-local`
- Agent 基础：`../../agent/part03-agent-basic`
- LangChain / DeepAgents：`../../agent/part04-agent-langchain`
- RAG / LlamaIndex：`../../agent/part05-agent-rag`、`../../agent/part06-agent-llamaindex`
- Agent Skills：`../../agent/part07-agent-skills`
- Memory / Context：`../../agent/part08-agent-memory`、`../../agent/part09-agent-context`
- FastAPI / 部署：`../../agent/part10-agent`、`../../agent/part12-agent-docker`
- Agent 设计、评估、多智能体：`../../agent/part11-agent-design`、`../../agent/part13-agent-score`、`../../agent/part14-agent-help`
- OpenClaw / Claude Code / Harness：`../../agent/part20-agent-openclaw` 到 `../../agent/part25-agent-openclaw-special`
- 综合案例：`../../agent/part22-agent-workspace`

## 技术选型边界

- Python 负责 AI 主链路：LLM API、Prompt、Function Calling、Agent 编排、RAG、文档解析、Embedding、向量检索、评估、trace、FastAPI、后续 LangGraph/LlamaIndex。
- Java 负责企业业务工具层：订单、工单、CRM/ERP 类接口、权限、审计、幂等、事务、限流、日志和稳定部署。
- MCP/OpenAPI/HTTP tool client 负责工具接入：把 Java 业务能力安全暴露给 Python Agent。
- 第一个月不把主 RAG/Agent 链路写成全 Java；Spring AI 只作为 Java 侧补充能力和面试对比材料。
- 新 feature 默认先判断是否属于 AI 链路；属于 AI 链路就优先落在 `portfolio/agent-platform/` 的 Python 侧，只有业务系统能力才落在 Java 服务。

## 每日闭环

每天最少完成：

- 45 分钟岗位相关学习。
- 20 分钟 AI 行业资讯收集，只记录可影响求职或作品集的内容。
- 60 分钟作品集编码或文档沉淀。
- 15 分钟面试表达训练。
- 10 分钟日志复盘。

每天日志必须回答：

- 今天对应哪个岗位能力？
- 今天哪条 AI 行业资讯会影响学习、作品集或岗位关键词？
- 今天读了 `agent/` 哪个资料？
- 今天产出了什么可展示内容？
- 今天有哪些概念还讲不清楚？
- 明天最小下一步是什么？

## 质量门槛

不要把“看完课程”当成进度。只有以下内容算进度：

- 能在面试中 2 分钟讲清楚的概念。
- 能运行或能展示的项目功能。
- 能写进简历的项目结果。
- 能反驳追问的技术取舍理由。
- 能用数据或日志证明的 Agent/RAG 效果。
