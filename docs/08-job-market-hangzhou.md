# 杭州 AI Agent 岗位画像

> 快照日期：2026-06-28。技能要求以 [09-job-skills-matrix.md](09-job-skills-matrix.md) 为准（公开 JD 多源汇总，不爬取 BOSS）。投递前仍需在招聘平台登录态下核对具体岗位。

## 结论

杭州 20K 左右最适合你的入口，不是纯算法工程师，而是：

- AI Agent 开发工程师
- 大模型应用工程师
- RAG/知识库工程师
- Python AI 应用开发工程师
- Java AI 应用开发工程师
- AI 平台后端工程师
- 智能客服/文档审核/企业知识库 Agent 工程师

你的优势是 5 年 Java 工程经验。正确打法是把 Java 后端、服务化、数据库、接口、权限、日志、部署这些能力迁移到 AI Agent/RAG 系统，而不是和算法硕博拼模型训练。

求职转化材料见 [AI Agent 求职转化包](10-application-conversion-kit.md)。

## BOSS 直聘搜索入口

建议每 3 天刷一次：

- AI Agent 杭州：<https://www.zhipin.com/web/geek/job?query=AI%20Agent&city=101210100>
- 大模型应用 杭州：<https://www.zhipin.com/web/geek/job?query=%E5%A4%A7%E6%A8%A1%E5%9E%8B%E5%BA%94%E7%94%A8&city=101210100>
- Python RAG 杭州：<https://www.zhipin.com/web/geek/job?query=Python%20RAG&city=101210100>
- FastAPI 大模型 杭州：<https://www.zhipin.com/web/geek/job?query=FastAPI%20%E5%A4%A7%E6%A8%A1%E5%9E%8B&city=101210100>
- LangGraph 杭州：<https://www.zhipin.com/web/geek/job?query=LangGraph&city=101210100>
- RAG Java 杭州：<https://www.zhipin.com/web/geek/job?query=RAG%20Java&city=101210100>
- LangChain 杭州：<https://www.zhipin.com/web/geek/job?query=LangChain&city=101210100>
- Spring AI 杭州：<https://www.zhipin.com/web/geek/job?query=Spring%20AI&city=101210100>
- Java 大模型 杭州：<https://www.zhipin.com/web/geek/job?query=Java%20%E5%A4%A7%E6%A8%A1%E5%9E%8B&city=101210100>

## 技能要求全览

完整技能矩阵（90+ 项，含 JD 频率、项目证据、缺口分析）见 **[09-job-skills-matrix.md](09-job-skills-matrix.md)**。

个人差距复盘见 `logs/applications/skills-gap-review.md`。

### P0 必须能力（JD 出现率 >60% 或面试必问）

| 类别 | 核心技能 |
|---|---|
| 语言工程 | Python 3.10+、asyncio、FastAPI、Java Spring Boot、Docker、Git、单元测试 |
| LLM/Prompt | OpenAI 兼容 API、国内模型 API、Prompt 模板、结构化输出、Token 管理、Prompt 注入防御 |
| Agent | ReAct、工具调用编排、LangChain、LangGraph、错误恢复、Human-in-the-loop |
| 工具协议 | Function Calling、MCP、OpenAPI、多工具协作、权限审计幂等 |
| RAG | 文档解析/切分、Embedding、Qdrant、BM25+混合检索、Rerank、引用溯源、拒答、RAG 评估 |
| 评估 | Eval Dataset、通过率/拒答率/工具成功率、Trace、失败回放 |
| Java | Spring Boot API、参数校验、幂等、审计、数据库 |
| 部署安全 | Docker Compose、健康检查、密钥管理、安全边界防护 |
| 软技能 | 业务需求拆解、STAR 项目讲解 |

### P1 加分能力（出现率 30-60%）

- LangChain4j / Spring AI 对比、Dify/Coze 平台、LlamaIndex、AutoGen/CrewAI
- Redis 会话、消息队列、限流熔断、K8s 入门
- LLM-as-Judge、RAGAS/DeepEval、LangSmith/Langfuse
- Plan-and-Execute、Router/Supervisor、长期记忆、上下文压缩
- vLLM/Ollama 本地推理、模型路由与成本优化

### P2 差异化加分（特定公司或高级岗）

- GraphRAG / Agentic RAG、多模态 OCR/VLM、A2A 协议
- LoRA/QLoRA 微调、SFT/RLHF/DPO 原理
- 国产化数据库适配、K8s 生产部署、OpenTelemetry

### 你的当前覆盖度（2026-06-28）

- P0 技能 54 项中，43 项已有作品证据（**80%**）
- 待补 P0：LangGraph、Prompt 注入防御、Human-in-the-loop、多轮会话、MCP Server 实现
- 详见 [skills-gap-review.md](../logs/applications/skills-gap-review.md)

## 你的岗位定位话术

我不是算法研究背景，但我有 5 年 Java 后端工程经验，能把大模型能力接进真实业务系统。我重点补齐了 RAG、Agent 工具调用、评估和工程化部署，目标是做企业级 AI Agent 应用，比如知识库问答、文档审核、智能客服、内部运营助手和数据分析 Agent。

## 投递优先级

第一优先级：

- JD 写明 Python/FastAPI/LangChain/LangGraph/RAG + 大模型应用，同时接受后端工程经验。
- 业务是知识库、客服、文档、搜索、办公自动化、数据分析。
- 要求 3-5 年后端经验，AI 经验可通过项目证明。

第二优先级：

- Java/Spring Boot + 大模型应用，或 Java 后端需要接入 AI 能力。
- 公司正在从 Demo 转生产，需要后端稳定性和系统集成。

暂缓：

- 强要求算法论文、模型训练、CUDA、分布式训练。
- 只招实习或 0-1 年 Prompt 运营岗。
- 没有工程落地，只写“AI 赋能”的泛岗位。
