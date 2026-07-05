# 源码对抗调研协议

用于启动“法庭式”架构基线决策流程。

## 背景

前提：已经完成 5 份立项调研 `specs/research/01~05.md`，其中 `03-开源项目.md` 推荐了 N 个候选开源项目。现在需要决定 fork 哪个、复用什么、自建什么，或是否采用多项目复合方案。

Team Lead 充当法官，不参与辩论，只在最后做综合判决。

## 7 维度深挖框架

所有 position paper 必须按 7 维度填写，缺一不可：

| # | 维度 | 内容 |
|---|------|------|
| 1 | 架构总览 | Mermaid 图 + 主目录结构 |
| 2 | 核心能力清单 | 项目实际做了什么（按功能列举） |
| 3 | 数据模型 | 关键类 / 表 / 接口 |
| 4 | 扩展点 | 设计上预留的 hook / 插件位 / 配置入口 |
| 5 | 改造成本估算 | fork 后改造为目标产品需要动多少代码（人日 + 风险） |
| 6 | 致命缺陷自述 | 项目最大的 3 个缺陷，强制自报 |
| 7 | 与其他候选项目的集成可行性 | 能配合 / 互斥 / 部分集成 |

第 6 维是反偏见核心设计。缺失视为 paper 不合格。

## Phase 0：候选项目分配

读取 `specs/research/03-开源项目.md`，确定候选项目数 N：

| N | 分配方案 |
|---|---------|
| 0 或 1 | 无需对抗调研，终止流程 |
| 2 | 代言人 1/2 各 owns 1 项目；代言人 3 改为备用红队 |
| 3 | 1 代言人 = 1 项目 |
| 4 | 1 代言人 owns 2 项目，其余 2 代言人各 owns 1 |
| 5 | 2/2/1 分配 |
| >= 6 | 均匀分配，如 2/2/2 或 3/2/2 |

分配原则：

- 技术栈/定位相近的项目分给同一代言人，便于对比。
- 差异大的项目分给不同代言人，保持辩论多样性。

写入：

```text
specs/research/debate/00-任务分配.md
```

## 固定团队构成

无论 N 多少，固定 5 人：

1. Teammate 1-3：项目分析师 + 强势论证者。
2. Teammate 4：红队，反对所有候选项目。
3. Teammate 5：集成评估师，中立评估多项目复合可行性。

N=2 时，第 3 位项目分析师改为备用红队。

## Phase 1：独立深挖

- 5 个 teammate 并行。
- Phase 1 禁止 teammate 之间通信。
- 代言人对 owns 多项目时串行深挖，每个项目独立写 paper。
- 每个 teammate 预算 <= 30 分钟；owns 多项目可延长到 60 分钟。

产出：

```text
specs/research/debate/position-paper-{project-name}.md
specs/research/debate/red-team-position.md
specs/research/debate/integration-assessment.md
```

## Red Team Paper

`red-team-position.md` 必须包含：

- 每个候选项目 3 条致命缺陷，带源码 / Issue / commit history 证据。
- “全自建”方案估算：工作量、风险、收益。
- “换思路”方案：如果存在既不 fork 也不全自建的第三条路。

红队不能附和任何 paper。

## Integration Assessment

`integration-assessment.md` 评估每对组合：

1. 集成边界：API / 文件 / 数据库 / 进程。
2. 数据流冲突：需要多少 adapter。
3. 版本/依赖冲突：语言版本、依赖版本。
4. 总改造成本。
5. 运维复杂度。
6. 推荐分：1-10。

综合排序，列 top 3，含“全自建”对照。

## Phase 2：法庭辩论

对抗发生在 paper 层级，不是 teammate 层级。

1. Lead 把所有 N 份 paper 随机打乱顺序广播到 mailbox。
2. 红队对每份 paper 发 3 条质疑，共 3N 条，每条带源码/commit/issue 证据。
3. 集成评估师对“单 fork 派”paper 各发 1 条复合挑战。
4. 各代言人逐条回应，每条 <= 200 字。
5. Lead 判断是否需要第 2 轮；最多 2 轮。

## Phase 3：综合判决

Lead 不调用 teammate，阅读 papers + debate transcripts 后写：

```text
specs/research/06-架构基线决策.md
```

内容：

1. 决策摘要：单 fork 或多项目复合。
2. 复用矩阵：模块、来源、处理方式。
3. 被否方案理由：引用辩论记录行号。
4. Open Questions：至少 3 个，给 brainstorming 阶段。
5. 改造成本总估算：人日 / 月预算。

同时更新：

```text
specs/research/05-决策汇总.md
```

更新内容：

- “开源复用决策”替换为本次架构基线决策。
- “技术栈决策”按复用矩阵调整。
- 顶部标记 v2 更新时间和原因。

## 反偏见硬约束

- 每份 paper 第 6 维“致命缺陷自述”必填。
- Phase 2 papers 随机打乱顺序。
- 每条质疑回应 <= 200 字。
- Lead Phase 2 只观察，不表态。
- Lead 只能基于幸存论点判决。
- 代言人 owns 多项目时，每份 paper 都必须独立强势论证，不能留余地。

## 团队清理

Phase 3 完成后，关闭 teammate，清理 team 资源。
