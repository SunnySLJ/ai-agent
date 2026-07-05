import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  migrate,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  deleteMaterialChunksByMaterialId,
  insertMaterialChunk,
} from "@/lib/db";
import { chunkMarkdown } from "@/lib/rag/chunk";
import { embedText } from "@/lib/rag/embed";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  week: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
});

async function reindexMaterial(materialId: string, content: string) {
  deleteMaterialChunksByMaterialId(materialId);
  const chunks = chunkMarkdown(content);
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await embedText(chunks[i]!);
    insertMaterialChunk({
      material_id: materialId,
      chunk_index: i,
      content: chunks[i]!,
      embedding: JSON.stringify(embedding),
    });
  }
}

export async function GET(_request: NextRequest, { params }: Params) {
  migrate();
  const { id } = await params;
  const material = getMaterialById(id);
  if (!material) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(material);
}

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

  const material = updateMaterial(id, {
    ...parsed.data,
    week: parsed.data.week ?? undefined,
    category: parsed.data.category ?? undefined,
    source: parsed.data.source ?? undefined,
  });

  if (!material) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (parsed.data.content !== undefined) {
    await reindexMaterial(id, material.content);
  }

  return NextResponse.json(material);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  migrate();
  const { id } = await params;
  const ok = deleteMaterial(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
