import { NextRequest, NextResponse } from "next/server";
import { migrate, listCards } from "@/lib/db";

export async function GET(request: NextRequest) {
  migrate();
  const { searchParams } = request.nextUrl;
  const masteredParam = searchParams.get("mastered");
  const week = searchParams.get("week") ?? undefined;

  const filters: { week?: string; mastered?: number } = {};
  if (week) filters.week = week;
  if (masteredParam !== null) {
    filters.mastered = masteredParam === "1" ? 1 : 0;
  }

  const cards = listCards(filters);
  return NextResponse.json({ cards });
}
