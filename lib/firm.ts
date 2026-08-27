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

export function seedPractice(): PracticeState {
  return {
    activeClientId: "CL-01",
    activeAssignmentId: "A-2481",
    clients: [
      { id: "CL-01", name: "Siam Digital Co., Ltd.", nameTh: "บริษัท สยามดิจิทัล จำกัด", sector: "Technology", owner: "Kanit S.", opened: "4 Aug 2026", status: "active" },
      { id: "CL-02", name: "Charoen Logistics PCL", nameTh: "บริษัท เจริญโลจิสติกส์ จำกัด (มหาชน)", sector: "Logistics", owner: "Associate N.", opened: "28 Jul 2026", status: "active" },
      { id: "CL-03", name: "PTT Oil Retail Co., Ltd.", nameTh: "บริษัท พีทีที น้ำมันและการค้าปลีก จำกัด", sector: "Energy", owner: "Partner K.", opened: "2 Jun 2026", status: "active" },
    ],
    assignments: [
      {
        id: "A-2481",
        clientId: "CL-01",
        title: "Nimbus Cloud SaaS — counterparty review and negotiation",
        titleTh: "นิมบัส คลาวด์ SaaS — ตรวจและเจรจาสัญญาคู่ค้า",
        type: "review",
        stage: "client",
        lead: "Kanit S.",
        due: "5 Sep 2026",
        fee: "THB 480,000",
        href: "/review?s=find",
        matter: "nimbus",
      },
      {
        id: "A-2482",
        clientId: "CL-02",
        title: "Buy-side diligence — regional logistics target",
        titleTh: "ตรวจสอบสถานะฝั่งผู้ซื้อ — เป้าหมายโลจิสติกส์ภูมิภาค",
        type: "diligence",
        stage: "work",
        lead: "Associate N.",
        due: "12 Sep 2026",
        fee: "THB 1,240,000",
        href: "/diligence?s=dflags",
        matter: "charoen",
      },
      {
        id: "A-2483",
        clientId: "CL-03",
        title: "Facilities MSA — renewal advisory",
        titleTh: "สัญญาบริการอาคาร — ให้คำปรึกษาต่ออายุ",
        type: "advisory",
        stage: "review",
        lead: "Partner K.",
        due: "1 Sep 2026",
        fee: "THB 190,000",
        href: "/assemble?s=type",
        matter: "portfolio",
      },
      {
        id: "A-2484",
        clientId: "CL-01",
        title: "Facilities notice window — missed 1 Aug",
        titleTh: "หน้าต่างบอกเลิกอาคาร — พ้นกำหนด 1 ส.ค.",
        type: "obligations",
        stage: "work",
        lead: "Associate N.",
        due: "1 Aug 2026",
        fee: "THB 85,000",
        href: "/obligations?s=oalert",
        matter: "portfolio",
      },
    ],
    movements: [
      m("A-2481", "4 Aug 2026 · 09:20", "GC Preecha", "intake", "Instruction received from General Counsel. Scope: Nimbus Cloud SaaS, 3-year, THB 24.6M.", "รับงานจากที่ปรึกษากฎหมายประจำองค์กร ขอบเขต: นิมบัส คลาวด์ SaaS 3 ปี 24.6 ล้านบาท", "/assemble?s=lib"),
      m("A-2481", "4 Aug 2026 · 11:05", "Conflicts", "intake", "Conflict check cleared. No current instruction against Nimbus Cloud in the firm.", "ตรวจผลประโยชน์ทับซ้อนผ่าน ไม่มีงานปัจจุบันที่ขัดกับนิมบัส", "/practice?s=assign"),
      m("A-2481", "5 Aug 2026 · 08:40", "Kanit S.", "intake", "Assignment opened. Playbook IT Cloud v4.2 attached. Lead: Kanit S.", "เปิดงาน มัดเพลย์บุ๊ก IT Cloud v4.2 หัวหน้างาน: กนิษฐ์", "/assemble?s=lib"),
      m("A-2481", "8 Aug 2026 · 14:12", "Associate N.", "work", "Counterparty paper ingested as CT-291. Library now holds vendor draft.", "นำร่างคู่ค้าเข้าคลังเป็น CT-291", "/assemble?s=lib"),
      m("A-2481", "11 Aug 2026 · 10:00", "Kanit S.", "work", "Client interview confirmed. Commercial positions locked for this round.", "ยืนยันสัมภาษณ์ลูกค้า ล็อกท่าทีเชิงพาณิชย์รอบนี้", "/assemble?s=ask"),
      m("A-2481", "12 Aug 2026 · 16:30", "Kanit S.", "work", "Thai-law conflict resolved. Liability cap follows vendor paper; PDPA stays non-waivable.", "ยุติความขัดแย้งกฎหมายไทย เพดานความรับผิดตามร่างผู้ขาย PDPA ไม่สละได้", "/assemble?s=law"),
      m("A-2481", "14 Aug 2026 · 09:15", "Engine", "work", "Review pack issued. 8 findings against playbook IT Cloud v4.2.", "ออกชุดตรวจ 8 ประเด็นเทียบเพลย์บุ๊ก", "/review?s=find"),
      m("A-2481", "18 Aug 2026 · 11:40", "Kanit S.", "work", "F-01 accepted as amend. Liability cap marked into the pack.", "รับ F-01 เป็นแก้ เพดานความรับผิดเข้าชุดตรวจ", "/review?s=find"),
      m("A-2481", "19 Aug 2026 · 15:00", "Review board", "review", "Board: renegotiate. Do not sign on current cap and audit terms.", "คณะกรรมการ: เจรจาใหม่ ห้ามเซ็นตามเพดานและเงื่อนไขตรวจสอบปัจจุบัน", "/review?s=board"),
      m("A-2481", "20 Aug 2026 · 09:50", "Kanit S.", "client", "Decision memo issued to client. Recommended posture: renegotiate.", "ออกบันทึกตัดสินใจถึงลูกค้า ท่าทีที่แนะนำ: เจรจาใหม่", "/review?s=memo"),
      m("A-2481", "22 Aug 2026 · 17:20", "Kanit S.", "client", "Round 2: hold. Liability cap still open with Nimbus.", "รอบ 2: ยึด เพดานความรับผิดยังเปิดกับนิมบัส", "/negotiate?s=nround"),
      m("A-2481", "25 Aug 2026 · 08:10", "Associate N.", "client", "Awaiting Nimbus markup. Next control: 5 Sep board.", "รอร่างแก้จากนิมบัส จุดควบคุมถัดไป: คณะกรรมการ 5 ก.ย.", "/negotiate?s=nround"),
      m("A-2482", "28 Jul 2026 · 10:00", "GC Charoen", "intake", "Buy-side instruction. Regional logistics target. IC date 12 Sep.", "รับงานฝั่งผู้ซื้อ เป้าหมายโลจิสติกส์ภูมิภาค คณะกรรมการลงทุน 12 ก.ย.", "/diligence?s=dmat"),
      m("A-2482", "2 Aug 2026 · 13:20", "Associate N.", "work", "Data room connected. 3,418 documents indexed.", "เชื่อมห้องข้อมูล จัดดัชนี 3,418 ฉบับ", "/diligence?s=droom"),
      m("A-2482", "18 Aug 2026 · 09:00", "Engine", "work", "Autopilot complete. 11 flags. DK-01 related-party concentration.", "ออโตไพลอตเสร็จ 11 ธง DK-01 ความหนาแน่นบุคคลเกี่ยวโยง", "/diligence?s=dflags"),
      m("A-2482", "21 Aug 2026 · 14:45", "Kanit S.", "work", "DK-01 escalated to partner. Hold on IC pack until concentration is explained.", "ยกระดับ DK-01 ถึงพาร์ทเนอร์ ยึดชุดคณะกรรมการลงทุนจนกว่าจะอธิบายความหนาแน่น", "/diligence?s=dflags"),
      m("A-2482", "24 Aug 2026 · 11:00", "Associate N.", "work", "Management interviews booked. IC pack still pending partner sign-off.", "นัดสัมภาษณ์ผู้บริหารแล้ว ชุดคณะกรรมการลงทุนยังรอพาร์ทเนอร์", "/diligence?s=dpack"),
      m("A-2483", "2 Jun 2026 · 09:30", "Partner K.", "intake", "Renewal advisory opened on facilities MSA. Client: PTT Oil Retail.", "เปิดงานให้คำปรึกษาต่ออายุสัญญาอาคาร ลูกค้า: พีทีที น้ำมัน", "/assemble?s=type"),
      m("A-2483", "20 Aug 2026 · 16:00", "Partner K.", "review", "Draft positions with client. Partner review of playbook overlay in progress.", "ร่างท่าทีกับลูกค้า พาร์ทเนอร์กำลังตรวจชั้นเพลย์บุ๊ก", "/assemble?s=type"),
      m("A-2484", "15 Jul 2026 · 08:00", "Engine", "work", "Calendar watch: facilities notice window closes 1 Aug.", "ปฏิทิน: หน้าต่างบอกเลิกอาคารปิด 1 ส.ค.", "/obligations?s=ocal"),
      m("A-2484", "1 Aug 2026 · 00:01", "Engine", "work", "Window missed. Notice not served. Assignment marked overdue.", "พ้นหน้าต่าง ไม่ได้ส่งหนังสือ งานเกินกำหนด", "/obligations?s=oalert"),
      m("A-2484", "4 Aug 2026 · 10:20", "Associate N.", "work", "Remedial notice drafted. Awaiting partner send.", "ร่างหนังสือเยียวยา รอพาร์ทเนอร์ส่ง", "/obligations?s=oalert"),
    ],
  };
}

function m(
  assignmentId: string,
  at: string,
  actor: string,
  stage: AssignmentStage,
  en: string,
  th: string,
  href?: string
): Movement {
  const slug = at.replace(/[^0-9]/g, "").slice(0, 10);
  return {
    id: `MV-${assignmentId}-${slug}-${en.slice(0, 8).replace(/\s/g, "")}`,
    assignmentId,
    at,
    actor,
    stage,
    en,
    th,
    href,
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
  const aMax = Math.max(2480, ...p.assignments.map((a) => parseInt(a.id.replace(/\D/g, ""), 10) || 0));
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
