# W1 学习笔记：RAG 基础架构 + Agent 评估

> 来源：part05-agent-rag（Part1、Part5）+ part13-agent-score  
> 对照代码：`portfolio/agent-platform/src/agent_platform/`  
> 日期：2026-07-05（第 1 周 · RAG 面试闭环）

---

## 一、为什么需要 RAG？（面试高频）

### 大模型的四大知识局限

| 问题 | 表现 | RAG 如何解决 |
|------|------|-------------|
| **幻觉（Hallucination）** | 一本正经地编造不存在的事实 | 把有据可查的文档送进 Prompt，模型"引用"而非"创作" |
| **知识截止（Knowledge Cutoff）** | 不知道截止日期之后的事 | 更新知识库即可，不用重新训练 |
| **领域盲区（Domain Blindness）** | 不知道公司内部文档、私有数据 | 把私有文档入库，检索后送给模型 |
| **上下文窗口限制** | 无法把几百页文档全塞进 Prompt | 每次只检索最相关的几段，精准利用窗口 |

> **面试口述**：RAG 把"知识存储"和"知识推理"解耦——模型只负责推理，知识库只负责存储，两者通过检索连接。这就像开卷考试：不是让模型背下所有知识，而是让它在回答前先查阅相关资料。

### 三种知识注入方案对比（必背）

| 方案 | 更新速度 | 成本 | 幻觉控制 | 适用场景 |
|------|---------|------|---------|---------|
| Prompt Engineering | 即时 | 低 | 一般 | 简单任务、少量上下文 |
| Fine-tuning | 慢（需重训） | 高 | 较好（领域内） | 风格定制、专业术语 |
| **RAG** | **快（更新文档即可）** | 中 | **好（有据可查）** | **知识密集型问答** |

> **经验法则**：先用 RAG 验证可行性，只有当 RAG 无法满足质量要求时，再考虑 Fine-tuning。

---

## 二、RAG 核心架构：六大组件 + 两条数据流

### 两条数据流

```
【离线索引流 - 准备知识】
原始文档 → Document Loader → Text Splitter → Embedding → Vector Store

【在线查询流 - 使用知识】  
用户问题 → Embedding（同一模型）→ Vector Store 检索 Top-K → Prompt 拼接 → LLM 生成
```

> ⚠️ **关键**：索引和查询必须用**同一个 Embedding 模型**，否则向量空间不匹配，检索结果完全错乱。这是最常见的隐性 Bug。

### 六大核心组件

| 组件 | 职责 | 我的代码 |
|------|------|---------|
| **Document Loader** | 统一读取 PDF/Word/HTML 等格式 → Document 对象 | `document_parser.py` |
| **Text Splitter** | 长文档切片（500-1000 token，10-20% overlap） | `chunking.py` |
| **Embedding Model** | 文本 → 高维向量（语义相似度） | `embeddings.py` → `OpenAICompatibleEmbeddingModel` |
| **Vector Store** | 存储向量，毫秒级 ANN 检索 | `vector_store.py` → `QdrantVectorIndex` |
| **Retriever** | 混合检索策略（向量 + BM25） | `retrieval.py` → `KeywordRetriever` + 向量 |
| **LLM** | 基于检索结果生成回答 | `llm.py` → `OpenAICompatibleChatClient` |

### 关键认知锚点（面试必说）

1. **两类模型**：Embedding 模型（向量化）≠ LLM（生成回答），职责完全不同
2. **LLM 只在最后一步登场**：知识库构建全程不涉及 LLM
3. **RAG 本质 = 构建高质量 Prompt**：所有检索、切分操作，最终目的都是为了拼出一个包含相关知识的 Prompt

---

## 三、四代 RAG 演进（架构选型必讲）

| 代际 | 核心特征 | 适用场景 |
|------|---------|---------|
| **Naive RAG** | 固定切分 + 单路向量检索 + 直接拼接 | 原型验证、简单问答 |
| **Advanced RAG** | 混合检索 + 查询改写 + Reranker 重排 | **生产环境、企业应用（主流选择）** |
| **Modular RAG** | 可插拔模块 + 自适应检索 | 深度定制、复杂场景 |
| **Agentic RAG** | Agent 动态决策检索路径 + 自我评估 | 多跳推理、跨源整合 |

> **我的项目定位**：ProjectForge 的 RAG 模块属于 **Advanced RAG**（混合检索 + Citation），Forge Supervisor 整体架构接近 **Agentic RAG**（多 Agent 编排）。

---

## 四、检索策略深度：向量 vs BM25 vs 混合（面试高频）

### 向量检索（Dense Retrieval）
- **优点**：理解语义，"如何申请年假" 能匹配 "请假流程"
- **缺点**：精确匹配差，"SKU-20240315" 这种精确编号可能查不到
- **算法**：余弦相似度 + HNSW/IVF（近似最近邻）

### BM25 稀疏检索
- **优点**：精确关键词匹配，处理专业术语、数字、产品编号
- **缺点**：不理解语义，近义词无法匹配
- **本质**：基于词频和文档长度的概率检索，"升级版关键词搜索"

### 混合检索（Hybrid Search）= 两者结合
```
向量召回（语义）+ BM25 召回（关键词）→ RRF 融合排序 → Top-K 结果
```
> **RRF（Reciprocal Rank Fusion）**：根据各路检索的排名计算综合得分，排名越靠前得分越高。

> **我的代码对照**：`retrieval.py` 中 `KeywordRetriever` 做 BM25 类关键词检索；`QdrantVectorIndex.search()` 做向量检索；`agent.py` 中两路融合后送给 LLM。

### 工业级检索流程（4步）
1. **Query 向量化** → 问题转为向量
2. **初步召回（粗排）** → 撒网捕鱼，高召回率，允许噪音
3. **精排（Reranker）** → Cross-encoder 重排，提升精度
4. **结果过滤合并** → 去重、过滤低质，送给 LLM

---

## 五、Agent 评估七维度（part13 核心）

### 通用七类评估角度

| # | 评估维度 | 评估的是什么 | 适用 Agent |
|---|---------|------------|-----------|
| 1 | **任务结果** | 最终答案对不对、完不完整 | 全部 Agent |
| 2 | **工具与动作** | 调了正确的工具？参数对不对？有无越界？ | 工具调用、任务执行类 |
| 3 | **过程轨迹** | 中间步骤是否合理？有没有绕路/死循环？ | 多步执行类 |
| 4 | **依据与状态一致性** | 回答有没有幻觉？有没有和上下文矛盾？ | 知识密集型 |
| 5 | **安全合规** | 有没有泄露数据？有没有做不该做的操作？ | 全部 Agent |
| 6 | **效率** | 步骤数、延迟、Token 消耗是否合理？ | 全部 Agent |
| 7 | **用户体验** | 回答是否清晰、有用、语气合适？ | 对话类 |

### 我的 Eval Dashboard 对照

```
agent-eval-dashboard/
├── eval_dataset.jsonl      ← 测试集（30 条 RAG 问答）
├── reports/latest.json     ← pass_rate、refusal_rate、MRR 指标
└── reports/latest.md       ← 可读报告
```

| Eval 指标 | 对应课程维度 |
|----------|------------|
| `pass_rate` | 任务结果评估（回答是否正确） |
| `refusal_rate` | 依据一致性评估（拒答率，无证据不答） |
| `tool_call_success` | 工具与动作评估 |
| `MRR` | 检索质量（Mean Reciprocal Rank） |

---

## 六、核心代码片段 vs 课程概念对照

### Embedding：课程 → 代码
```python
# 课程讲：索引和查询必须用同一个 Embedding 模型
# 代码实现：vector_store.py
class QdrantVectorIndex:
    def upsert(self, chunks):
        # 离线索引：embed(chunk) 存入 Qdrant
        vector = self._embedding_model.embed(f"{chunk.title}\n{chunk.content}")
    
    def search(self, query):
        # 在线查询：embed(query) 去检索，同一个 embedding_model
        vector = self._embedding_model.embed(query)
```

### 混合检索：课程 → 代码
```python
# 课程讲：向量检索（语义）+ BM25（关键词）→ 混合
# 代码实现：retrieval.py 中 KeywordRetriever 做词频分析
class KeywordRetriever:
    def _score_chunk(self, chunk, query_terms):
        matched = query_terms.intersection(chunk_terms)
        score = len(matched) / len(query_terms)  # 精确匹配率 ≈ BM25 简化版
```

### 拒答（无证据不回答）：课程讲的 RAG 质量控制 → 代码
```python
# agent.py 中：检索结果为空或相关性分低于阈值 → 拒答
# 这是 Citation + 拒答 的核心逻辑
```

---

## 七、面试高频问题 & 标准答案

**Q: RAG 和 Fine-tuning 怎么选？**  
A: RAG 适合知识频繁更新、需要溯源的场景；Fine-tuning 适合固定风格、特定术语定制。经验法则：先 RAG 验证可行性，效果不达标再考虑 Fine-tuning。

**Q: 向量检索的缺点是什么？怎么弥补？**  
A: 向量检索擅长语义匹配，但精确字符串（产品编号、代码片段）可能漏召。用混合检索：向量 + BM25，RRF 融合排序，两条腿走路。

**Q: Chunk 大小怎么选？**  
A: 没有万能公式，看文档类型。技术文档适合大 chunk（800-1000 token），FAQ 适合小 chunk（200-500 token），一般从 500 token 开始实验。

**Q: 拒答机制是什么？**  
A: 检索结果相关性分低于阈值时，模型回答"知识库中没有相关信息"而非幻觉。Prompt 中明确指令："如果参考资料中没有相关信息，请说明无法回答"。

**Q: 怎么评估 RAG 系统的效果？**  
A: 评估分三层：①检索质量（MRR、召回率）②回答质量（pass_rate、幻觉率）③业务指标（用户满意度）。工具：自建 eval_dataset.jsonl + eval_dashboard，或接 LangSmith。

**Q: 你们项目的 RAG 架构是哪一代？**  
A: Advanced RAG：混合检索（向量 + 关键词）、Citation 溯源、低置信拒答、SSE 流式输出。Forge Supervisor 整体是 Agentic RAG 思路，Agent 根据任务类型动态决策是走 RAG 还是 DeepResearch 还是 Claim-Evidence 查证。

---

## 八、知识点打勾（对照 §8.1）

- [x] **RAG 基础**：四大局限、六大组件、两条流 → 能讲清
- [x] **混合检索**：向量 + BM25 + RRF → 代码已实现
- [x] **Citation 与拒答**：有据可查才回答 → `agent.py` 已实现
- [x] **Agent 评估七维度** → 已理解，能对应到 eval_dashboard 指标
- [x] **Embedding 一致性原则** → 代码中 upsert 和 search 用同一模型
- [ ] **Reranker（Cross-encoder）** → 待补：课程提到但代码未实现
- [ ] **查询改写（Query Rewriting）** → 待补：Advanced RAG 优化点

---

*下一步：对照 part22 案例11 深化 Claim-Evidence 查证 → `verified_knowledge.py`*
