# Deep Research 报告：第二轮迭代

参考上一轮决策：
# 上一轮 Forge 上下文

- 来源 run_id: `39f2e74b-8acf-4a2e-a454-7d7ae9bfebd9`
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

## 子问题

1. 第二轮迭代

参考上一轮决策：
# 上一轮 Forge 上下文

- 来源 run_id: `39f2e74b-8acf-4a2e-a454-7d7ae9bfebd9`
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
第一轮 Forge 演示：这个主题的核心问题是什么？
2. 第二轮迭代

参考上一轮决策：
# 上一轮 Forge 上下文

- 来源 run_id: `39f2e74b-8acf-4a2e-a454-7d7ae9bfebd9`
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
第一轮 Forge 演示：现有方案或竞品有哪些？
3. 第二轮迭代

参考上一轮决策：
# 上一轮 Forge 上下文

- 来源 run_id: `39f2e74b-8acf-4a2e-a454-7d7ae9bfebd9`
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
第一轮 Forge 演示：技术实现的关键约束是什么？
4. 第二轮迭代

参考上一轮决策：
# 上一轮 Forge 上下文

- 来源 run_id: `39f2e74b-8acf-4a2e-a454-7d7ae9bfebd9`
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
第一轮 Forge 演示：风险与不确定性在哪里？

## 综合结论

### 1. 第二轮迭代

参考上一轮决策：
# 上一轮 Forge 上下文

- 来源 run_id: `39f2e74b-8acf-4a2e-a454-7d7ae9bfebd9`
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
第一轮 Forge 演示：这个主题的核心问题是什么？

ProjectForge Agent 是全链路造物智能体，覆盖需求调研、原型、架构、PRD、开发、测试与部署。

查证型知识库通过 Claim-Evidence 对齐降低幻觉，架构阶段与 PRD 阶段必须经过查证门控。

企业知识库 RAG 支持 Markdown 与 PDF 入库，回答必须带 citation，低置信度需要拒答。

DeepResea...[^1]

### 2. 第二轮迭代

参考上一轮决策：
# 上一轮 Forge 上下文

- 来源 run_id: `39f2e74b-8acf-4a2e-a454-7d7ae9bfebd9`
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
第一轮 Forge 演示：现有方案或竞品有哪些？

ProjectForge Agent 是全链路造物智能体，覆盖需求调研、原型、架构、PRD、开发、测试与部署。

查证型知识库通过 Claim-Evidence 对齐降低幻觉，架构阶段与 PRD 阶段必须经过查证门控。

企业知识库 RAG 支持 Markdown 与 PDF 入库，回答必须带 citation，低置信度需要拒答。

DeepResea...[^2]

### 3. 第二轮迭代

参考上一轮决策：
# 上一轮 Forge 上下文

- 来源 run_id: `39f2e74b-8acf-4a2e-a454-7d7ae9bfebd9`
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
第一轮 Forge 演示：技术实现的关键约束是什么？

ProjectForge Agent 是全链路造物智能体，覆盖需求调研、原型、架构、PRD、开发、测试与部署。

查证型知识库通过 Claim-Evidence 对齐降低幻觉，架构阶段与 PRD 阶段必须经过查证门控。

企业知识库 RAG 支持 Markdown 与 PDF 入库，回答必须带 citation，低置信度需要拒答。

DeepResea...[^3]

### 4. 第二轮迭代

参考上一轮决策：
# 上一轮 Forge 上下文

- 来源 run_id: `39f2e74b-8acf-4a2e-a454-7d7ae9bfebd9`
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
第一轮 Forge 演示：风险与不确定性在哪里？

ProjectForge Agent 是全链路造物智能体，覆盖需求调研、原型、架构、PRD、开发、测试与部署。

查证型知识库通过 Claim-Evidence 对齐降低幻觉，架构阶段与 PRD 阶段必须经过查证门控。

企业知识库 RAG 支持 Markdown 与 PDF 入库，回答必须带 citation，低置信度需要拒答。

DeepResea...[^4]

## 不确定性说明

- 未配置外网搜索（TAVILY_API_KEY 或 SERPER_API_KEY），当前仅使用内部知识库。
- 可用来源较少，结论置信度有限，建议人工复核。
- 当前为离线子问题规划；配置 OPENAI_API_KEY 后可增强拆解质量。

## 脚注

[^1]: [内部] 《ProjectForge Master Plan》(kb://project-forge-plan/project-forge-plan#chunk-1) — ProjectForge Agent 是全链路造物智能体，覆盖需求调研、原型、架构、PRD、开发、测试与部署。

查证型知识库通过 Claim-Evidence 对齐降低幻觉，架构阶段与 PRD 阶段必须经过查证门控。

企业知识库 RAG
