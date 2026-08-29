import { NextResponse } from "next/server";
import { generateStructured } from "@/lib/ai/server";
import { extractFromRequest, hasContractText } from "@/lib/ai/extract";
import { xrayIdent, xrayFacts, xrayGaps, xrayPlan } from "@/lib/ai/schema";
import { normalizeXray } from "@/lib/ai/normalize";
import { TENANT_BRIEF } from "@/lib/ai/house";
import { jsonError, requireLive } from "@/lib/ai/http";

export const runtime = "nodejs";
export const maxDuration = 120;

type Half<T> = { label: string; ms: number; value?: T; error?: string };

async function half<T>(label: string, run: () => Promise<T>): Promise<Half<T>> {
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
  const started = Date.now();
  try {
    const doc = await extractFromRequest(req);
    const scan = Boolean(doc.pdf && !hasContractText(doc.text));
    const files = scan && doc.pdf
      ? [{ data: doc.pdf, mediaType: "application/pdf", filename: doc.filename }]
      : undefined;
    const source = `Filename: ${doc.filename}
Approx pages: ${doc.pages}
${scan
    ? "The attached PDF is a scan with no text layer. Read the pages. Do not invent clauses that are not visible."
    : `CONTRACT TEXT:\n${doc.text}`}`;
    const rules = `Playbook for SaaS/cloud: PB-IT v4.2. ${TENANT_BRIEF}

Return bilingual TE fields and keep every field to one tight sentence. Answer only the fields in the schema — other parts of the X-Ray are minted by a parallel call, so do not attempt them here.`;

    const ask = (schema: Parameters<typeof generateStructured>[0], task: string) =>
      generateStructured(schema, `${task} ${rules}\n\n${source}`, undefined, files);

    const parts = await Promise.all([
      half("ident", () => ask(
        xrayIdent,
        "Read this instrument and return its identity, the verdict, and a clause heatmap with a risk percentage per clause.",
      )),
      half("facts", () => ask(
        xrayFacts,
        "Read this instrument and return money, dates, parties as they appear, plus Thai law citations tied to the clause each one bites on.",
      )),
      half("gaps", () => ask(
        xrayGaps,
        "Read this instrument and return clauses missing against the house playbook, terms unusual against house with what they depart from, and exactly three layers: Fact, then Legal interpretation, then Suggested action.",
      )),
      half("plan", () => ask(
        xrayPlan,
        "Read this instrument and return redline wording for the worst clauses, a four-rung ladder (Preferred, Acceptable, Minimum, Walk-away), a one-page management brief, and a counterparty email for counsel to send.",
      )),
    ]);
    const stages = parts.map((p) => ({ stage: p.label, ms: p.ms, error: p.error }));
    console.log(`[xray] ${stages.map((s) => `${s.stage}=${s.ms}ms${s.error ? ` err:${s.error}` : ""}`).join(" ")}`);
    // Any surviving stage is enough to draw a map — a partial X-Ray beats an empty screen.
    if (parts.every((p) => !p.value)) {
      return jsonError(parts.find((p) => p.error)?.error || "X-Ray failed", 500, { stages });
    }
    const merged = Object.assign({}, ...parts.map((p) => p.value || {}));
    const xray = normalizeXray(merged, { filename: doc.filename, pages: doc.pages, ms: Date.now() - started });
    return NextResponse.json({ xray, stages });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "X-Ray failed";
    const timed = /timeout|aborted|timed out/i.test(msg);
    return jsonError(
      timed
        ? "This scan took too long to read. Save as a searchable PDF or DOCX, or drop the first few pages."
        : msg,
      500
    );
  }
}
