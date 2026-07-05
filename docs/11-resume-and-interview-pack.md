# 简历与面试话术包（纯 Python · AI Agent/RAG）

> 更新：2026-07-05 · 仓库：https://github.com/SunnySLJ/ai-agent  
> 目标：杭州 · **Python AI 应用 / AI Agent / RAG 工程师** · **18～25K（20K 起步）**  
> **⏸ 2026-07-05 起 1 个月内不投简历**；本文档供学习与第 2 个月投递前准备。  
> **完整可粘贴简历：** [logs/applications/resume-李爽-python-ai.md](../logs/applications/resume-李爽-python-ai.md)  
> **Agent 总需求：** [shuang-plan.md](../shuang-plan.md)

---

## 一、60 秒自我介绍

我有 5 年后端开发经验，最近把方向聚焦到 **Python 大模型应用工程**——不是做模型训练，而是把 Agent/RAG 接进真实业务。

我独立做了 **ProjectForge 企业级 AI Agent 平台**：企业知识库混合检索、查证型知识库（Claim-Evidence，对标文档审核 Agent）、DeepResearch 外网调研，以及九阶段 ProjectForge 编排。项目强调 **带 citation 的 RAG、低证据拒答、trace 与 eval 闭环**，81+ 单测和 Docker 演示，GitHub 开源。

我希望找杭州 **AI Agent / RAG / 大模型应用** 岗位，期望薪资 20K 左右。

---

## 二、简历项目描述（整段复制）

**项目名称：** ProjectForge 企业级 AI Agent 平台（Python）

**项目描述：**

基于 Python 设计并实现企业级 AI Agent 平台。以 ProjectForge 九阶段造物编排串联调研→架构→PRD→开发→测试→部署；内置三大引擎：**企业知识库 RAG**（BM25+向量混合检索、Qdrant、引用与拒答）、**查证型知识库**（Claim-Evidence 对齐、pending_review 门控）、**DeepResearch**（Tavily/Serper 外网 + 内部 KB 脚注报告）。Python 侧 FastAPI、SSE 流式、Prompt 安全、多轮 session、LangGraph 风格状态机；配套 Eval Dashboard（Agent 30 条 pass 100%、16 条拒答用例、检索 MRR 0.94）、81+ 单元测试，Docker Compose 一键演示。GitHub 开源。

**技术栈：** Python · FastAPI · Qdrant · Hybrid RAG · LangGraph风格编排 · Docker

---

## 三、简历 Bullet（选 4～5 条）

- 企业知识库 RAG：Markdown/PDF 入库、BM25+向量混合检索、Qdrant、引用溯源、低置信拒答；Agent eval 30 条 pass 100%
- 查证型知识库：Claim-Evidence 核验、架构/PRD 查证门控，对标 LangChain 文档审核 Agent（part22 案例11）
- DeepResearch：子问题规划、Tavily/Serper 外网搜索、脚注报告；Forge 第二轮继承上一轮 ADR/PRD
- Agent 工程：Prompt 注入拦截、多轮 session、SSE 流式、LangGraph 风格状态机（安全→检索→生成）
- 工程化：81+ 单测、trace、Eval Dashboard、Docker Compose 编排 API/Web/Qdrant

---

## 四、BOSS 打招呼话术

### 版本 A：AI Agent / RAG（通用，推荐）

您好，我有 5 年后端经验，近期专注 **Python AI Agent/RAG**。开源 ProjectForge：企业知识库混合检索、查证型 Claim-Evidence、DeepResearch、九阶段编排，FastAPI + eval + 81 单测，Docker 可演示。偏大模型应用落地而非算法训练，想沟通岗位匹配度。

### 版本 B：大模型应用工程师

您好，后端工程背景，熟悉服务化与 Docker。近期补齐 Python 大模型应用：RAG、引用拒答、文档审核式查证、评估回放，ProjectForge 平台 GitHub 可演示。想了解贵司业务场景。

### 版本 C：RAG / 知识库工程师

您好，5 年后端，近期做企业知识库 RAG：解析切分、混合检索、Qdrant、引用拒答、eval 数据集；另有查证型 Claim-Evidence 模块。开源项目 + 检索评估报告，想了解贵司知识库/智能客服方向。

### ~~版本 D：Java + AI~~（已弃用，不再使用）

---

## 五、3 分钟项目讲解（面试口述稿）

**第 1 分钟：问题 + 架构**

> 企业文档散落，回答难溯源，架构和 PRD 结论容易幻觉。  
> 我做了 **ProjectForge 企业级 AI Agent 平台**，Python 全链路：九阶段编排 + 三大引擎——RAG、查证、DeepResearch。

**第 2 分钟：三引擎 + Agent 链路**

> 用户提问走 RAG：文档入库 → 混合检索 → **必须带 citation**；知识库没有证据就 **拒答**，不编造订单或业务数据。  
> 架构/PRD 阶段走查证：Claim 抽出来，和知识库 Evidence 对齐，低置信 pending_review。  
> 调研阶段走 DeepResearch：子问题 + 外网搜索 + 脚注。  
> Agent 主链路：**安全检测 → 检索 → 生成**；全程 trace 可回放。

**第 3 分钟：工程化 + 数据**

> eval：Agent 30 条 pass 100%（14 条带引用 + 16 条拒答），检索 MRR 0.94，查证 eval 8 条。  
> 81+ 单测，Docker Compose 启动 Web+API+Qdrant。  
> 对标课程文档审核案例，我在工程里加了 eval 和部署。

---

## 六、Demo 演示顺序（10 分钟）

1. GitHub → README  
2. `docker compose up --build`  
3. Web **ProjectForge 工作台** → 九阶段 demo  
4. **RAG 核心 demo**（推荐顺序）  
   - 先 `POST /documents` 入库一段资料  
   - 再 `POST /ask` 问相关问题 → 展示 **citation**  
   - 再问知识库外问题（如「查询订单 ORD-1001」）→ 展示 **拒答**  
5. 架构阶段 **查证面板**（Claim-Evidence）  
6. `POST /deep-research/run` 外网脚注（有 key 时）  
7. Eval 报告 `agent-eval-dashboard/reports/latest.md`  
8. 第二轮 Forge：填 `prior_run_id` → 继承 ADR  

详见 [demo-scripts.md](demo-scripts.md)

---

## 七、高频追问 + 标准答法

### Q1：没有 AI 工作经验？

我匹配的是 **AI 应用工程岗**。我补齐 RAG、查证、eval，有开源项目和测试数据；5 年工程经验保证能落地部署和排错。

### Q2：RAG 幻觉怎么处理？

三层：**引用溯源**（答案必须挂 citation）、**低证据拒答**（KB 里没有就不答）、**查证型 Claim-Evidence**（架构/PRD 断言对齐证据）；配合 eval 和 trace 里的 chunks/claims 回放验证。

### Q3：Agent 和 ChatBot 区别？

ChatBot 只生成文本。我的 Agent 会先过 **安全检测**，再 **检索知识库**，证据够才生成并附 citation，不够就拒答；全程 **trace** 可回放。后续可扩展工具层，但当前作品集聚焦 **RAG 落地**，不做假业务 API。

### Q4：为什么选 Python？

LLM/RAG/Agent 生态在 Python 迭代最快；我的作品集全 Python，能独立交付 FastAPI + eval + Docker。

### Q5：混合检索效果？

BM25 + 向量 + 规则 Rerank；检索 eval hit 100%、MRR ~0.94。MVP 用规则 Rerank，可升级 cross-encoder。

### Q6：文档审核和项目关系？

part22 案例11 是 LangChain 文档审核；我用 **Claim-Evidence + 查证门** 落在 `verified_knowledge.py`，并接入 ProjectForge 架构/PRD 阶段，带 eval。

### Q7：Agent 评估？

JSONL 30 条：14 条要求带 citation、16 条要求拒答（含订单/待办等 KB 外问题）；另有 verification 8 条。指标：pass_rate、refusal_rate、MRR、失败分类。

### Q8：Prompt 注入？

规则层在检索/生成前拦截；`safety_blocked` 不触发下游 LLM。

### Q9：被问「有没有 Function Calling / 工具调用」？

当前版本 **RAG-only**：核心是可溯源问答和拒答。工具层接口和 HITL 审批链路在代码里预留了扩展点，但 demo 不绑假订单数据——面试重点讲 **证据链和 eval**，不是编业务状态。

---

## 八、STAR 模板

**S：** 企业知识难溯源，乱答/幻觉风险高。  
**T：** Python Agent 平台，可 demo、可 eval、可面试讲清 RAG 工程。  
**A：** ProjectForge 编排 + RAG（引用+拒答）+ 查证 + DeepResearch + FastAPI + eval + Docker  
**R：** 30 eval pass 100%，81+ 单测，开源可演示  

---

## 九、不要说 / 可以说

❌ 负责千万级 Agent 生产 · 精通训练/CUDA · 3 年 AI 经验 · 精通 LangGraph 源码 · 接入了订单/工单业务系统  

✅ Python AI 应用 · RAG 引用+拒答+查证+eval 有数据 · 对标文档审核案例 · Docker 可演示 · KB 外问题会拒答  

---

## 十、相关文档

- [shuang-plan.md](../shuang-plan.md) — 总需求  
- [resume-李爽-python-ai.md](../logs/applications/resume-李爽-python-ai.md) — 简历正文  
- [10-application-conversion-kit.md](10-application-conversion-kit.md) — JD 映射  
- [08-job-market-hangzhou.md](08-job-market-hangzhou.md) — 杭州岗位  
