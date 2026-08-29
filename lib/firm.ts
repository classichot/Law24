import type { Lang } from "./model";

export type AssignmentStage = "intake" | "work" | "review" | "client" | "closed";
/** Stored assignment types. New work uses the three engagement tracks; older rows map via `engagementOf`. */
export type AssignmentType = "review" | "diligence" | "negotiate" | "obligations" | "assemble" | "advisory";
/** The three Firm engagements: review, drafting, legal DD. */
export type EngagementTrack = "review" | "assemble" | "diligence";

export type ClientRecord = {
  id: string;
  name: string;
  nameTh: string;
  sector: string;
  owner: string;
  opened: string;
  status: "active" | "dormant";
};

export type AssignmentRecord = {
  id: string;
  clientId: string;
  title: string;
  titleTh: string;
  type: AssignmentType;
  stage: AssignmentStage;
  lead: string;
  due: string;
  fee: string;
  href: string;
  /** Contract X-Ray document ref — wires this assignment to the live map. */
  ref?: string;
  matter?: "nimbus" | "charoen" | "portfolio";
};

export type Movement = {
  id: string;
  assignmentId: string;
  at: string;
  actor: string;
  stage: AssignmentStage;
  en: string;
  th: string;
  href?: string;
};

export type PoolRecord = {
  id: string;
  clientName: string;
  engagementName: string;
  type: EngagementTrack;
  received: string;
};

export type PracticeState = {
  clients: ClientRecord[];
  assignments: AssignmentRecord[];
  movements: Movement[];
  pool: PoolRecord[];
  activeClientId: string;
  activeAssignmentId: string;
};

export const STAGE_LABEL: Record<AssignmentStage, { en: string; th: string }> = {
  intake: { en: "Intake", th: "รับเรื่อง" },
  work: { en: "In work", th: "กำลังทำ" },
  review: { en: "Partner review", th: "พาร์ทเนอร์ตรวจ" },
  client: { en: "With client", th: "รอลูกค้า" },
  closed: { en: "Closed", th: "ปิดเรื่อง" },
};

export const TYPE_LABEL: Record<AssignmentType, { en: string; th: string }> = {
  review: { en: "Contract review", th: "ตรวจสัญญา" },
  assemble: { en: "Contract drafting", th: "ร่างสัญญา" },
  diligence: { en: "Legal due diligence", th: "ตรวจสอบสถานะทางกฎหมาย" },
  negotiate: { en: "Contract review", th: "ตรวจสัญญา" },
  obligations: { en: "Contract review", th: "ตรวจสัญญา" },
  advisory: { en: "Contract drafting", th: "ร่างสัญญา" },
};

export const ENGAGEMENT_TYPES: EngagementTrack[] = ["review", "assemble", "diligence"];

export function engagementOf(type: AssignmentType | string): EngagementTrack {
  if (type === "assemble" || type === "advisory") return "assemble";
  if (type === "diligence") return "diligence";
  return "review";
}

export const ENGAGEMENT: Record<EngagementTrack, {
  id: EngagementTrack;
  cls: string;
  en: string;
  th: string;
  tagEn: string;
  tagTh: string;
  why: { t: string; e: string };
  record: { t: string; e: string };
  href: string;
  firmHref: string;
  recordHref: string;
}> = {
  review: {
    id: "review",
    cls: "eng-review",
    en: "Contract review",
    th: "ตรวจสัญญา",
    tagEn: "Review",
    tagTh: "ตรวจ",
    why: { t: "X-Ray · ห้องบังคับ · ฝาแฝด · ห้องสงคราม · เจรจา · ข้อผูกพัน", e: "X-Ray · Cockpit · Twin · War Room · Copilot · Obligations" },
    record: { t: "บันทึกงานตรวจ — ลูกค้า แผนที่ คำตัดสิน เส้นทาง", e: "Review record — client, map, verdict, trail" },
    href: "/review?s=xray",
    firmHref: "/practice?s=ereview",
    recordHref: "/practice?s=assign&eng=review",
  },
  assemble: {
    id: "assemble",
    cls: "eng-draft",
    en: "Contract drafting",
    th: "ร่างสัญญา",
    tagEn: "Draft",
    tagTh: "ร่าง",
    why: { t: "คลังประเภท · สัมภาษณ์ · ประกอบข้อ · ร่างคู่ภาษา", e: "Type library · interview · clause assembly · bilingual draft" },
    record: { t: "บันทึกงานร่าง — ประเภท ร่าง และเส้นทางอนุมัติ", e: "Drafting record — type, draft and approval trail" },
    href: "/assemble?s=lib",
    firmHref: "/practice?s=edraft",
    recordHref: "/practice?s=assign&eng=assemble",
  },
  diligence: {
    id: "diligence",
    cls: "eng-dd",
    en: "Legal due diligence",
    th: "ตรวจสอบสถานะทางกฎหมาย",
    tagEn: "Legal risk",
    tagTh: "ความเสี่ยงกฎหมาย",
    why: { t: "ตั้งเรื่อง · ห้องข้อมูล · ธงแดง · รายงานความเสี่ยง", e: "Matter · data room · red flags · legal-risk report" },
    record: { t: "บันทึกงาน DD — ขอบเขต ธงแดง และรายงาน", e: "DD record — scope, flags and the risk report" },
    href: "/diligence?s=dmatter",
    firmHref: "/practice?s=edd",
    recordHref: "/practice?s=assign&eng=diligence",
  },
};

/** Empty books. The mapped X-Ray fills a live matter; Nimbus/Charoen/PTT are not seeded. */
export function seedPractice(): PracticeState {
  return {
    activeClientId: "",
    activeAssignmentId: "",
    clients: [],
    assignments: [],
    movements: [],
    pool: [],
  };
}

export function clientOf(p: PracticeState, id: string) {
  return p.clients.find((c) => c.id === id);
}

export function assignmentOf(p: PracticeState, id: string) {
  return p.assignments.find((a) => a.id === id);
}

export function trailOf(p: PracticeState, assignmentId: string) {
  return p.movements.filter((m) => m.assignmentId === assignmentId);
}

export function overdue(a: AssignmentRecord) {
  return a.stage !== "closed" && Date.parse(a.due) < Date.parse("25 Aug 2026");
}

export const HREF_FOR_TYPE: Record<AssignmentType, string> = {
  review: "/review?s=xray",
  diligence: "/diligence?s=dmatter",
  negotiate: "/negotiate?s=nladder",
  obligations: "/obligations?s=oreg",
  assemble: "/assemble?s=lib",
  advisory: "/assemble?s=lib",
};

/** Open the engine that belongs to this engagement track. */
export function assignmentEngineHref(a: AssignmentRecord) {
  if (a.ref) return "/review?s=xray";
  return ENGAGEMENT[engagementOf(a.type)].href;
}

export function latestAssignmentForClient(p: PracticeState, clientId: string) {
  const rows = p.assignments.filter((a) => a.clientId === clientId);
  return rows[rows.length - 1];
}

/** X-Ray may only run inside an active Firm client + contract-review engagement. */
export function xrayContextOf(p: PracticeState) {
  const assignment = assignmentOf(p, p.activeAssignmentId);
  if (!assignment || assignment.stage === "closed" || engagementOf(assignment.type) !== "review") return null;
  const client = clientOf(p, assignment.clientId);
  if (!client || client.id !== p.activeClientId) return null;
  return { client, assignment };
}

export function nextIds(p: PracticeState) {
  const cMax = Math.max(0, ...p.clients.map((c) => parseInt(c.id.replace(/\D/g, ""), 10) || 0));
  const aMax = Math.max(0, ...p.assignments.map((a) => parseInt(a.id.replace(/\D/g, ""), 10) || 0));
  return { clientId: `CL-${String(cMax + 1).padStart(2, "0")}`, assignmentId: `A-${aMax + 1}` };
}

export function nextPoolId(p: PracticeState) {
  const max = Math.max(0, ...(p.pool || []).map((row) => parseInt(row.id.replace(/\D/g, ""), 10) || 0));
  return `P-${max + 1}`;
}

export function stampNow() {
  const d = new Date();
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()];
  return `${d.getDate()} ${mon} ${d.getFullYear()} · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function stampDay(iso?: string) {
  const d = iso ? new Date(`${iso}T00:00:00`) : new Date();
  if (Number.isNaN(d.getTime())) return "30 Sep 2026";
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()];
  return `${d.getDate()} ${mon} ${d.getFullYear()}`;
}

export function feeNumber(s: string) {
  return parseInt(s.replace(/[^\d]/g, ""), 10) || 0;
}

export function formatThb(n: number) {
  return `THB ${n.toLocaleString("en-US")}`;
}

export function dashboardOf(p: PracticeState) {
  const open = p.assignments.filter((a) => a.stage !== "closed");
  const late = open.filter(overdue);
  const wip = open.reduce((sum, a) => sum + feeNumber(a.fee), 0);
  const funnel: Record<AssignmentStage, number> = { intake: 0, work: 0, review: 0, client: 0, closed: 0 };
  p.assignments.forEach((a) => {
    funnel[a.stage] += 1;
  });
  const load: { lead: string; n: number; fee: number }[] = [];
  const map: Record<string, { n: number; fee: number }> = {};
  open.forEach((a) => {
    map[a.lead] = map[a.lead] || { n: 0, fee: 0 };
    map[a.lead].n += 1;
    map[a.lead].fee += feeNumber(a.fee);
  });
  Object.entries(map).forEach(([lead, v]) => load.push({ lead, ...v }));
  load.sort((a, b) => b.fee - a.fee);
  return {
    clients: p.clients.filter((c) => c.status === "active").length,
    open: open.length,
    late: late.length,
    wip,
    funnel,
    load,
    recent: [...p.movements].slice(-8).reverse(),
  };
}

export function practiceHits(p: PracticeState, lang: Lang) {
  const th = lang === "th";
  const hits: { id: string; href: string; kind: string; title: string; sub?: string }[] = [];
  p.clients.forEach((c) => {
    hits.push({
      id: `client-${c.id}`,
      href: "/practice?s=clients",
      kind: th ? "ลูกค้า" : "Client",
      title: `${c.id} · ${th ? c.nameTh : c.name}`,
      sub: c.sector,
    });
  });
  p.assignments.forEach((a) => {
    hits.push({
      id: `assign-${a.id}`,
      href: assignmentEngineHref(a),
      kind: th ? "งาน" : "Assignment",
      title: `${a.id} · ${th ? a.titleTh : a.title}`,
      sub: stageCopy(a.stage, lang),
    });
  });
  return hits;
}

export function stageCopy(stage: AssignmentStage, lang: Lang) {
  return lang === "th" ? STAGE_LABEL[stage].th : STAGE_LABEL[stage].en;
}

export function typeCopy(type: AssignmentType, lang: Lang) {
  const e = ENGAGEMENT[engagementOf(type)];
  return lang === "th" ? e.th : e.en;
}

export function trackStats(p: PracticeState) {
  const open = p.assignments.filter((a) => a.stage !== "closed");
  return {
    review: open.filter((a) => engagementOf(a.type) === "review").length,
    assemble: open.filter((a) => engagementOf(a.type) === "assemble").length,
    diligence: open.filter((a) => engagementOf(a.type) === "diligence").length,
  };
}
