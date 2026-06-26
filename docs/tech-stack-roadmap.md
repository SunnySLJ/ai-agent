# AI Agent 工程师技术栈路线

这份路线只服务一个目标：用 Java 后端经验切入 AI Agent/RAG 应用工程岗位。

## 第一层：大模型应用基础

必须会：

- OpenAI 兼容 API 调用。
- 国内模型 API：通义、智谱、DeepSeek、月之暗面等至少熟悉一种。
- Prompt 模板、Few-shot、结构化输出、JSON Schema。
- 流式输出、超时、重试、异常处理。
- Token 成本估算和上下文窗口管理。

本地资料：

- `../../agent/part01-agent-api`
- `../../agent/part02-agent-local`
- `../../agent/part03-agent-basic`

## 第二层：RAG 工程

必须会：

- 文档解析：PDF、Word、Markdown、HTML、图片 OCR。
- 文档切分：固定窗口、递归切分、语义切分、父子块。
- Embedding：模型选择、批量入库、维度、归一化。
- 向量数据库：Milvus、Qdrant、pgvector、Elasticsearch dense vector 至少会一种。
- 检索策略：TopK、混合检索、metadata filter、rerank。
- 生成策略：引用来源、拒答、答案校验。
- RAG 评估：召回率、命中率、答案一致性、幻觉样本集。

Spring AI 官方有 RAG Advisor 和 Vector Store 相关能力，适合 Java 路线：<https://docs.spring.io/spring-ai/reference/api/retrieval-augmented-generation.html>

本地资料：

- `../../agent/part05-agent-rag`
- `../../agent/part06-agent-llamaindex`
- `../../agent/part22-agent-workspace/案例1：多模态文档检索RAG系统—VLM方向`
- `../../agent/part22-agent-workspace/案例3：多模态文档检索RAG系统—OCR方向`
- `../../agent/part22-agent-workspace/【加餐】案例13：垂直领域 Agentic-GraphRAG 开发实战`

## 第三层：Agent 编排

必须会：

- Tool Calling / Function Calling。
- 工具注册、参数校验、权限控制、失败重试。
- Planner / Executor 基本模式。
- ReAct、Plan-and-Execute、Router、Supervisor。
- 多轮会话状态和上下文压缩。
- Human-in-the-loop：高风险操作需要人工确认。

LangGraph 强调持久执行、人机协同、记忆和可控 Agent 流程，适合做生产级 Agent 编排参考：<https://docs.langchain.com/oss/python/langgraph/overview>

OpenAI Agents SDK 的 tools、handoffs、guardrails、tracing 是理解 Agent 工程边界的好参考：<https://openai.github.io/openai-agents-python/>

本地资料：

- `../../agent/part04-agent-langchain`
- `../../agent/part07-agent-skills`
- `../../agent/part08-agent-memory`
- `../../agent/part09-agent-context`
- `../../agent/part14-agent-help`
- `../../agent/part20-agent-openclaw`
- `../../agent/part21-agent-openclaw-memory`

## 第四层：MCP 与工具生态

必须会：

- MCP 的 tools、resources、prompts 基本概念。
- 把后端接口包装成 Agent 可调用工具。
- 工具鉴权、参数校验、审计日志。
- 工具执行结果结构化返回。

MCP 官方文档入口：<https://modelcontextprotocol.io/docs/getting-started/intro>

作品集里至少做一个 Java/Spring Boot 工具服务，再用 MCP 或兼容协议暴露出来。

## 第五层：Java 工程化

这是你的核心优势，必须主动放大：

- Spring Boot 3 / Spring AI。
- REST API、SSE/WebSocket 流式输出。
- MySQL/PostgreSQL、Redis、消息队列。
- 多租户、鉴权、权限、审计日志。
- 异步任务、重试、限流、熔断。
- Docker Compose 本地部署。
- 生产日志：traceId、span、prompt、retrieval、toolCall、modelResponse。

本地资料：

- `../../agent/part10-agent`
- `../../agent/part12-agent-docker`
- `../../agent/part11-agent-design`

## 第六层：评估与可观测

岗位区分度很高的一层：

- 构造 eval dataset。
- 记录每次检索结果和最终答案。
- 统计命中率、无答案率、人工纠错率、工具调用成功率。
- 对 Prompt、切分策略、TopK、rerank 做 A/B 对比。
- 能回放失败样本。

本地资料：

- `../../agent/part13-agent-score`
- `../../agent/part24-agent-harness-special`
- `../../agent/part25-agent-openclaw-special`

## 一个月只抓这些关键词

简历和面试中反复强化：

- Java + Spring AI
- RAG
- Agent Workflow
- Tool Calling
- Memory / Context Engineering
- MCP
- Evaluation
- Observability
- Docker Deployment
- Enterprise Integration

