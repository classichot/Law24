import { NextResponse } from "next/server";
import { generateStructured } from "@/lib/ai/server";
import { chatAnswer } from "@/lib/ai/schema";
import { TENANT_BRIEF } from "@/lib/ai/house";
import { jsonError, requireLive } from "@/lib/ai/http";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const blocked = requireLive();
  if (blocked) return blocked;
  try {
    const body = await req.json() as { q?: string; lang?: string };
    const q = (body.q || "").trim();
    if (!q) return jsonError("Ask a management question first", 400);
    const lang = body.lang === "en" ? "en" : "th";
    const object = await generateStructured(
      chatAnswer,
      `${TENANT_BRIEF}

You are the Living Legal Twin for this tenant. Answer a management question about this company's legal position. Every answer must cite a source contract, clause, or register (href such as /intel?s=ipf, /review?s=find, /diligence?s=dflags, /obligations?s=oalert). Do not recommend signature. Language: ${lang === "th" ? "Thai" : "English"}.

Question: ${q}`,
    );
    return NextResponse.json(object);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Twin failed";
    return jsonError(msg, 500);
  }
}
