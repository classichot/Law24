import type { Edition } from "./model";
import { PLAYBOOKS, type PlaybookKey, type TE } from "./guides";

const P = (t: string, e: string): TE => ({ t, e });

export const HELP_PRINCIPLES: { k: TE; d: TE }[] = [
  {
    k: P("ระบบปฏิบัติการ ไม่ใช่แชตบอท", "An operating system, not a chatbot"),
    d: P("องค์กรกลัวคำแนะนำที่ไม่น่าเชื่อถือ สำนักงานกลัวชั่วโมงที่หาย — LAW24 แสดงการควบคุมให้ฝ่ายหนึ่ง และรายได้ต่อเนื่องให้อีกฝ่าย", "Corporates fear unreliable advice. Firms fear lost hours. LAW24 shows control to one and recurring revenue to the other"),
  },
  {
    k: P("หลักฐานทุกข้อสรุป", "Evidence on every conclusion"),
    d: P("ข้อสรุปที่สำคัญต้องชี้ข้อสัญญา เพลย์บุ๊ก หรือฐานกฎหมาย", "Every material conclusion cites a clause, a playbook or an authority"),
  },
  {
    k: P("ทนายเป็นผู้ตัดสิน", "The lawyer keeps the decision"),
    d: P("เครื่องยนต์จัดเรื่อง ชี้ประเด็น และร่างคำตอบ — ห้ามลงนามแทน", "The engine files, flags and drafts — it never signs"),
  },
  {
    k: P("เพลย์บุ๊กบ้านเป็นกฎ", "The house playbook is the rule"),
    d: P("แต่ละโมดูลมีเพลย์บุ๊กติดมา เปิดในคู่มือนี้ก่อนลงมือ", "Each module carries a playbook. Open it here before you work"),
  },
];

export const HELP_START: { n: string; t: TE; d: TE }[] = [
  {
    n: "01",
    t: P("เลือกโหมดตอนเข้าสู่ระบบ", "Choose the mode at sign-in"),
    d: P("องค์กร = ศูนย์บัญชาการของบริษัทนี้ สำนักงาน = ลูกค้า งาน และพอร์ทัลภายใต้แบรนด์ เครื่องยนต์ชุดเดียวกัน", "Corporate = this company's command center. Firm = clients, matters and a branded portal. Same engine."),
  },
  {
    n: "02",
    t: P("ถ้ายังไม่รู้โมดูล — ถามเลโอ หรือเปิดผู้ช่วย", "If the module is not obvious — ask Leio or open Assist"),
    d: P("เลโอตอบวิธีใช้ วิจัย และกฎ ผู้ช่วยชี้โมดูลกับฟังก์ชันของงานที่กำลังทำ", "Leio answers how to use, research and regulation. Assist names the module and function for the live job."),
  },
  {
    n: "03",
    t: P("อ่านเพลย์บุ๊กที่ติดมากับโมดูล", "Read the playbook attached to the module"),
    d: P("แถบคู่มือใต้เมนู หรือเปิดคลังเพลย์บุ๊กในโมดูลนี้", "The rail under the menus, or the library in this module."),
  },
  {
    n: "04",
    t: P("เดินเมนูจากซ้ายไปขวา", "Walk the menus left to right"),
    d: P("แต่ละโมดูลมีลำดับ อย่าข้ามขั้นที่ล็อกท่าทีหรือหลักฐาน", "Each module has an order. Do not skip a step that locks a position or evidence."),
  },
  {
    n: "05",
    t: P("ทนายยืนยันท่าที แล้วค่อยส่งต่อ", "Counsel confirms the posture, then hand off"),
    d: P("ลงนาม เจรจาใหม่ หรือปฏิเสธ — เครื่องยนต์ไม่เลือกแทน", "Sign, renegotiate or reject — the engine does not pick for you."),
  },
];

export const HELP_KEYS: { k: string; d: TE }[] = [
  { k: "Ctrl K", d: P("ค้นหาโมดูล ข้อค้นพบ ประเภทสัญญา หรือถามเลโอ", "Search modules, findings, types, or ask Leio") },
  { k: "Ctrl J", d: P("เปิดเลโอด้านข้าง — วิธีใช้ วิจัย กฎ", "Open Leio in the side rail — how to use, research, regulation") },
  { k: "N / P", d: P("ขณะสาธิตสด — ขั้นถัดไป / ขั้นก่อน", "During live demo — next / previous step") },
];

export const MODULE_WHEN: {
  mode: string;
  href: string;
  playbook: PlaybookKey;
  firmOnly?: boolean;
  corpOnly?: boolean;
  when: TE;
  first: TE;
}[] = [
  { mode: "assist", href: "/assist?s=ask", playbook: "router", when: P("ยังไม่รู้ว่าจะเปิดโมดูลใด", "It is not yet obvious which module to open"), first: P("อธิบายงานและคำสั่ง", "Describe the job and the assignment") },
  { mode: "command", href: "/command?s=desk", playbook: "command", corpOnly: true, when: P("คำขอกฎหมาย อนุมัติ ที่ปรึกษาภายนอก และรายงานคณะกรรมการ", "Legal requests, approvals, outside counsel and board reports"), first: P("เปิดศูนย์บัญชาการ แล้วไล่คำขอที่ยังเปิด", "Open the command center, then work open requests") },
  { mode: "practice", href: "/practice?s=dash", playbook: "practice", firmOnly: true, when: P("งานที่ปรึกษา — ต้องมีลูกค้า งาน และเส้นทาง", "Advisory work — a client, an assignment and a trail"), first: P("เปิดหรือเลือกงาน แล้วทำในเครื่องยนต์", "Open or pick the assignment, then work in the engine") },
  { mode: "assemble", href: "/assemble?s=lib", playbook: "assembly", when: P("ต้องสร้างร่างจากเจตนาทางธุรกิจ", "A draft must be built from a business intention"), first: P("เลือกประเภทจากคลังไทย ห้ามร่างลอย", "Pick a Thai type — no freehand draft") },
  { mode: "review", href: "/review?s=xray", playbook: "itcloud", when: P("มีฉบับต้องรู้ก่อนลงนาม — X-Ray ในสามนาที", "A paper must be known before signature — an X-Ray in under three minutes"), first: P("อัปโหลด แล้วอ่านคำตัดสิน Accept / Negotiate / Do Not Sign", "Upload, then read Accept / Negotiate / Do Not Sign") },
  { mode: "holistic", href: "/holistic?s=cockpit", playbook: "decision", when: P("ต้องเห็นทั้งฉบับเป็นห้องบังคับก่อนบันทึกถึงผู้บริหาร", "The whole instrument must be seen as a cockpit before the memo"), first: P("อ่านห้องบังคับและ Clause DNA แล้วจำลองผลก่อนบันทึก", "Read the cockpit and Clause DNA, then simulate before the memo") },
  { mode: "diligence", href: "/diligence?s=dwar", playbook: "dd", when: P("ห้องข้อมูลและประเด็นที่อาจล้มดีล", "A data room and items that could kill the deal"), first: P("เปิดห้องสงคราม แล้วขึ้นธงจากหลักฐาน", "Open the war room, then flag from evidence") },
  { mode: "intel", href: "/intel?s=twin", playbook: "memory", when: P("ถามทั้งพอร์ต หรือสิ่งที่องค์กรเคยยอม", "A question across the estate, or what this tenant already accepted"), first: P("ถามฝาแฝด — ต้องมีต้นทาง", "Ask the twin — it must trace to source") },
  { mode: "negotiate", href: "/negotiate?s=nstrat", playbook: "mandate", when: P("ต้องถือจุดยืนและตอบรอบเจรจา", "Positions must be held and a round answered"), first: P("ถือสี่ข้อต้องได้ตามอำนาจเจรจา", "Hold the four must-haves under the mandate") },
  { mode: "obligations", href: "/obligations?s=oreg", playbook: "control", when: P("หลังลงนาม — กำหนด ต่ออายุ และการส่งต่อ", "After signature — deadlines, renewals and escalation"), first: P("เปิดทะเบียนแล้วไล่รายการที่พ้นกำหนด", "Open the register, then work anything overdue") },
  { mode: "help", href: "/help?s=leio", playbook: "help", when: P("ต้องถามวิธีใช้ วิจัย หรือกฎที่เพิ่งออก", "How to use, a research point, or a regulation that just moved"), first: P("ถามเลโอ หรือเปิดงานวิจัยและกฎ", "Ask Leio, or open research and regulations") },
];

export function visiblePlaybooks(edition: Edition): PlaybookKey[] {
  return (Object.keys(PLAYBOOKS) as PlaybookKey[]).filter((k) => {
    if (edition !== "firm" && k === "practice") return false;
    if (edition === "firm" && k === "command") return false;
    return true;
  });
}

export function visibleModules(edition: Edition) {
  return MODULE_WHEN.filter((m) => {
    if (edition !== "firm" && m.firmOnly) return false;
    if (edition === "firm" && "corpOnly" in m && m.corpOnly) return false;
    return true;
  });
}
