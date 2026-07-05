import { NextRequest, NextResponse } from "next/server";
import { migrate, listInterviewQuestions } from "@/lib/db";

export async function GET(request: NextRequest) {
  migrate();
  const { searchParams } = request.nextUrl;
  const topic = searchParams.get("topic") ?? undefined;
  const masteredParam = searchParams.get("mastered");

  const filters: { topic?: string; mastered?: number } = {};
  if (topic && topic !== "all") filters.topic = topic;
  if (masteredParam !== null) {
    filters.mastered = masteredParam === "1" ? 1 : 0;
  }

  const questions = listInterviewQuestions(filters);
  const topics = [
    ...new Set(
      listInterviewQuestions().map((q) => q.topic).filter(Boolean)
    ),
  ];

  const all = listInterviewQuestions(
    topic && topic !== "all" ? { topic } : undefined
  );
  const mastered = all.filter((q) => q.mastered === 1).length;

  return NextResponse.json({
    questions,
    topics,
    progress: { mastered, total: all.length },
  });
}
