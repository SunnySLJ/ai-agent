import { NextRequest, NextResponse } from "next/server";
import { listImportantDocs } from "@/lib/docs/fs";

export async function GET() {
  return NextResponse.json({ docs: listImportantDocs() });
}
