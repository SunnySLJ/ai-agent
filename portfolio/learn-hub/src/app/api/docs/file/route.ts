import { NextRequest, NextResponse } from "next/server";
import {
  readProjectFile,
  writeProjectFile,
  isEditableProjectPath,
} from "@/lib/docs/fs";

export async function GET(request: NextRequest) {
  const filePath = request.nextUrl.searchParams.get("path");
  if (!filePath) {
    return NextResponse.json({ error: "path required" }, { status: 400 });
  }

  try {
    const content = readProjectFile(filePath);
    return NextResponse.json({
      path: filePath,
      content,
      editable: isEditableProjectPath(filePath),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Read failed";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function PUT(request: NextRequest) {
  let body: { path?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { path: filePath, content } = body;
  if (!filePath || typeof content !== "string") {
    return NextResponse.json({ error: "path and content required" }, { status: 400 });
  }

  try {
    writeProjectFile(filePath, content);
    return NextResponse.json({ ok: true, path: filePath });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Write failed";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
