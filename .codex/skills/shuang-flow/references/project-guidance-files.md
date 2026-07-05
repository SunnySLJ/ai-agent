# Project Guidance Files

Use this reference when creating or updating `AGENTS.md`, `Agent.md`, or `CLAUDE.md`.

## Source Files To Read

Before generating guidance, read available project truth:

1. `specs/prd.md`: business WHAT/WHY.
2. `specs/research/06-架构基线决策.md`: tech stack and selection rationale.
3. `.specify/memory/constitution.md`: principles and compliance checklist.
4. `DESIGN.md`: visual system.
5. `package.json`: real commands and dependency versions.
6. 2-3 feature dirs under `specs/`: task tag patterns.

If required files are missing, report missing sources instead of inventing facts.

## Course / Source-Code Materials

When project guidance is informed by learning material, source-code readings, or agent workbench courses:

- Extract only operating boundaries, not raw course text or implementation trivia.
- Convert tool/workbench internals into project-relevant rules: available commands, permission gates, verification gates, and file navigation.
- Do not claim the target project has a hook, plugin, MCP, slash command, or tool unless that file/config actually exists.
- Put reusable cross-project workflow in skills; put project-specific commands and constraints in `AGENTS.md` / `CLAUDE.md`.

## File-First Context Boundary

Before writing `AGENTS.md`, `Agent.md`, or `CLAUDE.md`, classify candidate content:

| Candidate content | Destination |
|---|---|
| Project commands, startup, verification, file navigation | `AGENTS.md` / `CLAUDE.md` |
| Stable user preference that applies beyond this repo | user memory or explicit user profile, not project guidance |
| Task retrospective or lesson learned | `docs/skill-evolution/inbox/*.md` |
| Cross-project workflow rule | `.codex/skills/**` via `shuang-evolve` |
| Long background, course theory, examples | `docs/` or skill `references/` |

Do not mix these slots. Project guidance should be a routing map for future sessions, not a memory dump.

If the project has `scripts/memory-placement-check.mjs`, run it after editing guidance files.

## AGENTS.md / Agent.md Framework

Keep the file under 200 lines. Avoid historical status markers such as `(已完成)` or `(已锁定)`.

Required sections:

1. Project WHAT: one paragraph from PRD.
2. Project WHY: one paragraph from PRD business goals.
3. Workflow HOW: 4-5 action blocks:
   - How to start a feature.
   - Which `@path` files every task must read.
   - Test discipline and relevant skill.
   - Feature completion action.
   - Cadence rules.
4. Tech stack table from real `package.json`.
5. Command list from `package.json scripts`.
6. Constitution reference using `@.specify/memory/constitution.md`.
7. Visual reference using `@DESIGN.md` and `design-reference/stitch-export/`.
8. Anti-patterns from constitution.
9. Behavioral Guidelines.
10. Key file navigation table.

Completion report:

- Total line count and token estimate.
- Section-to-source mapping table.
- Missing or uncertain information list.

## CLAUDE.md Karpathy-Inspired Appendix

When requested, append this section to `CLAUDE.md` without modifying other content:

```md
## Behavioral Guidelines (Karpathy-Inspired)

以下 4 条原则适用于全项目所有 task 实现期，目的是减少 AI 编码的常见失误。

### Think Before Coding

### Simplicity First

### Surgical Changes

### Goal-Driven Execution
```

If the user provides exact upstream wording for the four principles, preserve it verbatim and do not translate. If the wording is not available locally, fetch the source URL or ask the user before claiming exact preservation.
