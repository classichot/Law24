import { NextResponse } from "next/server";
import { generateStructured } from "@/lib/ai/server";
import { extractFromRequest } from "@/lib/ai/extract";
import { ddPack } from "@/lib/ai/schema";
import { TENANT_BRIEF } from "@/lib/ai/house";
import { jsonError, requireLive } from "@/lib/ai/http";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const blocked = requireLive();
  if (blocked) return blocked;
  try {
    let text = "";
    let filename = "Charoen data room";
    try {
      const doc = await extractFromRequest(req);
      text = doc.text;
      filename = doc.filename;
    } catch {
      /* tenant brief */
    }
    const object = await generateStructured(
      ddPack,
      `${TENANT_BRIEF}

Produce buy-side DD flags with evidence for ${filename}. Playbook PB-DD v3.1. Kill items must reach partner before the IC pack. Cite contracts (CT-…) in flag titles/impact. Do not sign. Counsel verifies.

${text ? `EXTRACT:\n${text}` : "No new room extract — reason over the Charoen Logistics demo in the tenant brief."}

st is open|progress|escalated|closed. sev is vhigh|high|med|low.`,
    );
    return NextResponse.json(object);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Diligence flags failed";
    return jsonError(msg, 500);
  }
}
