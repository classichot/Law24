import type { Lang } from "./model";

export type AssignmentStage = "intake" | "work" | "review" | "client" | "closed";
export type AssignmentType = "review" | "diligence" | "negotiate" | "obligations" | "assemble" | "advisory";

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

export type PracticeState = {
  clients: ClientRecord[];
  assignments: AssignmentRecord[];
  movements: Movement[];
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
  diligence: { en: "Due diligence", th: "ตรวจสอบสถานะ" },
  negotiate: { en: "Negotiation", th: "เจรจา" },
  obligations: { en: "Obligations", th: "ภาระผูกพัน" },
  assemble: { en: "Assemble", th: "ประกอบสัญญา" },
  advisory: { en: "Advisory", th: "ให้คำปรึกษา" },
};

/** Empty books. The mapped X-Ray fills a live matter; Nimbus/Charoen/PTT are not seeded. */
export function seedPractice(): PracticeState {
  return {
    activeClientId: "",
    activeAssignmentId: "",
    clients: [],
    assignments: [],
    movements: [],
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
  review: "/review?s=rsetup",
  diligence: "/diligence?s=dmatter",
  negotiate: "/negotiate?s=nstrat",
  obligations: "/obligations?s=oreg",
  assemble: "/assemble?s=lib",
  advisory: "/assemble?s=type",
};

export function nextIds(p: PracticeState) {
  const cMax = Math.max(0, ...p.clients.map((c) => parseInt(c.id.replace(/\D/g, ""), 10) || 0));
  const aMax = Math.max(0, ...p.assignments.map((a) => parseInt(a.id.replace(/\D/g, ""), 10) || 0));
  return { clientId: `CL-${String(cMax + 1).padStart(2, "0")}`, assignmentId: `A-${aMax + 1}` };
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
      href: "/practice?s=trace",
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
  return lang === "th" ? TYPE_LABEL[type].th : TYPE_LABEL[type].en;
}
