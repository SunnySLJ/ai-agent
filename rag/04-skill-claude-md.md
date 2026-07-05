# 04 — SKILL.md / CLAUDE.md / AGENTS.md 设计规范

> 来源：`part19/GStack PDF` + `part24/Harness Engineering` + `part07-agent-skills/` + `part17-agent-claude-code/`  
> 对应项目：`harness-agent/AGENTS.md` + harness-agent 各阶段 Skill 设计

---

## 一、三者区别与定位

| 文件 | 平台 | 定位 | 加载时机 |
|---|---|---|---|
| `CLAUDE.md` | Anthropic Claude Code | 项目"宪法"——约束 + 工具注册 + 行为规则 | Agent 启动时自动加载 |
| `AGENTS.md` | OpenAI Codex 体系 | 同上（OpenAI 叫法） | Agent 启动时自动加载 |
| `SKILL.md` | GStack（Garry Tan） | **角色定义**——单个专项 Agent 的边界、约束、输出格式 | 对应 `/command` 触发时加载 |

---

## 二、CLAUDE.md 黄金模板

### 2.1 结构（OpenAI 100 行原则）

```markdown
# 项目名称 — Agent 配置

## 项目概述
- 技术栈：...
- 目标：...
- 代码风格：...

## 常用命令
```bash
# 开发
python -m pytest tests/
python -m uvicorn app.main:app --reload

# 构建
pip install -e ".[dev]"
```

## 关键约束（禁区）
- 不要修改 .env 文件
- 不要删除 data/ 目录
- 所有 API 接口必须有 Pydantic 类型标注

## 编码规范
- 使用 snake_case 命名
- 函数/类必须有 docstring
- 测试文件命名：test_*.py

## 文档索引（按需跳转）
- 架构设计：docs/architecture.md
- API 规范：docs/api-spec.md
- 数据模型：docs/data-models.md

## gstack（若使用 GStack）
Use /browse from gstack for all web browsing.
Available skills: /office-hours, /review, /qa, /ship, ...
```
```

### 2.2 三层配置继承

```bash
# 优先级：个人 > 项目 > 全局
~/.claude/CLAUDE.md          # 个人全局偏好
./CLAUDE.md                   # 项目约束（git 提交）
./.claude/local.md            # 个人在该项目的偏好（git ignore）
```

### 2.3 harness-agent 项目的 CLAUDE.md 模板

```markdown
# harness-agent — Harness 工程

## 目录结构
```text
harness-agent/           # 本工程（可读写）
../agent/                # 课程库（只读引用）
../work/ai-agent/        # ProjectForge 作品集（可读写）
```

## 常用命令
```bash
cd harness-agent
pip install -e .
hstack init "产品名称"
hstack gate --workspace ./.harness/runs/<run-id>
hstack advance --workspace ./.harness/runs/<run-id>
hstack status --workspace ./.harness/runs/<run-id>
python -m pytest tests/ -v
```

## 关键约束
- 不要修改 ../agent/ 目录下的任何文件（只读课程库）
- harness run 产物写入 .harness/runs/ 目录
- 所有 Python 代码使用类型注解

## 编码规范
- 使用 snake_case
- CLI 命令：hstack（不是 shstack）
- 导入路径：harness_agent.xxx（不是 shuang_harness）
```
```

---

## 三、SKILL.md 设计规范（GStack 原版）

### 3.1 五个核心组件

```markdown
## 角色身份（Who am I）
你是一位 [角色]，专注于 [专项任务]。

## 约束条件（What I DON'T do）
- 不做...
- 不讨论...
- 不修改...（只做本职）

## 执行流程（How I work）
1. 第一步：...
2. 第二步：...
3. 第三步：...

## 产出格式（What I output）
- 格式：Markdown / JSON / 结构化报告
- 必须包含：...
- 写入位置：{workspace}/.harness/...

## ETHOS 引用（设计哲学）
遵循：Boil the Lake（完整实现）/ Search Before Building / Role as Constraint
```

### 3.2 harness-agent 各阶段的 SKILL.md 映射

| 阶段 | SKILL 角色 | 产物 | 门禁条件 |
|---|---|---|---|
| 01-research | `ResearchAgent`（调研专家） | `research.md`（竞品分析、技术选型） | 包含"竞品分析"和"技术选型"章节 |
| 02-prototype | `PrototypeAgent`（原型设计师） | `prototype/`（交互稿或架构图） | 存在可运行的 demo 或 mockup |
| 03-product | `ProductAgent`（产品经理） | `prd.md`（需求文档） | 包含用户故事和 AC |
| 04-infra | `InfraAgent`（基础架构工程师） | `architecture.md` + `AGENTS.md` | 架构图存在，AGENTS.md 已写 |
| 05-build | `BuildAgent`（后端工程师） | `backend/`（代码） | 所有测试通过 |
| 06-frontend | `FrontendAgent`（前端工程师） | `frontend/`（代码） | 构建 0 报错 |
| 07-release | `ReleaseAgent`（发布工程师） | `CHANGELOG.md` + PR | PR 已创建，CI 通过 |
| 08-eval | `EvalAgent`（QA 工程师） | `eval/report.md`（测试报告） | 关键指标达标 |
| 09-retrospective | `RetroAgent`（复盘主持人） | `retro.md` + `LEARNINGS.md` | 复盘文档已写 |

---

## 四、编写高质量 SKILL.md 的 7 条原则

### 原则一：角色边界极致收窄

```markdown
# 好的约束（/review）
你专门找"CI 能过但生产会炸"的 bug。
- 不重构代码风格
- 不讨论架构方向
- 不建议新功能
只做一件事：找会导致生产事故的 bug

# 差的约束
你是一个全能代码审查者，帮我全面审查代码。
```

### 原则二：产出格式必须明确

```markdown
# 好的格式定义
产出一份严格格式的 JSON 报告：
{
  "severity": "CRITICAL | HIGH | MEDIUM | INFO",
  "file": "相对路径",
  "line": 行号,
  "issue": "问题描述",
  "fix": "修复建议"
}

# 差的格式定义
输出你发现的问题。
```

### 原则三：触发条件清晰

```markdown
# 什么时候该用这个 Skill
当代码已经可以运行，准备进入代码审查阶段时，
在 git commit 之前，调用 /review
```

### 原则四：强制自检循环

```markdown
# 完成初稿后，强制自检：
1. 是否覆盖了所有文件？
2. 是否有 CRITICAL 问题被遗漏？
3. 是否有误报？（根据17条误报排除规则检查）
```

### 原则五：引用 ETHOS 哲学

```markdown
遵循 GStack ETHOS：
- Boil the Lake：必须做完整，不能"先这样凑合"
- Search Before Building：先看现有代码怎么写的，保持一致
```

### 原则六：渐进式知识加载（3层）

```text
元数据层（~100词）：Skill 名称 + 触发场景描述  → 常驻 context
主体层（<500行）：SKILL.md 完整内容             → 触发时加载
资源层（不限）：references/ 子目录（API文档等）  → 执行过程中按需
```

### 原则七：错误消息即教学

```python
# 好的 linter 错误消息
"错误：字段名 userName 应改为 user_name
（项目规范：API 响应统一使用 snake_case，详见 docs/api-conventions.md）"

# 差的错误消息
"命名不规范"
```

---

## 五、harness-agent 中编写自定义 SKILL.md 步骤

```bash
# 1. 在目标项目的 .claude/skills/ 目录创建 Skill
mkdir -p .claude/skills/harness-research/
touch .claude/skills/harness-research/SKILL.md

# 2. SKILL.md 模板（参考 GStack 格式）
# （内容见下方模板）

# 3. 在 CLAUDE.md 中注册
echo "Available skills: /harness-research, /harness-build, ..." >> CLAUDE.md

# 4. 在 Claude Code 中调用
# /harness-research
```

**最小可用 SKILL.md 模板**：

```markdown
# /harness-research — 竞品与技术调研专家

## 角色
你是一位技术调研专家，专注于收集和分析竞品信息与技术选型依据。

## 不做的事
- 不写代码
- 不做产品决策
- 不讨论具体实现细节

## 执行流程
1. 理解调研目标（产品名称 + 领域）
2. 搜索竞品（至少 3 个）：功能、定价、技术栈、优缺点
3. 分析技术选型备选方案（至少 2 个），给出推荐
4. 进行内部对抗审查（扮演批评者挑战结论）
5. 写入调研报告

## 产出
写入 `.harness/research/research.md`，结构：
- ## 产品概述
- ## 竞品分析（表格）
- ## 技术选型（含推荐理由）
- ## 风险点
- ## 下一步建议

## 门禁
研究报告必须包含：竞品分析、技术选型两个章节，且字数 > 500 字。
```

---

## 六、源文件参考

```bash
# GStack SKILL.md 原版（需 clone）
# https://github.com/garrytan/gstack/tree/main/office-hours/SKILL.md

# Agent Skills 设计实战 notebook
../../agent/part07-agent-skills/大模型AgentSkills设计实战.ipynb

# Claude Code 源码解读
../../agent/part17-agent-claude-code/Claude.\ Code源码解读.pdf

# Claude Code 专题（能力边界 + 多智能体）
../../agent/part23-agent-claude-special/Part\ 3.*/Claude\ Code\ 浓缩版第\ 3\ 节·多智能体与上下文工程
```
