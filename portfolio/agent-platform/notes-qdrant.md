# Qdrant 向量库接入说明（Day 10）

> 课程：`../../../../agent/part05-agent-rag/Part 4. 大模型RAG嵌入向量数据库实战`  
> 实现：`../src/agent_platform/vector_store.py`、`embeddings.py`

## 为什么选 Qdrant（本项目）

| 对比 | Qdrant | pgvector | 选型 |
|---|---|---|---|
| Python SDK | 成熟 | 需 SQL 生态 | ✅ Agent 主链路用 Qdrant |
| 本地演示 | Docker 单容器 | 需 PostgreSQL | ✅ Compose 已编排 |
| 混合检索 | 向量 + 应用层 BM25 | 可 SQL 全文 | ✅ `HybridRetriever` |
| Java 业务库 | 独立服务 | 可共用 PG | Java 仍走 Spring Boot，向量库不耦合 |

面试补充：客户已有 PostgreSQL 时可对比 Spring AI + pgvector；**作品集演示优先 Qdrant**。

## 环境变量

| 变量 | 作用 |
|---|---|
| `QDRANT_BASE_URL` | 默认 `http://127.0.0.1:6333` |
| `QDRANT_COLLECTION` | collection 名称 |
| `OPENAI_EMBEDDING_MODEL` | 设置后切换真实 Embedding |
| `OPENAI_EMBEDDING_DIMENSIONS` | 与 collection 维度对齐 |

未配置 Embedding 时使用 `HashingEmbeddingModel`（离线确定性测试）。

## 数据流

```text
POST /documents
  → KnowledgeBase.ingest() + recursive chunk
  → QdrantVectorIndex.upsert(chunks)
  → 每条 chunk: uuid(chunk_id) + vector + payload

POST /ask
  → HybridRetriever: BM25 + Qdrant 向量
  → 融合 rerank（轻量，非 cross-encoder）
  → citation 返回 doc_id / chunk_id
```

## 本地启动

```bash
docker compose up -d qdrant agent-platform
curl http://127.0.0.1:6333/healthz
```

## 健康检查与排错

| 现象 | 处理 |
|---|---|
| collection 不存在 | 首次 upsert 自动创建 |
| 维度不匹配 | 检查 `OPENAI_EMBEDDING_DIMENSIONS` |
| 检索为空 | 先 `POST /documents` 入库再 `/ask` |

## 与 Java 边界

- Qdrant：**知识库向量**（Python Agent 管）
- Java 服务：**业务数据**（订单/工单/待办），不做向量检索

## P1

- 真实 cross-encoder Rerank（Day 11 检索链路增强）
- collection 按 tenant 隔离
