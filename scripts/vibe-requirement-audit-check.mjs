#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const root = process.cwd();

const SOURCE_DOC = "docs/vibe-system-requirement-audit.md";
const INSTALLED_DOC = "docs/shuang-skill/vibe-system-requirement-audit.md";

const REQUIRED_SECTIONS = [
  "# Vibe Coding Skill 系统需求总账",
  "## 当前结论",
  "## 逐条需求对照",
  "## 新项目最短路线",
  "## 维护者继续进化路线",
  "## 当前边界",
];

const REQUIRED_REQUIREMENTS = [
  { id: "overall-goal", pattern: /总体目标|持续进化|Vibe Coding 高手/ },
  { id: "full-workflow", pattern: /需求分析.*技术方案.*PRD.*代码.*测试.*联调.*上线/ },
  { id: "skill-consolidation", pattern: /skill 太多|功能归类|合并/ },
  { id: "docs-and-new-project", pattern: /说明文档|新项目使用路线/ },
  { id: "multi-routes-prompt", pattern: /多条路线|提示词优化/ },
  { id: "github-publish", pattern: /发布到 GitHub/ },
  { id: "skill-studio-unification", pattern: /Skill-Distiller.*Skill-Evolver|Skill-Distiller 和 Skill-Evolver/ },
  { id: "remove-old-evolver", pattern: /删除旧 Skill-Evolver/ },
  { id: "startup-script", pattern: /启动脚本/ },
  { id: "auto-evolution-docs", pattern: /自动升级进化 skill|详细文档/ },
  { id: "beginner-entry", pattern: /新手如何开始了解项目/ },
  { id: "skill-studio-routes", pattern: /\/library.*\/evolve\/theater/ },
  { id: "short-prompts", pattern: /很长提示词|一句话需求|短提示词/ },
  { id: "stepwise-development", pattern: /一步步帮开发|优化提示词/ },
  { id: "hooks-plugins", pattern: /hooks.*插件|插件.*hooks/ },
  { id: "target-project-workflow", pattern: /安装到需要开发的项目|新需求.*优化提示词/ },
  { id: "target-install-sync", pattern: /安装脚本.*Codex.*Claude|升级回流/ },
  { id: "global-install", pattern: /全局安装|项目本地安装/ },
  { id: "business-targets", pattern: /两个业务项目|kuai-yan-fa/ },
  { id: "course-sources", pattern: /学习资料|课程资料|完善 skills/ },
];

const REQUIRED_COMMANDS = [
  "node scripts/vibe-system-audit.mjs --json",
  "node scripts/vibe-workflow-coverage-check.mjs",
  "node scripts/validate-skills.mjs",
  "node scripts/project-readiness.mjs",
  "node scripts/short-command-route-check.mjs",
  "node scripts/short-command-route-smoke.mjs",
  "git status --short --branch",
  "node scripts/project-doctor.mjs",
  "node scripts/skill-studio-route-smoke.mjs",
  "bash -n start.sh",
  "node scripts/evolution-inbox-status.mjs --limit 8",
  "node scripts/evolution-review.mjs --json",
  "node scripts/shuang-skill-manager.mjs drill --request \"<一句话需求>\" --json",
  "node scripts/shuang-skill-manager.mjs start --request \"<一句话需求>\"",
  "node scripts/shuang-skill-manager.mjs next --raw",
  "node scripts/shuang-skill-manager-hooks.test.mjs",
  "node scripts/project-audit.mjs --target <project> --with-readiness --with-request-smoke --with-route-smoke",
  "node scripts/sync-back-smoke.mjs",
  "node scripts/course-source-health.mjs",
  "node scripts/course-source-inventory.mjs --json",
  "node scripts/vibe-requirement-audit-check.mjs",
];

if (args.help === "true") {
  console.log(`Usage:
  node scripts/vibe-requirement-audit-check.mjs [--doc <file>] [--json]

Checks that the Vibe Coding requirement audit doc keeps the explicit user
requirements, evidence table, key commands, and boundary sections intact.`);
  process.exit(0);
}

const docPath = path.resolve(args.doc || defaultDocPath());
const report = {
  status: "pass",
  doc: path.relative(root, docPath) || ".",
  requirements: REQUIRED_REQUIREMENTS.map((item) => item.id),
  presentRequirements: [],
  requiredCommands: REQUIRED_COMMANDS,
  presentCommands: [],
  rows: [],
  blockers: [],
  warnings: [],
};

try {
  const text = readFile(docPath);
  for (const section of REQUIRED_SECTIONS) {
    if (!text.includes(section)) report.blockers.push(`missing section: ${section}`);
  }

  report.rows = parseRequirementRows(text);
  if (!report.rows.length) {
    report.blockers.push("requirement table has no rows");
  }

  for (const row of report.rows) {
    if (!row.request || !row.artifacts || !row.usage || !row.validation) {
      report.blockers.push(`incomplete requirement row: ${row.request || "<empty>"}`);
      continue;
    }
    if (!/`[^`]+`/.test(row.artifacts)) {
      report.blockers.push(`row missing artifact code references: ${row.request}`);
    }
    if (!/`[^`]+`/.test(row.validation)) {
      report.blockers.push(`row missing validation command: ${row.request}`);
    }
  }

  for (const requirement of REQUIRED_REQUIREMENTS) {
    const found = report.rows.some((row) => requirement.pattern.test(row.request));
    if (found) {
      report.presentRequirements.push(requirement.id);
    } else {
      report.blockers.push(`missing requirement row: ${requirement.id}`);
    }
  }

  report.presentCommands = REQUIRED_COMMANDS.filter((command) => text.includes(command));
  for (const command of REQUIRED_COMMANDS) {
    if (!report.presentCommands.includes(command)) {
      report.blockers.push(`missing validation command: ${command}`);
    }
  }

  requireMention(text, "node scripts/shuang-skill-manager.mjs install --target /path/to/new-project", "missing new-project install command");
  requireMention(text, "node scripts/shuang-skill-manager.mjs start --target /path/to/new-project", "missing source-to-target start command");
  requireMention(text, "node scripts/shuang-skill-manager.mjs start --request", "missing installed-target start command");
  requireMention(text, "node scripts/shuang-skill-manager.mjs next --raw", "missing next raw command");
  requireMention(text, "GitHub Actions、正式 Codex plugin 和 Spec-Kit extension hooks 仍属于路线图", "missing capability boundary for future tooling");
} catch (error) {
  report.blockers.push(error.message);
}

report.status = report.blockers.length ? "fail" : "pass";

if (args.json === "true") {
  console.log(JSON.stringify(report, null, 2));
} else {
  printMarkdown(report);
}

process.exit(report.blockers.length ? 1 : 0);

function defaultDocPath() {
  if (fs.existsSync(path.join(root, SOURCE_DOC))) return SOURCE_DOC;
  return INSTALLED_DOC;
}

function parseRequirementRows(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|") || /^[-|\s:]+$/.test(trimmed)) continue;
    const cells = splitRow(trimmed);
    if (cells.length !== 4) continue;
    if (cells[0] === "用户诉求") continue;
    rows.push({
      request: cells[0],
      artifacts: cells[1],
      usage: cells[2],
      validation: cells[3],
    });
  }
  return rows;
}

function splitRow(row) {
  return row
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function requireMention(text, needle, message) {
  if (!text.includes(needle)) report.blockers.push(message);
}

function readFile(file) {
  if (!fs.existsSync(file)) throw new Error(`missing file: ${path.relative(root, file)}`);
  return fs.readFileSync(file, "utf8");
}

function printMarkdown(out) {
  console.log("# Vibe Requirement Audit Check");
  console.log("");
  console.log(`- Status: ${out.status}`);
  console.log(`- Doc: \`${out.doc}\``);
  console.log(`- Requirements: ${out.presentRequirements.length}/${out.requirements.length}`);
  console.log(`- Required commands: ${out.presentCommands.length}/${out.requiredCommands.length}`);
  console.log("");
  console.log("## Blockers");
  console.log("");
  if (out.blockers.length) {
    for (const blocker of out.blockers) console.log(`- ${blocker}`);
  } else {
    console.log("- none");
  }
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
