import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { migrate, listAllNoteChunks, insertChatMessage } from "@/lib/db";
import { embedText, parseEmbedding } from "@/lib/rag/embed";
import { searchChunks } from "@/lib/rag/search";
import { chatCompletion } from "@/lib/ai/openai";

const postSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().optional(),
});

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
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const { message, sessionId } = parsed.data;
  const sid = sessionId || uuidv4();

  insertChatMessage({
    session_id: sid,
    role: "user",
    content: message,
    citations: "[]",
  });

  const queryEmbedding = await embedText(message);
  const allChunks = listAllNoteChunks()
    .map((row) => {
      const embedding = parseEmbedding(row.embedding);
      if (!embedding) return null;
      return {
        id: row.id,
        content: row.content,
        embedding,
        note_id: row.note_id,
        note_title: row.note_title,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  const topChunks = searchChunks(queryEmbedding, allChunks, 5);

  const citations = topChunks.map((c) => ({
    chunkId: c.id,
    noteId: c.note_id,
    noteTitle: c.note_title,
    excerpt: c.content.slice(0, 160),
    score: c.score,
  }));

  const contextBlock = topChunks
    .map(
      (c, i) =>
        `[${i + 1}] 笔记《${c.note_title}》\n${c.content}`
    )
    .join("\n\n---\n\n");

  let answer: string;

  if (topChunks.length === 0) {
    answer =
      "当前知识库中暂无相关笔记。请先通过学习 Agent 写入笔记，或换个与已学内容相关的问题。";
  } else {
    const llmAnswer = await chatCompletion([
      {
        role: "system",
        content:
          "你是 AI Learn Hub 学习助手。仅根据用户提供的笔记片段回答问题；若片段不足以回答，请明确说明。回答简洁，使用中文，并在句末用 [1][2] 标注引用编号。",
      },
      {
        role: "user",
        content: `问题：${message}\n\n参考笔记：\n${contextBlock}`,
      },
    ]);

    if (llmAnswer) {
      answer = llmAnswer;
    } else {
      answer = `根据笔记检索到 ${topChunks.length} 条相关内容：\n\n${topChunks
        .map(
          (c, i) =>
            `[${i + 1}] 《${c.note_title}》：${c.content.slice(0, 200)}…`
        )
        .join("\n\n")}\n\n（未配置 OPENAI_API_KEY，仅展示检索结果）`;
    }
  }

  const assistantMsg = insertChatMessage({
    session_id: sid,
    role: "assistant",
    content: answer,
    citations: JSON.stringify(citations),
  });

  return NextResponse.json({
    sessionId: sid,
    message: {
      id: assistantMsg.id,
      role: assistantMsg.role,
      content: assistantMsg.content,
      citations,
      createdAt: assistantMsg.created_at,
    },
  });
}
