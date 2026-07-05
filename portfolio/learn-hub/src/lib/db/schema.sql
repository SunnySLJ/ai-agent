-- AI Learn Hub · SQLite schema

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  week TEXT,
  tags TEXT DEFAULT '[]',
  source TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS note_chunks (
  id TEXT PRIMARY KEY,
  note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding TEXT
);

CREATE INDEX IF NOT EXISTS idx_note_chunks_note_id ON note_chunks(note_id);

CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  mastered INTEGER NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  last_reviewed TEXT
);

CREATE INDEX IF NOT EXISTS idx_cards_note_id ON cards(note_id);

CREATE TABLE IF NOT EXISTS interview_questions (
  id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  mastered INTEGER NOT NULL DEFAULT 0,
  note_id TEXT REFERENCES notes(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_interview_topic ON interview_questions(topic);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  citations TEXT DEFAULT '[]',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_messages(session_id);

CREATE TABLE IF NOT EXISTS progress (
  id TEXT PRIMARY KEY,
  week TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'todo',
  category TEXT,
  course_part TEXT,
  code_path TEXT,
  standard TEXT,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_progress_week ON progress(week);
CREATE INDEX IF NOT EXISTS idx_progress_category ON progress(category);

CREATE TABLE IF NOT EXISTS learning_steps (
  id TEXT PRIMARY KEY,
  week TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  action TEXT,
  course_part TEXT,
  code_path TEXT,
  deliverable TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_steps_week ON learning_steps(week);
CREATE INDEX IF NOT EXISTS idx_steps_order ON learning_steps(week, step_order);

CREATE TABLE IF NOT EXISTS agent_modules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT,
  description TEXT,
  code_path TEXT,
  interview_script TEXT
);

-- 学习资料（存数据库，学习路线链接到此，不再读 agent/ 目录）
CREATE TABLE IF NOT EXISTS materials (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  week TEXT,
  category TEXT,
  step_id TEXT,
  topic_id TEXT,
  source TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_materials_step ON materials(step_id);
CREATE INDEX IF NOT EXISTS idx_materials_topic ON materials(topic_id);
CREATE INDEX IF NOT EXISTS idx_materials_week ON materials(week);

CREATE TABLE IF NOT EXISTS material_chunks (
  id TEXT PRIMARY KEY,
  material_id TEXT NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding TEXT
);

CREATE INDEX IF NOT EXISTS idx_material_chunks_material ON material_chunks(material_id);
