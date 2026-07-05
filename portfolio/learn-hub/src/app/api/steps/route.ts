import { NextRequest, NextResponse } from "next/server";
import {
  getDb,
  listLearningSteps,
  updateLearningStepStatus,
  getLearningStepSummary,
  listMaterials,
} from "@/lib/db";
import { resolveLearningStepLinks } from "@/lib/docs/resolve-links";

export async function GET(req: NextRequest) {
  const week = req.nextUrl.searchParams.get("week") ?? undefined;
  const db = getDb();
  const materials = listMaterials(undefined, db);
  const steps = listLearningSteps(week ? { week } : undefined, db).map(
    (step) => ({
      ...step,
      links: resolveLearningStepLinks(step, materials),
    })
  );
  const summary = getLearningStepSummary(db);
  return NextResponse.json({ steps, summary });
}

export async function PATCH(req: NextRequest) {
  const body = (await req.json()) as { id: string; status: string };
  if (!body.id || !body.status) {
    return NextResponse.json({ error: "id and status required" }, { status: 400 });
  }

  const valid = ["todo", "learning", "done"];
  if (!valid.includes(body.status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  const item = updateLearningStepStatus(body.id, body.status, getDb());
  if (!item) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ item });
}
