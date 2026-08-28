import { NextResponse } from "next/server";
import { aiProviderLabel, isAiLive } from "@/lib/ai/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      live: isAiLive(),
      provider: aiProviderLabel(),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
