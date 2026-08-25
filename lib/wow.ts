import type { TE } from "./model";

const P = (t: string, e: string): TE => ({ t, e });

export const BOARD = [
  { k: P("ผู้ตรวจกฎหมายสัญญา", "Contract-law reviewer"), v: P("ไม่ผ่าน", "Fail"), note: P("เพดานข้อมูลไม่มี · สิทธิเลิกไม่สมมาตร · ภาคผนวกไม่แนบ", "Uncapped data · asymmetric exit · missing annexes"), vote: "fail" },
  { k: P("ผู้ตรวจความเสี่ยงเชิงพาณิชย์", "Commercial-risk reviewer"), v: P("ไม่ผ่าน", "Fail"), note: P("ปรับราคาไม่จำกัด · ผูกพันขั้นต่ำฝ่ายเดียว · SLA เยียวยาเดียว", "Uncapped uplift · one-sided commitment · exclusive SLA remedy"), vote: "fail" },
  { k: P("ผู้ตรวจการปฏิบัติตามกฎ", "Compliance reviewer"), v: P("ไม่ผ่าน", "Fail"), note: P("โอนข้ามแดนไม่มี ม.28 · ไม่มีรายชื่อผู้ประมวลผลช่วง", "No s.28 safeguards · no sub-processor list"), vote: "fail" },
  { k: P("ผู้ตรวจภาษีและการเงิน", "Tax & financial reviewer"), v: P("มีเงื่อนไข", "Conditional"), note: P("ค่าบริการ USD ใบแจ้งหนี้ THB ไม่มีข้ออัตราแลกเปลี่ยน", "Fees USD, invoices THB, no FX clause"), vote: "hold" },
  { k: P("ผู้ตรวจเชิงปฏิบัติการ", "Operational reviewer"), v: P("มีเงื่อนไข", "Conditional"), note: P("ระบบสำคัญแต่ไม่มี escrow และแผนเปลี่ยนผ่าน", "Business-critical with no escrow or transition plan"), vote: "hold" },
  { k: P("นักกลยุทธ์การเจรจา", "Negotiation strategist"), v: P("เจรจาใหม่", "Renegotiate"), note: P("ยืน 4 ข้อต้องได้ แลกสิทธิลูกค้าอ้างอิงกับเพดานราคา", "Hold 4 must-haves; trade reference rights for price cap"), vote: "reneg" },
  { k: P("ผู้ตรวจคุณภาพ", "Quality-control verifier"), v: P("ตรวจแล้ว", "Verified"), note: P("อ้างอิงครบทุกข้อค้นพบ ความเชื่อมั่นต่ำ 2 ข้อส่งทนาย", "Every finding cited; 2 low-confidence items routed to counsel"), vote: "ok" },
];

export const SIMULATE = [
  {
    q: P("ถ้าส่งมอบล่าช้า 30 วันจะเกิดอะไร", "What happens if delivery is delayed by 30 days?"),
    legal: P("SLA 99.5% วัดรายไตรมาส เครดิตสูงสุด 10% เป็นเยียวยาเพียงทางเดียว ไม่มีสิทธิเลิกจากความล้มเหลวต่อเนื่อง", "SLA 99.5% measured quarterly; credits capped at 10% are the exclusive remedy. No chronic-failure exit."),
    money: P("เครดิตสูงสุดประมาณ ฿68,000 ต่อเดือน ไม่ครอบคลุมความเสียหายทางธุรกิจ", "Credits max ~THB 68k/month; no other damages."),
    ops: P("ระบบหลักหยุดได้โดยไม่มี escrow และไม่มีข้อช่วยเหลือเปลี่ยนผ่าน", "Core system can fail with no escrow and no exit assistance."),
    chain: ["7.1 SLA", "7.4 Credits", "7.5 Exclusive remedy", "11 Termination"],
  },
  {
    q: P("ความเสี่ยงสูงสุดของเราคือเท่าใด", "What is our maximum exposure?"),
    legal: P("เพดาน 12 เดือนไม่ครอบคลุมข้อเรียกร้องข้อมูล การชดใช้อยู่นอกเพดาน", "12-month cap does not cover data claims; indemnity sits outside the cap."),
    money: P("ค่าบริการ ฿8.2 ล้าน/ปี แต่ข้อมูลรั่วไหลไม่มีเพดาน", "Fees THB 8.2M/yr; data-breach liability uncapped."),
    ops: P("ผู้ให้บริการควบคุมสภาพแวดล้อม ฝ่ายเราเป็นผู้ควบคุมข้อมูลตาม PDPA", "Provider controls the environment; we remain PDPA controller."),
    chain: ["12.1 Indemnity", "12.4 Cap carve-out", "9.1 Data"],
  },
  {
    q: P("ลูกค้าเลิกได้โดยไม่ต้องชำระหรือไม่", "Can the customer terminate without paying?"),
    legal: P("เราเลิกได้เมื่อผิดสัญญาเท่านั้น ผู้ให้บริการเลิกได้ 30 วัน ข้อผูกพันขั้นต่ำยังอยู่", "We terminate for cause only; provider exits on 30 days; minimum commitment survives."),
    money: P("ค่าบริการขั้นต่ำครบ 36 เดือนยังเรียกเก็บได้แม้ผู้ให้บริการเลิกตามสะดวก", "36-month minimum spend remains payable even if the provider exits for convenience."),
    ops: P("ไม่มีข้อช่วยเหลือการเปลี่ยนผ่าน 6 เดือนตาม playbook", "No 6-month exit assistance required by playbook."),
    chain: ["3 Term", "4.3 Minimum", "11.2 Convenience"],
  },
  {
    q: P("ข้อผูกพันใดอยู่รอดหลังสิ้นสุดสัญญา", "Which obligations survive termination?"),
    legal: P("ความลับ 3 ปี IP ของผู้ให้บริการ ข้อมูลต้องลบใน 30 วัน แต่ข้อ 6.2 ให้เก็บ 7 ปี — ขัดกัน", "Confidentiality 3 years; provider IP; deletion in 30 days vs 7-year retention in 6.2 — conflict."),
    money: P("ไม่มีข้อชำระหลังสิ้นสุดยกเว้นค่าบริการค้าง", "No post-term fees except accrued amounts."),
    ops: P("การลบข้อมูลขัดกับหน้าที่เก็บเอกสารทางบัญชี", "Deletion conflicts with accounting retention."),
    chain: ["6.2 Retention", "9.7 Deletion", "10 IP", "15 Confidentiality"],
  },
];

export const BILINGUAL = [
  {
    th: "ความรับผิดรวมของแต่ละฝ่ายไม่เกินค่าบริการสิบสองเดือน เว้นแต่ข้อเรียกร้องเกี่ยวกับข้อมูลส่วนบุคคล",
    en: "Each party's aggregate liability shall not exceed twelve months of fees, except for claims relating to personal data.",
    drift: P("อังกฤษใช้ except for ซึ่งยกเว้นออกจากเพดาน ไทยอ่านได้ทั้งยกเว้นหรือแยกต่างหาก — ความหมายทางกฎหมายไม่ตรงกัน", "English carves data out of the cap; Thai can be read either as an exception or a separate head. Legal meaning diverges."),
    risk: "high",
  },
  {
    th: "ผู้ให้บริการอาจบอกเลิกสัญญาได้โดยบอกกล่าวล่วงหน้าสามสิบวัน",
    en: "The Provider may terminate this Agreement on thirty days' written notice.",
    drift: P("ตรงกัน — สิทธิเลิกตามสะดวกฝ่ายผู้ให้บริการ", "Aligned — provider convenience right."),
    risk: "ok",
  },
  {
    th: "ลูกค้าเป็นผู้ควบคุมข้อมูลส่วนบุคคลตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562",
    en: "The Customer is the data controller under applicable privacy laws.",
    drift: P("ไทยระบุ พ.ร.บ. 2562 โดยตรง อังกฤษใช้ applicable privacy laws ซึ่งกว้างกว่าและอาจไม่ชี้ PDPA", "Thai cites PDPA B.E. 2562; English says applicable privacy laws and may not lock PDPA."),
    risk: "med",
  },
];

export const DIFF = [
  { c: "12.4", change: P("เพิ่มข้อยกเว้นข้อเรียกร้องด้านข้อมูลออกจากเพดาน", "Added data-claims carve-out to the cap"), rights: P("สิทธิเรียกร้องข้อมูลของเราไม่ถูกจำกัด", "Our data claims become uncapped"), who: P("คู่สัญญาได้เปรียบ", "Counterparty benefits"), risk: P("ความเสี่ยงเพิ่มขึ้นอย่างมีนัยสำคัญ", "Material risk increase"), appr: P("ต้องอนุมัติ GC + CFO", "GC + CFO approval required"), other: P("กระทบข้อ 12.1 การชดใช้", "Affects indemnity 12.1") },
  { c: "3.2", change: P("ขยายเวลาบอกเลิก 60→90 วัน", "Notice period 60→90 days"), rights: P("โอกาสต่ออายุโดยไม่ตั้งใจสูงขึ้น", "Higher unintended-renewal risk"), who: P("คู่สัญญาได้เปรียบ", "Counterparty benefits"), risk: P("เพิ่มขึ้นเล็กน้อย", "Slight increase"), appr: P("จัดซื้อรับได้ถ้าตั้งเตือน 120 วัน", "Procurement may accept with 120-day alert"), other: P("กระทบข้อ 4 ราคา", "Affects clause 4 pricing") },
  { c: "7.5", change: P("เพิ่ม sole and exclusive remedy", "Inserted sole and exclusive remedy"), rights: P("ตัดสิทธิเรียกค่าเสียหายอื่น", "Cuts all other remedies"), who: P("คู่สัญญาได้เปรียบ", "Counterparty benefits"), risk: P("เพิ่มขึ้น", "Risk up"), appr: P("Legal Ops — ใช้ข้อสำรอง", "Legal Ops — use fallback"), other: P("ทำลายเยียวยาของข้อรับประกัน 8.2", "Empties warranty 8.2") },
];

export const MEMO = {
  summary: P("จัดหาระบบ core platform จาก Nimbus Cloud Pte. Ltd. มูลค่า ฿24.6 ล้าน / 36 เดือน ฉบับคู่สัญญา เอียงไปผู้ให้บริการ", "Core platform sourcing from Nimbus Cloud Pte. Ltd., THB 24.6M / 36 months. Counterparty paper, provider-favouring."),
  risks: [
    P("ความรับผิดจากข้อมูลไม่มีเพดาน", "Uncapped data-breach liability"),
    P("โอนข้อมูล SG/US ไม่มีมาตรการ PDPA ม.28", "SG/US transfer without PDPA s.28 safeguards"),
    P("สิทธิเลิกสัญญาไม่สมมาตร", "Asymmetric termination"),
    P("ภาคผนวก A–C ที่อ้างถึงไม่แนบ", "Incorporated annexes A–C never delivered"),
  ],
  money: P("เพดานที่ใช้งานได้จริงคือค่าบริการ 12 เดือน ยกเว้นข้อมูลซึ่งไม่มีเพดาน ค่าพัฒนา ฿3.1 ล้านไม่ได้กรรมสิทธิ์", "Practical cap is 12 months of fees except uncapped data. THB 3.1M of funded development does not vest."),
  approvals: P("General Counsel + CFO สำหรับเพดานข้อมูล · DPO สำหรับ DPA/SCC · CIO สำหรับ escrow", "GC + CFO for data cap · DPO for DPA/SCCs · CIO for escrow"),
  decision: P("เจรจาใหม่ — ไม่ลงนามจนกว่าสี่ข้อต้องได้จะปิด", "Renegotiate — no signature until the four must-haves close"),
  conditions: [
    P("เพดาน 2 เท่า รวมข้อเรียกร้องข้อมูล", "2× cap including data claims"),
    P("DPA + SCC + รายชื่อผู้ประมวลผลช่วงก่อนวันเริ่ม", "DPA + SCCs + sub-processor list before go-live"),
    P("ตัดสิทธิเลิกตามสะดวก หรือทำให้สมมาตร + ช่วยเหลือ 6 เดือน", "Delete convenience termination or make it symmetric + 6-month assistance"),
    P("แนบภาคผนวก A–C และเพิ่ม escrow", "Attach annexes A–C and add escrow"),
  ],
};

export const MEMORY = [
  { clause: P("เพดานความรับผิด SaaS", "SaaS liability cap"), accepted: P("1.75 เท่า รวมข้อมูล หลังรอบ 2", "1.75× including data, after round 2"), rejected: P("12 เดือน + ยกเว้นข้อมูล", "12 months + data carve-out"), n: 9 },
  { clause: P("เพดานปรับราคา", "Price-uplift cap"), accepted: P("CPI หรือ 5%", "CPI or 5%"), rejected: P("ไม่จำกัด", "Uncapped"), n: 7 },
  { clause: P("กฎหมายที่ใช้บังคับ", "Governing law"), accepted: P("สิงคโปร์ + ข้อพิพาทข้อมูลใช้กฎหมายไทย", "Singapore + Thai law for data disputes"), rejected: P("ไทยทั้งฉบับ (คู่สัญญารายนี้ไม่เคยยอม)", "All-Thai (this counterparty never moves)"), n: 9 },
  { clause: P("escrow ซอร์สโค้ด", "Source-code escrow"), accepted: P("เมื่อระบุว่าระบบสำคัญ", "When system is stated as critical"), rejected: P("ไม่มี", "None"), n: 5 },
];

export const AUTOPILOT = {
  index: "3,418",
  missing: [
    P("Amendment No.2 สัญญาเซ็นทรัล รีเทล", "Amendment No.2 — Central Retail"),
    P("DPA ฉบับลงนามกับ Cloud", "Executed cloud DPA"),
    P("บอจ.5 ตรงกับภาคผนวก SPA", "Shareholder register matching SPA"),
    P("คำขอต่ออายุใบอนุญาตขนส่ง", "Transport licence renewal filing"),
  ],
  material: [
    P("สินเชื่อธนาคารกรุงเทพ ฿640 ล้าน", "Bangkok Bank facility THB 640M"),
    P("สัญญาบริการเซ็นทรัล รีเทล — รายได้ 22%", "Central Retail services — 22% of revenue"),
    P("ร่วมทุนเวียดนาม — สิทธิซื้อก่อน", "Vietnam JV — pre-emption"),
    P("สัญญาจ้าง CEO — CoC ฿18 ล้าน", "CEO ESA — CoC THB 18M"),
  ],
  qa: [
    P("ขอหนังสือยินยอมธนาคารกรุงเทพก่อนปิดดีล", "Request Bangkok Bank consent before closing"),
    P("ขอหนังสือสละสิทธิผู้ร่วมทุนเวียดนาม", "Request Vietnam JV pre-emption waiver"),
    P("ขอ DPA ฉบับลงนาม", "Request executed DPA"),
    P("ชี้แจงรายชื่อผู้ถือหุ้น 4.2%", "Clarify 4.2% shareholding mismatch"),
  ],
};
