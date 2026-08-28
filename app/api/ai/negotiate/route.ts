import { NextResponse } from "next/server";
import { generateStructured } from "@/lib/ai/server";
import { negotiatePack } from "@/lib/ai/schema";
import { TENANT_BRIEF } from "@/lib/ai/house";
import { jsonError, requireLive } from "@/lib/ai/http";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const blocked = requireLive();
  if (blocked) return blocked;
  try {
    const body = await req.json().catch(() => ({})) as { note?: string; lang?: string };
    const object = await generateStructured(
      negotiatePack,
      `${TENANT_BRIEF}

Draft recommended negotiation responses under PB-NEG v2.0 (mandate). Four must-haves: data cap inside 2×, DPA/SCCs, symmetric exit, annexes. Do not trade the data cap for a price cut. Reference-customer rights may trade for a price cap. Counsel sends the messages — you do not.

${body.note ? `Round note: ${body.note}` : "Round 2 of Nimbus CT-291."}

Language for msg/email bodies: ${body.lang === "en" ? "English" : "Thai, with English in the e field"}.
k is a short English label (Must-have / Trade / Hold).`,
    );
    return NextResponse.json(object);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Negotiate draft failed";
    return jsonError(msg, 500);
  }
}
