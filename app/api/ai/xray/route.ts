import { NextResponse } from "next/server";
import { generateStructured } from "@/lib/ai/server";
import { extractFromRequest } from "@/lib/ai/extract";
import { xrayObject } from "@/lib/ai/schema";
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
      xrayObject,
      `Produce the Contract X-Ray map for this instrument. Playbook for SaaS/cloud: PB-IT v4.2. ${TENANT_BRIEF}

Filename: ${doc.filename}
Approx pages: ${doc.pages}

CONTRACT TEXT:
${doc.text}

Return bilingual TE fields and keep every field to one tight sentence. Heatmap by clause. Missing clauses vs house playbook. Unusual vs house. Money, dates, parties. Thai law citations tied to clauses. layers MUST be exactly Fact / Legal interpretation / Suggested action (in that order, bilingual). Ladder: Preferred, Acceptable, Minimum, Walk-away. Brief is one page for management. Email is a counterparty draft — counsel sends it. Issue cards and the review board are produced by a separate call, so do not attempt them here.`,
    );
    const xray = normalizeXray(raw, { filename: doc.filename, pages: doc.pages, ms: Date.now() - started });
    return NextResponse.json({ xray });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "X-Ray failed";
    return jsonError(msg, 500);
  }
}
