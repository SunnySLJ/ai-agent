# Agent Eval Dashboard

Python-only evaluation runner for the AI Agent portfolio.

目标：为 Python RAG/Agent 系统建立评估和失败回放能力。

## 定位

这不是前端大屏，而是面试可讲清楚的评估闭环：

- 从 `portfolio/agent-platform/data/eval_dataset.jsonl` 读取测试集。
- 调用 Python `AgentPlatform.offline_demo()` 执行问题。
- 按 `answer_with_citation`、`tool_call`、`refusal` 三类预期行为打分。
- 输出 JSON 和 Markdown 报告，方便复盘失败分类。

当前数据集包含 20 条离线确定性 eval case，覆盖引用回答、工具调用和拒答三类行为。

## 运行

```bash
PYTHONPATH=../agent-platform/src:src python3 -m agent_eval_dashboard.cli \
  --dataset ../agent-platform/data/eval_dataset.jsonl \
  --json-out reports/latest.json \
  --md-out reports/latest.md
```

## 测试

```bash
PYTHONPATH=../agent-platform/src:src python3 -m unittest discover -s tests -v
```

## 指标

- 通过率。
- 拒答率。
- 工具调用成功率。
- 平均响应时间。
- 估算 Token 成本。
- 失败分类计数。

## 当前覆盖

- `answer_with_citation`：9 条。
- `tool_call`：6 条。
- `refusal`：5 条。

## 失败分类

- `unexpected_refusal`
- `expected_citation_missing`
- `expected_tool_call_missing`
- `tool_call_failed`
- `expected_refusal_missing`
- `unknown_expected_behavior`

当前 MVP 使用确定性离线 Agent，不依赖模型 key。后续可以替换为真实模型、LangGraph trace、RAGAS/DeepEval、OpenTelemetry 或 LangSmith 类观测系统。
