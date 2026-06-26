# 作品集项目

一个月内不要做很多 Demo。做一个主项目，再做两个辅助项目，让面试官看到完整工程闭环。

## 主项目：Java 企业知识库 Agent

路径：`portfolio/java-agent-rag-service/`

### 一句话

基于 Spring Boot/Spring AI 的企业知识库 Agent，支持文档入库、RAG 检索、工具调用、带引用回答、评估回放和 Docker 部署。

### 必备功能

- 文档上传和解析：Markdown/PDF 优先。
- 文档切分和向量化。
- 向量检索和关键词混合检索。
- 回答必须带来源引用。
- 低置信度拒答。
- 工具调用：查订单、查工单、创建待办三个模拟工具。
- Trace 日志：question、retrievedChunks、toolCalls、modelResponse、latency、tokens。
- Eval 样本：至少 20 条问答。
- Docker Compose 一键启动说明。

### 简历写法

负责设计并实现企业知识库 Agent 原型，基于 Spring Boot/Spring AI 完成文档解析、向量化入库、RAG 检索生成、工具调用和日志追踪；通过构造评估样本对切分策略、TopK 和提示词进行对比，支持答案来源引用、低置信度拒答和失败样本回放。

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

## 辅助项目 2：MCP Tool Server

路径：`portfolio/mcp-tool-server/`

### 一句话

把 Java 后端能力包装成 Agent 可调用工具服务，模拟订单、工单、知识库查询。

### 必备功能

- 工具列表。
- 参数 schema。
- 权限校验。
- 审计日志。
- 幂等设计。
- 错误码和错误消息。

### 面试价值

证明你不是只会聊天接口，而是能把企业内部系统接入 Agent。

## 展示顺序

面试时按这个顺序讲：

1. 业务问题：企业知识散落、客服和运营重复问答。
2. 系统架构：文档入库、向量检索、LLM 生成、工具调用、日志评估。
3. 工程难点：幻觉、权限、超时、工具误调用、成本。
4. 解决方案：引用来源、拒答、参数校验、trace、eval dataset。
5. 结果：可回放、可优化、可部署、可扩展。

