# Stage Routing

按用户当前阶段选择要读取的项目文件和要引用的兄弟 Skill。只读取存在的文件；缺失时在提示词里要求目标 AI 检查并报告。

## 通用上下文

优先读取：

- `AGENTS.md` / `Agent.md` / `CLAUDE.md`：项目级协作规则。
- `.specify/memory/constitution.md`：项目宪法和不可违反约束。
- `specs/prd.md`：业务 WHAT/WHY、Must-have、边界和验收。
- `package.json`：真实命令和依赖。
- `DESIGN.md`：涉及前端时读取。

## 阶段到文档映射

| 阶段 | 需要优先读取 | 提示词应强调 |
|---|---|---|
| idea / research / prd | `specs/research/*`、`specs/prd.md`（如果已有） | 先澄清需求和证据，不写代码 |
| design | `specs/prd.md`、`DESIGN.md`、`design-reference/stitch-export/` | 只覆盖 Must-have，不扩展 PRD 外功能 |
| specs | `specs/prd.md`、`.specify/memory/constitution.md`、`DESIGN.md`（如涉及 UI） | 先输出 feature 拆分和顺序，确认后再逐个生成 |
| arch | `specs/research/03-开源项目.md`、`specs/research/04-实现方案.md`、`specs/research/05-决策汇总.md` | 优先使用 `shuang-arch`，先分配候选项目，再产出架构基线决策 |
| implement / tdd | feature `spec.md`、`plan.md`、`tasks.md`、`state.md`、`session.md`、constitution | 禁止重新规划，按 tasks TDD 执行 |
| review | feature 文档、代码 diff、测试结果 | 先列发现，按严重程度排序 |
| finish | feature 文档、git 状态、测试结果、review 结果 | 收尾、提交、合并、复盘前必须验证 |
| evolve | `docs/skill-evolution/README.md`、本轮任务文档、review 结果、测试结果、用户纠正 | 先写 evolution note，不直接改 `SKILL.md`；通过长期化标准后再升级目标 skill |

## 本地项目识别

| 用户语境 | 默认项目路径 | 生成提示词时要加入的读取要求 |
|---|---|---|
| skill、提示词系统、Vibe Coding、Spec-Kit 流程、设计方法论 | `/Users/mac/Desktop/vibe-coding/shuang-java/vibe-coding-shuang` | 读取 `.codex/skills/shuang-flow/references/skill-system-map.md` 和相关 `shuang-*` skill |
| 配置治理、Nacos、core、gateway、UAA、ERP、AI 模块、Java 多模块 | `/Users/mac/Desktop/one-person/kuai-yan-fa` | 读取 `AGENTS.md`、根 `pom.xml`、真实 `application*.yml` / `bootstrap*.yml` / deploy YAML，不读 `target/classes` 作为修改源 |
| 前端设计、Figma、Stitch、网页复刻、Next.js 页面 | `/Users/mac/Desktop/vibe-coding/shuang-open-design` | 读取 `AGENTS.md`、目标 app、`DESIGN.md` 或设计参考目录 |

## 兄弟 Skill 路由

生成提示词时可以在“建议目标 AI 使用的流程”中引用这些项目级 Skill 名称：

- `$shuang-flow`：总流程判断和文档驱动调度。
- `$shuang-research`：新产品四路调研和 `05-决策汇总.md`。
- `$shuang-brainstorm`：需求澄清、方案比较和设计收敛。
- `$shuang-prd`：调研/脑暴结论到 PRD。
- `$shuang-arch`：多候选架构/源码对抗决策；完整参考源在 `shuang-arch/references/legacy-full-framework/`。
- `$shuang-specs`：PRD Must-have 拆 feature 四步文档。
- `$shuang-design`：UI 原型、`DESIGN.md`、前端 constitution。
- `speckit-specify` / `speckit-clarify` / `speckit-plan` / `speckit-tasks`：显式 Spec-Kit 命令阶段。
- `$shuang-tdd`：单 feature TDD 实施、审查和收尾；`shuang-run-feature` 已归档，只作历史对照。
- `$shuang-router` / `$shuang-backend` / `$shuang-frontend` / `$shuang-slice` / `$shuang-chain`：feature 完成后的测试缺口闭环。
- `shuang-evolve`：任务结束后的复盘进化入口，先生成 `docs/skill-evolution/inbox/*.md`，再决定是否升级某个 `SKILL.md`；需要可视化演示时进入 Skill Studio `/evolve/theater`。

如果目标 AI 环境不支持这些 Skill，就要求它按提示词内的同等步骤执行。
