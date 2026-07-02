# MCP / OpenAPI Tool Contract

辅助作品集项目。

目标：把 Java 后端业务能力整理成 Agent 可调用的工具契约，并提供可运行的 MCP stdio Server。

## 交付物

- `openapi.json`：Java Business Tool Service 的 OpenAPI 合约。
- `mcp-tools.json`：MCP-ready 工具定义，包含 `name`、`description`、`inputSchema` 和本项目的 HTTP 映射。
- `mcp_server.py`：可运行的 MCP JSON-RPC stdio server，支持 `initialize`、`tools/list`、`tools/call`。
- `docs/api-handoff.md`：接口联调说明、代码路径、流程图、字段表、错误码和验证命令。
- `tests/test_contract_artifacts.py`：合同测试，校验 OpenAPI 与 MCP-ready manifest 对齐。
- `tests/test_mcp_server_runtime.py`：运行时测试，校验 MCP server 能代理 Java HTTP 工具。

## 工具

- `get_order_status`：查询订单状态，对应 `GET /orders/{orderId}`。
- `get_ticket_status`：查询工单状态，对应 `GET /tickets/{ticketId}`。
- `create_todo`：幂等创建待办，对应 `POST /todos`。

## 验证

```bash
cd portfolio/mcp-tool-server
python3 -m unittest discover -s tests -v
python3 -m json.tool openapi.json >/tmp/ai-agent-openapi.json
python3 -m json.tool mcp-tools.json >/tmp/ai-agent-mcp-tools.json
```

## MCP stdio Server

Java 业务工具服务启动后，可通过 stdio 运行 MCP server：

```bash
export JAVA_TOOL_BASE_URL=http://127.0.0.1:8080
cd portfolio/mcp-tool-server
python3 mcp_server.py
```

示例请求（stdin 一行 JSON）：

```json
{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_order_status","arguments":{"orderId":"ORD-1001"}}}
```

## 面试讲法

Agent 不能直接随意操作企业系统。生产环境需要工具白名单、参数 schema、权限、审计、幂等、错误码、失败回放和人工确认。这个项目展示的是如何先把 Java 业务服务沉淀成稳定工具契约，再让 Python Agent 或未来 MCP server wrapper 安全调用。
