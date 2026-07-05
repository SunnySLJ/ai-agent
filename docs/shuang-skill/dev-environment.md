# 开发环境与校验说明

这份文档说明维护 `shuang-skill` 本仓库时需要的运行环境。把 skills 安装到业务项目后，业务项目默认只需要 Node.js 脚本，不强制配置 Python。

## 主校验路线

日常结构校验使用 Node.js：

```bash
node scripts/agent-workbench-boundary-check.mjs
node scripts/memory-placement-check.mjs
node scripts/project-audit.test.mjs
node scripts/project-readiness.test.mjs
node scripts/project-start.test.mjs
node scripts/beginner-drill.test.mjs
node scripts/shuang-skill-manager-request.test.mjs
node scripts/skill-studio-route-smoke.mjs
node scripts/vibe-request-start.mjs --request "示例需求" --out-dir .shuang-skill/tmp-intake --force
node scripts/create-feature-intake.mjs --request "示例需求" --out-dir .shuang-skill/tmp-intake --force
node scripts/shuang-skill-manager.mjs request check --dir .shuang-skill/tmp-intake
node scripts/shuang-skill-manager.mjs request status --dir .shuang-skill/tmp-intake
node scripts/shuang-skill-manager.mjs request prompt --raw --dir .shuang-skill/tmp-intake
node scripts/shuang-skill-manager.mjs next --dir .shuang-skill/tmp-intake --json
node scripts/vibe-workflow-coverage-check.mjs
node scripts/project-readiness.mjs
node scripts/short-command-route-smoke.mjs
node scripts/managed-artifacts-check.mjs
node scripts/shuang-skill-manager-hooks.test.mjs
node scripts/shuang-skill-manager.mjs drill --request "新手演练需求" --json
node scripts/fresh-install-smoke.test.mjs
node scripts/fresh-install-smoke.mjs
node scripts/sync-back-smoke.mjs
node scripts/validate-skills.mjs
node scripts/project-doctor.mjs
```

`agent-workbench-boundary-check.mjs` 检查入口文档和关键 skill 是否把未安装的 hook、plugin、MCP、slash command 或 subagent 写成当前可用能力。`memory-placement-check.mjs` 检查入口指导文件和核心 workflow skill 是否混入一次性复盘、用户画像或本机业务路径。`project-audit.mjs` 是多项目审计入口，会检查已安装项目的 managed 文件、`project-doctor`、`validate-skills`、hook 状态和可选 `project-readiness` / `project-start` / `request prompt` / `short-command-route-smoke` 烟测；审计已安装项目的新手入口、入口卡队列和短提示词路由时使用 `node scripts/project-audit.mjs --target <project> --with-readiness --with-request-smoke --with-route-smoke`，未显式激活 managed hook 是 warning。`project-readiness.mjs` 是新手一键就绪检查，集中运行 `project-doctor`、`validate-skills` 和短提示词动态路由烟测，并输出 `drill` 演练命令和下一步 `start --request` 命令。`project-start.mjs` 是“目标项目 + 一句话需求”的总入口，会串联安装/更新、目标项目 `project-doctor`、入口卡生成、结构校验、状态汇总和提示词提取；`beginner-drill.mjs` 是新手端到端演练，会把安装/更新、readiness、`start --request`、`request prompt --raw`、`context --json` 和 `system-audit --json` 串成一个报告；`shuang-skill-manager.mjs next` 是已有入口卡后的日常续跑入口，会聚合 `request check/status/prompt` 和 `guard`，输出下一轮提示词；`shuang-skill-manager.mjs request check/status/prompt` 是 manager 级底层排查入口；`vibe-request-start.mjs` 是已安装项目里的底层需求入口；`create-feature-intake.mjs` 是底层生成器，把一句新需求转成 `docs/vibe-requests/*.md` 入口卡和可复制提示词；`vibe-request-check.mjs`、`vibe-request-status.mjs`、`vibe-request-prompt.mjs` 是 manager request wrapper 调用的低层脚本。`skill-studio-route-smoke.mjs` 启动 Skill Studio 临时 Next dev server，验证 `/`、`/library`、`/evolve/theater` 页面和主页入口链接。`vibe-workflow-coverage-check.mjs` 检查 `docs/vibe-coding-capability-matrix.md` 是否覆盖从需求到发布复盘的主线能力。`short-command-route-smoke.mjs` 用 16 条真实短提示词跑过 `vibe-request-start`，确认 stage/skill 动态路由没有漂移。`managed-artifacts-check.mjs` 检查安装脚本、目标项目自检和新项目 quickstart 是否同步。`shuang-skill-manager-request.test.mjs` 验证 manager request wrapper 和 `next` 能把入口卡队列正确转发到目标项目。`shuang-skill-manager-hooks.test.mjs` 验证本地 Git `pre-push` managed hook 的模板生成、状态、安装、备份和移除保护。`fresh-install-smoke.mjs` 在临时项目里执行一次真实安装，并验证目标 `project-doctor`、readiness、入口卡 `request prompt` 和短命令动态路由。`sync-back-smoke.mjs` 使用临时源仓库和临时目标项目验证目标项目里的 skill/note 能 dry-run 和 apply 同步回源仓库，且不会污染真实源仓库。`validate-skills.mjs` 是当前 canonical validator，负责检查 skill frontmatter、重复 name、分组索引和归档结构。新项目安装后也优先使用这条路线。

## Python 兼容路线

仓库保留 Python 3.11 + `PyYAML` 是为了兼容旧的 `skill-creator/scripts/quick_validate.py` 或外部课程工具，不是新项目的必选依赖。

本仓库约定：

```text
.python-version -> 3.11.x
requirements-dev.txt -> PyYAML
```

如果确实需要跑旧 Python validator，在本仓库根目录执行：

```bash
python3.11 -m venv .venv
.venv/bin/python -m pip install -r requirements-dev.txt
.venv/bin/python /Users/mac/.codex/skills/.system/skill-creator/scripts/quick_validate.py .codex/skills/<skill-name>
```

遇到 `ModuleNotFoundError: No module named 'yaml'` 时，修复方式是安装到项目 `.venv`，不要改全局 Python，也不要把本机解释器路径写进 skill。

## 新项目安装后的边界

通过 `scripts/shuang-skill-manager.mjs install --target <project>` 安装到业务项目后：

- 继续用 `node scripts/agent-workbench-boundary-check.mjs`、`node scripts/memory-placement-check.mjs`、`node scripts/validate-skills.mjs`、`node scripts/project-doctor.mjs` 和 `node scripts/project-audit.mjs --target . --with-readiness --with-request-smoke --with-route-smoke` 做 skill 结构、新手入口、入口卡队列与短提示词动态路由检查。
- 不要求目标项目复制 `.python-version` 或 `requirements-dev.txt`。
- 只有当目标项目自己要跑旧 Python validator 时，才按该项目自己的 Python 环境配置。

## 维护原则

- 环境事实写在 docs 或 doctor 检查里，不写进通用 `SKILL.md` 的触发规则。
- 能用 Node 脚本稳定验证的内容，优先自动化。
- Python/PyYAML 只用于兼容，不作为业务项目使用这套 skill 的前置条件。
