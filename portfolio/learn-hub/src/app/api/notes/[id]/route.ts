import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  migrate,
  getNoteById,
  updateNote,
  deleteNote,
  deleteNoteChunksByNoteId,
  insertNoteChunk,
} from "@/lib/db";
import { chunkMarkdown } from "@/lib/rag/chunk";
import { embedText } from "@/lib/rag/embed";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  week: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  source: z.string().optional().nullable(),
});

export async function GET(_request: NextRequest, { params }: Params) {
  migrate();
  const { id } = await params;
  const note = getNoteById(id);

  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...note,
    tags: JSON.parse(note.tags || "[]") as string[],
  });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  migrate();
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const note = updateNote(id, {
    ...parsed.data,
    week: parsed.data.week ?? undefined,
    source: parsed.data.source ?? undefined,
  });

  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  if (parsed.data.content !== undefined) {
    deleteNoteChunksByNoteId(id);
    const chunks = chunkMarkdown(note.content);
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await embedText(chunks[i]!);
      insertNoteChunk({
        note_id: id,
        chunk_index: i,
        content: chunks[i]!,
        embedding: JSON.stringify(embedding),
      });
    }
  }

  return NextResponse.json({
    ...note,
    tags: JSON.parse(note.tags || "[]") as string[],
  });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  migrate();
  const { id } = await params;
  if (!deleteNote(id)) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
