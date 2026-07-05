# Spec-Kit Git Actions

所有 action 先遵守 `speckit-git/SKILL.md` 的 guardrails。

## `feature`

创建并切换到新的 Spec-Kit feature branch。spec 目录和文件仍由 core `/speckit.specify` 流程创建。

1. 如果用户明确提供 `GIT_BRANCH_NAME`，原样传给脚本。
2. 读取 `.specify/extensions/git/git-config.yml` 或 `.specify/init-options.json` 的 `branch_numbering`；默认 `sequential`。
3. 从 feature 描述生成 2-4 个词的 short name，例如 `add-user-auth`。
4. Bash:

```bash
.specify/extensions/git/scripts/bash/create-new-feature.sh --json --short-name "<short-name>" "<feature description>"
```

timestamp 模式加 `--timestamp`。不要传 `--number`，脚本自己决定编号。每个 feature 只运行一次。

## `validate`

校验当前 branch：

```bash
git rev-parse --abbrev-ref HEAD
```

允许格式：

- `^[0-9]{3,}-`，例如 `001-feature-name`。
- `^[0-9]{8}-[0-9]{6}-`，例如 `20260319-143022-feature-name`。

如果匹配，再检查 `specs/<prefix>-*` 是否存在；缺失只报告，不自动创建。

## `remote`

读取 remote：

```bash
git config --get remote.origin.url
```

只支持明确的 GitHub URL：

- `https://github.com/<owner>/<repo>.git`
- `git@github.com:<owner>/<repo>.git`

不能因为 URL 像 Git 远程就假设是 GitHub。

## `initialize`

只有用户明确授权时才可执行。优先使用 Spec-Kit 脚本：

```bash
.specify/extensions/git/scripts/bash/initialize-repo.sh
```

如果脚本不存在，回退命令也必须先确认授权：

```bash
git init && git add . && git commit -m "Initial commit from Specify template"
```

已经在 Git 仓库内时跳过。

## `commit`

用于 Spec-Kit hook 后自动提交。先读取 `.specify/extensions/git/git-config.yml` 的 `auto_commit` 配置；无配置默认禁用。

Bash:

```bash
.specify/extensions/git/scripts/bash/auto-commit.sh <event_name>
```

`<event_name>` 来自 hook，例如 `after_specify`、`before_plan`、`after_implement`。

即使 auto-commit 开启，也不能自动 push、force push、跳过 hooks 或提交用户未授权范围外的内容。
