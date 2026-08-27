import type { Edition, ModeKey, ScreenKey } from "./model";

export const PRACTICE_MODE = { k: "practice" as const, en: "Firm", th: "สำนักงาน" };
export const COMMAND_MODE = { k: "command" as const, en: "Control", th: "ควบคุม" };
export const ASSIST_MODE = { k: "assist" as const, en: "Assist", th: "ผู้ช่วย" };
export const HELP_MODE = { k: "help" as const, en: "Help", th: "คู่มือ" };

export const ENGINE: { k: Exclude<ModeKey, "home" | "practice" | "command" | "assist" | "help">; en: string; th: string }[] = [
  { k: "review", en: "X-Ray", th: "X-Ray" },
  { k: "holistic", en: "Cockpit", th: "ห้องบังคับ" },
  { k: "intel", en: "Twin", th: "ฝาแฝด" },
  { k: "diligence", en: "War Room", th: "ห้องสงคราม" },
  { k: "negotiate", en: "Copilot", th: "เจรจา" },
  { k: "obligations", en: "Obligations", th: "ข้อผูกพัน" },
  { k: "assemble", en: "Assemble", th: "ประกอบ" },
];

export const MODES = ENGINE;

export function navModes(edition: Edition) {
  return edition === "firm"
    ? [PRACTICE_MODE, ...ENGINE, ASSIST_MODE, HELP_MODE]
    : [COMMAND_MODE, ...ENGINE, ASSIST_MODE, HELP_MODE];
}

export const NAV: Record<Exclude<ModeKey, "home">, [ScreenKey, string, string][]> = {
  practice: [
    ["dash", "แดชบอร์ดบริหาร", "Management dashboard"],
    ["clients", "ลูกค้า", "Clients"],
    ["assign", "งาน", "Assignments"],
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
    ["lib", "คลังสัญญา 500 ประเภท", "Contract library — 500 types"],
    ["type", "รายละเอียดประเภท", "Type detail"],
    ["iv", "สัมภาษณ์นำทาง", "Guided interview"],
    ["asm", "ประกอบข้อสัญญา", "Clause assembly"],
    ["draft", "ร่าง อนุมัติ ลงนาม", "Draft, approval & signing"],
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
    ["dwar", "ห้องสงคราม DD", "DD War Room"],
    ["dmatter", "ตั้งเรื่อง", "Matter"],
    ["droom", "ห้องข้อมูล", "Data room"],
    ["dgrid", "ตารางตรวจเอกสาร", "Review grid"],
    ["dmap", "แผนผังดีล", "Deal Map"],
    ["dflags", "ธงแดงและข้อค้นพบ", "Findings & red flags"],
    ["dreq", "คำขอและคำถาม", "Requests & Q&A"],
    ["dqa", "ความครบถ้วนของงานตรวจ", "Coverage & QA"],
    ["drep", "รายงาน", "Reports"],
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

export function defaultScreen(mode: ModeKey): ScreenKey {
  if (mode === "home") return "home";
  return NAV[mode][0][0];
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
