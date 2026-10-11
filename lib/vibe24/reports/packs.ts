import type { TE } from "@/lib/model";
import type { ReportPackId } from "./types";

const P = (t: string, e: string): TE => ({ t, e });

export type ReportPack = {
  id: ReportPackId;
  name: TE;
  audience: TE;
  engineHref: string;
  studioHref: string;
  version: string;
  oneClick: TE;
  requirement: TE;
  never: TE;
};

export const REPORT_PACKS: Record<ReportPackId, ReportPack> = {
  "xray-brief": {
    id: "xray-brief",
    name: P("สรุปผู้บริหารจาก Contract X-Ray", "Management brief from Contract X-Ray"),
    audience: P("หุ้นส่วน / GC / ผู้บริหารที่ต้องตัดสินลงนาม", "Partner / GC / the executive who decides whether to sign"),
    engineHref: "/review?s=xray",
    studioHref: "/outputs?s=studio&pack=xray-brief",
    version: "LAW24-XRAY-1.0",
    oneClick: P("ร่างสรุปจากแผนที่ที่ทนายเปิดแล้ว — ช่องว่างต้องโผล่", "Draft the brief from the mapped paper. Gaps must surface."),
    requirement: P("คำตัดสิน เหตุ แผนความร้อน ข้อที่ขาด และการอ้างอิงไทย", "Verdict, why, heatmap, missing clauses and Thai citations"),
    never: P("ห้ามถมตัวเลขที่ไม่มี และเครื่องยนต์ไม่ลงนาม", "Never invent a missing number. The engine never signs."),
  },
  "decision-memo": {
    id: "decision-memo",
    name: P("บันทึกตัดสินใจทั้งฉบับ", "Whole-instrument decision memo"),
    audience: P("ผู้บริหารที่อ่านหนึ่งหน้าก่อนเจรจา", "Management reading one page before negotiation"),
    engineHref: "/holistic?s=memo",
    studioHref: "/outputs?s=studio&pack=decision-memo",
    version: "LAW24-MEMO-1.0",
    oneClick: P("ร่างบันทึกจากห้องบังคับและการจำลอง", "Draft the memo from the cockpit and the simulation"),
    requirement: P("สรุป ความเสี่ยง การเงิน การอนุมัติ และท่าที", "Summary, risks, money, approvals and posture"),
    never: P("ห้ามออกบันทึกโดยไม่จำลองผลถ้าเพลย์บุ๊กบังคับ", "Do not issue the memo without the required simulation."),
  },
  "dd-ic": {
    id: "dd-ic",
    name: P("รายงานคณะกรรมการลงทุน", "Investment-committee legal DD report"),
    audience: P("คณะกรรมการลงทุน / หุ้นส่วนดีล", "Investment committee / deal partner"),
    engineHref: "/diligence?s=drep",
    studioHref: "/outputs?s=studio&pack=dd-ic",
    version: "LAW24-DD-1.0",
    oneClick: P("ร่างรายงานจากห้องที่ตรวจแล้ว — ประเด็นล้มดีลอยู่หน้าแรก", "Draft from the verified room. Kill items stay on page one."),
    requirement: P("สุขภาพดีล ประเด็นล้มดีล เอกสารที่ขาด และข้อขัด", "Deal health, kill items, missing papers and contradictions"),
    never: P("ห้ามฝังประเด็นฆ่าดีล และห้ามใช้ข้อมูลสาธิตในรายงานจริง", "Do not bury a kill item. Demo data cannot enter a real report."),
  },
  "assemble-pack": {
    id: "assemble-pack",
    name: P("ชุดร่างที่ประกอบแล้ว", "Assembled drafting pack"),
    audience: P("ลูกค้าและทนายที่ตรวจร่าง", "The client and the reviewing lawyer"),
    engineHref: "/assemble?s=draft",
    studioHref: "/outputs?s=studio&pack=assemble-pack",
    version: "LAW24-ASM-1.0",
    oneClick: P("ร่างชุดจากข้อเท็จจริงที่ทนายยืนยัน", "Draft the pack from counsel-confirmed facts"),
    requirement: P("คู่สัญญา วัตถุประสงค์ กฎหมายที่ใช้ และข้อที่ปรับ", "Parties, purpose, governing law and adjusted clauses"),
    never: P("คำตอบที่ยังไม่ยืนยันไม่ใช่ข้อกฎหมาย และเครื่องยนต์ไม่ลงนาม", "Unconfirmed answers are not verified law. The engine never signs."),
  },
};
