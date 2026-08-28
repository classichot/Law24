import type { Edition, Lang, ModeKey } from "./model";
import type { AssignmentType } from "./firm";
import { PLAYBOOKS, copyTE, type PlaybookKey, type TE } from "./guides";

const P = (t: string, e: string): TE => ({ t, e });

export type AssistHit = {
  mode: Exclude<ModeKey, "home">;
  screen: string;
  href: string;
  score: number;
  label: TE;
  why: TE;
  playbook: PlaybookKey;
};

export type AssistModule = {
  mode: Exclude<ModeKey, "home">;
  score: number;
  href: string;
  why: TE;
  functions: AssistHit[];
};

export type AssistResult = {
  jobRead: TE;
  briefRead: TE;
  start: AssistHit;
  modules: AssistModule[];
  functions: AssistHit[];
  playbook: PlaybookKey;
  assignmentType: AssignmentType;
  path: AssistHit[];
};

type Fn = {
  mode: Exclude<ModeKey, "home">;
  screen: string;
  keys: string[];
  w: number;
  label: TE;
  why: TE;
  playbook: PlaybookKey;
  type?: AssignmentType;
};

const FNS: Fn[] = [
  { mode: "assemble", screen: "lib", w: 3, playbook: "assembly", type: "assemble", keys: ["draft", "template", "library", "taxonomy", "type", "สร้าง", "ร่างใหม่", "คลัง", "แม่แบบ", "ประเภท", "msa", "nda"], label: P("คลังสัญญา", "Contract library"), why: P("เลือกประเภทไทยก่อนสัมภาษณ์ — ไม่ร่างลอย", "Pick the Thai type first — no freehand draft") },
  { mode: "assemble", screen: "iv", w: 4, playbook: "assembly", type: "assemble", keys: ["interview", "intention", "positions", "สัมภาษณ์", "เจตนา", "ท่าที", "คำตอบ"], label: P("สัมภาษณ์นำทาง", "Guided interview"), why: P("ล็อกท่าทีเชิงพาณิชย์ให้เครื่องเลือกข้อได้", "Lock commercial positions so clauses can fire") },
  { mode: "assemble", screen: "asm", w: 3, playbook: "assembly", type: "assemble", keys: ["clause", "conflict", "thai law", "ประกอบ", "ข้อสัญญา", "กฎหมายไทย", "อนุญาโต"], label: P("ประกอบข้อสัญญา", "Clause assembly"), why: P("จุดตัดสินข้อขัดนโยบายบ้าน", "Where house-policy conflicts are decided") },
  { mode: "assemble", screen: "draft", w: 4, playbook: "assembly", type: "assemble", keys: ["sign", "approval", "dpo", "pack", "esign", "ลงนาม", "อนุมัติ", "ชุดเอกสาร", "adjust", "clause", "standard clause", "ปรับข้อ", "แก้ข้อ", "ข้อมาตรฐาน"], label: P("ร่าง อนุมัติ ลงนาม", "Draft, approval & signing"), why: P("ปรับข้อมาตรฐาน แล้ว GC / CIO / DPO ครบก่อนออกชุด", "Adjust standard clauses, then GC, CIO and DPO before the pack issues") },
  { mode: "assemble", screen: "bilingual", w: 2, playbook: "assembly", type: "assemble", keys: ["bilingual", "thai english", "translation", "คู่ภาษา", "แปล", "สองภาษา"], label: P("ร่างคู่ภาษา", "Bilingual mirror"), why: P("ชี้จุดที่คำแปลเปลี่ยนความหมายทางกฎหมาย", "Flags where translation changes legal meaning") },
  { mode: "review", screen: "xray", w: 6, playbook: "itcloud", type: "review", keys: ["x-ray", "xray", "upload", "analyse", "analyze", "heatmap", "verdict", "อัปโหลด", "วิเคราะห์", "แผนความร้อน", "คำตัดสิน"], label: P("Contract X-Ray", "Contract X-Ray"), why: P("อัปโหลดแล้วได้คำตัดสินในสามนาที — ไม่ใช่หน้าต่างแชต", "Upload, then a verdict in under three minutes — not a chat window") },
  { mode: "review", screen: "rsetup", w: 3, playbook: "itcloud", type: "review", keys: ["review", "vendor paper", "counterparty", "ตรวจสัญญา", "ฉบับคู่สัญญา", "คู่ค้าส่งมา"], label: P("ตั้งค่าการตรวจ", "Review setup"), why: P("ตั้งว่าฉบับใคร และเพลย์บุ๊กไหน", "Whose paper, which playbook") },
  { mode: "review", screen: "find", w: 5, playbook: "itcloud", type: "review", keys: ["finding", "issue", "liability", "cap", "uncapped", "pdpa", "saas", "cloud", "nimbus", "ข้อค้นพบ", "เพดาน", "ความรับผิด", "ข้อมูลส่วนบุคคล", "คลาวด์", "ตรวจสัญญา"], label: P("ข้อค้นพบ", "Findings"), why: P("บัตรประเด็นทีละข้อ ทนายเป็นผู้ตัดสิน", "Issue cards — the lawyer decides each one") },
  { mode: "review", screen: "pb", w: 4, playbook: "itcloud", type: "review", keys: ["playbook", "policy", "house position", "เพลย์บุ๊ก", "นโยบาย", "ท่าทีบ้าน"], label: P("เทียบ playbook", "Playbook comparison"), why: P("เทียบท่าทีบ้านกับสิ่งที่ได้จากฉบับ", "House position versus what the paper gives") },
  { mode: "review", screen: "red", w: 4, playbook: "itcloud", type: "review", keys: ["redline", "markup", "tracked", "redline", "แก้ร่าง", "markup"], label: P("redline คู่สัญญา", "Counterparty redline"), why: P("ตอบทีละจุดที่คู่สัญญาเปลี่ยนสิทธิ", "Respond to each mark that moves rights") },
  { mode: "review", screen: "board", w: 3, playbook: "decision", type: "review", keys: ["board", "reviewer", "sign-off", "คณะทบทวน", "คณะกรรมการกฎหมาย"], label: P("คณะทบทวน AI", "AI Legal Review Board"), why: P("เจ็ดมุมมอง ไม่ใช่แชตบอทตัวเดียว", "Seven reviewers, not one chatbot") },
  { mode: "holistic", screen: "cockpit", w: 5, playbook: "decision", type: "advisory", keys: ["cockpit", "command center", "stage", "value", "ห้องบังคับ", "มูลค่า", "ขั้นสัญญา"], label: P("Contract Cockpit", "Contract Cockpit"), why: P("เห็นทั้งฉบับเป็นห้องบังคับก่อนบันทึก", "See the whole instrument as a cockpit before the memo") },
  { mode: "holistic", screen: "dna", w: 4, playbook: "decision", type: "advisory", keys: ["dna", "clause dna", "house standard", "ข้อมาตรฐาน", "เทียบประวัติ"], label: P("Clause DNA", "Clause DNA"), why: P("เทียบข้อนี้กับเพลย์บุ๊กและฉบับที่ลงนามแล้ว", "This clause versus playbook and signed history") },
  { mode: "holistic", screen: "hinter", w: 3, playbook: "decision", type: "advisory", keys: ["interact", "conflict between", "whole", "holistic", "ปฏิสัมพันธ์", "ข้อขัดกัน", "ทั้งฉบับ"], label: P("ปฏิสัมพันธ์ระหว่างข้อ", "Clause interaction"), why: P("ข้อสัญญาไม่ได้ทำงานทีละข้อ", "Clauses do not operate alone") },
  { mode: "holistic", screen: "simulate", w: 4, playbook: "decision", type: "advisory", keys: ["what if", "simulate", "exposure", "delay", "จำลอง", "ถ้าเกิด", "ความเสี่ยงสูงสุด"], label: P("จำลองผลของสัญญา", "Consequence simulator"), why: P("ถามผลจริงก่อนออกบันทึก", "Ask real outcomes before the memo") },
  { mode: "holistic", screen: "memo", w: 5, playbook: "decision", type: "advisory", keys: ["memo", "board pack", "management", "recommend", "sign or not", "บันทึก", "ผู้บริหาร", "ลงนามได้หรือไม่", "คำแนะนำ"], label: P("บันทึกตัดสินใจ", "Decision memo"), why: P("ท่าทีชัด: ลงนาม เจรจาใหม่ หรือปฏิเสธ", "A clear posture: sign, renegotiate or reject") },
  { mode: "diligence", screen: "dmatter", w: 3, playbook: "dd", type: "diligence", keys: ["m&a", "buy-side", "acquisition", "target", "ic ", "deal", "ซื้อกิจการ", "ฝั่งผู้ซื้อ", "เป้าหมาย", "คณะกรรมการลงทุน"], label: P("ตั้งเรื่องดีล", "Matter"), why: P("ล็อกขอบเขต วัน IC และนิยามประเด็นล้มดีล", "Lock scope, IC date and what counts as a kill item") },
  { mode: "diligence", screen: "droom", w: 4, playbook: "dd", type: "diligence", keys: ["data room", "vdr", "documents", "index", "ห้องข้อมูล", "เอกสาร", "ดัชนี"], label: P("ห้องข้อมูล", "Data room"), why: P("จัดดัชนีหลักฐานก่อนขึ้นธง", "Index the evidence before you flag") },
  { mode: "diligence", screen: "dflags", w: 5, playbook: "dd", type: "diligence", keys: ["red flag", "kill", "change of control", "facility", "related party", "ธงแดง", "ล้มดีล", "อำนาจควบคุม", "สินเชื่อ", "บุคคลเกี่ยวโยง"], label: P("ธงแดง", "Findings & red flags"), why: P("ประเด็นที่อาจล้มดีล พร้อมสายหลักฐาน", "Deal-kill items with evidence chains") },
  { mode: "diligence", screen: "autopilot", w: 3, playbook: "dd", type: "diligence", keys: ["autopilot", "scan the room", "ออโต", "วิ่งทั้งห้อง"], label: P("DD Autopilot", "DD Autopilot"), why: P("วิ่งทั้งห้องแล้วส่งธงให้ทนายยืนยัน", "Runs the room, then counsel verifies") },
  { mode: "diligence", screen: "drep", w: 3, playbook: "dd", type: "diligence", keys: ["ic pack", "dd report", "investment committee", "รายงาน", "ชุดคณะกรรมการ"], label: P("รายงาน", "Reports"), why: P("สิ่งที่คณะกรรมการลงทุนอ่าน", "What the investment committee reads") },
  { mode: "negotiate", screen: "nstrat", w: 4, playbook: "mandate", type: "negotiate", keys: ["negotiate", "leverage", "walk away", "must have", "เจรจา", "ต่อรอง", "จุดยืน", "ข้อต้องได้"], label: P("กลยุทธ์และอำนาจต่อรอง", "Strategy & leverage"), why: P("ถือสี่ข้อต้องได้ตามอำนาจเจรจา", "Hold the four must-haves under the mandate") },
  { mode: "negotiate", screen: "nladder", w: 5, playbook: "mandate", type: "negotiate", keys: ["ladder", "fallback", "preferred", "walk-away", "บันได", "สำรอง", "เดินออก"], label: P("บันไดเจรจา", "Negotiation ladder"), why: P("จุดยืนที่ต้องการ → ประนีประนอม → ต่ำสุด → เดินออก", "Preferred → acceptable → minimum → walk-away") },
  { mode: "negotiate", screen: "npos", w: 3, playbook: "mandate", type: "negotiate", keys: ["position tracker", "open point", "ตารางจุดยืน", "ข้อที่ยังเปิด"], label: P("ตารางจุดยืน", "Position tracker"), why: P("สถานะปัจจุบันของทุกข้อที่ยังเปิด", "Live state of every open point") },
  { mode: "negotiate", screen: "nresp", w: 3, playbook: "mandate", type: "negotiate", keys: ["response", "reply", "counter", "คำตอบ", "ร่างตอบ"], label: P("คำตอบที่แนะนำ", "Recommended responses"), why: P("คำตอบพร้อมเหตุจากเพลย์บุ๊ก — ทนายเป็นผู้ส่ง", "Playbook-backed replies — counsel sends them") },
  { mode: "obligations", screen: "oreg", w: 3, playbook: "control", type: "obligations", keys: ["obligation", "register", "in force", "ข้อผูกพัน", "ทะเบียน", "หลังลงนาม"], label: P("ทะเบียนข้อผูกพัน", "Obligation register"), why: P("หลังลงนาม — ทุกข้อผูกกับสัญญาต้นทาง", "Post-signature rows that trace to source contracts") },
  { mode: "obligations", screen: "ocal", w: 4, playbook: "control", type: "obligations", keys: ["calendar", "deadline", "notice window", "ปฏิทิน", "กำหนด", "หน้าต่างบอกกล่าว"], label: P("ปฏิทินกำหนดเวลา", "Deadline calendar"), why: P("ควบคุมหน้าต่างบอกกล่าว 120 วัน", "Notice windows, 120 days out") },
  { mode: "obligations", screen: "oren", w: 4, playbook: "control", type: "obligations", keys: ["renew", "auto-renew", "uplift", "ต่ออายุ", "ต่ออัตโนมัติ"], label: P("การต่ออายุ", "Renewal pipeline"), why: P("ต่ออัตโนมัติที่ไม่มีเพดานต้องมีคำแนะนำ", "Uncapped auto-renewals need a recommendation") },
  { mode: "obligations", screen: "oalert", w: 5, playbook: "control", type: "obligations", keys: ["missed", "overdue", "escalate", "serve notice", "เลยกำหนด", "พ้น", "ส่งต่อ", "บอกกล่าว", "ไม่ทัน"], label: P("การแจ้งเตือนและการส่งต่อ", "Alerts & escalation"), why: P("พ้นกำหนดส่งต่อพาร์ทเนอร์ในวันเดียวกัน", "Missed windows escalate to partner the same day") },
  { mode: "intel", screen: "twin", w: 6, playbook: "memory", type: "advisory", keys: ["twin", "living legal", "ฝาแฝด", "ask the company", "uncapped how many", "ถามทั้งพอร์ต"], label: P("Living Legal Twin", "Living Legal Twin"), why: P("ถามตำแหน่งกฎหมายขององค์กรนี้ — ต้องมีต้นทาง", "Ask this company's legal position — it must trace to source") },
  { mode: "intel", screen: "ipf", w: 3, playbook: "memory", type: "advisory", keys: ["portfolio", "how many", "estate", "uncapped liability", "พอร์ต", "ทั้งองค์กร", "ไม่จำกัดกี่ฉบับ"], label: P("ภาพรวมพอร์ต", "Contract portfolio"), why: P("ความเสี่ยงสะสมทั้งองค์กร", "Concentrated risk across the estate") },
  { mode: "intel", screen: "ikg", w: 2, playbook: "memory", type: "advisory", keys: ["graph", "which contracts", "กราฟ", "โยง"], label: P("กราฟความรู้", "Legal knowledge graph"), why: P("เดินสายจากคู่สัญญาหรือข้อไม่จำกัด", "Walk a chain from a party or an uncapped node") },
  { mode: "intel", screen: "memory", w: 2, playbook: "memory", type: "advisory", keys: ["memory", "exception", "what did we accept", "ความจำ", "ข้อยกเว้น", "เคยยอม"], label: P("ความจำทางกฎหมาย", "Legal memory"), why: P("ข้อยกเว้นและผลเจรจาที่เคยยอมในเทนแนนท์นี้", "Exceptions and outcomes already accepted in this tenant") },
  { mode: "command", screen: "desk", w: 5, playbook: "command", type: "advisory", keys: ["command", "control", "legal request", "gc desk", "ศูนย์บัญชาการ", "คำขอกฎหมาย", "ควบคุม"], label: P("ศูนย์บัญชาการกฎหมาย", "Legal command center"), why: P("คำขอ อนุมัติ ที่ปรึกษาภายนอก และรายงานกรรมการ", "Requests, approvals, outside counsel and board reports") },
  { mode: "command", screen: "approvals", w: 4, playbook: "command", type: "advisory", keys: ["approval", "dpo gate", "อนุมัติ", "ด่าน"], label: P("การอนุมัติ", "Approvals"), why: P("ด่าน DPO ของนิมบัสยังค้าง", "The Nimbus DPO gate is still pending") },
  { mode: "practice", screen: "brain", w: 5, playbook: "practice", type: "advisory", keys: ["brain", "precedent", "firm knowledge", "สมอง", "บรรทัดฐาน", "คลังความรู้"], label: P("สมองสำนักงาน", "Firm Brain"), why: P("จูเนียร์ใช้ความรู้หุ้นส่วนโดยไม่เปิดข้ามลูกค้า", "Juniors use partner knowledge without crossing clients") },
  { mode: "practice", screen: "room", w: 5, playbook: "practice", type: "advisory", keys: ["client room", "white label", "portal", "ห้องตรวจ", "ลูกค้าอนุมัติ", "แบรนด์สำนักงาน"], label: P("ห้องตรวจลูกค้า", "Client Review Room"), why: P("ลูกค้าอนุมัติคำแนะนำภายใต้แบรนด์สำนักงาน", "The client approves recommendations under the firm brand") },
  { mode: "practice", screen: "packages", w: 4, playbook: "practice", type: "advisory", keys: ["package", "productiz", "fixed fee", "บริการสำเร็จรูป", "ค่าธรรมเนียมคงที่"], label: P("บริการสำเร็จรูป", "Packaged services"), why: P("ขายงานเป็นสินค้า — แล้วออกใบเสนอ", "Sell the work as a product — then issue the quote") },
  { mode: "practice", screen: "quote", w: 4, playbook: "practice", type: "advisory", keys: ["quote", "engagement", "letter", "ใบเสนอ", "หนังสือว่าจ้าง"], label: P("ใบเสนอและหนังสือว่าจ้าง", "Quote & engagement"), why: P("สร้างหนังสือว่าจ้าง — ทนายเป็นผู้ลงนามในท่าที", "Generate the engagement letter — counsel signs the posture") },
  { mode: "practice", screen: "assign", w: 3, playbook: "practice", type: "advisory", keys: ["assignment", "matter open", "instruction", "เปิดงาน", "รับงาน", "คำสั่ง"], label: P("งาน", "Assignments"), why: P("เปิดงานใต้ลูกค้า มีหัวหน้าและกำหนด", "Open the assignment under a client, with lead and due date") },
  { mode: "practice", screen: "trace", w: 3, playbook: "practice", type: "advisory", keys: ["trail", "trace", "audit", "from start", "เส้นทาง", "ไล่งาน", "ต้นถึงจบ"], label: P("เส้นทางงาน", "Movement trail"), why: P("ฝ่ายบริหารไล่จากคำสั่งแรกถึงจุดควบคุมปัจจุบัน", "Management reads intake through the current control") },
  { mode: "help", screen: "use", w: 5, playbook: "help", type: "advisory", keys: ["how to", "help", "ใช้ระบบ", "คู่มือ", "วิธีใช้", "platform", "onboard"], label: P("วิธีใช้ LAW24", "How to use LAW24"), why: P("อ่านหลักของระบบก่อนลงมือในเครื่องยนต์", "Read the OS rules before work in the engine") },
  { mode: "help", screen: "leio", w: 6, playbook: "help", type: "advisory", keys: ["leio", "เลโอ", "bot", "assistant", "ผู้ช่วย ai"], label: P("เลโอ", "Leio"), why: P("ถามวิธีใช้ วิจัย และกฎ — ทุกข้อมีหลักฐาน", "Ask how to use, research and regulation — every answer cites evidence") },
  { mode: "help", screen: "watch", w: 5, playbook: "help", type: "advisory", keys: ["research", "regulation", "วิจัย", "กฎ", "gazette", "ประกาศ", "pdpc", "สคส", "update"], label: P("วิจัยและกฎ", "Research & regulations"), why: P("งานวิจัยสั้นและกฎที่เลโอติดตามในเทนแนนท์นี้", "Short research and the regulations Leio is watching in this tenant") },
  { mode: "help", screen: "books", w: 5, playbook: "help", type: "advisory", keys: ["playbook", "เพลย์บุ๊ก", "house position", "นโยบายบ้าน", "house book"], label: P("คลังเพลย์บุ๊ก", "Playbook library"), why: P("เปิดเล่มที่ใช้บังคับกับงานนี้", "Open the volume in force on this work") },
];

const JOBS: { keys: string[]; read: TE; boost: Partial<Record<Exclude<ModeKey, "home">, number>> }[] = [
  { keys: ["gc", "general counsel", "in-house", "ที่ปรึกษากฎหมายประจำ", "องค์กร", "in house"], read: P("ที่ปรึกษากฎหมายประจำองค์กร — คุมความเสี่ยงพอร์ตและฉบับคู่สัญญา", "In-house counsel — portfolio risk and counterparty paper"), boost: { command: 5, review: 6, obligations: 5, intel: 4, assemble: 2, holistic: 2 } },
  { keys: ["partner", "หุ้นส่วน", "law firm", "advisory", "ที่ปรึกษาภายนอก", "solicitor"], read: P("หุ้นส่วน / ที่ปรึกษาภายนอก — เปิดงานแล้วทำในเครื่องยนต์", "Partner / external counsel — open the assignment then work in the engine"), boost: { practice: 7, review: 4, holistic: 3, diligence: 3 } },
  { keys: ["associate", "ผู้ช่วย", "junior"], read: P("ผู้ช่วยทนาย — ทำตามเพลย์บุ๊กและส่งต่อพาร์ทเนอร์เมื่อถึงเกณฑ์", "Associate — work the playbook and escalate at the threshold"), boost: { assemble: 3, review: 4, diligence: 4, practice: 3 } },
  { keys: ["procurement", "purchasing", "จัดซื้อ", "sourcing", "vendor"], read: P("จัดซื้อ — ร่างและตรวจฉบับผู้ขายก่อนลงนาม", "Procurement — assemble and review vendor paper before signature"), boost: { assemble: 6, review: 5, obligations: 3 } },
  { keys: ["dpo", "privacy", "pdpa", "data protection", "คุ้มครองข้อมูล"], read: P("DPO — ชั้นข้อมูลและ PDPA ต้องปิดก่อน go-live", "DPO — data layer and PDPA must close before go-live"), boost: { review: 7, assemble: 3, holistic: 2 } },
  { keys: ["m&a", "buy-side", "deal counsel", "ฝั่งผู้ซื้อ", "เอ็มแอนด์เอ", "ic "], read: P("ทนายดีลฝั่งผู้ซื้อ — ห้องข้อมูลและประเด็นล้มดีลก่อน IC", "Buy-side deal counsel — data room and kill items before IC"), boost: { diligence: 8, negotiate: 2, practice: 2 } },
  { keys: ["negotiat", "เจรจา", "commercial"], read: P("ผู้เจรจา — ถืออำนาจเจรจาและตารางจุดยืน", "Negotiator — hold the mandate and the position tracker"), boost: { negotiate: 8, review: 3, holistic: 2 } },
  { keys: ["legal ops", "ops", "calendar", "renewal", "ปฏิบัติการกฎหมาย", "ต่ออายุ"], read: P("Legal ops — ปฏิทิน ข้อผูกพัน และการต่ออายุ", "Legal ops — calendar, obligations and renewals"), boost: { obligations: 8, intel: 3 } },
  { keys: ["cfo", "board", "ผู้บริหาร", "กรรมการ"], read: P("ผู้บริหาร — ต้องการบันทึกท่าทีไม่ใช่ฉบับเต็ม", "Executive — needs a decision memo, not the full paper"), boost: { holistic: 7, intel: 4, review: 2 } },
];

export const ASSIST_EXAMPLES: { job: TE; brief: TE }[] = [
  { job: P("GC องค์กร", "In-house GC"), brief: P("ผู้ขายส่ง MSA คลาวด์มา ต้องการรู้ว่าเซ็นได้หรือต้องเจรจา", "Vendor sent a cloud MSA. Can we sign, or must we renegotiate?") },
  { job: P("ทนายฝั่งผู้ซื้อ", "Buy-side counsel"), brief: P("เป้าหมายโลจิสติกส์ ห้องข้อมูลเปิดแล้ว IC ในสามสัปดาห์", "Logistics target. Data room is open. IC in three weeks.") },
  { job: P("Legal ops", "Legal ops"), brief: P("หน้าต่างบอกเลิกอาคารพ้น 1 ส.ค. ยังไม่ได้ส่งหนังสือ", "Facilities notice window closed 1 Aug. Notice was not served.") },
  { job: P("จัดซื้อ", "Procurement"), brief: P("ต้องการร่างสัญญาบริการ SaaS จากเจตนาทางธุรกิจ", "Need to assemble a SaaS services contract from a business brief.") },
  { job: P("หุ้นส่วน", "Partner"), brief: P("ลูกค้าขอให้ไล่งานนิมบัสจากรับเรื่องถึงรอบเจรจาปัจจุบัน", "Client wants the Nimbus matter traced from intake to the current round.") },
];

function hay(job: string, brief: string) {
  return `${job} ${brief}`.toLowerCase();
}

function scoreKeys(text: string, keys: string[]) {
  let n = 0;
  for (const k of keys) {
    if (!k || !text.includes(k.toLowerCase())) continue;
    n += 2 + Math.min(3, Math.floor(k.length / 8));
  }
  return n;
}

function readJob(job: string): TE {
  const t = job.toLowerCase();
  const hit = JOBS.find((j) => j.keys.some((k) => t.includes(k)));
  if (hit) return hit.read;
  if (job.trim()) return P(`บทบาทที่ระบุ: ${job.trim()}`, `Role as given: ${job.trim()}`);
  return P("ยังไม่ระบุบทบาท — ใช้เส้นทางจากตัวงานเป็นหลัก", "No role given — routing from the assignment itself");
}

function readBrief(brief: string): TE {
  const t = brief.toLowerCase();
  if (!brief.trim()) return P("ยังไม่มีคำอธิบายงาน — เติมสิ่งที่ต้องทำให้แนะนำโมดูลได้", "No assignment yet — say what must be done to route a module");
  if (/(saas|cloud|คลาวด์|nimbus|msa)/.test(t) && /(review|ตรวจ|sign|เซ็น|vendor|ผู้ขาย)/.test(t)) {
    return P("งานตรวจฉบับคลาวด์/SaaS ของคู่สัญญา ก่อนตัดสินใจลงนาม", "A counterparty cloud/SaaS review before a sign-or-not decision");
  }
  if (/(data room|ห้องข้อมูล|m&a|buy-side|ซื้อกิจการ|diligence|ล้มดีล)/.test(t)) {
    return P("งานตรวจสอบสถานะฝั่งผู้ซื้อจากห้องข้อมูล", "Buy-side diligence out of a data room");
  }
  if (/(notice|บอกกล่าว|เลยกำหนด|missed|ต่ออายุ|renew)/.test(t)) {
    return P("งานกำกับหลังลงนาม — หน้าต่างเวลาหรือการต่ออายุ", "Post-signature control — a notice window or a renewal");
  }
  if (/(draft|ร่าง|assemble|สร้างสัญญา|template)/.test(t)) {
    return P("งานประกอบร่างจากเจตนาทางธุรกิจ", "Assembly of a draft from a business intention");
  }
  if (/(negotiat|เจรจา|redline|markup)/.test(t)) {
    return P("งานเจรจาหรือตอบ redline", "A negotiation or redline-response assignment");
  }
  if (/(memo|บันทึก|board|ผู้บริหาร)/.test(t)) {
    return P("งานออกบันทึกท่าทีถึงผู้บริหาร", "A decision memo for management");
  }
  return P("งานตามที่อธิบาย — จับคู่โมดูลจากคำหลักในคำสั่ง", "Assignment as described — modules matched from the instruction");
}

const TYPE_BY_MODE: Partial<Record<Exclude<ModeKey, "home">, AssignmentType>> = {
  assemble: "assemble",
  review: "review",
  diligence: "diligence",
  negotiate: "negotiate",
  obligations: "obligations",
  holistic: "advisory",
  intel: "advisory",
  practice: "advisory",
  command: "advisory",
  assist: "advisory",
  help: "advisory",
};

export function routeAssist(job: string, brief: string, edition: Edition): AssistResult | null {
  const text = hay(job, brief);
  if (!text.trim()) return null;

  const jobBoost: Partial<Record<string, number>> = {};
  JOBS.forEach((j) => {
    if (!j.keys.some((k) => text.includes(k))) return;
    Object.entries(j.boost).forEach(([mode, n]) => {
      jobBoost[mode] = (jobBoost[mode] || 0) + n;
    });
  });

  const scored: AssistHit[] = FNS.map((fn) => {
    if (fn.mode === "practice" && edition !== "firm") return null;
    if (fn.mode === "command" && edition === "firm") return null;
    const s = scoreKeys(text, fn.keys) * fn.w + (jobBoost[fn.mode] || 0);
    if (s <= 0) return null;
    return {
      mode: fn.mode,
      screen: fn.screen,
      href: `/${fn.mode}?s=${fn.screen}`,
      score: s,
      label: fn.label,
      why: fn.why,
      playbook: fn.playbook,
    };
  }).filter((x): x is AssistHit => !!x);

  scored.sort((a, b) => b.score - a.score);

  const functions = scored.slice(0, 6);
  const fallback: AssistHit = {
    mode: "assemble",
    screen: "lib",
    href: "/assemble?s=lib",
    score: 1,
    label: P("คลังสัญญา", "Contract library"),
    why: P("จุดเริ่มต้นเมื่อคำสั่งยังกว้าง — เลือกประเภทแล้วให้เครื่องเดิน", "Start here when the instruction is still wide — pick a type, then let the engine walk"),
    playbook: "assembly",
  };
  const start = functions[0] || fallback;
  const used = functions.length ? functions : [fallback];

  const byMode = new Map<string, AssistHit[]>();
  used.forEach((h) => {
    const list = byMode.get(h.mode) || [];
    list.push(h);
    byMode.set(h.mode, list);
  });

  const modules: AssistModule[] = [...byMode.entries()]
    .map(([mode, fns]) => ({
      mode: mode as AssistModule["mode"],
      score: fns.reduce((n, x) => n + x.score, 0),
      href: fns[0].href,
      why: fns[0].why,
      functions: fns,
    }))
    .sort((a, b) => b.score - a.score);

  const path = used.slice(0, 4);
  const assignmentType = TYPE_BY_MODE[start.mode] || "advisory";

  return {
    jobRead: readJob(job),
    briefRead: readBrief(brief),
    start,
    modules,
    functions: used,
    playbook: start.playbook,
    assignmentType,
    path,
  };
}

export function assistTitle(brief: string, lang: Lang) {
  const line = brief.trim().split(/\n/)[0] || (lang === "th" ? "งานใหม่จากผู้ช่วย" : "New assignment from Assist");
  return line.slice(0, 140);
}

export function playbookName(key: PlaybookKey, lang: Lang) {
  return `${copyTE(lang, PLAYBOOKS[key].name)} · ${PLAYBOOKS[key].ver}`;
}
