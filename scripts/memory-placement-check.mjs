#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const root = path.resolve(args.root ?? process.cwd());
const json = !!args.json;

const GUIDANCE_FILES = [
  "AGENTS.md",
  "CLAUDE.md",
];

const CORE_SKILL_FILES = [
  ".codex/skills/shuang-evolve/SKILL.md",
  ".codex/skills/shuang-flow/SKILL.md",
  ".codex/skills/shuang-claude-md/SKILL.md",
  ".codex/skills/shuang-skill-rules/SKILL.md",
  ".codex/skills/shuang-prompt/SKILL.md",
  ".codex/skills/shuang-tdd/SKILL.md",
  ".claude/skills/shuang-evolve/SKILL.md",
  ".claude/skills/shuang-flow/SKILL.md",
  ".claude/skills/shuang-claude-md/SKILL.md",
  ".claude/skills/shuang-skill-rules/SKILL.md",
  ".claude/skills/shuang-prompt/SKILL.md",
  ".claude/skills/shuang-tdd/SKILL.md",
];

const TASK_RETROSPECTIVE = [
  /(?:上次|这次|本轮|刚才|刚刚|昨天|今天).*(?:踩坑|失败|修复|发现|经验|教训|用户纠正|偏好|记住)/,
  /(?:踩坑|故障|事故|返工|卡点)[:：].*(?:以后|记住|下次)/,
  /(?:本轮任务|本次任务|这次任务)[:：]/,
];

const SKILL_INCIDENT_MEMORY = [
  /(?:上次|刚才|刚刚|昨天|今天).*(?:排查|踩坑|事故|故障|修复|发现).*(?:以后|记住|下次|不要再)/,
  /(?:本轮业务|本次业务|这个客户|这个项目).*(?:路径|配置|字段|账号|环境)/,
];

const USER_PREFERENCE = [
  /(?:用户偏好|用户画像|个人偏好)[:：]/,
  /(?:我喜欢|我不喜欢|我以后|以后我|以后都给我|以后不要).*(?:所有项目|每个项目|全部项目|长期|永远)/,
];

const LOCAL_PATH = /\/Users\/[^`\s，。)）]+/;

const files = normalizeArray(args.file);
const guidanceFiles = [];
const skillFiles = [];

if (files.length) {
  for (const file of files.map((item) => item.replace(/^\.\//, ""))) {
    if (!fs.existsSync(path.join(root, file))) continue;
    if (file.endsWith("SKILL.md")) skillFiles.push(file);
    else guidanceFiles.push(file);
  }
} else {
  guidanceFiles.push(...GUIDANCE_FILES.filter((file) => fs.existsSync(path.join(root, file))));
  skillFiles.push(...CORE_SKILL_FILES.filter((file) => fs.existsSync(path.join(root, file))));
}

const checkedFiles = [...new Set([...guidanceFiles, ...skillFiles])];
const blockers = [];

for (const relFile of guidanceFiles) {
  scanLines(relFile, (line, lineNo) => {
    if (TASK_RETROSPECTIVE.some((pattern) => pattern.test(line))) {
      blockers.push(`${relFile}:${lineNo} contains task retrospective; write docs/skill-evolution/inbox instead`);
    }
    if (USER_PREFERENCE.some((pattern) => pattern.test(line))) {
      blockers.push(`${relFile}:${lineNo} contains user preference; keep it in user memory or explicit profile`);
    }
  });
}

for (const relFile of skillFiles) {
  scanLines(relFile, (line, lineNo) => {
    if (LOCAL_PATH.test(line)) {
      blockers.push(`${relFile}:${lineNo} contains local absolute path; keep project-specific paths out of reusable skills`);
    }
    if (SKILL_INCIDENT_MEMORY.some((pattern) => pattern.test(line))) {
      blockers.push(`${relFile}:${lineNo} contains task retrospective; write docs/skill-evolution/inbox instead`);
    }
  });
}

const report = {
  status: blockers.length ? "fail" : "pass",
  root,
  checkedFiles,
  blockers,
};

if (json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log("# Memory Placement Check");
  console.log(`Root: ${root}`);
  console.log(`Checked files: ${checkedFiles.length ? checkedFiles.join(", ") : "(none)"}`);
  for (const blocker of blockers) {
    console.log(`[FAIL] ${blocker}`);
  }
  console.log("");
  console.log(JSON.stringify({
    status: report.status,
    blockers: blockers.length,
  }, null, 2));
}

if (blockers.length) process.exit(1);

function scanLines(relFile, visit) {
  const file = path.join(root, relFile);
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("|")) return;
    visit(trimmed, index + 1);
  });
}

function normalizeArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function parseArgs(argv) {
  const parsed = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) {
      parsed._.push(item);
      continue;
    }
    const [key, inlineValue] = item.slice(2).split("=", 2);
    const value = inlineValue ?? argv[index + 1];
    if (inlineValue === undefined && value && !value.startsWith("--")) {
      index += 1;
      addArg(parsed, key, value);
    } else {
      addArg(parsed, key, true);
    }
  }
  return parsed;
}

function addArg(parsed, key, value) {
  if (parsed[key] === undefined) {
    parsed[key] = value;
    return;
  }
  if (Array.isArray(parsed[key])) {
    parsed[key].push(value);
    return;
  }
  parsed[key] = [parsed[key], value];
}
