# agent.md

这是给 AI Agent/Codex 读取的项目入口摘要。完整执行规则见 [AGENTS.md](AGENTS.md)，Claude 专用规则见 [CLAUDE.md](CLAUDE.md)。

## 当前项目目标

帮助一名 30 岁、5 年 Java 后端工程师，在 1 个月内转向可面试的 AI Agent/RAG 应用工程岗位。目标城市杭州，第一阶段薪资目标约 20K，长期目标是在 35 岁前成长为能独立设计、落地、评估和维护企业级 Agent 系统的工程师。

## 技术路线结论

本项目采用 **Python AI 主链路 + Java 企业业务工具层** 的混合工程路线。不要把它理解成纯 Python，也不要改成 Python + TypeScript 替代 Java。

最终技术栈决策见 [docs/decisions/0001-python-java-hybrid.md](docs/decisions/0001-python-java-hybrid.md)，后续所有 feature、学习计划和求职表达都按这个边界推进。

- Python 负责 Agent/RAG/评估/API：LLM 调用、Prompt、Function Calling、文档解析、切分、Embedding、检索、重排、引用、拒答、trace、eval、FastAPI、后续 LangGraph/LlamaIndex。
- Java 负责企业业务工具服务：订单、工单、CRM/ERP 类接口、权限、审计、幂等、事务、稳定部署和原有 Java 后端经验迁移。
- MCP/OpenAPI 负责工具边界：把 Java 服务安全暴露给 Python Agent 调用。
- Spring AI 可以作为面试对比和 Java 侧补充，不作为第一个月主 RAG/Agent 实现路线。

## 执行顺序

0. 文档入口：[docs/00-document-index.md](docs/00-document-index.md)
1. 先完成 Python Agent Platform：可运行、可测试、能解释 RAG/工具调用/评估链路。
2. 再完成 Java Business Tool Service：证明企业业务系统如何成为 Agent 工具。
3. 再做 Python Agent 到 Java 工具服务的 HTTP/MCP/OpenAPI 集成。
4. 每天定时收集 AI 行业最新资讯，沉淀到 `logs/industry/YYYY-MM-DD.md`，并把影响转成学习任务、作品集 backlog 或面试表达。
5. 最后打磨简历、BOSS 话术、项目讲解和失败复盘。

## 每日行业情报

默认每天北京时间上午收集一次 AI 行业资讯，稳定入口见 [docs/14-ai-industry-watch.md](docs/14-ai-industry-watch.md)。

- 重点只看会影响求职和作品集的内容：Agent/RAG、模型 API、MCP、向量库、评估、企业落地、杭州/国内岗位变化。
- 每条资讯必须写清来源、日期、可信度、对项目的影响和下一步动作。
- 不把资讯收集写成泛泛新闻摘要；必须能转化为代码 feature、学习任务、面试素材或岗位关键词。
- 自动化入口是 `scripts/industry_watch.py` 和 `.github/workflows/industry-watch.yml`；结论必须以当日 `logs/industry/YYYY-MM-DD.md` 运行证据为准，失败来源写入“待复核”。

## 不要做的事

- 不把主 RAG/Agent 链路改回全 Java。
- 不移动、不改写父级 `../../agent/` 课程资料。
- 不为了追热点同时铺开太多框架；第一个月只围绕求职作品集闭环。
