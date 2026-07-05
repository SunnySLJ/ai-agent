---
name: shuang-prototype-to-next
description: >-
  中文：从已采集的网页原型资产（截图、HTML、structure.json、交互 state.json）重建一个新的 Next.js App Router 前端网站。
  English: Rebuild a new Next.js App Router frontend from captured web prototype assets including screenshots, HTML, DOM structures, and interaction states.
---

# shuang-prototype-to-next · 原型采集资产到 Next.js 网站重建

## 这个 skill 解决什么

当用户已经有一批网页原型采集资产，并希望“重新建立一个 Next 项目”“把原型页面都开发成前端网站”“包括页面交互”时，使用本 skill。

它不是单张截图复刻，也不是 Vite/Figma Make 项目迁移；它处理的是这类输入：

- 页面截图：`screenshot.png` / `viewport.png` / `fullpage.png`
- 页面结构：`structure.json`
- 页面 HTML：`page.html`
- 交互状态：`state.json`
- 页面清单：CSV / manifest / coverage report

目标是把这些资产转译成一个可维护的 Next.js App Router 前端项目：有路由、有组件系统、有数据配置、有真实前端交互、有验证闭环。

## 什么时候使用

触发语句示例：

- “重新建一个 Next 项目，把这些原型页面都开发出来。”
- “把刚采集的页面原型做成前端网站。”
- “重点页面和交互都按截图实现。”
- “不要继续改旧项目，另起一个 Next app。”
- “根据 `page-captures` 和 `focus-interaction-states-dedup` 开发网站。”

不要在这些场景使用本 skill：

- 用户只要改当前 `shuang-video` 某个页面：用 `shuang-next` 或 `shuang-web-design-master`。
- 用户给的是 Vite/React Router 源码项目：用 `figma-to-nextjs-migration`。
- 用户只是要前端测试收尾：用 `shuang-frontend`。

## 当前项目推荐输入资产

本项目已采集的推荐资产位置：

```text
shuang-design/13-public-prototype-recapture-2026-06-10/
  page-captures/
  focus-interaction-states-dedup/
  validation/coverage-report.md
  focus-pages.csv
```

推荐优先使用：

- 全量页面截图：`page-captures/`
- 重点页面真实交互：`focus-interaction-states-dedup/`
- 覆盖报告：`validation/coverage-report.md`
- 重点页面清单：`focus-pages.csv`

不建议优先使用：

- `focus-interaction-states-full/`：旧版深扫，可能含大量重复截图。
- `focus-interaction-states-dedup-smoke/`：只用于 smoke test。
- `interaction-states/`：全量交互曾中途停止，只作为补充参考。

## HARD-GATE

1. **必须确认目标路径**：新 Next 项目路径不能猜。可建议：

   ```text
   shuang-prototype-next
   ```

2. **不要覆盖现有 `shuang-video`**，除非用户明确要求。
3. **不要把竞品品牌原样带入最终产品 UI**。默认将 Pollo 相关品牌替换为项目品牌，例如 Dream / 梦影 / DreamFilm；如果用户明确要求做竞品镜像或内部参考，可保留在开发资产说明中，但最终 UI 需确认。
4. **不要直接把截图当网页铺上去**。截图只作为视觉参考；实现必须是 HTML/CSS/React 组件。
5. **不要一次手写 141 个页面**。必须先模板化，再由数据配置驱动长尾页面。
6. **交互只实现前端状态**，除非用户另行要求后端/API。生成、支付、登录、下载等高风险动作默认做 mock 或禁用。
7. **所有开发阶段必须验证**：typecheck、build、dev server、关键页面浏览器检查。

## 推荐技术栈

默认新项目：

- Next.js App Router
- TypeScript
- React client components for interactive parts
- CSS Modules 或 scoped global CSS
- 本地 mock data
- 不先引入复杂 UI 库
- 如需要图标，优先 `lucide-react`

推荐目录：

```text
shuang-prototype-next/
  package.json
  next.config.ts
  tsconfig.json
  src/
    app/
      layout.tsx
      page.tsx
      pricing/page.tsx
      api-platform/page.tsx
      ai-video/page.tsx
      ai-video-editor/page.tsx
      text-to-video/page.tsx
      app/
        narrative-music-video/page.tsx
        ai-celebrity-video-generator/page.tsx
    components/
      shell/
      navigation/
      marketing/
      composer/
      pricing/
      interactions/
    data/
      pages.ts
      navigation.ts
      pricing.ts
      faq.ts
    styles/
      globals.css
      tokens.css
```

## 总体工作流

### Step 1 · 资产盘点

必须先读取/统计：

- `validation/coverage-report.md`
- `focus-pages.csv`
- `page-captures/*/structure.json`
- `focus-interaction-states-dedup/*/*/interaction-inventory.json`
- 若需要视觉细节，再读取对应 `state.json` 和截图。

输出一个短盘点：

- 可用页面总数。
- 重点页面列表。
- 每个重点页面有多少真实交互状态。
- 哪些页面只有静态截图，交互为 0。
- 哪些旧目录不建议使用。

### Step 2 · 路由和模板规划

必须先把页面分模板，不要逐页硬写。

推荐模板：

| 模板 | 用途 |
|---|---|
| `HomeTemplate` | 首页 / public landing |
| `PricingTemplate` | 价格页 |
| `ApiPlatformTemplate` | API 平台页 |
| `VideoToolTemplate` | AI 视频、文生视频、视频编辑器 |
| `AppWorkflowTemplate` | narrative music video、celebrity video、UGC、ad generator 等工作流页 |
| `HubTemplate` | 聚合页 / 分类页 |
| `ModelPageTemplate` | 模型介绍页 |

重点页面第一批建议：

```text
/
/pricing
/api-platform
/ai-video
/ai-video-editor
/text-to-video
/app/narrative-music-video
/app/ai-celebrity-video-generator
```

长尾页面第二批再通过 `data/pages.ts` 配置生成。

### Step 3 · 组件系统设计

先建共享组件，再落页面。

基础组件：

- `AppShell`
- `SiteHeader`
- `MobileMenu`
- `Footer`
- `Button`
- `Badge`
- `SectionShell`

营销组件：

- `HeroComposer`
- `ToolTabs`
- `FeatureGrid`
- `WorkflowSteps`
- `ModelGrid`
- `ShowcaseCards`
- `FaqAccordion`
- `PricingCards`
- `ApiCapabilityGrid`

交互组件：

- `DropdownMenu`
- `MegaMenu`
- `Tabs`
- `Accordion`
- `Modal`
- `Popover`
- `SegmentedControl`
- `ComposerModeSwitch`

### Step 4 · 视觉语言抽取

从截图和 structure 提取：

- 背景色
- 面板色
- 边框色
- 主文字 / 次文字 / 弱文字
- accent 渐变
- 圆角档
- 阴影档
- spacing scale
- 最大内容宽度
- header 高度
- mobile breakpoint

这些值落到 token：

```css
:root {
  --bg: #08080b;
  --surface: rgba(255,255,255,0.06);
  --border: rgba(255,255,255,0.1);
  --text: #fff;
  --muted: rgba(255,255,255,0.64);
  --accent: #ff3f73;
}
```

不要把所有视觉值散落在页面 CSS 里。

### Step 5 · 交互还原规则

只实现“真实页面内状态变化”的交互，优先参考 `focus-interaction-states-dedup`。

必须优先实现：

- desktop nav dropdown / mega menu
- mobile hamburger menu
- FAQ accordion
- tab 切换
- pricing toggle
- composer mode switch
- model/tool dropdown
- popover/modal
- 页面内锚点滚动

默认不实现真实动作：

- 生成
- 支付
- 订阅
- 下载
- 登录/退出
- 删除
- 外部跳转

这些动作用 mock 状态替代：

- toast
- disabled state
- “即将开放”提示
- modal preview

### Step 6 · 页面开发顺序

推荐顺序：

1. 项目脚手架 + tokens + shell。
2. 首页 `/`。
3. `SiteHeader` + desktop/mobile nav 交互。
4. `PricingTemplate`。
5. `ApiPlatformTemplate`。
6. `VideoToolTemplate`，覆盖 `/ai-video`、`/ai-video-editor`、`/text-to-video`。
7. `AppWorkflowTemplate`，覆盖两个代表性 app 页面。
8. 抽出 `data/pages.ts`，再批量补长尾页面。
9. Playwright 或浏览器手动检查重点页面。

### Step 7 · 验证标准

每个阶段至少运行：

```bash
npm run typecheck
npm run build
```

如果项目 package script 不同，以目标项目 `package.json` 为准。

UI 阶段必须打开浏览器检查：

- `/`
- `/pricing`
- `/api-platform`
- `/ai-video`
- `/ai-video-editor`
- `/text-to-video`
- `/app/narrative-music-video`
- `/app/ai-celebrity-video-generator`

交互检查：

- desktop header dropdown
- mobile menu
- FAQ accordion
- tab 切换
- composer mode switch
- pricing toggle
- modal/popover 是否被裁切
- 页面没有横向滚动
- console 无 hydration mismatch

## 输出文档要求

如果用户要求“说明文档也写好”，必须至少生成：

```text
shuang-prototype-next/docs/prototype-implementation-plan.md
```

内容包括：

1. 原型资产来源。
2. 页面范围与优先级。
3. 路由表。
4. 模板划分。
5. 组件清单。
6. 交互清单。
7. 品牌替换规则。
8. 不实现/只 mock 的功能。
9. 验证方式。
10. 分阶段交付计划。

不要只写“README”；README 用于项目启动说明，implementation plan 用于开发施工。

## 施工计划模板

```markdown
# Prototype to Next Implementation Plan

## 1. 原型资产来源
- 页面截图目录：...
- 交互状态目录：...
- 覆盖报告：...

## 2. 第一批页面范围
| 优先级 | 路由 | 模板 | 原型来源 | 交互状态数 |
|---|---|---|---|---:|

## 3. 模板系统
- HomeTemplate
- PricingTemplate
- ApiPlatformTemplate
- VideoToolTemplate
- AppWorkflowTemplate

## 4. 组件系统
...

## 5. 交互实现
| 交互 | 组件 | 来源 state | 实现方式 |
|---|---|---|---|

## 6. 品牌和内容替换
...

## 7. Mock 边界
...

## 8. 验证
...

## 9. 阶段计划
...
```

## 常见坑

- 把 `focus-interaction-states-full` 当最终资产，导致重复图很多。
- 把普通链接点击当作“交互状态”，生成一堆看起来一样的页面。
- 登录后账号菜单、升级、额度、推荐有礼混入公开站点 UI。
- 直接复制竞品品牌名到最终项目。
- 141 个页面逐页写 JSX，后续无法维护。
- 只看 desktop，不做 mobile menu。
- 截图看起来像，但没有真实交互状态。
- build 过了就说完成，但没有浏览器检查。

## 与其它 skill 的关系

- `shuang-web-design-master`：用于单页视觉细节复刻。本 skill 负责批量资产到新 Next 项目的总体流水线。
- `shuang-next`：用于在现有 `shuang-video` 中按截图改页面。本 skill 允许新建独立 Next 项目。
- `figma-to-nextjs-migration`：用于源码型原型迁移。本 skill 用于截图/HTML/JSON 采集资产转实现。
- `shuang-frontend`：用于实现后的前端验证闭环。
- `shuang-router`：用于更大功能完成后的测试缺口路由。

## 完成定义

第一阶段完成：

- 新 Next 项目可启动。
- 重点 8 个页面路由存在。
- 共享 shell/header/footer 完成。
- 至少首页、价格页、API 页面达到可看状态。
- typecheck/build 通过。

第二阶段完成：

- 重点 8 个页面视觉和内容基本对齐原型。
- 重点交互完成。
- desktop/mobile 均可用。
- 浏览器检查无明显布局破坏。

第三阶段完成：

- 长尾页面模板化配置完成。
- 页面数据从 `data/pages.ts` 驱动。
- 验证报告更新。
