import type { TE } from "@/lib/model";
import type { XrayView, ReviewLive } from "./types";
import type { z } from "zod";
import type { reviewPack, xrayObject } from "./schema";

const LABELS: Record<string, TE> = {
  sign: { t: "ยอมรับ", e: "Accept" },
  negotiate: { t: "เจรจา", e: "Negotiate" },
  reject: { t: "ห้ามลงนาม", e: "Do Not Sign" },
};

export function mappedIn(ms: number): TE {
  const sec = Math.max(1, Math.round(ms / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return {
    t: m ? `${m} นาที ${s} วินาที` : `${s} วินาที`,
    e: m ? `${m} min ${s} sec` : `${s} sec`,
  };
}

function asTE(v: TE | string | undefined | null): TE {
  if (!v) return { t: "—", e: "—" };
  if (typeof v === "string") return { t: v, e: v };
  return { t: v.t || v.e || "—", e: v.e || v.t || "—" };
}

function asVerdict(v: unknown): "sign" | "negotiate" | "reject" {
  const s = String(v || "").toLowerCase();
  if (/(reject|not sign|ห้าม|walk)/.test(s)) return "reject";
  if (/(accept|sign|ยอมรับ)/.test(s) && !/not|ห้าม/.test(s)) return "sign";
  if (s === "sign" || s === "negotiate" || s === "reject") return s;
  return "negotiate";
}

function asSev(v: unknown): "high" | "med" | "low" {
  const s = String(v || "").toLowerCase();
  if (s.startsWith("h")) return "high";
  if (s.startsWith("l")) return "low";
  return "med";
}

export function normalizeXray(
  raw: Partial<z.infer<typeof xrayObject>>,
  meta: { filename: string; pages: number; ms: number }
): XrayView {
  const v = asVerdict(raw.verdict);
  const empty = { t: "—", e: "—" };
  const layerNames: TE[] = [
    { t: "ข้อเท็จจริง", e: "Fact" },
    { t: "การตีความทางกฎหมาย", e: "Legal interpretation" },
    { t: "การกระทำที่แนะนำ", e: "Suggested action" },
  ];
  const ladderNames = [
    { n: "1", k: { t: "ที่ต้องการ", e: "Preferred" } },
    { n: "2", k: { t: "ที่ยอมได้", e: "Acceptable" } },
    { n: "3", k: { t: "ขั้นต่ำ", e: "Minimum" } },
    { n: "4", k: { t: "เดินออก", e: "Walk-away" } },
  ];
  const layers = layerNames.map((k, i) => {
    const row = raw.layers?.[i];
    return row ? { k, v: asTE(row.v) } : { k, v: empty };
  });
  const ladder = ladderNames.map((row, i) => raw.ladder?.[i] || { ...row, v: empty });
  const rows = raw.heatmap || [];
  const heatmap = rows.length
    ? rows.map((h) => ({ ...h, k: asTE(h.k), sev: asSev(h.sev), pct: Number(h.pct) || 0 }))
    : [{ cl: "—", k: { t: "ยังไม่วางแผนที่ข้อ", e: "No clause map yet" }, sev: "med" as const, pct: 0 }];
  return {
    ...raw,
    doc: asTE(raw.doc),
    langs: asTE(raw.langs),
    verdictWhy: asTE(raw.verdictWhy),
    brief: asTE(raw.brief),
    email: asTE(raw.email),
    // A half may be missing entirely; every table the UI maps over must exist.
    missing: raw.missing || [],
    unusual: raw.unusual || [],
    money: raw.money || [],
    dates: raw.dates || [],
    parties: raw.parties || [],
    laws: raw.laws || [],
    redlines: raw.redlines || [],
    heatmap,
    layers,
    ladder,
    verdict: v,
    verdictLabel: raw.verdictLabel ? asTE(raw.verdictLabel) : (LABELS[v] || LABELS.negotiate),
    mappedIn: mappedIn(meta.ms),
    pages: raw.pages || meta.pages || 1,
    ref: raw.ref || meta.filename.replace(/\.[^.]+$/, "").slice(0, 24),
  } as XrayView;
}

export function normalizeReview(raw: z.infer<typeof reviewPack>): ReviewLive {
  return {
    findings: (raw.findings || []).map((f) => ({ ...f, src: asTE(f.src) })),
    board: raw.board || [],
    agreement: raw.agreement,
    recommendation: raw.recommendation,
  };
}
