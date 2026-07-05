# 第 1 周复盘：企业知识库 RAG

> 周期：2026-07-01 ～ 2026-07-07 · D1–D7

## 完成项

| 天 | 产出 | 状态 |
|---|---|---|
| D1 | `eval-dataset.md` | ✅ |
| D2 | eval 30 条 + retrieval 8 条 | ✅ |
| D3 | `docs/rerank-strategy.md` | ✅ |
| D4 | `docs/decisions/0002-langgraph.md` | ✅ |
| D5 | `notes-fastapi.md` 补全 API | ✅ |
| D6 | README compose 健康检查说明 | ✅ |
| D7 | 本复盘 | ✅ |

## 指标

- Agent eval：30/30 pass
- Retrieval eval：8/8 hit，MRR 0.938
- unittest：agent-platform 全绿（随 D8+ 继续增长）

## 自测清单

- [x] `docker compose config` 通过
- [x] `/health` 返回 ok
- [x] `/ask` 带 citation
- [x] eval 数据集文档与 JSONL 一致

## 下周重点

查证型知识库深化：LLM claim、`pending_review`、Web 对照表、verification eval。
