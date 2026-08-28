import { NextResponse } from "next/server";
import { generateStructured } from "@/lib/ai/server";
import { extractFromRequest } from "@/lib/ai/extract";
import { xrayPayload } from "@/lib/ai/schema";
import { normalizeXray } from "@/lib/ai/normalize";
import { TENANT_BRIEF } from "@/lib/ai/house";
import { jsonError, requireLive } from "@/lib/ai/http";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  const blocked = requireLive();
  if (blocked) return blocked;
  const started = Date.now();
  try {
    const doc = await extractFromRequest(req);
    const raw = await generateStructured(
      xrayPayload,
      `Produce a complete Contract X-Ray for this instrument. Playbook for SaaS/cloud: PB-IT v4.2. ${TENANT_BRIEF}

Filename: ${doc.filename}
Approx pages: ${doc.pages}

CONTRACT TEXT:
${doc.text}

Return bilingual TE fields. Heatmap by clause. Missing clauses vs house playbook. Unusual vs house. Money, dates, parties. Thai law citations tied to clauses. layers MUST be exactly Fact / Legal interpretation / Suggested action (in that order, bilingual). Ladder: Preferred, Acceptable, Minimum, Walk-away. Brief is one page for management. Email is a counterparty draft — counsel sends it. Findings: 4–8 issue cards with evidence quotes in src/why. Board: seven specialized reviewers, not one chatbot. recommendation must not claim the engine signed.`,
    );
    const pack = normalizeXray(raw, { filename: doc.filename, pages: doc.pages, ms: Date.now() - started });
    return NextResponse.json(pack);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "X-Ray failed";
    return jsonError(msg, 500);
  }
}
