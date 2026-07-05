# Spec-kit Handoff

从 brainstorm/PRD 进入 Spec-kit 文档链，或从 `tasks.md` 转入 TDD 实施前，读取本文件。

核心原则：每一步都有输入、产物、停止点和验证门；没有完成 `tasks.md` 一致性检查前，不进入代码实现。

## 阶段链路

| 阶段 | 输入 | 产物 | 停止点 | 验证门 | 下一步触发 |
|---|---|---|---|---|---|
| Brainstorm / PRD | 用户想法、调研、竞品、草稿 | `specs/prd.md` 或明确 feature 背景 | 目标、用户、Must-have 不清 | Must-have 可拆分，验收口径可写成 AC | “拆 feature / 跑 Spec-kit” |
| Specify | PRD 中的单个 feature | `spec.md` | 只写 What & Why，不写技术方案 | 边界、MVP、流程、Given/When/Then 可追溯 | “继续 clarify” |
| Clarify | `spec.md` | 更新后的 `spec.md` | 影响代码结构、验收标准、外部服务、数据契约的问题未澄清 | 模糊点已落回具体段落；不能替用户决策的地方已暂停 | “继续 plan” |
| Plan | `spec.md`、架构基线、现有代码事实 | `plan.md` | 技术路径、文件结构、集成点或风险不可验证 | 文件结构、数据流、依赖、集成点、风险缓解齐全 | “继续 tasks” |
| Tasks | `plan.md`、`spec.md` | `tasks.md` | 任务不可测试、依赖不明或粒度失控 | 12-18 条为主；单一职责、入参出参、验证方式明确 | “跑 analyze / 交给 TDD” |
| Analyze | `spec.md`、`plan.md`、`tasks.md` | 一致性结论和修正项 | 三份文档互相矛盾或缺关键契约 | 需求、方案、任务一一可追溯 | “开始实现” |
| TDD | 通过检查的 `spec.md`、`plan.md`、`tasks.md` | 测试、代码、更新后的任务状态 | 任一文档缺失或不一致 | Red -> Green -> Refactor，最小验证通过 | 下一个 task / 收尾 review |

## 执行顺序

按顺序执行或模拟：

1. `/speckit-specify`：生成 `spec.md`。
2. `/speckit-clarify`：扫描 `spec.md`，提出模糊点并更新原文。
3. `/speckit-plan`：生成详细技术方案 `plan.md`。
4. `/speckit-tasks`：基于 `plan.md` 拆分实现任务。
5. `/speckit-analyze`：检查 `spec.md`、`plan.md`、`tasks.md` 一致性。
6. `$shuang-tdd`：仅在用户要求实现且三份文档通过检查后启动。

影响代码结构、验收标准、外部服务、数据契约的问题，必须先 clarify。用户只要求文档时，停在 analyze 结论，不启动实现。

## Task 拆分规则

`tasks.md` 中的任务必须满足：

- 单一职责，避免一个任务同时改 FE、BE、DB 和部署。
- 可单独测试，至少有最小验证命令或人工检查点。
- 入参、出参和依赖明确，能追溯到 `spec.md` 的 FR/AC。
- 单个任务通常 2-5 分钟左右；过大就拆，过碎就合。
- 总量通常 12-18 个；少于 12 多半粒度过粗，多于 18 多半拆分过度。
- 明确 `[FE]`、`[BE]`、`[INT]`、`[TEST]`、`[DOC]` 标签，方便 TDD 阶段路由。

## TDD 交接包

转给 `$shuang-tdd` 前，必须具备：

- feature 目录：`specs/00X-<feature>/`。
- `spec.md`：需求边界、AC、非目标、数据/接口边界。
- `plan.md`：文件结构、数据流、依赖、集成点、风险。
- `tasks.md`：任务顺序、依赖、验证方式、完成定义。
- analyze 结论：没有未解决的 P0/P1 矛盾。
- 设计资料：涉及 `[FE]` 时有 `DESIGN.md` 或对应页面设计引用。
- 外部依赖：API key、第三方账号、回调地址、测试数据的缺口已列明。

缺任一项时，不要“先写一点代码”；回到 `shuang-specs` 或 `/speckit-analyze` 修正文档。

可以用脚本做结构化检查：

```bash
node scripts/spec-kit-handoff-check.mjs --feature specs/00X-<feature>
```

该脚本只检查交接包是否具备最小实施条件，不替代人工判断产品方向或技术方案。输出 `blocked` 时，先补 `spec.md`、`plan.md` 或 `tasks.md`；输出 `ready` 后，仍按 `$shuang-tdd` 的 TDD 和 review 纪律执行。

## 实施交接

`tasks.md` 生成并检查后：

- 检查 `spec.md`、`plan.md`、`tasks.md` 是否一致。
- 优先运行 `node scripts/spec-kit-handoff-check.mjs --feature <feature-dir>`，把 blocker 清零。
- 用户只要文档时，到这里停止，并给出下一条可复制提示词。
- 用户要求实现时，使用 `$shuang-tdd`，并把 feature 目录、当前 task、验证命令一起交接。
- 如果用户只说“开始做”，默认先确认 TDD 交接包是否齐全；不齐就补文档，不直接写代码。

## Constitution 实施纪律

如果项目要从 Spec-kit 转给 TDD 实施流程，在 `.specify/memory/constitution.md` 补：

```md
### Implementation Discipline (for TDD handoff)

- Before executing any tasks.md, ALWAYS read .specify/memory/constitution.md FIRST.
- Always follow TDD: Red (failing test) -> Green (minimum code) -> Refactor.
- Always update tasks.md checkbox after EACH task completes.
- After each task: commit, then STOP and wait for "next".
- All [FE] tasks: MUST read root DESIGN.md and the matched
  design-reference/stitch-export/<page>/ BEFORE writing any component code.
```
