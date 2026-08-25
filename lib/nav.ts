import type { ModeKey, ScreenKey } from "./model";

export const MODES: { k: ModeKey; en: string; th: string }[] = [
  { k: "assemble", en: "Assemble", th: "Assemble" },
  { k: "review", en: "Review", th: "Review" },
  { k: "holistic", en: "Holistic", th: "Holistic" },
  { k: "diligence", en: "Diligence", th: "Diligence" },
  { k: "negotiate", en: "Negotiate", th: "Negotiate" },
  { k: "obligations", en: "Obligations", th: "Obligations" },
  { k: "intel", en: "Intelligence", th: "Intelligence" },
];

export const NAV: Record<Exclude<ModeKey, "home">, [ScreenKey, string, string][]> = {
  assemble: [
    ["lib", "คลังสัญญา 500 ประเภท", "Contract library — 500 types"],
    ["type", "รายละเอียดประเภท", "Type detail"],
    ["iv", "สัมภาษณ์นำทาง", "Guided interview"],
    ["asm", "ประกอบข้อสัญญา", "Clause assembly"],
    ["draft", "ร่าง อนุมัติ ลงนาม", "Draft, approval & signing"],
    ["bilingual", "ร่างคู่ภาษา", "Bilingual mirror"],
  ],
  review: [
    ["rsetup", "ตั้งค่าการตรวจ", "Review setup"],
    ["quick", "ตรวจเร็วและข้อกำหนดสำคัญ", "Quick review & key terms"],
    ["find", "ข้อค้นพบ", "Findings"],
    ["pb", "เทียบ playbook", "Playbook comparison"],
    ["red", "redline คู่สัญญา", "Counterparty redline"],
    ["board", "คณะทบทวน AI", "AI Legal Review Board"],
    ["diff", "สิ่งที่เปลี่ยนและความหมาย", "What changed & why"],
  ],
  holistic: [
    ["hinter", "ปฏิสัมพันธ์ระหว่างข้อสัญญา", "Clause interaction"],
    ["hcons", "ความครบถ้วนและความสอดคล้อง", "Completeness & consistency"],
    ["hbal", "ลำดับเอกสารและความสมดุล", "Hierarchy & balance"],
    ["simulate", "จำลองผลของสัญญา", "Consequence simulator"],
    ["memo", "บันทึกตัดสินใจ", "Decision memo"],
  ],
  diligence: [
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
    ["ipf", "ภาพรวมพอร์ตสัญญา", "Contract portfolio"],
    ["ikg", "กราฟความรู้ทางกฎหมาย", "Legal knowledge graph"],
    ["memory", "ความจำทางกฎหมาย", "Legal memory"],
  ],
};

export function defaultScreen(mode: ModeKey): ScreenKey {
  if (mode === "home") return "home";
  return NAV[mode][0][0];
}

export function isMode(v: string): v is Exclude<ModeKey, "home"> {
  return MODES.some((m) => m.k === v);
}
