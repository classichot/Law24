import type { Lang, TE } from "@/lib/model";
import { L } from "@/lib/model";
import { stampNow } from "@/lib/firm";
import { REPORT_PACKS } from "./packs";
import type {
  Claim,
  DataField,
  GateId,
  GateState,
  QualityGate,
  ReportBrief,
  ReportPackId,
  ReportRevision,
  ReviewFinding,
  SourceRecord,
} from "./types";

const P = (t: string, e: string): TE => ({ t, e });

const GATE_NAME: Record<GateId, TE> = {
  boundary: P("ขอบเขตข้อมูล", "Data boundary"),
  evidence: P("หลักฐาน", "Evidence"),
  numbers: P("ตัวเลข", "Numbers"),
  references: P("การอ้างอิง", "References"),
  requirements: P("ข้อกำหนด", "Requirements"),
  writing: P("งานเขียน", "Writing"),
  findings: P("ข้อตรวจ", "Review findings"),
  approval: P("การอนุมัติ", "Approval"),
  export: P("การส่งออก", "Export"),
};

function gate(id: GateId, state: GateState, detail: TE): QualityGate {
  return { id, name: GATE_NAME[id], state, detail };
}

export function defaultBrief(packId: ReportPackId, entity: string, lang: Lang, actor: string): ReportBrief {
  const pack = REPORT_PACKS[packId];
  return {
    purpose: pack.name,
    audience: pack.audience,
    jurisdiction: P("กฎหมายไทย — ค่าเริ่มต้นของสำนักงาน", "Thai law — house default"),
    entity,
    period: "2026",
    language: lang === "th" ? "th" : "en",
    currency: "THB",
    packId,
    packVersion: pack.version,
    preparer: actor,
    reviewer: actor,
    approver: actor,
    estimatesPermitted: false,
  };
}

function scoreGates(rev: Omit<ReportRevision, "gates">): QualityGate[] {
  const demoInReal = rev.fields.some((f) => f.validation === "demo" && f.use === "allowed") && !rev.demo;
  const missing = rev.fields.filter((f) => f.validation === "missing");
  const blocked = rev.fields.filter((f) => f.use === "blocked");
  const unsupported = rev.claims.filter((c) => c.kind !== "gap" && c.support !== "supported" && c.support !== "not-applicable");
  const gaps = rev.claims.filter((c) => c.kind === "gap" || c.support === "unresolved");
  const fabricated = rev.claims.filter((c) => c.sourceIds.length === 0 && c.kind === "sourced");
  const openCritical = rev.findings.filter((f) => f.status === "open" && (f.severity === "critical" || f.severity === "major"));
  const approved = rev.status === "approved" || rev.status === "submitted";

  return [
    gate("boundary", demoInReal || blocked.length ? "fail" : "pass",
      demoInReal
        ? P("ข้อมูลสาธิตปนในรายงานจริง", "Demo data entered a real report")
        : P("ใช้เฉพาะฟิลด์ที่อนุญาต", "Only allowlisted fields are in scope")),
    gate("evidence", unsupported.length || missing.length ? "fail" : "pass",
      unsupported.length
        ? P(`${unsupported.length} ข้ออ้างยังไม่มีหลักฐานครบ`, `${unsupported.length} claims lack valid support`)
        : P("ข้อเท็จจริงที่เขียนชี้แหล่ง", "Written facts point at a source")),
    gate("numbers", rev.fields.some((f) => f.validation === "conflict") ? "fail" : "pass",
      P("ตัวเลขมาจากชั้นคำนวณ ไม่ใช่โมเดล", "Numbers come from the calculation layer, not the model")),
    gate("references", fabricated.length ? "fail" : "pass",
      fabricated.length
        ? P("มีอ้างอิงที่ไม่ได้ดึงจริง", "A citation was never retrieved")
        : P("ไม่มีการอ้างอิงที่แต่ง", "No fabricated citations")),
    gate("requirements", gaps.length ? "fail" : "pass",
      gaps.length
        ? P(`${gaps.length} ข้อกำหนดยังเป็นช่องว่าง`, `${gaps.length} requirements remain gaps`)
        : P("ข้อกำหนดที่บังคับครบหรือเปิดเผยการละเว้น", "Required items are met or expressly omitted")),
    gate("writing", "pending",
      P("งานเขียนรอบรรณาธิการยืนยัน — ยังไม่แสดงร้อยละคุณภาพมนุษย์", "Editorial review pending — no human-quality percentage is shown")),
    gate("findings", openCritical.length ? "fail" : "pass",
      openCritical.length
        ? P(`${openCritical.length} ประเด็นสำคัญยังเปิด`, `${openCritical.length} critical or major items remain open`)
        : P("ไม่มีประเด็นสำคัญที่ยังเปิด", "No open critical or major findings")),
    gate("approval", approved ? "pass" : "fail",
      approved
        ? P(`อนุมัติโดย ${rev.approvedBy || "—"}`, `Approved by ${rev.approvedBy || "—"}`)
        : P("ยังไม่มีผู้อนุมัติที่มีชื่อสำหรับฉบับนี้", "No named approver for this exact revision")),
    gate("export", approved && !openCritical.length && !unsupported.length && !demoInReal ? "pending" : "fail",
      P("ส่งออกสุดท้ายได้เมื่อเกณฑ์ผ่านและผู้อนุมัติล็อกไบต์นี้", "Final export waits for passing gates and a locked approved artifact")),
  ];
}

export function evaluateReport(rev: Omit<ReportRevision, "gates">): ReportRevision {
  return { ...rev, gates: scoreGates(rev) };
}

export function canFinalExport(rev: ReportRevision): boolean {
  return rev.gates
    .filter((g) => g.id !== "export" && g.id !== "writing")
    .every((g) => g.state === "pass") && rev.status === "approved";
}

export function draftFromLive(input: {
  packId: ReportPackId;
  entity: string;
  actor: string;
  lang: Lang;
  demo: boolean;
  facts: { label: TE; value: string | null; source: string; locator: string; demo?: boolean; missing?: boolean }[];
  claims: { section: string; text: TE; kind: Claim["kind"]; excerpt: TE; source?: string; gap?: boolean }[];
  sections: { id: string; title: TE; body: TE }[];
}): ReportRevision {
  const brief = defaultBrief(input.packId, input.entity, input.lang, input.actor);
  const sources: SourceRecord[] = [];
  const fields: DataField[] = input.facts.map((f, i) => {
    const sid = f.source ? `SRC-${i + 1}` : null;
    if (f.source && sid) {
      sources.push({
        id: sid,
        title: P(f.source, f.source),
        owner: input.entity,
        type: "pdf",
        locator: f.locator,
        version: "v1",
        retrieved: stampNow(),
        demo: Boolean(f.demo || input.demo),
        review: f.missing ? "pending" : "accepted",
      });
    }
    const validation: DataField["validation"] = f.missing
      ? "missing"
      : (f.demo || input.demo)
        ? "demo"
        : f.value == null
          ? "missing"
          : "approved";
    return {
      id: `F-${i + 1}`,
      label: f.label,
      value: f.missing ? null : f.value,
      entity: input.entity,
      period: brief.period,
      sourceId: sid,
      validation,
      use: validation === "missing" ? "blocked" : input.demo && validation === "demo" ? "allowed" : validation === "demo" ? "blocked" : "allowed",
    };
  });

  const claims: Claim[] = input.claims.map((c, i) => ({
    id: `C-${i + 1}`,
    section: c.section,
    text: c.text,
    kind: c.gap ? "gap" : c.kind,
    sourceIds: c.source && !c.gap ? [sources.find((s) => s.title.e === c.source)?.id || sources[0]?.id].filter(Boolean) as string[] : [],
    excerpt: c.excerpt,
    support: c.gap ? "unresolved" : "supported",
  }));

  const findings: ReviewFinding[] = claims
    .filter((c) => c.kind === "gap" || c.support === "unresolved")
    .map((c, i) => ({
      id: `RF-${i + 1}`,
      severity: "major" as const,
      category: "evidence",
      passage: c.text,
      issue: P("ยังไม่มีหลักฐานที่อนุมัติสำหรับข้อนี้", "No approved evidence for this claim"),
      remedy: P("ขอข้อมูลที่ขาด ห้ามให้โมเดลถมค่า", "Request the missing input. Do not let the model fill it."),
      status: "open" as const,
    }));

  return evaluateReport({
    id: `RPT-${input.packId}-${Date.now().toString(36)}`,
    packId: input.packId,
    title: REPORT_PACKS[input.packId].name,
    status: findings.length ? "drafting" : "ready-for-review",
    demo: input.demo,
    brief,
    fields,
    sources,
    claims,
    sections: input.sections.map((s) => ({
      ...s,
      claimIds: claims.filter((c) => c.section === s.id).map((c) => c.id),
    })),
    findings,
    editorial: "pending",
    editorialNote: P(
      "คะแนนคุณภาพงานเขียนเป็นงานบรรณาธิการ — จนกว่าจะเทียบรูบริกแล้ว ให้แสดงว่าอยู่ระหว่างตรวจ ไม่แสดงร้อยละ",
      "Writing quality is an editorial judgement. Until the rubric is calibrated, show editorial review pending — not a percentage.",
    ),
    model: { provider: "house", id: "law24-report-pack", fallback: false },
    createdAt: stampNow(),
  });
}

export function approveRevision(rev: ReportRevision, actor: string): ReportRevision {
  if (rev.fields.some((f) => f.validation === "demo") && !rev.demo) {
    return evaluateReport({ ...rev, status: "drafting" });
  }
  if (rev.findings.some((f) => f.status === "open" && f.severity !== "minor")) {
    return evaluateReport({ ...rev });
  }
  return evaluateReport({
    ...rev,
    status: "approved",
    approvedAt: stampNow(),
    approvedBy: actor,
  });
}

export function exportNotice(rev: ReportRevision, lang: Lang): string {
  if (canFinalExport(rev)) {
    return lang === "th"
      ? `อนุมัติแล้วโดย ${rev.approvedBy} — ส่งออกได้สำหรับผู้รับที่ได้รับอนุญาต`
      : `Approved by ${rev.approvedBy} — export is allowed for the authorised recipient`;
  }
  const fails = rev.gates.filter((g) => g.state === "fail").map((g) => L(lang, g.name));
  return lang === "th"
    ? `DRAFT — ยังส่งออกสุดท้ายไม่ได้: ${fails.join(", ") || "รอเกณฑ์"}`
    : `DRAFT — final export blocked: ${fails.join(", ") || "gates pending"}`;
}
