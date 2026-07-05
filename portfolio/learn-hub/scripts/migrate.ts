import fs from "fs";
import path from "path";
import { getDb, migrate } from "../src/lib/db";
import { getDatabasePath } from "../src/lib/paths";

const DB_PATH = getDatabasePath();

const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = getDb(DB_PATH);
migrate(db);

console.log(`Migration complete: ${DB_PATH}`);
