import { NextResponse } from "next/server";
import { generateStructured } from "@/lib/ai/server";
import { extractFromRequest } from "@/lib/ai/extract";
import { reviewPack } from "@/lib/ai/schema";
import { normalizeReview } from "@/lib/ai/normalize";
import { TENANT_BRIEF } from "@/lib/ai/house";
import { jsonError, requireLive } from "@/lib/ai/http";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const blocked = requireLive();
  if (blocked) return blocked;
  try {
    let text = "";
    let filename = "Nimbus CT-291";
    try {
      const doc = await extractFromRequest(req);
      text = doc.text;
      filename = doc.filename;
    } catch {
      /* tenant brief */
    }
    const raw = await generateStructured(
      reviewPack,
      `${TENANT_BRIEF}

Produce review findings and a seven-seat AI Legal Review Board for ${filename}. PB-IT v4.2. Facts / interpretation / action stay distinct. Do not sign.

${text ? `CONTRACT TEXT:\n${text}` : "No new upload — reason over the Nimbus CT-291 demo matter in the tenant brief."}

Return 4–8 issue cards with evidence quotes in src/why and rec = amend|docs|reject|fallback|clarify|escalate|accept, plus board seats. Keep every field to one tight sentence. recommendation is renegotiate unless the paper already meets the house book, and must not claim the engine signed.`,
    );
    return NextResponse.json(normalizeReview(raw));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Review failed";
    return jsonError(msg, 500);
  }
}
