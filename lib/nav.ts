import type { Edition, ModeKey, ScreenKey } from "./model";
import type { EngagementTrack } from "./firm";

export const PRACTICE_MODE = { k: "practice" as const, en: "Firm", th: "สำนักงาน" };
export const COMMAND_MODE = { k: "command" as const, en: "Control", th: "ควบคุม" };
export const ASSIST_MODE = { k: "assist" as const, en: "Assist", th: "ผู้ช่วย" };
export const HELP_MODE = { k: "help" as const, en: "Help", th: "คู่มือ" };

export const ENGINE: { k: Exclude<ModeKey, "home" | "practice" | "command" | "assist" | "help">; en: string; th: string }[] = [
  { k: "review", en: "X-Ray", th: "X-Ray" },
  { k: "holistic", en: "Cockpit", th: "ห้องบังคับ" },
  { k: "intel", en: "Twin", th: "ฝาแฝด" },
  { k: "diligence", en: "Deal X-Ray", th: "Deal X-Ray" },
  { k: "negotiate", en: "Copilot", th: "เจรจา" },
  { k: "obligations", en: "Obligations", th: "ข้อผูกพัน" },
  { k: "assemble", en: "Assemble", th: "ประกอบ" },
];

export const MODES = ENGINE;

/**
 * Destinations the X-Ray result fans out to. These are the other engine
 * modules — they sit in the top nav, but the result used to dead-end in Review.
 */
export const XRAY_HOPS: { href: string; en: string; th: string; why: { t: string; e: string } }[] = [
  { href: "/practice?s=dash", en: "Firm", th: "สำนักงาน", why: { t: "เปิดงานจากฉบับนี้ — ลูกค้า เส้นทาง และห้องตรวจ", e: "Open the assignment from this paper — client, trail and review room" } },
  { href: "/holistic?s=cockpit", en: "Cockpit", th: "ห้องบังคับ", why: { t: "ห้องบังคับของสัญญานี้ — มูลค่า ความเสี่ยง และขั้นเจรจา", e: "Command center for this agreement — value, risk, and negotiation stage" } },
  { href: "/intel?s=twin", en: "Twin", th: "ฝาแฝด", why: { t: "ถามตำแหน่งกฎหมายของฉบับนี้ — ทุกคำตอบชี้ต้นทาง", e: "Ask this paper's legal position — every answer cites a source" } },
  { href: "/diligence?s=deal", en: "Deal X-Ray", th: "Deal X-Ray", why: { t: "ส่งฉบับนี้เข้าห้องดีล — ความเสี่ยงทั้งธุรกรรม", e: "Feed this paper into the deal room — transaction-level risk" } },
  { href: "/diligence?s=dwar", en: "Contract flags", th: "ธงสัญญา", why: { t: "ธงแดงของฉบับที่ map — ไม่ใช่ทั้งห้องดีล", e: "Flags for this mapped paper — not the whole deal room" } },
  { href: "/negotiate?s=nladder", en: "Copilot", th: "เจรจา", why: { t: "ถือบันไดจุดยืนที่แผนที่เพิ่งเขียน", e: "Hold the fallback ladder the map just wrote" } },
  { href: "/obligations?s=oreg", en: "Obligations", th: "ข้อผูกพัน", why: { t: "วันที่สำคัญลงทะเบียนและปฏิทินหลังลงนาม", e: "Key dates go on the register and the post-signature calendar" } },
];

export function navModes(edition: Edition) {
  return edition === "firm"
    ? [PRACTICE_MODE, ...ENGINE, ASSIST_MODE, HELP_MODE]
    : [COMMAND_MODE, ...ENGINE, ASSIST_MODE, HELP_MODE];
}

export const NAV: Record<Exclude<ModeKey, "home">, [ScreenKey, string, string][]> = {
  practice: [
    ["dash", "ศูนย์ควบคุม", "Firm control"],
    ["pool", "คิวรับงาน", "Unassigned pool"],
    ["ereview", "ตรวจสัญญา", "Contract review"],
    ["edraft", "ร่างสัญญา", "Contract drafting"],
    ["edd", "Deal X-Ray", "Deal X-Ray"],
    ["clients", "ลูกค้า", "Clients"],
    ["assign", "บันทึกงาน", "Engagement record"],
    ["trace", "เส้นทางงาน", "Movement trail"],
    ["brain", "สมองสำนักงาน", "Firm Brain"],
    ["room", "ห้องตรวจลูกค้า", "Client Review Room"],
    ["packages", "บริการสำเร็จรูป", "Packaged services"],
    ["quote", "ใบเสนอและหนังสือว่าจ้าง", "Quote & engagement"],
  ],
  command: [
    ["desk", "ศูนย์บัญชาการ", "Legal command center"],
    ["requests", "คำขอกฎหมาย", "Legal requests"],
    ["approvals", "การอนุมัติ", "Approvals"],
    ["counsel", "ที่ปรึกษาภายนอก", "Outside counsel"],
    ["board", "รายงานคณะกรรมการ", "Board reports"],
  ],
  assist: [
    ["ask", "งานและคำสั่ง", "Job & assignment"],
  ],
  help: [
    ["use", "วิธีใช้ระบบ", "How to use LAW24"],
    ["leio", "เลโอ", "Leio"],
    ["watch", "วิจัยและกฎ", "Research & regulations"],
    ["books", "คลังเพลย์บุ๊ก", "Playbook library"],
    ["book", "เพลย์บุ๊กที่ใช้บังคับ", "Playbook in force"],
    ["trust", "ความเชื่อถือที่มองเห็น", "Visible trust"],
  ],
  assemble: [
    ["intake", "ข้อมูลจาก Review", "Review intake"],
    ["lib", "คลังสัญญา 500 ประเภท", "Contract library — 500 types"],
    ["type", "รายละเอียดประเภท", "Type detail"],
    ["iv", "สัมภาษณ์นำทาง", "Guided interview"],
    ["asm", "ประกอบข้อสัญญา", "Clause assembly"],
    ["draft", "ร่างและอนุมัติ", "Draft & approval"],
    ["areview", "พร้อมส่งตรวจ", "Ready for review"],
    ["bilingual", "ร่างคู่ภาษา", "Bilingual mirror"],
  ],
  review: [
    ["xray", "Contract X-Ray", "Contract X-Ray"],
    ["rsetup", "ตั้งค่าการตรวจ", "Review setup"],
    ["quick", "ตรวจเร็วและข้อกำหนดสำคัญ", "Quick review & key terms"],
    ["find", "ข้อค้นพบ", "Findings"],
    ["pb", "เทียบ playbook", "Playbook comparison"],
    ["red", "redline คู่สัญญา", "Counterparty redline"],
    ["board", "คณะทบทวน AI", "AI Legal Review Board"],
    ["diff", "สิ่งที่เปลี่ยนและความหมาย", "What changed & why"],
  ],
  holistic: [
    ["cockpit", "Contract Cockpit", "Contract Cockpit"],
    ["dna", "Clause DNA", "Clause DNA"],
    ["hinter", "ปฏิสัมพันธ์ระหว่างข้อสัญญา", "Clause interaction"],
    ["hcons", "ความครบถ้วนและความสอดคล้อง", "Completeness & consistency"],
    ["hbal", "ลำดับเอกสารและความสมดุล", "Hierarchy & balance"],
    ["simulate", "จำลองผลของสัญญา", "Consequence simulator"],
    ["memo", "บันทึกตัดสินใจ", "Decision memo"],
  ],
  diligence: [
    ["deal", "Deal X-Ray", "Deal X-Ray"],
    ["dmatter", "ธุรกรรม", "Transaction"],
    ["droom", "ห้องข้อมูล", "Data room"],
    ["dclass", "ดัชนีเอกสาร", "Index"],
    ["dcheck", "ศูนย์ควบคุม DD", "Control Center"],
    ["dmiss", "เอกสารที่ขาด", "Missing documents"],
    ["dfacts", "ข้อเท็จจริง", "Legal facts"],
    ["dclause", "ข้อสัญญา", "Clauses"],
    ["dcoc", "อำนาจควบคุม", "Change of control"],
    ["dcontra", "ข้อขัดแย้ง", "Contradictions"],
    ["dauth", "อำนาจลงนาม", "Authority"],
    ["dgraph", "กราฟนิติบุคคล", "Legal graph"],
    ["drisk", "ความเสี่ยง", "Risk"],
    ["dmat", "นัยสำคัญ", "Materiality"],
    ["dexpo", "มูลค่าความเสี่ยง", "Exposure"],
    ["dqa", "คำถามฝ่ายบริหาร", "Management Q&A"],
    ["dlaw", "กฎหมายที่ใช้", "Applicable law"],
    ["dev", "พยานหลักฐาน", "Evidence"],
    ["dbreak", "ข้อที่อาจฆ่าดีล", "Deal breakers"],
    ["dsim", "จำลองโครงสร้าง", "Impact simulator"],
    ["dic", "สุขภาพดีล", "Deal health"],
    ["dcp", "เงื่อนไขปิดดีล", "Closing conditions"],
    ["dfix", "แก้ไข", "Remediate"],
    ["ddisc", "ตารางเปิดเผย", "Disclosures"],
    ["dspa", "เอกสารธุรกรรม", "SPA intelligence"],
    ["drep", "รายงาน", "Report"],
    ["dwar", "ธงสัญญา", "Contract flags"],
    ["autopilot", "Autopilot", "DD Autopilot"],
  ],
  negotiate: [
    ["nstrat", "กลยุทธ์และอำนาจต่อรอง", "Strategy & leverage"],
    ["nladder", "บันไดเจรจา", "Negotiation ladder"],
    ["npos", "ตารางจุดยืน", "Position tracker"],
    ["nresp", "คำตอบที่แนะนำ", "Recommended responses"],
    ["nhist", "รอบการเจรจา", "Negotiation rounds"],
  ],
  obligations: [
    ["oreg", "ทะเบียนข้อผูกพัน", "Obligation register"],
    ["ocal", "ปฏิทินกำหนดเวลา", "Deadline calendar"],
    ["oren", "การต่ออายุ", "Renewal pipeline"],
    ["oalert", "การแจ้งเตือนและการส่งต่อ", "Alerts & escalation"],
  ],
  intel: [
    ["twin", "Living Legal Twin", "Living Legal Twin"],
    ["ipf", "ภาพรวมพอร์ตสัญญา", "Contract portfolio"],
    ["ikg", "กราฟความรู้ทางกฎหมาย", "Legal knowledge graph"],
    ["memory", "ความจำทางกฎหมาย", "Legal memory"],
  ],
};

/** Every Review screen except the map itself — the result fans into the rest of X-Ray. */
export const XRAY_REVIEW_HOPS = NAV.review
  .filter(([k]) => k !== "xray")
  .map(([k, th, en]) => ({ href: `/review?s=${k}`, k, th, en }));

const DEAL_FANOUT = new Set(["deal", "dmiss", "dcontra", "dfix", "dsim", "dic", "drep", "dwar"]);

/** Every submenu under Firm / Cockpit / Twin / Deal X-Ray / Copilot / Obligations. */
export const XRAY_ENGINE_HOPS = (
  [
    ["practice", "/practice"],
    ["holistic", "/holistic"],
    ["intel", "/intel"],
    ["diligence", "/diligence"],
    ["negotiate", "/negotiate"],
    ["obligations", "/obligations"],
  ] as const
).flatMap(([mode, path]) =>
  NAV[mode]
    .filter(([k]) => mode !== "diligence" || DEAL_FANOUT.has(k))
    .map(([k, th, en]) => ({ href: `${path}?s=${k}`, k, th, en, mode }))
);

export function defaultScreen(mode: ModeKey): ScreenKey {
  if (mode === "home") return "home";
  return NAV[mode][0][0];
}

export type FirmControlHop = {
  href: string;
  en: string;
  th: string;
  kind: "engine" | "firm";
  track?: EngagementTrack;
  why: { t: string; e: string };
};

/**
 * Firm dashboard as the OS control hub, split into the three engagements.
 * Review owns X-Ray through Obligations; drafting owns Assemble; DD owns legal risk.
 */
export const FIRM_CONTROL: FirmControlHop[] = [
  { href: "/review?s=xray", en: "X-Ray", th: "X-Ray", kind: "engine", track: "review", why: { t: "วางแผนที่สัญญา — เปิดลูกค้าและงานตรวจ", e: "Map a contract — opens the review client and assignment" } },
  { href: "/holistic?s=cockpit", en: "Cockpit", th: "ห้องบังคับ", kind: "engine", track: "review", why: { t: "มูลค่า ความเสี่ยง และขั้นเจรจาของฉบับที่ map", e: "Value, risk and negotiation stage of the mapped paper" } },
  { href: "/intel?s=twin", en: "Twin", th: "ฝาแฝด", kind: "engine", track: "review", why: { t: "ถามตำแหน่งกฎหมายของฉบับที่ map", e: "Ask the legal position of the mapped paper" } },
  { href: "/diligence?s=dwar", en: "War Room", th: "ห้องสงคราม", kind: "engine", track: "review", why: { t: "ธงแดงและตารางตรวจของสัญญานี้", e: "Flags and the review grid for this contract" } },
  { href: "/negotiate?s=nladder", en: "Copilot", th: "เจรจา", kind: "engine", track: "review", why: { t: "ถือบันไดจุดยืนของงานตรวจนี้", e: "Hold the fallback ladder for this review" } },
  { href: "/obligations?s=oreg", en: "Obligations", th: "ข้อผูกพัน", kind: "engine", track: "review", why: { t: "วันที่สำคัญลงทะเบียนหลังลงนาม", e: "Key dates onto the post-signature register" } },
  { href: "/assemble?s=intake", en: "Review intake", th: "ข้อมูลจาก Review", kind: "engine", track: "assemble", why: { t: "รับข้อเท็จจริงและข้อค้นพบที่ชี้แหล่ง", e: "Ingest source-backed facts and findings" } },
  { href: "/assemble?s=lib", en: "Library", th: "คลังประเภท", kind: "engine", track: "assemble", why: { t: "เลือกประเภทจากคลัง 500 ก่อนร่าง", e: "Pick the type from the 500-type library" } },
  { href: "/assemble?s=iv", en: "Interview", th: "สัมภาษณ์", kind: "engine", track: "assemble", why: { t: "ล็อกท่าทีเชิงพาณิชย์ก่อนประกอบข้อ", e: "Lock commercial positions before clauses fire" } },
  { href: "/assemble?s=asm", en: "Assemble", th: "ประกอบข้อ", kind: "engine", track: "assemble", why: { t: "ประกอบข้อจากคำตอบและเพลย์บุ๊ก", e: "Assemble clauses from answers and the playbook" } },
  { href: "/assemble?s=draft", en: "Draft", th: "ร่าง", kind: "engine", track: "assemble", why: { t: "ร่าง อนุมัติ และลงนาม", e: "Draft, approve and sign" } },
  { href: "/assemble?s=areview", en: "Ready for review", th: "พร้อมส่งตรวจ", kind: "engine", track: "assemble", why: { t: "ตรวจความพร้อมแล้วส่งกลับ Contract Review", e: "Preflight and hand the assembled draft back to Contract Review" } },
  { href: "/assemble?s=bilingual", en: "Bilingual", th: "คู่ภาษา", kind: "engine", track: "assemble", why: { t: "ร่างคู่ภาษาไทย–อังกฤษ", e: "Thai–English bilingual mirror" } },
  { href: "/diligence?s=deal", en: "Deal X-Ray", th: "Deal X-Ray", kind: "engine", track: "diligence", why: { t: "จอเดียวว่าอะไรฆ่าหรือหน่วงดีล", e: "One screen for what can kill or hold the deal" } },
  { href: "/diligence?s=droom", en: "Data room", th: "ห้องข้อมูล", kind: "engine", track: "diligence", why: { t: "จัดดัชนีทั้งห้อง แล้วประกอบครอบครัวสัญญา", e: "Index the room and reconstruct contract families" } },
  { href: "/diligence?s=dmiss", en: "Missing papers", th: "เอกสารที่ขาด", kind: "engine", track: "diligence", why: { t: "สิ่งที่ควรมีแต่ยังไม่ถูกส่ง", e: "What should exist but was not provided" } },
  { href: "/diligence?s=dcontra", en: "Contradictions", th: "ข้อขัดแย้ง", kind: "engine", track: "diligence", why: { t: "ข้อเท็จจริงที่ขัดกันข้ามเอกสาร", e: "Facts that conflict across documents" } },
  { href: "/diligence?s=dbreak", en: "Deal breakers", th: "ข้อที่อาจฆ่าดีล", kind: "engine", track: "diligence", why: { t: "เจ็ดอย่างที่อาจฆ่าดีล ไม่ใช่ 842 ข้อค้นพบ", e: "The few things that can kill the deal — not 842 findings" } },
  { href: "/diligence?s=dsim", en: "Simulator", th: "จำลองดีล", kind: "engine", track: "diligence", why: { t: "เปลี่ยนโครงสร้างแล้วดูความเสี่ยงใหม่", e: "Change the structure and watch exposure move" } },
  { href: "/diligence?s=dfix", en: "Remediate", th: "แก้ไข", kind: "engine", track: "diligence", why: { t: "จากข้อค้นพบสู่ฉบับแก้ไข ความยินยอม หรือ CP", e: "From a finding to an amendment, consent or CP" } },
  { href: "/diligence?s=dic", en: "Deal health", th: "สุขภาพดีล", kind: "engine", track: "diligence", why: { t: "โหมดคณะกรรมการ — ความเสี่ยงรวมและเงื่อนไข", e: "IC mode — overall risk and the conditions" } },
  { href: "/diligence?s=drep", en: "Report", th: "รายงาน", kind: "engine", track: "diligence", why: { t: "รายงานที่ทุกประโยคชี้หลักฐาน", e: "The report in which every line cites evidence" } },
  { href: "/practice?s=clients", en: "Clients", th: "ลูกค้า", kind: "firm", why: { t: "บัญชีลูกค้า — เปิดงานทั้งสามประเภท", e: "Client book — open work on any of the three tracks" } },
  { href: "/practice?s=pool", en: "Unassigned pool", th: "คิวรับงาน", kind: "firm", why: { t: "ลูกค้าและงานใหม่ที่ยังไม่มีผู้รับผิดชอบ", e: "New clients and engagements waiting for allocation" } },
  { href: "/practice?s=assign", en: "Record", th: "บันทึกงาน", kind: "firm", why: { t: "บันทึกงานทั้งสามประเภท — ตรวจ ร่าง DD", e: "Engagement record across review, drafting and DD" } },
  { href: "/practice?s=trace", en: "Trail", th: "เส้นทาง", kind: "firm", why: { t: "ไล่จากรับเรื่องถึงจุดควบคุมปัจจุบัน", e: "Read intake through the current control point" } },
  { href: "/practice?s=room", en: "Client Room", th: "ห้องลูกค้า", kind: "firm", why: { t: "ห้องตรวจภายใต้แบรนด์สำนักงาน", e: "Branded review room for the mapped client" } },
  { href: "/assist?s=ask", en: "Assist", th: "ผู้ช่วย", kind: "firm", why: { t: "อธิบายงานแล้วให้ระบบชี้ทาง", e: "Describe the job and let the OS route it" } },
];

export function firmControlFor(track: EngagementTrack) {
  return FIRM_CONTROL.filter((h) => h.kind === "engine" && h.track === track);
}

export function modeTrack(mode: string): EngagementTrack | null {
  if (mode === "review" || mode === "holistic" || mode === "intel" || mode === "negotiate" || mode === "obligations") return "review";
  if (mode === "assemble") return "assemble";
  if (mode === "diligence") return "diligence";
  return null;
}

export function practiceScreenTrack(screen: string): EngagementTrack | null {
  if (screen === "ereview") return "review";
  if (screen === "edraft") return "assemble";
  if (screen === "edd") return "diligence";
  return null;
}

/** Where sign-in lands. Module home stays available from the 2×2 grid. */
export const WORK_HREF = "/review?s=xray";
export const PRACTICE_HREF = "/practice?s=dash";
export const CORPORATE_HREF = "/home";

export function landingHref(edition: Edition) {
  return edition === "firm" ? PRACTICE_HREF : CORPORATE_HREF;
}

export function isMode(v: string): v is Exclude<ModeKey, "home"> {
  return v === "practice" || v === "command" || v === "assist" || v === "help" || ENGINE.some((m) => m.k === v);
}

export function screenSiblings(mode: string, screen: string) {
  if (!isMode(mode)) return { prev: null, next: null, index: -1, total: 0, current: null as [ScreenKey, string, string] | null };
  const list = NAV[mode];
  const index = Math.max(0, list.findIndex(([k]) => k === screen));
  return {
    prev: index > 0 ? list[index - 1] : null,
    next: index < list.length - 1 ? list[index + 1] : null,
    index,
    total: list.length,
    current: list[index] ?? null,
  };
}
