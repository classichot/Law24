import type { Edition, TE } from "@/lib/model";
import type { ProductModule } from "@/lib/nav";
import type { UxRole } from "./ux";

const P = (t: string, e: string): TE => ({ t, e });

export type JourneyStage =
  | "assess"
  | "collect"
  | "analyze"
  | "recommend"
  | "execute"
  | "review"
  | "complete";

export const JOURNEY_STAGES: { id: JourneyStage; name: TE }[] = [
  { id: "assess", name: P("ประเมิน", "Assess") },
  { id: "collect", name: P("รวบรวม", "Collect") },
  { id: "analyze", name: P("วิเคราะห์", "Analyze") },
  { id: "recommend", name: P("แนะนำ", "Recommend") },
  { id: "execute", name: P("ดำเนินการ", "Execute") },
  { id: "review", name: P("ตรวจ", "Review") },
  { id: "complete", name: P("เสร็จ", "Complete") },
];

export type MissionId =
  | "analyse-contract"
  | "draft-contract"
  | "diligence-deal"
  | "decision-paper"
  | "track-obligations"
  | "dont-know";

export type MissionStep = {
  stage: JourneyStage;
  href: string;
  name: TE;
  need: TE;
};

export type MissionDef = {
  id: MissionId;
  module: ProductModule | "office";
  name: TE;
  goal: TE;
  why: TE;
  aiShare: number;
  userTime: TE;
  involvement: "low" | "medium" | "high";
  roles: UxRole[];
  editions: Edition[];
  reportPack?: string;
  demo?: "review" | "assemble" | "diligence";
  keywords: string[];
  steps: MissionStep[];
  requires: { ok: boolean; label: TE }[];
};

export const MISSIONS: Record<MissionId, MissionDef> = {
  "analyse-contract": {
    id: "analyse-contract",
    module: "review",
    name: P("วิเคราะห์สัญญาที่คู่ส่งมา", "Analyse a contract they sent us"),
    goal: P("รู้ว่าลงนาม เจรจา หรือห้ามลงนาม — พร้อมหลักฐาน", "Know whether to sign, negotiate or refuse — with evidence"),
    why: P("X-Ray ทำแผนที่ คำตัดสิน และสรุปผู้บริหาร ทนายเป็นผู้ยืนยัน", "X-Ray maps the paper, verdict and management brief. Counsel confirms."),
    aiShare: 78,
    userTime: P("12 นาที", "12 min"),
    involvement: "medium",
    roles: ["management", "specialist", "contributor"],
    editions: ["firm", "corporate"],
    reportPack: "xray-brief",
    demo: "review",
    keywords: ["analyse", "analyze", "review", "x-ray", "xray", "upload", "saas", "msa", "ตรวจ", "วิเคราะห์", "อัปโหลด", "สัญญา"],
    steps: [
      { stage: "assess", href: "/review?s=xray", name: P("เปิดงานตรวจ", "Open the review"), need: P("ชื่อลูกค้าและชื่องาน", "Client and engagement name") },
      { stage: "collect", href: "/review?s=xray", name: P("วางไฟล์สัญญา", "Drop the paper"), need: P("PDF หรือ DOCX", "PDF or DOCX") },
      { stage: "analyze", href: "/review?s=xray", name: P("อ่านคำตัดสินและแผนความร้อน", "Read the verdict and heatmap"), need: P("ทนายยืนยันคำตัดสิน", "Counsel confirms the verdict") },
      { stage: "recommend", href: "/review?s=find", name: P("เดินข้อค้นพบ", "Walk the findings"), need: P("รับ แก้ ส่งต่อ หรือยกระดับ", "Accept, amend, escalate or hold") },
      { stage: "review", href: "/outputs?s=studio&pack=xray-brief", name: P("ตรวจสรุปผู้บริหาร", "Review the management brief"), need: P("อนุมัติหรือแก้ช่องว่าง", "Approve or close gaps") },
      { stage: "complete", href: "/holistic?s=memo", name: P("ส่งบันทึกหรือเข้าเจรจา", "Issue the memo or negotiate"), need: P("ทนายเป็นผู้ส่ง", "Counsel sends it") },
    ],
    requires: [
      { ok: true, label: P("เพลย์บุ๊กบ้าน", "House playbook") },
      { ok: false, label: P("ไฟล์สัญญา", "The contract file") },
    ],
  },
  "draft-contract": {
    id: "draft-contract",
    module: "assemble",
    name: P("ร่างสัญญาตามมาตรฐานบ้าน", "Draft a house-standard agreement"),
    goal: P("ได้ร่างที่ปรับทีละข้อได้ โดยไม่ลงนามแทน", "A live draft you can adjust clause by clause. The engine never signs."),
    why: P("รับข้อมูลหรือแบบสอบถาม แล้วประกอบข้อตามประเภทไทย", "Intake papers or the AI questionnaire, then assemble to the Thai type."),
    aiShare: 84,
    userTime: P("15 นาที", "15 min"),
    involvement: "medium",
    roles: ["specialist", "contributor"],
    editions: ["firm", "corporate"],
    reportPack: "assemble-pack",
    demo: "assemble",
    keywords: ["draft", "assemble", "template", "nda", "msa", "mou", "ร่าง", "ประกอบ", "แม่แบบ", "สัญญาใหม่"],
    steps: [
      { stage: "assess", href: "/assemble?s=intake", name: P("เลือกทางรับข้อมูล", "Choose the intake route"), need: P("เอกสารหรือคำตอบ", "Papers or answers") },
      { stage: "collect", href: "/assemble?s=aiq", name: P("ตอบเฉพาะข้อที่กระทบประเภทนี้", "Answer only what this type needs"), need: P("คู่สัญญา วัตถุประสงค์ กฎหมาย", "Parties, purpose, governing law") },
      { stage: "analyze", href: "/assemble?s=asm", name: P("ดูร่างสดและข้อขัดนโยบาย", "See the live draft and policy conflicts"), need: P("ยืนยันกฎหมายไทยหรือสละ", "Keep Thai law or record a waiver") },
      { stage: "execute", href: "/assemble?s=draft", name: P("ปรับข้อแล้วออกชุด", "Adjust clauses, then issue the pack"), need: P("GC / DPO ตามเพลย์บุ๊ก", "GC / DPO per playbook") },
      { stage: "review", href: "/outputs?s=studio&pack=assemble-pack", name: P("ตรวจชุดเอกสาร", "Review the pack"), need: P("ช่องว่างและหลักฐาน", "Gaps and evidence") },
      { stage: "complete", href: "/assemble?s=areview", name: P("ส่งกลับตรวจ", "Send back to Review"), need: P("ทนายเป็นผู้ยืนยัน", "Counsel confirms") },
    ],
    requires: [
      { ok: true, label: P("คลังประเภทไทย", "Thai type library") },
      { ok: false, label: P("ข้อเท็จจริงที่ทนายยืนยัน", "Counsel-confirmed facts") },
    ],
  },
  "diligence-deal": {
    id: "diligence-deal",
    module: "diligence",
    name: P("ตรวจสอบสถานะทางกฎหมายของดีล", "Run legal due diligence on a deal"),
    goal: P("รู้ว่าอะไรฆ่าหรือหน่วงดีล ก่อนรายงานคณะกรรมการ", "Know what can kill or hold the deal before the IC paper."),
    why: P("Deal X-Ray เปิดห้อง ชี้เอกสารที่ขาด ข้อขัด และประเด็นล้มดีล", "Deal X-Ray opens the room, missing papers, contradictions and kill items."),
    aiShare: 81,
    userTime: P("20 นาที", "20 min"),
    involvement: "high",
    roles: ["management", "specialist"],
    editions: ["firm", "corporate"],
    reportPack: "dd-ic",
    demo: "diligence",
    keywords: ["dd", "diligence", "deal", "m&a", "acquisition", "vdr", "ตรวจสอบสถานะ", "ซื้อกิจการ", "ห้องข้อมูล", "ดีล"],
    steps: [
      { stage: "assess", href: "/diligence?s=deal", name: P("ล็อกธุรกรรม", "Lock the transaction"), need: P("ลูกค้าและประเภทดีล", "Client and deal type") },
      { stage: "collect", href: "/diligence?s=droom", name: P("จัดดัชนีห้องข้อมูล", "Index the data room"), need: P("ไฟล์หรือรายการที่ขาด", "Files or the missing list") },
      { stage: "analyze", href: "/diligence?s=dbreak", name: P("ไล่ประเด็นล้มดีล", "Walk kill items"), need: P("ทนายยืนยันธง", "Counsel verifies flags") },
      { stage: "recommend", href: "/diligence?s=dic", name: P("อ่านสุขภาพดีล", "Read deal health"), need: P("เงื่อนไขปิดดีล", "Closing conditions") },
      { stage: "review", href: "/outputs?s=studio&pack=dd-ic", name: P("ตรวจรายงาน IC", "Review the IC report"), need: P("ห้ามฝังประเด็นฆ่าดีล", "Do not bury a kill item") },
      { stage: "complete", href: "/diligence?s=drep", name: P("ส่งออกเมื่อเกณฑ์ผ่าน", "Export when the gates pass"), need: P("ผู้อนุมัติลงชื่อ", "A named approver") },
    ],
    requires: [
      { ok: true, label: P("เพลย์บุ๊กฝั่งผู้ซื้อ", "Buy-side playbook") },
      { ok: false, label: P("ดัชนีห้องข้อมูล", "Data-room index") },
    ],
  },
  "decision-paper": {
    id: "decision-paper",
    module: "review",
    name: P("เตรียมบันทึกผู้บริหาร / คณะกรรมการ", "Prepare a management or IC paper"),
    goal: P("ได้บันทึกที่ทุกตัวเลขชี้หลักฐาน และยังไม่ผ่านจนกว่าจะอนุมัติ", "A paper where every number cites evidence — not final until approved."),
    why: P("เครื่องเขียนร่าง ชี้ช่องว่าง ห้ามถมตัวเลขที่ไม่มี ทนายอนุมัติ", "The engine drafts, flags gaps, never invents a number. Counsel approves."),
    aiShare: 72,
    userTime: P("10 นาที", "10 min"),
    involvement: "low",
    roles: ["management", "specialist"],
    editions: ["firm", "corporate"],
    reportPack: "decision-memo",
    keywords: ["memo", "board", "ic", "management", "report", "บันทึก", "ผู้บริหาร", "คณะกรรมการ", "รายงาน"],
    steps: [
      { stage: "assess", href: "/outputs?s=brief", name: P("ตั้งขอบเขตรายงาน", "Set the report brief"), need: P("ผู้รับ ช่วงเวลา ภาษา", "Audience, period, language") },
      { stage: "collect", href: "/outputs?s=studio", name: P("ผูกหลักฐานที่อนุมัติแล้ว", "Bind approved evidence"), need: P("ห้ามใช้ข้อมูลสาธิตในรายงานจริง", "Demo data cannot enter a real report") },
      { stage: "analyze", href: "/outputs?s=studio", name: P("ร่างคลิกเดียวหรือทีละตอน", "One-click draft or section studio"), need: P("ช่องว่างต้องโผล่ ไม่เงียบ", "Gaps surface. They are not silenced.") },
      { stage: "review", href: "/outputs?s=studio", name: P("ไล่เกณฑ์คุณภาพ", "Walk the quality gates"), need: P("ข้อเท็จจริง ตัวเลข การอ้างอิง", "Facts, numbers, citations") },
      { stage: "complete", href: "/outputs?s=studio", name: P("อนุมัติแล้วส่งออก", "Approve, then export"), need: P("ผู้อนุมัติที่มีชื่อ", "A named human approver") },
    ],
    requires: [
      { ok: false, label: P("แผนที่สัญญาหรือห้องดีล", "A mapped paper or deal room") },
    ],
  },
  "track-obligations": {
    id: "track-obligations",
    module: "review",
    name: P("ติดตามข้อผูกพันที่ลงนามแล้ว", "Track what we already signed"),
    goal: P("ไม่พลาดหน้าต่างบอกกล่าวและการต่ออายุ", "Do not miss a notice window or a renewal."),
    why: P("ทะเบียนและปฏิทินชี้สัญญาต้นทาง", "The register and calendar cite the source contract."),
    aiShare: 69,
    userTime: P("8 นาที", "8 min"),
    involvement: "low",
    roles: ["management", "contributor", "specialist"],
    editions: ["firm", "corporate"],
    keywords: ["obligation", "renewal", "deadline", "calendar", "ข้อผูกพัน", "ต่ออายุ", "กำหนด", "ปฏิทิน"],
    steps: [
      { stage: "assess", href: "/obligations?s=oreg", name: P("เปิดทะเบียน", "Open the register"), need: P("สัญญาที่ลงนามแล้ว", "A signed contract") },
      { stage: "collect", href: "/obligations?s=ocal", name: P("ดูปฏิทิน 120 วัน", "See the 120-day calendar"), need: P("วันที่จากฉบับ", "Dates from the paper") },
      { stage: "execute", href: "/obligations?s=oalert", name: P("ปิดการแจ้งที่ค้าง", "Clear open alerts"), need: P("คนรับผิดชอบ", "An owner") },
      { stage: "complete", href: "/obligations?s=oren", name: P("ไล่ต่ออายุ", "Walk renewals"), need: P("ตัดสินใจต่อหรือออก", "Renew or exit") },
    ],
    requires: [{ ok: true, label: P("ทะเบียนข้อผูกพัน", "Obligation register") }],
  },
  "dont-know": {
    id: "dont-know",
    module: "office",
    name: P("ยังไม่รู้จะเริ่มตรงไหน", "I don't know where to start"),
    goal: P("อธิบายงานหนึ่งประโยค ระบบชี้ภารกิจ", "Describe the job in one sentence. LAW24 names the mission."),
    why: P("ไม่ต้องรู้จักเมนู โมดูล หรือศัพท์สำนักงานก่อนใช้", "You do not need the menu, the modules or the house jargon first."),
    aiShare: 90,
    userTime: P("3 นาที", "3 min"),
    involvement: "low",
    roles: ["management", "specialist", "contributor"],
    editions: ["firm", "corporate"],
    keywords: ["help", "start", "lost", "where", "ไม่รู้", "เริ่ม", "ช่วย", "อะไร"],
    steps: [
      { stage: "assess", href: "/assist?s=ask", name: P("บอกว่าต้องทำอะไร", "Say what must be done"), need: P("บทบาทและคำสั่ง", "Role and assignment") },
      { stage: "recommend", href: "/missions?s=desk", name: P("เลือกภารกิจที่แนะนำ", "Pick the recommended mission"), need: P("ยืนยันเป้าหมาย", "Confirm the goal") },
    ],
    requires: [],
  },
};

export const GOAL_CARDS: MissionId[] = [
  "analyse-contract",
  "draft-contract",
  "diligence-deal",
  "decision-paper",
  "track-obligations",
  "dont-know",
];

export function missionsFor(edition: Edition, role: UxRole): MissionDef[] {
  return GOAL_CARDS
    .map((id) => MISSIONS[id])
    .filter((m) => m.editions.includes(edition) && m.roles.includes(role));
}
