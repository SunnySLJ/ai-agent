# Prompt Template

生成提示词时使用下面骨架。根据阶段删减无关块，但不要删除“源文件”“硬约束”“停止规则”。

## 短命令意图卡

当用户只给一句短需求、粗糙命令或“帮我优化成能交给 AI 的提示词”时，先在提示词前输出这张卡：

```markdown
短命令意图卡
- 用户原话：<保留原句>
- 推断阶段：<idea/research/prd/design/specs/implement/review/finish/evolve/unknown>
- 目标 AI：<Claude Code/Codex/Cursor/通用>
- 候选必读文件：<只列真实存在或需要目标 AI 检查的路径>
- 已知硬约束：<范围、技术栈、安全、不能做什么>
- 阻塞缺口：<只列会影响产品方向、架构、安全、外部依赖或验收的问题>
- 本轮停止点：<目标 AI 做到哪里必须停>
```

如果“阻塞缺口”为空，直接生成可复制提示词；如果不为空，先问最少问题，不要求用户把完整提示词结构一次性补齐。

## 通用骨架

```markdown
# 角色
你是资深产品/架构/前端/后端/测试工程师（按当前阶段选择），需要在当前项目中按文档驱动开发协作。

# 项目上下文
当前项目路径：`<PROJECT_ROOT>`

请先读取以下文件，再做任何判断：
- `<PATH_1>`：<为什么读>
- `<PATH_2>`：<为什么读>
- `<PATH_3>`：<为什么读>

# 当前阶段
我现在处于：`<STAGE>`

阶段目标：
- <目标 1>
- <目标 2>

# 我的需求
<保留用户原始需求，必要时整理成 3-6 条明确任务>

# 执行要求
1. 先基于上面文件确认当前事实，不要凭经验猜。
2. 只处理本阶段任务，不要跳到下一阶段。
3. 如果发现文档互相冲突，先列冲突并停下来问我。
4. 如果缺少外部服务信息、API Key、账号 ID、设计文件或验收数据，先列缺口，不要自行编造。
5. 如果已有 `plan.md` / `tasks.md` 明确锁定，不要重新规划，除非我明确要求。
6. 如果要使用 hook、plugin、MCP、slash command、subagent 或外部工具，先指出证据文件路径；没有证据时只把它列为“可选后续自动化方向”，不要当作当前执行要求。

# 输出格式
<要求目标 AI 输出表格、文档路径、diff、测试证据或下一步确认项>

# 停止规则
- 完成本阶段产物后停止，等待我确认。
- 遇到影响范围、架构、验收或外部依赖的不确定点时停止。
- 不要自行扩大 PRD、Spec 或 tasks 范围。
```

## 阶段化补充

### specs 阶段

加入：

```markdown
本轮只产出文档，不写任何代码、不启动 worktree、不跑 TDD。
第一步只输出 Must-have feature 拆分表和推荐顺序，等我确认后再逐个 feature 生成 `spec.md`、`plan.md`、`tasks.md`。
```

### design 阶段

加入：

```markdown
只覆盖 PRD Must-have。不要添加营销页、账号系统、团队协作、模板市场或 PRD 未要求功能。
所有视觉规则必须落到 `DESIGN.md`，并明确路由、页面、Section、状态和 design tokens。
```

### implement / tdd 阶段

加入：

```markdown
禁止重新规划。先读 constitution、feature `spec.md`、`plan.md`、`tasks.md`、`state.md`、`session.md`。
按 `tasks.md` 顺序执行，每个任务走 Red -> Green -> Refactor，并更新 checkbox / state。
涉及前端时先读 `DESIGN.md` 和对应 `design-reference/stitch-export/`。
```

### review 阶段

加入：

```markdown
以 code review 视角输出：先列问题，按 blocker / major / minor 排序，包含文件:行、影响、修复建议和测试缺口。
不要把总结放在发现之前。
```

### arch 阶段

加入：

```markdown
先读取候选项目清单并按规则分配角色，再产出 position papers、red-team、integration assessment、debate transcript 和最终 `06-架构基线决策.md`。
判决只能基于幸存论点和证据，不基于文本长度或先后顺序。
```
