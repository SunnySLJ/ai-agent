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
第二轮迭代

---

## 继承上一轮决策

# 上一轮 Forge 上下文

- 来源 run_id: `6effee98-e3e6-4d44-8fc4-8e2e22c640fa`
- 上一轮想法: 第一轮 Forge 演示

## 架构 ADR

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
第一轮 Forge 演示

## PRD

# PRD（Phase A）

## 后端
- `POST /verified-knowledge/verify`：输入 text + source_stage，返回 VerificationReport
- `POST /project-forge/demo`：输入 idea，返回九阶段 ProjectForgeRun

## 前端
- Tab「ProjectForge 工作台」
- 阶段卡片 + markdown 预览 + 查证结果表

## 验收标准
- [ ] 能抽取 claim 并返回 evidence 对齐
- [ ] 九阶段演示可一键跑通
- [ ] unittest 覆盖 verify 与 demo API

## 需求
第一轮 Forge 演示
