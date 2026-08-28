import { NextResponse } from "next/server";
import { isAiLive } from "@/lib/ai/server";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message, live: isAiLive() }, { status });
}

export function requireLive() {
  if (isAiLive()) return null;
  return jsonError("Live AI is not configured. Add OPENAI_API_KEY or ANTHROPIC_API_KEY.", 503);
}
