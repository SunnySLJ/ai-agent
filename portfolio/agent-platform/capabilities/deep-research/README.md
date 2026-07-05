# DeepResearch 能力模块

> 路径：`portfolio/agent-platform/src/agent_platform/deep_research.py`  
> 外网搜索：`src/agent_platform/web_search.py`  
> API：`POST /deep-research/run`

## 职责

- 子问题规划（query planner，3～5 条）
- **外网搜索**（Tavily / Serper，优先于内部 KB）
- 内部知识库检索（HybridRetriever，补充来源）
- 脚注 Markdown 报告生成

## 环境变量

| 变量 | 说明 |
|---|---|
| `TAVILY_API_KEY` | [Tavily](https://tavily.com) 搜索 API |
| `SERPER_API_KEY` | [Serper](https://serper.dev) Google 搜索 API |
| `WEB_SEARCH_PROVIDER` | 可选：`tavily` / `serper`（默认有 key 则 Tavily 优先） |
| `OPENAI_API_KEY` | 可选，增强子问题规划 |

未配置外网 key 时自动回退内部 KB，并在报告中标注不确定性。

## API 示例

```bash
curl -X POST http://127.0.0.1:8000/deep-research/run \
  -H 'Content-Type: application/json' \
  -d '{"query":"AI Agent 企业知识库竞品","use_web_search":true}'
```

## Forge 第二轮

`POST /project-forge/demo` 支持 `prior_run_id`，自动注入上一轮 ADR/PRD 到架构与 PRD 阶段。

```json
{
  "idea": "第二轮迭代想法",
  "prior_run_id": "<上一轮 run_id>"
}
```

## 与 ProjectForge

阶段 ① `research` 默认启用外网搜索（有 key 时），引擎标识 `deep_research`。
