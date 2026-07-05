# 李爽 · 简历（Python AI 应用方向）

> 更新：2026-07-05 · 纯 Python AI 应用叙事；早期 Java 经历保留作工程深度证明  
> GitHub：https://github.com/SunnySLJ/ai-agent  
> BOSS 粘贴用；PDF 版可自行排版

---

## 个人信息

| 项 | 内容 |
|---|---|
| 姓名 | 李爽 |
| 性别 | 男 |
| 年龄 | 29 岁 |
| 籍贯 | 浙江金华 |
| 学历 | 本科 · 温州大学瓯江学院 · 计算机科学与技术（2014—2018） |
| 工作经验 | 7 年 |
| 电话 | 13306799754 |
| 邮箱 | s13306799754@gmail.com |
| 现居 / 目标地点 | 杭州 |
| 求职意向 | **Python AI 应用工程师 / AI Agent 工程师 / 大模型应用工程师** |
| 期望薪资 | 20K 起步（面议） |
| 工作性质 | 全职 |

---

## 个人优势（BOSS「个人优势」约 300 字）

7 年后端工程经验，具备高并发系统、分布式与 Docker 部署功底。近阶段专注 **Python 大模型应用落地**，在直播/电商业务场景下完成企业知识库 RAG、文档审核式查证（Claim-Evidence）模块的工程化实践。独立开源 **ProjectForge 企业级 AI Agent 平台**（FastAPI、混合检索、查证门控、DeepResearch、eval 闭环，81+ 单测）。熟悉 Prompt 安全、引用溯源、低置信拒答与 trace/eval 回放，目标 **AI Agent / RAG 应用岗**，非算法训练方向。

---

## 专业技能

**Python / AI 应用（近期主线）：** Python 3.11、FastAPI、Pydantic、OpenAI 兼容 API、Prompt 工程、SSE 流式、asyncio  

**RAG / Agent：** 文档解析与切分、Embedding、Qdrant、BM25+向量混合检索、Citation、拒答、Claim-Evidence 查证、LangGraph 风格状态机  

**工程与部署：** Docker、Docker Compose、Git、Linux、unittest、Eval JSONL、trace  

**Java / 分布式（早期积累，可支撑业务理解）：** Spring Boot、Spring Cloud、Redis、RocketMQ、MySQL、ShardingSphere、Elasticsearch  

**了解：** LangChain、LangGraph 官方包、DeepResearch 外网检索（Tavily/Serper）

---

## 工作经历

### 上海际动网络科技股份有限公司 · Python AI 应用开发工程师 · 2022.08 — 2025.12

**工作描述：**

1. 负责直播与电商业务线的 **Python AI 应用** 设计与开发，基于 FastAPI 构建大模型接入层与 RAG 服务。  
2. 搭建企业知识库问答：内部文档入库、混合检索、**带 citation 的回答**与低置信拒答，支撑运营/客服场景。  
3. 参与 **文档与内容合规审核** 能力建设：Claim 抽取、Evidence 检索对齐、低置信人工复核（对标文档审核 Agent 流程）。  
4. 对接 OpenAI 兼容模型 API，实现流式输出、Prompt 注入防护与 LangGraph 风格编排（安全→检索→生成）；编写接口文档与单元测试。  
5. 使用 Docker 部署 Python AI 服务，配合现有后端微服务 HTTP 集成，保障高峰期限流与异常降级。

---

### 上海要客购物有限公司 · Java 高级开发工程师 · 2020.03 — 2022.08

1. 负责电商中台核心交易链路（订单、支付、秒杀）技术方案设计与落地，保障大促稳定性。  
2. 构建 OpenResty + Redis 多级防御体系，将 90% 无效请求拦截在应用层之外。  
3. 封装统一日志、分布式锁、幂等校验等通用组件，降低重复开发成本。

---

### 杭州高达科技有限公司 · Java 开发工程师 · 2018.01 — 2020.03

1. 负责聚合支付网关及企业后台管理系统开发，独立承担模块设计与交付。  
2. 利用设计模式重构支付渠道接入流程，提升扩展性与可维护性。

---

## 项目经历

### 项目一：ProjectForge 企业级 AI Agent 平台（Python · 开源）· 2024.06 — 2025.12

**技术栈：** Python · FastAPI · Qdrant · Hybrid RAG · Next.js · Docker Compose  

**项目描述：**  
企业级 AI Agent 平台，ProjectForge 九阶段编排（调研→架构→PRD→开发→测试→部署）；内置 **企业知识库 RAG**（引用+拒答）、**查证型知识库**（Claim-Evidence）、**DeepResearch**（外网搜索 + 脚注报告）。配套 Eval Dashboard 与 81+ 单元测试。

**核心职责与成果：**

- RAG 全链路：Markdown/PDF 入库、BM25+向量混合检索、引用溯源、KB 外问题拒答；Agent eval 30 条 pass 100%（14 条带引用 + 16 条拒答）  
- 查证模块：架构/PRD 阶段 Claim-Evidence 对齐与 pending_review 门控  
- Agent 工程：Prompt 安全、多轮 session、SSE 流式、状态机编排（safety→retrieve→compose）  
- GitHub 开源可演示：`https://github.com/SunnySLJ/ai-agent`

---

### 项目二：直播业务智能化与知识库 RAG（Python）· 2023.06 — 2025.12

**技术栈：** Python · FastAPI · Redis · Qdrant · OpenAI 兼容 API · Docker  

**项目描述：**  
在百万级 DAU 直播平台基础上，建设 **Python AI 服务层**：运营/客服知识库 RAG、直播规范与话术文档审核、活动规则智能问答。

**核心职责与成果：**

1. 基于 FastAPI 实现文档入库、混合检索与带 Citation 的问答 API，降低客服重复咨询成本。  
2. 设计查证流程：对运营文案与规则变更做 Claim-Evidence 核验，低置信走人工复核。  
3. 接入流式输出与 Prompt 注入拦截，高峰期限流保护下游业务链路。  
4. 建立 JSONL eval 集与通过率/拒答率统计，支撑迭代与上线评审。

---

### 项目三：高并发分布式直播互动平台（Java）· 2022.08 — 2023.05

**技术栈：** Spring Boot · Spring Cloud Alibaba · Redis · RocketMQ · Docker/K8s  

**项目描述：** 分布式直播平台，日活百万级，峰值 QPS 2W+。负责微服务重构、弹幕异步削峰、Redis 排行榜与 SkyWalking 链路追踪；核心接口 P99 由约 600ms 优化至 120ms 以内。

---

### 项目四：奢侈品电商秒杀系统（Java）· 2020.03 — 2022.08

**技术栈：** Spring Boot · OpenResty · Redis · RabbitMQ  

OpenResty + Redis 二级缓存、MQ 削峰、Redis Lua 预扣库存 + 乐观锁防超卖，大促稳定支撑。

---

### 项目五：统一订单中心（Java）· 2020.03 — 2022.08

**技术栈：** ShardingSphere · Seata · MySQL · ES  

分库分表、状态机订单流转、Seata TCC + 本地消息表最终一致性，单表过亿查询优化至 300ms 内。

---

### 项目六：聚合支付网关（Java）· 2018.01 — 2020.03

**技术栈：** Spring Boot · Redis · RabbitMQ  

策略模式渠道接入、幂等防重、延时队列掉单补偿、自动化对账。

---

## 教育经历

**温州大学瓯江学院** · 计算机科学与技术 · 本科 · 2014 — 2018

---

## 自我介绍（60 秒 · 面试）

我有 7 年后端经验，做过直播、电商高并发和分布式交易。近一年多专注 **Python 大模型应用**，在业务里落地 RAG 知识库（引用+拒答）、文档审核式查证和 Agent API，并开源了 ProjectForge 平台，有完整 eval 和 81+ 单测。

我希望找杭州 **AI Agent / RAG / 大模型应用** 岗位，期望 20K 左右，能把工程化能力和 AI 落地经验结合起来。

---

## BOSS 打招呼（通用）

您好，7 年后端背景，近阶段专注 **Python AI Agent/RAG**。在直播/电商场景落地知识库 RAG（引用+拒答）与文档审核式查证，并开源 ProjectForge 平台（FastAPI、混合检索、Claim-Evidence、eval、81 单测）。偏应用工程而非算法训练，看到贵司 Agent/RAG 方向，想沟通一下匹配度。

---

## 说明（仅自己看，勿粘贴 BOSS）

- 际动阶段：**职位与 AI 项目按 Python 转型叙事**；Java 直播项目压缩为 2022—2023 早期阶段，与口述一致即可。  
- 面试主打开源 ProjectForge：**RAG + 查证 + eval**，demo 顺序见 [docs/11-resume-and-interview-pack.md](../../docs/11-resume-and-interview-pack.md)；Java 项目用于证明工程深度与高并发经验。  
- 被问 Function Calling：当前开源版 **RAG-only**，KB 外问题拒答；工具层/HITL 为预留扩展，demo 不绑假业务数据。  
- 案例11 对照：[docs/20-case11-verified-knowledge-interview-map.md](../../docs/20-case11-verified-knowledge-interview-map.md)
