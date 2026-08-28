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

function asTE(v: TE | string): TE {
  if (typeof v === "string") return { t: v, e: v };
  return v;
}

export function normalizeXray(
  raw: z.infer<typeof xrayObject>,
  meta: { filename: string; pages: number; ms: number }
): XrayView {
  const v = raw.verdict;
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
  const layers = layerNames.map((k, i) => raw.layers[i] || { k, v: empty });
  const ladder = ladderNames.map((row, i) => raw.ladder[i] || { ...row, v: empty });
  return {
    ...raw,
    layers,
    ladder,
    verdictLabel: raw.verdictLabel?.e ? raw.verdictLabel : (LABELS[v] || LABELS.negotiate),
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
