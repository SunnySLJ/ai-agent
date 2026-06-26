# AI Agent 求职转化包

> 快照日期：2026-06-26。BOSS 直聘岗位变化很快，这份文档只记录搜索入口、筛选规则和投递话术；正式投递前需要在登录态下重新确认 JD、薪资、地点和面试要求。

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

| JD 要求 | 你怎么证明 | 仓库证据 |
|---|---|---|
| Python / FastAPI | Python Agent API 支持 health、文档入库、问答、summary、tools | `portfolio/agent-platform/` |
| RAG / 知识库 | 支持文档入库、检索、引用回答、低证据拒答 | `portfolio/agent-platform/src/agent_platform/` |
| Tool Calling / Agent | Agent 根据问题调用订单、工单、待办工具，并记录 tool trace | `portfolio/agent-platform/src/agent_platform/tools.py` |
| Java 业务系统集成 | Python 通过 HTTP 调用 Java Spring Boot 工具服务 | `portfolio/java-business-tool-service/`、`portfolio/agent-platform/src/agent_platform/java_tools.py` |
| MCP / OpenAPI | Java 工具服务已有 OpenAPI 合约和 MCP tools/list 风格 manifest | `portfolio/mcp-tool-server/` |
| Docker / 本地部署 | Compose 一键编排 Python API 和 Java 服务 | `compose.yaml` |
| Eval / Observability | Eval runner 输出通过率、拒答率、工具成功率、延迟和失败分类 | `portfolio/agent-eval-dashboard/` |
| 工程稳定性 | Java 层体现参数校验、幂等、审计、错误码；Python 层体现 trace 和拒答 | `portfolio/java-business-tool-service/src/`、`portfolio/agent-platform/src/` |

## 简历项目写法

项目名：企业知识库 AI Agent Platform

```text
基于 Python + Java 设计并实现企业知识库 AI Agent Platform。Python 侧负责 RAG 检索、引用回答、低置信度拒答、工具调用编排、FastAPI 服务和 eval runner；Java 侧基于 Spring Boot 模拟订单、工单、待办等企业业务工具，提供参数校验、幂等和审计能力，并通过 OpenAPI/MCP 风格工具契约暴露给 Agent。项目支持 Docker Compose 一键启动，能输出 trace、工具调用记录、拒答率、工具成功率和失败分类报告。
```

简历 bullet：

- 设计 Python Agent/RAG 主链路，完成文档入库、关键词检索、引用回答、低证据拒答、工具调用 trace 和评估 summary。
- 实现 Java Spring Boot Business Tool Service，封装订单、工单、待办等企业业务工具，覆盖结构化错误、幂等 key 和审计事件。
- 实现 Python 到 Java 的 HTTP tool adapter，并通过环境变量 `JAVA_TOOL_BASE_URL` 在 Compose 模式自动切换到 Java-backed tools。
- 输出 OpenAPI 3.0.3 合约和 MCP `tools/list` 风格 manifest，沉淀 Agent 调用企业系统的工具边界。
- 建立 Python eval runner，基于 JSONL 数据集统计通过率、拒答率、工具成功率、平均延迟、token 估算和失败分类。

不要写：

- “负责线上千万级 Agent 系统”
- “精通模型训练/微调/CUDA”
- “有真实生产 AI Agent 工作经验”

## BOSS 打招呼话术

### AI Agent / RAG 岗位

您好，我有 5 年 Java 后端经验，最近重点转向 AI Agent/RAG 应用工程。我的作品集是 Python Agent/RAG 主链路 + Java 业务工具服务：支持知识库检索引用、工具调用、拒答、trace、评估报告、OpenAPI/MCP 工具契约和 Docker Compose 演示。看到岗位涉及 Agent/RAG/大模型应用落地，想沟通一下匹配度。

### 大模型应用 / AI 后端岗位

您好，我是 Java 后端开发背景，熟悉 Spring Boot、接口、数据库、权限、日志和部署。最近补齐 Python 大模型应用链路，做了一个企业知识库 Agent Platform：Python 做 Agent/RAG/评估，Java 做业务工具 API，通过 OpenAPI/MCP 暴露给 Agent 调用。看到贵司岗位偏大模型应用工程化，想进一步了解业务场景。

### Java + AI 岗位

您好，我有 5 年 Java 后端经验，最近方向是把大模型能力接入企业业务系统。我做的项目里 Java 负责订单、工单、待办、审计和幂等，Python Agent 负责 RAG、工具调用和评估。这个方向和 Java + AI 应用落地岗位比较接近，想了解贵司是否需要这类背景。

## 面试 3 分钟讲法

1. 业务问题：企业文档分散，客服、运营、内部支持反复问同类问题，而且很多问题还需要查订单、工单等实时业务数据。
2. 架构选择：Python 负责 Agent/RAG/评估，Java 负责企业业务工具层。这样既利用 Python AI 生态，也保留我 5 年 Java 后端的稳定工程优势。
3. 主链路：用户提问后，Python Agent 检索知识库，召回 chunk，生成带引用的答案；如果证据不足就拒答。
4. 工具链路：涉及业务数据时，Python 通过 HTTP adapter 调 Java Spring Boot 工具服务，工具返回结构化结果，trace 记录工具名、参数、结果和成功状态。
5. 工程化：OpenAPI/MCP 定义工具契约，Docker Compose 一键启动 Python + Java，Eval Dashboard 用 JSONL 数据集统计通过率、拒答率、工具成功率和失败分类。
6. 价值：这不是只调模型接口，而是一个能接企业系统、可部署、可观测、可评估、可回放的 AI Agent 应用工程样例。

## Demo 顺序

1. 打开 GitHub：<https://github.com/SunnySLJ/ai-agent>
2. 展示 `README.md` 的当前已实现能力。
3. 展示 `portfolio/agent-platform/`：文档入库、问答、工具调用、summary。
4. 展示 `portfolio/java-business-tool-service/`：Java 工具服务的业务接口。
5. 展示 `portfolio/mcp-tool-server/`：OpenAPI 和 MCP tool manifest。
6. 展示 `compose.yaml`：Python + Java 一键编排。
7. 展示 `portfolio/agent-eval-dashboard/reports/latest.md`：4 条 eval case、100% pass、25% refusal、100% tool success。

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
