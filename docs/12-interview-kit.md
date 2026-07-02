# 面试与求职材料

> 完整可复制版本见 [11-resume-and-interview-pack.md](11-resume-and-interview-pack.md)

## 自我介绍 60 秒

我有 5 年 Java 后端开发经验，主要做业务系统、接口设计、数据库和服务化工程。最近我把方向聚焦到 AI Agent 和 RAG 应用工程，重点不是做模型训练，而是把大模型能力接进真实业务系统。我的技术路线是 Python 负责 Agent/RAG/评估主链路，Java 负责业务系统和工具 API。我正在做一个企业知识库 Agent Platform，支持混合检索、工具调用、引用拒答、Prompt 安全、人工确认、SSE 流式、trace 和评估回放，希望找的是 AI 应用落地和后端工程结合的岗位。

## BOSS 打招呼短句

我有 5 年 Java 后端经验，最近重点转向 AI Agent/RAG 应用工程，技术路线是 Python 做 Agent/RAG/评估，Java 做业务工具服务和系统集成。做过企业知识库 Agent 方向的开源项目（混合检索、工具调用、HITL、SSE 流式、eval 报告、Docker Compose），GitHub 可演示。看到贵司岗位涉及大模型应用/Agent/知识库方向，想进一步沟通一下岗位匹配度。

更多版本见 [templates/T03-boss-message.md](templates/T03-boss-message.md)。  
完整求职转化包见 [10-application-conversion-kit.md](10-application-conversion-kit.md)。

## 项目介绍 3 分钟

我做的主项目是企业知识库 Agent Platform，目标是解决企业内部文档散落、客服和运营重复问答的问题。

整体架构是 Python + Java 混合：Python 负责 Agent/RAG 主链路，用户提问后先做 Prompt 注入检测，再经状态机编排完成检索、工具调用和答案生成；检索用 BM25 + 向量混合检索，可选 Qdrant 和真实 Embedding；Java 负责企业业务工具服务，比如订单、工单、待办、权限、审计和幂等。写操作（如创建待办）走 Human-in-the-loop 人工确认。Python Agent 通过 HTTP adapter 和 MCP stdio Server 调 Java 工具接口。最终答案必须带来源引用，如果置信度不足就拒答。API 支持 SSE 流式输出。

工程上我重点处理了四类问题：第一是 RAG 幻觉，所以做了引用来源和低置信度拒答；第二是工具误调用，所以每个工具有参数 schema、写操作审批和审计日志；第三是问题定位，所以记录 question、retrievedChunks、toolCalls、modelResponse、latency 和 tokens；第四是效果优化，所以构造了 20 条评估样本和检索 eval，pass_rate=100%、hybrid hit_rate=100%。

这个项目体现的是我的迁移路线：Python 用来快速落地 Agent/RAG/评估，Java 用来承接企业业务系统和稳定工程化，不是只调模型，而是把模型能力变成一个可部署、可观测、可评估、能接业务系统的 Agent 平台。

当前仓库可展示的证据：Python Agent API（60+ tests）、Java Business Tool Service、MCP Server、OpenAPI 合约、Docker Compose、Agent Eval Dashboard。

## 高频问题

### 你没有 AI 工作经验，为什么能胜任？

我不会把自己包装成算法工程师。我匹配的是 AI 应用工程岗位，核心是把模型能力接入真实业务。这个岗位需要后端工程、系统集成、数据处理、接口安全、日志监控和部署能力，这些正好是我的 Java 背景。我补齐的是 RAG、Agent 工具调用、评估和模型调用链路，并有开源项目和 eval 数据支撑。

### RAG 为什么会答错？

常见原因有四类：文档解析错、切分不合理、检索没召回、生成阶段幻觉。定位时不能只看最终答案，要看原始问题、召回 chunk、rerank 结果、Prompt、模型输出和引用来源。我的项目用引用溯源 + 低证据拒答 + eval 数据集来约束。

### Agent 和工作流有什么区别？

普通工作流路径固定，适合确定性任务。Agent 会根据目标和上下文选择工具、规划步骤、处理异常，更适合开放问题。但生产系统不能完全放任 Agent，需要工具白名单、权限、人工确认、日志和回放。我的 `create_todo` 就实现了人工确认。

### Java 做 AI Agent 有优势吗？

有。Python 更适合 Agent/RAG/评估和快速实验，Java 更适合企业业务系统、权限、审计、事务、数据集成和部署。我的路线不是二选一，而是 Python 做 AI 主链路，Java 做业务工具层。

### 如何控制成本？

从四层控制：模型路由、Prompt 长度、RAG 上下文数量、缓存和降级。简单问题用便宜模型，高风险或复杂问题再用强模型；检索上下文要压缩；常见问答可以缓存；超时或失败时要有降级回答。

### 你怎么做 Agent 评估？

JSONL 数据集 20 条，覆盖引用回答、工具调用、拒答。Eval runner 输出 pass_rate、refusal_rate、tool_success_rate、latency 和失败分类。当前 pass_rate=100%、tool_success_rate=100%。

## 简历关键词

Java 后端 · Python · FastAPI · SSE 流式 · RAG · 混合检索 · Qdrant · Embedding · Tool Calling · Human-in-the-loop · MCP · Prompt 安全 · LangGraph · Spring Boot · Docker · Evaluation · Trace · 企业知识库
