import type { Note } from "@/lib/db";
import { chatCompletion, hasOpenAIKey } from "./openai";

export type GeneratedInterview = {
  topic: string;
  question: string;
  answer: string;
  difficulty: string;
};

const DEFAULT_TOPICS = ["RAG", "Agent", "Eval", "LangGraph", "ProjectForge"];

function inferTopic(note: Pick<Note, "title" | "content" | "tags">): string {
  const tags = JSON.parse(note.tags || "[]") as string[];
  for (const tag of tags) {
    const hit = DEFAULT_TOPICS.find(
      (t) => t.toLowerCase() === tag.toLowerCase() || tag.includes(t)
    );
    if (hit) return hit;
  }
  const text = `${note.title} ${note.content}`.toLowerCase();
  if (text.includes("查证") || text.includes("claim-evidence") || text.includes("verified"))
    return "RAG";
  if (text.includes("langgraph")) return "LangGraph";
  if (text.includes("rag") || text.includes("retriev")) return "RAG";
  if (text.includes("agent")) return "Agent";
  if (text.includes("eval")) return "Eval";
  if (text.includes("projectforge") || text.includes("forge")) return "ProjectForge";
  return "RAG";
}

function ruleBasedInterview(
  note: Pick<Note, "title" | "content" | "tags">
): GeneratedInterview[] {
  const topic = inferTopic(note);
  const headings = [...note.content.matchAll(/^#{1,3}\s+(.+)$/gm)]
    .map((m) => m[1]?.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (headings.length === 0) {
    return [
      {
        topic,
        question: `请结合《${note.title}》说明一个关键概念。`,
        answer: note.content.slice(0, 400),
        difficulty: "medium",
      },
    ];
  }

  return headings.map((heading, i) => ({
    topic,
    question: `面试题：请解释「${heading}」及其在项目中的价值。`,
    answer: `参考笔记《${note.title}》中关于 ${heading} 的段落，结合业务场景与 trade-off 作答。`,
    difficulty: i === 0 ? "easy" : i === headings.length - 1 ? "hard" : "medium",
  }));
}

export async function generateInterviewFromNote(
  note: Pick<Note, "title" | "content" | "tags">
): Promise<GeneratedInterview[]> {
  if (!hasOpenAIKey()) return ruleBasedInterview(note);

  const content = await chatCompletion([
    {
      role: "system",
      content:
        '你是面试官。从笔记提取 3-5 道面试题，返回 JSON 数组 [{"topic":"RAG|Agent|Eval|LangGraph|ProjectForge","question":"...","answer":"...","difficulty":"easy|medium|hard"}]，不要 markdown 代码块。',
    },
    {
      role: "user",
      content: `标题：${note.title}\n标签：${note.tags}\n\n${note.content.slice(0, 6000)}`,
    },
  ]);

  if (!content) return ruleBasedInterview(note);

  try {
    const parsed = JSON.parse(content) as GeneratedInterview[];
    if (!Array.isArray(parsed)) return ruleBasedInterview(note);
    return parsed
      .filter((q) => q.question?.trim() && q.answer?.trim())
      .map((q) => ({
        topic: q.topic || inferTopic(note),
        question: q.question,
        answer: q.answer,
        difficulty: q.difficulty || "medium",
      }))
      .slice(0, 5);
  } catch {
    const match = content.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        return (JSON.parse(match[0]) as GeneratedInterview[]).slice(0, 5);
      } catch {
        return ruleBasedInterview(note);
      }
    }
    return ruleBasedInterview(note);
  }
}
