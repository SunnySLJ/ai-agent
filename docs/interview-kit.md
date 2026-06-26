# 面试与求职材料

## 自我介绍 60 秒

我有 5 年 Java 后端开发经验，主要做业务系统、接口设计、数据库和服务化工程。最近我把方向聚焦到 AI Agent 和 RAG 应用工程，重点不是做模型训练，而是把大模型能力接进真实业务系统。我的技术路线是 Python 负责 Agent/RAG/评估主链路，Java 负责业务系统和工具 API。我正在做一个企业知识库 Agent Platform，支持文档入库、检索引用、工具调用、拒答、trace 和评估回放，希望找的是 AI 应用落地和后端工程结合的岗位。

## BOSS 打招呼短句

我有 5 年 Java 后端经验，最近重点转向 AI Agent/RAG 应用工程，技术路线是 Python 做 Agent/RAG/评估，Java 做业务工具服务和系统集成。做过企业知识库 Agent 方向的项目实践，熟悉 RAG、工具调用、trace、评估和服务化落地。看到贵司岗位涉及大模型应用/Agent/知识库方向，想进一步沟通一下岗位匹配度。

更多版本见 [templates/boss-message.md](templates/boss-message.md)。

## 项目介绍 3 分钟

我做的主项目是企业知识库 Agent Platform，目标是解决企业内部文档散落、客服和运营重复问答的问题。

整体架构是 Python + Java 混合：Python 负责 Agent/RAG 主链路，用户提问后先检索知识库，必要时重排，再把上下文、引用来源和工具列表交给模型生成答案；Java 负责企业业务工具服务，比如订单、工单、待办、权限、审计和幂等。如果问题涉及实时业务数据，Python Agent 会通过 MCP/OpenAPI 调 Java 工具接口。最终答案必须带来源引用，如果置信度不足就拒答。

工程上我重点处理了四类问题：第一是 RAG 幻觉，所以做了引用来源和低置信度拒答；第二是工具误调用，所以每个工具都有参数 schema、权限校验和审计日志；第三是问题定位，所以记录 question、retrievedChunks、toolCalls、modelResponse、latency 和 tokens；第四是效果优化，所以构造了评估样本，对 TopK、切分策略和 Prompt 进行对比。

这个项目体现的是我的迁移路线：Python 用来快速落地 Agent/RAG/评估，Java 用来承接企业业务系统和稳定工程化，不是只调模型，而是把模型能力变成一个可部署、可观测、可评估、能接业务系统的 Agent 平台。

## 高频问题

### 你没有 AI 工作经验，为什么能胜任？

我不会把自己包装成算法工程师。我匹配的是 AI 应用工程岗位，核心是把模型能力接入真实业务。这个岗位需要后端工程、系统集成、数据处理、接口安全、日志监控和部署能力，这些正好是我的 Java 背景。我补齐的是 RAG、Agent 工具调用、评估和模型调用链路。

### RAG 为什么会答错？

常见原因有四类：文档解析错、切分不合理、检索没召回、生成阶段幻觉。定位时不能只看最终答案，要看原始问题、改写后问题、召回 chunk、rerank 结果、Prompt、模型输出和引用来源。

### Agent 和工作流有什么区别？

普通工作流路径固定，适合确定性任务。Agent 会根据目标和上下文选择工具、规划步骤、处理异常，更适合开放问题。但生产系统不能完全放任 Agent，需要工具白名单、权限、人工确认、日志和回放。

### Java 做 AI Agent 有优势吗？

有。Python 更适合 Agent/RAG/评估和快速实验，Java 更适合企业业务系统、权限、审计、事务、数据集成和部署。我的路线不是二选一，而是 Python 做 AI 主链路，Java 做业务工具层。

### 如何控制成本？

从四层控制：模型路由、Prompt 长度、RAG 上下文数量、缓存和降级。简单问题用便宜模型，高风险或复杂问题再用强模型；检索上下文要压缩；常见问答可以缓存；超时或失败时要有降级回答。

## 简历关键词

- Java 后端
- Python
- FastAPI
- LangGraph
- LlamaIndex
- Spring Boot
- RAG
- Vector Database
- Tool Calling
- Agent Workflow
- Memory
- Context Engineering
- MCP
- Evaluation
- Trace / Observability
- Docker
