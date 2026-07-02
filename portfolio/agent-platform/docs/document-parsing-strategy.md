# 文档解析策略表（Day 8）

> 课程：`../../../../agent/part05-agent-rag/Part 2. 大模型RAG进阶多格式文档解析实战`  
> 实现：`../src/agent_platform/document_parser.py`

## 格式选型

| 格式 | 解析方案 | 本项目状态 | 面试要点 |
|---|---|---|---|
| **Markdown** | 原文入库，`text/markdown` | ✅ 已支持 | 保留标题层级利于切分 |
| **纯文本** | `text/plain` 直接入库 | ✅ 已支持 | 最简单 baseline |
| **PDF** | base64 → `pypdf` 抽文本 | ✅ MVP | 扫描件需 OCR（P2） |
| **Word (.docx)** | `python-docx` 或转 PDF 再抽 | ⏳ P1 | 企业文档常见格式 |
| **HTML** | `BeautifulSoup` 去标签 | ⏳ P2 | 网页知识库导入 |
| **Excel/CSV** | 按行/表结构化 chunk | ⏳ P2 | 表格问答需结构化 metadata |

## PDF 链路（当前实现）

```
POST /documents
  content_type: application/pdf
  content: base64(pdf_bytes)
    → parse_pdf_base64()
    → PdfReader.extract_text()
    → 清洗空白/换行
    → Document 入库 → 切分 → Embedding
```

**限制：**

- 仅文本型 PDF；扫描件 `extract_text()` 为空 → 返回错误
- 复杂版式（多栏、表格）可能乱序 → P1 用 `unstructured` 或 OCR

## 切分策略（Day 9 预告）

| 策略 | 适用 | 优缺点 |
|---|---|---|
| 固定长度 | 通用 fallback | 简单，可能断句 |
| 递归按标题/段落 | Markdown/PDF 文本 | 语义更完整，**推荐默认** |
| 语义切分 | 长文档、高质量要求 | 成本高，需 embedding 辅助 |

## 元数据建议

每条 chunk 携带：

- `doc_id`、`title`、`page`（PDF）
- `source_type`：markdown / pdf / docx
- `ingested_at`

便于 citation 展示：`[doc_id#chunk-3, p.2]`

## 失败处理

| 场景 | 行为 |
|---|---|
| 不支持 content_type | 400 + 明确错误 |
| PDF 无文本 | 400「需 OCR」提示 |
| pypdf 未安装 | 500 + 安装指引 |

## 与作品集对齐

- 演示：先 POST Markdown，再 POST 小型文本 PDF，问「文档里说了什么」
- eval：增加 2 条 PDF 来源 citation case（P1）
