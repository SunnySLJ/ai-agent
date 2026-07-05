# 作品集项目

一个月内不要做很多 Demo。做一个主项目，再做两个辅助项目，让面试官看到完整工程闭环。

## 主项目：Python 企业知识库 Agent Platform

路径：`portfolio/agent-platform/`

### 一句话

基于 Python 的企业知识库 Agent Platform，支持文档入库、RAG 检索、工具调用、带引用回答、拒答、评估回放，后续接 FastAPI、LangGraph、LlamaIndex 和真实模型。

### 必备功能

- 文档上传和解析：Markdown/PDF 优先，第一版先跑 Markdown/plain text。
- 文档切分和向量化。
- 向量检索和关键词混合检索。
- 回答必须带来源引用。
- 低置信度拒答。
- 工具调用：查订单、查工单、创建待办三个模拟工具。
- Trace 日志：question、retrievedChunks、toolCalls、modelResponse、latency、tokens。
- Eval 样本：至少 20 条问答。
- Docker Compose 一键启动说明。
- Java 业务工具 API 集成说明。
- 每日 AI 行业资讯输入：把 Agent/RAG/模型 API/企业落地动态转成项目 backlog 和面试素材。

### 简历写法

负责设计并实现企业知识库 Agent Platform，Python 侧完成 RAG 检索、工具调用、引用回答、低置信度拒答、trace 和评估回放；Java 侧作为业务工具服务承接订单、工单等企业系统接口，通过 MCP/OpenAPI 暴露给 Agent 调用。

## 辅助项目 1：Agent 评估 Dashboard

路径：`portfolio/agent-eval-dashboard/`

### 一句话

用于记录和分析 RAG/Agent 每次问答的检索命中、答案质量、工具调用和失败原因。

### 必备功能

- Eval dataset 格式。
- 每次运行记录 retrieval、answer、toolCall、score。
- 失败分类：未召回、召回错、生成错、工具错、权限错、超时。
- 输出周报：命中率、拒答率、工具成功率、平均延迟。

### 面试价值

多数候选人只会做 Demo。你能讲评估和回放，就更像能做生产系统的人。

## 辅助项目 2：OpenAPI / MCP 契约

路径：`portfolio/mcp-tool-server/`

### 一句话

为 Agent Platform 的 RAG HTTP 接口（`/health`、`/documents`、`/ask`）提供 OpenAPI 与 MCP manifest，便于联调和后续扩展工具。

### 必备功能

- 工具列表。
- 参数 schema。
- 权限校验。
- 审计日志。
- 幂等设计。
- 错误码和错误消息。

### 面试价值

证明你不是只会聊天接口，而是能把企业内部系统安全接入 Agent。

## 辅助资料：AI Industry Watch

路径：`logs/industry/`、`docs/14-ai-industry-watch.md`

### 一句话

每天定时收集 AI 行业最新资讯，并把它们转成学习安排、作品集 backlog、岗位关键词和面试谈资。

### 必备功能

- 每日一篇 `logs/industry/YYYY-MM-DD.md`。
- `scripts/industry_watch.py` 支持手动采集，`.github/workflows/industry-watch.yml` 每天北京时间 09:00 定时运行。
- 记录来源、日期、可信度、摘要、项目影响和下一步动作。
- 只保留和 Agent/RAG、模型 API、MCP、向量库、评估、企业 AI 应用、杭州/国内岗位趋势有关的内容。
- 每周复盘一次，更新 30 天计划、作品集 backlog 或面试材料。

### 面试价值

证明你不是只做静态 Demo，而是能持续跟踪行业变化，把新技术和岗位信号转化成工程动作。

## 展示顺序

面试时按这个顺序讲：

1. 业务问题：企业知识散落、客服和运营重复问答。
2. 系统架构：Python Agent/RAG、Java 业务工具服务、MCP/OpenAPI 工具接入、日志评估。
3. 工程难点：幻觉、权限、超时、工具误调用、成本。
4. 解决方案：引用来源、拒答、参数校验、trace、eval dataset。
5. 结果：可回放、可优化、可部署、可扩展。
