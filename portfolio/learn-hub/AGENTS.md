# AI Learn Hub · Agent 约定

本文件供 Cursor / Codex Agent 在学习会话结束后写入笔记与更新进度。

## 学完一个章节后

1. 对照 `../../../agent/partXX` 课程与 `portfolio/agent-platform/` 代码写 Markdown 笔记
2. 调用本地 API 写入笔记（默认端口 3001）
3. 同步更新对应知识点进度

## POST 笔记

```bash
curl -X POST http://localhost:3001/api/notes \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "W2 学习笔记：查证型知识库",
    "content": "# 标题\n\n正文 Markdown...",
    "week": "W2",
    "tags": ["RAG", "VerifiedKnowledge", "part22"],
    "source": "agent/part22-agent-workspace/案例11",
    "generateCards": true,
    "generateInterview": true
  }'
```

也可用 JSON 文件：

```bash
curl -X POST http://localhost:3001/api/notes \
  -H 'Content-Type: application/json' \
  -d @note.json
```

响应示例：

```json
{
  "id": "uuid",
  "title": "...",
  "chunks": 12,
  "cardsCreated": 5,
  "interviewCreated": 4
}
```

无 `OPENAI_API_KEY` 时，`generateCards` / `generateInterview` 仍可用（规则生成）。

## 更新学习进度

对照 `shuang-plan.md` §8.1 知识点 id（`p01`–`p18`）：

```bash
curl -X PATCH http://localhost:3001/api/progress \
  -H 'Content-Type: application/json' \
  -d '{"id": "p09", "status": "done"}'
```

`status` 取值：`todo` | `learning` | `done`

## 知识点 id 对照

| id | 知识点 |
|----|--------|
| p01 | FastAPI 服务化 |
| p02 | RAG 切分与入库 |
| p03 | 混合检索 |
| p04 | Qdrant 向量库 |
| p05 | Citation 与拒答 |
| p06 | Prompt 安全 |
| p07 | OpenAI 兼容 API |
| p08 | Agent 评估 |
| p09 | Claim-Evidence 查证 |
| p10 | DeepResearch |
| p11 | 多 Agent 编排 |
| p12 | LangGraph 官方 |
| p13 | Docker 部署 |
| p14 | 上下文 / Memory |
| p15 | Harness 工程化 |
| p16 | MCP / 工具契约 |
| p17 | 测试闭环 |
| p18 | 公网 HTTPS 部署 |

## 启动前提

在项目根目录 `work/ai-agent/`：

```bash
./start-learn.sh
```

确保 `http://localhost:3001` 可访问后再 POST。数据持久化在 `data/learn.db`。
