import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  migrate,
  listMaterials,
  insertMaterial,
  insertMaterialChunk,
  deleteMaterialChunksByMaterialId,
} from "@/lib/db";
import { chunkMarkdown } from "@/lib/rag/chunk";
import { embedText } from "@/lib/rag/embed";

const postSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  week: z.string().optional(),
  category: z.string().optional(),
  step_id: z.string().optional(),
  topic_id: z.string().optional(),
  source: z.string().optional(),
});

async function indexMaterial(materialId: string, content: string) {
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
  return chunks.length;
}

export async function GET(request: NextRequest) {
  migrate();
  const { searchParams } = request.nextUrl;
  const week = searchParams.get("week") ?? undefined;
  const step_id = searchParams.get("step_id") ?? undefined;
  const topic_id = searchParams.get("topic_id") ?? undefined;

  const materials = listMaterials({ week, step_id, topic_id });
  return NextResponse.json({ materials });
}

export async function POST(request: NextRequest) {
  migrate();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const material = insertMaterial(parsed.data);
  const chunks = await indexMaterial(material.id, material.content);

  return NextResponse.json({ ...material, chunks }, { status: 201 });
}
