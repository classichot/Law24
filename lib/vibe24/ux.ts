import type { TE } from "@/lib/model";

const P = (t: string, e: string): TE => ({ t, e });

/** Operating mode. Same data model — not three products. */
export type UxMode = "easy" | "professional" | "agi";
export type AssistLevel = "myself" | "guide" | "forMe";
export type UxRole = "management" | "specialist" | "contributor";
export type AgiTeam = "single" | "team" | "swarm";

export const UX_MODES: { id: UxMode; name: TE; line: TE }[] = [
  { id: "easy", name: P("ง่าย", "Easy"), line: P("บอกเป้าหมาย ระบบจัดงานให้", "Say the goal. LAW24 organises the work.") },
  { id: "professional", name: P("มืออาชีพ", "Professional"), line: P("โมดูล เพลย์บุ๊ก และการตั้งค่าครบ", "Full modules, playbooks and configuration.") },
  { id: "agi", name: P("AGI", "AGI"), line: P("เอเจนต์ทำงาน ทนายตรวจข้อยกเว้น", "Agents execute. Counsel reviews exceptions.") },
];

export const ASSIST_LEVELS: { id: AssistLevel; name: TE; line: TE }[] = [
  { id: "myself", name: P("ทำเอง", "Do It Myself"), line: P("เดินเวิร์กโฟลว์เดิมของสำนักงาน", "Use the traditional professional workflow.") },
  { id: "guide", name: P("พาทำ", "Guide Me"), line: P("AI อธิบายทีละขั้น ทนายตัดสิน", "AI explains each step. Counsel decides.") },
  { id: "forMe", name: P("ทำให้", "Do It For Me"), line: P("AI ทำซ้ำ ถามเฉพาะข้อมูลที่ขาดและการอนุมัติ", "AI does the repetitive work. You supply gaps and approvals.") },
];

export const UX_ROLES: { id: UxRole; name: TE; focus: TE }[] = [
  { id: "management", name: P("ผู้บริหาร", "Management"), focus: P("สถานะ ความเสี่ยง การตัดสินใจ และผลกระทบ", "Status, risk, decisions and impact") },
  { id: "specialist", name: P("ผู้เชี่ยวชาญ", "Specialist"), focus: P("วิเคราะห์ หลักฐาน เพลย์บุ๊ก และเวิร์กโฟลว์", "Analysis, evidence, playbooks and workflow") },
  { id: "contributor", name: P("ผู้ส่งข้อมูล", "Contributor"), focus: P("สิ่งที่คุณต้องทำวันนี้", "Things you need to do today") },
];

export const AGI_TEAMS: { id: AgiTeam; name: TE; line: TE }[] = [
  { id: "single", name: P("เอเจนต์เดียว", "Single agent"), line: P("หนึ่งเอเจนต์เดินภารกิจนี้", "One agent walks this mission.") },
  { id: "team", name: P("ทีม", "Team"), line: P("ร่าง ตรวจ และหลักฐานแยกบทบาท", "Draft, review and evidence as separate roles.") },
  { id: "swarm", name: P("สวอร์ม", "Swarm"), line: P("หลายเอเจนต์ขนาน แล้วรวมให้ทนายตรวจ", "Parallel agents, then counsel reviews the merge.") },
];

export const MASTER_RULE: TE = P(
  "อย่าให้ผู้ใช้มาเรียนซอฟต์แวร์ ให้ซอฟต์แวร์เรียนว่าผู้ใช้ต้องการบรรลุอะไร",
  "Don't ask the user to learn the software. Let the software learn what the user is trying to achieve.",
);

export const UX_TESTS = [
  { id: "thirty", name: P("ทดสอบ 30 วินาที", "30-second test"), ask: P("ผู้ใช้ใหม่เข้าใจหน้าจอใน 30 วินาทีหรือไม่", "Can a first-time non-expert see what this screen is for in 30 seconds?") },
  { id: "next", name: P("ทดสอบขั้นถัดไป", "Next-step test"), ask: P("รู้ทันทีว่าต้องทำอะไรต่อหรือไม่", "Can the user immediately identify what to do next?") },
  { id: "terms", name: P("ทดสอบศัพท์", "Terminology test"), ask: P("ทำจบได้โดยไม่ต้องรู้ศัพท์เฉพาะหรือไม่", "Can the workflow finish without specialist terminology?") },
  { id: "ai", name: P("ทดสอบ AI", "AI test"), ask: P("AI ทำหรือพาทำส่วนยากได้หรือไม่", "Can AI perform or guide the difficult parts?") },
  { id: "disclose", name: P("ทดสอบเปิดเผยทีละชั้น", "Progressive disclosure test"), ask: P("การตั้งค่าขั้นสูงถูกซ่อนจนกว่าจะต้องใช้หรือไม่", "Are advanced controls hidden until needed?") },
  { id: "outcome", name: P("ทดสอบผลลัพธ์", "Outcome test"), ask: P("หน้าจอบอกผลทางธุรกิจ ไม่ใช่แค่ฟีเจอร์หรือไม่", "Does the screen communicate the business outcome, not only the feature?") },
  { id: "exception", name: P("ทดสอบข้อยกเว้น", "Exception test"), ask: P("คนทำเฉพาะงานที่ต้องใช้คนจริงหรือไม่", "Are humans doing only work that requires a human?") },
] as const;

export function defaultRole(edition: "firm" | "corporate"): UxRole {
  return edition === "firm" ? "specialist" : "management";
}

export function defaultAssist(mode: UxMode): AssistLevel {
  if (mode === "agi") return "forMe";
  if (mode === "professional") return "myself";
  return "guide";
}
