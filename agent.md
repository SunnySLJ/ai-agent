# agent.md

这是给 AI Agent/Codex 读取的项目入口摘要。完整执行规则见 [AGENTS.md](AGENTS.md)，Claude 专用规则见 [CLAUDE.md](CLAUDE.md)。

## 当前项目目标

帮助一名 30 岁、5 年 Java 后端工程师，在 1 个月内转向可面试的 AI Agent/RAG 应用工程岗位。目标城市杭州，第一阶段薪资目标约 20K，长期目标是在 35 岁前成长为能独立设计、落地、评估和维护企业级 Agent 系统的工程师。

## 技术路线结论

本项目采用 **Python 主导 AI 链路 + Java 承接业务工具层**。

- Python 负责 Agent/RAG/评估/API：LLM 调用、Prompt、Function Calling、文档解析、切分、Embedding、检索、重排、引用、拒答、trace、eval、FastAPI、后续 LangGraph/LlamaIndex。
- Java 负责企业业务工具服务：订单、工单、CRM/ERP 类接口、权限、审计、幂等、事务、稳定部署和原有 Java 后端经验迁移。
- MCP/OpenAPI 负责工具边界：把 Java 服务安全暴露给 Python Agent 调用。
- Spring AI 可以作为面试对比和 Java 侧补充，不作为第一个月主 RAG/Agent 实现路线。

## 执行顺序

1. 先完成 Python Agent Platform：可运行、可测试、能解释 RAG/工具调用/评估链路。
2. 再完成 Java Business Tool Service：证明企业业务系统如何成为 Agent 工具。
3. 再做 Python Agent 到 Java 工具服务的 HTTP/MCP/OpenAPI 集成。
4. 最后打磨简历、BOSS 话术、项目讲解和失败复盘。

## 不要做的事

- 不把主 RAG/Agent 链路改回全 Java。
- 不移动、不改写父级 `../../agent/` 课程资料。
- 不为了追热点同时铺开太多框架；第一个月只围绕求职作品集闭环。
