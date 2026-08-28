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
    const body = await req.json() as { q?: string; lang?: string; edition?: string; context?: string };
    const q = (body.q || "").trim();
    if (!q) return jsonError("Ask a question first", 400);
    const lang = body.lang === "en" ? "en" : "th";
    const edition = body.edition === "firm" ? "firm" : "corporate";
    const context = (body.context || "").trim().slice(0, 4000);
    const object = await generateStructured(
      chatAnswer,
      `${TENANT_BRIEF}

You are Leio, LAW24's assistant. Answer how to use the OS, legal research, or regulation watch. Every conclusion cites evidence (href into the app: /review?s=find, /help?s=book&b=itcloud, /help?s=watch, /diligence?s=dflags, /assist?s=ask, /host, /help?s=use). Keep facts, interpretation, and suggested action distinct in the prose. Do not sign. Language: ${lang === "th" ? "Thai" : "English"}. Edition: ${edition}.
${context ? `\nSession context:\n${context}\n` : ""}
Question: ${q}`,
    );
    return NextResponse.json(object);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Leio failed";
    return jsonError(msg, 500);
  }
}
