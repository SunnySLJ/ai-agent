import type { Note } from "@/lib/db";
import { chatCompletion, hasOpenAIKey } from "./openai";

export type GeneratedCard = { question: string; answer: string };

function ruleBasedCards(note: Pick<Note, "title" | "content">): GeneratedCard[] {
  const cards: GeneratedCard[] = [];
  const headingMatches = [...note.content.matchAll(/^#{1,3}\s+(.+)$/gm)];

  for (const match of headingMatches.slice(0, 5)) {
    const heading = match[1]?.trim();
    if (!heading) continue;
    const start = (match.index ?? 0) + match[0].length;
    const rest = note.content.slice(start);
    const nextHeading = rest.search(/^#{1,3}\s+/m);
    const body = (nextHeading === -1 ? rest : rest.slice(0, nextHeading))
      .trim()
      .split(/\n\n+/)
      .find((p) => p.trim() && !p.startsWith("#"));
    cards.push({
      question: `${heading} 是什么？`,
      answer: body?.slice(0, 300) || `关于「${heading}」的笔记要点，见原文《${note.title}》。`,
    });
  }

  if (cards.length === 0) {
    const lines = note.content
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));
    const snippet = lines.slice(0, 3).join(" ").slice(0, 200);
    cards.push({
      question: `《${note.title}》的核心内容是什么？`,
      answer: snippet || note.content.slice(0, 200),
    });
  }

  return cards.slice(0, 5);
}

export async function generateCardsFromNote(
  note: Pick<Note, "title" | "content">
): Promise<GeneratedCard[]> {
  if (!hasOpenAIKey()) return ruleBasedCards(note);

  const content = await chatCompletion([
    {
      role: "system",
      content:
        "你是学习助手。从笔记中提取 5 个高质量闪卡问答对，只返回 JSON 数组 [{\"question\":\"...\",\"answer\":\"...\"}]，不要 markdown 代码块。",
    },
    {
      role: "user",
      content: `标题：${note.title}\n\n${note.content.slice(0, 6000)}`,
    },
  ]);

  if (!content) return ruleBasedCards(note);

  try {
    const parsed = JSON.parse(content) as GeneratedCard[];
    if (!Array.isArray(parsed)) return ruleBasedCards(note);
    return parsed
      .filter((c) => c.question?.trim() && c.answer?.trim())
      .slice(0, 8);
  } catch {
    const match = content.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]) as GeneratedCard[];
        return parsed.filter((c) => c.question && c.answer).slice(0, 8);
      } catch {
        return ruleBasedCards(note);
      }
    }
    return ruleBasedCards(note);
  }
}
