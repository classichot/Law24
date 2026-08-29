import type { TE } from "./model";
import type { ReviewLive, XrayView } from "./ai/types";
import { asLine, asTE } from "./ai/fromMap";

const P = (t: string, e: string): TE => ({ t, e });

export type AssemblyInputKind = "fact" | "finding" | "missing" | "instruction";

export type AssemblyInput = {
  id: string;
  kind: AssemblyInputKind;
  title: TE;
  value: TE;
  source: TE;
  href: string;
  priority: "must" | "should" | "context";
};

export type AssemblyState = {
  sourceRef: string;
  acceptedInputs: AssemblyInput[];
  ingestedAt: string;
  reviewHandoff: null | {
    title: string;
    sourceRef: string;
    inputCount: number;
    at: string;
  };
};

export function seedAssembly(): AssemblyState {
  return { sourceRef: "", acceptedInputs: [], ingestedAt: "", reviewHandoff: null };
}

export function hydrateAssembly(raw: unknown): AssemblyState {
  const base = seedAssembly();
  if (!raw || typeof raw !== "object") return base;
  const v = raw as Partial<AssemblyState>;
  return {
    sourceRef: v.sourceRef || "",
    acceptedInputs: Array.isArray(v.acceptedInputs)
      ? v.acceptedInputs.filter((x): x is AssemblyInput => Boolean(x && typeof x === "object" && x.id))
      : [],
    ingestedAt: v.ingestedAt || "",
    reviewHandoff: v.reviewHandoff && typeof v.reviewHandoff === "object"
      ? {
          title: v.reviewHandoff.title || "Assembled draft",
          sourceRef: v.reviewHandoff.sourceRef || "",
          inputCount: Number(v.reviewHandoff.inputCount) || 0,
          at: v.reviewHandoff.at || "",
        }
      : null,
  };
}

export function assemblyInputsOf(X: XrayView | null, R?: ReviewLive | null): AssemblyInput[] {
  if (!X) return [];
  const rows: AssemblyInput[] = [];
  const add = (row: AssemblyInput) => {
    if (!rows.some((x) => x.id === row.id)) rows.push(row);
  };

  (X.parties || []).slice(0, 3).forEach((x, i) => add({
    id: `AF-P-${i + 1}`,
    kind: "fact",
    title: asTE(x.k),
    value: asTE(x.v),
    source: P(`${X.ref} · X-Ray`, `${X.ref} · X-Ray`),
    href: "/review?s=quick",
    priority: "context",
  }));
  (X.money || []).slice(0, 4).forEach((x, i) => add({
    id: `AF-M-${i + 1}`,
    kind: "fact",
    title: asTE(x.k),
    value: asTE(x.v),
    source: P(`${X.ref} · X-Ray`, `${X.ref} · X-Ray`),
    href: "/review?s=quick",
    priority: i === 0 ? "must" : "context",
  }));
  (X.dates || []).slice(0, 4).forEach((x, i) => add({
    id: `AF-D-${i + 1}`,
    kind: "fact",
    title: asTE(x.k),
    value: asTE(x.v),
    source: asTE(x.src),
    href: "/review?s=quick",
    priority: "context",
  }));
  (R?.findings || []).forEach((x, i) => add({
    id: `AF-F-${x.id || i + 1}`,
    kind: "finding",
    title: asTE(x.issue),
    value: asTE(x.word || x.rec),
    source: asTE(x.src),
    href: "/review?s=find",
    priority: x.sev === "high" ? "must" : "should",
  }));
  (X.unusual || []).forEach((x, i) => add({
    id: `AF-U-${i + 1}`,
    kind: "finding",
    title: asTE(x.k),
    value: P(`แก้ให้ตรงท่าทีบ้าน: ${asLine(x.vs)}`, `Draft to the house position: ${asLine(x.vs)}`),
    source: asTE(x.src),
    href: "/review?s=find",
    priority: "must",
  }));
  (X.missing || []).forEach((x, i) => add({
    id: `AF-X-${i + 1}`,
    kind: "missing",
    title: asTE(x.k),
    value: P("ต้องเติมในร่างหรือแนบก่อนส่งตรวจ", "Add to the draft or attach before review"),
    source: asTE(x.src),
    href: "/review?s=find",
    priority: "must",
  }));
  (X.redlines || []).forEach((x, i) => add({
    id: `AF-R-${i + 1}`,
    kind: "instruction",
    title: P(`ถ้อยคำข้อ ${x.cl}`, `Drafting instruction · cl.${x.cl}`),
    value: asTE(x.text),
    source: P(`${X.ref} · redline`, `${X.ref} · redline`),
    href: "/review?s=red",
    priority: "must",
  }));
  return rows;
}

export function acceptedAssemblyInputs(
  state: AssemblyState,
) {
  return state.acceptedInputs;
}
