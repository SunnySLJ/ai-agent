import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  migrate,
  listNotes,
  insertNote,
  insertNoteChunk,
  insertCard,
  insertInterviewQuestion,
} from "@/lib/db";
import { chunkMarkdown } from "@/lib/rag/chunk";
import { embedText } from "@/lib/rag/embed";
import { generateCardsFromNote } from "@/lib/ai/generate-cards";
import { generateInterviewFromNote } from "@/lib/ai/generate-interview";
import { hasOpenAIKey } from "@/lib/ai/openai";

const postSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  week: z.string().optional(),
  tags: z.array(z.string()).optional(),
  source: z.string().optional(),
  generateCards: z.boolean().optional(),
  generateInterview: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  migrate();
  const { searchParams } = request.nextUrl;
  const week = searchParams.get("week") ?? undefined;
  const tag = searchParams.get("tag") ?? undefined;

  const notes = listNotes({ week, tag }).map((note) => ({
    ...note,
    tags: JSON.parse(note.tags || "[]") as string[],
  }));

  return NextResponse.json({ notes });
}

export async function POST(request: NextRequest) {
  migrate();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    title,
    content,
    week,
    tags,
    source,
    generateCards,
    generateInterview,
  } = parsed.data;

  const note = insertNote({ title, content, week, tags, source });
  const chunks = chunkMarkdown(content);

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await embedText(chunks[i]!);
    insertNoteChunk({
      note_id: note.id,
      chunk_index: i,
      content: chunks[i]!,
      embedding: JSON.stringify(embedding),
    });
  }

  let cardsCreated = 0;
  let interviewCreated = 0;

  if (generateCards && hasOpenAIKey()) {
    const cards = await generateCardsFromNote(note);
    for (const card of cards) {
      insertCard({ note_id: note.id, question: card.question, answer: card.answer });
      cardsCreated++;
    }
  }

  if (generateInterview && hasOpenAIKey()) {
    const questions = await generateInterviewFromNote(note);
    for (const q of questions) {
      insertInterviewQuestion({
        topic: q.topic,
        question: q.question,
        answer: q.answer,
        difficulty: q.difficulty,
        note_id: note.id,
      });
      interviewCreated++;
    }
  }

  return NextResponse.json(
    {
      id: note.id,
      title: note.title,
      week: note.week,
      tags: JSON.parse(note.tags || "[]"),
      chunks: chunks.length,
      cardsCreated,
      interviewCreated,
    },
    { status: 201 }
  );
}
