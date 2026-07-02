# AI Agent 求职转化包

> 快照日期：2026-07-01。技能要求以 [09-job-skills-matrix.md](09-job-skills-matrix.md) 为准；岗位筛选以 `logs/applications/skills-gap-review.md` 技能差距复盘驱动学习，不依赖 BOSS 爬取。  
> **可直接复制的简历和面试话术见 [11-resume-and-interview-pack.md](11-resume-and-interview-pack.md)。**

## 目标岗位

第一阶段不要投纯算法岗，优先投这几类：

| 优先级 | 岗位名 | 为什么匹配 |
|---|---|---|
| P0 | AI Agent 开发工程师 | 作品集已经覆盖 Agent/RAG、工具调用、评估、部署和 Java 业务工具集成 |
| P0 | 大模型应用工程师 | 重点是把 LLM 接进业务系统，和 5 年 Java 后端经验一致 |
| P0 | RAG/知识库工程师 | 当前主项目就是企业知识库 Agent Platform |
| P1 | Python AI 应用开发工程师 | Python 负责 Agent/RAG/API/eval，FastAPI 和 CLI 都已有项目证据 |
| P1 | Java AI 后端工程师 | Java 负责业务工具、权限、审计、幂等和稳定接口 |
| P2 | AI 平台后端工程师 | 如果 JD 强调平台、服务化、监控、部署，可以用 Java 后端经验切入 |

## BOSS 搜索入口

杭州城市编码：`101210100`。

| 搜索词 | 入口 |
|---|---|
| AI Agent | <https://www.zhipin.com/web/geek/job?query=AI%20Agent&city=101210100> |
| 大模型应用 | <https://www.zhipin.com/web/geek/job?query=%E5%A4%A7%E6%A8%A1%E5%9E%8B%E5%BA%94%E7%94%A8&city=101210100> |
| Python RAG | <https://www.zhipin.com/web/geek/job?query=Python%20RAG&city=101210100> |
| FastAPI 大模型 | <https://www.zhipin.com/web/geek/job?query=FastAPI%20%E5%A4%A7%E6%A8%A1%E5%9E%8B&city=101210100> |
| LangGraph | <https://www.zhipin.com/web/geek/job?query=LangGraph&city=101210100> |
| RAG Java | <https://www.zhipin.com/web/geek/job?query=RAG%20Java&city=101210100> |
| LangChain | <https://www.zhipin.com/web/geek/job?query=LangChain&city=101210100> |
| Spring AI | <https://www.zhipin.com/web/geek/job?query=Spring%20AI&city=101210100> |
| Java 大模型 | <https://www.zhipin.com/web/geek/job?query=Java%20%E5%A4%A7%E6%A8%A1%E5%9E%8B&city=101210100> |

## JD 到项目证据映射

完整技能矩阵（90+ 项）见 [09-job-skills-matrix.md](09-job-skills-matrix.md)。核心映射如下：

| JD 要求 | 你怎么证明 | 仓库证据 |
|---|---|---|
| Python / FastAPI | Python Agent API 支持 health、文档入库、问答、流式、summary、tools、session、approval | `portfolio/agent-platform/` |
| SSE 流式输出 | `POST /ask/stream` 返回 meta/token/done 事件 | `streaming.py`、`api.py` |
| RAG / 知识库 | 文档入库（Markdown/PDF）、混合检索、引用回答、低证据拒答 | `retrieval.py`、`document_parser.py` |
| 混合检索 + Rerank | BM25 + 向量 + 轻量 rerank，retrieval eval hit_rate=100% | `retrieval.py`、`reports/retrieval-latest.md` |
| Qdrant 向量库 | 可选 Qdrant 接入，Compose 一键启动 | `vector_store.py`、`compose.yaml` |
| 真实 Embedding | OpenAI-compatible `/embeddings` 适配，env 自动切换 | `embeddings.py` |
| Tool Calling / Agent | 订单、工单、待办工具调用 + LangGraph 风格状态机编排 | `tools.py`、`graph_orchestrator.py` |
| Human-in-the-loop | `create_todo` 写操作需 `POST /approvals/{id}/confirm` | `approval.py` |
| Prompt 注入防御 | 检索/工具调用前的规则拦截 | `safety.py` |
| 多轮会话 | `session_id` + `GET /sessions/{id}` | `session.py` |
| MCP / OpenAPI | OpenAPI 合约 + MCP stdio Server 可运行 | `portfolio/mcp-tool-server/` |
| Java 业务系统集成 | Python HTTP 调用 Java Spring Boot 工具服务 | `java-business-tool-service/` |
| 幂等 / 审计 / 错误码 | Java 层结构化错误、幂等 key、审计事件 | `java-business-tool-service/src/` |
| Docker / 本地部署 | Compose 编排 Python API + Java + Qdrant | `compose.yaml` |
| Eval / Observability | 20 条 eval，pass_rate=100%、refusal=25%、tool_success=100% | `agent-eval-dashboard/reports/latest.md` |
| OpenAI 兼容 LLM | Chat Completion + Embedding 双适配 | `llm.py`、`embeddings.py` |
| 工程稳定性 | 60+ 单元测试、trace、拒答、API key 脱敏 | `tests/`、`agent.py` |

### 简历关键词对照（按 JD 频率）

投递时在简历和打招呼话术中自然融入这些关键词（详见 job-skills-matrix 简历关键词节）：

`AI Agent` · `大模型应用` · `RAG` · `Python` · `FastAPI` · `LangChain` · `LangGraph` · `Function Calling` · `MCP` · `Qdrant` · `混合检索` · `Spring Boot` · `Docker` · `评估` · `Trace` · `企业知识库`

## 简历项目写法

项目名：企业知识库 AI Agent Platform

```text
基于 Python + Java 设计并实现企业知识库 AI Agent Platform。Python 侧负责 RAG 混合检索、Qdrant 向量库、引用回答、低置信度拒答、Prompt 注入拦截、多轮会话、Human-in-the-loop 审批、SSE 流式输出、LangGraph 风格编排和 eval runner；Java 侧基于 Spring Boot 实现订单、工单、待办等企业业务工具，提供参数校验、幂等和审计能力，并通过 OpenAPI/MCP 暴露给 Agent。项目支持 Docker Compose 一键启动，20 条 eval pass_rate=100%，60+ 单元测试，GitHub 开源可演示。
```

简历 bullet：

- 设计 Python Agent/RAG 主链路：混合检索、引用拒答、Prompt 安全、多轮会话、SSE 流式、trace 和 eval summary。
- 实现 Agent 工具调用与安全边界：订单/工单/待办 Function Calling，`create_todo` 写操作 Human-in-the-loop 人工确认。
- 实现 Java Spring Boot Business Tool Service，封装企业业务工具，覆盖结构化错误、幂等 key 和审计事件。
- 输出 OpenAPI 合约和可运行 MCP stdio Server，沉淀 Agent 调用企业系统的工具边界。
- 建立评估体系：20 条 JSONL eval（pass_rate=100%）、检索 eval（hybrid hit_rate=100%），Docker Compose 编排 Python/Java/Qdrant。

不要写：

- “负责线上千万级 Agent 系统”
- “精通模型训练/微调/CUDA”
- “有真实生产 AI Agent 工作经验”

## BOSS 打招呼话术

### AI Agent / RAG 岗位

您好，我有 5 年 Java 后端经验，最近重点转向 AI Agent/RAG 应用工程。我的作品集是 Python Agent/RAG 主链路 + Java 业务工具服务：混合检索、工具调用、引用拒答、Prompt 安全、人工确认、SSE 流式、trace、eval 报告和 Docker Compose 演示，GitHub 开源可验证。看到岗位涉及 Agent/RAG/大模型应用落地，想沟通一下匹配度。

### 大模型应用 / AI 后端岗位

您好，我是 Java 后端开发背景，熟悉 Spring Boot、接口、数据库、权限、日志和部署。最近补齐 Python 大模型应用链路，做了一个企业知识库 Agent Platform：Python 做 Agent/RAG/评估，Java 做业务工具 API，通过 OpenAPI/MCP 暴露给 Agent 调用。看到贵司岗位偏大模型应用工程化，想进一步了解业务场景。

### Java + AI 岗位

您好，我有 5 年 Java 后端经验，最近方向是把大模型能力接入企业业务系统。我做的项目里 Java 负责订单、工单、待办、审计和幂等，Python Agent 负责 RAG、工具调用和评估。这个方向和 Java + AI 应用落地岗位比较接近，想了解贵司是否需要这类背景。

## 面试 3 分钟讲法

1. 业务问题：企业文档分散，客服、运营、内部支持反复问同类问题，而且很多问题还需要查订单、工单等实时业务数据。
2. 架构选择：Python 负责 Agent/RAG/评估，Java 负责企业业务工具层。
3. 主链路：Prompt 注入检测 → 混合检索 → 引用回答 / 低证据拒答；支持 SSE 流式和多轮会话。
4. 工具链路：读操作直接调 Java 工具；写操作（create_todo）走 Human-in-the-loop 人工确认。
5. 工程化：MCP stdio Server + OpenAPI 合约，Docker Compose 一键启动，20 条 eval pass_rate=100%，检索 hybrid hit_rate=100%。
6. 价值：可接企业系统、可部署、可观测、可评估、可回放的 AI Agent 应用工程样例。

## Demo 顺序

1. 打开 GitHub：<https://github.com/SunnySLJ/ai-agent>
2. 展示 `README.md` 的当前已实现能力。
3. 展示 `portfolio/agent-platform/`：文档入库、问答、工具调用、summary。
4. 展示 `portfolio/java-business-tool-service/`：Java 工具服务的业务接口。
5. 展示 `portfolio/mcp-tool-server/`：OpenAPI 和 MCP tool manifest。
6. 展示 `compose.yaml`：Python + Java 一键编排。
7. 展示 `portfolio/agent-eval-dashboard/reports/latest.md`：20 条 eval case、100% pass、25% refusal、100% tool success。
8. 展示 `reports/retrieval-latest.md`：hybrid hit_rate=100%、MRR=0.9。
9. 演示 SSE 流式：`POST /ask/stream`。
10. 演示 Human-in-the-loop：创建待办 → 审批确认。

## 投递筛选规则

优先投：

- JD 出现 `RAG`、`Agent`、`Function Calling`、`Tool Calling`、`LangChain`、`LangGraph`、`LlamaIndex`、`FastAPI`、`MCP`。
- JD 同时接受后端经验，或强调业务系统接入、企业知识库、客服、工单、CRM/ERP、数据分析。
- 薪资在 18K-30K，要求 3-5 年工程经验，AI 经验可以用作品集证明。

谨慎投：

- 只写“AI 赋能”，没有具体技术栈和业务场景。
- 只招 Prompt 运营，技术成长空间弱。
- 要求算法论文、CUDA、训练框架、分布式训练作为硬门槛。

## 一周投递动作

每天固定 90 分钟：

1. 30 分钟：按 BOSS 搜索入口筛 20 个岗位。
2. 20 分钟：按 JD 关键词标记 P0/P1/P2。
3. 20 分钟：发送定制打招呼话术。
4. 20 分钟：把反馈问题记录到 `logs/daily/YYYY-MM-DD.md`，第二天补项目或面试材料。

每 3 天复盘：

- 哪类岗位回复最多。
- 哪个关键词命中最多。
- 哪些问题被 HR/面试官反复追问。
- 是否需要把项目补强到真实模型、向量库、LangGraph 或线上部署。

## BOSS 复核记录格式

真实岗位复核统一写到 `logs/applications/YYYY-MM-DD-boss-screening.md`，模板见 `docs/templates/T04-boss-screening-log.md`。

记录时不要只写岗位链接，必须把每个岗位拆成可行动字段：搜索词、公司、岗位、薪资、地点、经验、JD 关键词、匹配级别、风险点和下一步。完成 20 个岗位后，把 P0/P1/P2 数量和需要补强的能力同步写进当天 `logs/daily/YYYY-MM-DD.md`。
