import { NextResponse } from "next/server";
import { generateStructured } from "@/lib/ai/server";
import { clauseProposal } from "@/lib/ai/schema";
import { TENANT_BRIEF } from "@/lib/ai/house";
import { jsonError, requireLive } from "@/lib/ai/http";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const blocked = requireLive();
  if (blocked) return blocked;
  try {
    const body = await req.json() as {
      heading?: string;
      original?: { t?: string; e?: string };
      instruction?: string;
    };
    const heading = (body.heading || "").trim();
    const original = { t: body.original?.t || "", e: body.original?.e || "" };
    const instruction = (body.instruction || "").trim();
    const object = await generateStructured(
      clauseProposal,
      `${TENANT_BRIEF}

Propose a rewrite of this standard clause against the house playbooks (PB-ASM, PB-IT v4.2). Leio does not apply the clause and never signs — counsel applies. If the instruction would uncap data claims or switch to foreign law/arbitration without a recorded reason, set blocked=true and keep the original body.

Heading: ${heading}

Original Thai:
${original.t}

Original English:
${original.e}

Counsel instruction (optional): ${instruction || "(none)"}

Return bilingual body + why + cites with hrefs into /help?s=book&b=itcloud, /help?s=book&b=assembly, /review?s=find, /help?s=watch.`,
    );
    return NextResponse.json(object);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Clause proposal failed";
    return jsonError(msg, 500);
  }
}
