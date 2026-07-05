---
name: shuang-arch
description: "中文主导的源码对抗调研与架构基线决策 Skill。用于候选开源项目较多、需要决定 fork/复用/自建/组合方案时，组织项目代言人、红队、集成评估师进行证据驱动辩论，并产出 specs/research/debate/* 与 specs/research/06-架构基线决策.md。English keywords: adversarial architecture selection, red team, fork vs build, integration assessment."
---

# Adversarial Architecture Selection

在 `specs/research/03-开源项目.md` 已经列出候选项目、`specs/research/04-实现方案.md` 已经描述目标方案后使用。目标不是“谁写得长谁赢”，而是让架构选择经得起反方质疑。

## 前置输入

- `specs/research/03-开源项目.md`：候选开源项目列表。
- `specs/research/04-实现方案.md`：目标产品或技术实现方向。
- 候选项目的本地源码路径或 GitHub 链接。

如果候选项目为 0 或 1 个，不启动对抗流程，只写简短决策说明。

如果用户要求等待、确认或稍后继续，暂停对抗流程，只记录待确认事项，不启动 teammate。

## 输出目录

```text
specs/research/debate/
  00-任务分配.md
  position-paper-{project-name}.md
  red-team-position.md
  integration-assessment.md
  debate-transcript.md
specs/research/06-架构基线决策.md
specs/research/05-决策汇总.md
```

## 三阶段协议

1. **Phase 0：候选项目分配**
   - 读取 `03-开源项目.md`，统计候选数 N。
   - 按技术栈/定位相近原则分给 3 个项目代言人。
   - 写入 `specs/research/debate/00-任务分配.md`。

2. **Phase 1：独立深挖**
   - 每个候选项目产出一份 position paper。
   - 红队产出 `red-team-position.md`，反对所有候选项目。
   - 集成评估师产出 `integration-assessment.md`，评估单项目和组合方案。
   - 常规流程见 [references/debate-protocol.md](references/debate-protocol.md)。
   - 需要完整 5 角色框架、反偏见守卫、示例 paper 或历史课程版细节时，再读取 `references/legacy-full-framework/` 下的对应文件。

3. **Phase 2：法庭辩论**
   - Lead 先随机打乱所有 paper 顺序。
   - 红队对每份 paper 提 3 条带证据质疑。
   - 集成评估师对单 fork 方案各提 1 条复合挑战。
   - 代言人逐条回应，每条不超过 200 字。
   - Lead 在辩论中保持中立，不提前表态。

4. **Phase 3：综合判决**
   - 只基于幸存论点、源码证据、成本和风险做决定。
   - 写 `06-架构基线决策.md`。
   - 更新 `05-决策汇总.md` 为 v2，说明更新时间和原因。

## Agent / Subagent 使用

如果当前环境支持 Agent Teams 或 subagents，使用 [references/spawn-templates.md](references/spawn-templates.md)。如果不支持，就按相同角色顺序产出文件，不伪装成并行完成。

## Legacy Reference Map

`shuang-architecture` 已并入本 skill 的 reference 层，日常不要再触发旧入口：

| 需要 | 文件 |
|---|---|
| 完整 7 维度 paper 模板 | `references/legacy-full-framework/7-dimensions-framework.md` |
| 反偏见硬约束和常见偏差 | `references/legacy-full-framework/anti-bias-guardrails.md` |
| 完整辩论协议 | `references/legacy-full-framework/debate-protocol.md` |
| fork 选择示例 | `references/legacy-full-framework/example-fork-selection.md` |
| 技术栈选择示例 | `references/legacy-full-framework/example-tech-stack.md` |
| 历史 5 角色 spawn 模板 | `references/legacy-full-framework/role-spawn-templates.md` |
