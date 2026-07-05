# FastAPI 学习笔记（对照 part10 + 本项目）

> 课程：`../../agent/part10-agent/智能体项目开发必备基础FastAPI.ipynb`  
> 代码：`../src/agent_platform/api.py`

## 1. 为什么 Agent 项目用 FastAPI

- **异步友好**：LLM 调用、向量检索、Java HTTP 工具可并发。
- **Pydantic 校验**：请求体自动校验，减少 Agent API 入参错误。
- **OpenAPI 自动生成**：`/docs` 可直接给前端和 MCP 契约参考。
- **StreamingResponse**：SSE 流式输出无需额外框架。

## 2. 本项目 API 一览

| 方法 | 路径 | 作用 |
|---|---|---|
| GET | `/health` | 健康检查 |
| POST | `/documents` | 文档入库（Markdown/PDF base64） |
| POST | `/ask` | 同步问答 |
| POST | `/ask/stream` | SSE 流式（meta/token/done） |
| GET | `/sessions/{id}` | 多轮会话历史 |
| POST | `/approvals/{id}/confirm` | HITL 人工确认 |
| GET | `/summary` | 运行摘要 |
| GET | `/tools` | 工具列表 |
| POST | `/wechat-articles/generate` | PDF 书籍 → 公众号文章 |
| GET | `/project-forge/stages` | 九阶段元数据 + Supervisor 路由 |
| POST | `/project-forge/demo` | 运行九阶段演示（`prior_run_id` 可选） |
| GET | `/project-forge/runs` | 历史 run 列表 |
| GET | `/project-forge/runs/{id}` | 单次 run 详情 |
| POST | `/verified-knowledge/verify` | Claim-Evidence 查证（可选 `use_llm`） |
| POST | `/deep-research/run` | DeepResearch 脚注报告（`use_web_search`） |

## 3. 课程 → 代码对照

### 应用入口

```python
app = FastAPI(title="Agent Platform", version="0.1.0")
```

工厂模式 `create_app(platform=None)` 让单元测试注入 mock `AgentPlatform`，不依赖真实 LLM/Qdrant。

### 请求模型

```python
class QuestionPayload(BaseModel):
    question: str = Field(min_length=1)
    session_id: str | None = None
```

对应课程中的 Pydantic `BaseModel`：字段校验失败自动返回 422。

### CORS

Web 控制台（`:3000`）调 API（`:8000`）必须配 CORS，否则浏览器拦截。

环境变量：`CORS_ALLOW_ORIGINS=http://127.0.0.1:3000,http://localhost:3000`

### 流式接口

`StreamingResponse` + generator 产出 SSE 事件，前端用 `EventSource` 或 fetch stream 消费。

## 4. 本地运行

```bash
cd portfolio/agent-platform
PYTHONPATH=src .venv/bin/uvicorn agent_platform.api:create_app --factory --host 0.0.0.0 --port 8000
```

或 `docker compose up` 一键启动。

## 5. 面试可讲

- FastAPI 做 **AI 网关**：鉴权、限流、trace_id 注入（P1 扩展点）。
- Pydantic 保证 **工具参数** 与 **文档入库** 结构稳定。
- `/ask` 与 `/ask/stream` 共用同一 `AgentPlatform.ask()`，避免双份业务逻辑。
- ProjectForge / 查证 / DeepResearch 三条能力 API 共用 `create_app()` 工厂与种子文档注入。

## 7. 关联文档

- [verified-knowledge-flow.md](docs/verified-knowledge-flow.md)
- [rerank-strategy.md](docs/rerank-strategy.md)
- [capabilities/deep-research/README.md](capabilities/deep-research/README.md)
