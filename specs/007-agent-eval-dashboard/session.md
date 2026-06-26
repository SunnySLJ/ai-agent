# 会话交接 · 007-agent-eval-dashboard

## 上次做到哪

已完成 Python-only eval runner：读取 Agent Platform 的 JSONL 数据集，执行 deterministic Agent，按引用回答、工具调用、拒答三类行为打分，并输出 JSON + Markdown 报告。

## 下次会话要做的事

1. 若需要更强作品集展示，可把报告接入真实模型评估、LangGraph trace、RAGAS/DeepEval 或 OpenTelemetry。
2. 若进入求职材料阶段，把 `reports/latest.md` 摘成简历项目亮点和面试讲解稿。

## 禁止重新规划

007 已收口。本 feature 不引入 TypeScript/Web UI，不调用真实模型 API，不改 Java 服务。
