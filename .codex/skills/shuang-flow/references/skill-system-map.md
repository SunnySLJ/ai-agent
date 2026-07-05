# Shuang Skill System Map

本文件描述当前项目级 skill 系统的整体路由。它把 `shuang-open-design` 的产品/设计/测试方法论，与本机真实业务项目 `kuai-yan-fa` 的工程纪律合并成一套可执行流程。

## 本地项目边界

| 项目 | 路径 | 用途 |
|---|---|---|
| Skill 系统工作区 | `/Users/mac/Desktop/shuang-kuai/shuang-skill` | 当前项目级 Codex skills 的安装和调度目录 |
| 设计/方法论来源 | `/Users/mac/Desktop/vibe-coding/shuang-open-design` | 上游 skill 方法论、Spec-Kit 命令型 skill、前端/测试闭环 skill 来源 |
| 真实业务仓库 | `/Users/mac/Desktop/one-person/kuai-yan-fa` | Java 8 / Spring Cloud 多模块业务项目，用于检验提示词和后端工程规则是否贴近真实仓库 |
| 私有课程资料 | `.shuang-skill/course-sources.local.json` | 本机学习资料索引；只用于提炼原创规则，不提交课程原文 |

如果用户没有指定项目路径，先根据上下文判断：提到“配置、Nacos、core、网关、UAA、ERP、AI 模块”时，优先指向 `kuai-yan-fa`；提到“skill、设计、Spec-Kit 工作流、提示词系统”时，优先指向当前 Skill 系统工作区。

## 一整套系统路由

| 阶段 | 首选 skill | 作用 | 关键产物 |
|---|---|---|---|
| 想法澄清 | `shuang-brainstorm` / `shuang-flow` | 澄清目标、非目标、MVP、验收标准 | 设计结论、问题清单 |
| 立项调研 | `shuang-research` | 四路调研 + 汇总收敛 | `specs/research/01~05.md` |
| 架构选型 | `shuang-arch` | 多候选源码/方案对抗调研 | `06-架构基线决策.md` |
| PRD | `shuang-prd` | 从调研/脑暴结论生成可验收 PRD | `specs/prd.md` |
| Spec-Kit 四步 | `shuang-specs` 或 `speckit-specify/clarify/plan/tasks` | 生成 feature 级 `spec.md/plan.md/tasks.md` | `specs/00X-*/` |
| UI / 设计系统 | `shuang-design` / `shuang-web-design-master` / `shuang-design-inject` | PRD 到 UI、`DESIGN.md`、前端 constitution | `DESIGN.md`、页面规范 |
| 单 feature 实现 | `shuang-tdd` / `speckit-implement` | 按 `tasks.md` 和 TDD 实施 | 代码、测试、状态记录 |
| 收尾测试路由 | `shuang-router` | 判定后端/前端/接缝/全链路缺口 | 测试路由报告 |
| 后端补测 | `shuang-backend` | 真库、鉴权、并发、韧性缺口闭环 | 回归测试 |
| 前端补测 | `shuang-frontend` | 视觉契约、a11y、响应式、契约 mock | 前端回归测试 |
| 接缝/链路补测 | `shuang-slice` / `shuang-chain` | 前后端接缝、跨 feature 旅程 | 集成/E2E 安全网 |
| AI 交接提示词 | `shuang-prompt` | 按项目、阶段、需求生成可复制提示词 | Markdown 提示词 |
| Skill 复盘进化 | `shuang-evolve` + Skill Studio `/evolve/theater` | 从真实任务的失败点、用户偏好、验证证据生成 evolution note，并升级目标 skill | `docs/skill-evolution/inbox/*.md`、`SKILL.md` diff |
| 学习资料提炼 | `shuang-evolve` | 从课程、流程图、源码案例中提炼可复用 workflow，不复制原文 | 本地 inventory、evolution note、最小 skill diff |
| 项目指导文件 | `shuang-claude-md` | 生成/刷新 `AGENTS.md` / 等价指导文件 | 项目索引与协作规则 |

## Canonical 与兼容入口

- 架构阶段：新提示词使用 `shuang-arch`。`shuang-architecture` 已归档，完整 references 已并入 `shuang-arch/references/legacy-full-framework/`。
- 实施阶段：新提示词使用 `shuang-tdd`。`shuang-run-feature` 与 `shuang-course-run` 已归档，不再用于新任务。
- 复盘阶段：`shuang-evolve` 是第 9 阶段 canonical agent 入口，Skill Studio `/evolve/theater` 是可视化演化入口。每次任务结束后，先写 `docs/skill-evolution/inbox/YYYY-MM-DD-<topic>.md`，再决定是否升级目标 skill。

## Spec-Kit 与 Superpowers 的使用边界

- `speckit-*` skill 是本地安装的命令型能力，本项目只做 Codex frontmatter 兼容化；正文流程不改。
- Spec-Kit 的能力用于：`specify`、`clarify`、`plan`、`tasks`、`analyze`、`implement` 等文档/实施阶段。
- 如果当前 Codex 环境启用了 Superpowers，可按用户和项目指令调用；未启用时，相关名称只作为流程纪律引用，例如 brainstorming、TDD、code review、worktree isolation、verification-before-completion。
- 当目标 AI 是外部 Claude Code 且用户明确要求时，`shuang-prompt` 可以在生成的提示词里描述 Superpowers 工作流；当前执行仍以用户指令和项目规则为准。

## kuai-yan-fa 工程约束摘要

`kuai-yan-fa` 是真实业务校验样本。生成相关提示词或实施方案时必须重新读取当前仓库文件，但默认记住这些风险：

- 多模块 Maven / Spring Boot / Spring Cloud 项目，根路径 `/Users/mac/Desktop/one-person/kuai-yan-fa`。
- Java 8 是重要验证条件；编译时优先显式设置 `JAVA_HOME=$(/usr/libexec/java_home -v 1.8)`。
- 涉及配置/Nacos/网关/UAA/AI/ERP 时，必须从真实 `application*.yml`、`bootstrap*.yml`、deploy YAML、docker-compose、日志和当前 profile 取证。
- 不要修改 `target/classes` 编译产物，不要把密钥写进仓库。
- 业务改动要遵守 `AGENTS.md` 的最小触达、可验证交付和不回滚用户改动规则。
