import { NextResponse } from "next/server";
import { generateStructured } from "@/lib/ai/server";
import { extractFromRequest } from "@/lib/ai/extract";
import { ddPack } from "@/lib/ai/schema";
import { LIVE_ONLY } from "@/lib/ai/house";
import { jsonError, requireLive } from "@/lib/ai/http";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const blocked = requireLive();
  if (blocked) return blocked;
  try {
    let text = "";
    let filename = "Deal room";
    try {
      const doc = await extractFromRequest(req);
      text = doc.text;
      filename = doc.filename;
    } catch {
      /* live room may send JSON without a file */
    }
    const object = await generateStructured(
      ddPack,
      `${LIVE_ONLY}

Produce buy-side Deal X-Ray flags with evidence for ${filename}. Playbook PB-DD v3.1. Ask what should exist but is not in the extract. Distinguish contract fact from interpretation. Kill items must reach partner before the IC pack. Do not invent counterparties, values, or clause numbers. Do not sign. Counsel verifies.

${text ? `EXTRACT:\n${text}` : "No room extract was attached. Return an empty flags array and missing items that a share-acquisition checklist would still require (corporate, material contracts, licences). Do not use any demo tenant."}

st is open|progress|escalated|closed. sev is vhigh|high|med|low.`,
    );
    return NextResponse.json(object);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Diligence flags failed";
    return jsonError(msg, 500);
  }
}
