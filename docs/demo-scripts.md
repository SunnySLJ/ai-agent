# 四项目 5 分钟演示脚本

## 1. 企业知识库 RAG（~5 min）

1. 打开 Web → Agent 控制台 Tab
2. 入库一段 Markdown（或依赖种子文档）
3. 提问：「查证型知识库如何降低幻觉？」
4. 指出 citation 与拒答行为
5. 展示 eval 报告：`portfolio/agent-eval-dashboard/reports/latest.md`

**话术**：混合检索 + 规则 Rerank，eval 30 条全 pass。

## 2. 查证型知识库（~5 min）

1. `POST /verified-knowledge/verify` 或在 Forge 工作台查看架构阶段
2. 输入含真/假主张的段落
3. 展示 claim-evidence 表：`verified` vs `pending_review` vs `contradicted`
4. 说明门控：低于阈值 `should_refuse`

**话术**：比 citation 多一层 Claim-Evidence 对齐，架构/PRD 必经查证门。

## 3. ProjectForge（~5 min）

1. Web 默认 Tab「ProjectForge 工作台」
2. 输入产品想法 →「运行九阶段演示」
3. 点击 ① 调研（DeepResearch 脚注）→ ③ 架构（查证面板）
4. 展示 `GET /project-forge/runs` 历史

**话术**：meta 演示——用本项目完善本项目，九阶段 artifact 落盘。

## 4. DeepResearch（~5 min）

```bash
curl -X POST http://127.0.0.1:8000/deep-research/run \
  -H 'Content-Type: application/json' \
  -d '{"query":"AI Agent 企业知识库竞品调研"}'
```

1. 展示 `sub_questions` 与脚注 Markdown
2. 说明 MVP 用内部 KB，P1 接外网搜索
3. 串联：调研报告 → 进 Forge PRD → 查证门

## 一键命令

```bash
cd work/ai-agent && docker compose up --build
```
