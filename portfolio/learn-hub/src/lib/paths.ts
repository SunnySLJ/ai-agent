import path from "path";

/** work/ai-agent 项目根目录（learn-hub 位于 portfolio/learn-hub） */
export function getProjectRoot(): string {
  return path.resolve(process.cwd(), "../..");
}

/** 统一 SQLite 路径：work/ai-agent/data/learn.db */
export function getDatabasePath(): string {
  if (process.env.DATABASE_PATH) {
    return path.resolve(process.env.DATABASE_PATH);
  }
  return path.join(getProjectRoot(), "data", "learn.db");
}
