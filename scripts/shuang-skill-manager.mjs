#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));
const command = args._[0] ?? "help";
const cwd = process.cwd();

const MANAGED_START = "<!-- shuang-skill:start -->";
const MANAGED_END = "<!-- shuang-skill:end -->";
const CONFIG_DIR = ".shuang-skill";
const CONFIG_FILE = `${CONFIG_DIR}/config.json`;
const HOOK_MARKER = "shuang-skill:managed-pre-push";

if (command === "install") {
  install();
} else if (command === "sync-back") {
  syncBack();
} else if (command === "status") {
  status();
} else if (command === "start") {
  startProject();
} else if (command === "drill") {
  beginnerDrill();
} else if (command === "audit") {
  auditProjects();
} else if (command === "system-audit") {
  systemAudit();
} else if (command === "route-smoke") {
  routeSmoke();
} else if (command === "readiness") {
  readiness();
} else if (command === "context") {
  contextPack();
} else if (command === "request") {
  requestQueue();
} else if (command === "next") {
  nextWorkflow();
} else if (command === "hooks") {
  hooks();
} else if (command === "guard") {
  guard();
} else {
  help();
}

function install() {
  const sourceRoot = resolveRoot(args.source ?? cwd, "source");
  const targetRoot = resolveRequiredPath(args.target, "target");
  assertSourceRoot(sourceRoot);

  const dryRun = !!args["dry-run"];
  const installCodex = args.codex !== "false";
  const installClaude = args.claude !== "false";
  const withHooks = !!args["with-hooks"];

  const actions = [];

  if (installCodex) {
    mirrorDir({
      from: path.join(sourceRoot, ".codex", "skills"),
      to: path.join(targetRoot, ".codex", "skills"),
      backupRoot: targetRoot,
      dryRun,
      actions,
    });
    mirrorDir({
      from: path.join(sourceRoot, ".codex", "skill-groups"),
      to: path.join(targetRoot, ".codex", "skill-groups"),
      backupRoot: targetRoot,
      dryRun,
      actions,
    });
  }

  if (installClaude) {
    mirrorDir({
      from: path.join(sourceRoot, ".codex", "skills"),
      to: path.join(targetRoot, ".claude", "skills"),
      backupRoot: targetRoot,
      dryRun,
      actions,
    });
  }

  copyFiles([
    ["docs/getting-started-for-beginners.md", "docs/shuang-skill/getting-started-for-beginners.md"],
    ["docs/new-project-quickstart.md", "docs/shuang-skill/new-project-quickstart.md"],
    ["docs/dev-environment.md", "docs/shuang-skill/dev-environment.md"],
    ["docs/short-command-routes.md", "docs/shuang-skill/short-command-routes.md"],
    ["docs/vibe-coding-capability-matrix.md", "docs/shuang-skill/vibe-coding-capability-matrix.md"],
    ["docs/vibe-system-requirement-audit.md", "docs/shuang-skill/vibe-system-requirement-audit.md"],
    ["docs/vibe-coding-operating-map.md", "docs/vibe-coding-operating-map.md"],
    ["docs/skill-evolution/README.md", "docs/skill-evolution/README.md"],
    ["docs/skill-evolution/auto-upgrade-system.md", "docs/skill-evolution/auto-upgrade-system.md"],
    ["docs/skill-evolution/course-source-ingestion.md", "docs/skill-evolution/course-source-ingestion.md"],
    ["docs/skill-evolution/course-source-registry.example.json", "docs/skill-evolution/course-source-registry.example.json"],
    ["docs/hooks-and-plugins-roadmap.md", "docs/shuang-skill/hooks-and-plugins-roadmap.md"],
    ["scripts/create-feature-intake.mjs", "scripts/create-feature-intake.mjs"],
    ["scripts/project-audit.mjs", "scripts/project-audit.mjs"],
    ["scripts/project-readiness.mjs", "scripts/project-readiness.mjs"],
    ["scripts/project-context-pack.mjs", "scripts/project-context-pack.mjs"],
    ["scripts/project-start.mjs", "scripts/project-start.mjs"],
    ["scripts/beginner-drill.mjs", "scripts/beginner-drill.mjs"],
    ["scripts/short-command-route-smoke.mjs", "scripts/short-command-route-smoke.mjs"],
    ["scripts/vibe-request-start.mjs", "scripts/vibe-request-start.mjs"],
    ["scripts/vibe-request-check.mjs", "scripts/vibe-request-check.mjs"],
    ["scripts/vibe-request-prompt.mjs", "scripts/vibe-request-prompt.mjs"],
    ["scripts/vibe-request-status.mjs", "scripts/vibe-request-status.mjs"],
    ["scripts/create-evolution-note.mjs", "scripts/create-evolution-note.mjs"],
    ["scripts/create-course-evolution-note.mjs", "scripts/create-course-evolution-note.mjs"],
    ["scripts/evolution-inbox-status.mjs", "scripts/evolution-inbox-status.mjs"],
    ["scripts/evolution-review.mjs", "scripts/evolution-review.mjs"],
    ["scripts/evolution-promotion-package.mjs", "scripts/evolution-promotion-package.mjs"],
    ["scripts/short-command-route-check.mjs", "scripts/short-command-route-check.mjs"],
    ["scripts/vibe-workflow-coverage-check.mjs", "scripts/vibe-workflow-coverage-check.mjs"],
    ["scripts/vibe-system-audit.mjs", "scripts/vibe-system-audit.mjs"],
    ["scripts/vibe-requirement-audit-check.mjs", "scripts/vibe-requirement-audit-check.mjs"],
    ["scripts/api-handoff-artifact-check.mjs", "scripts/api-handoff-artifact-check.mjs"],
    ["scripts/managed-artifacts-check.mjs", "scripts/managed-artifacts-check.mjs"],
    ["scripts/spec-kit-handoff-check.mjs", "scripts/spec-kit-handoff-check.mjs"],
    ["scripts/course-source-health.mjs", "scripts/course-source-health.mjs"],
    ["scripts/course-source-inventory.mjs", "scripts/course-source-inventory.mjs"],
    ["scripts/course-local-extract.mjs", "scripts/course-local-extract.mjs"],
    ["scripts/course-extract-to-notes.mjs", "scripts/course-extract-to-notes.mjs"],
    ["scripts/agent-workbench-boundary-check.mjs", "scripts/agent-workbench-boundary-check.mjs"],
    ["scripts/memory-placement-check.mjs", "scripts/memory-placement-check.mjs"],
    ["scripts/project-doctor.mjs", "scripts/project-doctor.mjs"],
    ["scripts/validate-skills.mjs", "scripts/validate-skills.mjs"],
    ["scripts/shuang-skill-manager.mjs", "scripts/shuang-skill-manager.mjs"],
  ], sourceRoot, targetRoot, dryRun, actions);

  ensureDir(path.join(targetRoot, "docs", "skill-evolution", "inbox"), dryRun, actions);
  ensureDir(path.join(targetRoot, CONFIG_DIR), dryRun, actions);

  const config = {
    sourceRoot,
    installedAt: new Date().toISOString(),
    codexSkills: installCodex ? ".codex/skills" : null,
    claudeSkills: installClaude ? ".claude/skills" : null,
    syncBackCommand: "node scripts/shuang-skill-manager.mjs sync-back --apply",
  };
  writeJson(path.join(targetRoot, CONFIG_FILE), config, dryRun, actions);

  upsertGuidance(path.join(targetRoot, "AGENTS.md"), "Codex", dryRun, actions);
  upsertGuidance(path.join(targetRoot, "CLAUDE.md"), "Claude", dryRun, actions);

  if (withHooks) {
    installHookTemplate(targetRoot, dryRun, actions);
  }

  runTargetValidation(targetRoot, dryRun, actions, installCodex);
  printActions(actions);
}

function syncBack() {
  const targetRoot = resolveRoot(args.target ?? cwd, "target");
  const config = readConfig(targetRoot);
  const sourceRoot = resolveRoot(args.source ?? config.sourceRoot, "source");
  assertSourceRoot(sourceRoot);

  const apply = !!args.apply;
  const includeNew = !!args["include-new"];
  const fromRoot = args.from === "claude"
    ? path.join(targetRoot, ".claude", "skills")
    : path.join(targetRoot, ".codex", "skills");
  const targetInbox = path.join(targetRoot, "docs", "skill-evolution", "inbox");
  const sourceInbox = path.join(sourceRoot, "docs", "skill-evolution", "inbox");
  const actions = [];

  if (!fs.existsSync(fromRoot)) {
    fail(`Skill root not found: ${fromRoot}`);
  }

  for (const name of listDirs(fromRoot)) {
    const fromSkill = path.join(fromRoot, name);
    const toSkill = path.join(sourceRoot, ".codex", "skills", name);
    if (!fs.existsSync(toSkill) && !includeNew) {
      actions.push({ type: "skip-new-skill", path: rel(sourceRoot, toSkill), detail: "use --include-new to sync it" });
      continue;
    }
    if (!dirsDiffer(fromSkill, toSkill)) {
      actions.push({ type: "unchanged-skill", path: `.codex/skills/${name}` });
      continue;
    }
    if (apply) {
      mirrorDir({ from: fromSkill, to: toSkill, backupRoot: sourceRoot, dryRun: false, actions });
    } else {
      actions.push({ type: "would-sync-skill", path: `.codex/skills/${name}` });
    }
  }

  if (fs.existsSync(targetInbox)) {
    ensureDir(sourceInbox, !apply, actions);
    for (const file of fs.readdirSync(targetInbox).sort()) {
      if (!file.endsWith(".md")) continue;
      const from = path.join(targetInbox, file);
      const to = path.join(sourceInbox, file);
      if (fs.existsSync(to) && filesEqual(from, to)) {
        actions.push({ type: "unchanged-note", path: rel(sourceRoot, to) });
        continue;
      }
      if (apply) {
        fs.copyFileSync(from, to);
        actions.push({ type: "sync-note", path: rel(sourceRoot, to) });
      } else {
        actions.push({ type: "would-sync-note", path: rel(sourceRoot, to) });
      }
    }
  }

  if (apply) {
    const result = spawnSync(process.execPath, ["scripts/validate-skills.mjs"], {
      cwd: sourceRoot,
      encoding: "utf8",
    });
    actions.push({
      type: result.status === 0 ? "validate-source-pass" : "validate-source-fail",
      path: "scripts/validate-skills.mjs",
      detail: (result.stdout || result.stderr || "").trim(),
    });
    if (result.status !== 0) {
      printActions(actions);
      process.exit(result.status ?? 1);
    }
  } else {
    actions.push({ type: "dry-run", path: "sync-back", detail: "rerun with --apply to write changes to source" });
  }

  printActions(actions);
}

function status() {
  const targetRoot = resolveRoot(args.target ?? cwd, "target");
  const config = readConfig(targetRoot, false);
  const checks = [
    [".codex/skills", fs.existsSync(path.join(targetRoot, ".codex", "skills"))],
    [".claude/skills", fs.existsSync(path.join(targetRoot, ".claude", "skills"))],
    ["AGENTS.md", fs.existsSync(path.join(targetRoot, "AGENTS.md"))],
    ["CLAUDE.md", fs.existsSync(path.join(targetRoot, "CLAUDE.md"))],
    ["docs/skill-evolution/inbox", fs.existsSync(path.join(targetRoot, "docs", "skill-evolution", "inbox"))],
    [CONFIG_FILE, !!config],
  ];
  for (const [name, ok] of checks) {
    console.log(`[${ok ? "PASS" : "MISS"}] ${name}`);
  }
  if (config) {
    console.log("");
    console.log(JSON.stringify(config, null, 2));
  }
}

function hooks() {
  const action = args._[1] ?? "status";
  const targetRoot = resolveRoot(args.target ?? cwd, "target");
  const dryRun = !!args["dry-run"];
  const force = !!args.force;
  const actions = [];

  if (action === "status") {
    hookStatus(targetRoot);
    return;
  }

  if (action === "template") {
    installHookTemplate(targetRoot, dryRun, actions);
    printActions(actions);
    return;
  }

  assertGitWorktree(targetRoot);

  if (action === "install") {
    installManagedHook(targetRoot, dryRun, force, actions);
  } else if (action === "remove") {
    removeManagedHook(targetRoot, dryRun, actions);
  } else {
    fail(`Unknown hooks action: ${action}`);
  }

  printActions(actions);
}

function guard() {
  const targetRoot = resolveRoot(args.target ?? cwd, "target");
  const includeOutput = !!args["include-output"];
  const json = !!args.json;
  const guardCheck = runProjectDoctorGuard(targetRoot);
  const report = {
    status: guardCheck.exitCode === 0 ? "pass" : "fail",
    targetRoot,
    checks: {
      projectDoctor: {
        command: "node scripts/project-doctor.mjs",
        exitCode: guardCheck.exitCode,
        stdout: guardCheck.stdout,
        stderr: guardCheck.stderr,
      },
    },
    blockers: guardCheck.exitCode === 0 ? [] : [guardCheck.blocker],
    warnings: [],
  };

  printGuardReport(report, json, includeOutput || report.status === "fail");
  process.exit(report.status === "pass" ? 0 : 1);
}

function runProjectDoctorGuard(targetRoot) {
  const projectDoctor = path.join(targetRoot, "scripts", "project-doctor.mjs");
  if (!fs.existsSync(projectDoctor)) {
    return {
      exitCode: 1,
      stdout: "",
      stderr: "",
      blocker: "missing scripts/project-doctor.mjs; run install first",
    };
  }

  const result = spawnSync(process.execPath, ["scripts/project-doctor.mjs"], {
    cwd: targetRoot,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  const exitCode = result.status ?? 1;
  return {
    exitCode,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    blocker: `project-doctor failed with exit code ${exitCode}`,
  };
}

function printGuardReport(report, json, includeOutput) {
  const outputReport = {
    ...report,
    checks: {
      ...report.checks,
      projectDoctor: {
        ...report.checks.projectDoctor,
        stdout: includeOutput ? report.checks.projectDoctor.stdout : "",
        stderr: includeOutput ? report.checks.projectDoctor.stderr : "",
      },
    },
  };

  if (json) {
    console.log(JSON.stringify(outputReport, null, 2));
    return;
  }

  console.log(`# Shuang Skill Guard`);
  console.log("");
  console.log(`- Target: ${report.targetRoot}`);
  console.log(`- Status: ${report.status}`);
  console.log(`- project-doctor: ${report.checks.projectDoctor.exitCode === 0 ? "pass" : "fail"}`);
  if (report.blockers.length) {
    console.log("");
    console.log("## Blockers");
    for (const blocker of report.blockers) console.log(`- ${blocker}`);
  }
  if (includeOutput) {
    const stdout = report.checks.projectDoctor.stdout.trim();
    const stderr = report.checks.projectDoctor.stderr.trim();
    if (stdout) {
      console.log("");
      console.log("## project-doctor stdout");
      console.log(stdout);
    }
    if (stderr) {
      console.log("");
      console.log("## project-doctor stderr");
      console.log(stderr);
    }
  }
}

function startProject() {
  const passthrough = process.argv.slice(3);
  const result = spawnSync(process.execPath, [
    path.join(cwd, "scripts", "project-start.mjs"),
    ...passthrough,
  ], {
    cwd,
    encoding: "utf8",
    stdio: "inherit",
  });
  process.exit(result.status ?? 1);
}

function beginnerDrill() {
  const passthrough = process.argv.slice(3);
  const result = spawnSync(process.execPath, [
    path.join(cwd, "scripts", "beginner-drill.mjs"),
    ...passthrough,
  ], {
    cwd,
    encoding: "utf8",
    stdio: "inherit",
  });
  process.exit(result.status ?? 1);
}

function auditProjects() {
  const passthrough = process.argv.slice(3);
  const result = spawnSync(process.execPath, [
    path.join(cwd, "scripts", "project-audit.mjs"),
    ...passthrough,
  ], {
    cwd,
    encoding: "utf8",
    stdio: "inherit",
  });
  process.exit(result.status ?? 1);
}

function systemAudit() {
  const passthrough = process.argv.slice(3);
  const result = spawnSync(process.execPath, [
    path.join(cwd, "scripts", "vibe-system-audit.mjs"),
    ...passthrough,
  ], {
    cwd,
    encoding: "utf8",
    stdio: "inherit",
  });
  process.exit(result.status ?? 1);
}

function routeSmoke() {
  const passthrough = process.argv.slice(3);
  const result = spawnSync(process.execPath, [
    path.join(cwd, "scripts", "short-command-route-smoke.mjs"),
    ...passthrough,
  ], {
    cwd,
    encoding: "utf8",
    stdio: "inherit",
  });
  process.exit(result.status ?? 1);
}

function readiness() {
  const passthrough = process.argv.slice(3);
  const result = spawnSync(process.execPath, [
    path.join(cwd, "scripts", "project-readiness.mjs"),
    ...passthrough,
  ], {
    cwd,
    encoding: "utf8",
    stdio: "inherit",
  });
  process.exit(result.status ?? 1);
}

function contextPack() {
  const passthrough = process.argv.slice(3);
  const targetRoot = resolveRoot(args.target ?? cwd, "target");
  const targetScript = path.join(targetRoot, "scripts", "project-context-pack.mjs");
  const sourceScript = path.join(cwd, "scripts", "project-context-pack.mjs");
  const useTargetScript = fs.existsSync(targetScript);
  const scriptPath = useTargetScript ? targetScript : sourceScript;
  if (!fs.existsSync(scriptPath)) fail("missing scripts/project-context-pack.mjs");

  const result = spawnSync(process.execPath, [
    scriptPath,
    ...(useTargetScript ? [] : ["--target", targetRoot]),
    ...contextPassthroughArgs(passthrough),
  ], {
    cwd: useTargetScript ? targetRoot : cwd,
    encoding: "utf8",
    stdio: "inherit",
  });
  process.exit(result.status ?? 1);
}

function contextPassthroughArgs(argv) {
  const out = [];
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === "--target") {
      if (argv[i + 1] && !argv[i + 1].startsWith("--")) i += 1;
      continue;
    }
    if (item.startsWith("--target=")) continue;
    out.push(item);
  }
  return out;
}

function requestQueue() {
  const action = args._[1] ?? "status";
  const scriptByAction = {
    check: "vibe-request-check.mjs",
    status: "vibe-request-status.mjs",
    prompt: "vibe-request-prompt.mjs",
  };
  const script = scriptByAction[action];
  if (!script) fail(`Unknown request action: ${action}`);

  const targetRoot = resolveRoot(args.target ?? cwd, "target");
  const scriptPath = path.join(targetRoot, "scripts", script);
  if (!fs.existsSync(scriptPath)) {
    fail(`target missing scripts/${script}; run install first`);
  }

  const result = spawnSync(process.execPath, [
    scriptPath,
    ...requestPassthroughArgs(process.argv.slice(3)),
  ], {
    cwd: targetRoot,
    encoding: "utf8",
    stdio: "inherit",
  });
  process.exit(result.status ?? 1);
}

function nextWorkflow() {
  const targetRoot = resolveRoot(args.target ?? cwd, "target");
  const requestArgs = nextRequestPassthroughArgs(process.argv.slice(3));
  const report = {
    status: "pass",
    targetRoot,
    requestQueue: {
      total: 0,
      countsByStage: {},
      countsBySkill: {},
    },
    latestRequest: null,
    nextPrompt: null,
    checks: {
      requestCheck: null,
      requestStatus: null,
      requestPrompt: null,
      guard: null,
      readiness: null,
    },
    blockers: [],
    warnings: [],
    nextActions: [],
  };

  const requestCheck = runTargetJsonScript(targetRoot, "vibe-request-check.mjs", [
    ...requestArgs,
    "--json",
  ]);
  report.checks.requestCheck = summarizeJsonProcess(requestCheck);
  collectJsonBlockers(report, "request check", requestCheck);

  const requestStatus = runTargetJsonScript(targetRoot, "vibe-request-status.mjs", [
    ...requestArgs,
    "--json",
  ]);
  report.checks.requestStatus = summarizeJsonProcess(requestStatus);
  collectJsonBlockers(report, "request status", requestStatus);
  if (requestStatus.json) {
    report.requestQueue.total = requestStatus.json.requests?.length || 0;
    report.requestQueue.countsByStage = requestStatus.json.countsByStage || {};
    report.requestQueue.countsBySkill = requestStatus.json.countsBySkill || {};
  }

  const requestPrompt = runTargetJsonScript(targetRoot, "vibe-request-prompt.mjs", [
    ...requestArgs,
    "--json",
  ]);
  report.checks.requestPrompt = summarizeJsonProcess(requestPrompt, {
    includePromptMeta: true,
  });
  collectJsonBlockers(report, "request prompt", requestPrompt);
  if (requestPrompt.json?.prompt) {
    report.nextPrompt = requestPrompt.json.prompt;
    report.latestRequest = {
      file: requestPrompt.json.file,
      title: requestPrompt.json.title,
      stage: requestPrompt.json.stage,
      skill: requestPrompt.json.skill,
    };
  } else if (requestStatus.json?.requests?.length) {
    const latest = requestStatus.json.requests.at(-1);
    report.latestRequest = {
      file: latest.file,
      title: latest.title,
      stage: latest.stage,
      skill: latest.skill,
    };
  }

  const guardCheck = runProjectDoctorGuard(targetRoot);
  report.checks.guard = summarizeGuardProcess(guardCheck);
  if (guardCheck.exitCode !== 0) {
    report.blockers.push(`guard failed with exit code ${guardCheck.exitCode}`);
  }

  if (args["with-readiness"]) {
    const readiness = runTargetJsonScript(targetRoot, "project-readiness.mjs", [
      "--json",
    ]);
    report.checks.readiness = summarizeJsonProcess(readiness);
    collectJsonBlockers(report, "readiness", readiness);
  }

  report.status = report.blockers.length ? "fail" : "pass";
  report.nextActions = buildNextActions(report);

  if (args.raw) {
    if (report.nextPrompt) console.log(report.nextPrompt);
    else console.log(report.nextActions.join("\n"));
  } else if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printNextWorkflow(report);
  }

  process.exit(report.status === "pass" ? 0 : 1);
}

function nextRequestPassthroughArgs(argv) {
  const out = [];
  const skipValueFor = new Set(["--target"]);
  const skipFlags = new Set(["--json", "--raw", "--with-readiness"]);
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (skipFlags.has(item)) continue;
    if (skipValueFor.has(item)) {
      if (argv[i + 1] && !argv[i + 1].startsWith("--")) i += 1;
      continue;
    }
    if (item.startsWith("--target=")) continue;
    if (item.startsWith("--json=") || item.startsWith("--raw=") || item.startsWith("--with-readiness=")) continue;
    out.push(item);
  }
  return out;
}

function runTargetJsonScript(targetRoot, script, argv = []) {
  const scriptPath = path.join(targetRoot, "scripts", script);
  if (!fs.existsSync(scriptPath)) {
    return {
      exitCode: 1,
      stdout: "",
      stderr: `target missing scripts/${script}; run install first`,
      json: null,
      parseError: null,
    };
  }

  const result = spawnSync(process.execPath, [
    scriptPath,
    ...argv,
  ], {
    cwd: targetRoot,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });

  const out = {
    exitCode: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    json: null,
    parseError: null,
  };

  const text = out.stdout.trim();
  if (text) {
    try {
      out.json = JSON.parse(text);
    } catch (error) {
      out.parseError = error.message;
    }
  }
  return out;
}

function summarizeJsonProcess(processResult, options = {}) {
  const summary = {
    exitCode: processResult.exitCode,
    status: processResult.json?.status || (processResult.exitCode === 0 ? "pass" : "fail"),
    blockers: processResult.json?.blockers || [],
    warnings: processResult.json?.warnings || [],
  };
  if (processResult.parseError) summary.parseError = processResult.parseError;
  if (options.includePromptMeta) {
    summary.file = processResult.json?.file || null;
    summary.stage = processResult.json?.stage || null;
    summary.skill = processResult.json?.skill || null;
    summary.hasPrompt = !!processResult.json?.prompt;
    summary.contextPackStatus = processResult.json?.contextPack?.status || null;
  }
  return summary;
}

function collectJsonBlockers(report, label, processResult) {
  if (processResult.exitCode !== 0) {
    report.blockers.push(`${label} failed with exit code ${processResult.exitCode}`);
  }
  if (processResult.parseError) {
    report.blockers.push(`${label} returned invalid JSON: ${processResult.parseError}`);
  }
  for (const blocker of processResult.json?.blockers || []) {
    report.blockers.push(`${label}: ${blocker}`);
  }
  for (const warning of processResult.json?.warnings || []) {
    report.warnings.push(`${label}: ${warning}`);
  }
}

function summarizeGuardProcess(processResult) {
  return {
    exitCode: processResult.exitCode,
    status: processResult.exitCode === 0 ? "pass" : "fail",
    blockers: processResult.exitCode === 0
      ? []
      : [`project-doctor failed with exit code ${processResult.exitCode}`],
    warnings: [],
  };
}

function buildNextActions(report) {
  if (report.blockers.length) {
    return [
      "先修复 blockers，再重新运行 `node scripts/shuang-skill-manager.mjs next --json`。",
    ];
  }
  if (report.nextPrompt) {
    return [
      "复制 nextPrompt 给当前 Agent 或下一个 AI 会话继续执行。",
      "交接前可运行 `node scripts/shuang-skill-manager.mjs next --raw` 只输出提示词。",
      "实现或阶段推进完成后，运行 `node scripts/shuang-skill-manager.mjs guard --json` 做提交前预检。",
    ];
  }
  return [
    "当前没有入口卡；用 `node scripts/shuang-skill-manager.mjs start --request \"<一句话需求>\"` 创建下一张入口卡。",
    "如果是新手演练，用 `node scripts/shuang-skill-manager.mjs drill --request \"<一句话需求>\" --json`。",
  ];
}

function printNextWorkflow(out) {
  console.log("# Shuang Skill Next");
  console.log("");
  console.log(`- Status: ${out.status}`);
  console.log(`- Target: ${out.targetRoot}`);
  console.log(`- Requests: ${out.requestQueue.total}`);
  if (out.latestRequest) {
    console.log(`- Latest request: \`${out.latestRequest.file || "unknown"}\``);
    if (out.latestRequest.stage) console.log(`- Stage: \`${out.latestRequest.stage}\``);
    if (out.latestRequest.skill) console.log(`- Skill: \`${out.latestRequest.skill}\``);
  }
  console.log(`- Guard: ${out.checks.guard?.status || "not-run"}`);
  if (out.checks.readiness) console.log(`- Readiness: ${out.checks.readiness.status}`);
  console.log("");
  console.log("## Next Actions");
  console.log("");
  for (const action of out.nextActions) console.log(`- ${action}`);
  console.log("");
  console.log("## Next Prompt");
  console.log("");
  if (out.nextPrompt) {
    console.log("```text");
    console.log(out.nextPrompt);
    console.log("```");
  } else {
    console.log("- none");
  }
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

function requestPassthroughArgs(argv) {
  const out = [];
  let skippedAction = false;
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!skippedAction && !item.startsWith("--")) {
      skippedAction = true;
      continue;
    }
    if (item === "--target") {
      if (argv[i + 1] && !argv[i + 1].startsWith("--")) i += 1;
      continue;
    }
    if (item.startsWith("--target=")) {
      continue;
    }
    out.push(item);
  }
  return out;
}

function hookStatus(targetRoot) {
  const gitDir = path.join(targetRoot, ".git");
  const hookFile = path.join(gitDir, "hooks", "pre-push");
  const templateFile = path.join(targetRoot, CONFIG_DIR, "hooks", "pre-push");
  const managed = fs.existsSync(hookFile) && fs.readFileSync(hookFile, "utf8").includes(HOOK_MARKER);
  const template = fs.existsSync(templateFile);

  console.log(`[${fs.existsSync(gitDir) ? "PASS" : "MISS"}] git worktree`);
  console.log(`[${managed ? "PASS" : "MISS"}] managed pre-push hook`);
  console.log(`[${template ? "PASS" : "MISS"}] hook template`);
}

function installManagedHook(targetRoot, dryRun, force, actions) {
  const hookFile = path.join(targetRoot, ".git", "hooks", "pre-push");
  const content = managedHookContent();

  if (fs.existsSync(hookFile)) {
    if (!force) {
      fail("pre-push hook already exists; pass --force to overwrite");
    }
    const backup = backupPath(targetRoot, hookFile);
    if (!dryRun) {
      fs.mkdirSync(path.dirname(backup), { recursive: true });
      fs.copyFileSync(hookFile, backup);
    }
    actions.push({ type: dryRun ? "would-backup-hook" : "backup-hook", path: rel(targetRoot, backup) });
  }

  if (!dryRun) {
    fs.mkdirSync(path.dirname(hookFile), { recursive: true });
    fs.writeFileSync(hookFile, content, "utf8");
    fs.chmodSync(hookFile, 0o755);
  }
  actions.push({ type: dryRun ? "would-install-hook" : "install-hook", path: rel(targetRoot, hookFile) });
}

function removeManagedHook(targetRoot, dryRun, actions) {
  const hookFile = path.join(targetRoot, ".git", "hooks", "pre-push");
  if (!fs.existsSync(hookFile)) {
    actions.push({ type: "missing-hook", path: rel(targetRoot, hookFile) });
    return;
  }

  const content = fs.readFileSync(hookFile, "utf8");
  if (!content.includes(HOOK_MARKER)) {
    fail("refusing to remove non-managed pre-push hook");
  }

  if (!dryRun) fs.rmSync(hookFile, { force: true });
  actions.push({ type: dryRun ? "would-remove-hook" : "remove-hook", path: rel(targetRoot, hookFile) });
}

function assertGitWorktree(targetRoot) {
  if (!fs.existsSync(path.join(targetRoot, ".git"))) {
    fail(`target is not a git worktree: ${targetRoot}`);
  }
}

function help() {
  console.log(`Usage:
  node scripts/shuang-skill-manager.mjs install --target <project> [--source <shuang-skill>] [--codex false] [--claude false] [--with-hooks] [--dry-run]
  node scripts/shuang-skill-manager.mjs readiness [--target <project>] [--json]
  node scripts/shuang-skill-manager.mjs context [--target <project>] [--json] [--format json|markdown] [--out <file>]
  node scripts/shuang-skill-manager.mjs start --target <project> --request <short requirement> [--title <title>] [--json|--raw]
  node scripts/shuang-skill-manager.mjs drill [--target <project>] [--request <short requirement>] [--json|--raw] [--keep]
  node scripts/shuang-skill-manager.mjs next [--target <project>] [--file <request.md>] [--dir <request-dir>] [--json|--raw] [--with-readiness]
  node scripts/shuang-skill-manager.mjs guard [--target <project>] [--json] [--include-output]
  node scripts/shuang-skill-manager.mjs request check|status|prompt [--target <project>] [--file <request.md>] [--json|--raw]
  node scripts/shuang-skill-manager.mjs audit --target <project> [--target <project2>] [--with-readiness] [--with-start-smoke] [--with-request-smoke] [--with-route-smoke] [--json] [--include-output]
  node scripts/shuang-skill-manager.mjs system-audit [--target <project>] [--json] [--with-skill-studio] [--with-install-smoke] [--with-sync-smoke]
  node scripts/shuang-skill-manager.mjs route-smoke [--target <project>] [--case <stage>] [--json]
  node scripts/shuang-skill-manager.mjs sync-back [--target <project>] [--source <shuang-skill>] [--from codex|claude] [--include-new] [--apply]
  node scripts/shuang-skill-manager.mjs status [--target <project>]
  node scripts/shuang-skill-manager.mjs hooks status [--target <project>]
  node scripts/shuang-skill-manager.mjs hooks template [--target <project>] [--dry-run]
  node scripts/shuang-skill-manager.mjs hooks install [--target <project>] [--force] [--dry-run]
  node scripts/shuang-skill-manager.mjs hooks remove [--target <project>] [--dry-run]

Examples:
  node scripts/shuang-skill-manager.mjs install --target /path/to/project
  node scripts/shuang-skill-manager.mjs readiness --target /path/to/project --json
  node scripts/shuang-skill-manager.mjs context --target /path/to/project --json
  node scripts/shuang-skill-manager.mjs start --target /path/to/project --request "一句新需求"
  node scripts/shuang-skill-manager.mjs drill --target /path/to/project --request "一句新需求" --json
  node scripts/shuang-skill-manager.mjs next --target /path/to/project --json
  node scripts/shuang-skill-manager.mjs guard --target /path/to/project --json
  node scripts/shuang-skill-manager.mjs request prompt --target /path/to/project --raw
  node scripts/shuang-skill-manager.mjs audit --target /path/to/project --with-readiness --with-start-smoke --with-request-smoke --with-route-smoke
  node scripts/shuang-skill-manager.mjs system-audit --json
  node scripts/shuang-skill-manager.mjs system-audit --json --with-skill-studio
  node scripts/shuang-skill-manager.mjs route-smoke --target /path/to/project --json
  node scripts/shuang-skill-manager.mjs sync-back --target /path/to/project
  node scripts/shuang-skill-manager.mjs sync-back --target /path/to/project --apply
  node scripts/shuang-skill-manager.mjs hooks template --target /path/to/project
  node scripts/shuang-skill-manager.mjs hooks install --target /path/to/project
`);
}

function upsertGuidance(file, agentName, dryRun, actions) {
  const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const block = `${MANAGED_START}
## Shuang Skill Workflow

This project has local Shuang Vibe Coding skills installed for ${agentName}.

- Codex skills: \`.codex/skills/\`
- Claude skills: \`.claude/skills/\`
- Workflow map: \`docs/vibe-coding-operating-map.md\`
- Evolution inbox: \`docs/skill-evolution/inbox/\`
- Course-source ingestion guide: \`docs/skill-evolution/course-source-ingestion.md\`

Default behavior:

1. Use \`shuang-flow\` to identify the current phase before large changes.
2. Use \`shuang-prompt\` when a copyable handoff prompt is needed.
3. Before implementation, run \`node scripts/spec-kit-handoff-check.mjs --feature <feature-dir>\` when spec/plan/tasks exist.
4. Use \`shuang-tdd\` for feature implementation after the handoff package is ready.
5. For API/front-end handoff packages, run \`node scripts/api-handoff-artifact-check.mjs --doc <handoff.md> --openapi <openapi.json>\` before delivery.
6. For short one-line requests, use \`docs/shuang-skill/short-command-routes.md\`; after route edits, run \`node scripts/short-command-route-check.mjs\` and \`node scripts/short-command-route-smoke.mjs\`.
7. Before asking another AI to work in this project, run \`node scripts/shuang-skill-manager.mjs context --json\` to generate a source-backed project context pack.
8. For short one-line feature requests, prefer \`node scripts/shuang-skill-manager.mjs start --request "<一句话需求>"\`; use \`node scripts/vibe-request-start.mjs --request "<一句话需求>"\` only after the project is already installed. For edited request cards, run \`node scripts/shuang-skill-manager.mjs request check\`, \`node scripts/shuang-skill-manager.mjs request status\`, and \`node scripts/shuang-skill-manager.mjs request prompt --raw\` before handing the queue to another agent. To prove short-command routing still works, run \`node scripts/shuang-skill-manager.mjs route-smoke\`.
9. During daily work after an intake card exists, run \`node scripts/shuang-skill-manager.mjs next --json\` to check the queue, run guard, and get the next copyable prompt in one report.
10. For a beginner end-to-end rehearsal, run \`node scripts/shuang-skill-manager.mjs drill --request "<一句话需求>" --json\`; it chains install/readiness/start/request prompt/context/system-audit in one report.
11. Before push or before enabling a managed Git hook, run \`node scripts/shuang-skill-manager.mjs guard --json\`; it is the same safe preflight command used by the managed \`pre-push\` hook.
12. When changing installed helper scripts or docs, run \`node scripts/managed-artifacts-check.mjs\` to prevent install/project-doctor/quickstart drift.
13. For a whole-system check, run \`node scripts/shuang-skill-manager.mjs system-audit --json\`; add \`--with-skill-studio\`, \`--with-install-smoke\`, or \`--with-sync-smoke\` when validating broader changes from the source repo.
14. Use \`shuang-router\` before claiming a feature is ready.
15. Use \`shuang-evolve\` after a task if the lesson should improve future workflows; for batch inbox review run \`node scripts/evolution-review.mjs\`; before promoting a ready note, run \`node scripts/evolution-promotion-package.mjs --note <note>\`.
16. When using private learning materials to improve skills, keep source paths in \`.shuang-skill/course-sources.local.json\`, run \`node scripts/course-source-health.mjs\`, and only commit distilled workflow rules.

Do not treat this block as full project guidance. Generate or refresh the project-specific rules with \`shuang-claude-md\` after reading this project's real README, package files, docs, and specs.
${MANAGED_END}
`;
  const next = replaceManagedBlock(current, block);
  if (next === current) {
    actions.push({ type: "unchanged-guidance", path: rel(cwd, file) });
    return;
  }
  if (!dryRun) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, next, "utf8");
  }
  actions.push({ type: dryRun ? "would-upsert-guidance" : "upsert-guidance", path: rel(cwd, file) });
}

function replaceManagedBlock(current, block) {
  if (!current.trim()) return `# Project Agent Guidance\n\n${block}`;
  const start = current.indexOf(MANAGED_START);
  const end = current.indexOf(MANAGED_END);
  if (start !== -1 && end !== -1 && end > start) {
    return `${current.slice(0, start).trimEnd()}\n\n${block}${current.slice(end + MANAGED_END.length).trimStart()}`;
  }
  return `${current.trimEnd()}\n\n${block}`;
}

function installHookTemplate(targetRoot, dryRun, actions) {
  const hookDir = path.join(targetRoot, CONFIG_DIR, "hooks");
  const hookFile = path.join(hookDir, "pre-push");
  const content = managedHookContent();
  ensureDir(hookDir, dryRun, actions);
  if (!dryRun) {
    fs.writeFileSync(hookFile, content, "utf8");
    fs.chmodSync(hookFile, 0o755);
  }
  actions.push({
    type: dryRun ? "would-create-hook-template" : "create-hook-template",
    path: rel(targetRoot, hookFile),
    detail: "activate with: node scripts/shuang-skill-manager.mjs hooks install",
  });
}

function managedHookContent() {
  return `#!/bin/sh
# ${HOOK_MARKER}
root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$root" || exit 1
node scripts/shuang-skill-manager.mjs guard || exit 1
`;
}

function runTargetValidation(targetRoot, dryRun, actions, installCodex) {
  if (dryRun) {
    actions.push({ type: "skip-validation", path: "target", detail: "dry-run" });
    return;
  }
  if (!installCodex) {
    actions.push({ type: "skip-validation", path: "target", detail: "codex install disabled" });
    return;
  }
  const validator = path.join(targetRoot, "scripts", "validate-skills.mjs");
  if (!fs.existsSync(validator)) {
    actions.push({ type: "skip-validation", path: "scripts/validate-skills.mjs", detail: "missing" });
    return;
  }
  const result = spawnSync(process.execPath, ["scripts/validate-skills.mjs"], {
    cwd: targetRoot,
    encoding: "utf8",
  });
  actions.push({
    type: result.status === 0 ? "validate-target-pass" : "validate-target-fail",
    path: "scripts/validate-skills.mjs",
    detail: (result.stdout || result.stderr || "").trim(),
  });
  if (result.status !== 0) {
    printActions(actions);
    process.exit(result.status ?? 1);
  }
}

function copyFiles(files, sourceRoot, targetRoot, dryRun, actions) {
  for (const [fromRel, toRel] of files) {
    const from = path.join(sourceRoot, fromRel);
    const to = path.join(targetRoot, toRel);
    if (!fs.existsSync(from)) {
      actions.push({ type: "missing-source-file", path: fromRel });
      continue;
    }
    if (!dryRun) {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
      if (fromRel.endsWith(".mjs")) fs.chmodSync(to, 0o755);
    }
    actions.push({ type: dryRun ? "would-copy-file" : "copy-file", path: toRel });
  }
}

function mirrorDir({ from, to, backupRoot, dryRun, actions }) {
  if (!fs.existsSync(from)) fail(`Source directory not found: ${from}`);
  if (fs.existsSync(to)) {
    const backup = backupPath(backupRoot, to);
    if (!dryRun) {
      fs.mkdirSync(path.dirname(backup), { recursive: true });
      fs.renameSync(to, backup);
    }
    actions.push({ type: dryRun ? "would-backup-dir" : "backup-dir", path: rel(backupRoot, backup) });
  }
  if (!dryRun) {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.cpSync(from, to, { recursive: true, dereference: false });
  }
  actions.push({ type: dryRun ? "would-mirror-dir" : "mirror-dir", path: rel(backupRoot, to) });
}

function backupPath(root, original) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const relative = rel(root, original).replaceAll("/", "__");
  return path.join(root, CONFIG_DIR, "backups", stamp, relative);
}

function ensureDir(dir, dryRun, actions) {
  if (fs.existsSync(dir)) return;
  if (!dryRun) fs.mkdirSync(dir, { recursive: true });
  actions.push({ type: dryRun ? "would-create-dir" : "create-dir", path: rel(cwd, dir) });
}

function writeJson(file, value, dryRun, actions) {
  if (!dryRun) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  }
  actions.push({ type: dryRun ? "would-write-json" : "write-json", path: rel(cwd, file) });
}

function dirsDiffer(a, b) {
  if (!fs.existsSync(a) || !fs.existsSync(b)) return true;
  const aFiles = listFiles(a);
  const bFiles = listFiles(b);
  if (aFiles.length !== bFiles.length) return true;
  for (let i = 0; i < aFiles.length; i += 1) {
    if (aFiles[i] !== bFiles[i]) return true;
    if (!filesEqual(path.join(a, aFiles[i]), path.join(b, bFiles[i]))) return true;
  }
  return false;
}

function listFiles(dir) {
  const out = [];
  walk(dir, dir, out);
  return out.sort();
}

function walk(root, dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(root, full, out);
    else if (entry.isFile()) out.push(rel(root, full));
  }
}

function filesEqual(a, b) {
  if (!fs.existsSync(a) || !fs.existsSync(b)) return false;
  const as = fs.statSync(a);
  const bs = fs.statSync(b);
  if (as.size !== bs.size) return false;
  return fs.readFileSync(a).equals(fs.readFileSync(b));
}

function listDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function readConfig(root, required = true) {
  const file = path.join(root, CONFIG_FILE);
  if (!fs.existsSync(file)) {
    if (required) fail(`Missing ${CONFIG_FILE} in ${root}. Pass --source explicitly or run install first.`);
    return null;
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function assertSourceRoot(root) {
  if (!fs.existsSync(path.join(root, ".codex", "skills"))) {
    fail(`Not a shuang-skill source root: ${root}`);
  }
}

function resolveRequiredPath(value, name) {
  if (!value) fail(`Missing --${name}`);
  return resolveRoot(value, name);
}

function resolveRoot(value, name) {
  if (!value) fail(`Missing ${name} root`);
  const resolved = path.resolve(value);
  if (!fs.existsSync(resolved)) fail(`${name} root does not exist: ${resolved}`);
  return resolved;
}

function printActions(actions) {
  for (const action of actions) {
    const suffix = action.detail ? ` - ${compact(action.detail)}` : "";
    console.log(`[${action.type}] ${action.path}${suffix}`);
  }
  console.log("");
  console.log(JSON.stringify({
    actions: actions.length,
    applied: actions.filter((a) => {
      if (a.type.startsWith("would-")) return false;
      if (a.type.startsWith("unchanged-")) return false;
      if (a.type.startsWith("skip-")) return false;
      return a.type !== "dry-run";
    }).length,
  }, null, 2));
}

function compact(text) {
  const oneLine = String(text).replace(/\s+/g, " ").trim();
  return oneLine.length > 240 ? `${oneLine.slice(0, 237)}...` : oneLine;
}

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) {
      out._.push(item);
      continue;
    }
    const equalsIndex = item.indexOf("=");
    if (equalsIndex !== -1) {
      out[item.slice(2, equalsIndex)] = item.slice(equalsIndex + 1);
      continue;
    }
    const key = item.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      out[key] = next;
      i += 1;
    } else {
      out[key] = true;
    }
  }
  return out;
}

function rel(root, file) {
  return path.relative(root, file) || ".";
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
