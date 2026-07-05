#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const root = path.resolve(args.root ?? process.cwd());
const json = !!args.json;

const DEFAULT_FILES = [
  "AGENTS.md",
  "CLAUDE.md",
  "docs/hooks-and-plugins-roadmap.md",
  "docs/shuang-skill/hooks-and-plugins-roadmap.md",
  ".codex/skills/shuang-claude-md/SKILL.md",
  ".codex/skills/shuang-skill-rules/SKILL.md",
  ".codex/skills/shuang-prompt/SKILL.md",
];

const CLAIM_MARKERS = [
  /已(?:经)?(?:启用|安装|集成|配置|接入|具备)/,
  /可直接(?:调用|使用)/,
  /可以直接(?:调用|使用)/,
  /默认(?:启用|安装|可用)/,
  /\b(?:enabled|installed|configured|available|ready)\b/i,
  /\bcan directly (?:use|call)\b/i,
];

const SAFE_CONTEXT_MARKERS = [
  /还没有/,
  /没有启用/,
  /未启用/,
  /未安装/,
  /尚未/,
  /暂无/,
  /不能/,
  /不要/,
  /禁止/,
  /除非/,
  /如果/,
  /未来/,
  /后续/,
  /路线图/,
  /可选/,
  /建议/,
  /适合/,
  /可以考虑/,
  /待 /,
  /\bif\b/i,
  /\bunless\b/i,
  /\bwithout evidence\b/i,
  /\bno evidence\b/i,
  /\bwhen ready\b/i,
  /\bdo not\b/i,
];

const CAPABILITIES = [
  {
    id: "gitHook",
    label: "git hook",
    claimLabel: "git hook capability",
    match: /(?:\bGit\s+hook\b|\bgit\s+hook\b|\bpre-commit\b|\bpre-push\b|\.git\/hooks|\.husky|lefthook)/i,
    evidencePaths: [
      ".git/hooks/pre-commit",
      ".git/hooks/pre-push",
      ".husky/pre-commit",
      ".husky/pre-push",
      "lefthook.yml",
      ".pre-commit-config.yaml",
    ],
  },
  {
    id: "codexPlugin",
    label: "Codex plugin",
    claimLabel: "Codex plugin capability",
    match: /(?:\bCodex\s+plugin\b|\.codex-plugin\/plugin\.json|独立\s*Codex\s*plugin)/i,
    evidencePaths: [
      ".codex-plugin/plugin.json",
    ],
  },
  {
    id: "mcp",
    label: "MCP",
    claimLabel: "MCP capability",
    match: /(?:\bMCP\b|\bmcp\s+server\b)/i,
    evidencePaths: [
      ".mcp.json",
      "mcp.json",
      ".cursor/mcp.json",
      ".vscode/mcp.json",
      ".claude/mcp.json",
    ],
  },
  {
    id: "slashCommand",
    label: "slash command",
    claimLabel: "slash command capability",
    match: /(?:slash command|斜杠命令|(?:^|[\s`'"])(\/[a-z][\w.-]+)(?=[\s`'".,，。:：]|$))/i,
    evidencePaths: [
      ".claude/commands",
      ".codex/commands",
      ".cursor/commands",
    ],
  },
  {
    id: "subagent",
    label: "subagent",
    claimLabel: "subagent capability",
    match: /(?:\bsubagent\b|\bsubagents\b|Agent Teams|多\s*agent|子\s*agent)/i,
    evidencePaths: [
      ".claude/agents",
      ".codex/agents",
      ".agents",
    ],
  },
];

const files = normalizeArray(args.file);
const checkedFiles = (files.length ? files : DEFAULT_FILES)
  .map((file) => file.replace(/^\.\//, ""))
  .filter((file, index, all) => all.indexOf(file) === index)
  .filter((file) => fs.existsSync(path.join(root, file)));

const evidence = Object.fromEntries(CAPABILITIES.map((capability) => {
  const paths = capability.evidencePaths.filter((rel) => fs.existsSync(path.join(root, rel)));
  return [capability.id, {
    label: capability.label,
    detected: paths.length > 0,
    paths,
  }];
}));

const blockers = [];

for (const relFile of checkedFiles) {
  const content = fs.readFileSync(path.join(root, relFile), "utf8");
  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || isSafeContext(trimmed) || !isStrongClaim(trimmed)) return;

    for (const capability of CAPABILITIES) {
      if (!capability.match.test(trimmed)) continue;
      if (evidence[capability.id].detected) continue;
      blockers.push(`${relFile}:${index + 1} claims ${capability.claimLabel} without evidence`);
    }
  });
}

const report = {
  status: blockers.length ? "fail" : "pass",
  root,
  checkedFiles,
  evidence,
  blockers,
};

if (json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`# Agent Workbench Boundary Check`);
  console.log(`Root: ${root}`);
  console.log(`Checked files: ${checkedFiles.length ? checkedFiles.join(", ") : "(none)"}`);
  for (const [id, item] of Object.entries(evidence)) {
    console.log(`[${item.detected ? "PASS" : "INFO"}] ${id}: ${item.detected ? item.paths.join(", ") : "no project evidence"}`);
  }
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

function isStrongClaim(line) {
  return CLAIM_MARKERS.some((pattern) => pattern.test(line));
}

function isSafeContext(line) {
  return SAFE_CONTEXT_MARKERS.some((pattern) => pattern.test(line));
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
