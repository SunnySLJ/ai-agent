import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { migrate, getCardById, updateCard } from "@/lib/db";

const patchSchema = z.object({
  mastered: z.number().int().min(0).max(1).optional(),
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

  const existing = getCardById(id);
  if (!existing) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const patch: { mastered?: number; review_count?: number; last_reviewed?: string } =
    {};

  if (parsed.data.mastered !== undefined) {
    patch.mastered = parsed.data.mastered;
    patch.review_count = existing.review_count + 1;
    patch.last_reviewed = new Date().toISOString();
  }

  updateCard(id, patch);
  return NextResponse.json({ ok: true });
}
