# 第 1 周复盘（2026-06-27 → 2026-07-02）

> 对应 [docs/02-30-day-sprint.md](../../docs/02-30-day-sprint.md) Day 7

## 本周完成

| 维度 | 产出 |
|---|---|
| 工程 | Agent Platform 全链路（RAG、工具、安全、会话、HITL、SSE、Embedding、Web UI） |
| 测试 | agent-platform 61 tests OK；eval pass_rate=100% |
| 文档 | 序号化文档体系（00–16 + T01–T05）；架构定稿；完成度审查更新 |
| 求职 | BOSS 20 条岗位搜集；Top 3 定制打招呼话术 |
| 学习 | Day 1–6：岗位画像、LLM API、Prompt、Tool Calling、Agent 工作流、Python-first 选型 |
| 日志 | daily 06-26、06-27、07-01；industry 06-26 至 07-01 |

## 简历定位一句话（修正版）

> 5 年 Java 后端工程师，转向 **Python Agent/RAG 应用工程**；用 Python 做检索与编排，用 Java 做企业业务工具，目标是杭州 **大模型应用落地** 岗（18–25K 起步）。

## 投递计划（本周试投 3 个）

| 优先级 | 公司 | 岗位 | 状态 |
|---|---|---|---|
| 1 | 宇泛智能 | AI Agent 开发工程师 | 待打招呼 |
| 2 | 招银 | AI Agent 开发工程师 | 待打招呼 |
| 3 | 小影 | AI Agent 研发（Java） | 待打招呼 |

话术见 [boss-messages-ready.md](boss-messages-ready.md)

## 行业情报本周趋势（3–5 条）

1. **MCP Python SDK v2**：工具契约标准化加速，作品集 `mcp-tool-server` 可对标讲。
2. **LangChain 多 provider 发版**：工程侧关注适配器模式，不追每个包版本。
3. **OpenAI agents 工作场景论文**：面试谈资：Agent 提升运营效率，但要 trace + 审批。
4. **Agent 岗位 JD 高频词**：任务编排、Tool Use、RAG、企业知识库——与作品集一致。
5. **杭州薪资带宽**：Agent 应用岗 15–40K，3–5 年经验 P0 岗多在 18–30K。

## 第 2 周学习重点（RAG 主链路）

- Day 8–9：文档解析与切分（part05）
- Day 10–11：Embedding/Qdrant 深化（已有 MVP，补面试表达）
- Day 12：引用与拒答策略文档化
- Day 13：扩展 eval 样本到 30 条（可选 P1）

## 待补 P0

- 官方 LangGraph 包 demo（或面试讲清与自研状态机差异）
- 真实 Rerank 模型（P1，不阻塞投递）
- `gh auth refresh -h github.com -s workflow` 后推送本地改动

## 下周最小目标

- 至少 3 个 BOSS 打招呼 + 1 次回复跟进
- 完成 Day 8 文档解析策略表
- 连续 daily log 不断档
