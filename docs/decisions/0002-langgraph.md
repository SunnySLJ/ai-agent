# ADR 0002：自研状态机 vs 官方 LangGraph

> 日期：2026-07-08  
> 状态：**接受**（MVP 保留自研，官方包为 P1 迁移）  
> 代码：`portfolio/agent-platform/src/agent_platform/graph_orchestrator.py`

## 背景

岗位 JD 与技能矩阵（A07）要求 LangGraph 状态机编排。本项目已实现 **LangGraph 风格**自研状态机，需决定是否立即替换为官方 `langgraph` 包。

## 决策

**短期保留自研 `graph_orchestrator.py`，文档与面试明确对比；P1 增加官方 LangGraph 适配层或并行 demo。**

## 对比

| 维度 | 自研 `AskGraph` | 官方 LangGraph |
|---|---|---|
| 依赖 | 零额外包 | `langgraph` + `langchain-core` |
| 节点 | safety → retrieve → tools → compose | 同构，可 1:1 映射 |
| 条件边 | Python 函数 | `add_conditional_edges` |
| 状态持久化 | 无 checkpoint | `SqliteSaver` / Redis checkpoint |
| HITL | 独立 `approval.py` | `interrupt_before` 原生支持 |
| 测试 | 纯函数单测 | 需 mock graph runtime |
| 学习成本 | 低（~120 行） | 中（生态 + API 版本） |

## 自研实现要点

```text
build_ask_graph(retrieve, invoke_tools, compose)
  → AskGraph.invoke(state)
  → 顺序：retrieve → tools → compose（safety 在 AgentPlatform 前置）
```

适合第一个月：**先把 RAG + 工具 + eval 跑通**，编排层保持可读。

## 迁移路径（P1）

1. 用 LangGraph `StateGraph` 重建相同四节点。
2. 保留 `graph_orchestrator` 作为 fallback / 单测参照。
3. 环境变量 `USE_OFFICIAL_LANGGRAPH=1` 切换实现。
4. eval 数据集回归，确保 pass_rate 不下降。

## 面试怎么说

> 「我用自研状态机完成了 safety → retrieve → tools → compose 全链路，并清楚它与 LangGraph 的节点/边/ checkpoint 对应关系；下一步会把 HITL 迁到 LangGraph interrupt。」

## 后果

- ✅ 不阻塞当前四个项目交付
- ✅ 单元测试简单、离线可复现
- ⚠️ 简历需写「LangGraph 风格」而非「官方 LangGraph 生产经验」，直到 P1 完成
