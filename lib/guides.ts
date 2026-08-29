import type { Lang, ModeKey } from "./model";
import { NAV, isMode } from "./nav";

export type TE = { t: string; e: string };
const P = (t: string, e: string): TE => ({ t, e });

export type PlaybookDef = {
  id: string;
  name: TE;
  ver: string;
  href: string;
  applies: TE;
  rules: TE[];
};

export const PLAYBOOKS = {
  practice: {
    id: "PB-PRAC",
    name: P("วิธีปฏิบัติสำนักงาน", "Practice SOP"),
    ver: "v1.0",
    href: "/practice?s=trace",
    applies: P("งานที่ปรึกษาทุกเรื่อง — รับลูกค้า เปิดงาน และเก็เส้นทางจนปิด", "Every advisory matter — client, assignment, trail to close"),
    rules: [
      P("ห้ามเปิดงานก่อนตรวจผลประโยชน์ทับซ้อนผ่าน", "No assignment opens until conflict check clears"),
      P("ทุกงานต้องมีลูกค้า หัวหน้างาน กำหนด และเส้นทางรับเรื่อง", "Every assignment has a client, lead, due date and intake trail"),
      P("การกระทำในเครื่องยนต์ต้องบันทึกลงเส้นทางงาน", "Engine actions must land on the movement trail"),
      P("พาร์ทเนอร์เป็นผู้ลงนามในท่าที — เครื่องยนต์ไม่ลงนามแทน", "Partner owns the posture — the engine never signs"),
    ],
  },
  assembly: {
    id: "PB-ASM",
    name: P("เพลย์บุ๊กประกอบสัญญา", "Contract assembly playbook"),
    ver: "Taxonomy 500 · 2026.8",
    href: "/assemble?s=type",
    applies: P("การสร้างร่างจากเจตนาทางธุรกิจและคลัง 500 ประเภท", "Drafting from business intention against the 500-type library"),
    rules: [
      P("เลือกประเภทจากคลังไทยก่อนสัมภาษณ์ — ห้ามร่างลอย", "Pick a Thai taxonomy type before the interview — no freehand draft"),
      P("ท่าทีเชิงพาณิชย์ล็อกเมื่อยืนยันแบบสัมภาษณ์", "Commercial positions lock when the interview is confirmed"),
      P("ข้อมาตรฐานปรับได้ด้วยมือหรือข้อเสนอ AI — เลโอไม่ใช้ข้อเอง และต้องมีเหตุในบันทึก", "A standard clause may be adjusted by hand or by AI proposal — Leio does not apply itself, and the reason stays on the record"),
      P("กฎหมายไทยเป็นท่าทีบ้าน — อนุญาโตตุลาการต่างประเทศต้องมีเหตุ", "Thai law is the house position — foreign arbitration needs a reason"),
      P("ชุดเอกสารออกได้เมื่อ GC / CIO / DPO อนุมัติครบ", "Pack issues only after GC, CIO and DPO have signed off"),
    ],
  },
  itcloud: {
    id: "PB-IT",
    name: P("IT & Cloud", "IT & Cloud"),
    ver: "v4.2",
    href: "/review?s=pb",
    applies: P("สัญญาคลาวด์ / SaaS / ข้อมูล — รวมฉบับนิมบัส", "Cloud, SaaS and data paper — including Nimbus"),
    rules: [
      P("เพดานความรับผิด 2 เท่าของค่าบริการ รวมข้อเรียกร้องด้านข้อมูล", "Liability cap 2× fees, including personal-data claims"),
      P("โอนข้ามแดนต้องมีมาตรการ PDPA ม.28, DPA และรายชื่อผู้ประมวลผลช่วง", "Cross-border transfer needs PDPA s.28, a DPA and a sub-processor list"),
      P("สิทธิเลิกต้องสมมาตร — ห้ามผู้ให้บริการเลิกตามสะดวกฝ่ายเดียว", "Termination must be symmetric — no one-sided provider convenience"),
      P("ภาคผนวกที่อ้างถึงต้องแนบก่อนลงนาม", "Incorporated annexes must be attached before signature"),
    ],
  },
  decision: {
    id: "PB-DEC",
    name: P("เพลย์บุ๊กตัดสินใจ", "Decision playbook"),
    ver: "v2.1",
    href: "/holistic?s=memo",
    applies: P("การมองทั้งฉบับก่อนบันทึกถึงผู้บริหาร", "Whole-instrument view before the management memo"),
    rules: [
      P("ห้ามลงนามถ้าข้อสัญญายังขัดกันหรือภาคผนวกขาด", "No signature while clauses conflict or annexes are missing"),
      P("จำลองผลอย่างน้อยหนึ่งสถานการณ์ก่อนออกบันทึก", "Run at least one consequence simulation before the memo"),
      P("บันทึกต้องระบุท่าที: ลงนาม / เจรจาใหม่ / ปฏิเสธ พร้อมหลักฐาน", "Memo must state sign / renegotiate / reject, with evidence"),
      P("ทนายเป็นผู้ตัดสิน — คณะทบทวน AI เป็นคำแนะนำ", "The lawyer decides — the AI board only recommends"),
    ],
  },
  dd: {
    id: "PB-DD",
    name: P("ตรวจสอบสถานะฝั่งผู้ซื้อ", "Buy-side diligence playbook"),
    ver: "v3.1",
    href: "/diligence?s=dflags",
    applies: P("ดีลซื้อกิจการ / ห้องข้อมูล / ประเด็นล้มดีล", "Buy-side deals, data rooms and kill items"),
    rules: [
      P("ประเด็นล้มดีลต้องถึงพาร์ทเนอร์ก่อนชุดคณะกรรมการลงทุน", "Kill items reach partner before the IC pack"),
      P("เปลี่ยนอำนาจควบคุมที่ทำให้สินเชื่อผิดนัดคือธงแดง", "Change-of-control that defaults a facility is a red flag"),
      P("ความหนาแน่นบุคคลเกี่ยวโยงต้องอธิบายด้วยหลักฐาน", "Related-party concentration must be explained with evidence"),
      P("ห้ามปิดรายงานถ้าความครบถ้วนของห้องข้อมูลต่ำกว่าเกณฑ์", "No report close while data-room coverage is below the floor"),
    ],
  },
  mandate: {
    id: "PB-NEG",
    name: P("อำนาจเจรจา", "Negotiation mandate"),
    ver: "v2.0",
    href: "/negotiate?s=nstrat",
    applies: P("รอบเจรจาหลังคณะทบทวน — จุดยืนที่ต้องได้และที่แลกได้", "Post-board rounds — must-haves and tradable points"),
    rules: [
      P("สี่ข้อต้องได้: เพดานข้อมูล, DPA/SCC, สิทธิเลิกสมมาตร, ภาคผนวก", "Four must-haves: data cap, DPA/SCCs, symmetric exit, annexes"),
      P("ห้ามยอมเพดานข้อมูลเพื่อแลกส่วนลด", "Do not trade the data cap for a price cut"),
      P("สิทธิลูกค้าอ้างอิงแลกได้กับเพดานราคา", "Reference-customer rights may trade for a price cap"),
      P("ยึดรอบได้ — ห้ามปิดรอบถ้าข้อต้องได้ยังเปิด", "A hold is allowed — no round close while a must-have is open"),
    ],
  },
  control: {
    id: "PB-CTL",
    name: P("เพลย์บุ๊กกำกับหลังลงนาม", "Post-signature control playbook"),
    ver: "v1.4",
    href: "/obligations?s=oalert",
    applies: P("ทะเบียนข้อผูกพัน ปฏิทิน และการต่ออายุ", "Obligation register, calendar and renewals"),
    rules: [
      P("ตั้งเตือนหน้าต่างบอกกล่าวอย่างน้อย 120 วัน", "Notice windows alert at least 120 days out"),
      P("พ้นกำหนดต้องส่งต่อพาร์ทเนอร์ในวันเดียวกัน", "Missed windows escalate to partner the same day"),
      P("ต่ออายุอัตโนมัติที่ไม่มีเพดานราคาต้องมีคำแนะนำต่ออายุ", "Uncapped auto-renewals need a renewal recommendation"),
      P("ทุกข้อผูกพันผูกกับสัญญาต้นทางในคลัง", "Every obligation traces to a source contract in the library"),
    ],
  },
  memory: {
    id: "PB-MEM",
    name: P("ระเบียบความจำทางกฎหมาย", "Legal memory protocol"),
    ver: "v1.2",
    href: "/intel?s=memory",
    applies: P("พอร์ต กราฟความรู้ และความจำในองค์กร", "Portfolio, knowledge graph and tenant memory"),
    rules: [
      P("ข้อสรุปทุกข้อต้องมีหลักฐาน — ข้อสัญญา playbook หรือฐานกฎหมาย", "Every conclusion cites a clause, playbook or authority"),
      P("ข้อมูลลูกค้าไม่ใช้ฝึกโมเดลโดยค่าเริ่มต้น", "Customer data is not used to train the foundation model by default"),
      P("redline ที่ยอมและข้อยกเว้นอยู่เฉพาะในเทนแนนท์นี้", "Accepted redlines and exceptions stay inside this tenant"),
      P("ห้ามเสนอลงนามจากกราฟโดยไม่มีทนายยืนยัน", "The graph never recommends signature without lawyer confirmation"),
    ],
  },
  router: {
    id: "PB-AST",
    name: P("ผู้ช่วยจัดเส้นทาง", "Assist router"),
    ver: "v1.0",
    href: "/assist?s=ask",
    applies: P("เมื่อผู้ใช้ยังไม่รู้ว่าควรเปิดโมดูลใด — อธิบายงานแล้วให้ระบบชี้ฟังก์ชัน", "When the user does not yet know which module to open — describe the work, then the OS names the function"),
    rules: [
      P("ผู้ช่วยชี้โมดูลและฟังก์ชัน ไม่ลงนามและไม่เลือกท่าทีแทนทนาย", "Assist names modules and functions — it does not sign or pick a posture"),
      P("เพลย์บุ๊กของโมดูลที่ถูกชี้เป็นเพลย์บุ๊กที่ใช้บังคับ", "The playbook of the named module is the playbook in force"),
      P("งานที่ปรึกษาเปิดเป็น assignment ได้เมื่อมีลูกค้าในทะเบียน", "Advisory work may open as an assignment only with a client on the register"),
      P("ถ้าคำสั่งกำกวม ให้เริ่มที่คลังประเภท ห้ามร่างลอย", "If the instruction is vague, start in the type library — no freehand draft"),
    ],
  },
  help: {
    id: "PB-HLP",
    name: P("คู่มือและเพลย์บุ๊ก", "Help & playbooks"),
    ver: "v1.0",
    href: "/help?s=use",
    applies: P("เมื่อต้องอ่านเพลย์บุ๊กบ้านหรือวิธีใช้ LAW24 ก่อนลงมือในเครื่องยนต์", "When the house book or how to use LAW24 must be read before work in the engine"),
    rules: [
      P("เพลย์บุ๊กอยู่ในโมดูลคู่มือ — อย่าไล่หาหนังสือตามโมดูลงาน", "House playbooks live in Help — do not hunt the book across work modules"),
      P("เพลย์บุ๊กของโมดูลที่กำลังทำคือกฎที่ใช้บังคับ", "The playbook of the module in hand is the rule in force"),
      P("คู่มืออธิบายระบบ ไม่ลงนามและไม่เลือกท่าทีแทนทนาย", "Help explains the OS — it does not sign or pick a posture"),
      P("เลโอช่วยวิธีใช้ วิจัย และกฎที่เพิ่งออก — ทุกข้อสรุปต้องมีหลักฐาน และประกาศใหม่ไม่ย้ายเพลย์บุ๊กจนกว่าทนายจะยืนยัน", "Leio helps with how to use, research and regulation updates — every conclusion cites evidence, and a new gazette does not move the playbook until counsel confirms"),
      P("ลิงก์สาธิตออกที่โต๊ะโฮสต์หลังปลดล็อกคีย์โฮสต์ — คีย์นั้นไม่อยู่หน้าเข้าสู่ระบบสาธารณะ", "Demo links mint at Host desk after the host key — the key is not on public login"),
      P("ถ้ายังไม่รู้ว่าจะเปิดโมดูลใด ให้เริ่มที่ผู้ช่วย", "If it is not yet obvious which module to open, start in Assist"),
    ],
  },
  command: {
    id: "PB-CMD",
    name: P("ศูนย์บัญชาการกฎหมายองค์กร", "Corporate legal command"),
    ver: "v1.0",
    href: "/command?s=desk",
    applies: P("คำขอกฎหมาย การอนุมัติ ที่ปรึกษาภายนอก และรายงานคณะกรรมการของบริษัทนี้", "Legal requests, approvals, outside counsel and board reports for this company"),
    rules: [
      P("คำขอทุกใบต้องมีเจ้าของและกำหนด — เครื่องยนต์ไม่ลงนามแทน", "Every request has an owner and a due date — the engine never signs"),
      P("ที่ปรึกษาภายนอกทำงานหลังกำแพงเรื่อง", "Outside counsel works behind the matter wall"),
      P("รายงานคณะกรรมการชี้หลักฐาน ไม่ใช่ความเห็นลอย", "Board reports cite evidence, not free-floating opinion"),
      P("นโยบายบริษัทและกฎอนุมัติเป็นเพลย์บุ๊กที่ใช้บังคับ", "Company policy and approval rules are the playbook in force"),
    ],
  },
} as const satisfies Record<string, PlaybookDef>;

export type PlaybookKey = keyof typeof PLAYBOOKS;

export const MODULE_GUIDES: Record<Exclude<ModeKey, "home">, {
  playbook: PlaybookKey;
  purpose: TE;
  osFlow: TE;
}> = {
  assist: {
    playbook: "router",
    purpose: P("อธิบายบทบาทและคำสั่ง แล้วให้ LAW24 ชี้โมดูลกับฟังก์ชันที่ควรรัน", "Describe the role and the assignment, then LAW24 names the module and function to run"),
    osFlow: P("อธิบายงาน → ได้โมดูลและฟังก์ชัน → เปิดในเครื่องยนต์ → (ที่ปรึกษา) เปิดเป็นงานในสำนักงาน", "Describe the work → named module and function → open in the engine → (advisory) open as a Practice assignment"),
  },
  help: {
    playbook: "help",
    purpose: P("คลังเพลย์บุ๊กบ้าน และวิธีใช้ LAW24 ก่อนลงมือในเครื่องยนต์", "The house playbook library and how to use LAW24 before work in the engine"),
    osFlow: P("อ่านวิธีใช้ → เลือกเพลย์บุ๊ก → เปิดในเครื่องยนต์ตามโมดูลที่เพลย์บุ๊กบังคับ", "Read how to use → pick the playbook → open the engine module that book governs"),
  },
  practice: {
    playbook: "practice",
    purpose: P("โต๊ะสำนักงาน — ลูกค้า งาน และเส้นทางให้ฝ่ายบริหารไล่ได้จากต้นถึงจบ", "The advisory desk — clients, assignments and a trail management can read start to end"),
    osFlow: P("รับลูกค้า → เปิดงาน → ทำในเครื่องยนต์ (Assemble/Review/DD) → เส้นทางงานกลับมาที่สำนักงาน", "Client → assignment → work in the engine (Assemble/Review/DD) → trail returns to Practice"),
  },
  assemble: {
    playbook: "assembly",
    purpose: P("จากเจตนาทางธุรกิจเป็นร่างที่ผูกคลัง ประเภท และ playbook บ้าน", "From business intention to a draft bound to the library, type and house playbook"),
    osFlow: P("คลัง → ประเภท → สัมภาษณ์ → ประกอบข้อ → ร่าง/อนุมัติ → คู่ภาษา แล้วส่งต่อ Review", "Library → type → interview → assembly → draft/approval → bilingual, then hand to Review"),
  },
  review: {
    playbook: "itcloud",
    purpose: P("ตรวจฉบับคู่สัญญาทีละข้อเทียบ playbook — ทนายเป็นผู้ตัดสินทุกประเด็น", "Clause-by-clause review of counterparty paper against the playbook — the lawyer decides every issue"),
    osFlow: P("ตั้งค่า → ตรวจเร็ว → ข้อค้นพบ → เทียบ playbook → redline → คณะทบทวน → สิ่งที่เปลี่ยน แล้วส่ง Holistic", "Setup → quick → findings → playbook → redline → board → what changed, then Holistic"),
  },
  holistic: {
    playbook: "decision",
    purpose: P("ดูทั้งฉบับว่าข้อสัญญาร่วมกันได้หรือไม่ ก่อนบันทึกตัดสินใจ", "See whether the whole instrument works together before the decision memo"),
    osFlow: P("ปฏิสัมพันธ์ → ความครบถ้วน → ลำดับเอกสาร → จำลองผล → บันทึกตัดสินใจ แล้วส่ง Negotiate", "Interaction → completeness → hierarchy → simulate → memo, then Negotiate"),
  },
  diligence: {
    playbook: "dd",
    purpose: P("เข้าใจทั้งธุรกรรม เปิดความเสี่ยง แล้วสร้างเอกสารที่ต้องใช้แก้ไข", "Understand the whole transaction, expose the risk, and create the papers that fix it"),
    osFlow: P("ธุรกรรม → ห้องข้อมูล → ความครบถ้วน → ข้อขัดแย้ง → Deal X-Ray → ทนายยืนยัน → CP / เปิดเผย / ร่างแก้ไข", "Transaction → room → completeness → contradictions → Deal X-Ray → counsel verifies → CP / disclosure / remediate"),
  },
  negotiate: {
    playbook: "mandate",
    purpose: P("ถือจุดยืนตามอำนาจเจรจา ส่งคำตอบ และเก็บบันทึกรอบ", "Hold positions under the mandate, send responses, and keep a round record"),
    osFlow: P("กลยุทธ์ → ตารางจุดยืน → คำตอบที่แนะนำ → รอบเจรจา แล้วย้อน Review หรือออก Obligations เมื่อลงนาม", "Strategy → positions → responses → rounds, then back to Review or out to Obligations on signature"),
  },
  obligations: {
    playbook: "control",
    purpose: P("หลังลงนาม — ทะเบียน ปฏิทิน ต่ออายุ และการส่งต่อเมื่อพ้นกำหนด", "After signature — register, calendar, renewals, and escalation when a window is missed"),
    osFlow: P("ทะเบียน → ปฏิทิน → ท่อต่ออายุ → การแจ้งเตือน แล้วสะสมใน Intelligence", "Register → calendar → renewal pipeline → alerts, then it accumulates in Intelligence"),
  },
  intel: {
    playbook: "memory",
    purpose: P("ฝาแฝดกฎหมายของบริษัท — สัญญา ข้อผูกพัน ค้ำประกัน และคำถามผู้บริหารที่ชี้หลักฐาน", "The company's living legal twin — contracts, obligations, guarantees and management questions that cite evidence"),
    osFlow: P("ถามฝาแฝด → อ่านพอร์ตและกราฟ → ย้อนไปสัญญาต้นทาง แล้วส่ง Control หรือ Obligations", "Ask the twin → read portfolio and graph → trace to source, then Control or Obligations"),
  },
  command: {
    playbook: "command",
    purpose: P("ศูนย์บัญชาการกฎหมายของบริษัท — คำขอ อนุมัติ ที่ปรึกษาภายนอก และรายงานคณะกรรมการ", "The company's legal command center — requests, approvals, outside counsel and board reports"),
    osFlow: P("รับคำขอ → อนุมัติตามนโยบาย → ส่งเครื่องยนต์ (X-Ray / Twin) → รายงานคณะกรรมการ", "Intake → approve under policy → run the engine (X-Ray / Twin) → board report"),
  },
};

export const SCREEN_GUIDES: Record<string, { why: TE; do: TE; rule: TE }> = {
  "assist/ask": {
    why: P("ผู้ช่วยจัดเส้นทางเมื่อยังไม่รู้ว่าจะเปิดโมดูลใด", "The router when it is not yet obvious which module to open"),
    do: P("อธิบายบทบาทและคำสั่ง แล้วเปิดฟังก์ชันที่ถูกชี้เป็นอันดับแรก", "Describe the role and the assignment, then open the top-ranked function"),
    rule: P("ผู้ช่วยชี้ทาง ไม่ลงนามแทน และเพลย์บุ๊กของโมดูลที่ชี้คือกฎที่ใช้บังคับ", "Assist points — it does not sign — and the named module's playbook is in force"),
  },
  "help/use": {
    why: P("คู่มือระบบ — LAW24 ไม่ใช่แชตบอท และทนายเป็นผู้ตัดสินทุกท่าที", "The platform guide — LAW24 is not a chatbot, and the lawyer decides every posture"),
    do: P("อ่านหลักสี่ข้อ แล้วเดินตามขั้นแรก หรือถามเลโอ", "Read the four principles, then walk the first session or ask Leio"),
    rule: P("เครื่องยนต์ไม่ลงนามแทน และข้อสรุปทุกข้อต้องมีหลักฐาน", "The engine never signs, and every material conclusion cites evidence"),
  },
  "help/leio": {
    why: P("เลโอ — ผู้ช่วยถามวิธีใช้ LAW24 วิจัย และกฎที่เพิ่งออก", "Leio — ask how to use LAW24, research a point, or what just changed in regulation"),
    do: P("ถามด้วยประโยคเดียว แล้วเปิดหลักฐานที่เลโอชี้", "Ask in one sentence, then open the evidence Leio cites"),
    rule: P("เลโอไม่ลงนาม ไม่เลือกท่าที และทุกข้อสรุปต้องมีข้อสัญญา เพลย์บุ๊ก หรือฐานกฎหมาย", "Leio does not sign or pick a posture — every conclusion cites a clause, playbook or authority"),
  },
  "help/watch": {
    why: P("งานวิจัยสั้นและกฎที่เลโอติดตามในเทนแนนท์นี้", "Short research and the regulations Leio is watching in this tenant"),
    do: P("เปิดรายการที่กระทบเรื่องที่กำลังทำ แล้วถามเลโอถ้ายังไม่ชัด", "Open anything that hits the live matter, then ask Leio if the point is still open"),
    rule: P("ประกาศใหม่ไม่ย้ายเพลย์บุ๊กจนกว่าทนายจะยืนยัน", "A new gazette does not move the playbook until counsel confirms"),
  },
  "help/books": {
    why: P("คลังเพลย์บุ๊กบ้าน — หนังสือที่ใช้บังคับในแต่ละโมดูล", "The house playbook library — the book in force on each module"),
    do: P("เปิดเล่มที่ตรงกับงาน แล้วอ่านกฎก่อนลงมือในเครื่องยนต์", "Open the book that matches the work, then read the rules before the engine"),
    rule: P("เพลย์บุ๊กของโมดูลที่กำลังทำคือกฎที่ใช้บังคับ — ไม่ใช่คำแนะนำทั่วไป", "The playbook of the module in hand is the rule in force — not generic advice"),
  },
  "help/book": {
    why: P("เพลย์บุ๊กฉบับเต็ม — กฎที่ใช้บังคับและจุดที่เปิดในเครื่องยนต์", "The full playbook — rules in force and where to open them in the engine"),
    do: P("อ่านกฎ แล้วเปิดโมดูลที่เพลย์บุ๊กนี้กำกับ", "Read the rules, then open the module this book governs"),
    rule: P("ห้ามข้ามกฎในเล่มเพื่อปิดงานเร็ว", "Do not skip a rule in the book to close the work faster"),
  },
  "practice/dash": {
    why: P("ศูนย์ควบคุมสำนักงานแยกงานเป็นสามประเภท — ตรวจ ร่าง และ Deal X-Ray", "Firm control splits work into three engagements — review, drafting and Deal X-Ray"),
    do: P("เลือกประเภท แล้วเปิดควบคุมหรือบันทึกของประเภทนั้น", "Pick the engagement, then open that track’s control or record"),
    rule: P("งานทุกชิ้นต้องอยู่ใต้หนึ่งในสามประเภท — ห้ามมีงานนอกระบบ", "Every live assignment sits on one of the three tracks — no work off-system"),
  },
  "practice/pool": {
    why: P("คิวรับงานพักลูกค้าและงานใหม่ที่ยังไม่มีผู้รับผิดชอบ", "The intake pool holds new clients and engagements without an owner"),
    do: P("ตรวจชื่อลูกค้า ประเภท และชื่องาน แล้วกดรับงานเพื่อเปิดบันทึก", "Check the client, track and engagement name, then assign it to open the records"),
    rule: P("รายการในคิวยังไม่ใช่งานเปิด — ต้องมีทนายรับผิดชอบก่อนเข้าเครื่องยนต์", "A pool item is not open work — a lawyer must take ownership before it enters an engine"),
  },
  "practice/ereview": {
    why: P("งานตรวจสัญญา — X-Ray ห้องบังคับ ฝาแฝด ห้องสงคราม เจรจา ข้อผูกพัน", "Contract review — X-Ray, Cockpit, Twin, War Room, Copilot, Obligations"),
    do: P("วางแผนที่ที่ X-Ray แล้วเปิดโมดูลตรวจ หรือเปิดบันทึกงานตรวจ", "Map on X-Ray, then open a review module or the review record"),
    rule: P("งานตรวจต้องมีแผนที่ก่อนลงนาม — เครื่องยนต์ไม่ลงนามแทน", "A review assignment needs a map before signing — the engine never signs"),
  },
  "practice/edraft": {
    why: P("งานร่างสัญญา — คลังประเภท สัมภาษณ์ ประกอบข้อ และร่างคู่ภาษา", "Contract drafting — type library, interview, assembly and bilingual draft"),
    do: P("เลือกประเภทจากคลัง แล้วเปิดบันทึกงานร่างใต้ลูกค้า", "Pick the type from the library, then open the drafting record under the client"),
    rule: P("ห้ามร่างลอยโดยไม่มีรหัสประเภท", "No freehand draft without a type id"),
  },
  "practice/edd": {
    why: P("ตรวจสอบสถานะทางกฎหมาย — Deal X-Ray ของทั้งธุรกรรม", "Legal due diligence — Deal X-Ray of the whole transaction"),
    do: P("ตั้งเรื่อง จัดห้องข้อมูล แล้วขึ้นธงให้ทนายยืนยัน", "Open the matter, index the room, then raise flags for counsel"),
    rule: P("ธงแดงต้องมีหลักฐาน — ห้ามขึ้นธงจากความจำอย่างเดียว", "A red flag needs evidence — not memory alone"),
  },
  "practice/clients": {
    why: P("ลูกค้าคือจุดเริ่มของทุกงานที่ปรึกษา", "The client is the root of every advisory assignment"),
    do: P("เพิ่มลูกค้า หรือเปิดแถวเพื่อกรองงานของรายนั้น", "Add a client, or open a row to filter that client's work"),
    rule: P("ห้ามเปิดงานถ้ายังไม่มีลูกค้าในทะเบียน", "No assignment without a client on the register"),
  },
  "practice/assign": {
    why: P("บันทึกงานทั้งสามประเภท — ตรวจสัญญา ร่างสัญญา และความเสี่ยงกฎหมาย", "The engagement record across review, drafting and legal DD"),
    do: P("กรองประเภท เพิ่มงาน หรือเปิดแถวเข้าเครื่องยนต์ของประเภทนั้น", "Filter the track, add an assignment, or open a row into that engine"),
    rule: P("เปิดงานได้เมื่อตรวจผลประโยชน์ทับซ้อนผ่านแล้วเท่านั้น", "Open only after conflict check has cleared"),
  },
  "practice/trace": {
    why: P("เส้นทางคือหลักฐานให้ฝ่ายบริหารไล่จากคำสั่งแรกถึงจุดควบคุมปัจจุบัน", "The trail is the evidence pack — first instruction to current control"),
    do: P("เลือกงาน ไล่ขั้น และกดเปิดในเครื่องยนต์เมื่อจะทำต่อ", "Pick an assignment, walk the steps, and open the engine to continue"),
    rule: P("เส้นทางต้องครบ — ขาดขั้นรับเรื่องถือว่ายังไม่เปิดงาน", "The trail must be complete — missing intake means the assignment is not open"),
  },
  "assemble/intake": {
    why: P("รับข้อเท็จจริง ข้อค้นพบ และคำสั่ง redline จาก Review พร้อมแหล่ง", "Ingest facts, findings and redline instructions from Review with their sources"),
    do: P("เลือกเฉพาะข้อมูลที่ต้องควบคุมร่าง แล้วรับเข้า Assembly", "Select the information that must control the draft, then ingest it"),
    rule: P("ห้ามคัดข้อค้นพบเป็นถ้อยคำโดยไม่รักษาแหล่งและท่าที", "Do not copy a finding into drafting words without its source and posture"),
  },
  "assemble/lib": {
    why: P("คลัง 500 ประเภทเป็นประตูเข้าเครื่องยนต์ประกอบสัญญา", "The 500-type library is the door into assembly"),
    do: P("กรองหมวด เปิดประเภทที่ถูกเรื่อง — เดโมคือ CT-284 SaaS", "Filter the category and open the right type — the demo is CT-284 SaaS"),
    rule: P("ห้ามประกอบข้อโดยไม่มีรหัสประเภท", "No clause assembly without a type id"),
  },
  "assemble/type": {
    why: P("รายละเอียดประเภทผูกฐานกฎหมาย คู่สัญญา และข้อสำคัญ", "Type detail binds legal basis, parties and key terms"),
    do: P("ยืนยันว่าประเภทนี้คือเรื่องที่กำลังทำ ปรับข้อมาตรฐานถ้าบ้านต้องขยับ แล้วเข้าสัมภาษณ์", "Confirm this is the matter in hand, adjust a standard clause if the house text must move, then go to the interview"),
    rule: P("playbook บ้านทับประเภท — SaaS ใช้ชั้น IT & Cloud", "House playbook overlays the type — SaaS takes the IT & Cloud layer"),
  },
  "assemble/iv": {
    why: P("แบบสัมภาษณ์ล็อกท่าทีเชิงพาณิชย์ให้เครื่องเลือกข้อได้", "The interview locks commercial positions so the engine can pick clauses"),
    do: P("ตรวจคำตอบที่เติมมา แล้วกดยืนยัน — อย่าข้ามข้อขัด", "Check the pre-filled answers and confirm — do not skip a conflict"),
    rule: P("ยืนยันแล้วท่าทีล็อกจนกว่าจะเปิดสัมภาษณ์ใหม่", "Once confirmed, positions stay locked until the interview is reopened"),
  },
  "assemble/asm": {
    why: P("ข้อสัญญาถูกเลือกจากคำตอบและ playbook — จุดนี้คือที่ตัดสินข้อขัดนโยบาย", "Clauses fire from answers and playbook — this is where policy conflicts are decided"),
    do: P("ถ้ากฎหมายไทยขัดกับอนุญาโตตุลาการต่างประเทศ ให้คงท่าทีบ้าน", "If Thai law collides with foreign arbitration, keep the house position"),
    rule: P("กฎหมายไทยเป็นค่าเริ่มต้น ต้องมีเหตุจึงจะสละได้", "Thai law is the default; waiver needs a recorded reason"),
  },
  "assemble/draft": {
    why: P("ร่างแสดงข้อมูล Review ที่ใช้บังคับ ก่อนอนุมัติและสร้างชุด", "The draft shows the Review inputs in force before approval and pack generation"),
    do: P("ตรวจแหล่ง อนุมัติ DPO สร้างชุด แล้วเปิดด่านพร้อมส่งตรวจ", "Check sources, approve as DPO, generate the pack, then open review preflight"),
    rule: P("ห้ามส่งลงนามก่อนร่างที่ประกอบแล้วผ่าน Contract Review ใหม่", "Do not send for signature before the assembled draft receives a fresh Contract Review"),
  },
  "assemble/areview": {
    why: P("ด่านพร้อมส่งตรวจรักษาแหล่งจาก Review แล้วเปิดงานตรวจฉบับที่ประกอบ", "Review preflight preserves Review sources and opens a review matter for the assembled draft"),
    do: P("ปิดทุกแถว OPEN แล้วส่งร่างเข้า Contract Review", "Close every OPEN row, then send the draft to Contract Review"),
    rule: P("metadata ไม่ใช่เอกสาร — ต้องอัปโหลด DOCX/PDF ที่สร้างเพื่อทำ X-Ray ใหม่", "Metadata is not the document — upload the generated DOCX/PDF for a fresh X-Ray"),
  },
  "assemble/bilingual": {
    why: P("ร่างคู่ภาษาชี้จุดที่คำแปลสร้างความหมายทางกฎหมายคนละอย่าง", "The bilingual mirror flags where translation changes legal meaning"),
    do: P("อ่านจุด drift ที่ความเสี่ยงสูง ก่อนส่ง Review", "Read high-risk drift before handing to Review"),
    rule: P("ความหมายต้องตรงกันทั้งสองภาษา — ถ้าไม่ตรงให้แก้ต้นทาง", "Both languages must mean the same thing — if they diverge, fix the source"),
  },
  "review/rsetup": {
    why: P("ตั้งบริบทการตรวจ — ฉบับใคร playbook ไหน มูลค่าเท่าใด", "Set review context — whose paper, which playbook, what value"),
    do: P("วางไฟล์คู่สัญญาถ้ามี ตรวจว่า playbook ที่ติดมาถูกเรื่อง", "Drop counterparty paper if you have it; confirm the attached playbook is the right one"),
    rule: P("SaaS / คลาวด์ใช้ IT & Cloud v4.2 ไม่ใช่เพลย์บุ๊กทั่วไป", "SaaS/cloud uses IT & Cloud v4.2, not the generic commercial book"),
  },
  "review/quick": {
    why: P("ภาพรวมข้อกำหนดสำคัญก่อนลงรายข้อค้นพบ", "Key terms at a glance before the finding cards"),
    do: P("จดสี่ข้อที่ต้องปิดก่อนลงนาม แล้วเปิดข้อค้นพบ", "Note the four items that must close before signature, then open findings"),
    rule: P("ฉบับคู่สัญญาที่เอียงผู้ให้บริการต้องมีบัตรประเด็น ไม่ใช่ผ่านเร็ว", "Provider-favouring paper gets issue cards — it does not pass on a quick read"),
  },
  "review/find": {
    why: P("ข้อค้นพบคือหน่วยตัดสิน — แต่ละใบมีหลักฐานและคำแนะนำ", "Findings are the decision unit — each card has evidence and a recommended act"),
    do: P("เปิด F-01 แล้วแก้เข้าชุด — อย่ายอมตามเพดานของคู่สัญญา", "Open F-01 and amend it into the pack — do not accept the counterparty cap"),
    rule: P("เพดานต้องรวมข้อเรียกร้องข้อมูล — F-01 ที่ไม่จำกัดเป็น miss", "The cap must include data claims — an uncapped F-01 is a miss"),
  },
  "review/pb": {
    why: P("เทียบท่าทีบ้านกับสิ่งที่ได้จากฉบับ — นี่คือเพลย์บุ๊กที่ติดกับโมดูลนี้", "House position versus what the paper actually gives — this is the playbook on this module"),
    do: P("ไล่แถว miss / gap แล้วโยงกลับข้อค้นพบ", "Walk miss/gap rows and jump back to the finding"),
    rule: P("ทุก miss ต้องมีการกระทำ: แก้ ขอเอกสาร ส่งต่อ หรือปฏิเสธ", "Every miss needs an act: amend, request, escalate or reject"),
  },
  "review/red": {
    why: P("redline ของคู่สัญญาเปลี่ยนสิทธิ — ต้องตอบทีละจุด", "Counterparty redline changes rights — each mark needs a response"),
    do: P("ปฏิเสธข้อที่ยกข้อมูลออกจากเพดาน รับได้เฉพาะข้อที่ไม่เพิ่มความเสี่ยงที่มีนัย", "Reject the data-cap carve-out; accept only marks that do not add material risk"),
    rule: P("การยอม redline ที่เพิ่มความเสี่ยงต้องมีผู้อนุมัติตามเพลย์บุ๊ก", "Accepting a risk-increasing redline needs the playbook's named approver"),
  },
  "review/board": {
    why: P("คณะทบทวนเจ็ดมุมมอง — ไม่ใช่แชตบอทตัวเดียว", "Seven specialized reviewers — not one chatbot"),
    do: P("อ่านจุดเห็นพ้องแล้วรับคำแนะนำเจรจาใหม่", "Read the agreement cluster and take the renegotiate recommendation"),
    rule: P("คำแนะนำคณะไม่ใช่ลายเซ็น — ทนายรับหรือไม่รับก็ได้ แต่ต้องบันทึก", "The board is not a signature — counsel may decline, but must record it"),
  },
  "review/diff": {
    why: P("สิ่งที่เปลี่ยนในเวอร์ชันนี้มีความหมายอย่างไร ใครได้เปรียบ", "What this version changed, what it means, and who benefits"),
    do: P("ส่งต่อ Holistic เมื่อเข้าใจแล้วว่าสิทธิเลื่อนไปทางใด", "Hand to Holistic once you know which way the rights moved"),
    rule: P("การเปลี่ยนที่เพิ่มความเสี่ยงที่มีนัยต้องผ่าน GC + CFO", "A material risk increase needs GC + CFO"),
  },
  "holistic/hinter": {
    why: P("ข้อสัญญาไม่ได้ทำงานทีละข้อ — จุดนี้คือปฏิสัมพันธ์", "Clauses do not operate alone — this is interaction"),
    do: P("ไล่ข้อที่ชนกัน เช่น เพดานกับการชดใช้ และการลบข้อมูลกับหน้าที่เก็บเอกสาร", "Walk collisions such as cap vs indemnity, and deletion vs retention"),
    rule: P("ข้อขัดกันถือว่ายังลงนามไม่ได้", "An unresolved interaction is a bar to signature"),
  },
  "holistic/hcons": {
    why: P("ความครบถ้วน — สิ่งที่อ้างถึงต้องมีจริง", "Completeness — what is incorporated must actually be there"),
    do: P("เช็คภาคผนวก A–C และการอ้างข้ามเอกสาร", "Check annexes A–C and cross-references"),
    rule: P("ภาคผนวกที่อ้างถึงแต่ไม่แนบ = ช่องว่างที่ปิดก่อนลงนาม", "An incorporated-but-missing annex is a pre-signature gap"),
  },
  "holistic/hbal": {
    why: P("ลำดับเอกสารและความสมดุลของภาระ", "Document hierarchy and whether the burden is balanced"),
    do: P("ดูว่าเอกสารใดชนะเมื่อขัดกัน และภาระเอียงฝ่ายใด", "See which paper wins on conflict, and which side carries the load"),
    rule: P("ลำดับที่คู่สัญญากำหนดไว้ต้องไม่ทำลายเพลย์บุ๊กบ้าน", "Counterparty hierarchy must not override the house playbook"),
  },
  "holistic/simulate": {
    why: P("จำลองผลของสัญญาในสถานการณ์จริง ก่อนออกบันทึก", "Simulate real outcomes before the memo"),
    do: P("รันอย่างน้อยคำถามเพดานความเสี่ยงสูงสุด", "Run at least the maximum-exposure question"),
    rule: P("บันทึกที่ไม่มีผลการจำลองถือว่ายังไม่พร้อมผู้บริหาร", "A memo without a simulation is not board-ready"),
  },
  "holistic/memo": {
    why: P("บันทึกตัดสินใจคือสิ่งที่ฝ่ายบริหารอ่าน — ท่าทีชัด พร้อมหลักฐาน", "The decision memo is what management reads — a clear posture with citations"),
    do: P("ออกบันทึกท่าทีเจรจาใหม่ แล้วส่ง Negotiate", "Issue the memo as renegotiate, then go to Negotiate"),
    rule: P("ท่าทีมีได้สามอย่าง: ลงนาม เจรจาใหม่ ปฏิเสธ — ห้ามคลุมเครือ", "Three postures only: sign, renegotiate, reject — no fudge"),
  },
  "diligence/deal": {
    why: P("Deal X-Ray คือจอตัดสินใจของทั้งธุรกรรม — ไม่ใช่สรุป PDF", "Deal X-Ray is the decision screen for the whole transaction — not a PDF summary"),
    do: P("อ่านสุขภาพดีล แล้วเจาะเอกสารที่ขาด ข้อขัดแย้ง หรือข้อที่อาจฆ่าดีล", "Read deal health, then drill into missing papers, contradictions or breakers"),
    rule: P("ทุกข้อสรุปต้องชี้หลักฐาน และเครื่องยนต์ไม่ลงนามแทน", "Every conclusion cites evidence, and the engine never signs"),
  },
  "diligence/dmatter": {
    why: P("ล็อกประเภทธุรกรรมก่อนสร้างรายการตรวจ", "Lock the transaction type before the checklist is born"),
    do: P("เลือกซื้อหุ้น ซื้อสินทรัพย์ ลงทุน หรือตรวจสุขภาพ แล้วเปิดศูนย์ควบคุม", "Pick share, asset, investment or a health check, then open the Control Center"),
    rule: P("รายการตรวจที่ไม่มีประเภทธุรกรรม = รายการว่าง", "A checklist without a transaction type is an empty list"),
  },
  "diligence/droom": {
    why: P("ห้องข้อมูลคือหลักฐาน — จัดประเภท ครอบครัวสัญญา และเวอร์ชัน", "The data room is the evidence — class, contract family and version"),
    do: P("วางห้อง แล้วดูครอบครัวสัญญาไม่ใช่รายชื่อไฟล์", "Drop the room, then read families — not a file list"),
    rule: P("เอกสารที่ไม่อยู่ในดัชนีใช้เป็นหลักฐานในธงแดงไม่ได้", "A document not in the index cannot support a red flag"),
  },
  "diligence/dmiss": {
    why: P("เครื่องเอกสารที่ขาดถามว่าอะไรควรมีแต่ยังไม่ถูกส่ง", "Missing-document AI asks what should exist but was not provided"),
    do: P("ออกคำขอ DD-xxx แล้วส่งเข้าคำถามฝ่ายบริหาร", "Issue DD-xxx requests and push them into management Q&A"),
    rule: P("อย่าเขียนว่ารับครบทั้งที่รายการตรวจยังขาด", "Do not report the room as complete while the checklist is open"),
  },
  "diligence/dcontra": {
    why: P("ข้อขัดแย้งข้ามเอกสารคือสมมติฐานที่ต้องพิสูจน์", "Cross-document contradictions are hypotheses to prove"),
    do: P("อ่านคู่ A/B แล้วตั้งคำถามฝ่ายบริหาร", "Read the A/B pair, then put the question to management"),
    rule: P("ระบบไม่ invent ตัวเลขหุ้น — ชี้สองแหล่งให้ทนายเทียบ", "The engine does not invent share counts — it sends counsel to two sources"),
  },
  "diligence/dbreak": {
    why: P("รายการที่อาจฆ่าดีลคือสิ่งที่ผู้ตัดสินใจต้องเห็นก่อน", "The deal-breaker list is what decision-makers need first"),
    do: P("อ่านไม่เกินเจ็ดข้อ แล้วแปลงเป็น CP หรือเอกสารแก้ไข", "Read at most seven items, then turn them into CPs or fix papers"),
    rule: P("ห้ามฝังประเด็นฆ่าดีลไว้ในรายงาน 150 หน้า", "Do not bury a kill item in a 150-page report"),
  },
  "diligence/dsim": {
    why: P("จำลองโครงสร้างเพื่อดูว่าความเสี่ยงกฎหมายขยับอย่างไร", "Simulate structure to see how legal exposure moves"),
    do: P("สลับ 100% / 49% / สินทรัพย์ แล้วอ่านแถวใบอนุญาตและความยินยอม", "Toggle 100% / 49% / assets, then read the licence and consent rows"),
    rule: P("การจำลองเปลี่ยนสมมติฐาน ไม่เปลี่ยนข้อเท็จจริงในเอกสาร", "The simulator changes assumptions, not the facts in the papers"),
  },
  "diligence/dfix": {
    why: P("ข้อค้นพบต้องกลายเป็นฉบับแก้ไข ความยินยอม หรือ CP", "A finding must become an amendment, a consent or a CP"),
    do: P("คลิกแก้ไข แล้วกระโดดไป Assemble หรือ Review", "Click remediate, then hop to Assemble or Review"),
    rule: P("ค้นพบโดยไม่แก้ไข = งานยังไม่ปิด", "A finding without a fix is unfinished work"),
  },
  "diligence/dic": {
    why: P("โหมดคณะกรรมการแสดงสุขภาพดีลก่อนรายงานเต็ม", "IC mode shows deal health before the full report"),
    do: P("อ่านคำแนะนำธุรกรรม แล้วเจาะข้อที่อาจฆ่าดีล", "Read the transaction recommendation, then drill into breakers"),
    rule: P("ผู้บริหารเห็นสี่ความเสี่ยงใหญ่สุดก่อน 150 หน้า", "Executives see the four biggest risks before 150 pages"),
  },
  "diligence/dgrid": {
    why: P("ตารางตรวจสกัดแนวคิดข้ามเอกสารพร้อมทนายยืนยัน", "The grid extracts concepts across documents with lawyer verification"),
    do: P("เปิดแถวที่ทนายยังไม่ยืนยัน", "Open rows the lawyer has not yet verified"),
    rule: P("ข้อสรุปจากออโตไพลอตที่ยังไม่ยืนยันห้ามขึ้นรายงาน IC", "Unverified autopilot conclusions do not go in the IC report"),
  },
  "diligence/dmap": {
    why: P("แผนผังดีลโยงสัญญา หนี้ ลูกค้า และสิทธิของบุคคลที่สาม", "Deal Map links contracts, debt, customers and third-party rights"),
    do: P("ดูสายที่ไปสู่การผิดนัดหรือการเลิกของลูกค้าหลัก", "Follow chains that run to default or key-customer exit"),
    rule: P("สิทธิของบุคคลที่สามที่กระทบอำนาจควบคุมต้องขึ้นธง", "Third-party rights that bite on change of control must be flagged"),
  },
  "diligence/dflags": {
    why: P("ธงแดงคือประเด็นที่อาจล้มดีล — แต่ละใบมีสายหลักฐาน", "Red flags are deal-kill items — each has an evidence chain"),
    do: P("ส่งต่อ DK-01 ถึงพาร์ทเนอร์ ยึดชุด IC จนกว่าจะอธิบายได้", "Escalate DK-01 to partner; hold the IC pack until it is explained"),
    rule: P("สินเชื่อที่ผิดนัดทันทีเมื่อเปลี่ยนอำนาจควบคุม = ล้มดีลจนกว่าจะมี waiver", "A facility that defaults on CoC is a kill item until waived"),
  },
  "diligence/dreq": {
    why: P("คำขอและคำถามปิดช่องว่างในห้องข้อมูล", "Requests and Q&A close holes in the room"),
    do: P("ส่งคำขอที่ยังเปิด และติดตามคำตอบ", "Issue open requests and chase answers"),
    rule: P("คำถามที่ไม่มีคำตอบต้องปรากฏในรายงาน ไม่ใช่เงียบหาย", "Unanswered questions appear in the report — they are not dropped"),
  },
  "diligence/dqa": {
    why: P("ความครบถ้วนของงานตรวจก่อนปิดรายงาน", "Coverage and QA before the report can close"),
    do: P("ดูร้อยละที่ทนายยืนยันแล้ว อย่าปิดถ้าต่ำกว่าเกณฑ์", "Check lawyer-verified coverage; do not close below the floor"),
    rule: P("เพลย์บุ๊กกำหนดพื้นความครบถ้วนก่อน IC", "The playbook sets a coverage floor before IC"),
  },
  "diligence/drep": {
    why: P("รายงานคือสิ่งที่คณะกรรมการลงทุนอ่าน", "The report is what the investment committee reads"),
    do: P("ออกชุดเมื่อธงแดงถูกส่งต่อและ QA ผ่าน", "Issue the pack when flags are escalated and QA has passed"),
    rule: P("รายงานที่ไม่มีประเด็นล้มดีลทั้งที่ DK-01 ยังเปิด = ไม่ผ่านเพลย์บุ๊ก", "A report that omits an open kill item fails the playbook"),
  },
  "diligence/autopilot": {
    why: P("ออโตไพลอตวิ่งทั้งห้องแล้วส่งธงให้ทนายยืนยัน — ไม่แทนทนาย", "Autopilot runs the room and hands flags to counsel — it does not replace counsel"),
    do: P("อ่านผลแล้วเปิดธงแดงที่ยังไม่ถูกตัดสิน", "Read the run, then open flags that are still undecided"),
    rule: P("ผลออโตไพลอตเป็นข้อค้นพบร่าง จนกว่าทนายจะยืนยัน", "Autopilot output is a draft finding until the lawyer verifies it"),
  },
  "negotiate/nstrat": {
    why: P("กลยุทธ์และอำนาจต่อรอง — ข้อต้องได้ ข้อแลกได้ และจุดเดินออก", "Strategy and leverage — must-haves, tradables and the walk-away"),
    do: P("ยึดสี่ข้อต้องได้ อย่าแลกเพดานข้อมูล", "Hold the four must-haves; do not trade the data cap"),
    rule: P("อำนาจเจรจานี้มาจากบันทึก Holistic — ห้ามขยายเอง", "This mandate comes from the Holistic memo — do not widen it here"),
  },
  "negotiate/npos": {
    why: P("ตารางจุดยืนคือสถานะปัจจุบันของทุกข้อที่ยังเปิด", "The position tracker is the live state of every open point"),
    do: P("อัปเดตข้อที่คู่สัญญายังไม่ขยับ", "Update points the counterparty has not moved on"),
    rule: P("ข้อต้องที่ได้มาร์กว่า hold ได้ — ห้ามมาร์กว่า conceded", "A must-have may be held — it may not be marked conceded"),
  },
  "negotiate/nresp": {
    why: P("คำตอบที่แนะนำพร้อมเหตุจาก playbook — ทนายเป็นผู้ส่ง", "Recommended responses with playbook reasons — counsel sends them"),
    do: P("คัดลอกหรือแก้คำตอบแล้วส่งในรอบ", "Copy or edit a response and send it in the round"),
    rule: P("คำตอบที่สละข้อต้องได้จะถูกเพลย์บุ๊กบล็อก", "A response that gives away a must-have is blocked by the playbook"),
  },
  "negotiate/nhist": {
    why: P("ประวัติรอบ — สิ่งที่เสนอ สิ่งที่ได้ และสิ่งที่ยังเปิด", "Round history — what was offered, what landed, what is still open"),
    do: P("ปิดรอบได้เมื่อข้อต้องได้ครบ หรือยึดรอบถ้ายังเปิด", "Close the round when must-haves land, or hold if they are still open"),
    rule: P("รอบที่ปิดขณะข้อต้องได้ยังเปิดถือว่าผิดอำนาจ", "Closing a round with an open must-have is outside the mandate"),
  },
  "obligations/oreg": {
    why: P("ทะเบียนข้อผูกพันหลังลงนาม — ทุกข้อผูกกับสัญญาต้นทาง", "Post-signature register — every row traces to a source contract"),
    do: P("กรองรายการเลยกำหนดและรายการที่ไม่มีเพดาน", "Filter overdue rows and uncapped items"),
    rule: P("ข้อผูกพันที่ไม่มีต้นทางในคลังถือว่ายังไม่เข้าทะเบียน", "An obligation without a library source is not on the register"),
  },
  "obligations/ocal": {
    why: P("ปฏิทินกำหนดเวลาคือการควบคุมหน้าต่างบอกกล่าว", "The calendar is how notice windows are controlled"),
    do: P("ดูหน้าต่างที่ปิดใน 120 วัน และรายการที่พ้นแล้ว", "Look at windows inside 120 days and anything already missed"),
    rule: P("ตั้งเตือนอย่างน้อย 120 วันก่อนวันบอกกล่าว", "Alert at least 120 days before the notice date"),
  },
  "obligations/oren": {
    why: P("ท่อต่ออายุ — สัญญาที่ต่ออัตโนมัติและที่ต้องตัดสินใจ", "Renewal pipeline — auto-renewals and decisions due"),
    do: P("เปิดรายการที่ต่อโดยไม่มีเพดานราคา", "Open items that auto-renew with no price cap"),
    rule: P("ต่ออัตโนมัติที่ไม่มีเพดานต้องมีคำแนะนำต่ออายุก่อนครบกำหนด", "Uncapped auto-renewals need a recommendation before they roll"),
  },
  "obligations/oalert": {
    why: P("การแจ้งเตือนและการส่งต่อเมื่อพ้นหน้าต่าง", "Alerts and escalation when a window is missed"),
    do: P("ส่งหนังสือเยียวยาของรายการที่พ้น 1 ส.ค. หรือปิดการแจ้งเมื่อส่งแล้ว", "Serve the remedial notice on the 1 Aug miss, or complete the alert once sent"),
    rule: P("พ้นกำหนดส่งต่อพาร์ทเนอร์ในวันเดียวกัน", "Missed windows escalate to partner the same day"),
  },
  "intel/ipf": {
    why: P("ภาพรวมพอร์ต — ความเสี่ยงสะสมและการต่ออายุทั้งองค์กร", "Portfolio view — concentrated risk and renewals across the estate"),
    do: P("เปิดจุดที่ความรับผิดไม่จำกัดหรือต่ออายุกระจุก", "Open pockets of uncapped liability or clustered renewals"),
    rule: P("ตัวเลขพอร์ตต้องไล่กลับไปถึงสัญญาต้นทางได้", "Portfolio numbers must trace to source contracts"),
  },
  "intel/ikg": {
    why: P("กราฟความรู้โยงสัญญา คู่สัญญา ข้อผูกพัน และข้อเบี่ยงเบน", "The graph links contracts, parties, obligations and deviations"),
    do: P("เดินตามสายจากคู่สัญญาหรือจากข้อไม่จำกัดความรับผิด", "Walk a chain from a party or from an uncapped-liability node"),
    rule: P("โหนดที่ไม่มีหลักฐานไม่ขึ้นเป็นข้อสรุป", "A node without evidence is not a conclusion"),
  },
  "intel/memory": {
    why: P("ความจำทางกฎหมายขององค์กรนี้ — ข้อยกเว้นและผลเจรจาที่เคยยอม", "This tenant's legal memory — exceptions and outcomes already accepted"),
    do: P("ถามเรื่องที่เคยตัดสินแล้ว อย่าให้โมเดลลืมเพลย์บุ๊กบ้าน", "Ask what has already been decided; do not let the model forget the house book"),
    rule: P("ความจำอยู่เฉพาะเทนแนนท์ — ไม่ฝึกโมเดลจากข้อมูลลูกค้าโดยค่าเริ่มต้น", "Memory stays in-tenant — customer data does not train the model by default"),
  },
  "intel/twin": {
    why: P("ฝาแฝดกฎหมายของบริษัท — สัญญา ข้อผูกพัน และคำถามผู้บริหารที่ชี้หลักฐาน", "The company's living legal twin — contracts, obligations and management questions that cite evidence"),
    do: P("ถามหนึ่งคำถาม แล้วเปิดสัญญาต้นทางที่ฝาแฝดชี้", "Ask one question, then open the source contract the twin cites"),
    rule: P("ข้อสรุปทุกข้อต้องมีหลักฐาน — ข้อสัญญา เพลย์บุ๊ก หรือฐานกฎหมาย", "Every conclusion cites a clause, playbook or authority"),
  },
  "review/xray": {
    why: P("Contract X-Ray วางแผนที่ฉบับเป็นคำตัดสิน แผนความร้อน และข้อที่ขาด", "Contract X-Ray maps the paper into a verdict, heatmap and missing clauses"),
    do: P("อัปโหลดสัญญา หรือทดลองกับนิมบัส แล้วเปิดข้อค้นพบ", "Upload the agreement or run the Nimbus demo, then open findings"),
    rule: P("SaaS / คลาวด์ใช้ IT & Cloud v4.2 — X-Ray ไม่ใช่ลายเซ็น", "SaaS/cloud uses IT & Cloud v4.2 — X-Ray is not a signature"),
  },
  "holistic/cockpit": {
    why: P("ห้องบังคับคือภาพทั้งฉบับ — มูลค่า ขั้น ความเสี่ยง อนุมัติ", "The cockpit is the whole-instrument view — value, stage, risk, approvals"),
    do: P("อ่านคำตัดสิน แล้วเปิด Clause DNA หรือบันทึกตัดสินใจ", "Read the verdict, then open Clause DNA or the decision memo"),
    rule: P("ห้ามลงนามถ้าข้อสัญญายังขัดกันหรือภาคผนวกขาด", "No signature while clauses conflict or annexes are missing"),
  },
  "holistic/dna": {
    why: P("Clause DNA เทียบข้อนี้กับเพลย์บุ๊กและสัญญาที่ลงนามแล้ว", "Clause DNA compares this clause to the playbook and signed history"),
    do: P("เปิดข้อที่พลาดท่าทีบ้าน แล้วโยงกลับข้อค้นพบ", "Open the clause that misses the house position, then jump back to the finding"),
    rule: P("miss ต่อเพลย์บุ๊กต้องมีการกระทำ — ไม่ใช่ผ่าน", "A miss against the playbook needs an act — not a pass"),
  },
  "diligence/dwar": {
    why: P("ธงสัญญาคือฉบับที่ map — ทั้งธุรกรรมอยู่ที่ Deal X-Ray", "Contract flags are the mapped paper — the whole deal lives on Deal X-Ray"),
    do: P("อ่านธงของฉบับนี้ แล้วกระโดดกลับ Deal X-Ray", "Read this paper's flags, then jump back to Deal X-Ray"),
    rule: P("อย่าใช้ธงฉบับเดียวแทนสุขภาพทั้งดีล", "Do not treat one paper's flags as the health of the deal"),
  },
  "negotiate/nladder": {
    why: P("บันไดเจรจาคือทางเดินจากฉบับปัจจุบันถึงอำนาจที่ต้องได้", "The negotiation ladder is the walk from current paper to the mandate"),
    do: P("ยึดข้อต้องได้ — แลกได้เฉพาะที่อำนาจอนุญาต", "Hold the must-haves; trade only what the mandate allows"),
    rule: P("ห้ามยอมเพดานข้อมูลเพื่อแลกส่วนลด", "Do not trade the data cap for a price cut"),
  },
  "practice/brain": {
    why: P("สมองสำนักงานคือความจำว่าสำนักงานนี้เคยตัดสินอย่างไร", "Firm Brain is the institutional memory of how this office decides"),
    do: P("ถามท่าทีบ้านเรื่องข้อนี้ แล้วเปิดแหล่งที่สมองชี้", "Ask how this firm treats this clause, then open the source it cites"),
    rule: P("ความจำอยู่เฉพาะสำนักงาน — ไม่กลายเป็นลายเซ็น", "Memory stays in-firm — it does not become a signature"),
  },
  "practice/room": {
    why: P("ห้องตรวจลูกค้าคือการส่งข้อค้นพบภายใต้แบรนด์สำนักงาน", "The Client Review Room is branded delivery of findings to the client"),
    do: P("แชร์ชุดที่ลูกค้าอ่านได้ โดยไม่เห็นเครื่องยนต์", "Share the pack the client can read without seeing the engine"),
    rule: P("ลูกค้าเห็นห้อง ไม่เห็นระบบปฏิบัติการ — พาร์ทเนอร์ยังเป็นเจ้าของท่าที", "The client sees the room, not the OS — partner still owns the posture"),
  },
  "practice/packages": {
    why: P("บริการสำเร็จรูปคือวิธีที่สำนักงานขายงานกฎหมายแบบวนซ้ำ", "Packaged services are how the firm sells recurring legal work"),
    do: P("เลือกแพ็กเกจ แล้วเปิดใบเสนอและหนังสือว่าจ้าง", "Pick a package, then open quote and engagement"),
    rule: P("แพ็กเกจคือสินค้า — ค่าธรรมเนียมและรอบต้องอยู่บนบันทึกก่อนเริ่มงาน", "A package is a product — fee and cycle are on the record before work starts"),
  },
  "practice/quote": {
    why: P("ใบเสนอและหนังสือว่าจ้างล็อกขอบเขต ค่าธรรมเนียม และเพลย์บุ๊กที่ใช้บังคับ", "Quote and engagement lock scope, fee and the playbook in force"),
    do: P("ออกหนังสือ แล้วเปิดงานในสำนักงาน", "Issue the letter, then open the assignment"),
    rule: P("ห้ามเริ่มงานถ้ายังไม่มีหนังสือว่าจ้างบนบันทึก", "No work starts without an engagement on the record"),
  },
  "command/desk": {
    why: P("ศูนย์บัญชาการกฎหมายคือที่ฝ่ายบริหารเห็นคำขอ ความเสี่ยง และที่ปรึกษาภายนอก", "The legal command center is where management sees requests, risk and outside counsel"),
    do: P("เปิดคำขอที่ค้างนานสุด หรือรายการอนุมัติที่รอ", "Open the oldest open request or the pending approval"),
    rule: P("คำขอทุกใบต้องมีเจ้าของและกำหนด — เครื่องยนต์ไม่ลงนามแทน", "Every request has an owner and a due date — the engine never signs"),
  },
  "command/requests": {
    why: P("คำขอกฎหมายคือทางรับเรื่องจากธุรกิจ", "Legal requests are intake from the business"),
    do: P("กำหนดเจ้าของ หรือส่งฉบับเข้า X-Ray", "Assign an owner, or send the paper into X-Ray"),
    rule: P("คำขอที่ไม่มีเจ้าของอยู่ไม่ได้ — ต้องกำหนดภายในวันเดียวกัน", "Unowned requests do not sit — they are assigned the same day"),
  },
  "command/approvals": {
    why: P("การอนุมัติคือประตูนโยบายบริษัทก่อนสัญญาขยับ", "Approvals are the company policy gate before a contract moves"),
    do: P("ผ่านหรือคืนรายการ DPO ที่ค้าง", "Clear or return the pending DPO item"),
    rule: P("ประตูนโยบายคือเพลย์บุ๊ก — ข้ามผู้อนุมัติถือว่า miss", "Policy gates are the playbook — skipping an approver is a miss"),
  },
  "command/counsel": {
    why: P("ที่ปรึกษาภายนอกทำงานหลังกำแพงเรื่อง", "Outside counsel works behind the matter wall"),
    do: P("เปิดคำสั่งที่ยังเปิด หรือชุดคณะกรรมการล่าสุด", "Open the live instruction or the latest board pack"),
    rule: P("ที่ปรึกษาภายนอกไม่เห็นเรื่องอื่น", "Outside counsel does not see other matters"),
  },
  "command/board": {
    why: P("รายงานคณะกรรมการชี้หลักฐาน ไม่ใช่ความเห็นลอย", "Board reports cite evidence, not free-floating opinion"),
    do: P("เปิดหน้าเดียว แล้วไล่ทุกตัวเลขกลับไปแหล่ง", "Open the one-pager and trace every number to a source"),
    rule: P("ตัวเลขคณะกรรมการที่ไม่มีแหล่งไม่ใช่รายงาน", "A board number without a source is not a report"),
  },
  "help/trust": {
    why: P("ความเชื่อถือที่มองเห็น — สิ่งที่เครื่องยนต์ทำและไม่ทำ", "Visible trust — what the engine will and will not do"),
    do: P("อ่านคำสัญญา แล้วเปิดคลังเพลย์บุ๊ก", "Read the promises, then open the playbook library"),
    rule: P("ไม่มี redline สุดท้ายโดยไม่มีทนายตรวจ — เครื่องยนต์ไม่ลงนามแทน", "No final redlines without professional review — the engine never signs"),
  },
};

export function playbookKeyFor(mode: string, matter?: string): PlaybookKey {
  if (mode === "assist") return "router";
  if (mode === "help") return "help";
  if (mode === "practice") return "practice";
  if (mode === "diligence") return "dd";
  if (mode === "obligations") return "control";
  if (mode === "intel") return "memory";
  if (mode === "command") return "command";
  if (mode === "assemble") return "assembly";
  if (mode === "negotiate") return "mandate";
  if (mode === "holistic") return "decision";
  if (mode === "review") return matter === "charoen" ? "dd" : "itcloud";
  return "itcloud";
}

export function playbookOf(mode: string, matter?: string): PlaybookDef {
  return PLAYBOOKS[playbookKeyFor(mode, matter)];
}

export function isPlaybookKey(v: string | null | undefined): v is PlaybookKey {
  return !!v && v in PLAYBOOKS;
}

export function playbookEntries(): { key: PlaybookKey; book: PlaybookDef }[] {
  return (Object.keys(PLAYBOOKS) as PlaybookKey[]).map((key) => ({ key, book: PLAYBOOKS[key] }));
}

export function helpBookHref(key: PlaybookKey) {
  return `/help?s=book&b=${key}`;
}

export function modeFromHref(href: string): { mode: string; screen: string } {
  const [path, query] = href.split("?");
  const mode = (path || "/home").replace(/^\//, "").split("/")[0] || "home";
  const screen = new URLSearchParams(query || "").get("s") || (isMode(mode) ? NAV[mode][0][0] : "home");
  return { mode, screen };
}

export function screenGuide(mode: string, screen: string) {
  return SCREEN_GUIDES[`${mode}/${screen}`] || {
    why: MODULE_GUIDES[mode as Exclude<ModeKey, "home">]?.purpose || P("โมดูลนี้", "This module"),
    do: P("ใช้เมนูด้านบนเพื่อเดินในโมดูล", "Use the menus above to walk this module"),
    rule: playbookOf(mode).rules[0],
  };
}

export function copyTE(lang: Lang, x: TE) {
  return lang === "th" ? x.t : x.e;
}

export function moduleFlowSteps(mode: string) {
  if (!isMode(mode)) return [];
  return NAV[mode].map(([k, t, e]) => ({ k, t, e }));
}

export const OS_FLOW: { k: Exclude<ModeKey, "home">; en: string; th: string }[] = [
  { k: "command", en: "Control", th: "ควบคุม" },
  { k: "practice", en: "Firm", th: "สำนักงาน" },
  { k: "review", en: "X-Ray", th: "X-Ray" },
  { k: "holistic", en: "Cockpit", th: "ห้องบังคับ" },
  { k: "intel", en: "Twin", th: "ฝาแฝด" },
  { k: "diligence", en: "Deal X-Ray", th: "Deal X-Ray" },
  { k: "negotiate", en: "Copilot", th: "เจรจา" },
  { k: "obligations", en: "Obligations", th: "ข้อผูกพัน" },
  { k: "assemble", en: "Assemble", th: "ประกอบ" },
];
