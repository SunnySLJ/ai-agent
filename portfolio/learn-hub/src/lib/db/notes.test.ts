import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import {
  migrate,
  insertNote,
  getNoteById,
  listNotes,
} from "./index";

describe("notes CRUD", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(":memory:");
    db.pragma("foreign_keys = ON");
    migrate(db);
  });

  it("inserts and reads a note by id", () => {
    const created = insertNote(
      {
        title: "RAG Hybrid Search",
        content: "# Notes\n\nHybrid retrieval overview.",
        week: "W1",
        tags: ["RAG", "part05"],
        source: "agent/part05",
      },
      db
    );

    const found = getNoteById(created.id, db);
    expect(found).toBeDefined();
    expect(found?.title).toBe("RAG Hybrid Search");
    expect(found?.week).toBe("W1");
    expect(JSON.parse(found?.tags ?? "[]")).toEqual(["RAG", "part05"]);
  });

  it("lists notes filtered by week", () => {
    insertNote({ title: "W1 Note", content: "a", week: "W1" }, db);
    insertNote({ title: "W2 Note", content: "b", week: "W2" }, db);

    const w1Notes = listNotes({ week: "W1" }, db);
    expect(w1Notes).toHaveLength(1);
    expect(w1Notes[0].title).toBe("W1 Note");
  });
});
