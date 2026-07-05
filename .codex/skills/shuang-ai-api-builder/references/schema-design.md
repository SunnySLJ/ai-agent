# AI 输出结构设计

用于设计能被前端、数据库、API 或下游程序稳定消费的 AI 输出结构。

## 何时需要 schema

任一为“是”就设计结构化 schema：

- 输出会显示在网页组件里。
- 输出会存进数据库或文件。
- 输出会被其他程序继续处理。
- 输出需要稳定字段、枚举、数量、顺序或类型。

全部为“否”时，建议自然语言输出即可。

## 上下文收集

信息不足时只问必要问题：

- 服务于 Open Design artifact、Next.js app、API、数据库，还是脚本？
- 输出对象包含哪些字段？字段数量、长度、枚举范围是什么？
- 是否需要流式消费？需要时搭配 `references/stream-api-route.md`。

## 输出四件套

1. **Zod schema**
   - 每个字段带中文 `.describe()`。
   - 能枚举就用 `z.enum([...])`。
   - 数组必须有 `.min()` / `.max()`。
   - 字符串按业务需要加 `.min()` / `.max()` / `.url()` / `.datetime()`。
   - 核心字段不要随手 `.optional()`。
   - 给 `.parse()` 和 `.safeParse()` 示例。

2. **AI 生成提示词**
   - 明确“严格遵守以下 schema”。
   - 给字段结构和约束的人类可读说明。
   - 要求“不要返回纯文本，所有内容必须放进 schema 对应字段”。

3. **消费方式**
   - Open Design artifact：说明字段如何映射到 HTML/JS/CSS、组件状态或 artifact metadata。
   - Next.js：按项目现有模式给 React 组件、server action、API route 或 `useObject` 示例。
   - 数据库：给入库前校验和字段映射。
   - 普通脚本：给 `safeParse` 错误处理。

4. **判断力检查**
   - 用“原来怎么写 -> 更好怎么写 -> 为什么更好”检查枚举、数组上下限、文本长度、URL、日期、数字范围、嵌套对象和可选字段。

## 项目约束

- 只有确认目标是 Next.js app 时，才输出 Next.js / Vercel AI SDK 消费代码。
- 不读取或输出真实密钥；环境变量只给字段名和占位值。
- 涉及视觉、原型、页面数据结构时，先读取当前项目或用户指定 artifact，再给字段映射。
