import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getDatabasePath } from "../paths";

const SCHEMA_PATH = path.join(process.cwd(), "src/lib/db/schema.sql");
const DEFAULT_DB_PATH = getDatabasePath();

let dbInstance: Database.Database | null = null;

export type Note = {
  id: string;
  title: string;
  content: string;
  week: string | null;
  tags: string;
  source: string | null;
  created_at: string;
  updated_at: string;
};

export type InsertNoteInput = {
  title: string;
  content: string;
  week?: string;
  tags?: string[];
  source?: string;
};

export type NoteChunk = {
  id: string;
  note_id: string;
  chunk_index: number;
  content: string;
  embedding: string | null;
};

export type Card = {
  id: string;
  note_id: string;
  question: string;
  answer: string;
  mastered: number;
  review_count: number;
  last_reviewed: string | null;
};

export type InterviewQuestion = {
  id: string;
  topic: string;
  question: string;
  answer: string;
  difficulty: string;
  mastered: number;
  note_id: string | null;
};

export type ChatMessage = {
  id: string;
  session_id: string;
  role: string;
  content: string;
  citations: string;
  created_at: string;
};

export type Progress = {
  id: string;
  week: string;
  title: string;
  status: string;
  category: string | null;
  course_part: string | null;
  code_path: string | null;
  standard: string | null;
  updated_at: string;
};

export type LearningStep = {
  id: string;
  week: string;
  step_order: number;
  category: string;
  title: string;
  action: string | null;
  course_part: string | null;
  code_path: string | null;
  deliverable: string | null;
  status: string;
  updated_at: string;
};

export type AgentModule = {
  id: string;
  name: string;
  parent_id: string | null;
  description: string | null;
  code_path: string | null;
  interview_script: string | null;
};

export function getDb(dbPath?: string): Database.Database {
  if (dbPath) {
    const db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    return db;
  }

  if (!dbInstance) {
    const dir = path.dirname(DEFAULT_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    dbInstance = new Database(DEFAULT_DB_PATH);
    dbInstance.pragma("journal_mode = WAL");
    dbInstance.pragma("foreign_keys = ON");
  }

  return dbInstance;
}

export function migrate(db?: Database.Database): void {
  const database = db ?? getDb();

  const progressCols = (
    database.prepare("PRAGMA table_info(progress)").all() as { name: string }[]
  ).map((c) => c.name);

  if (progressCols.length > 0) {
    const addProgressCol = (col: string, ddl: string) => {
      if (!progressCols.includes(col)) {
        database.exec(`ALTER TABLE progress ADD COLUMN ${ddl}`);
      }
    };
    addProgressCol("category", "category TEXT");
    addProgressCol("course_part", "course_part TEXT");
    addProgressCol("code_path", "code_path TEXT");
    addProgressCol("standard", "standard TEXT");
  }

  const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
  database.exec(schema);
}

export function insertNote(
  input: InsertNoteInput,
  db: Database.Database = getDb()
): Note {
  const now = new Date().toISOString();
  const note: Note = {
    id: uuidv4(),
    title: input.title,
    content: input.content,
    week: input.week ?? null,
    tags: JSON.stringify(input.tags ?? []),
    source: input.source ?? null,
    created_at: now,
    updated_at: now,
  };

  db.prepare(
    `INSERT INTO notes (id, title, content, week, tags, source, created_at, updated_at)
     VALUES (@id, @title, @content, @week, @tags, @source, @created_at, @updated_at)`
  ).run(note);

  return note;
}

export function updateNote(
  id: string,
  input: Partial<InsertNoteInput>,
  db: Database.Database = getDb()
): Note | undefined {
  const existing = getNoteById(id, db);
  if (!existing) return undefined;

  const now = new Date().toISOString();
  const updated: Note = {
    ...existing,
    title: input.title ?? existing.title,
    content: input.content ?? existing.content,
    week: input.week !== undefined ? (input.week ?? null) : existing.week,
    tags:
      input.tags !== undefined
        ? JSON.stringify(input.tags)
        : existing.tags,
    source:
      input.source !== undefined ? (input.source ?? null) : existing.source,
    updated_at: now,
  };

  db.prepare(
    `UPDATE notes SET title = @title, content = @content, week = @week,
     tags = @tags, source = @source, updated_at = @updated_at WHERE id = @id`
  ).run({ ...updated, id });

  return updated;
}

export function deleteNoteChunksByNoteId(
  noteId: string,
  db: Database.Database = getDb()
): void {
  db.prepare("DELETE FROM note_chunks WHERE note_id = ?").run(noteId);
}

export function getNoteById(
  id: string,
  db: Database.Database = getDb()
): Note | undefined {
  return db.prepare("SELECT * FROM notes WHERE id = ?").get(id) as
    | Note
    | undefined;
}

export function listNotes(
  filters?: { week?: string; tag?: string },
  db: Database.Database = getDb()
): Note[] {
  let sql = "SELECT * FROM notes WHERE 1=1";
  const params: string[] = [];

  if (filters?.week) {
    sql += " AND week = ?";
    params.push(filters.week);
  }

  if (filters?.tag) {
    sql += " AND tags LIKE ?";
    params.push(`%"${filters.tag}"%`);
  }

  sql += " ORDER BY created_at DESC";

  return db.prepare(sql).all(...params) as Note[];
}

export function deleteNote(
  id: string,
  db: Database.Database = getDb()
): boolean {
  const result = db.prepare("DELETE FROM notes WHERE id = ?").run(id);
  return result.changes > 0;
}

export type Material = {
  id: string;
  title: string;
  content: string;
  week: string | null;
  category: string | null;
  step_id: string | null;
  topic_id: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
};

export type InsertMaterialInput = {
  id?: string;
  title: string;
  content: string;
  week?: string;
  category?: string;
  step_id?: string;
  topic_id?: string;
  source?: string;
};

export function insertMaterial(
  input: InsertMaterialInput,
  db: Database.Database = getDb()
): Material {
  const now = new Date().toISOString();
  const material: Material = {
    id: input.id ?? uuidv4(),
    title: input.title,
    content: input.content,
    week: input.week ?? null,
    category: input.category ?? null,
    step_id: input.step_id ?? null,
    topic_id: input.topic_id ?? null,
    source: input.source ?? null,
    created_at: now,
    updated_at: now,
  };
  db.prepare(
    `INSERT INTO materials (id, title, content, week, category, step_id, topic_id, source, created_at, updated_at)
     VALUES (@id, @title, @content, @week, @category, @step_id, @topic_id, @source, @created_at, @updated_at)`
  ).run(material);
  return material;
}

export function upsertMaterial(
  input: InsertMaterialInput & { id: string },
  db: Database.Database = getDb()
): Material {
  const existing = getMaterialById(input.id, db);
  if (existing) {
    return updateMaterial(input.id, input, db)!;
  }
  return insertMaterial(input, db);
}

export function updateMaterial(
  id: string,
  input: Partial<InsertMaterialInput>,
  db: Database.Database = getDb()
): Material | undefined {
  const existing = getMaterialById(id, db);
  if (!existing) return undefined;
  const updated: Material = {
    ...existing,
    title: input.title ?? existing.title,
    content: input.content ?? existing.content,
    week: input.week !== undefined ? (input.week ?? null) : existing.week,
    category:
      input.category !== undefined ? (input.category ?? null) : existing.category,
    step_id:
      input.step_id !== undefined ? (input.step_id ?? null) : existing.step_id,
    topic_id:
      input.topic_id !== undefined ? (input.topic_id ?? null) : existing.topic_id,
    source:
      input.source !== undefined ? (input.source ?? null) : existing.source,
    updated_at: new Date().toISOString(),
  };
  db.prepare(
    `UPDATE materials SET title = @title, content = @content, week = @week,
     category = @category, step_id = @step_id, topic_id = @topic_id,
     source = @source, updated_at = @updated_at WHERE id = @id`
  ).run({ ...updated, id });
  return updated;
}

export function deleteMaterial(
  id: string,
  db: Database.Database = getDb()
): boolean {
  const result = db.prepare("DELETE FROM materials WHERE id = ?").run(id);
  return result.changes > 0;
}

export function getMaterialById(
  id: string,
  db: Database.Database = getDb()
): Material | undefined {
  return db.prepare("SELECT * FROM materials WHERE id = ?").get(id) as
    | Material
    | undefined;
}

export function listMaterials(
  filters?: { week?: string; step_id?: string; topic_id?: string },
  db: Database.Database = getDb()
): Material[] {
  let sql = "SELECT * FROM materials WHERE 1=1";
  const params: string[] = [];
  if (filters?.week) {
    sql += " AND week = ?";
    params.push(filters.week);
  }
  if (filters?.step_id) {
    sql += " AND step_id = ?";
    params.push(filters.step_id);
  }
  if (filters?.topic_id) {
    sql += " AND topic_id = ?";
    params.push(filters.topic_id);
  }
  sql += " ORDER BY week, title";
  return db.prepare(sql).all(...params) as Material[];
}

export function deleteMaterialChunksByMaterialId(
  materialId: string,
  db: Database.Database = getDb()
): void {
  db.prepare("DELETE FROM material_chunks WHERE material_id = ?").run(materialId);
}

export function insertMaterialChunk(
  input: { material_id: string; chunk_index: number; content: string; embedding: string },
  db: Database.Database = getDb()
): void {
  db.prepare(
    `INSERT INTO material_chunks (id, material_id, chunk_index, content, embedding)
     VALUES (@id, @material_id, @chunk_index, @content, @embedding)`
  ).run({ id: uuidv4(), ...input });
}

export function insertNoteChunk(
  input: Omit<NoteChunk, "id">,
  db: Database.Database = getDb()
): NoteChunk {
  const chunk: NoteChunk = { id: uuidv4(), ...input };
  db.prepare(
    `INSERT INTO note_chunks (id, note_id, chunk_index, content, embedding)
     VALUES (@id, @note_id, @chunk_index, @content, @embedding)`
  ).run(chunk);
  return chunk;
}

export function listNoteChunksByNoteId(
  noteId: string,
  db: Database.Database = getDb()
): NoteChunk[] {
  return db
    .prepare(
      "SELECT * FROM note_chunks WHERE note_id = ? ORDER BY chunk_index ASC"
    )
    .all(noteId) as NoteChunk[];
}

export type NoteChunkWithTitle = NoteChunk & { note_title: string };

export function listAllNoteChunks(
  db: Database.Database = getDb()
): NoteChunkWithTitle[] {
  const noteChunks = db
    .prepare(
      `SELECT nc.*, n.title AS note_title
       FROM note_chunks nc
       JOIN notes n ON n.id = nc.note_id
       WHERE nc.embedding IS NOT NULL
       ORDER BY nc.note_id, nc.chunk_index`
    )
    .all() as NoteChunkWithTitle[];

  const materialChunks = db
    .prepare(
      `SELECT mc.id, mc.material_id AS note_id, mc.chunk_index, mc.content, mc.embedding,
              m.title AS note_title
       FROM material_chunks mc
       JOIN materials m ON m.id = mc.material_id
       WHERE mc.embedding IS NOT NULL
       ORDER BY mc.material_id, mc.chunk_index`
    )
    .all() as NoteChunkWithTitle[];

  return [...noteChunks, ...materialChunks];
}

export function insertCard(
  input: Omit<Card, "id" | "mastered" | "review_count" | "last_reviewed">,
  db: Database.Database = getDb()
): Card {
  const card: Card = {
    id: uuidv4(),
    ...input,
    mastered: 0,
    review_count: 0,
    last_reviewed: null,
  };
  db.prepare(
    `INSERT INTO cards (id, note_id, question, answer, mastered, review_count, last_reviewed)
     VALUES (@id, @note_id, @question, @answer, @mastered, @review_count, @last_reviewed)`
  ).run(card);
  return card;
}

export function listCards(
  filters?: { week?: string; mastered?: number },
  db: Database.Database = getDb()
): Card[] {
  let sql = `SELECT c.* FROM cards c
    JOIN notes n ON n.id = c.note_id
    WHERE 1=1`;
  const params: (string | number)[] = [];

  if (filters?.week) {
    sql += " AND n.week = ?";
    params.push(filters.week);
  }
  if (filters?.mastered !== undefined) {
    sql += " AND c.mastered = ?";
    params.push(filters.mastered);
  }

  sql += " ORDER BY c.id";

  return db.prepare(sql).all(...params) as Card[];
}

export function getCardById(
  id: string,
  db: Database.Database = getDb()
): Card | undefined {
  return db.prepare("SELECT * FROM cards WHERE id = ?").get(id) as
    | Card
    | undefined;
}

export function updateCard(
  id: string,
  patch: Partial<Pick<Card, "mastered" | "review_count" | "last_reviewed">>,
  db: Database.Database = getDb()
): void {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (patch.mastered !== undefined) {
    fields.push("mastered = ?");
    values.push(patch.mastered);
  }
  if (patch.review_count !== undefined) {
    fields.push("review_count = ?");
    values.push(patch.review_count);
  }
  if (patch.last_reviewed !== undefined) {
    fields.push("last_reviewed = ?");
    values.push(patch.last_reviewed);
  }

  if (fields.length === 0) return;

  values.push(id);
  db.prepare(`UPDATE cards SET ${fields.join(", ")} WHERE id = ?`).run(
    ...values
  );
}

export function insertInterviewQuestion(
  input: Omit<InterviewQuestion, "id" | "mastered">,
  db: Database.Database = getDb()
): InterviewQuestion {
  const row: InterviewQuestion = { id: uuidv4(), ...input, mastered: 0 };
  db.prepare(
    `INSERT INTO interview_questions (id, topic, question, answer, difficulty, mastered, note_id)
     VALUES (@id, @topic, @question, @answer, @difficulty, @mastered, @note_id)`
  ).run(row);
  return row;
}

export function listInterviewQuestions(
  filters?: { topic?: string; mastered?: number },
  db: Database.Database = getDb()
): InterviewQuestion[] {
  let sql = "SELECT * FROM interview_questions WHERE 1=1";
  const params: (string | number)[] = [];

  if (filters?.topic) {
    sql += " AND topic = ?";
    params.push(filters.topic);
  }
  if (filters?.mastered !== undefined) {
    sql += " AND mastered = ?";
    params.push(filters.mastered);
  }

  sql += " ORDER BY topic, id";

  return db.prepare(sql).all(...params) as InterviewQuestion[];
}

export function updateInterviewQuestion(
  id: string,
  patch: Partial<Pick<InterviewQuestion, "mastered">>,
  db: Database.Database = getDb()
): void {
  if (patch.mastered === undefined) return;
  db.prepare("UPDATE interview_questions SET mastered = ? WHERE id = ?").run(
    patch.mastered,
    id
  );
}

export function insertChatMessage(
  input: Omit<ChatMessage, "id" | "created_at">,
  db: Database.Database = getDb()
): ChatMessage {
  const message: ChatMessage = {
    id: uuidv4(),
    ...input,
    created_at: new Date().toISOString(),
  };
  db.prepare(
    `INSERT INTO chat_messages (id, session_id, role, content, citations, created_at)
     VALUES (@id, @session_id, @role, @content, @citations, @created_at)`
  ).run(message);
  return message;
}

export function listChatMessagesBySession(
  sessionId: string,
  db: Database.Database = getDb()
): ChatMessage[] {
  return db
    .prepare(
      "SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC"
    )
    .all(sessionId) as ChatMessage[];
}

export function upsertProgress(
  input: Omit<Progress, "updated_at"> & {
    category?: string | null;
    course_part?: string | null;
    code_path?: string | null;
    standard?: string | null;
  },
  db: Database.Database = getDb()
): Progress {
  const row: Progress = {
    id: input.id,
    week: input.week,
    title: input.title,
    status: input.status,
    category: input.category ?? null,
    course_part: input.course_part ?? null,
    code_path: input.code_path ?? null,
    standard: input.standard ?? null,
    updated_at: new Date().toISOString(),
  };
  db.prepare(
    `INSERT INTO progress (id, week, title, status, category, course_part, code_path, standard, updated_at)
     VALUES (@id, @week, @title, @status, @category, @course_part, @code_path, @standard, @updated_at)
     ON CONFLICT(id) DO UPDATE SET
       week = excluded.week,
       title = excluded.title,
       status = excluded.status,
       category = excluded.category,
       course_part = excluded.course_part,
       code_path = excluded.code_path,
       standard = excluded.standard,
       updated_at = excluded.updated_at`
  ).run(row);
  return row;
}

export function listProgress(db: Database.Database = getDb()): Progress[] {
  return db
    .prepare("SELECT * FROM progress ORDER BY week, id")
    .all() as Progress[];
}

export function getProgressById(
  id: string,
  db: Database.Database = getDb()
): Progress | undefined {
  return db.prepare("SELECT * FROM progress WHERE id = ?").get(id) as
    | Progress
    | undefined;
}

export function updateProgressById(
  id: string,
  patch: Partial<Pick<Progress, "status">>,
  db: Database.Database = getDb()
): Progress | undefined {
  if (patch.status === undefined) return getProgressById(id, db);

  const now = new Date().toISOString();
  db.prepare(
    "UPDATE progress SET status = ?, updated_at = ? WHERE id = ?"
  ).run(patch.status, now, id);

  return getProgressById(id, db);
}

export function getProgressSummary(db: Database.Database = getDb()): {
  total: number;
  done: number;
  percent: number;
} {
  const rows = db
    .prepare(
      `SELECT status, COUNT(*) as count FROM progress GROUP BY status`
    )
    .all() as { status: string; count: number }[];

  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const done = rows.find((row) => row.status === "done")?.count ?? 0;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return { total, done, percent };
}

export function insertAgentModule(
  input: Omit<AgentModule, "id"> & { id?: string },
  db: Database.Database = getDb()
): AgentModule {
  const module: AgentModule = {
    id: input.id ?? uuidv4(),
    name: input.name,
    parent_id: input.parent_id ?? null,
    description: input.description ?? null,
    code_path: input.code_path ?? null,
    interview_script: input.interview_script ?? null,
  };
  db.prepare(
    `INSERT INTO agent_modules (id, name, parent_id, description, code_path, interview_script)
     VALUES (@id, @name, @parent_id, @description, @code_path, @interview_script)`
  ).run(module);
  return module;
}

export function listAgentModules(
  db: Database.Database = getDb()
): AgentModule[] {
  return db
    .prepare("SELECT * FROM agent_modules ORDER BY parent_id, name")
    .all() as AgentModule[];
}

export function upsertLearningStep(
  input: Omit<LearningStep, "updated_at">,
  db: Database.Database = getDb()
): LearningStep {
  const row: LearningStep = {
    ...input,
    updated_at: new Date().toISOString(),
  };
  db.prepare(
    `INSERT INTO learning_steps (id, week, step_order, category, title, action, course_part, code_path, deliverable, status, updated_at)
     VALUES (@id, @week, @step_order, @category, @title, @action, @course_part, @code_path, @deliverable, @status, @updated_at)
     ON CONFLICT(id) DO UPDATE SET
       week = excluded.week,
       step_order = excluded.step_order,
       category = excluded.category,
       title = excluded.title,
       action = excluded.action,
       course_part = excluded.course_part,
       code_path = excluded.code_path,
       deliverable = excluded.deliverable,
       status = excluded.status,
       updated_at = excluded.updated_at`
  ).run(row);
  return row;
}

export function listLearningSteps(
  filters?: { week?: string },
  db: Database.Database = getDb()
): LearningStep[] {
  let sql =
    "SELECT * FROM learning_steps WHERE 1=1";
  const params: string[] = [];
  if (filters?.week) {
    sql += " AND week = ?";
    params.push(filters.week);
  }
  sql += " ORDER BY week, step_order";
  return db.prepare(sql).all(...params) as LearningStep[];
}

export function updateLearningStepStatus(
  id: string,
  status: string,
  db: Database.Database = getDb()
): LearningStep | undefined {
  const now = new Date().toISOString();
  db.prepare(
    "UPDATE learning_steps SET status = ?, updated_at = ? WHERE id = ?"
  ).run(status, now, id);
  return db.prepare("SELECT * FROM learning_steps WHERE id = ?").get(id) as
    | LearningStep
    | undefined;
}

export function getLearningStepSummary(db: Database.Database = getDb()): {
  total: number;
  done: number;
} {
  const rows = db
    .prepare(
      `SELECT status, COUNT(*) as count FROM learning_steps GROUP BY status`
    )
    .all() as { status: string; count: number }[];
  const total = rows.reduce((s, r) => s + r.count, 0);
  const done = rows.find((r) => r.status === "done")?.count ?? 0;
  return { total, done };
}
