# 架构选项对比

| 方案 | 优点 | 风险 | 结论 |
|---|---|---|---|
| A. 内嵌模块 | 复用现有 RAG/测试/部署 | 单体变复杂 | **推荐** |
| B. 独立微服务 | 边界清晰 | 运维成本高 | 二期 |
| C. 纯 Prompt 工作流 | 上线快 | 难保证代码质量 | 不选 |

## 推荐架构
- `verified_knowledge.py` 内嵌到 agent-platform
- `project_forge.py` 编排九阶段演示
- Next.js 工作台消费 REST API

## 想法
为 agent-platform 增加查证型知识库与工作台
