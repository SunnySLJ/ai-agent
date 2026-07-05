import { NextRequest, NextResponse } from "next/server";
import { browseAgentCourse } from "@/lib/docs/fs";

type Params = { params: Promise<{ slug: string[] }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { slug } = await params;
  const relativePath = slug.map(decodeURIComponent).join("/");

  try {
    const result = browseAgentCourse(relativePath);
    return NextResponse.json({ ...result, editable: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Read failed";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
