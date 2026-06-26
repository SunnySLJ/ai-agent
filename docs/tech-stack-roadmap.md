# AI Agent 工程师技术栈路线

这份路线只服务一个目标：用 5 年 Java 后端经验切入 AI Agent/RAG 应用工程岗位。修订后的结论是 **Python 主导 AI 链路，Java 承接企业业务工具层**。这不是放弃 Java，而是把 Java 放到更有优势的位置。

## 总体选型结论

第一月只按这个分工执行：

| 层 | 第一个月主技术 | 以后可升级 | 为什么这样选 |
|---|---|---|---|
| LLM API 与 Prompt | Python 3.11+、OpenAI 兼容 API、国内模型 API | 模型路由、缓存、降级 | Python 调试快，生态资料多，适合先把 LLM 工程链路跑通 |
| API 服务 | FastAPI、Uvicorn | SSE/WebSocket、鉴权、多租户 | AI 服务接口、流式输出、自动文档和异步调用更适合快速展示 |
| Agent 编排 | 先自写最小工具调用链路，再接 LangGraph | 多 Agent、human-in-the-loop、持久执行 | 先理解原理，再用框架讲生产级状态管理 |
| RAG | 先自写解析/切分/检索/引用/拒答，再接 LlamaIndex | 混合检索、rerank、GraphRAG、多模态 | Python 的文档处理、向量库客户端、评估工具更集中 |
| 评估与观测 | Python eval dataset、trace、回放脚本 | OpenTelemetry、评估 Dashboard、自动回归 | 作品集区分度高，能证明不是只会调接口 |
| 企业业务工具 | Java、Spring Boot | 鉴权、限流、消息队列、事务、审计 | 这是 5 年 Java 经验的主战场，负责真实业务系统能力 |
| 工具协议 | HTTP tool client、OpenAPI、MCP | MCP server、权限策略、工具市场化 | 让 Python Agent 安全调用 Java 服务 |
| 部署 | Docker Compose | K8s、CI/CD、灰度、监控 | 一个月先可演示，后续再扩生产化 |

官方资料入口：

- FastAPI: <https://fastapi.tiangolo.com/>
- LangGraph: <https://docs.langchain.com/oss/python/langgraph/overview>
- LlamaIndex: <https://docs.llamaindex.ai/en/stable/>
- OpenAI Agents SDK: <https://openai.github.io/openai-agents-python/>
- MCP: <https://modelcontextprotocol.io/docs/getting-started/intro>
- Spring AI RAG 对比: <https://docs.spring.io/spring-ai/reference/api/retrieval-augmented-generation.html>

## 哪些地方一定优先用 Python

第一个月遇到下面问题，默认选 Python：

- LLM 调用、流式输出、结构化输出、工具调用。
- Prompt 模板、JSON Schema、结果解析、错误重试。
- 文档解析：PDF、Word、Markdown、HTML、OCR 前处理。
- RAG：切分、Embedding、向量库客户端、混合检索、rerank、引用和拒答。
- Agent：工具注册、参数校验、Planner/Executor、Router、Supervisor、Memory、Context Engineering。
- 评估：eval dataset、召回命中率、拒答率、工具成功率、失败样本回放。
- AI API 服务：FastAPI、异步接口、SSE/streaming、trace 暴露。

原因很简单：这些能力变化快、实验多、Python 资料和库最集中。一个月求职阶段不能把精力浪费在“用 Java 复刻 Python 生态”上。

## 哪些地方继续用 Java

Java 不做第一个月的 AI 主链路，但要主动放大后端优势：

- 订单、工单、CRM/ERP、库存、用户、权限等业务接口。
- 参数校验、幂等、事务、审计日志、权限校验、限流、异常码。
- 数据库、Redis、消息队列、异步任务、定时任务。
- 企业系统稳定性：日志、traceId、监控、部署、回滚。
- 给 Python Agent 暴露稳定的工具 API。

面试表达要讲成：Python 负责 AI 决策和编排，Java 负责企业业务事实和可靠执行。

## 第一个月不要铺开的方向

暂时不要把时间花在：

- 用 Spring AI 重写主 RAG/Agent 链路。
- 自己训练大模型或做大规模微调。
- 一开始就上 K8s、复杂 CI/CD、多环境灰度。
- 同时学太多 Agent 框架：LangGraph、AutoGen、CrewAI、Haystack 全部并行。
- 只做 Prompt Demo，没有 RAG、工具调用、trace、评估和部署。

这些不是没价值，而是不适合第一个月求职冲刺的最短路径。

## 第一层：大模型应用基础

必须会：

- OpenAI 兼容 API 调用。
- 国内模型 API：通义、智谱、DeepSeek、月之暗面等至少熟悉一种。
- Prompt 模板、Few-shot、结构化输出、JSON Schema。
- Function Calling / Tool Calling。
- 流式输出、超时、重试、异常处理。
- Token 成本估算和上下文窗口管理。

本地资料：

- `../../agent/part01-agent-api`
- `../../agent/part02-agent-local`
- `../../agent/part03-agent-basic`

## 第二层：Python RAG 工程

必须会：

- 文档解析：PDF、Word、Markdown、HTML、图片 OCR。
- 文档切分：固定窗口、递归切分、语义切分、父子块。
- Embedding：模型选择、批量入库、维度、归一化。
- 向量数据库：Qdrant、Milvus、pgvector、Elasticsearch dense vector 至少会一种。
- 检索策略：TopK、混合检索、metadata filter、rerank。
- 生成策略：引用来源、低置信度拒答、答案校验。
- RAG 评估：召回率、命中率、答案一致性、幻觉样本集。

第一月主路径使用 Python 做 RAG，因为资料解析、检索实验、评估和 Agent 组合更快。Spring AI 官方也有 RAG Advisor 和 Vector Store 能力，只作为 Java 侧补充和面试对比。

本地资料：

- `../../agent/part05-agent-rag`
- `../../agent/part06-agent-llamaindex`
- `../../agent/part22-agent-workspace/案例1：多模态文档检索RAG系统—VLM方向`
- `../../agent/part22-agent-workspace/案例3：多模态文档检索RAG系统—OCR方向`
- `../../agent/part22-agent-workspace/【加餐】案例13：垂直领域 Agentic-GraphRAG 开发实战`

## 第三层：Python Agent 编排

必须会：

- Tool Calling / Function Calling。
- 工具注册、参数校验、权限控制、失败重试。
- Planner / Executor 基本模式。
- ReAct、Plan-and-Execute、Router、Supervisor。
- 多轮会话状态和上下文压缩。
- Human-in-the-loop：高风险操作需要人工确认。
- Trace：记录 toolCalls、retrievedChunks、modelResponse、latency、tokens。

本地资料：

- `../../agent/part04-agent-langchain`
- `../../agent/part07-agent-skills`
- `../../agent/part08-agent-memory`
- `../../agent/part09-agent-context`
- `../../agent/part14-agent-help`
- `../../agent/part20-agent-openclaw`
- `../../agent/part21-agent-openclaw-memory`

## 第四层：Java 业务工具层

必须会：

- Spring Boot 3。
- REST API、SSE/WebSocket 流式输出。
- MySQL/PostgreSQL、Redis、消息队列。
- 多租户、鉴权、权限、审计日志。
- 异步任务、重试、限流、熔断。
- Docker Compose 本地部署。
- 生产日志：traceId、userId、toolName、arguments、result、latency、auditStatus。
- Java 侧不主写 RAG 链路，优先写可被 Python Agent 调用的业务工具服务。

本地资料：

- `../../agent/part10-agent`
- `../../agent/part12-agent-docker`
- `../../agent/part11-agent-design`

## 第五层：MCP 与工具生态

必须会：

- MCP 的 tools、resources、prompts 基本概念。
- 把后端接口包装成 Agent 可调用工具。
- 工具鉴权、参数校验、审计日志。
- 工具执行结果结构化返回。
- Python Agent 调 Java HTTP 工具服务时的超时、重试和错误映射。

作品集里至少做一个 Java/Spring Boot 工具服务，再用 MCP 或兼容协议暴露出来。

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

- Python Agent/RAG
- FastAPI
- LangGraph
- LlamaIndex
- Java + Spring Boot Tool API
- RAG
- Agent Workflow
- Tool Calling
- Memory / Context Engineering
- MCP
- Evaluation
- Observability
- Docker Compose
- Enterprise Integration
