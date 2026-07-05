# 02 — RAG 检索 + 评估体系

> 来源：`part05-agent-rag/`（5 个 part）+ `part13-agent-score/` + `part22-agent-workspace/案例11/12`  
> 对应项目：`retrieval.py` `vector_store.py` `agent-eval-dashboard/` `verified_knowledge.py`

---

## 一、RAG 基础架构（Naive → Advanced）

### 1.1 标准 RAG 流水线

```text
用户问题
   ↓
Query 处理（可选：HyDE、多查询扩展）
   ↓
向量检索（FAISS / ChromaDB / Milvus）+ 可选关键词检索（BM25）
   ↓
Rerank（cross-encoder 或 ColBERT）
   ↓
上下文拼接（Context Window 管理）
   ↓
LLM 生成答案
   ↓
Eval（忠实度 + 相关性 + 上下文利用率）
```

### 1.2 三阶段进化路径

| 阶段 | 名称 | 关键技术 | 对应 part |
|---|---|---|---|
| Basic | 文本切分 + 向量检索 | RecursiveCharacterSplitter + FAISS | part05/Part1 |
| Advanced | 混合检索 + Rerank | BM25 + dense + cross-encoder | part05/Part3+4 |
| Agentic | 路由 + 反思 + 多轮 | LangGraph + Corrective RAG | part04/Part4 + part05/Part5 |

---

## 二、文档切分策略

### 2.1 切分方法选择

| 方法 | 适用场景 | LangChain 类 |
|---|---|---|
| `RecursiveCharacterTextSplitter` | 通用文本（首选） | `RecursiveCharacterTextSplitter` |
| `MarkdownHeaderTextSplitter` | Markdown 文档 | `MarkdownHeaderTextSplitter` |
| `SemanticChunker` | 语义边界（实验性） | `SemanticChunker`（langchain-experimental） |
| `PDFPlumberLoader` + 自定义 | PDF 带表格/图像 | `PDFPlumberLoader` |
| `LayoutPDFReader` | 复杂 PDF 布局 | `unstructured` |

### 2.2 关键参数

```python
# 推荐起点参数
chunk_size = 1000         # 字符数（中文约 500–800 tokens）
chunk_overlap = 200       # 重叠（防止语义断裂）
separators = ["\n\n", "\n", "。", "！", "？", " ", ""]  # 中文分隔符

# 黄金法则
# chunk_size × retrieval_top_k × avg_token_per_char < context_window × 0.6
```

---

## 三、向量存储

### 3.1 方案对比

| 方案 | 适用规模 | 部署方式 | 备注 |
|---|---|---|---|
| FAISS | < 100万向量 | 本地文件 | 快速原型，无需服务 |
| ChromaDB | < 1000万向量 | 本地/Docker | 最简单，有 metadata 过滤 |
| Milvus | 亿级 | Docker/K8s | 生产级，支持索引类型多 |
| pgvector | 与 Postgres 共存 | Docker | 简化运维，SQL 熟悉度高 |
| Qdrant | 中大规模 | Docker | 过滤能力强，REST API 友好 |

### 3.2 关键代码模式（FAISS）

```python
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

# 构建
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = FAISS.from_documents(docs, embeddings)
vectorstore.save_local("faiss_data/")

# 加载
vectorstore = FAISS.load_local("faiss_data/", embeddings, 
                                allow_dangerous_deserialization=True)

# 混合检索（dense + sparse）
from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever

bm25 = BM25Retriever.from_documents(docs, k=5)
dense = vectorstore.as_retriever(search_kwargs={"k": 5})
ensemble = EnsembleRetriever(retrievers=[bm25, dense], weights=[0.5, 0.5])
```

---

## 四、检索策略

### 4.1 查询优化

```python
# HyDE（假设文档嵌入）：先让 LLM 生成假设答案，再用假设答案检索
hyde_prompt = "基于问题生成一个假设性的详细答案：{question}"
hypothetical_doc = llm.invoke(hyde_prompt.format(question=query))
results = retriever.get_relevant_documents(hypothetical_doc)

# 多查询扩展：生成多角度查询，合并结果
from langchain.retrievers.multi_query import MultiQueryRetriever
multi_retriever = MultiQueryRetriever.from_llm(
    retriever=vectorstore.as_retriever(), llm=llm
)
```

### 4.2 Rerank

```python
# Cross-Encoder Rerank（精度高，速度慢）
from sentence_transformers import CrossEncoder
reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

def rerank(query: str, docs: list, top_k: int = 3):
    pairs = [(query, doc.page_content) for doc in docs]
    scores = reranker.predict(pairs)
    ranked = sorted(zip(scores, docs), reverse=True)
    return [doc for _, doc in ranked[:top_k]]
```

---

## 五、RAG 评估体系（RAGAS 框架）

### 5.1 核心指标

| 指标 | 含义 | 计算方式 | 目标值 |
|---|---|---|---|
| **Faithfulness（忠实度）** | 答案是否仅基于检索到的上下文 | 答案声明 ÷ 能在上下文中找到的声明 | > 0.8 |
| **Answer Relevancy（答案相关性）** | 答案是否回答了用户问题 | 生成问题与原始问题的余弦相似度均值 | > 0.8 |
| **Context Precision（上下文精度）** | 检索到的文档是否相关 | 相关文档排名加权 | > 0.75 |
| **Context Recall（上下文召回）** | 是否检索到了所有需要的信息 | ground truth 中的声明 ÷ 能在上下文中找到的 | > 0.7 |

### 5.2 RAGAS 使用模式

```python
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision, context_recall
from datasets import Dataset

# 构建评估数据集
eval_data = {
    "question": ["问题1", "问题2"],
    "answer": ["答案1", "答案2"],
    "contexts": [["上下文1"], ["上下文2"]],
    "ground_truth": ["标准答案1", "标准答案2"]   # context_recall 需要
}
dataset = Dataset.from_dict(eval_data)

result = evaluate(
    dataset,
    metrics=[faithfulness, answer_relevancy, context_precision, context_recall]
)
print(result)
```

### 5.3 LangSmith Eval（实际使用）

```python
# 使用 LangSmith 做持续评估
from langsmith import Client
from langchain.smith import RunEvalConfig

eval_config = RunEvalConfig(
    evaluators=["qa", "context_qa", "criteria"],
    eval_llm=ChatOpenAI(model="gpt-4o-mini"),
)
# 绑定到 CI/CD：每次 PR 触发自动评估
```

---

## 六、Agentic RAG 模式（高级）

### 6.1 Corrective RAG（CRAG）

```text
用户问题
   ↓
检索文档
   ↓
相关性评估（LLM 评分）
   ├── 相关 → 直接生成答案
   ├── 模糊 → Web Search 补充 + 合并生成
   └── 不相关 → Web Search 重新检索 → 生成
```

### 6.2 Self-RAG（自反思 RAG）

```text
检索决策（是否需要检索？）
   ↓
检索
   ↓
相关性打分（ISREL）
   ↓
生成
   ↓
支持性打分（ISSUP）：答案是否有证据支持
   ↓
效用打分（ISUSE）：答案是否有帮助
```

### 6.3 LangGraph 实现框架（对应 part04/Part4）

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, List

class RAGState(TypedDict):
    question: str
    documents: List[str]
    answer: str
    generation_count: int

# 节点定义
def retrieve(state: RAGState) -> RAGState: ...
def grade_documents(state: RAGState) -> RAGState: ...
def generate(state: RAGState) -> RAGState: ...
def decide_to_generate(state: RAGState) -> str: ...  # 条件边

# 构建图
workflow = StateGraph(RAGState)
workflow.add_node("retrieve", retrieve)
workflow.add_node("grade_documents", grade_documents)
workflow.add_node("generate", generate)
workflow.set_entry_point("retrieve")
workflow.add_edge("retrieve", "grade_documents")
workflow.add_conditional_edges("grade_documents", decide_to_generate,
    {"relevant": "generate", "not_relevant": "web_search"})
```

---

## 七、文档审核 Agent（案例11/12 核心模式）

### 7.1 核心架构

```text
上传文档
   ↓
Parser（LangChain UnstructuredLoader / pdfplumber）
   ↓
Chunking（MarkdownSplitter / RecursiveCharacter）
   ↓
Claim 提取（LLM：识别文档中的每个声明/事实断言）
   ↓
Evidence 检索（向量库 + Web Search）
   ↓
验证 LLM（对每个声明打分：支持 / 反对 / 无法判断）
   ↓
HITL（Human-in-the-Loop）：低置信度声明人工复审
   ↓
报告生成（Markdown / JSON）
```

### 7.2 关键代码模式

```python
# Claim 提取
claim_prompt = """
从以下文本中提取所有可核实的事实声明（claim）。
每个 claim 应该是一个独立的、可以被外部证据支持或反驳的陈述。
格式：JSON 列表，每项 {"claim": "...", "location": "段落X"}
文本：{text}
"""

# 验证
verify_prompt = """
声明：{claim}
检索到的证据：{evidence}
请判断证据是否支持该声明，回答：
- "supported"（支持，并说明原因）
- "contradicted"（反驳，并说明原因）  
- "uncertain"（证据不足）
"""
```

---

## 八、RAG 常见问题 & 调优清单

| 问题 | 原因 | 解决方案 |
|---|---|---|
| 检索结果不相关 | chunk 太大 / embedding 质量差 | 缩小 chunk_size；换更好的 embedding 模型 |
| 答案幻觉（内容不在文档中） | Faithfulness 低 | 加强 Faithfulness 评估；提示词加"仅基于提供的上下文" |
| 检索遗漏重要文档 | Context Recall 低 | 增加 top_k；用混合检索；改进切分策略 |
| 速度慢 | 每次都全量检索 | 加缓存（Redis）；用 MMR 替代纯相似度 |
| 多语言文档质量差 | 中英混排切分断裂 | 自定义中文分隔符；用 blingfire 分句 |

---

## 九、Eval Dashboard（part13 核心）

### 评估指标体系

```python
# Agent 评估框架（LangSmith + 自定义）
metrics = {
    # RAG 质量
    "faithfulness": ragas_faithfulness,
    "answer_relevancy": ragas_answer_relevancy,
    
    # 任务完成率
    "task_completion": lambda pred, ref: 1 if ref in pred else 0,
    
    # 工具使用正确率
    "tool_use_accuracy": tool_use_evaluator,
    
    # 延迟
    "latency_p50": ...,
    "latency_p99": ...,
    
    # 成本
    "token_cost": token_cost_calculator,
}
```

### CI/CD 集成模式

```yaml
# GitHub Actions 自动评估
on: [pull_request]
jobs:
  eval:
    steps:
      - uses: actions/checkout@v4
      - run: python eval/run_eval.py --dataset eval/testset.json
      - run: python eval/check_thresholds.py  # 若指标低于阈值则 CI 失败
```

---

## 十、源文件参考

```bash
# RAG 入门实战 notebook
../../agent/part05-agent-rag/Part\ 1.*/大模型RAG入门基础架构与实战.ipynb

# RAG 评估实战 notebook  
../../agent/part05-agent-rag/Part\ 5.*/大模型RAG检索生成和评估实战.ipynb

# Agent 评估 notebook
../../agent/part13-agent-score/Agent评估与优化.ipynb

# LangSmith 示例代码
../../agent/part13-agent-score/code/langsmith-calculator/

# Agentic RAG
../../agent/part04-agent-langchain/Part\ 4.*/LangChain1.0实现Agentic\ RAG.ipynb

# 文档审核 Agent（LangChain v1.0）
../../agent/part22-agent-workspace/【加餐】案例11：*/LangChain\ v1.0\ 文档审核类Agent开发实战.ipynb

# 文档审核 Agent（v2.0 HITL）
../../agent/part22-agent-workspace/【加餐】案例12：*/ai-document-review/
```
