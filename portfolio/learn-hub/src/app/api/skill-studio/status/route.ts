import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:3270/", {
      signal: AbortSignal.timeout(2000),
    });
    return NextResponse.json({
      online: res.ok,
      url: "http://127.0.0.1:3270",
    });
  } catch {
    return NextResponse.json({
      online: false,
      url: "http://127.0.0.1:3270",
    });
  }
}
