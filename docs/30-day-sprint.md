# 30 天 AI Agent 工程师冲刺计划

周期：2026-06-27 到 2026-07-26。

每天默认投入 3-4 小时。如果当天工作忙，最小版本是 45 分钟学习 + 30 分钟作品集 + 10 分钟日志。

## 第 1 周：建立 AI 应用基本盘

目标：能从 Python Agent/RAG 视角讲清楚 LLM API、Prompt、流式输出、工具调用和最小 Agent，同时知道 Java 在业务工具层的位置。

### Day 1：岗位倒推和环境准备

- 读：`docs/job-market-hangzhou.md`
- 刷：BOSS 关键词 `AI Agent`、`大模型应用`、`RAG Java`
- 学：`../../agent/part01-agent-api`
- 产出：写第一份 `logs/daily/2026-06-27.md`
- 面试表达：为什么你从 Java 后端转 AI Agent？

### Day 2：LLM API 与流式输出

- 学：`../../agent/part01-agent-api/大模型在线API接入基础入门实战.ipynb`
- 做：整理 OpenAI 兼容 API、国内模型 API、流式输出处理方式
- 产出：`portfolio/agent-platform/notes-llm-api.md`
- 面试表达：一次 LLM 调用从请求到响应有哪些工程风险？

### Day 3：Prompt 与结构化输出

- 学：`../../agent/part03-agent-basic`
- 做：设计 3 个结构化输出 Prompt：分类、摘要、JSON 任务计划
- 产出：Prompt 样例和失败案例
- 面试表达：如何降低模型输出不可控？

### Day 4：Function Calling / Tool Calling

- 学：`../../agent/part07-agent-skills`
- 做：设计 3 个工具：查知识库、查订单、创建工单
- 产出：工具参数、权限、失败处理说明
- 面试表达：模型能不能直接执行删除数据？

### Day 5：最小 Agent 工作流

- 学：`../../agent/part04-agent-langchain/Part 2. LangChain v1.0 搭建Agent智能体应用实战`
- 做：画出 Planner -> Tool -> Answer 链路
- 产出：主项目架构草图
- 面试表达：Agent 和普通 ChatBot 的区别是什么？

### Day 6：Python-first 技术选型

- 学：Python Agent/RAG/FastAPI 架构，并阅读 Spring AI RAG 文档作为 Java 侧对比：<https://docs.spring.io/spring-ai/reference/api/retrieval-augmented-generation.html>
- 做：确定主项目技术栈：Python Agent/RAG/FastAPI + Java Business Tool API + MCP/OpenAPI
- 产出：`portfolio/agent-platform/docs/architecture.md`
- 面试表达：为什么 Agent/RAG 用 Python、业务工具层保留 Java？

### Day 7：周复盘

- 整理：本周所有日志
- 修正：简历定位一句话
- 投递：试投 3 个低风险岗位，观察回复
- 产出：第 1 周复盘

## 第 2 周：RAG 主链路

目标：能做出企业知识库问答的核心链路，并讲清楚检索质量。

### Day 8：文档解析

- 学：`../../agent/part05-agent-rag/Part 2. 大模型RAG进阶多格式文档解析实战`
- 做：梳理 PDF、Markdown、Word 的解析方案
- 产出：文档解析策略表

### Day 9：文档切分

- 学：`../../agent/part05-agent-rag/Part 3. 大模型RAG文档切分进阶实战`
- 做：比较固定切分、递归切分、语义切分
- 产出：切分策略选择理由

### Day 10：Embedding 与向量库

- 学：`../../agent/part05-agent-rag/Part 4. 大模型RAG嵌入向量数据库实战`
- 做：优先选 Qdrant 做 Python RAG 演示；如果强调 Java/PostgreSQL 业务系统，再对比 pgvector
- 产出：向量库接入说明

### Day 11：检索生成

- 学：`../../agent/part05-agent-rag/Part 5. 大模型RAG检索生成和评估实战`
- 做：设计 Query -> Retrieve -> Rerank -> Generate 链路
- 产出：RAG 时序图

### Day 12：引用来源与拒答

- 做：答案必须带引用；低置信度拒答
- 产出：回答策略文档
- 面试表达：如何减少 RAG 幻觉？

### Day 13：RAG 评估样本

- 学：`../../agent/part13-agent-score`
- 做：设计 20 条问答评估样本
- 产出：`portfolio/agent-eval-dashboard/eval-dataset.md`

### Day 14：周复盘与简历第一版

- 产出：简历项目描述第一版
- 投递：10 个岗位
- 复盘：哪些 JD 高频词还不熟

## 第 3 周：Agent、Memory、MCP、工程化

目标：把 RAG 从问答升级为可调用工具、可记忆、可观测的 Agent。

### Day 15：Agent 工具注册

- 学：`../../agent/part07-agent-skills`
- 做：定义工具注册表和参数校验
- 产出：工具协议文档

### Day 16：Memory

- 学：`../../agent/part08-agent-memory`
- 做：区分短期会话记忆、长期用户记忆、任务记忆
- 产出：Memory 数据模型

### Day 17：Context Engineering

- 学：`../../agent/part09-agent-context`
- 做：设计上下文压缩和隔离策略
- 产出：Context 策略文档

### Day 18：Python Agent 调 Java 工具服务

- 学：MCP 官方入口：<https://modelcontextprotocol.io/docs/getting-started/intro>
- 做：先实现 Python HTTP tool client 调 Java Business Tool Service，再设计 MCP/OpenAPI 包装方式
- 产出：`portfolio/mcp-tool-server/README.md` 完成版

### Day 19：多智能体与任务编排

- 学：`../../agent/part14-agent-help`
- 做：区分 Router、Supervisor、Worker
- 产出：多 Agent 取舍说明

### Day 20：部署与日志

- 学：`../../agent/part12-agent-docker`
- 做：设计 Docker Compose、日志字段、traceId
- 产出：部署说明

### Day 21：周复盘与模拟面试

- 产出：3 分钟项目讲解稿
- 模拟：RAG、Agent、Java 工程化各 5 个问题
- 投递：15 个岗位

## 第 4 周：作品集打磨与求职冲刺

目标：让项目、简历、面试表达形成闭环。

### Day 22：主项目 README 打磨

- 写清楚：背景、架构、核心链路、技术栈、评估方式、部署方式

### Day 23：失败案例复盘

- 整理：检索失败、幻觉、工具调用失败、超时、权限问题
- 产出：故障复盘文档

### Day 24：简历第二版

- 用 STAR 写项目经历
- 突出：Java 后端、RAG、Agent、评估、部署

### Day 25：BOSS 打招呼和投递

- 使用 [docs/templates/boss-message.md](templates/boss-message.md)
- 投递：20 个岗位
- 记录：回复率、约面率

### Day 26：面试题强化

- 重点：Python RAG、Agent、FastAPI、LangGraph、LlamaIndex、向量库、MCP、Java 工具服务、部署、评估

### Day 27：项目演示脚本

- 准备 5 分钟项目演示路线
- 准备 1 分钟、3 分钟、10 分钟三个版本

### Day 28：模拟压力面

- 练习：你没有 AI 工作经验，为什么能胜任？
- 练习：如果 RAG 答错了你怎么定位？
- 练习：Agent 调错工具怎么办？

### Day 29：投递复盘和补洞

- 根据 BOSS 回复修正简历和关键词
- 对照 JD 补最短板

### Day 30：最终交付

- 完成作品集 README
- 完成简历项目描述
- 完成面试自我介绍
- 完成下个月成长计划
