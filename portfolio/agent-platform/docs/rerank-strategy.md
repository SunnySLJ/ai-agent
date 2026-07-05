# Rerank 策略说明

> 更新：2026-07-08 · 项目优先 D3  
> 代码：`src/agent_platform/retrieval.py` → `HybridRetriever`

## 一、当前 MVP（已实现）

离线混合检索 + **轻量规则 Rerank**，不依赖外部 cross-encoder 模型。

```text
Query
  → BM25Retriever（词法 Top-K）
  → LocalVectorRetriever（哈希向量 Top-K）
  → 候选合并去重
  → 证据门控（query term 必须命中 chunk）
  → 融合打分排序
  → Top-N 送入 Agent compose
```

### 融合公式（`HybridRetriever._rerank`）

| 分量 | 权重 | 含义 |
|---|---:|---|
| lexical_score | 0.55 | BM25 归一化分 |
| dense_score | 0.25 | 向量相似度归一化分 |
| coverage | 0.15 | query 词在证据中的覆盖率 |
| title_overlap | 0.05 | query 词在标题中的覆盖率 |

**证据门控**：`coverage <= 0` 的候选直接丢弃，避免 dense 假阳性。

### 评估基线

| 模式 | hit_rate | MRR |
|---|---:|---:|
| keyword | 100% | 0.938 |
| hybrid | 100% | 0.938 |

数据集：`data/retrieval_eval_dataset.jsonl`（8 条）

## 二、为什么先规则 Rerank

| 考量 | 规则 Rerank | Cross-encoder |
|---|---|---|
| 延迟 | 毫秒级 | 数十～数百 ms |
| 依赖 | 无模型 key | 需 GPU/API |
| 可解释 | 分项权重可调 | 黑盒 |
| 面试 | 能讲清工程取舍 | 需补部署成本 |

第一个月目标：**先证明混合检索 + 可评估**，再换模型 Rerank。

## 三、升级路线（P1）

### Phase 1：Cross-encoder 本地/API

```text
Hybrid Top-20 → cross-encoder(query, chunk) → Top-5 → LLM
```

候选方案：
- `bge-reranker-base`（中文友好）
- Cohere Rerank API
- Jina Rerank API

接口设计（预留）：

```python
class Reranker(Protocol):
    def rerank(self, query: str, chunks: list[RetrievedChunk], limit: int) -> list[RetrievedChunk]: ...
```

### Phase 2：检索 eval 扩展

- 增加「难负例」样本（同主题不同 doc）
- 对比 keyword / hybrid / hybrid+cross-encoder 三条曲线
- 周报输出 MRR@3、MRR@5

### Phase 3：与查证型知识库联动

查证阶段的 Claim 检索可复用同一 Rerank 链路，保证 evidence Top-K 与回答 Top-K 一致。

## 四、调参建议

| 参数 | 默认 | 调大效果 |
|---|---|---|
| lexical 权重 | 0.55 | 专有名词、英文术语更准 |
| dense 权重 | 0.25 | 同义表达召回更好 |
| coverage 门控 | >0 | 过严会漏召回，过松会引入噪声 |
| Top-K | 3 | Agent 上下文变长，token 成本上升 |

## 五、关联文档

- [rag-pipeline.md](rag-pipeline.md)
- [notes-qdrant.md](../notes-qdrant.md)
- [eval-dataset.md](../../agent-eval-dashboard/eval-dataset.md)
