# 简历（纯 Python · AI Agent/RAG · 杭州 20K 起步）

> 更新：2026-07-05 · 粘贴 BOSS/猎聘前请替换 `[ ]` 中的个人信息  
> GitHub：https://github.com/SunnySLJ/ai-agent

---

## 个人信息

| 项 | 内容 |
|---|---|
| 姓名 | 李爽 |
| 年龄 | 29 岁 |
| 学历 | 本科 · 温州大学瓯江学院 · 计算机科学与技术（2014—2018） |
| 工作年限 | 7 年（早期 Java，**近期 Python AI 应用**） |
| 电话 / 邮箱 | 13306799754 · s13306799754@gmail.com |
| 现居 / 目标 | 浙江金华 / **杭州** |
| 求职意向 | **Python AI 应用工程师 / AI Agent 工程师 / RAG 工程师** |
| 期望薪资 | **20K 起步**（面议） |

> **完整版（含全部工作经历与项目）见：[resume-李爽-python-ai.md](resume-李爽-python-ai.md)**

---

## 个人优势（BOSS「个人优势」栏，约 300 字）

5 年后端工程经验，具备接口设计、测试与 Docker 部署习惯，转型专注 **Python 大模型应用落地**。独立开源 **ProjectForge 企业级 AI Agent 平台**：覆盖 RAG 混合检索、查证型知识库（Claim-Evidence 文档审核）、DeepResearch 外网调研、九阶段 Agent 编排与 eval 闭环；FastAPI + Qdrant + SSE 流式，93+ 单元测试，Docker Compose 可演示。熟悉 Prompt 安全、Human-in-the-loop、引用溯源与低置信拒答，目标岗位为 **AI Agent / 大模型应用 / RAG**，非算法训练方向。

---

## 专业技能

**Python / AI 应用：** Python 3.11、FastAPI、Pydantic、asyncio、OpenAI 兼容 API、Prompt 工程、Function Calling、SSE 流式  

**RAG / 知识库：** 文档解析（Markdown/PDF）、切分、Embedding、Qdrant、BM25+向量混合检索、Rerank、Citation、拒答策略  

**Agent / 编排：** ReAct 思路、LangGraph 风格状态机、工具调用、多轮会话、HITL 人工确认、Prompt 注入防御  

**查证 / 文档审核：** Claim-Evidence 对齐、置信度门控、pending_review、架构/PRD 查证门  

**DeepResearch：** 子问题规划、Tavily/Serper 外网搜索、脚注报告  

**工程化：** Docker Compose、unittest、Eval Dataset（JSONL）、trace、Git  

**了解：** LangChain、LangGraph 官方包（项目内自研状态机，可迁移）、LlamaIndex  

---

## 工作经历

### [公司名称] · Java 后端工程师 · [YYYY.MM - YYYY.MM / 至今]

> 说明：工作经历保留事实，**突出可迁移到 AI 应用的工程能力**；面试主打开源 Python 项目。

- 负责 [业务域] 后端服务设计与开发，REST API、参数校验、日志与异常处理  
- 参与 [系统] 性能与稳定性优化，单元测试与 Code Review  
- 使用 Docker / [MySQL/Redis/…] 完成 [具体场景] 落地  
- [可选] 对接第三方 HTTP API，熟悉服务集成与超时重试  

### [上一家公司] · Java 后端工程师 · [YYYY.MM - YYYY.MM]

- [按实际情况填写 2～3 条，偏工程、接口、数据、部署]  

---

## 项目经历（核心，面试重点）

### ProjectForge 企业级 AI Agent 平台（Python）· 独立开源 · [2026.05 - 至今]

**技术栈：** Python · FastAPI · Qdrant · Hybrid RAG · LangGraph风格编排 · Next.js · Docker  

**项目描述：**  
基于 Python 实现企业级 AI Agent 平台，以 **ProjectForge 九阶段造物编排** 串联需求调研→架构→PRD→开发→测试→部署；内置三大能力引擎：**企业知识库 RAG**（混合检索与引用拒答）、**查证型知识库**（Claim-Evidence 对齐，对标文档审核 Agent）、**DeepResearch**（Tavily/Serper 外网 + 内部 KB 脚注报告）。配套 Eval Dashboard、93+ 单元测试与 Docker Compose 一键演示。

**主要职责与成果：**

- 设计 RAG 全链路：Markdown/PDF 入库、BM25+向量混合检索、Qdrant、引用溯源、低置信拒答；Agent eval **30 条 pass 100%**，检索 **MRR 0.94**  
- 实现查证型知识库：`verified_knowledge` Claim-Evidence 对齐、pending_review / contradicted 门控；架构/PRD 阶段强制查证，对标 LangChain 文档审核场景  
- 实现 DeepResearch：子问题规划、外网搜索 API、脚注 Markdown；接入 Forge 调研阶段，支持第二轮 run 继承上一轮 ADR/PRD  
- Agent 工程化：Prompt 注入拦截、多轮 session、写操作 HITL 审批、SSE 流式、`graph_orchestrator` 状态机（safety→retrieve→tools→compose）  
- 交付 Web 工作台与 REST API；GitHub 开源，Compose 编排 API + Web + Qdrant  

**仓库：** https://github.com/SunnySLJ/ai-agent  

---

### [可选：第二个 smaller 项目或工作中与 AI/搜索相关的模块]

- 若无第二项目，面试只深挖 ProjectForge 即可  

---

## 教育经历

| 学校 | 专业 | 学历 | 时间 |
|---|---|---|---|
| [学校名] | [专业] | [本科/…] | [YYYY-YYYY] |

---

## 自我介绍（60 秒 · 面试开场）

我有 5 年后端开发经验，最近把方向聚焦到 **Python 大模型应用工程**——不是做模型训练，而是把 Agent/RAG 接进真实业务。

我独立做了 **ProjectForge 企业级 AI Agent 平台**：包括企业知识库混合检索、查证型知识库（Claim-Evidence，类似文档审核 Agent）、DeepResearch 外网调研，以及九阶段 ProjectForge 编排。项目有完整的 eval、93 条单测和 Docker 演示，GitHub 开源。

我希望找的是杭州 **AI Agent / RAG / 大模型应用** 岗位，薪资期望 20K 左右，能发挥工程落地和系统集成能力。

---

## BOSS 打招呼（纯 Python · 通用版）

您好，我有 5 年后端经验，近期专注 **Python AI Agent/RAG 应用**。开源项目 ProjectForge：混合检索、查证型知识库（Claim-Evidence 文档审核）、DeepResearch、九阶段编排，FastAPI + eval + 93 单测，Docker 可演示。方向偏 **大模型应用落地** 而非算法训练，看到岗位涉及 Agent/RAG，想沟通匹配度。

---

## 投递前 checklist

- [ ] 替换个人信息与公司经历  
- [ ] GitHub README 与简历数据一致（30 eval、93 tests）  
- [ ] 准备公网 demo 链接或录屏  
- [ ] 每投一岗记录到 `logs/applications/YYYY-MM-DD-applications.md`
