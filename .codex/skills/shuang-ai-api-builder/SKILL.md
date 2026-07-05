---
name: shuang-ai-api-builder
description: >-
  Use when designing structured AI output, Zod schemas, Next.js/Vercel AI SDK streaming API routes, useObject/useChat consumption, or environment-variable validation for AI/API features. Triggers include schema-design, stream-api-route, zod-env, AI output schema, streamObject, .env.example, process.env, OpenRouter, OpenAI, Anthropic, and provider configuration.
---

# shuang-ai-api-builder

## Overview

统一处理 AI API 工程里的三类常见小任务：输出结构、流式 route、环境变量校验。先判断任务类型，再只读取对应 reference，避免把 schema、route、env 三套细节同时塞进上下文。

## Route The Request

| 用户目标 | 读取 |
|---|---|
| 设计 AI 输出结构、Zod schema、JSON object、前端可消费字段 | `references/schema-design.md` |
| 生成 Next.js App Router 流式 AI API、`streamObject`、`useObject` / `useChat` 消费 | `references/stream-api-route.md` |
| 建立 `.env.example`、`src/env.ts`、`process.env` 扫描、server/client env 分层 | `references/zod-env.md` |

`source-command-spec-kit-patch` 不属于 AI API 工具；用户要注入 Spec-Kit constitution 约束时，使用 `source-command-spec-kit-patch` 或 Spec-Kit 分组，不走本 skill。

## Shared Guardrails

- 先确认目标项目路径。不要把当前工作区根目录假设成 Next.js app。
- 写文件前读取现有 `package.json`、`app/` 或 `src/app/`、`.env.example` 和相关配置。
- 不读取、打印、提交或复述真实 secret；`.env.example` 只写占位值。
- 如果用户只要方案，输出 schema / route / env 建议即可，不改文件。
- 涉及 UI 消费时，前端状态至少覆盖 loading、error、empty 和 partial streaming。

## Output Contract

每次完成后给出：

1. 改动或方案文件路径。
2. 采用的 schema / route / env 分层假设。
3. 已运行的验证命令，或说明为什么未运行。
4. 仍需用户确认的 provider、key 名称、部署 runtime 或目标 app 路径。
