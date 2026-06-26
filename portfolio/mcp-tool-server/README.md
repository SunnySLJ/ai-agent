# MCP Tool Server

辅助作品集项目。

目标：把 Java 后端业务能力包装成 Python Agent 可调用工具。

## 模拟工具

- `search_knowledge_base`：查询知识库。
- `get_order_status`：查询订单状态。
- `create_support_ticket`：创建客服工单。

## 工程要求

- 参数 schema。
- 权限校验。
- 审计日志。
- 幂等键。
- 错误码。
- 超时控制。

## 面试讲法

Agent 不能直接操作企业系统。生产环境需要工具白名单、参数校验、权限、审计、失败回放和人工确认。这个项目用于展示我如何把 Java 后端能力安全地接入 Python Agent/RAG 平台。
