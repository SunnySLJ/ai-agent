# Agent Web

企业知识库 Agent Platform 的 Web 展示层。连接 Python FastAPI（`:8000`），不替代 Java 业务工具层。

## 功能

- 对话：支持 `/ask` 与 `/ask/stream` SSE 流式输出
- 多轮会话：自动携带 `session_id`
- Human-in-the-loop：写操作展示审批确认按钮
- 文档入库：调用 `POST /documents`
- 侧边栏：引用、工具 trace、eval summary、工具列表

## 本地开发

终端 1：启动 API

```bash
cd portfolio/agent-platform
.venv/bin/uvicorn agent_platform.api:app --reload --port 8000
```

终端 2：启动 Web

```bash
cd portfolio/agent-web
npm install
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000 npm run dev
```

浏览器打开 <http://127.0.0.1:3000>

## Docker Compose

在仓库根目录：

```bash
docker compose up --build
```

- Web: <http://127.0.0.1:3000>
- API: <http://127.0.0.1:8000>

## 环境变量

| 变量 | 默认值 | 说明 |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `http://127.0.0.1:8000` | 浏览器访问的 Agent API 地址 |

Compose 中 Web 容器使用 `http://127.0.0.1:8000`，因为浏览器运行在宿主机，通过映射端口访问 API。
