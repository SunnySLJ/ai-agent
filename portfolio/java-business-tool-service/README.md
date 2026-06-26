# Java Business Tool Service

辅助作品集项目。

目标：用 Spring Boot 模拟企业业务工具服务，给 Python Agent Platform 调用。它不是 RAG 主链路，而是承接 Java 后端优势：业务接口、权限、审计、幂等、事务和稳定部署。

## 第一阶段交付

- `GET /tools`：工具清单和参数 schema。
- `GET /orders/{orderId}`：订单查询，示例 `ORD-1001`。
- `GET /tickets/{ticketId}`：工单查询，示例 `TCK-1001`。
- `POST /todos`：带 idempotency key 的待办创建。
- `GET /audit-events`：工具调用审计日志。
- 结构化错误码：例如 `ORDER_NOT_FOUND`。

## 运行测试

```bash
cd portfolio/java-business-tool-service
mvn test
```

## 本地启动

```bash
cd portfolio/java-business-tool-service
mvn spring-boot:run
```

## 调用示例

```bash
curl http://127.0.0.1:8080/tools
curl http://127.0.0.1:8080/orders/ORD-1001
curl http://127.0.0.1:8080/tickets/TCK-1001

curl -X POST http://127.0.0.1:8080/todos \
  -H 'Content-Type: application/json' \
  -d '{"title":"Follow up customer","idempotencyKey":"idem-1"}'

curl http://127.0.0.1:8080/audit-events
```

## 面试讲法

这个项目体现的是 Java 后端工程能力如何迁移到 AI Agent 系统：Python Agent 不直接操作数据库或企业系统，而是通过受控工具 API 调用 Java 业务服务。Java 层负责权限、参数校验、审计、幂等和稳定性。
