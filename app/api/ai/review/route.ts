import { NextResponse } from "next/server";
import { generateStructured } from "@/lib/ai/server";
import { extractFromRequest } from "@/lib/ai/extract";
import { xrayPayload } from "@/lib/ai/schema";
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
      xrayPayload,
      `${TENANT_BRIEF}

Produce review findings and a seven-seat AI Legal Review Board for ${filename}. PB-IT v4.2. Facts / interpretation / action stay distinct. Do not sign.

${text ? `CONTRACT TEXT:\n${text}` : "No new upload — reason over the Nimbus CT-291 demo matter in the tenant brief."}

Return the full xray object plus findings (issue cards with rec = amend|docs|reject|fallback|clarify|escalate|accept) and board seats. recommendation is renegotiate unless the paper already meets the house book.`,
    );
    return NextResponse.json({
      findings: raw.findings,
      board: raw.board,
      agreement: raw.agreement,
      recommendation: raw.recommendation,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Review failed";
    return jsonError(msg, 500);
  }
}
