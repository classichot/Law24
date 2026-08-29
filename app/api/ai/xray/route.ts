import { NextResponse } from "next/server";
import { generateStructured } from "@/lib/ai/server";
import { extractFromRequest, hasContractText } from "@/lib/ai/extract";
import { xrayCore, xrayDeep } from "@/lib/ai/schema";
import { normalizeXray } from "@/lib/ai/normalize";
import { TENANT_BRIEF } from "@/lib/ai/house";
import { jsonError, requireLive } from "@/lib/ai/http";

export const runtime = "nodejs";
export const maxDuration = 120;

type Half<T> = { label: string; ms: number; value?: T; error?: string };

async function half<T>(label: string, run: () => Promise<T>): Promise<Half<T>> {
  const t0 = Date.now();
  try {
    return { label, ms: Date.now() - t0, value: await run() };
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

    const [core, deep] = await Promise.all([
      half("core", () => generateStructured(
        xrayCore,
        `Read this instrument and return its identity, verdict, and evidence tables. ${rules}

${source}

Heatmap by clause with a risk percentage. Money, dates, parties as they appear. Thai law citations tied to the clause they bite on.`,
        undefined,
        files,
      )),
      half("deep", () => generateStructured(
        xrayDeep,
        `Read this instrument and return the playbook gaps and the negotiation narrative. ${rules}

${source}

Missing clauses vs the house playbook. Unusual terms vs house, with what they depart from. layers MUST be exactly Fact / Legal interpretation / Suggested action, in that order. Ladder: Preferred, Acceptable, Minimum, Walk-away. Brief is one page for management. Email is a counterparty draft — counsel sends it.`,
        undefined,
        files,
      )),
    ]);
    const stages = [core, deep].map((h) => ({ stage: h.label, ms: h.ms, error: h.error }));
    console.log(`[xray] ${stages.map((s) => `${s.stage}=${s.ms}ms${s.error ? ` err:${s.error}` : ""}`).join(" ")}`);
    // One half is enough to render a map — a partial X-Ray beats an empty screen.
    if (!core.value && !deep.value) {
      return jsonError(core.error || deep.error || "X-Ray failed", 500, { stages });
    }
    const xray = normalizeXray(
      { ...core.value, ...deep.value },
      { filename: doc.filename, pages: doc.pages, ms: Date.now() - started }
    );
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
