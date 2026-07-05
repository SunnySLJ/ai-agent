# Skill Evolution Loop

Skill Studio 的 `/evolve/theater` 和 `docs/skill-evolution/inbox/` 是本项目的第 9 阶段核心：它们负责把真实任务里的经验转成可审查的 skill 改进，而不是让经验停留在聊天里。

课程资料、学习文档、Excalidraw 流程图、源码案例也可以进入这个闭环，但必须先走本地资料索引和 inbox。详细规则见 `docs/skill-evolution/course-source-ingestion.md`。

## 每轮任务后的复盘问题

任务结束后，用下面 7 个问题判断是否需要沉淀：

1. 这次有没有用户明确纠正我的工作方式？
2. 这次有没有反复出现的卡点、误判或返工？
3. 这次有没有一个以后能复用的判断规则？
4. 这次有没有一个应该写进验证步骤的命令、检查或证据？
5. 这次有没有某个 skill 的触发边界不清？
6. 这次有没有某个 skill 太长、太散、太容易误触发？
7. 这次有没有能让用户更接近“自己的 Vibe Coding 方法”的偏好？

如果答案里有 2 个以上为“是”，写一条 evolution note。

## Evolution Note 格式

文件位置：

```text
docs/skill-evolution/inbox/YYYY-MM-DD-<topic>.md
```

模板：

```markdown
# <topic> Evolution Note

## Context

- Task:
- Project:
- Related skill:
- Source evidence:

## Signal

- What happened:
- User preference:
- Failure or friction:

## Reusable Rule

Write the future-facing rule in imperative form.

## Target

- Update skill:
- Update reference:
- Update docs:
- No update yet:

## Proposed Diff

Describe the exact change before editing any `SKILL.md`.

## Validation

- Structural check:
- Example trigger:
- Example non-trigger:
```

## 升级路径

1. 先写 inbox note，不直接改 skill。
2. 跑 inbox 状态报告，找出草稿缺口和 ready 候选：
   ```bash
   node scripts/evolution-inbox-status.mjs --limit 8
   node scripts/evolution-review.mjs
   ```
3. 判断是否满足长期化标准。
4. 如果适合，更新目标 `SKILL.md` 或 `references/`。
5. 跑结构检查：skill 数量、重复 name、frontmatter。
6. 更新 `docs/skill-consolidation-plan.md` 的状态。

如果复盘来自“一句话新需求”入口，先保留 `docs/vibe-requests/*.md` 作为原始短需求证据。生成入口卡和提示词可用：

```bash
node scripts/shuang-skill-manager.mjs start --request "<一句话需求>"
node scripts/shuang-skill-manager.mjs request prompt --raw
```

## Inbox 状态报告

查看当前候选：

```bash
node scripts/evolution-inbox-status.mjs
```

机器可读输出：

```bash
node scripts/evolution-inbox-status.mjs --json --limit 5
```

批量整理报告：

```bash
node scripts/evolution-review.mjs
node scripts/evolution-review.mjs --json
```

`evolution-review` 在状态报告之上增加 5 个队列：

- `promoteCandidates`：ready 且适合进入候选升级包的 note。
- `draftFixes`：缺 Context、Signal、Reusable Rule 或触发边界的草稿。
- `closeCandidates`：一次性业务事实、临时路径或不适合长期化的 note，建议标为 `parked`。
- `parkedRevisit`：已停放，只有再次出现真实任务证据时才重启。
- `promotedEvidenceGaps`：已 promoted 但缺 `Promoted by` 或 `Evidence` 的 note。

状态含义：

- `draft`：note 还有占位内容或缺少触发/验证信息，先补齐再升级。
- `ready`：note 已具备升级判断的基本信息，可进入长期化评估。
- `parked`：note 有价值但证据不足、等待另一个真实任务验证，暂时不进入升级优先队列。
- `promoted`：note 的可复用规则已经落地到 skill、reference、docs 或脚本，并已完成验证。

这个工具只做队列盘点，不自动修改 `SKILL.md`。

已处理 note 在末尾追加生命周期：

```markdown
## Lifecycle

- Status: promoted
- Promoted by: `<commit-or-change-ref>`
- Evidence: <验证命令或落地说明>
```

暂缓升级时使用 `Status: parked`，并写清需要等待的证据。

## 课程资料接入

本机私有资料路径放在：

```text
.shuang-skill/course-sources.local.json
```

盘点命令：

```bash
node scripts/course-source-health.mjs
```

```bash
node scripts/course-source-inventory.mjs
```

本机私有摘要命令：

```bash
node scripts/course-local-extract.mjs --sources "<source-id,source-id>"
```

从私有摘要批量生成主题 note：

```bash
node scripts/course-extract-to-notes.mjs --dry-run
node scripts/course-extract-to-notes.mjs
```

主题 note 命令：

```bash
node scripts/create-course-evolution-note.mjs \
  --theme "<topic>" \
  --sources "<source-id,source-id>" \
  --targets "<skill,skill>" \
  --rule "<future-facing reusable rule>"
```

只把原创总结写进 skill；不要提交课程原文、PDF 正文、截图、zip、模型文件或大段摘录。

## 长期化标准

满足至少两条才升级：

- 未来同类问题很可能再次出现。
- 有明确触发句式。
- 能转成步骤、检查表或验证命令。
- 能降低返工、误触发或范围漂移。
- 用户明确表达这是长期偏好。

## 不升级的内容

- 一次性业务事实。
- 只对某个临时文件有效的信息。
- 未验证猜测。
- 和现有规则冲突但还没有裁决的内容。
