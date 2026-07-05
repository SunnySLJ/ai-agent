#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checks = [];
const installedTarget = fs.existsSync(path.join(root, ".shuang-skill", "config.json"));
const targetConfig = installedTarget
  ? JSON.parse(fs.readFileSync(path.join(root, ".shuang-skill", "config.json"), "utf8"))
  : null;

function addCheck(name, status, detail = "") {
  checks.push({ name, status, detail });
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function requirePath(rel, label = rel) {
  addCheck(
    label,
    exists(rel) ? "pass" : "fail",
    exists(rel) ? rel : `missing: ${rel}`
  );
}

function requireFileMatch(rel, pattern, label, expected) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    addCheck(label, "fail", `missing: ${rel}`);
    return;
  }
  const content = fs.readFileSync(file, "utf8");
  const matched = pattern.test(content);
  addCheck(
    label,
    matched ? "pass" : "fail",
    matched ? rel : `expected ${expected} in ${rel}`
  );
}

function warnIfExists(rel, label = rel) {
  addCheck(
    label,
    exists(rel) ? "warn" : "pass",
    exists(rel) ? `should not exist: ${rel}` : `absent: ${rel}`
  );
}

function checkExecutable(rel) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    addCheck(`${rel} executable`, "fail", `missing: ${rel}`);
    return;
  }
  const mode = fs.statSync(file).mode;
  addCheck(
    `${rel} executable`,
    (mode & 0o111) ? "pass" : "warn",
    (mode & 0o111) ? "has execute bit" : "not executable"
  );
}

if (installedTarget) {
  requirePath("AGENTS.md");
  requirePath("CLAUDE.md");
  requirePath(".shuang-skill/config.json");
  if (targetConfig?.codexSkills) {
    requirePath(".codex/skills/shuang-flow/SKILL.md");
    requirePath(".codex/skills/shuang-evolve/SKILL.md");
    requirePath(".codex/skill-groups/README.md");
  }
  if (targetConfig?.claudeSkills) {
    requirePath(".claude/skills/shuang-flow/SKILL.md");
    requirePath(".claude/skills/shuang-evolve/SKILL.md");
  }
  requirePath("docs/vibe-coding-operating-map.md");
  requirePath("docs/shuang-skill/getting-started-for-beginners.md");
  requirePath("docs/shuang-skill/new-project-quickstart.md");
  requirePath("docs/shuang-skill/dev-environment.md");
  requirePath("docs/shuang-skill/short-command-routes.md");
  requirePath("docs/shuang-skill/vibe-coding-capability-matrix.md");
  requirePath("docs/shuang-skill/vibe-system-requirement-audit.md");
  requirePath("docs/shuang-skill/hooks-and-plugins-roadmap.md");
  requirePath("docs/skill-evolution/README.md");
  requirePath("docs/skill-evolution/auto-upgrade-system.md");
  requirePath("docs/skill-evolution/course-source-ingestion.md");
  requirePath("docs/skill-evolution/course-source-registry.example.json");
  requirePath("docs/skill-evolution/inbox");
  requirePath("scripts/create-feature-intake.mjs");
  requirePath("scripts/project-audit.mjs");
  requirePath("scripts/project-readiness.mjs");
  requirePath("scripts/project-context-pack.mjs");
  requirePath("scripts/project-start.mjs");
  requirePath("scripts/beginner-drill.mjs");
  requirePath("scripts/short-command-route-smoke.mjs");
  requirePath("scripts/vibe-request-start.mjs");
  requirePath("scripts/vibe-request-check.mjs");
  requirePath("scripts/vibe-request-prompt.mjs");
  requirePath("scripts/vibe-request-status.mjs");
  requirePath("scripts/validate-skills.mjs");
  requirePath("scripts/create-evolution-note.mjs");
  requirePath("scripts/create-course-evolution-note.mjs");
  requirePath("scripts/evolution-inbox-status.mjs");
  requirePath("scripts/evolution-review.mjs");
  requirePath("scripts/evolution-promotion-package.mjs");
  requirePath("scripts/short-command-route-check.mjs");
  requirePath("scripts/vibe-workflow-coverage-check.mjs");
  requirePath("scripts/vibe-system-audit.mjs");
  requirePath("scripts/vibe-requirement-audit-check.mjs");
  requirePath("scripts/api-handoff-artifact-check.mjs");
  requirePath("scripts/managed-artifacts-check.mjs");
  requirePath("scripts/spec-kit-handoff-check.mjs");
  requirePath("scripts/course-source-health.mjs");
  requirePath("scripts/course-source-inventory.mjs");
  requirePath("scripts/course-local-extract.mjs");
  requirePath("scripts/course-extract-to-notes.mjs");
  requirePath("scripts/agent-workbench-boundary-check.mjs");
  requirePath("scripts/memory-placement-check.mjs");
  requirePath("scripts/project-doctor.mjs");
  requirePath("scripts/shuang-skill-manager.mjs");
} else {
  requirePath("README.md");
  requirePath("AGENTS.md");
  requirePath("CLAUDE.md");
  requirePath("docs/getting-started-for-beginners.md");
  requirePath("docs/new-project-quickstart.md");
  requirePath("docs/dev-environment.md");
  requirePath("docs/short-command-routes.md");
  requirePath("docs/vibe-coding-capability-matrix.md");
  requirePath("docs/vibe-system-requirement-audit.md");
  requirePath("docs/vibe-coding-operating-map.md");
  requirePath("docs/skill-evolution/auto-upgrade-system.md");
  requirePath("docs/skill-evolution/course-source-ingestion.md");
  requirePath("docs/skill-evolution/course-source-registry.example.json");
  requirePath(".codex/skills/shuang-flow/SKILL.md");
  requirePath(".codex/skills/shuang-evolve/SKILL.md");
  requirePath("Skill-Distiller/src/app/evolve/theater/page.tsx");
  requirePath("Skill-Distiller/src/app/library/page.tsx");
  requirePath("Skill-Distiller/src/components/nav.tsx");
  requirePath("scripts/create-feature-intake.mjs");
  requirePath("scripts/create-feature-intake.test.mjs");
  requirePath("scripts/skill-studio-route-smoke.mjs");
  requirePath("scripts/skill-studio-route-smoke.test.mjs");
  requirePath("scripts/project-audit.mjs");
  requirePath("scripts/project-audit.test.mjs");
  requirePath("scripts/project-readiness.mjs");
  requirePath("scripts/project-readiness.test.mjs");
  requirePath("scripts/project-context-pack.mjs");
  requirePath("scripts/project-context-pack.test.mjs");
  requirePath("scripts/project-start.mjs");
  requirePath("scripts/project-start.test.mjs");
  requirePath("scripts/beginner-drill.mjs");
  requirePath("scripts/beginner-drill.test.mjs");
  requirePath("scripts/shuang-skill-manager-request.test.mjs");
  requirePath("scripts/short-command-route-smoke.mjs");
  requirePath("scripts/short-command-route-smoke.test.mjs");
  requirePath("scripts/vibe-request-start.mjs");
  requirePath("scripts/vibe-request-start.test.mjs");
  requirePath("scripts/vibe-request-check.mjs");
  requirePath("scripts/vibe-request-check.test.mjs");
  requirePath("scripts/vibe-request-prompt.mjs");
  requirePath("scripts/vibe-request-prompt.test.mjs");
  requirePath("scripts/vibe-request-status.mjs");
  requirePath("scripts/vibe-request-status.test.mjs");
  requirePath("scripts/validate-skills.mjs");
  requirePath("scripts/validate-skills.test.mjs");
  requirePath("scripts/create-course-evolution-note.mjs");
  requirePath("scripts/evolution-inbox-status.mjs");
  requirePath("scripts/evolution-inbox-status.test.mjs");
  requirePath("scripts/evolution-review.mjs");
  requirePath("scripts/evolution-review.test.mjs");
  requirePath("scripts/evolution-promotion-package.mjs");
  requirePath("scripts/evolution-promotion-package.test.mjs");
  requirePath("scripts/short-command-route-check.mjs");
  requirePath("scripts/short-command-route-check.test.mjs");
  requirePath("scripts/vibe-workflow-coverage-check.mjs");
  requirePath("scripts/vibe-workflow-coverage-check.test.mjs");
  requirePath("scripts/vibe-system-audit.mjs");
  requirePath("scripts/vibe-system-audit.test.mjs");
  requirePath("scripts/vibe-requirement-audit-check.mjs");
  requirePath("scripts/vibe-requirement-audit-check.test.mjs");
  requirePath("scripts/sync-back-smoke.mjs");
  requirePath("scripts/sync-back-smoke.test.mjs");
  requirePath("scripts/shuang-skill-manager-hooks.test.mjs");
  requirePath("scripts/api-handoff-artifact-check.mjs");
  requirePath("scripts/api-handoff-artifact-check.test.mjs");
  requirePath("scripts/managed-artifacts-check.mjs");
  requirePath("scripts/managed-artifacts-check.test.mjs");
  requirePath("scripts/fresh-install-smoke.mjs");
  requirePath("scripts/fresh-install-smoke.test.mjs");
  requirePath("scripts/spec-kit-handoff-check.mjs");
  requirePath("scripts/spec-kit-handoff-check.test.mjs");
  requirePath("scripts/course-source-health.mjs");
  requirePath("scripts/course-source-health.test.mjs");
  requirePath("scripts/course-source-inventory.mjs");
  requirePath("scripts/course-source-inventory.test.mjs");
  requirePath("scripts/course-local-extract.mjs");
  requirePath("scripts/course-extract-to-notes.mjs");
  requirePath("scripts/agent-workbench-boundary-check.mjs");
  requirePath("scripts/agent-workbench-boundary-check.test.mjs");
  requirePath("scripts/memory-placement-check.mjs");
  requirePath("scripts/memory-placement-check.test.mjs");
  requireFileMatch(".python-version", /^3\.11(?:\.|$)/m, "Python version pin", "Python 3.11.x");
  requireFileMatch("requirements-dev.txt", /^PyYAML==/m, "Python dev dependency", "PyYAML pin");
  checkExecutable("start.sh");
  warnIfExists("Skill-Evolver", "legacy Skill-Evolver folder");
}

const boundary = spawnSync(process.execPath, ["scripts/agent-workbench-boundary-check.mjs"], {
  cwd: root,
  encoding: "utf8",
});

addCheck(
  "agent workbench boundary check",
  boundary.status === 0 ? "pass" : "fail",
  (boundary.stdout || boundary.stderr || "").trim()
);

const memoryPlacement = spawnSync(process.execPath, ["scripts/memory-placement-check.mjs"], {
  cwd: root,
  encoding: "utf8",
});

addCheck(
  "memory placement check",
  memoryPlacement.status === 0 ? "pass" : "fail",
  (memoryPlacement.stdout || memoryPlacement.stderr || "").trim()
);

const managedArtifacts = spawnSync(process.execPath, ["scripts/managed-artifacts-check.mjs"], {
  cwd: root,
  encoding: "utf8",
});

addCheck(
  "managed artifacts check",
  managedArtifacts.status === 0 ? "pass" : "fail",
  (managedArtifacts.stdout || managedArtifacts.stderr || "").trim()
);

const shortCommandRoute = spawnSync(process.execPath, ["scripts/short-command-route-check.mjs"], {
  cwd: root,
  encoding: "utf8",
});

addCheck(
  "short command route check",
  shortCommandRoute.status === 0 ? "pass" : "fail",
  (shortCommandRoute.stdout || shortCommandRoute.stderr || "").trim()
);

const vibeRequestCheck = spawnSync(process.execPath, ["scripts/vibe-request-check.mjs"], {
  cwd: root,
  encoding: "utf8",
});

addCheck(
  "vibe request check",
  vibeRequestCheck.status === 0 ? "pass" : "fail",
  (vibeRequestCheck.stdout || vibeRequestCheck.stderr || "").trim()
);

const vibeRequestStatus = spawnSync(process.execPath, ["scripts/vibe-request-status.mjs"], {
  cwd: root,
  encoding: "utf8",
});

addCheck(
  "vibe request status",
  vibeRequestStatus.status === 0 ? "pass" : "fail",
  (vibeRequestStatus.stdout || vibeRequestStatus.stderr || "").trim()
);

const vibeRequestPrompt = spawnSync(process.execPath, ["scripts/vibe-request-prompt.mjs"], {
  cwd: root,
  encoding: "utf8",
});

addCheck(
  "vibe request prompt",
  vibeRequestPrompt.status === 0 ? "pass" : "fail",
  (vibeRequestPrompt.stdout || vibeRequestPrompt.stderr || "").trim()
);

const contextPack = spawnSync(process.execPath, ["scripts/project-context-pack.mjs", "--json"], {
  cwd: root,
  encoding: "utf8",
  maxBuffer: 10 * 1024 * 1024,
});
const contextPackDetail = compactContextPackOutput(contextPack.stdout || contextPack.stderr || "");

addCheck(
  "project context pack",
  contextPack.status === 0 ? "pass" : "fail",
  contextPackDetail
);

const evolutionReview = spawnSync(process.execPath, ["scripts/evolution-review.mjs", "--json"], {
  cwd: root,
  encoding: "utf8",
});

addCheck(
  "evolution review",
  evolutionReview.status === 0 ? "pass" : "fail",
  (evolutionReview.stdout || evolutionReview.stderr || "").trim()
);

if (!installedTarget) {
  const skillStudioRouteSmoke = spawnSync(process.execPath, ["scripts/skill-studio-route-smoke.mjs"], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });

  addCheck(
    "skill studio route smoke",
    skillStudioRouteSmoke.status === 0 ? "pass" : "fail",
    (skillStudioRouteSmoke.stdout || skillStudioRouteSmoke.stderr || "").trim()
  );

  const vibeWorkflowCoverage = spawnSync(process.execPath, ["scripts/vibe-workflow-coverage-check.mjs"], {
    cwd: root,
    encoding: "utf8",
  });

  addCheck(
    "vibe workflow coverage check",
    vibeWorkflowCoverage.status === 0 ? "pass" : "fail",
    (vibeWorkflowCoverage.stdout || vibeWorkflowCoverage.stderr || "").trim()
  );
}

if (!installedTarget) {
  const syncBackSmoke = spawnSync(process.execPath, ["scripts/sync-back-smoke.mjs"], {
    cwd: root,
    encoding: "utf8",
  });

  addCheck(
    "sync-back smoke",
    syncBackSmoke.status === 0 ? "pass" : "fail",
    (syncBackSmoke.stdout || syncBackSmoke.stderr || "").trim()
  );

  const freshInstallSmoke = spawnSync(process.execPath, ["scripts/fresh-install-smoke.mjs"], {
    cwd: root,
    encoding: "utf8",
  });

  addCheck(
    "fresh install smoke",
    freshInstallSmoke.status === 0 ? "pass" : "fail",
    (freshInstallSmoke.stdout || freshInstallSmoke.stderr || "").trim()
  );
}

if (!installedTarget || targetConfig?.codexSkills) {
  const validate = spawnSync(process.execPath, ["scripts/validate-skills.mjs"], {
    cwd: root,
    encoding: "utf8",
  });

  addCheck(
    "skill structure validation",
    validate.status === 0 ? "pass" : "fail",
    (validate.stdout || validate.stderr || "").trim()
  );
}

const failures = checks.filter((check) => check.status === "fail");
const warnings = checks.filter((check) => check.status === "warn");

for (const check of checks) {
  const marker = check.status === "pass" ? "PASS" : check.status === "warn" ? "WARN" : "FAIL";
  console.log(`[${marker}] ${check.name}${check.detail ? ` - ${check.detail}` : ""}`);
}

console.log("");
console.log(JSON.stringify({
  checks: checks.length,
  failures: failures.length,
  warnings: warnings.length,
}, null, 2));

if (failures.length) process.exit(1);

function compactContextPackOutput(output) {
  const text = String(output || "").trim();
  if (!text) return "";
  try {
    const json = JSON.parse(text);
    return JSON.stringify({
      projectName: json.projectName,
      files: json.files?.length ?? 0,
      frameworkSignals: json.frameworkSignals || [],
    }, null, 2);
  } catch {
    return text.slice(0, 2000);
  }
}
