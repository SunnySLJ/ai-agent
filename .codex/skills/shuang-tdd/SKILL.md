---
name: shuang-tdd
description: "中文主导的单 Feature TDD 实施 Skill。用于一个 specs/00X-feature 已有 spec.md、plan.md、tasks.md 后，按 worktree 隔离、TDD、前端设计约束、代码审查、finish branch、retrospective 完成开发；当用户说“开始实现这个 feature”、“按 tasks.md 执行”、“不要重新规划”、“TDD 流程”、“finish branch/code review”时使用。English keywords: feature execution, worktree, TDD, code review, finish branch."
---

# Run Feature TDD

只处理一个已经完成文档准备的 feature。一次只跑一个 feature，除非用户明确要求并发。

排除 `specify`、`clarify`、`plan`、`tasks` 等上游文档生成请求；只在实现阶段使用。

如果请求来自 Spec-Kit/OpenSpec 文档链，先按 `../shuang-flow/references/spec-kit-handoff.md` 检查 TDD 交接包。项目里有 `scripts/spec-kit-handoff-check.mjs` 时，先跑 `node scripts/spec-kit-handoff-check.mjs --feature <feature-dir>`；缺 `spec.md`、`plan.md`、`tasks.md`，或三者互相矛盾时，停止实现并路由回 `shuang-specs` 或 `/speckit-analyze`。

如果当前环境已启用 Superpowers，可按用户和项目指令使用相关技能；否则按项目文档、内置工具和 TDD 纪律执行。不要因为外部 workflow 名称不同而跳过本 skill 的 feature 边界和验证要求。

## 启动前检查

1. 确认 feature 目录，通常是 `specs/00X-<feature>/`。
2. 按顺序读取：
   - `.specify/memory/constitution.md`
   - feature `spec.md`
   - feature `plan.md`
   - feature `tasks.md`
   - feature `state.md` / `session.md`（如果存在）
3. 如果缺 `state.md` 或 `session.md`，按 [references/state-session-templates.md](references/state-session-templates.md) 创建。
4. 如果 feature 依赖外部服务、API key、飞书 ID、大模型 key 等，先收集信息，不确定就问用户，不要硬编码真实密钥。
5. 确认项目基础设施就绪：依赖/构建文件存在且测试框架能跑。若项目尚未完成 bootstrap/setup，不套本实施流程。
6. 确认上游 feature 依赖已完成；依赖未完成时停下说明阻塞，不要伪造通过。
7. 确认 `spec.md` 的 AC、`plan.md` 的集成方案、`tasks.md` 的任务顺序能互相追溯；发现缺口时先补文档，不“边做边猜”。
8. 如果 `spec-kit-handoff-check` 输出 `blocked`，先修正文档，不写实现代码。

## Worktree 隔离

- 优先在独立 worktree 或独立分支执行。
- 需要复制本地配置时，在项目根创建 `.worktreeinclude`：

```text
.env
.env.local
.env.development
.credentials.yaml
```

- 不回滚用户已有改动，不污染主工作区。

## Task 执行规则

对 `tasks.md` 里的每个任务：

1. 在 `state.md` 标记当前任务。
2. 走 TDD：Red 失败测试 -> Green 最小实现 -> Refactor。
3. 完成后立刻更新 task checkbox。
4. 跑该任务最小但有效的验证命令。
5. 只有在仓库/分支状态允许且用户要求逐 task commit 时，才每个 task commit。

标签规则：

- `[FE]`：写组件前先读 `DESIGN.md` 和匹配的 `design-reference/stitch-export/<page>/`。如果安装了 `stitch-skills`，优先把 `code.html` 转成 React，而不是从零写。
- `[BE]`：按 `plan.md` 的 API/契约要求写测试；确实无契约时才跳过 OpenAPI/JSON Schema。
- `[INT]`：按子类型分流。基础设施类 config/migration/契约任务按依赖图排序，可能先于 FE/BE；E2E 类在本 feature 的 FE/BE 通过后跑真实链路；跨 feature patch 类必须重跑被改 feature 的现有测试。

## Code Review 与收尾

全部任务完成后，做 code review，重点检查：

1. 韧性缺陷：重试、超时、熔断。
2. 横切一致性：鉴权、限流、日志是否覆盖所有接口。
3. 防御性编码：null、输入校验、幂等键。
4. 数据库迁移：回滚脚本、分批操作、上线安全。
5. 当前 feature 含 `[FE]` 且项目有设计系统时，检查 token、视觉约束、禁止依赖和 constitution 规则。

报告格式、finish branch 和 retrospective 要求见 [references/review-and-finish.md](references/review-and-finish.md)。

## 停止规则

一个 feature 完成后，汇报并停下来等用户审查，不自动开始下一个 feature。
Feature 的 spec 目录永不删除；它是 CI、后续 feature 和复盘的上下文种子。
