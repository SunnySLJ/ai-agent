# 文档切分策略（Day 9）

> 课程：`../../../../agent/part05-agent-rag/Part 3. 大模型RAG文档切分进阶实战`  
> 实现：`../src/agent_platform/chunking.py` → `KnowledgeBase`

## 三种策略对比

| 策略 | 做法 | 优点 | 缺点 | 本项目 |
|---|---|---|---|---|
| **固定长度** | 每 N 字符硬切 | 实现简单、长度可控 | 易断句、语义破碎 | `_fixed_windows` 兜底 |
| **递归切分** | 段落 → 句子 → 窗口 | 语义完整、长度可控 | 实现稍复杂 | **默认** `RECURSIVE` |
| **语义切分** | Embedding 相似度断点 | 主题一致性好 | 成本高、需额外模型 | P1 扩展 |

## 默认参数（面试可背）

| 参数 | 值 | 理由 |
|---|---|---|
| `max_chunk_chars` | 480 | 约 200–300 中文字，适配常见 context |
| `chunk_overlap` | 40 | 减少边界信息丢失 |
| 切分顺序 | `\n\n` → 句号 → 固定窗口 | 先保结构，再保长度 |

## 代码入口

```python
from agent_platform.chunking import ChunkingStrategy, split_document

chunks = split_document(
    markdown_text,
    strategy=ChunkingStrategy.RECURSIVE,
    max_chars=480,
    overlap=40,
)
```

`KnowledgeBase` 入库时自动切分；`chunk_id` 格式：`{doc_id}#chunk-{n}`。

## 选型结论（为什么用递归）

1. 企业知识库以 **段落/条款** 为主，先按段落切比固定长度更准。
2. 超长段落（PDF 抽文本）用句子再切，避免单 chunk 撑爆 context。
3. 第一个月不引入语义切分 API，**递归切分是性价比最高的默认**。
4. eval 与混合检索已在当前切分下 hit_rate=100%，升级语义切分留 P1 对比实验。

## 与解析链路关系

```text
解析（Day 8）→ 切分（Day 9）→ Embedding（Day 10）→ 检索（Day 11）
```

见 [document-parsing-strategy.md](document-parsing-strategy.md)、[notes-qdrant.md](../notes-qdrant.md)。

## P1 实验 backlog

- [ ] 同一文档对比 paragraph vs recursive 的 retrieval MRR
- [ ] Markdown 按 `#` 标题层级切分（保留 section metadata）
- [ ] 语义切分 POC（LlamaIndex `SemanticSplitter`）
