# AI Agent / RAG 岗位技能矩阵

> 快照日期：2026-06-28。数据来源为公开网页 JD 分析、招聘平台岗位描述、面试指南与行业报告，**不爬取 BOSS 直聘**。投递前仍需在招聘平台登录态下核对具体 JD。

## 调研方法

| 来源类型 | 代表来源 | 用途 |
|---|---|---|
| 招聘平台 JD | 猎聘、智联招聘、高校就业网、禾蛙猎头 JD | 提取真实岗位职责与任职要求 |
| JD 聚合分析 | [learn-nanobot 就业市场分析](https://github.com/bcefghj/learn-nanobot/blob/main/docs/14-job-market-analysis/README.md) | 500+ JD 关键词频率统计 |
| 面试指南 | [ai-agent-interview-guide](https://github.com/bcefghj/ai-agent-interview-guide)、[AgentGuide](https://github.com/adongwanai/AgentGuide) | 面试高频考点与能力分层 |
| 转型指南 | CSDN/AtomGit Java→Agent 转型文章 | Java 后端转型路径与技能递进 |
| 行业综述 | CSDN AI Agent 工程师全景解析 | 技术栈、薪资、职业发展 |

## 目标岗位（你的画像）

- 城市：杭州
- 经验：5 年 Java 后端
- 目标薪资：第一阶段 20K 左右，再看 20-40K
- 路线：Python Agent/RAG 主链路 + Java 企业业务工具层
- 不投：纯算法训练、CUDA、论文硬门槛、Prompt 运营岗

## 岗位类型与薪资参考（杭州）

| 岗位 | 你的匹配度 | 月薪区间（3-5 年） | 核心差异 |
|---|---|---|---|
| AI Agent 开发工程师 | 高 | 25-55K | Agent 编排、MCP、工具调用、评估 |
| 大模型应用工程师 | 高 | 22-48K | LLM 架构、Prompt、RAG、成本优化 |
| RAG/知识库工程师 | 高 | 20-40K | 检索全链路、向量库、文档解析 |
| Python AI 应用开发 | 中高 | 18-40K | FastAPI、RAG、对话系统 |
| Java AI 后端工程师 | 高 | 20-29K | Spring Boot + LangChain4j/Spring AI |
| AI 平台后端工程师 | 中 | 20-35K | 服务化、监控、多租户、部署 |

## 技能优先级说明

| 标记 | 含义 | 第一个月要求 |
|---|---|---|
| P0 | JD 出现率 >60% 或面试几乎必问 | 必须能讲 + 有作品证据或正在冲刺 |
| P1 | JD 出现率 30-60% 或明显加分 | 了解原理，作品集至少触及 |
| P2 | 出现率 <30% 或特定公司加分 | 知道概念，面试能提一句 |

## 一、编程语言与工程基础

| ID | 技能 | 优先级 | JD 频率 | 项目证据 | 缺口 |
|---|---|---|---|---|---|
| L01 | Python 3.10+ 基础语法与类型注解 | P0 | 95% | agent-platform 全栈 Python | 需加强日常脚本熟练度 |
| L02 | Python asyncio 异步编程 | P0 | 65% | FastAPI 异步接口 | 需系统学习 asyncio |
| L03 | FastAPI + Uvicorn | P0 | 55% | `portfolio/agent-platform/src/agent_platform/api.py` | 需补 SSE/WebSocket |
| L04 | Java 17+ / Spring Boot 3 | P0 | 50% | `portfolio/java-business-tool-service/` | 已有，可深化 |
| L05 | REST API 设计与版本管理 | P0 | 60% | OpenAPI 3.0.3 合约 | 已有 |
| L06 | Git 工作流与 Code Review | P0 | 70% | GitHub 已推送 | 已有 |
| L07 | 单元测试与集成测试 | P0 | 60% | 61+ 测试用例 | 已有 |
| L08 | Docker 容器化 | P0 | 55% | `compose.yaml` | 已有 |
| L09 | Linux 环境开发与排查 | P1 | 45% | 本地开发 | 需加强 |
| L10 | CI/CD 基础 | P1 | 40% | GitHub Actions industry-watch | 需扩展 |
| L11 | Kubernetes 入门 | P1 | 35% | 未做 | 了解概念即可 |
| L12 | Go/Golang | P2 | 35% | 未做 | 非第一个月重点 |
| L13 | TypeScript / Node.js | P2 | 30% | 未做 | 非第一个月重点 |

## 二、LLM API 与 Prompt 工程

| ID | 技能 | 优先级 | JD 频率 | 项目证据 | 缺口 |
|---|---|---|---|---|---|
| P01 | OpenAI 兼容 API 调用 | P0 | 75% | `OpenAICompatibleChatClient` | 已有 |
| P02 | 国内模型 API（通义/智谱/DeepSeek/月之暗面） | P0 | 60% | 远端 gateway smoke | 需多厂商适配经验 |
| P03 | 流式输出 SSE/Streaming | P0 | 55% | 部分支持 | 需补完整流式 API |
| P04 | Prompt 模板与 System Prompt 设计 | P0 | 80% | Agent 回答生成逻辑 | 需系统化模板库 |
| P05 | Few-shot 与结构化输出 JSON Schema | P0 | 50% | models.py 结构化类型 | 需更多实战 |
| P06 | Token 计数与上下文窗口管理 | P0 | 40% | eval token 估算 | 需深化 |
| P07 | 模型参数调优 temperature/top_p | P1 | 45% | 基础支持 | 需 A/B 对比经验 |
| P08 | Prompt 注入防御 | P0 | 面试必问 | 未系统实现 | **待补** |
| P09 | Chain-of-Thought / ReAct Prompt | P0 | 40% | Agent 工具调用链路 | 需能手写讲解 |
| P10 | 模型路由与降级策略 | P1 | 35% | 离线默认 + 可选 LLM | 需补路由逻辑 |
| P11 | Token 成本优化与缓存 | P1 | 30% | 未做 | 第二个 sprint |
| P12 | vLLM/Ollama 本地推理部署 | P2 | 25% | 未做 | 了解即可 |

## 三、Agent 架构与编排

| ID | 技能 | 优先级 | JD 频率 | 项目证据 | 缺口 |
|---|---|---|---|---|---|
| A01 | Agent 核心概念（感知-规划-执行-反馈） | P0 | 85% | AgentPlatform | 已有 |
| A02 | ReAct 循环 | P0 | 40% | 工具调用 + 回答生成 | 需能手写 |
| A03 | Plan-and-Execute | P1 | 30% | 未做 | 学习 LangGraph |
| A04 | Reflexion / Self-reflection | P1 | 20% | 未做 | 了解概念 |
| A05 | Router / Supervisor 多 Agent 路由 | P1 | 25% | 未做 | part14-agent-help |
| A06 | LangChain 基础 | P0 | 60% | 课程资料 part04 | **第一个月必学** |
| A07 | LangGraph 状态机编排 | P0 | 45% | 未接入 | **第一个月必学** |
| A08 | AutoGen / CrewAI 多 Agent | P1 | 25% | 未做 | 了解对比 |
| A09 | Dify / Coze 低代码平台 | P1 | 30% | 未做 | 体验 + 插件开发 |
| A10 | 工作流编排 Workflow | P1 | 45% | 自研最小链路 | 需 LangGraph 对比 |
| A11 | Human-in-the-loop 人工确认 | P0 | 面试必问 | 未实现 | **待补** |
| A12 | Agent 错误恢复与重试 | P0 | 55% | 工具调用异常处理 | 需补熔断器 |
| A13 | 状态管理与持久化执行 | P1 | 35% | trace 记录 | 需 LangGraph checkpoint |

## 四、工具调用与协议

| ID | 技能 | 优先级 | JD 频率 | 项目证据 | 缺口 |
|---|---|---|---|---|---|
| T01 | Function Calling / Tool Calling | P0 | 70% | tools.py + java_tools.py | 已有 |
| T02 | 工具参数 JSON Schema 定义 | P0 | 50% | MCP manifest | 已有 |
| T03 | 工具注册与发现机制 | P0 | 55% | /tools API | 已有 |
| T04 | 工具权限控制与审计 | P0 | 45% | Java 审计日志 | 已有 |
| T05 | 工具幂等与超时重试 | P0 | 50% | Java 幂等 key | 已有 |
| T06 | MCP 协议（Host/Client/Server） | P0 | 45% | mcp-tool-server | 需补 MCP Server 实现 |
| T07 | MCP Tools/Resources/Prompts 三原语 | P1 | 35% | tools/list manifest | 需深化 |
| T08 | OpenAPI 3.0 工具契约 | P0 | 30% | openapi.json | 已有 |
| T09 | A2A Agent-to-Agent 协议 | P2 | 10% | 未做 | 了解概念 |
| T10 | Webhook 事件驱动集成 | P1 | 35% | 未做 | 第二个 sprint |
| T11 | 多工具协作编排 | P0 | 50% | 订单+工单+待办 | 已有 |
| T12 | API 封装：认证/限流/异常捕获 | P0 | 55% | Java 结构化错误 | 需补限流 |

## 五、RAG 全链路

| ID | 技能 | 优先级 | JD 频率 | 项目证据 | 缺口 |
|---|---|---|---|---|---|
| R01 | 文档解析 Markdown/PDF/Word | P0 | 60% | Markdown 入库 | 需补 PDF/Word |
| R02 | 文档切分策略（固定/递归/语义） | P0 | 55% | knowledge_base.py | 需补语义切分 |
| R03 | Embedding 模型选择与批量入库 | P0 | 55% | HashingEmbeddingModel | 需接真实 Embedding |
| R04 | 向量数据库 Qdrant | P0 | 60% | QdrantVectorIndex | 已有 |
| R05 | 向量数据库 Milvus/pgvector | P1 | 40% | 未做 | 了解对比 |
| R06 | 关键词检索 BM25 | P0 | 30% | BM25Retriever | 已有 |
| R07 | 混合检索 Dense + Sparse | P0 | 30% | HybridRetriever | 已有 |
| R08 | Rerank 重排序 | P0 | 25% | 轻量 reranker | 需接真实 rerank 模型 |
| R09 | Metadata 过滤与多租户隔离 | P1 | 30% | 基础 doc_id | 需补 |
| R10 | 引用溯源 Citation | P0 | 50% | Citation 模型 | 已有 |
| R11 | 低置信度拒答 | P0 | 40% | Agent 拒答逻辑 | 已有 |
| R12 | HyDE / Query Transformation | P1 | 15% | 未做 | 了解概念 |
| R13 | GraphRAG / Agentic RAG | P2 | 20% | 课程 part22 案例 | 加分项 |
| R14 | 多模态 RAG（OCR/VLM） | P2 | 30% | 课程 part18/part22 | 加分项 |
| R15 | RAG 评估 Recall@K / MRR / Faithfulness | P0 | 35% | retrieval eval report | 已有 |

## 六、记忆与上下文工程

| ID | 技能 | 优先级 | JD 频率 | 项目证据 | 缺口 |
|---|---|---|---|---|---|
| M01 | 短期会话上下文管理 | P0 | 40% | 单轮问答 | 需补多轮 |
| M02 | 长期记忆（向量/摘要） | P1 | 35% | 未做 | part08-agent-memory |
| M03 | 上下文压缩与摘要 | P1 | 30% | 未做 | part09-agent-context |
| M04 | Redis 会话状态存储 | P1 | 45% | 未做 | 第二个 sprint |
| M05 | 用户画像与个性化 | P2 | 20% | 未做 | 了解即可 |
| M06 | Context Engineering 四大策略 | P1 | 20% | 课程 part09 | 第一个月了解 |

## 七、评估与可观测性

| ID | 技能 | 优先级 | JD 频率 | 项目证据 | 缺口 |
|---|---|---|---|---|---|
| E01 | Eval Dataset 构造（JSONL） | P0 | 35% | eval_dataset.jsonl 20 条 | 已有 |
| E02 | 通过率/拒答率/工具成功率统计 | P0 | 40% | agent-eval-dashboard | 已有 |
| E03 | 失败分类与样本回放 | P0 | 30% | eval report | 已有 |
| E04 | Trace 链路记录 | P0 | 40% | AgentTrace | 已有 |
| E05 | LLM-as-Judge 自动评估 | P1 | 25% | 未做 | 了解偏见问题 |
| E06 | RAGAS / DeepEval 框架 | P1 | 20% | 未做 | 第二个 sprint |
| E07 | LangSmith / Langfuse 追踪 | P1 | 25% | 未做 | 了解概念 |
| E08 | OpenTelemetry 可观测性 | P2 | 15% | 未做 | 了解即可 |
| E09 | 延迟 P95 / Token 成本监控 | P1 | 30% | eval 延迟统计 | 需补生产监控 |
| E10 | A/B 测试 Prompt/检索策略 | P1 | 20% | 未做 | 第二个 sprint |

## 八、Java 后端与企业集成

| ID | 技能 | 优先级 | JD 频率 | 项目证据 | 缺口 |
|---|---|---|---|---|---|
| J01 | Spring Boot REST API | P0 | 50% | java-business-tool-service | 已有 |
| J02 | 参数校验与结构化错误码 | P0 | 45% | BusinessToolController | 已有 |
| J03 | 幂等设计与审计日志 | P0 | 40% | 幂等 key + audit | 已有 |
| J04 | MySQL/PostgreSQL | P0 | 50% | 模拟业务数据 | 需接真实 DB |
| J05 | Redis 缓存与会话 | P1 | 45% | 未做 | 第二个 sprint |
| J06 | 消息队列 Kafka/RabbitMQ | P1 | 30% | 未做 | 面试能讲 |
| J07 | Spring AI / LangChain4j | P1 | 35% | 决策文档对比 | 面试对比用 |
| J08 | 微服务与分布式事务 | P1 | 40% | 5 年 Java 经验 | 已有，需结合 AI 场景讲 |
| J09 | 多租户与权限 RBAC | P1 | 30% | 未做 | 第二个 sprint |
| J10 | 国产化数据库适配（达梦/金仓） | P2 | 15% | 未做 | 杭州部分公司要求 |

## 九、部署、运维与安全

| ID | 技能 | 优先级 | JD 频率 | 项目证据 | 缺口 |
|---|---|---|---|---|---|
| D01 | Docker Compose 多服务编排 | P0 | 55% | compose.yaml | 已有 |
| D02 | 健康检查与优雅启停 | P0 | 40% | healthcheck 配置 | 已有 |
| D03 | 日志规范与 traceId | P0 | 45% | AgentTrace | 需补统一 traceId |
| D04 | 密钥管理与环境变量 | P0 | 40% | OPENAI_* env | 已有 |
| D05 | 限流熔断与降级 | P1 | 35% | 未做 | **待补** |
| D06 | K8s 部署基础 | P1 | 35% | 未做 | 了解概念 |
| D07 | Prompt 注入与越权防护 | P0 | 面试必问 | 未系统实现 | **待补** |
| D08 | 数据脱敏与合规 | P1 | 25% | API key 脱敏测试 | 需补 |

## 十、平台工具与 AI-Native 开发

| ID | 技能 | 优先级 | JD 频率 | 项目证据 | 缺口 |
|---|---|---|---|---|---|
| X01 | Cursor / AI IDE 辅助开发 | P1 | 25% | 当前在用 | 已有 |
| X02 | Dify 工作流与插件 | P1 | 30% | 未做 | 体验 |
| X03 | Coze / 百炼 / 千帆平台 | P1 | 25% | 未做 | 了解 |
| X04 | AI 辅助 TDD/SDD 开发范式 | P2 | 15% | 项目 spec 驱动 | 已有方法论 |

## 十一、大模型原理（面试向，不主攻训练）

| ID | 技能 | 优先级 | JD 频率 | 项目证据 | 缺口 |
|---|---|---|---|---|---|
| K01 | Transformer / Self-Attention 原理 | P1 | 45% | 课程资料 | 需能讲 |
| K02 | Tokenizer 与 BPE | P1 | 30% | 了解 | 需巩固 |
| K03 | KV Cache 与推理加速 | P1 | 25% | 了解 | 需巩固 |
| K04 | SFT / RLHF / DPO 流程 | P2 | 35% | 了解概念 | 不主攻 |
| K05 | LoRA / QLoRA 微调 | P2 | 35% | 未做 | 了解概念 |

## 十二、软技能与业务表达

| ID | 技能 | 优先级 | JD 频率 | 项目证据 | 缺口 |
|---|---|---|---|---|---|
| S01 | 业务需求拆解为 Agent 任务流 | P0 | 50% | 作品集架构 | 需更多练习 |
| S02 | STAR 法则项目讲解 | P0 | 面试必问 | interview-kit | 需演练 |
| S03 | 技术方案文档输出 | P1 | 40% | specs/ 目录 | 已有 |
| S04 | 跨团队协作（产品/算法/业务） | P1 | 35% | 5 年工程经验 | 已有 |
| S05 | 行业趋势判断与学习能力 | P1 | 30% | industry watch 日志 | 持续进行 |

---

## 你的当前覆盖度（自动评估）

| 维度 | P0 总数 | 已有证据 | 学习中 | 待补 |
|---|---|---|---|---|
| 编程与工程 | 8 | 7 | 1 | 0 |
| LLM/Prompt | 7 | 5 | 0 | 2 |
| Agent 编排 | 6 | 3 | 2 | 1 |
| 工具与协议 | 8 | 7 | 0 | 1 |
| RAG | 10 | 8 | 0 | 2 |
| 记忆上下文 | 1 | 0 | 0 | 1 |
| 评估观测 | 5 | 5 | 0 | 0 |
| Java 集成 | 4 | 4 | 0 | 0 |
| 部署安全 | 5 | 4 | 0 | 1 |
| **合计** | **54** | **43 (80%)** | **3** | **8** |

### 第一个月必须补强的 8 项 P0 缺口

1. **P08** Prompt 注入防御
2. **A07** LangGraph 状态机编排（至少一个 demo）
3. **A11** Human-in-the-loop
4. **M01** 多轮会话上下文
5. **R01** PDF 文档解析
6. **R03** 真实 Embedding 模型
7. **T06** MCP Server 可运行实现
8. **D07** 安全边界与越权防护

## 简历关键词（按 JD 频率排序）

```
AI Agent, 大模型应用, RAG, Python, Prompt Engineering, Function Calling,
Tool Calling, MCP, LangChain, LangGraph, FastAPI, 向量数据库, Qdrant,
Embedding, 混合检索, Rerank, Spring Boot, Docker, 评估, Trace,
企业知识库, 工具调用, 引用溯源, 拒答, OpenAPI, 异步编程
```

## 与其他文档的关系

| 文档 | 关系 |
|---|---|
| [job-market-hangzhou.md](job-market-hangzhou.md) | 杭州岗位画像与搜索入口 |
| [tech-stack-roadmap.md](tech-stack-roadmap.md) | 技术栈学习路线 |
| [source-map.md](source-map.md) | 技能 → 本地课程资料映射 |
| [10-application-conversion-kit.md](10-application-conversion-kit.md) | 技能 → 项目证据 → 简历话术 |
| [02-30-day-sprint.md](02-30-day-sprint.md) | 按周拆解学习任务 |
| [logs/applications/skills-gap-review.md](../logs/applications/skills-gap-review.md) | 你的个人技能差距复盘 |

## 维护规则

- 每 2 周根据行业资讯和公开 JD 趋势更新一次本矩阵。
- 不爬取招聘平台；只引用公开 JD 摘要和已发布的行业分析。
- 技能状态以 `logs/applications/skills-gap-review.md` 的个人复盘为准。
