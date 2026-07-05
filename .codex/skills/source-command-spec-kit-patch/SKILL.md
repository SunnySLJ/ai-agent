---
name: "source-command-spec-kit-patch"
description: "把 shuang-open-design 项目约束追加写入 SpecKit 宪法"
---

# source-command-spec-kit-patch

Use this skill when the user asks to run the migrated source command `spec-kit-patch`.

## Command Template

# /spec-kit-patch — 注入 shuang-open-design 项目约束

你是帮用户给项目补充 SpecKit 宪法约束的向导。目标是把当前项目的三条底层规则追加写入 `.specify/memory/constitution.md`，让后续 SpecKit 流程对齐这些规则。

## 先对用户说一句

> 我会把 shuang-open-design 的三条底层约束追加进 SpecKit 宪法：先规范再实现、先读 Open Design 原型再判断、视觉默认参考 shuang-figma。整个过程只追加、不覆盖，并先备份原文件。

## 执行步骤

### 第 1 步：检查 SpecKit 是否已初始化

用 Read 工具读取：

```text
.specify/memory/constitution.md
```

如果文件不存在，停止并提示：

```text
这个项目还没有 .specify/memory/constitution.md，说明 SpecKit 宪法还没初始化。
请先运行 /speckit-constitution 生成初始宪法，或确认你要先初始化 SpecKit，再回来运行 /spec-kit-patch。
我不会在这里擅自创建 constitution.md，避免覆盖你的项目约束。
```

如果能读到，继续下一步。

可以顺手检查 `.styleseed/rules.md` 是否存在，但它只是可选参考；不存在也不能报错或停止。

### 第 2 步：先备份，再追加

只追加，绝不覆盖。

先运行：

```bash
cp .specify/memory/constitution.md .specify/memory/constitution.backup.md
```

然后用 Edit 工具把下面内容追加到文件末尾；不要用 Write 重写整个 constitution。

```markdown

---

# shuang-open-design 三条项目约束（由 /spec-kit-patch 注入）

本段落定义 shuang-open-design 项目的底层协作规则。后续使用 SpecKit、Open Design、Figma/原型迁移或 shuang-video 实现时，必须优先对齐这些约束。

## 第一条：SpecKit 业务约束

### 原则 1：Spec First（先规范，后代码）

涉及新功能、结构性修改、多文件改动或不明确需求时，先通过 SpecKit 明确用户故事、验收标准、约束和边界，再进入实现。

### 原则 2：Plan Before Implement（先计划，后动手）

实现前要先形成技术计划，明确会修改哪些文件、为什么改、如何验证。禁止在需求不清或目标路径不明时直接写代码。

### 原则 3：Quality Gate（质量闸门）

进入实现前应检查需求歧义、验收标准、测试方式和风险。没有通过检查时，先澄清，不硬做。

## 第二条：Open Design / 原型约束

### 原则 1：先读当前设计，再做判断

涉及页面、视觉、交互、文案或原型时，优先通过 Open Design artifact/MCP 工具读取当前项目和当前文件。不要凭记忆或过往 AgentHub 示例猜测页面结构。

### 原则 2：文档与说明默认中文

设计 brief、规格、计划、验收说明、迁移记录默认使用中文；只有用户明确要求英文时才切换。

### 原则 3：区分 Open Design 与 shuang-video

shuang-open-design 根目录不是单一 Next.js app。Open Design artifact、vendor/open-design、MCP 资源和 shuang-video 应分开判断；不要把 API route、app 目录或 package.json 默认写到根目录。

## 第三条：视觉与 Figma 约束

### 原则 1：视觉基准优先参考 shuang-figma

涉及视觉风格、组件布局、颜色、动效或原型还原时，优先参考 `/Users/mac/Desktop/vibe-coding/shuang-figma`，不要照搬 AgentHub 的产品语境。

### 原则 2：Figma/原型迁移要工程化落位

Figma Make、v0.dev、Bolt、Lovable 等产物是视觉原型，不是生产脚手架。迁移到 shuang-video 或其他 Next.js app 前，要先确认源路径、目标 app 路径、现有文件和验证方式。

### 原则 3：设计变量与代码语义要对齐

颜色、间距、字体、状态和组件语义应尽量通过设计 token、Tailwind theme 或现有设计系统表达。避免把一次性硬编码样式扩散到多个文件。

---

（shuang-open-design 项目约束注入结束。如需回滚，请查看 `.specify/memory/constitution.backup.md`。）
```

### 第 3 步：确认追加成功

追加后用 Read 工具重新读取 `.specify/memory/constitution.md`，确认：

1. 原内容仍在。
2. 新段落完整出现在末尾。
3. 没有把 `.styleseed/rules.md` 当成必需文件。
4. 没有假设当前根目录是 Git 仓库。

### 第 4 步：给用户报告

用中文简短报告：

```text
/spec-kit-patch 完成：
- 已备份 .specify/memory/constitution.md 到 .specify/memory/constitution.backup.md
- 已追加 SpecKit 业务约束
- 已追加 Open Design / 原型约束
- 已追加 shuang-figma 视觉基准约束

如需回滚：cp .specify/memory/constitution.backup.md .specify/memory/constitution.md
```

不要额外闲聊。

## 执行铁律

1. 只追加，绝不覆盖 constitution。
2. 先备份，再动手。
3. 读不到 constitution 就停。
4. `.styleseed/rules.md` 是可选参考，不存在也继续。
5. 不假设 shuang-open-design 根目录是 Git 仓库。
6. 全程中文输出。
