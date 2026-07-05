# Auto Upgrade Loop

`shuang-evolve` 的升级对象是 workflow，不是一次性知识。它把任务经验从聊天中提取出来，经过准入标准后写入 skill。

## 信号分类

| 类型 | 例子 | 常见目标 |
|---|---|---|
| 用户纠正 | “不是让你做 X，是 Y” | description、触发边界 |
| 反复卡点 | 同一类 build/test/env 问题多次出现 | workflow step、validation |
| 验证遗漏 | 没跑 build 就声称完成 | completion gate |
| 范围漂移 | 从前端任务扩到后端 | scope guard |
| 产物格式弱 | 文档、handoff、PRD 不可执行 | output template |

## 升级级别

| 级别 | 动作 | 何时使用 |
|---|---|---|
| L0 | 只写 inbox note | 信号有价值但还不稳定 |
| L1 | 改 `references/` | 细节较多，不适合放在 SKILL.md |
| L2 | 改 `SKILL.md` | 触发条件或步骤必须影响 agent 行为 |
| L3 | 新增 skill | 能力独立、可复用、已有 skill 承载会变臃肿 |
| L4 | 合并/归档 | 多个 skill 重复、误触发、路线冲突 |

## 候选 diff 要求

- 每条新增规则都能追溯到 evidence。
- 每个目标 skill 只承担一个清晰职责。
- `description` 只写触发条件，不写完整流程。
- `SKILL.md` 保持短；复杂原理放 `references/` 或 `docs/`。
- 改完必须跑 `node scripts/validate-skills.mjs`。
