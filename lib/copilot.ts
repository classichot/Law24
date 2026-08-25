import type { Lang } from "./model";
import { L } from "./model";

export type CopilotMsg = { role: "user" | "ai"; text: string; cites?: { label: string; href?: string }[] };

export function copilotIntro(lang: Lang): CopilotMsg {
  return {
    role: "ai",
    text: lang === "th"
      ? "LAW24 อ้างหลักฐานทุกข้อสรุป — ข้อสัญญา playbook หรือฐานกฎหมาย ถามเรื่อง Nimbus Cloud, Charoen Logistics หรือพอร์ตได้เลย"
      : "LAW24 cites every material conclusion — clause, playbook or legal authority. Ask about Nimbus Cloud, Charoen Logistics, or the portfolio.",
  };
}

export const SUGGESTIONS_EN = [
  "What is our maximum exposure?",
  "Which contracts in force carry uncapped liability?",
  "What happens if control of the company changes?",
  "Can the customer terminate without paying?",
];

export const SUGGESTIONS_TH = [
  "ความเสี่ยงสูงสุดของเราคือเท่าใด",
  "สัญญาใดมีความรับผิดไม่จำกัดและยังใช้บังคับอยู่",
  "ถ้าเปลี่ยนอำนาจควบคุมวันนี้สัญญาใดถูกกระทบ",
  "ลูกค้าเลิกสัญญาได้โดยไม่ต้องชำระหรือไม่",
];

export function answerCopilot(q: string, lang: Lang): CopilotMsg {
  const t = q.toLowerCase();
  const th = lang === "th";
  if (t.includes("exposure") || t.includes("maximum") || t.includes("ความเสี่ยง") || t.includes("เพดาน")) {
    return {
      role: "ai",
      text: th
        ? "เพดานทั่วไปคือ 12 เดือนของค่าบริการ (฿8.2 ล้าน) แต่ข้อ 12.4 ยกเว้นข้อเรียกร้องด้านข้อมูล ทำให้ความเสี่ยงจากข้อมูลรั่วไหลไม่มีเพดาน ขณะที่ผู้ให้บริการควบคุมระบบ — playbook กำหนดเพดาน 2 เท่า รวมข้อเรียกร้องด้านข้อมูล"
        : "The general cap is 12 months of fees (THB 8.2M), but clause 12.4 carves out data claims, so data-breach exposure is unlimited while the provider controls the environment. Playbook IT & Cloud v4.2 requires a 2× cap including personal-data claims.",
      cites: [
        { label: "cl.12.4 · p.18", href: "/review?s=find" },
        { label: "Playbook IT & Cloud v4.2", href: "/review?s=pb" },
        { label: "F-01", href: "/review?s=find" },
      ],
    };
  }
  if (t.includes("control") || t.includes("อำนาจควบคุม") || t.includes("change of control")) {
    return {
      role: "ai",
      text: th
        ? "ดีลเจริญโลจิสติกส์: สัญญาสินเชื่อธนาคารกรุงเทพ ฿640 ล้านผิดนัดทันทีเมื่อเปลี่ยนอำนาจควบคุม ลูกค้า 7 รายเลิกสัญญาได้ คิดเป็นรายได้ 22% ผู้ร่วมทุนเวียดนามมีสิทธิซื้อก่อน"
        : "Charoen Logistics: Bangkok Bank facility THB 640M defaults immediately on change of control. Seven customers may terminate — 22% of revenue. The Vietnam JV partner holds a pre-emption right.",
      cites: [
        { label: "DK-01 Facility CT-155", href: "/diligence?s=dflags" },
        { label: "DK-02 CT-268", href: "/diligence?s=dmap" },
      ],
    };
  }
  if (t.includes("uncapped") || t.includes("ไม่จำกัด") || t.includes("in force")) {
    return {
      role: "ai",
      text: th
        ? "พอร์ตมีสัญญาที่ใช้บังคับอยู่ 12,847 ฉบับ ความรับผิดไม่จำกัด 212 ฉบับ ต่ออายุอัตโนมัติไม่มีเพดานราคา 486 ฉบับ"
        : "12,847 contracts in force. 212 carry uncapped liability. 486 auto-renew with uncapped uplift.",
      cites: [{ label: "Portfolio intelligence", href: "/intel?s=ipf" }],
    };
  }
  if (t.includes("terminat") || t.includes("เลิก")) {
    return {
      role: "ai",
      text: th
        ? "ผู้ให้บริการเลิกได้ตามสะดวกใน 30 วัน ฝ่ายเราเลิกได้เมื่อผิดสัญญาเท่านั้น และผูกพันขั้นต่ำ 36 เดือน ไม่มีข้อช่วยเหลือช่วงเปลี่ยนผ่าน — F-03"
        : "The provider may terminate for convenience on 30 days; we may terminate for cause only, remaining bound to a 36-month minimum with no exit assistance — finding F-03.",
      cites: [{ label: "cl.11.2 · p.16", href: "/review?s=find" }],
    };
  }
  return {
    role: "ai",
    text: th
      ? `ยังไม่มีคำตอบที่ผูกหลักฐานสำหรับ “${q}” ลองถามเรื่องเพดานความรับผิด PDPA การเลิกสัญญา หรือธงแดงของเจริญโลจิสติกส์`
      : `No evidence-linked answer yet for “${q}”. Try liability cap, PDPA transfer, termination, or Charoen Logistics red flags.`,
    cites: [{ label: "Findings", href: "/review?s=find" }, { label: "Red flags", href: "/diligence?s=dflags" }],
  };
}
