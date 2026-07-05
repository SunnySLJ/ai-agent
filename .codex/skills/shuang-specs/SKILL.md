---
name: shuang-specs
description: "中文主导的 Spec-kit 多 Feature 文档生成 Skill。用于基于 specs/prd.md 只拆 Must-have 功能，并逐个产出 specs/00X-feature/spec.md、clarify 更新、plan.md、tasks.md；当用户要求“只产出文档、不写代码”、“每个 feature 跑 specify/clarify/plan/tasks”、“先输出拆分列表和顺序”、“tasks 12-18 条”时使用。English keywords: Spec-kit, feature docs, specify, clarify, plan, tasks."
---

# Spec-kit Feature Docs

用这个 Skill 把 PRD 中的 Must-have 功能拆成多个 feature 文档目录。只产出文档，不写代码，不动 worktree，不跑 TDD。

当任务来自课程/Spec-Kit/OpenSpec 流程沉淀，或最终要交给 TDD 实施时，先读 `../shuang-flow/references/spec-kit-handoff.md`，按其中的阶段门确认输入、产物、停止点和验证门。

## 第一步必须暂停确认

先读取 `specs/prd.md`，只抽取 Must-have 功能，输出拆分表并等待用户确认：

```md
| # | feature 名 | 来自 PRD 哪一节 | 依赖哪些 feature | 文档输出目录 |
|---|---|---|---|---|
```

目录格式必须是：

```text
specs/00X-<feature-slug>/
```

确认前不要生成任何 feature 文档。

读取 PRD 后默认先输出 Must-have 拆分表；只有缺失信息会影响拆分或排序时，才先停下来提问。

## 每个 Feature 的 4 步

用户确认顺序后，一次只处理一个 feature。每个 feature 跑完 4 步后暂停给用户审。

1. **specify -> `spec.md`**
   - 只写 What & Why，不写技术选型。
   - 必含：功能边界、MVP 约束、运行环境、业务流程。
   - AC 用 Given/When/Then。
   - 从 PRD 对应章节抽输入、输出、AC、边界条件。

2. **clarify -> 更新 `spec.md`**
   - 必跑，不可跳过。
   - 扫 MVP 边界、API 边界、数据边界、集成边界。
   - 每个澄清问题都要追到 `spec.md` 的具体段落更新。
   - 用户也不确定时停下来问，不替用户决策。

3. **plan -> `plan.md`**
   - 必含 5 项：项目文件结构、Mermaid 数据流、依赖清单、现有系统集成点、风险与缓解。
   - 能复用架构基线和已有模块时，不新建。

4. **tasks -> `tasks.md`**
   - 12-18 条任务，少于 12 说明粒度过粗，多于 18 说明过度拆分。
   - 每条任务单一职责、可单独测试、入参出参明确。
   - 标注并行组、`[FR-X 来源]`、`[依赖任务]`、`[出参验证方式]`。

详细模板和失败处理规则见 [references/feature-doc-template.md](references/feature-doc-template.md)。

## 停止规则

- 一个 feature 的 4 步完成后必须暂停，等用户确认再下一个。
- PRD 缺 AC、边界、数据样例、集成点时先问。
- 不写代码、不启动 worktree、不跑 TDD。
- 准备交给实现前，必须先检查 `spec.md`、`plan.md`、`tasks.md` 一致；如果项目已安装本工具集，先跑 `node scripts/spec-kit-handoff-check.mjs --feature specs/00X-<feature>`，不通过就修正文档，不把半成品交给 `shuang-tdd`。
