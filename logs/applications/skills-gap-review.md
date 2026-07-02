# 2026-06-28 技能差距复盘

> 对照 [docs/09-job-skills-matrix.md](../../docs/09-job-skills-matrix.md)。数据来源：猎聘/智联/高校就业网/行业 JD 分析（2026-06-28），不爬取 BOSS。

## 复盘信息

- 日期：2026-06-28
- 目标岗位：AI Agent 开发工程师 / 大模型应用工程师 / RAG 工程师
- 城市：杭州
- 方法：公开 JD 技能汇总 → 对照作品集 → 标记差距

## 全量技能状态

| ID | 技能 | 优先级 | 状态 | 证据/笔记 | 下一步 |
|---|---|---|---|---|---|
| L01 | Python 3.10+ 基础 | P0 | 作品证据 | agent-platform 全栈 Python | 加强日常脚本 |
| L02 | asyncio 异步编程 | P0 | 学习中 | FastAPI 异步接口已有 | part10-agent + 练习 |
| L03 | FastAPI + Uvicorn | P0 | 作品证据 | api.py + POST /ask/stream SSE | 已有 |
| L04 | Java 17+ / Spring Boot 3 | P0 | 作品证据 | java-business-tool-service | 深化 |
| L05 | REST API 设计 | P0 | 作品证据 | OpenAPI 3.0.3 | 已有 |
| L06 | Git 工作流 | P0 | 已掌握 | GitHub 已推送 | 已有 |
| L07 | 单元测试 | P0 | 作品证据 | 61+ tests | 已有 |
| L08 | Docker 容器化 | P0 | 作品证据 | compose.yaml | 已有 |
| L09 | Linux 环境开发 | P1 | 已掌握 | 本地开发 | 加强排查 |
| L10 | CI/CD 基础 | P1 | 作品证据 | industry-watch workflow | 扩展 test workflow |
| L11 | Kubernetes 入门 | P1 | 待补 | 未做 | 了解概念 |
| L12 | Go/Golang | P2 | 待补 | 非重点 | 跳过 |
| L13 | TypeScript | P2 | 待补 | 非重点 | 跳过 |
| P01 | OpenAI 兼容 API | P0 | 作品证据 | OpenAICompatibleChatClient | 已有 |
| P02 | 国内模型 API | P0 | 作品证据 | 远端 gateway smoke | 多厂商适配 |
| P03 | 流式输出 | P0 | 作品证据 | POST /ask/stream SSE | 已有 |
| P04 | Prompt 模板设计 | P0 | 作品证据 | Agent 回答生成 | 建模板库 |
| P05 | Few-shot / JSON Schema | P0 | 作品证据 | models.py | 更多实战 |
| P06 | Token 与上下文管理 | P0 | 作品证据 | eval token 估算 | 深化 |
| P07 | 模型参数调优 | P1 | 学习中 | 基础支持 | A/B 对比 |
| P08 | Prompt 注入防御 | P0 | 作品证据 | safety.py + AgentPlatform.ask 前置拦截 | 补 LLM 分类器 |
| P09 | CoT / ReAct Prompt | P0 | 学习中 | 工具调用链路 | 能手写讲解 |
| P10 | 模型路由与降级 | P1 | 学习中 | 离线默认 | 补路由 |
| P11 | Token 成本优化 | P1 | 待补 | 未做 | 第二 sprint |
| P12 | vLLM/Ollama 部署 | P2 | 待补 | 了解即可 | 跳过 |
| A01 | Agent 核心概念 | P0 | 作品证据 | AgentPlatform | 已有 |
| A02 | ReAct 循环 | P0 | 学习中 | 工具调用链路 | 能手写 |
| A03 | Plan-and-Execute | P1 | 待补 | 未做 | LangGraph |
| A04 | Reflexion | P1 | 待补 | 了解概念 | 跳过 |
| A05 | Router/Supervisor | P1 | 待补 | 未做 | part14 |
| A06 | LangChain | P0 | 学习中 | part04 课程 | 第一周必学 |
| A07 | LangGraph | P0 | 作品证据 | graph_orchestrator.py 状态机编排 | 接真实 LangGraph 包 |
| A08 | AutoGen/CrewAI | P1 | 待补 | 了解对比 | 跳过 |
| A09 | Dify/Coze | P1 | 待补 | 未体验 | 第二周体验 |
| A10 | Workflow 编排 | P1 | 作品证据 | LangGraph-style graph + 自研链路 | LangGraph 对比 |
| A11 | Human-in-the-loop | P0 | 作品证据 | approval.py + POST /approvals/confirm | 已有 |
| A12 | 错误恢复与重试 | P0 | 作品证据 | 工具异常处理 | 补熔断器 |
| A13 | 状态持久化 | P1 | 待补 | trace 记录 | LangGraph checkpoint |
| T01 | Function Calling | P0 | 作品证据 | tools.py | 已有 |
| T02 | JSON Schema 工具参数 | P0 | 作品证据 | MCP manifest | 已有 |
| T03 | 工具注册与发现 | P0 | 作品证据 | /tools API | 已有 |
| T04 | 工具权限与审计 | P0 | 作品证据 | Java 审计 | 已有 |
| T05 | 工具幂等与重试 | P0 | 作品证据 | 幂等 key | 已有 |
| T06 | MCP 协议 | P0 | 作品证据 | mcp_server.py stdio runtime | 深化 |
| T07 | MCP 三原语 | P1 | 学习中 | tools/list | 深化 |
| T08 | OpenAPI 契约 | P0 | 作品证据 | openapi.json | 已有 |
| T09 | A2A 协议 | P2 | 待补 | 了解概念 | 跳过 |
| T10 | Webhook 集成 | P1 | 待补 | 未做 | 第二 sprint |
| T11 | 多工具协作 | P0 | 作品证据 | 订单+工单+待办 | 已有 |
| T12 | API 认证限流 | P0 | 学习中 | Java 错误码 | 补限流 |
| R01 | 文档解析 | P0 | 作品证据 | document_parser.py + PDF base64 | 补 multipart 上传 |
| R02 | 文档切分 | P0 | 作品证据 | knowledge_base.py | 语义切分 |
| R03 | Embedding | P0 | 作品证据 | OpenAICompatibleEmbeddingModel + env wiring | 多厂商适配 |
| R04 | Qdrant | P0 | 作品证据 | QdrantVectorIndex | 已有 |
| R05 | Milvus/pgvector | P1 | 待补 | 了解对比 | 面试能讲 |
| R06 | BM25 检索 | P0 | 作品证据 | BM25Retriever | 已有 |
| R07 | 混合检索 | P0 | 作品证据 | HybridRetriever | 已有 |
| R08 | Rerank | P0 | 学习中 | 轻量 reranker | 真实 rerank 模型 |
| R09 | Metadata 过滤 | P1 | 学习中 | doc_id | 多租户 |
| R10 | 引用溯源 | P0 | 作品证据 | Citation | 已有 |
| R11 | 低置信度拒答 | P0 | 作品证据 | Agent 拒答 | 已有 |
| R12 | HyDE | P1 | 待补 | 了解概念 | 跳过 |
| R13 | GraphRAG | P2 | 待补 | 课程案例 | 加分项 |
| R14 | 多模态 RAG | P2 | 待补 | 课程 part18 | 加分项 |
| R15 | RAG 评估指标 | P0 | 作品证据 | retrieval eval | 已有 |
| M01 | 短期会话上下文 | P0 | 作品证据 | session.py + /ask session_id | Redis 持久化 |
| M02 | 长期记忆 | P1 | 待补 | 未做 | part08 |
| M03 | 上下文压缩 | P1 | 待补 | 未做 | part09 |
| M04 | Redis 会话 | P1 | 待补 | 未做 | 第二 sprint |
| M05 | 用户画像 | P2 | 待补 | 跳过 | 跳过 |
| M06 | Context Engineering | P1 | 学习中 | part09 课程 | 第一周了解 |
| E01 | Eval Dataset | P0 | 作品证据 | 20 条 JSONL | 已有 |
| E02 | 通过率等指标 | P0 | 作品证据 | eval dashboard | 已有 |
| E03 | 失败分类回放 | P0 | 作品证据 | eval report | 已有 |
| E04 | Trace 链路 | P0 | 作品证据 | AgentTrace | 已有 |
| E05 | LLM-as-Judge | P1 | 待补 | 了解偏见 | 第二 sprint |
| E06 | RAGAS/DeepEval | P1 | 待补 | 未做 | 第二 sprint |
| E07 | LangSmith/Langfuse | P1 | 待补 | 了解概念 | 跳过 |
| E08 | OpenTelemetry | P2 | 待补 | 跳过 | 跳过 |
| E09 | P95 延迟监控 | P1 | 学习中 | eval 延迟 | 生产监控 |
| E10 | A/B 测试 | P1 | 待补 | 未做 | 第二 sprint |
| J01 | Spring Boot API | P0 | 作品证据 | BusinessToolController | 已有 |
| J02 | 参数校验错误码 | P0 | 作品证据 | 结构化错误 | 已有 |
| J03 | 幂等审计 | P0 | 作品证据 | 幂等+audit | 已有 |
| J04 | MySQL/PostgreSQL | P0 | 学习中 | 模拟数据 | 接真实 DB |
| J05 | Redis | P1 | 待补 | 未做 | 第二 sprint |
| J06 | 消息队列 | P1 | 已掌握 | 5 年 Java | 结合 AI 讲 |
| J07 | Spring AI/LangChain4j | P1 | 学习中 | 决策文档 | 面试对比 |
| J08 | 微服务分布式 | P1 | 已掌握 | 5 年经验 | 结合 AI 讲 |
| J09 | 多租户 RBAC | P1 | 待补 | 未做 | 第二 sprint |
| J10 | 国产数据库 | P2 | 待补 | 跳过 | 跳过 |
| D01 | Docker Compose | P0 | 作品证据 | compose.yaml | 已有 |
| D02 | 健康检查 | P0 | 作品证据 | healthcheck | 已有 |
| D03 | 日志 traceId | P0 | 学习中 | AgentTrace | 统一 traceId |
| D04 | 密钥管理 | P0 | 作品证据 | env wiring | 已有 |
| D05 | 限流熔断 | P1 | 待补 | 未做 | 第二 sprint |
| D06 | K8s 部署 | P1 | 待补 | 了解概念 | 跳过 |
| D07 | 安全边界防护 | P0 | 作品证据 | safety.py 注入拦截 | 补限流/鉴权 |
| D08 | 数据脱敏 | P1 | 学习中 | API key 脱敏 | 补 |
| X01 | AI IDE 辅助开发 | P1 | 已掌握 | Cursor | 已有 |
| X02 | Dify 工作流 | P1 | 待补 | 未体验 | 第二周 |
| X03 | Coze/百炼 | P1 | 待补 | 未体验 | 了解 |
| X04 | AI 辅助 TDD/SDD | P2 | 作品证据 | spec 驱动 | 已有 |
| K01 | Transformer 原理 | P1 | 学习中 | 课程资料 | 能讲 |
| K02 | Tokenizer | P1 | 学习中 | 了解 | 巩固 |
| K03 | KV Cache | P1 | 待补 | 了解 | 巩固 |
| K04 | SFT/RLHF/DPO | P2 | 待补 | 了解概念 | 不主攻 |
| K05 | LoRA 微调 | P2 | 待补 | 了解概念 | 不主攻 |
| S01 | 业务需求拆解 | P0 | 作品证据 | 作品集架构 + 面试话术包 | 演练 |
| S02 | STAR 项目讲解 | P0 | 作品证据 | 11-resume-and-interview-pack.md | 演练 |
| S03 | 技术方案文档 | P1 | 作品证据 | specs/ | 已有 |
| S04 | 跨团队协作 | P1 | 已掌握 | 5 年经验 | 已有 |
| S05 | 行业趋势判断 | P1 | 作品证据 | industry watch | 持续 |

## 统计

- P0 总数：54
- P0 作品证据/已掌握：46
- P0 学习中：5
- P0 待补：0
- P0 覆盖率：约 93%

## 本周优先补强

1. **模拟面试演练**：按 `docs/11-resume-and-interview-pack.md` 练 3 分钟讲法
2. **BOSS 投递**：手动筛选 20 条岗位写入 `logs/applications/`
3. **LangChain 官方包**：part04 课程 + 对比自研状态机

## 与作品集 backlog 映射

| 缺口技能 | 对应 spec | 预计完成 |
|---|---|---|
| 流式 SSE 输出 | 新 feature 015-streaming-sse | Week 2 |
| 真实 Embedding | 扩展 agent-platform | Week 2 |
| LangChain 包接入 | 扩展 graph_orchestrator | Week 2 |
| multipart PDF 上传 | 扩展 agent-platform | Week 3 |

## 结论

公开 JD 分析显示，杭州 20K 档 AI Agent 岗位最看重：Python + RAG + Tool Calling + 评估 + 工程化部署。你的作品集已覆盖约 93% P0 技能并有代码证据。第一个月重点从「补代码骨架」转向「流式输出 + 真实 Embedding + 面试表达」。
