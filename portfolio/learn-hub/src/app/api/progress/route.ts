import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  migrate,
  listProgress,
  getProgressById,
  updateProgressById,
  getProgressSummary,
  listMaterials,
} from "@/lib/db";
import { resolveTopicLinks } from "@/lib/docs/resolve-links";

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["done", "learning", "todo"]),
});

export async function GET() {
  migrate();
  const materials = listMaterials();
  const items = listProgress().map((item) => ({
    ...item,
    links: resolveTopicLinks(item, materials),
  }));
  const summary = getProgressSummary();
  return NextResponse.json({ items, summary });
}

export async function PATCH(request: NextRequest) {
  migrate();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { id, status } = parsed.data;
  const existing = getProgressById(id);
  if (!existing) {
    return NextResponse.json({ error: "Progress item not found" }, { status: 404 });
  }

  const updated = updateProgressById(id, { status });
  return NextResponse.json({ item: updated });
}
