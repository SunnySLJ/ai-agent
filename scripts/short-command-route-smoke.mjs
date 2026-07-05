#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const targetRoot = path.resolve(args.target || process.cwd());

const CASES = [
  ["intake", "shuang-flow", "帮我判断现在该走哪一步"],
  ["brainstorm", "shuang-brainstorm", "我只有一个想法，先帮我收敛 MVP"],
  ["research", "shuang-research", "这个方案值不值得做，帮我调研竞品和可行性"],
  ["prd", "shuang-prd", "帮我写正式 PRD 和产品需求文档"],
  ["arch", "shuang-arch", "帮我比较技术方案并定架构选型"],
  ["design", "shuang-design", "按 PRD 做页面 UI 和设计规范"],
  ["specs", "shuang-specs", "把 PRD 拆成可开发 feature 和 tasks"],
  ["implement", "shuang-tdd", "帮我实现这个 feature 并按 TDD 修复 bug"],
  ["test", "shuang-router", "功能写完了，帮我补测试闭环和回归验收"],
  ["api-handoff", "shuang-api-handoff", "这个接口要给前端联调，并生成 Apifox OpenAPI JSON"],
  ["code-handoff", "shuang-code-handoff", "这次改动的代码链路在哪，所有方法在哪个方法"],
  ["prompt", "shuang-prompt", "帮我把一句话需求变成给 AI 的提示词 prompt"],
  ["release-readiness", "shuang-router", "上线前帮我检查发布风险和回滚方案"],
  ["evolve", "shuang-evolve", "把这次经验复盘沉淀并升级 skill"],
  ["course", "shuang-evolve", "用课程资料和 PDF 学习资料完善我的 skills"],
  ["install-sync", "shuang-evolve", "把 skill 系统安装到这个项目，并确认真的能用"],
].map(([stage, skill, request]) => ({
  expectedStage: stage,
  expectedSkill: skill,
  title: `路由烟测-${stage}`,
  request,
}));

if (args.help === "true") {
  printHelp();
  process.exit(0);
}

const report = {
  status: "pass",
  targetRoot,
  outDir: args["out-dir"] || ".shuang-skill/tmp-route-smoke",
  date: args.date || "2099-01-02",
  total: 0,
  passed: 0,
  failed: 0,
  cases: [],
  blockers: [],
  warnings: [],
};

try {
  if (!fs.existsSync(targetRoot)) {
    report.blockers.push(`target root does not exist: ${targetRoot}`);
    finish();
  }

  const runner = path.join(targetRoot, "scripts", "vibe-request-start.mjs");
  if (!fs.existsSync(runner)) {
    report.blockers.push("missing required file: scripts/vibe-request-start.mjs");
    finish();
  }

  const cases = selectCases();
  report.total = cases.length;
  if (!cases.length) {
    report.blockers.push("no smoke cases selected");
    finish();
  }

  for (const smokeCase of cases) {
    const result = runCase(smokeCase);
    report.cases.push(result);
    if (result.status === "pass") report.passed += 1;
    else report.failed += 1;
  }

  for (const item of report.cases) {
    if (item.status !== "pass") {
      report.blockers.push(`${item.expectedStage}: expected ${item.expectedSkill}, got ${item.actualSkill || "none"}`);
    }
  }
} catch (error) {
  report.blockers.push(error.message);
}

finish();

function selectCases() {
  const requested = args.case || [];
  if (!requested.length) return CASES;

  const byStage = new Map(CASES.map((item) => [item.expectedStage, item]));
  const selected = [];
  for (const stage of requested) {
    if (!byStage.has(stage)) {
      report.blockers.push(`unknown smoke case: ${stage}`);
      continue;
    }
    selected.push(byStage.get(stage));
  }
  return selected;
}

function runCase(smokeCase) {
  const result = spawnSync(process.execPath, [
    "scripts/vibe-request-start.mjs",
    "--title",
    smokeCase.title,
    "--request",
    smokeCase.request,
    "--date",
    report.date,
    "--out-dir",
    report.outDir,
    "--force",
    "--json",
  ], {
    cwd: targetRoot,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });

  const parsed = parseJson(result.stdout);
  const actualStage = parsed?.stage || null;
  const actualSkill = parsed?.skill || null;
  const ok = result.status === 0
    && actualStage === smokeCase.expectedStage
    && actualSkill === smokeCase.expectedSkill;

  return {
    status: ok ? "pass" : "fail",
    expectedStage: smokeCase.expectedStage,
    expectedSkill: smokeCase.expectedSkill,
    actualStage,
    actualSkill,
    title: smokeCase.title,
    request: smokeCase.request,
    file: parsed?.file || null,
    exitCode: result.status,
    stdout: ok ? "" : trimOutput(result.stdout || ""),
    stderr: ok ? "" : trimOutput(result.stderr || ""),
  };
}

function parseJson(stdout) {
  const text = String(stdout || "").trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function trimOutput(value) {
  const text = String(value || "").trim();
  return text.length > 4000 ? `${text.slice(0, 4000)}\n...<truncated>` : text;
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
  console.log("# Short Command Route Smoke");
  console.log("");
  console.log(`- Status: ${out.status}`);
  console.log(`- Target: \`${out.targetRoot}\``);
  console.log(`- Cases: ${out.passed}/${out.total}`);
  console.log("");
  console.log("## Cases");
  console.log("");
  for (const item of out.cases) {
    console.log(`- ${item.status}: \`${item.expectedStage}\` -> \`${item.actualStage || "none"}\` / \`${item.actualSkill || "none"}\``);
  }
  console.log("");
  console.log("## Blockers");
  console.log("");
  if (out.blockers.length) {
    for (const blocker of out.blockers) console.log(`- ${blocker}`);
  } else {
    console.log("- none");
  }
}

function printHelp() {
  console.log(`Usage:
  node scripts/short-command-route-smoke.mjs [--target <project>] [--case <stage>] [--date YYYY-MM-DD] [--out-dir .shuang-skill/tmp-route-smoke] [--json]

Runs built-in one-line prompt examples through vibe-request-start and verifies
that each one routes to the expected stage and skill. Repeat --case to run a
small subset, for example --case api-handoff --case prompt.`);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith("--")) continue;
    const name = key.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
    if (name === "case") {
      out.case ??= [];
      out.case.push(value);
    } else {
      out[name] = value;
    }
  }
  return out;
}
