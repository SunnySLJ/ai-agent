#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const root = process.cwd();

const ROUTES = {
  intake: {
    skill: "shuang-flow",
    next: "按阶段路由到 brainstorm / prd / specs / tdd / handoff",
    stop: "目标跨阶段、风险边界或必读文件不清时停下来确认。",
    validation: "node scripts/short-command-route-check.mjs",
  },
  brainstorm: {
    skill: "shuang-brainstorm",
    next: "shuang-prd",
    stop: "目标用户、MVP、非目标或验收标准未确认时停。",
    validation: "node scripts/project-doctor.mjs",
  },
  research: {
    skill: "shuang-research",
    next: "shuang-prd / shuang-arch",
    stop: "证据不足或路线分歧时停。",
    validation: "node scripts/project-doctor.mjs",
  },
  prd: {
    skill: "shuang-prd",
    next: "shuang-specs",
    stop: "Must-have 范围未确认时停。",
    validation: "node scripts/project-doctor.mjs",
  },
  arch: {
    skill: "shuang-arch",
    next: "shuang-design / shuang-specs",
    stop: "架构基线或选型责任边界未确认时停。",
    validation: "node scripts/project-doctor.mjs",
  },
  design: {
    skill: "shuang-design",
    next: "shuang-specs / shuang-next",
    stop: "视觉、交互或设计系统方向未确认时停。",
    validation: "node scripts/project-doctor.mjs",
  },
  specs: {
    skill: "shuang-specs",
    next: "shuang-tdd",
    stop: "spec/plan/tasks 不一致或 tasks 粒度不适合 TDD 时停。",
    validation: "node scripts/spec-kit-handoff-check.mjs --feature <feature-dir>",
  },
  implement: {
    skill: "shuang-tdd",
    next: "shuang-router",
    stop: "测试、review 或 feature 文档约束未通过时停。",
    validation: "node scripts/spec-kit-handoff-check.mjs --feature <feature-dir>",
  },
  test: {
    skill: "shuang-router",
    next: "shuang-backend / shuang-frontend / shuang-slice / shuang-chain",
    stop: "发布风险、真实链路或回归证据未收敛时停。",
    validation: "node scripts/project-doctor.mjs",
  },
  "api-handoff": {
    skill: "shuang-api-handoff",
    next: "shuang-slice",
    stop: "前端可调用接口、字段示例、代码顺序或 OpenAPI 缺失时停。",
    validation: "node scripts/api-handoff-artifact-check.mjs --doc <handoff.md> --openapi <openapi.json>",
  },
  "code-handoff": {
    skill: "shuang-code-handoff",
    next: "shuang-prompt / shuang-evolve",
    stop: "文件、方法行号、调用顺序或验证证据缺失时停。",
    validation: "node scripts/project-doctor.mjs",
  },
  prompt: {
    skill: "shuang-prompt",
    next: "目标 AI 执行",
    stop: "目标 AI、当前阶段、必读文件或验证要求不可判断时停。",
    validation: "node scripts/project-doctor.mjs",
  },
  "release-readiness": {
    skill: "shuang-router",
    next: "shuang-prompt / shuang-evolve",
    stop: "发布门、回滚方案或剩余风险未确认时停。",
    validation: "node scripts/project-doctor.mjs",
  },
  evolve: {
    skill: "shuang-evolve",
    next: "node scripts/validate-skills.mjs",
    stop: "长期化标准未满足、证据不足或可能污染通用 skill 时停。",
    validation: "node scripts/evolution-inbox-status.mjs --limit 8",
  },
  course: {
    skill: "shuang-evolve",
    next: "node scripts/course-source-health.mjs / node scripts/course-source-inventory.mjs",
    stop: "课程原文、私有路径、截图、PDF 正文或敏感信息可能进入公开仓库时停。",
    validation: "node scripts/course-source-health.mjs",
  },
  "install-sync": {
    skill: "shuang-evolve",
    next: "node scripts/project-readiness.mjs / node scripts/project-audit.mjs --target <project> --with-readiness --with-request-smoke --with-route-smoke",
    stop: "目标项目路径、安装源、回流方向或 hook 激活策略不明确时停。",
    validation: "node scripts/project-readiness.mjs",
  },
};

const STAGE_ALIASES = {
  requirement: "brainstorm",
  architecture: "arch",
  "spec-kit": "specs",
  implementation: "implement",
  testing: "test",
  "prompt-handoff": "prompt",
  evolution: "evolve",
  "course-ingestion": "course",
};

const report = {
  status: "pass",
  file: null,
  stage: null,
  skill: null,
  blockers: [],
  warnings: [],
};

try {
  if (args.help === "true") {
    printHelp();
    process.exit(0);
  }

  if (!args.request) report.blockers.push("--request is required");
  if (report.blockers.length) finish();

  const title = args.title || summarizeTitle(args.request);
  const stage = normalizeStage(args.stage) || inferStage(args.request);
  const route = ROUTES[stage] || ROUTES.intake;
  const date = args.date || new Date().toISOString().slice(0, 10);
  const outDir = path.resolve(root, args["out-dir"] || path.join("docs", "vibe-requests"));
  const file = path.join(outDir, `${date}-${slugify(title)}.md`);

  report.stage = stage;
  report.skill = route.skill;
  report.file = path.relative(root, file);

  if (fs.existsSync(file) && args.force !== "true") {
    report.blockers.push("intake file already exists; pass --force to overwrite");
    finish();
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(file, renderIntake({ title, request: args.request, stage, route, date }), "utf8");
} catch (error) {
  report.blockers.push(error.message);
}

finish();

function renderIntake({ title, request, stage, route, date }) {
  const targetAi = args["target-ai"] || "Codex";
  return `# ${title}

Date: ${date}
Target AI: ${targetAi}

## 原始短需求

${request}

## 短命令意图卡

| 字段 | 内容 |
|---|---|
| 原话 | ${request} |
| 推断阶段 | \`${stage}\` |
| 推荐入口 skill | \`${route.skill}\` |
| 下一触发 | ${route.next} |
| 停止点 | ${route.stop} |

## 必读入口

- \`AGENTS.md\` / \`CLAUDE.md\`
- \`docs/vibe-coding-operating-map.md\`
- \`docs/shuang-skill/vibe-coding-capability-matrix.md\`
- \`docs/shuang-skill/short-command-routes.md\`
- 当前项目真实 README、package/build 配置、已有 \`specs/\` 或业务文档

## 给 Agent 的可复制提示词

\`\`\`text
请使用 ${route.skill} 判断当前阶段并处理下面这个需求。先读取当前项目真实 AGENTS.md / CLAUDE.md、README、docs、specs 和相关代码，再给出推荐路线。

原始需求：
${request}

要求：
- 先输出当前阶段、推荐路线、必读文件和停止点。
- 不要要求我一次性补长提示词；只追问会阻塞产品方向、架构、安全、外部依赖或验收的问题。
- 如果信息足够，按 Vibe Coding 流程推进到下一阶段产物。
- 如果要实现代码，先确认 feature 文档或最小施工 spec，再按 TDD 和项目验证命令执行。
- 完成后给出真实验证证据，并判断是否需要 shuang-evolve 复盘升级 skill。
\`\`\`

## 验证命令

\`\`\`bash
${route.validation}
\`\`\`

如果修改了短命令路线或能力矩阵，再运行：

\`\`\`bash
node scripts/short-command-route-check.mjs
node scripts/short-command-route-smoke.mjs
node scripts/vibe-workflow-coverage-check.mjs
\`\`\`
`;
}

function inferStage(request) {
  const text = String(request).toLowerCase();
  if (/(接口|api|apifox|联调|openapi)/i.test(text)) return "api-handoff";
  if (/(代码链路|方法|调用链|在哪个方法|可跳转)/i.test(text)) return "code-handoff";
  if (/(提示词|prompt|交给.*ai|handoff)/i.test(text)) return "prompt";
  if (/(安装.*skill|skill.*安装|同步.*skill|审计.*项目|确认.*能用|真的能用)/i.test(text)) return "install-sync";
  if (/(课程|课件|学习资料|资料源|pdf|notebook)/i.test(text)) return "course";
  if (/(复盘|沉淀|升级.*skill|进化)/i.test(text)) return "evolve";
  if (/(上线|发布|release|回滚)/i.test(text)) return "release-readiness";
  if (/(测试|回归|e2e|闭环|验收)/i.test(text)) return "test";
  if (/(spec|tasks|plan|拆.*feature|任务拆分)/i.test(text)) return "specs";
  if (/(实现|开发.*feature|修复|bug|重构)/i.test(text)) return "implement";
  if (/(设计|ui|figma|页面|原型|视觉)/i.test(text)) return "design";
  if (/(架构|选型|fork|开源|技术方案)/i.test(text)) return "arch";
  if (/(prd|需求文档|产品需求)/i.test(text)) return "prd";
  if (/(调研|竞品|可行性|资料)/i.test(text)) return "research";
  if (/(想法|mvp)/i.test(text)) return "brainstorm";
  return "intake";
}

function normalizeStage(stage) {
  if (!stage || stage === "auto") return null;
  const normalized = STAGE_ALIASES[String(stage).trim()] || String(stage).trim();
  if (ROUTES[normalized]) return normalized;
  report.warnings.push(`unknown stage: ${stage}; fallback to intake`);
  return "intake";
}

function summarizeTitle(request) {
  return String(request)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 32) || "new-feature";
}

function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "new-feature";
}

function finish() {
  report.status = report.blockers.length ? "fail" : "pass";
  if (args.json === "true") {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printMarkdown(report);
  }
  process.exit(report.blockers.length ? 1 : 0);
}

function printMarkdown(out) {
  console.log("# Feature Intake");
  console.log("");
  console.log(`- Status: ${out.status}`);
  if (out.file) console.log(`- File: \`${out.file}\``);
  if (out.stage) console.log(`- Stage: \`${out.stage}\``);
  if (out.skill) console.log(`- Skill: \`${out.skill}\``);
  console.log("");
  console.log("## Blockers");
  console.log("");
  if (out.blockers.length) {
    for (const blocker of out.blockers) console.log(`- ${blocker}`);
  } else {
    console.log("- none");
  }
  console.log("");
  console.log("## Warnings");
  console.log("");
  if (out.warnings.length) {
    for (const warning of out.warnings) console.log(`- ${warning}`);
  } else {
    console.log("- none");
  }
}

function printHelp() {
  console.log(`Usage:
  node scripts/create-feature-intake.mjs --request <short requirement> [--title <title>] [--stage auto|intake|brainstorm|research|prd|arch|design|specs|implement|test|api-handoff|code-handoff|prompt|release-readiness|evolve|course|install-sync] [--target-ai Codex] [--out-dir docs/vibe-requests] [--force] [--json]

Creates a tracked intake note from a short new-feature request. The note gives
the recommended skill route, stop gate, copyable prompt, and validation command.`);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith("--")) continue;
    const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
    out[key.slice(2)] = value;
  }
  return out;
}
