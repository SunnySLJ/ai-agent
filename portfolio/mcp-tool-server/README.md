# MCP / OpenAPI Tool Contract

辅助作品集项目。

目标：为 Agent Platform 的 **RAG HTTP 接口** 提供 OpenAPI 与 MCP manifest。

## 交付物

- `openapi.json`：Agent Platform 的 RAG API 合约（`/health`、`/documents`、`/ask`）。
- `mcp-tools.json`：MCP manifest（当前 RAG-only 模式，工具列表为空，预留扩展）。
- `mcp_server.py`：可运行的 MCP JSON-RPC stdio server。
- `tests/`：合同与运行时测试。

## 验证

```bash
cd portfolio/mcp-tool-server
python3 -m unittest discover -s tests -v
python3 -m json.tool openapi.json >/tmp/ai-agent-openapi.json
python3 -m json.tool mcp-tools.json >/tmp/ai-agent-mcp-tools.json
```

## MCP stdio Server

Agent Platform API 启动后，可通过 stdio 运行 MCP server：

```bash
export AGENT_PLATFORM_BASE_URL=http://127.0.0.1:8000
cd portfolio/mcp-tool-server
python3 mcp_server.py
```

当前 RAG-only 模式下 `tools/list` 返回空列表；后续可在此 manifest 中扩展真实工具。

## 面试价值

证明你能把 Agent 系统的 HTTP 边界整理成可联调、可评估、可扩展的契约，而不是只有聊天接口。
