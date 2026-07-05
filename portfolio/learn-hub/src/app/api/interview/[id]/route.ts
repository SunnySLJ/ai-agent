import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { migrate, updateInterviewQuestion } from "@/lib/db";

const patchSchema = z.object({
  mastered: z.number().int().min(0).max(1),
});

type Params = { params: Promise<{ id: string }> };

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
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  updateInterviewQuestion(id, { mastered: parsed.data.mastered });
  return NextResponse.json({ ok: true });
}
