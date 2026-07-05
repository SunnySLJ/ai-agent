#!/usr/bin/env node
/** 路由冒烟测试 — 需 dev 服务器在 BASE 运行 */
const BASE = process.env.SMOKE_BASE || "http://127.0.0.1:3001";

const ROUTES = [
  "/",
  "/notes",
  "/notes/new",
  "/materials",
  "/roadmap",
  "/skills",
  "/review",
  "/chat",
  "/interview",
  "/my-agent",
  "/docs",
  "/api/notes",
  "/api/materials",
  "/api/steps",
  "/api/progress",
  "/api/skill-studio/status",
];

async function main() {
  let failed = 0;
  console.log(`Smoke test → ${BASE}\n`);

  for (const route of ROUTES) {
    try {
      const res = await fetch(`${BASE}${route}`, {
        redirect: "manual",
      });
      const ok = res.status >= 200 && res.status < 400;
      const mark = ok ? "✓" : "✗";
      console.log(`${mark} ${res.status} ${route}`);
      if (!ok) failed++;
    } catch (err) {
      console.log(`✗ ERR ${route} — ${err instanceof Error ? err.message : err}`);
      failed++;
    }
  }

  console.log("");
  if (failed > 0) {
    console.error(`FAILED: ${failed}/${ROUTES.length}`);
    process.exit(1);
  }
  console.log(`PASSED: ${ROUTES.length}/${ROUTES.length}`);
}

main();
