import type { Lang, ModeKey } from "./model";
import { NAV } from "./nav";
import { seedPractice, type PracticeState } from "./firm";
import { PLAYBOOKS, copyTE, helpBookHref, type PlaybookKey } from "./guides";
import type { ClauseEdit } from "./clauses";
import type { DdLive, NegotiateLive, ReviewLive, XrayView } from "./ai/types";

export type MatterId = "nimbus" | "charoen" | "portfolio";
export type FindingStatus = "pending" | "accepted" | "amended" | "escalated";
export type FlagStatus = "open" | "progress" | "escalated" | "closed";
export type RequestStatus = "open" | "progress" | "answered";
export type PositionStatus = "open" | "countered" | "agreed" | "conceded" | "hold";
export type DemoNeed =
  | "type"
  | "interview"
  | "conflict"
  | "pack"
  | "finding"
  | "board"
  | "simulate"
  | "memo"
  | "move"
  | "flag"
  | "alert";

export const DEMO_TYPE_ID = "CT-284";
export const DEMO_DOC_REF = "CT-291";
export const DEMO_FINDING = "F-01";
export const DEMO_FLAG = "DK-01";
export const DEMO_ALERT = "0";

export const NIMBUS_FILE: UploadFile = { name: "Nimbus_Cloud_SaaS_CT-291.pdf", size: 842_110, bucket: "xray" };
export const CHAROEN_FILES: UploadFile[] = [
  { name: "Charoen_VDR_index.xlsx", size: 210_400, bucket: "diligence" },
  { name: "Bangkok_Bank_Facility_CoC.pdf", size: 1_204_110, bucket: "diligence" },
  { name: "Related_party_schedule.xlsx", size: 88_200, bucket: "diligence" },
];

export const MATTERS: Record<MatterId, {
  id: MatterId;
  href: string;
  modes: Exclude<ModeKey, "home">[];
  en: { name: string; line: string };
  th: { name: string; line: string };
}> = {
  nimbus: {
    id: "nimbus",
    modes: ["assemble", "review", "holistic", "negotiate"],
    href: "/review?s=xray",
    en: { name: "Nimbus Cloud", line: "SaaS paper CT-291 · THB 24.6M · 8 findings" },
    th: { name: "Nimbus Cloud", line: "สัญญา SaaS CT-291 · ฿24.6 ล้าน · 8 ข้อค้นพบ" },
  },
  charoen: {
    id: "charoen",
    href: "/diligence?s=dflags",
    modes: ["diligence"],
    en: { name: "Charoen Logistics", line: "Buy-side DD · THB 1,850M · 2 kill items" },
    th: { name: "เจริญโลจิสติกส์", line: "ตรวจสถานะซื้อ · ฿1,850 ล้าน · 2 ประเด็นล้มดีล" },
  },
  portfolio: {
    id: "portfolio",
    href: "/obligations?s=oalert",
    modes: ["obligations", "intel"],
    en: { name: "Siam Digital portfolio", line: "12,847 contracts · 47 overdue · 212 uncapped" },
    th: { name: "พอร์ตสยาม ดิจิทัล", line: "12,847 สัญญา · เลยกำหนด 47 · ไม่จำกัด 212" },
  },
};

export function matterForMode(mode: string): MatterId | null {
  if (mode === "practice" || mode === "home" || mode === "assist" || mode === "help") return null;
  if (mode === "diligence") return "charoen";
  if (mode === "obligations" || mode === "intel" || mode === "command") return "portfolio";
  return "nimbus";
}

export type DemoStep = {
  href: string;
  mode: Exclude<ModeKey, "home">;
  screen: string;
  matter: MatterId;
  need?: DemoNeed;
  en: { title: string; coach: string; action: string };
  th: { title: string; coach: string; action: string };
};

export const DEMO_STEPS: DemoStep[] = [
  {
    href: "/review?s=xray",
    mode: "review",
    screen: "xray",
    matter: "nimbus",
    en: { title: "See the Contract X-Ray", coach: "This is the wow: upload produces a verdict, heatmap, missing clauses, Thai citations and a management brief — not a chat window.", action: "Open the X-Ray" },
    th: { title: "ดู Contract X-Ray", coach: "นี่คือจังหวะว้าว: อัปโหลดแล้วได้คำตัดสิน แผนความร้อน ข้อที่ขาด อ้างอิงกฎหมายไทย และสรุปผู้บริหาร — ไม่ใช่หน้าต่างแชต", action: "เปิด X-Ray" },
  },
  {
    href: "/assemble?s=lib",
    mode: "assemble",
    screen: "lib",
    matter: "nimbus",
    en: { title: "Pick the SaaS type", coach: "The library is filtered to C15. Open CT-284 — Software-as-a-Service. That is the type behind the Nimbus paper.", action: "Open CT-284" },
    th: { title: "เลือกประเภท SaaS", coach: "คลังถูกกรองหมวด C15 แล้ว เปิด CT-284 สัญญาบริการ SaaS — ประเภทของฉบับ Nimbus", action: "เปิด CT-284" },
  },
  {
    href: "/assemble?s=iv",
    mode: "assemble",
    screen: "iv",
    matter: "nimbus",
    need: "interview",
    en: { title: "Confirm the interview", coach: "Answers are pre-filled from the Nimbus intake. Confirm them so the clause engine can fire.", action: "Confirm answers" },
    th: { title: "ยืนยันแบบสัมภาษณ์", coach: "คำตอบถูกเติมจากข้อมูล Nimbus แล้ว กดยืนยันเพื่อให้เครื่องเลือกข้อสัญญาทำงาน", action: "ยืนยันคำตอบ" },
  },
  {
    href: "/assemble?s=asm",
    mode: "assemble",
    screen: "asm",
    matter: "nimbus",
    need: "conflict",
    en: { title: "Resolve the policy conflict", coach: "Foreign arbitration collides with company Thai-law policy. Keep Thai law — that is the house position.", action: "Keep Thai law" },
    th: { title: "ตัดสินข้อขัดนโยบาย", coach: "อนุญาโตตุลาการต่างประเทศขัดกับนโยบายกฎหมายไทยของบริษัท เลือกใช้กฎหมายไทย", action: "ใช้กฎหมายไทย" },
  },
  {
    href: "/assemble?s=draft",
    mode: "assemble",
    screen: "draft",
    matter: "nimbus",
    need: "pack",
    en: { title: "Unlock the pack", coach: "GC and CIO already signed off. Approve as DPO, then generate the DOCX/PDF pack.", action: "Approve DPO + generate" },
    th: { title: "ปลดล็อกชุดเอกสาร", coach: "GC และ CIO อนุมัติแล้ว อนุมัติในฐานะ DPO แล้วสร้างชุด DOCX/PDF", action: "อนุมัติ DPO และสร้างชุด" },
  },
  {
    href: "/review?s=find",
    mode: "review",
    screen: "find",
    matter: "nimbus",
    need: "finding",
    en: { title: "Act on finding F-01", coach: "Uncapped data-breach liability. Open F-01 and amend it into the pack — do not accept counterparty paper.", action: "Amend F-01" },
    th: { title: "จัดการข้อค้นพบ F-01", coach: "ความรับผิดจากข้อมูลไม่มีเพดาน เปิด F-01 แล้วส่งเข้าชุดแก้ไข — อย่ายอมตามฉบับคู่สัญญา", action: "แก้ไข F-01" },
  },
  {
    href: "/review?s=board",
    mode: "review",
    screen: "board",
    matter: "nimbus",
    need: "board",
    en: { title: "Show the Review Board", coach: "Seven specialists, not one chatbot. They agree the four must-haves must close. Take the board recommendation.", action: "Take recommendation" },
    th: { title: "คณะทบทวน AI", coach: "ผู้ตรวจเจ็ดคน ไม่ใช่แชตบอทตัวเดียว เห็นพ้องว่าสี่ข้อต้องได้ต้องปิด รับคำแนะนำของคณะ", action: "รับคำแนะนำ" },
  },
  {
    href: "/holistic?s=simulate",
    mode: "holistic",
    screen: "simulate",
    matter: "nimbus",
    need: "simulate",
    en: { title: "Run a consequence", coach: "Ask what happens if delivery slips 30 days. Credits are the exclusive remedy — that is the commercial punch.", action: "Run a scenario" },
    th: { title: "จำลองผลของสัญญา", coach: "ถามว่าส่งมอบล่าช้า 30 วันแล้วเกิดอะไร เครดิตเป็นเยียวยาเพียงทางเดียว — จุดนี้คือแรงกระแทกทางธุรกิจ", action: "จำลองสถานการณ์" },
  },
  {
    href: "/holistic?s=memo",
    mode: "holistic",
    screen: "memo",
    matter: "nimbus",
    need: "memo",
    en: { title: "Issue the decision memo", coach: "One page for management: renegotiate, no signature until the four must-haves close. Export it.", action: "Export memo" },
    th: { title: "ออกบันทึกตัดสินใจ", coach: "หนึ่งหน้าสำหรับผู้บริหาร: เจรจาใหม่ ไม่ลงนามจนกว่าสี่ข้อต้องได้จะปิด ส่งออกบันทึก", action: "ส่งออกบันทึก" },
  },
  {
    href: "/negotiate?s=nresp",
    mode: "negotiate",
    screen: "nresp",
    matter: "nimbus",
    need: "move",
    en: { title: "Send a hold position", coach: "Copy the liability-cap message. This is the wording counsel can put on the table in round 2.", action: "Copy hold message" },
    th: { title: "ส่งจุดยืนที่ต้องยึด", coach: "คัดลอกข้อความเพดานความรับผิด นี่คือถ้อยคำที่ทนายวางบนโต๊ะในรอบ 2 ได้เลย", action: "คัดลอกข้อความ hold" },
  },
  {
    href: "/diligence?s=dflags",
    mode: "diligence",
    screen: "dflags",
    matter: "charoen",
    need: "flag",
    en: { title: "Surface the kill items", coach: "Charoen Logistics. DK-01 is Bangkok Bank CoC default — THB 640M. Escalate it into the IC pack.", action: "Escalate DK-01" },
    th: { title: "โชว์ประเด็นล้มดีล", coach: "เจริญโลจิสติกส์ DK-01 คือผิดนัดธนาคารกรุงเทพเมื่อเปลี่ยนอำนาจควบคุม ฿640 ล้าน ส่งเข้าชุดกรรมการ", action: "ส่งต่อ DK-01" },
  },
  {
    href: "/obligations?s=oalert",
    mode: "obligations",
    screen: "oalert",
    matter: "portfolio",
    need: "alert",
    en: { title: "Stop an auto-renew", coach: "Facilities management: six days to notice, then twelve months more. Serve the notice now.", action: "Serve notice" },
    th: { title: "หยุดต่ออายุอัตโนมัติ", coach: "สัญญาบริหารอาคาร เหลือ 6 วันก่อนบอกกล่าว แล้วต่ออัตโนมัติ 12 เดือน ส่งหนังสือบอกกล่าวทันที", action: "ส่งบอกกล่าว" },
  },
];

export type UploadFile = { name: string; size: number; bucket: string };

export type LiveState = {
  demoOn: boolean;
  demoStep: number;
  matter: MatterId;
  sel: string;
  interviewDone: boolean;
  conflictChoice: "thai" | "waiver" | null;
  dpoApproved: boolean;
  packGenerated: boolean;
  signingIssued: boolean;
  findingStatus: Record<string, FindingStatus>;
  boardAccepted: boolean;
  simRan: boolean;
  memoIssued: boolean;
  sentMoves: Record<string, boolean>;
  positionStatus: Record<string, PositionStatus>;
  flagStatus: Record<string, FlagStatus>;
  requestStatus: Record<string, RequestStatus>;
  alertDone: Record<string, boolean>;
  uploads: UploadFile[];
  clauseEdits: Record<string, ClauseEdit>;
  practice: PracticeState;
  xrayReady: boolean;
  xrayLive: XrayView | null;
  reviewLive: ReviewLive | null;
  ddLive: DdLive | null;
  negotiateLive: NegotiateLive | null;
  lawyerSent: boolean;
  roomVotes: Record<string, "approve" | "reject">;
  quotePkg: string;
};

export function defaultLive(): LiveState {
  return {
    demoOn: false,
    demoStep: 0,
    matter: "nimbus",
    sel: DEMO_TYPE_ID,
    interviewDone: false,
    conflictChoice: null,
    dpoApproved: false,
    packGenerated: false,
    signingIssued: false,
    findingStatus: {},
    boardAccepted: false,
    simRan: false,
    memoIssued: false,
    sentMoves: {},
    positionStatus: {},
    flagStatus: {},
    requestStatus: {},
    alertDone: {},
    uploads: [],
    clauseEdits: {},
    practice: seedPractice(),
    xrayReady: false,
    xrayLive: null,
    reviewLive: null,
    ddLive: null,
    negotiateLive: null,
    lawyerSent: false,
    roomVotes: {},
    quotePkg: "nda",
  };
}

export function clampStep(n: number) {
  return Math.max(0, Math.min(DEMO_STEPS.length - 1, n));
}

export function stepForHref(pathname: string, screen: string) {
  const mode = pathname.replace(/^\//, "").split("/")[0];
  if (mode === "assemble" && screen === "type") {
    return DEMO_STEPS.findIndex((s) => s.screen === "lib");
  }
  return DEMO_STEPS.findIndex((s) => s.mode === mode && s.screen === screen);
}

export type LiveSnapshot = Pick<
  LiveState,
  | "interviewDone"
  | "conflictChoice"
  | "dpoApproved"
  | "packGenerated"
  | "findingStatus"
  | "boardAccepted"
  | "simRan"
  | "memoIssued"
  | "sentMoves"
  | "flagStatus"
  | "alertDone"
  | "sel"
>;

export function isNeedMet(need: DemoNeed | undefined, live: LiveSnapshot) {
  if (!need) return true;
  if (need === "type") return live.sel === DEMO_TYPE_ID;
  if (need === "interview") return live.interviewDone;
  if (need === "conflict") return live.conflictChoice != null;
  if (need === "pack") return live.dpoApproved && live.packGenerated;
  if (need === "finding") {
    const st = live.findingStatus[DEMO_FINDING];
    return st === "amended" || st === "escalated" || st === "accepted";
  }
  if (need === "board") return live.boardAccepted;
  if (need === "simulate") return live.simRan;
  if (need === "memo") return live.memoIssued;
  if (need === "move") return Object.values(live.sentMoves).some(Boolean);
  if (need === "flag") {
    const st = live.flagStatus[DEMO_FLAG];
    return st === "escalated" || st === "closed";
  }
  if (need === "alert") return Boolean(live.alertDone[DEMO_ALERT]);
  return true;
}

export function statusLabel(lang: Lang, st: string) {
  const th = lang === "th";
  const map: Record<string, [string, string]> = {
    pending: ["Pending", "รอดำเนินการ"],
    accepted: ["Accepted", "ยอมรับ"],
    amended: ["Amended", "แก้เข้าชุด"],
    escalated: ["Escalated", "ส่งต่อ"],
    open: ["Open", "เปิด"],
    progress: ["In progress", "กำลังทำ"],
    closed: ["Closed", "ปิด"],
    answered: ["Answered", "ตอบแล้ว"],
    countered: ["Countered", "โต้แล้ว"],
    agreed: ["Agreed", "ตกลง"],
    conceded: ["Conceded", "ผ่อน"],
    hold: ["Hold", "ยึดจุดยืน"],
  };
  const row = map[st];
  if (!row) return st;
  return th ? row[1] : row[0];
}

export function packText(lang: Lang) {
  if (lang === "th") {
    return [
      "LAW24 · ชุดเอกสาร Nimbus Cloud",
      "เรื่อง: สัญญาบริการ SaaS ฉบับคู่สัญญา CT-291",
      "มูลค่า: ฿24.6 ล้าน / 36 เดือน",
      "",
      "คำแนะนำ: เจรจาใหม่ — ไม่ลงนามจนกว่าสี่ข้อต้องได้จะปิด",
      "1. เพดาน 2 เท่า รวมข้อเรียกร้องข้อมูล",
      "2. DPA + SCC + รายชื่อผู้ประมวลผลช่วงก่อนวันเริ่ม",
      "3. ตัดสิทธิเลิกตามสะดวก หรือทำให้สมมาตร + ช่วยเหลือ 6 เดือน",
      "4. แนบภาคผนวก A–C และเพิ่ม escrow",
      "",
      "หลักฐาน: F-01 · cl.12.4 · Playbook IT & Cloud v4.2",
    ].join("\n");
  }
  return [
    "LAW24 · Nimbus Cloud document pack",
    "Matter: SaaS counterparty paper CT-291",
    "Value: THB 24.6M / 36 months",
    "",
    "Recommendation: Renegotiate — no signature until the four must-haves close.",
    "1. 2× cap including data claims",
    "2. DPA + SCCs + sub-processor list before go-live",
    "3. Delete convenience termination or make it symmetric + 6-month assistance",
    "4. Attach annexes A–C and add escrow",
    "",
    "Evidence: F-01 · cl.12.4 · Playbook IT & Cloud v4.2",
  ].join("\n");
}

export function ddReportText(lang: Lang) {
  if (lang === "th") {
    return [
      "LAW24 · รายงานตรวจสอบสถานะฝั่งผู้ซื้อ",
      "เป้าหมาย: เจริญโลจิสติกส์ · มูลค่า ฿1,850 ล้าน",
      "",
      "ประเด็นล้มดีล",
      "DK-01  สินเชื่อธนาคารกรุงเทพผิดนัดเมื่อเปลี่ยนอำนาจควบคุม · ฿640 ล้าน",
      "DK-02  ความหนาแน่นบุคคลเกี่ยวโยง 38% ของรายได้",
      "",
      "เอกสารที่ขาด: กรมธรรม์ D&O, สัญญาลูกค้า 3 ราย, ตารางผู้ประมวลผลช่วง",
      "คำแนะนำ: ห้ามปิดรายงานจนกว่า DK-01 จะถึงพาร์ทเนอร์และชุด IC",
      "หลักฐาน: ห้องข้อมูล Charoen · PB-DD v3.1",
      "",
      "เครื่องยนต์ไม่ลงนามแทน",
    ].join("\n");
  }
  return [
    "LAW24 · Buy-side diligence report",
    "Target: Charoen Logistics · THB 1,850M",
    "",
    "Kill items",
    "DK-01  Bangkok Bank facility defaults on change of control · THB 640M",
    "DK-02  Related-party concentration at 38% of revenue",
    "",
    "Missing: D&O policy, 3 customer contracts, sub-processor schedule",
    "Recommendation: Do not close the report until DK-01 reaches partner and the IC pack",
    "Evidence: Charoen data room · PB-DD v3.1",
    "",
    "The engine never signs.",
  ].join("\n");
}

export function boardPackText(lang: Lang) {
  if (lang === "th") {
    return [
      "LAW24 · ชุดรายงานคณะกรรมการ",
      "องค์กร: สยามดิจิทัล",
      "",
      "X-Ray นิมบัส CT-291 — คำตัดสิน: เจรจา  สี่ข้อต้องได้ยังไม่ปิด",
      "ฝาแฝด: 212 ฉบับไม่จำกัดความรับผิด",
      "ข้อผูกพัน: 47 เลยกำหนด · สัญญาอาคารเหลือ 6 วันก่อนบอกกล่าว",
      "DD เจริญ: 2 ประเด็นล้มดีล รอชุด IC",
      "",
      "ท่าทีที่แนะนำ: ห้ามลงนามนิมบัสจนกว่าเพดานข้อมูล DPA และสิทธิเลิกจะปิด",
      "เครื่องยนต์ไม่ลงนามแทน",
    ].join("\n");
  }
  return [
    "LAW24 · Board pack",
    "Tenant: Siam Digital",
    "",
    "Nimbus CT-291 X-Ray — verdict: Negotiate. Four must-haves still open.",
    "Twin: 212 uncapped-liability contracts",
    "Obligations: 47 overdue · facilities notice in 6 days",
    "Charoen DD: 2 kill items pending IC pack",
    "",
    "Recommended posture: no Nimbus signature until data cap, DPA and termination close.",
    "The engine never signs.",
  ].join("\n");
}

export function noticeLetterText(lang: Lang) {
  if (lang === "th") {
    return [
      "หนังสือบอกกล่าวไม่ต่ออายุ",
      "ถึง: ผู้ให้บริการบริหารอาคาร",
      "จาก: สยามดิจิทัล จำกัด",
      "",
      "ตามสัญญาบริหารอาคาร ข้อ 14.2 บริษัทขอใช้สิทธิไม่ต่ออายุ",
      "วันสิ้นสุดที่มีผล: ตามกำหนดในสัญญา — ห้ามต่ออัตโนมัติ 12 เดือน",
      "",
      "ร่างโดย LAW24 · ทนายเป็นผู้ลงนามในท่าที · เครื่องยนต์ไม่ลงนามแทน",
    ].join("\n");
  }
  return [
    "Notice of non-renewal",
    "To: Facilities management provider",
    "From: Siam Digital Co., Ltd.",
    "",
    "Under clause 14.2 we exercise the right not to renew.",
    "Effective expiry: as stated — do not auto-renew for a further 12 months.",
    "",
    "Drafted in LAW24 · counsel signs the posture · the engine never signs.",
  ].join("\n");
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2_000);
}

export function downloadText(filename: string, text: string) {
  downloadBlob(filename, new Blob([text], { type: "text/plain;charset=utf-8" }));
}

export function copyText(text: string) {
  return navigator.clipboard.writeText(text);
}

export type SearchHit = {
  id: string;
  href: string;
  kind: string;
  title: string;
  sub?: string;
  ask?: string;
};

export function catalogHits(lang: Lang): SearchHit[] {
  const th = lang === "th";
  const hits: SearchHit[] = [
    { id: "home", href: "/home", kind: th ? "หน้า" : "Screen", title: th ? "หน้าแรกโมดูล" : "Module home" },
    { id: "demo", href: "/review?s=xray", kind: th ? "สาธิต" : "Demo", title: th ? "เริ่มสาธิตสด" : "Start live demo" },
    { id: "host", href: "/host", kind: th ? "โต๊ะโฮสต์" : "Host desk", title: th ? "สร้างลิงก์สาธิต" : "Mint a demo link" },
  ];
  (Object.entries(NAV) as [Exclude<ModeKey, "home">, [string, string, string][]][]).forEach(([mode, screens]) => {
    screens.forEach(([k, t, e]) => {
      hits.push({
        id: `${mode}-${k}`,
        href: `/${mode}?s=${k}`,
        kind: mode,
        title: th ? t : e,
      });
    });
  });
  (Object.keys(PLAYBOOKS) as PlaybookKey[]).forEach((key) => {
    const p = PLAYBOOKS[key];
    hits.push({
      id: `pb-${p.id}`,
      href: helpBookHref(key),
      kind: th ? "เพลย์บุ๊ก" : "Playbook",
      title: `${p.id} · ${copyTE(lang, p.name)} ${p.ver}`,
      sub: copyTE(lang, p.applies),
    });
  });
  Object.values(MATTERS).forEach((m) => {
    hits.push({
      id: `matter-${m.id}`,
      href: m.href,
      kind: th ? "เรื่อง" : "Matter",
      title: th ? m.th.name : m.en.name,
      sub: th ? m.th.line : m.en.line,
    });
  });
  DEMO_STEPS.forEach((s, i) => {
    hits.push({
      id: `step-${i}`,
      href: s.href,
      kind: th ? `ขั้น ${i + 1}` : `Step ${i + 1}`,
      title: th ? s.th.title : s.en.title,
      sub: th ? s.th.action : s.en.action,
    });
  });
  return hits;
}
