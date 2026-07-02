# 简历与面试话术包（可直接复制）

> 更新日期：2026-07-01。仓库：<https://github.com/SunnySLJ/ai-agent>  
> 目标：杭州 · AI Agent / 大模型应用 / RAG 工程师 · 第一阶段 18K-25K

---

## 一、60 秒自我介绍

我有 5 年 Java 后端开发经验，做过业务系统、接口设计、数据库和服务化部署。最近我把职业方向聚焦到 **AI Agent / RAG 应用工程**——不是做模型训练，而是把大模型接进真实业务系统。

我的技术路线是 **Python 负责 Agent/RAG/评估主链路，Java 负责企业业务工具层**。我独立做了一个企业知识库 Agent Platform 作品集：支持混合检索、Qdrant 向量库、工具调用、引用回答、低证据拒答、Prompt 注入防御、人工确认、SSE 流式输出、trace 和评估回放，并通过 Docker Compose 把 Python API、Java 工具服务和 Qdrant 一键编排起来。

我希望找的是 **大模型应用落地 + 后端工程** 结合的岗位，而不是纯算法研究岗。

---

## 二、简历项目描述（整段复制）

**项目名称：** 企业知识库 AI Agent Platform（Python + Java 混合架构）

**项目描述：**

基于 Python + Java 设计并实现企业知识库 AI Agent Platform。Python 侧负责 RAG 混合检索（BM25 + 向量 + 轻量 Rerank）、Qdrant 向量库、引用回答、低置信度拒答、Prompt 注入拦截、多轮会话、Human-in-the-loop 审批、LangGraph 风格状态机编排、SSE 流式输出、OpenAI-compatible LLM/Embedding 适配和 FastAPI 服务；Java 侧基于 Spring Boot 实现订单、工单、待办等企业业务工具，覆盖参数校验、幂等 key、审计日志和结构化错误码。项目通过 HTTP/MCP/OpenAPI 暴露工具边界，支持 Docker Compose 一键启动，配套 Eval Dashboard 对 20 条问答样本输出通过率、拒答率、工具成功率和失败分类报告。仓库含 60+ 单元测试，GitHub 开源可演示。

---

## 三、简历 Bullet（选 4-5 条）

- 设计 Python Agent/RAG 主链路：文档入库（Markdown/PDF）、BM25+向量混合检索、Qdrant 接入、引用溯源、低证据拒答、trace 记录和 eval summary。
- 实现 Agent 工具调用与安全边界：Function Calling 编排订单/工单/待办查询，`create_todo` 写操作走 Human-in-the-loop 人工确认；Prompt 注入规则拦截在检索和工具调用之前。
- 基于 Spring Boot 实现 Java Business Tool Service，封装企业业务工具 API，提供幂等、审计、结构化错误码；Python 通过 HTTP adapter 和 MCP stdio Server 安全调用。
- 建立 Agent 评估体系：20 条 JSONL eval case，pass_rate=100%、refusal_rate=25%、tool_success_rate=100%；检索 eval hybrid hit_rate=100%、MRR=0.9。
- 工程化交付：FastAPI + SSE 流式接口、OpenAI-compatible Chat/Embedding 双适配、Docker Compose 编排 Python/Java/Qdrant，GitHub Actions 每日行业资讯自动化。

---

## 四、BOSS 打招呼话术

### 版本 A：AI Agent / RAG（通用，推荐）

您好，我有 5 年 Java 后端经验，最近重点做 AI Agent/RAG 应用工程。作品集是 Python Agent 主链路 + Java 业务工具服务：混合检索、工具调用、引用拒答、Prompt 安全、人工确认、SSE 流式、trace 和 eval 报告都有代码和测试。GitHub 可演示，Docker Compose 一键启动。看到岗位涉及 Agent/RAG/大模型应用落地，想沟通一下匹配度。

### 版本 B：大模型应用工程师

您好，Java 后端背景，熟悉 Spring Boot 和服务化部署。最近补齐 Python 大模型应用链路，做了企业知识库 Agent Platform：RAG 检索、Function Calling、评估回放、OpenAPI/MCP 工具契约，Java 承接订单/工单等业务接口。方向偏工程落地而非算法训练，想了解贵司业务场景。

### 版本 C：RAG / 知识库工程师

您好，5 年 Java 后端，近期重点做企业知识库 RAG：文档解析切分、BM25+向量混合检索、Qdrant、引用溯源、拒答策略和 eval 数据集。有完整开源项目和检索评估报告（hybrid hit_rate=100%）。想了解贵司知识库/智能客服方向是否匹配。

### 版本 D：Java + AI 后端

您好，长期做 Java 后端（接口、权限、审计、幂等、部署）。最近在做 AI Agent 接入企业系统：Java 负责业务工具层，Python 负责 RAG/Agent/评估。这个方向和 Java + 大模型应用岗位比较接近，想进一步了解。

---

## 五、3 分钟项目讲解（面试口述稿）

**第 1 分钟：业务问题 + 架构**

> 企业内部文档散落，客服和运营反复回答同类问题，而且很多问题还要查订单、工单等实时业务数据。  
> 所以我做了一个企业知识库 Agent Platform。架构是 Python + Java 混合：Python 做 Agent/RAG/评估，Java 做企业业务工具层。这样既用 Python AI 生态快速迭代，也保留我 5 年 Java 后端的工程优势。

**第 2 分钟：主链路 + 工具链路**

> 用户提问后，先做 Prompt 注入检测，再走 LangGraph 风格的状态机：检索 → 工具 → 生成。  
> 检索用 BM25 + 本地向量混合检索，可选接 Qdrant 和 OpenAI-compatible Embedding。回答必须带引用，证据不足就拒答。  
> 涉及业务数据时，Agent 通过 HTTP 调 Java Spring Boot 工具服务查订单、工单；创建待办这类写操作需要人工确认（Human-in-the-loop），不会直接执行。  
> 同时提供 MCP stdio Server 和 OpenAPI 合约，定义工具边界。

**第 3 分钟：工程化 + 数据**

> 工程上我处理了四类问题：幻觉（引用+拒答）、工具误调用（schema+审批+审计）、问题定位（trace 记录检索/工具/延迟/token）、效果优化（20 条 eval + 检索 eval）。  
> 评估数据：Agent eval pass_rate 100%、refusal 25%、tool success 100%；检索 hybrid hit_rate 100%、MRR 0.9。  
> 部署上 Docker Compose 一键启动 Python API + Java + Qdrant，API 支持 SSE 流式输出。仓库 60+ 单元测试，GitHub 开源可演示。

---

## 六、Demo 演示顺序（10 分钟）

1. **GitHub 首页**：<https://github.com/SunnySLJ/ai-agent> → README 已实现能力一览
2. **架构一句话**：Python AI 主链路 + Java 业务工具 + MCP/OpenAPI 边界
3. **Docker 启动**：`docker compose up --build` → 三服务 healthy
4. **文档入库 + RAG 问答**：
   ```bash
   curl -X POST http://127.0.0.1:8000/documents -H 'Content-Type: application/json' \
     -d '{"doc_id":"demo","title":"Hybrid Architecture","content":"Python owns Agent RAG while Java exposes business tools."}'
   curl -X POST http://127.0.0.1:8000/ask -H 'Content-Type: application/json' \
     -d '{"question":"Python 和 Java 怎么分工?"}'
   ```
5. **工具调用**：`查询订单 ORD-1001 的状态` → trace 里有 `get_order_status`
6. **Human-in-the-loop**：`创建一个待办：跟进客户` → 返回 approval_id → `POST /approvals/{id}/confirm`
7. **SSE 流式**：`curl -N -X POST http://127.0.0.1:8000/ask/stream ...`
8. **Eval 报告**：`portfolio/agent-eval-dashboard/reports/latest.md`（20 cases, 100% pass）
9. **检索评估**：`reports/retrieval-latest.md`（hybrid hit_rate=100%）
10. **Java 工具服务 + MCP**：`java-business-tool-service` + `mcp-tool-server/mcp_server.py`

---

## 七、高频追问 + 标准答法

### Q1：你没有 AI 工作经验，为什么能胜任？

我不会包装成算法工程师。我匹配的是 **AI 应用工程岗**——把模型能力接进业务系统。这需要后端工程、系统集成、接口安全、日志监控和部署能力，这是我的 Java 背景。我补齐的是 RAG、Agent 工具调用、评估和模型 API 链路，并且有开源项目和测试数据支撑。

### Q2：RAG 为什么会幻觉？你怎么处理？

四类原因：解析错、切分不合理、检索没召回、生成阶段编造。我的处理是：**引用溯源**（答案必须带 doc_id/chunk）、**低证据拒答**（无检索结果且无工具结果时拒绝）、**eval 数据集**持续验证。定位问题时看 trace 里的 retrieved_chunks 和 tool_calls，不只看最终答案。

### Q3：Agent 和普通 ChatBot 有什么区别？

ChatBot 主要是问答。Agent 能 **根据问题选择工具**、调用企业系统、处理异常，并记录 trace。但生产环境不能完全放任——需要工具白名单、参数 schema、人工确认（我的 `create_todo` 就是）、审计和回放。

### Q4：为什么 Python 做 AI、Java 做业务？

Python 生态在 LLM API、RAG 框架、评估工具上迭代快，适合 Agent 主链路实验和落地。Java 在企业业务系统、权限、审计、事务、幂等和稳定部署上有 5 年积累。我的项目不是二选一，而是 **Python AI 主链路 + Java 工具层**，这也是很多国内企业落地的实际架构。

### Q5：你的混合检索怎么做的？效果怎样？

BM25  lexical 检索 + 本地 hashing 向量（或 OpenAI Embedding）dense 检索，合并候选后做轻量 rerank（覆盖率 + 标题重叠 + 归一化分数加权）。检索 eval 5 条 case，hybrid **hit_rate=100%、MRR=0.9**。面试时可以说：先用规则 rerank 做 MVP，后续可换 cross-encoder rerank 模型。

### Q6：MCP 在你项目里是什么角色？

MCP 是 **工具契约层**。我的 Java 服务通过 OpenAPI 定义接口，MCP manifest 定义 `tools/list` 和 inputSchema，另有可运行的 MCP stdio Server 代理 HTTP 调用。价值是：Agent 不直接碰数据库，而是通过白名单工具安全访问企业系统。

### Q7：你怎么做 Agent 评估？

JSONL 数据集 20 条，覆盖引用回答、工具调用、拒答三类。Eval runner 输出 pass_rate、refusal_rate、tool_success_rate、latency、token 估算和失败分类。当前 **pass_rate=100%**。这比只展示 Demo 更能证明工程思维。

### Q8：Prompt 注入怎么防？

规则引擎在检索和工具调用 **之前** 拦截（中英文 injection pattern）。被拦截时 `safety_blocked=true`，不触发检索和工具。后续可叠加 LLM 分类器，但规则层是零成本第一道防线。

### Q9：流式输出怎么实现的？

`POST /ask/stream` 返回 SSE，事件类型 `meta`（引用/工具元数据）→ `token`（增量文本）→ `done`（完整 AgentResponse）。LLM 模式走 OpenAI-compatible `stream=true`；离线模式分块输出确定性答案。

### Q10：如果线上出问题，你怎么排查？

看 trace：question → retrieved_chunks → tool_calls → model_response → latency_ms。结合 eval 失败分类（未召回/工具错/生成错）。我的项目设计了拒答和工具失败路径，eval 里专门有 refusal case 和工具 404 case。

---

## 八、STAR 项目讲解模板

**S（情境）：** 企业内部知识散落，客服重复回答，且常需查订单/工单实时数据。

**T（任务）：** 设计一个可演示、可测试、可评估的企业知识库 Agent 系统，体现 Python AI + Java 后端混合能力。

**A（行动）：**
- Python：混合检索、引用拒答、工具编排、安全拦截、人工确认、SSE 流式、eval runner
- Java：订单/工单/待办工具服务，幂等+审计+错误码
- 集成：HTTP adapter、MCP Server、OpenAPI 合约、Docker Compose

**R（结果）：**
- 20 条 eval pass_rate 100%，检索 hybrid hit_rate 100%
- 60+ 单元测试，GitHub 开源，Compose 三服务一键启动
- 覆盖 JD 中 RAG、Tool Calling、MCP、评估、部署等 P0 技能约 93%

---

## 九、不要说的话

- ❌ 「负责线上千万级 Agent 系统」
- ❌ 「精通模型训练 / 微调 / CUDA」
- ❌ 「有 3 年 AI 生产经验」
- ❌ 「精通 LangChain/LangGraph 源码」（可以说「有状态机编排实践，正在深入 LangGraph 官方包」）

## 十、可以说的话

- ✅ 「我做的是 AI 应用工程，重点是 RAG + 工具调用 + 评估 + 企业系统集成」
- ✅ 「Python 做 AI 主链路，Java 做业务工具层，这是我的差异化」
- ✅ 「有 eval 数据和检索指标，不是只调了个 Demo」
- ✅ 「开源可演示，Docker Compose 一键启动」

---

## 十一、相关文档

- [10-application-conversion-kit.md](10-application-conversion-kit.md) — JD 映射、投递规则
- [12-interview-kit.md](12-interview-kit.md) — 精简版面试材料
- [09-job-skills-matrix.md](09-job-skills-matrix.md) — 90+ 技能矩阵
- [templates/T03-boss-message.md](templates/T03-boss-message.md) — BOSS 话术模板
