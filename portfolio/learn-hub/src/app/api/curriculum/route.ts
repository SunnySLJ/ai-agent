import { NextResponse } from "next/server";
import {
  CATEGORIES,
  WEEKS,
  TOPICS,
  DEFERRED_COURSES,
  DAILY_MINIMUM,
} from "@/lib/curriculum/catalog";

export async function GET() {
  return NextResponse.json({
    categories: CATEGORIES,
    weeks: WEEKS,
    topics: TOPICS,
    deferred: DEFERRED_COURSES,
    dailyMinimum: DAILY_MINIMUM,
  });
}
