---
name: speckit-git
description: >-
  Use when a Spec Kit workflow needs Git helper behavior: create a numbered or timestamp feature branch, validate current branch naming, detect GitHub remote, initialize a repository with explicit authorization, or auto-commit after Spec Kit commands. Triggers include speckit-git-feature, speckit-git-validate, speckit-git-remote, speckit-git-initialize, speckit-git-commit, /speckit.git.*, feature branch, and Spec Kit Git hook.
---

# speckit-git

## Overview

Spec-Kit Git 辅助总入口。它收拢原来的 `speckit-git-*` 薄入口，但不会自动执行危险 Git 操作；先验证仓库、目标路径和用户授权，再按 action 读取 reference。

## Action Routing

| 用户目标 | action | 读取 |
|---|---|---|
| 创建 Spec-Kit feature branch | `feature` | `references/actions.md` |
| 校验当前 branch 是否匹配 feature 规范 | `validate` | `references/actions.md` |
| 读取 remote 并判断是否 GitHub | `remote` | `references/actions.md` |
| 初始化 Git 仓库 | `initialize` | `references/actions.md` |
| Spec-Kit hook 后自动提交 | `commit` | `references/actions.md` |

## Hard Guardrails

- 先运行 `git rev-parse --show-toplevel` 或 `git status` 验证当前位置是否在 Git 仓库内。
- 不在非 Git 仓库中假设 commit、branch 或 remote 可用。
- `initialize` 涉及 `git init` 和 initial commit，必须获得用户明确授权。
- 不自动 push、不 force push、不跳过 hooks。
- 只有 remote URL 明确指向 `github.com` 时，才把它当 GitHub 仓库。
- 验证失败只能报告问题，不要自动创建或切换分支。

## Reporting

每次输出：

1. 目标仓库路径。
2. 执行或跳过的 action。
3. 实际命令和关键输出。
4. 如果跳过，说明缺少 Git、非仓库、无 remote、未授权或配置禁用。
