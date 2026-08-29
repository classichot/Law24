import { NextResponse } from "next/server";
import type { TE } from "@/lib/model";
import { generateStructured } from "@/lib/ai/server";
import { extractFromRequest, hasContractText } from "@/lib/ai/extract";
import { reviewFindings, reviewBoard } from "@/lib/ai/schema";
import { normalizeReview } from "@/lib/ai/normalize";
import { LIVE_ONLY } from "@/lib/ai/house";
import { jsonError, requireLive } from "@/lib/ai/http";

export const runtime = "nodejs";
export const maxDuration = 120;

type Stage<T> = { label: string; ms: number; value?: T; error?: string };

/** Any surviving stage is enough to fill the board screen, so none can sink it. */
async function stage<T>(label: string, run: () => Promise<T>): Promise<Stage<T>> {
  const t0 = Date.now();
  try {
    const value = await run();
    return { label, ms: Date.now() - t0, value };
  } catch (err) {
    return { label, ms: Date.now() - t0, error: err instanceof Error ? err.message : "failed" };
  }
}

export async function POST(req: Request) {
  const blocked = requireLive();
  if (blocked) return blocked;
  try {
    const doc = await extractFromRequest(req);
    const text = doc.text;
    const filename = doc.filename;
    const files = doc.pdf && !hasContractText(doc.text)
      ? [{ data: doc.pdf, mediaType: "application/pdf", filename: doc.filename }]
      : undefined;
    const source = `${LIVE_ONLY}

Matter: ${filename}. PB-IT v4.2. Facts / interpretation / action stay distinct. Do not sign.

${files
    ? "The attached PDF is a scan with no text layer. Read the pages. Do not invent clauses that are not visible."
    : text
      ? `CONTRACT TEXT:\n${text}`
      : "No contract text arrived. Return empty findings rather than inventing a demo matter."}

Keep every field to one tight sentence. Answer only the fields in the schema — the rest of the review is minted by a parallel call.`;

    const cards = (rank: string) => stage(`cards-${rank}`, () => generateStructured(
      reviewFindings,
      `Return the ${rank} most material issue cards, with evidence quotes in src and why, and rec = amend|docs|reject|fallback|clarify|escalate|accept.\n\n${source}`,
      undefined,
      files,
    ));

    const parts = await Promise.all([
      cards("two"),
      cards("third and fourth"),
      stage("board", () => generateStructured(
        reviewBoard,
        `Return the seven-seat AI Legal Review Board with each seat's vote, plus the agreement line and the recommendation. recommendation is renegotiate unless the paper already meets the house book, and must not claim the engine signed.\n\n${source}`,
        undefined,
        files,
      )),
    ]);
    const stages = parts.map((p) => ({ stage: p.label, ms: p.ms, error: p.error }));
    console.log(`[review] ${stages.map((s) => `${s.stage}=${s.ms}ms${s.error ? ` err:${s.error}` : ""}`).join(" ")}`);
    if (parts.every((p) => !p.value)) {
      return jsonError(parts.find((p) => p.error)?.error || "Review failed", 500, { stages });
    }
    const merged = Object.assign({}, ...parts.map((p) => p.value || {}));
    // Both card stages rank the same paper independently, so they can land on the
    // same clause. Keep the first card per cited clause, and per issue opening.
    const seen = new Set<string>();
    const fresh = (key: string) => {
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    };
    const flat = (key: string) => key.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    merged.findings = parts
      .flatMap((p) => (p.value as { findings?: { issue?: TE; src?: TE }[] } | undefined)?.findings || [])
      .filter((f) => {
        const clause = (flat(f.src?.e || "").match(/cl\s*\d+(\s*\d+)?/) || [""])[0];
        const opening = flat(f.issue?.e || "").split(" ").slice(0, 6).join(" ");
        return fresh(opening) && (!clause || fresh(clause));
      });
    return NextResponse.json({ ...normalizeReview(merged), stages });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Review failed";
    return jsonError(msg, 500);
  }
}
