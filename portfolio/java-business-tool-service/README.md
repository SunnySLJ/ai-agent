# Java Business Tool Service

辅助作品集项目。

目标：用 Spring Boot 模拟企业业务工具服务，给 Python Agent Platform 调用。它不是 RAG 主链路，而是承接 Java 后端优势：业务接口、权限、审计、幂等、事务和稳定部署。

## 第一阶段交付

- 订单查询接口。
- 工单查询接口。
- 待办创建接口。
- 工具参数 schema。
- 审计日志字段。
- 错误码和幂等键说明。

## 面试讲法

这个项目体现的是 Java 后端工程能力如何迁移到 AI Agent 系统：Python Agent 不直接操作数据库或企业系统，而是通过受控工具 API 调用 Java 业务服务。Java 层负责权限、参数校验、审计、幂等和稳定性。
