import { NextResponse } from "next/server";
import { generateStructured } from "@/lib/ai/server";
import { extractFromRequest, hasContractText } from "@/lib/ai/extract";
import { reviewFindings, reviewBoard } from "@/lib/ai/schema";
import { normalizeReview } from "@/lib/ai/normalize";
import { TENANT_BRIEF } from "@/lib/ai/house";
import { jsonError, requireLive } from "@/lib/ai/http";

export const runtime = "nodejs";
export const maxDuration = 120;

/** Either half is enough to fill the board screen, so neither one can sink it. */
async function stage<T>(run: () => Promise<T>): Promise<{ value?: T; error?: string }> {
  try {
    return { value: await run() };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "failed" };
  }
}

export async function POST(req: Request) {
  const blocked = requireLive();
  if (blocked) return blocked;
  try {
    let text = "";
    let filename = "Nimbus CT-291";
    let files: { data: Uint8Array; mediaType: string; filename?: string }[] | undefined;
    try {
      const doc = await extractFromRequest(req);
      text = doc.text;
      filename = doc.filename;
      if (doc.pdf && !hasContractText(doc.text)) {
        files = [{ data: doc.pdf, mediaType: "application/pdf", filename: doc.filename }];
      }
    } catch {
      /* tenant brief */
    }
    const source = `${TENANT_BRIEF}

Matter: ${filename}. PB-IT v4.2. Facts / interpretation / action stay distinct. Do not sign.

${files
    ? "The attached PDF is a scan with no text layer. Read the pages. Do not invent clauses that are not visible."
    : text
      ? `CONTRACT TEXT:\n${text}`
      : "No new upload — reason over the Nimbus CT-291 demo matter in the tenant brief."}

Keep every field to one tight sentence. Answer only the fields in the schema — the rest of the review is minted by a parallel call.`;

    const [found, seated] = await Promise.all([
      stage(() => generateStructured(
        reviewFindings,
        `Return 4-6 issue cards with evidence quotes in src and why, and rec = amend|docs|reject|fallback|clarify|escalate|accept.\n\n${source}`,
        undefined,
        files,
      )),
      stage(() => generateStructured(
        reviewBoard,
        `Return the seven-seat AI Legal Review Board with each seat's vote, plus the agreement line and the recommendation. recommendation is renegotiate unless the paper already meets the house book, and must not claim the engine signed.\n\n${source}`,
        undefined,
        files,
      )),
    ]);
    if (!found.value && !seated.value) {
      return jsonError(found.error || seated.error || "Review failed", 500);
    }
    return NextResponse.json(normalizeReview({ ...found.value, ...seated.value }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Review failed";
    return jsonError(msg, 500);
  }
}
