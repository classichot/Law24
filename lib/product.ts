import type { TE } from "./model";

const P = (t: string, e: string): TE => ({ t, e });

export const POSITION = {
  name: "LAW24",
  line: P(
    "ระบบปฏิบัติการกฎหมาย AI สำหรับธุรกิจไทย",
    "The AI Legal Operating System for Thai Business"
  ),
  promise: P(
    "เปลี่ยนสัญญาเป็นการตัดสินใจ การกระทำ การอนุมัติ และความรู้ขององค์กร",
    "Turn contracts into decisions, actions, approvals, and institutional knowledge."
  ),
  hook: P("รู้ก่อนลงนาม", "Know what you are signing."),
  hookLede: P(
    "อัปโหลดสัญญาไทยหรืออังกฤษ แล้วเปลี่ยนเป็นความเสี่ยง การตัดสินใจ redline และการกระทำ",
    "Upload a Thai or English agreement and turn it into risks, decisions, redlines and actions."
  ),
};

export const ENTRANCES = {
  firm: {
    k: P("LAW24 Firm", "LAW24 Firm"),
    fear: P("สำนักงานกลัวว่า AI จะลดชั่วโมงเรียกเก็บ", "Law firms fear AI will reduce billable hours."),
    pitch: P("ใช้ LAW24 เพื่อสร้างรายได้กฎหมายแบบต่อเนื่อง", "Use LAW24 to create new recurring legal revenue."),
    help: P("ช่วยสำนักงานท้องถิ่นรับลูกค้าได้มากขึ้นอย่างมีกำไร", "Helps local law firms serve more clients profitably"),
    points: [
      P("พอร์ทัลลูกค้าภายใต้แบรนด์สำนักงาน", "White-label client portal"),
      P("บรรทัดฐานและเพลย์บุ๊กของสำนักงาน", "Firm precedents and playbooks"),
      P("บริหารเรื่องและใบเสนอค่าธรรมเนียม", "Matter management and fee proposals"),
      P("รายงานลูกค้าภายใต้แบรนด์สำนักงาน", "Branded client reports"),
    ],
  },
  corporate: {
    k: P("LAW24 Corporate", "LAW24 Corporate"),
    fear: P("องค์กรกลัวว่า AI จะให้คำแนะนำกฎหมายที่ไม่น่าเชื่อถือ", "Corporates fear AI will give unreliable legal advice."),
    pitch: P("ให้ฝ่ายบริหารควบคุมสัญญาและความเสี่ยงทางกฎหมาย", "Gives management control over contracts and legal risks"),
    help: P("ศูนย์บัญชาการกฎหมายของทั้งบริษัท", "Company-wide legal command center"),
    points: [
      P("นโยบายบริษัทและกฎอนุมัติ", "Corporate policies and approval rules"),
      P("คำขอกฎหมายและบริหารที่ปรึกษาภายนอก", "Legal requests and outside-counsel management"),
      P("รายงานผู้บริหารและคณะกรรมการ", "Management and board reports"),
      P("ฝาแฝดกฎหมายที่อัปเดตต่อเนื่อง", "A living legal twin of the company"),
    ],
  },
};

export const TRUST_STRIP = [
  P("เอกสารคุณไม่ถูกใช้ฝึกโมเดลสาธารณะ", "Your documents are not used to train public models"),
  P("ทนายอนุมัติก่อนคำแนะนำสุดท้าย", "Lawyer approval before final advice"),
  P("ทุกข้อสรุปชี้ข้อสัญญา หน้า และแหล่งกฎหมาย", "Every finding cites clause, page and legal source"),
  P("กำแพงข้อมูลลูกค้า/เรื่อง", "Client/matter information barriers"),
];

export const TRUST_CONTROLS = [
  { k: P("ไม่ฝึกโมเดลสาธารณะ", "No public-model training"), v: P("เปิด — เอกสารอยู่เฉพาะเทนแนนท์นี้", "On — documents stay in this tenant") },
  { k: P("ที่เก็บข้อมูล", "Data residency"), v: P("ไทย · ตัวเลือกคลาวด์ส่วนตัว", "Thailand · private-cloud option") },
  { k: P("การเข้ารหัส", "Encryption"), v: P("ขณะส่งและขณะเก็บ", "In transit and at rest") },
  { k: P("กำแพงลูกค้า/เรื่อง", "Client/matter walls"), v: P("บังคับตามเรื่องที่เปิด", "Enforced on the open matter") },
  { k: P("สิทธิตามบทบาท", "Role-based permissions"), v: P("GC · DPO · จัดซื้อ · คณะกรรมการ", "GC · DPO · Procurement · Board") },
  { k: P("บันทึก AI และมนุษย์", "AI and human activity logs"), v: P("ครบทุกเอาต์พุต", "On every output") },
  { k: P("การเก็บเอกสาร", "Document retention"), v: P("นโยบายบริษัท · ลบได้", "Company policy · deletable") },
  { k: P("หลักฐานย้อนได้", "Source traceability"), v: P("ข้อสัญญา · หน้า · เพลย์บุ๊ก · กฎหมาย", "Clause · page · playbook · statute") },
  { k: P("ทนายอนุมัติก่อนส่ง", "Lawyer gate before advice"), v: P("บังคับ — เครื่องยนต์ไม่ลงนาม", "Mandatory — the engine never signs") },
  { k: P("รุ่นโมเดล", "Model / version record"), v: P("Nimbus-review · LAW24 2026.8", "Nimbus-review · LAW24 2026.8") },
  { k: P("คลาวด์ส่วนตัว", "Private cloud / single-tenant"), v: P("พร้อมสำหรับลูกค้าขนาดใหญ่", "Available for larger clients") },
];

export const XRAY = {
  doc: P("สัญญาบริการซอฟต์แวร์นิมบัส คลาวด์", "Nimbus Cloud SaaS agreement"),
  ref: "CT-291",
  pages: 47,
  langs: P("ไทย–อังกฤษ", "Thai–English"),
  mappedIn: P("2 นาที 14 วินาที", "2 min 14 sec"),
  verdict: "negotiate" as const,
  verdictLabel: P("เจรจา", "Negotiate"),
  verdictWhy: P(
    "ฉบับคู่สัญญาเอียงผู้ให้บริการอย่างมีนัยสำคัญ สี่ข้อต้องได้ยังเปิด — ห้ามลงนามจนกว่าจะปิด",
    "Counterparty paper is materially provider-favouring. Four must-haves remain open — do not sign until they close."
  ),
  heatmap: [
    { cl: "3", k: P("อายุสัญญา", "Term"), sev: "med", pct: 42 },
    { cl: "4", k: P("ราคา", "Fees"), sev: "med", pct: 48 },
    { cl: "7", k: P("SLA", "SLA"), sev: "high", pct: 72 },
    { cl: "9", k: P("ข้อมูล / PDPA", "Data / PDPA"), sev: "high", pct: 88 },
    { cl: "11", k: P("การเลิก", "Termination"), sev: "high", pct: 81 },
    { cl: "12", k: P("ความรับผิด", "Liability"), sev: "high", pct: 96 },
    { cl: "15", k: P("ความลับ", "Confidentiality"), sev: "low", pct: 18 },
    { cl: "18", k: P("กฎหมายที่ใช้", "Governing law"), sev: "med", pct: 35 },
  ],
  missing: [
    { k: P("มาตรการโอนข้ามแดน PDPA ม.28", "PDPA s.28 transfer safeguards"), src: P("เพลย์บุ๊ก IT & Cloud v4.2", "IT & Cloud playbook v4.2") },
    { k: P("รายชื่อผู้ประมวลผลช่วง", "Sub-processor list"), src: P("เพลย์บุ๊ก IT & Cloud v4.2", "IT & Cloud playbook v4.2") },
    { k: P("ช่วยเหลือการเปลี่ยนผ่าน 6 เดือน", "6-month exit assistance"), src: P("เพลย์บุ๊กตัดสินใจ v2.1", "Decision playbook v2.1") },
    { k: P("ภาคผนวก A–C ที่อ้างถึง", "Incorporated annexes A–C"), src: P("ข้อ 1.4 หน้า 3", "cl.1.4 p.3") },
  ],
  unusual: [
    {
      k: P("ความรับผิดจากข้อมูลไม่มีเพดาน", "Uncapped data-breach liability"),
      vs: P("ด้อยกว่าสัญญาผู้ขายที่อนุมัติแล้ว 82%", "Materially less favourable than 82% of approved vendor contracts"),
      src: P("ข้อ 12.4 หน้า 31", "cl.12.4 p.31"),
    },
    {
      k: P("ผู้ให้บริการเลิกตามสะดวก 30 วัน", "Provider convenience termination on 30 days"),
      vs: P("บ้านห้ามสิทธิเลิกฝ่ายเดียว", "House rule: no one-sided convenience exit"),
      src: P("ข้อ 11.2 หน้า 27", "cl.11.2 p.27"),
    },
  ],
  money: [
    { k: P("มูลค่าสัญญา", "Contract value"), v: "THB 24.6M / 36 mo" },
    { k: P("เพดานทั่วไป", "Ordinary cap"), v: P("12 เดือนค่าบริการ ≈ ฿8.2 ล้าน", "12 months of fees ≈ THB 8.2M") },
    { k: P("ข้อเรียกร้องข้อมูล", "Data claims"), v: P("ไม่มีเพดาน", "Uncapped") },
    { k: P("ขั้นต่ำที่ต้องจ่ายแม้คู่เลิก", "Minimum even if they exit"), v: P("36 เดือนเต็ม", "Full 36 months") },
  ],
  dates: [
    { k: P("วันเริ่ม", "Start"), v: "1 Oct 2026", src: P("ข้อ 3.1 หน้า 8", "cl.3.1 p.8") },
    { k: P("บอกกล่าวต่ออายุ", "Renewal notice"), v: "1 Aug 2029", src: P("ข้อ 3.2 หน้า 8", "cl.3.2 p.8") },
    { k: P("ลบข้อมูล", "Data deletion"), v: P("30 วันหลังสิ้นสุด — ขัดข้อ 6.2", "30 days post-term — conflicts with cl.6.2"), src: P("ข้อ 9.7 หน้า 22", "cl.9.7 p.22") },
  ],
  parties: [
    { k: P("คู่สัญญา", "Parties"), v: P("สยามดิจิทัล จำกัด / Nimbus Cloud Pte. Ltd.", "Siam Digital Co., Ltd. / Nimbus Cloud Pte. Ltd.") },
    { k: P("ค้ำประกัน", "Guarantees"), v: P("ไม่มี — บริษัทแม่สิงคโปร์ไม่ค้ำ", "None — Singapore parent does not guarantee") },
    { k: P("สิทธิเลิก", "Termination rights"), v: P("เราเลิกได้เมื่อผิดสัญญาเท่านั้น", "We terminate for cause only") },
    { k: P("เงื่อนไขชำระ", "Payment"), v: P("รายไตรมาสล่วงหน้า USD แปลง THB ไม่มีข้อ FX", "Quarterly in advance, USD invoiced in THB, no FX clause") },
  ],
  laws: [
    { k: P("พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 ม.28", "PDPA B.E. 2562 s.28"), src: P("ข้อ 9.1 หน้า 19", "cl.9.1 p.19") },
    { k: P("ประมวลกฎหมายแพ่งและพาณิชย์ มาตรา 383", "CCC s.383"), src: P("ข้อ 12 หน้า 30", "cl.12 p.30") },
    { k: P("พ.ร.บ.ว่าด้วยธุรกรรมทางอิเล็กทรอนิกส์", "Electronic Transactions Act"), src: P("ข้อ 19 หน้า 41", "cl.19 p.41") },
  ],
  layers: [
    { k: P("ข้อเท็จจริง", "Fact"), v: P("ข้อ 12.4 ยกเว้นข้อเรียกร้องข้อมูลออกจากเพดาน 12 เดือน", "cl.12.4 carves data claims out of the 12-month cap") },
    { k: P("การตีความ", "Legal interpretation"), v: P("เพดานบ้าน 2 เท่าไม่ครอบคลุมข้อมูลรั่ว — ความเสี่ยงเปิดไม่มีขีด", "House 2× cap does not cover breach — exposure is open-ended") },
    { k: P("การกระทำที่แนะนำ", "Suggested action"), v: P("แก้เข้าชุด: เพดาน 2 เท่า รวมข้อเรียกร้องข้อมูล — ทนายเป็นผู้ลงนามในท่าที", "Amend: 2× cap including data claims — counsel owns the posture") },
  ],
  redlines: [
    { cl: "12.4", text: P("เพดานรวมสองเท่าของค่าบริการสิบสองเดือน รวมข้อเรียกร้องเกี่ยวกับข้อมูลส่วนบุคคล", "Aggregate cap of two times twelve months of fees, including personal-data claims") },
    { cl: "11.2", text: P("ตัดสิทธิเลิกตามสะดวก หรือทำให้สมมาตรและมีช่วยเหลือเปลี่ยนผ่านหกเดือน", "Delete convenience termination or make it symmetric with six-month exit assistance") },
  ],
  ladder: [
    { n: "1", k: P("จุดยืนที่ต้องการ", "Preferred"), v: P("เพดาน 2 เท่า รวมข้อมูล · เลิกสมมาตร · DPA+SCC ก่อนวันเริ่ม", "2× cap including data · symmetric exit · DPA+SCCs before go-live") },
    { n: "2", k: P("ประนีประนอมได้", "Acceptable"), v: P("เพดาน 2 เท่า รวมข้อมูล · พวกเขาเลิกได้ถ้าช่วยเหลือ 6 เดือน", "2× including data · they may exit if 6-month assistance is in") },
    { n: "3", k: P("จุดต่ำสุด", "Minimum"), v: P("ข้อมูลอยู่ในเพดาน · DPA ลงนามก่อนประมวลผล", "Data inside the cap · DPA signed before processing") },
    { n: "4", k: P("เดินออก", "Walk-away"), v: P("ข้อมูลนอกเพดาน หรือไม่มี DPA", "Data outside the cap, or no DPA") },
  ],
  brief: P(
    "จัดหาระบบหลักจาก Nimbus Cloud ฿24.6 ล้าน / 36 เดือน ฉบับคู่สัญญา เอียงผู้ให้บริการ คำแนะนำ: เจรจาใหม่ — ไม่ลงนามจนกว่าสี่ข้อต้องได้จะปิด (เพดานข้อมูล, DPA/SCC, สิทธิเลิกสมมาตร, ภาคผนวก).",
    "Core platform from Nimbus Cloud, THB 24.6M / 36 months. Counterparty paper, provider-favouring. Recommendation: Negotiate — no signature until four must-haves close (data cap, DPA/SCCs, symmetric exit, annexes)."
  ),
  email: P(
    "เรียน คุณ…\n\nเราตรวจฉบับ Nimbus แล้ว ไม่สามารถลงนามในสภาพปัจจุบันได้ ประเด็นหลักคือเพดานความรับผิดที่ไม่ครอบคลุมข้อมูล (ข้อ 12.4) และการโอนข้ามแดนที่ยังไม่มีมาตรการตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล ม.28\n\nข้อแก้ไขที่เสนอแนบมาแล้ว ขอรอบเจรจาภายในวันที่ 5 ก.ย. 2569\n\nด้วยความนับถือ",
    "Dear …\n\nWe have reviewed the Nimbus paper and cannot sign it as drafted. The material points are the data-claims carve-out from the liability cap (cl.12.4) and cross-border transfer without PDPA s.28 safeguards.\n\nProposed wording is attached. We request a round by 5 Sep 2026.\n\nYours"
  ),
};

export const COCKPIT = {
  value: "THB 24.6M",
  stage: P("เจรจารอบ 2", "Negotiation round 2"),
  risk: P("สูง", "High"),
  owner: P("ปรีชา โรจนา · GC", "P. Rojana · GC"),
  approvals: P("GC แล้ว · CIO แล้ว · DPO ค้าง", "GC done · CIO done · DPO pending"),
  nego: P("4 ข้อต้องได้ยังเปิด", "4 must-haves still open"),
  obligations: P("ยังไม่ลงนาม — ปฏิทินยังไม่เปิด", "Not signed — calendar not live"),
  deadline: P("บอกกล่าวอาคาร 6 วัน (เรื่องอื่นในพอร์ต)", "Facilities notice in 6 days (separate live matter)"),
  related: [
    P("DPA — ยังไม่ลงนาม", "DPA — unsigned"),
    P("ภาคผนวก A–C — ไม่แนบ", "Annexes A–C — missing"),
    P("สัญญาบริหารอาคาร — หน้าต่างบอกกล่าว", "Facilities MSA — notice window"),
  ],
};

export const DNA = {
  clause: P("ข้อจำกัดความรับผิด ข้อ 12.4", "Limitation of liability cl.12.4"),
  quote: P(
    "ข้อจำกัดความรับผิดนี้ด้อยกว่าสัญญาผู้ขายที่อนุมัติแล้วของท่าน 82%",
    "This limitation-of-liability clause is materially less favourable than 82% of your approved vendor contracts."
  ),
  vs: [
    { k: P("ถ้อยคำที่สำนักงานต้องการ", "Firm preferred wording"), v: P("เพดาน 2 เท่า รวมข้อมูล", "2× cap including data") },
    { k: P("เพลย์บุ๊กองค์กร", "Corporate playbook"), v: P("IT & Cloud v4.2 — ข้อมูลอยู่ในเพดาน", "IT & Cloud v4.2 — data inside the cap") },
    { k: P("สัญญาที่ลงนามแล้ว", "Previous signed agreements"), v: P("ผู้ขาย 47 ราย · 38 รายข้อมูลอยู่ในเพดาน", "47 vendors · 38 keep data inside the cap") },
    { k: P("มาตรฐานตลาด", "Market-standard"), v: P("SEA SaaS 2026 · เพดาน 12 เดือน ไม่ยกเว้นข้อมูล", "SEA SaaS 2026 · 12-month cap, data not carved out") },
    { k: P("ผลเจรจาครั้งก่อน", "Previous negotiation outcomes"), v: P("รอบที่แล้ว Nimbus ยอมเพดานถ้าแลกอ้างอิงลูกค้า", "Last round Nimbus accepted a cap if reference rights moved") },
  ],
};

export const TWIN_ASKS = [
  {
    q: P("ถ้าเราเลิกผู้จัดจำหน่าย A จะเกิดอะไร", "What happens if we terminate Distributor A?"),
    a: P("สัญญา CL-A-19 มีขั้นต่ำ ฿18 ล้านที่ยังอยู่รอด 18 เดือน และข้อห้ามแข่งขัน 12 เดือนในเขตกรุงเทพฯ", "CL-A-19 leaves a THB 18M minimum for 18 months and a 12-month non-compete in Bangkok."),
    src: P("CL-A-19 ข้อ 11 · หน้า 14", "CL-A-19 cl.11 · p.14"),
  },
  {
    q: P("สัญญาใดกระทบถ้าบริษัท B เปลี่ยนอำนาจควบคุม", "Which contracts are affected if Company B changes ownership?"),
    a: P("4 ฉบับมีข้อเปลี่ยนอำนาจควบคุม — สินเชื่อธนาคารกรุงเทพ ฿640 ล้านผิดนัดอัตโนมัติ", "Four instruments have CoC — the Bangkok Bank facility of THB 640M defaults automatically."),
    src: P("DK-01 · สินเชื่อ BBL ข้อ 8.2", "DK-01 · BBL facility cl.8.2"),
  },
  {
    q: P("ข้อผูกพันใดเกิน 10 ล้านบาท", "What obligations exceed THB 10 million?"),
    a: P("12 รายการ — ส่วนใหญ่เป็นขั้นต่ำผู้ขายและค้ำประกันบริษัทแม่", "12 items — mostly vendor minimums and parent guarantees."),
    src: P("ทะเบียนข้อผูกพัน · กรอง ≥ ฿10M", "Obligation register · filter ≥ THB 10M"),
  },
  {
    q: P("สัญญาใดมีความรับผิดไม่จำกัด", "Which contracts contain unlimited liability?"),
    a: P("212 ฉบับที่ยังใช้บังคับ — นิมบัส CT-291 เป็นฉบับที่กำลังเจรจา", "212 in-force instruments — Nimbus CT-291 is the live negotiation."),
    src: P("กราฟความรู้ · โหนด Uncapped", "Knowledge graph · Uncapped node"),
  },
];

export const TWIN_LAYERS = [
  P("สัญญาที่ใช้บังคับ", "Active contracts"),
  P("ข้อผูกพัน", "Obligations"),
  P("ค้ำประกัน", "Guarantees"),
  P("คดี", "Litigation"),
  P("ใบอนุญาต", "Licences"),
  P("การยื่นบริษัท", "Corporate filings"),
  P("ความเสี่ยงแรงงาน", "Employment exposure"),
  P("หน้าที่คุ้มครองข้อมูล", "Data-protection obligations"),
  P("สัญญาบุคคลเกี่ยวโยง", "Related-party agreements"),
  P("ข้อเปลี่ยนอำนาจควบคุม", "Change-of-control provisions"),
  P("วันต่ออายุและเลิก", "Renewal and termination dates"),
];

export const WAR_ROOM = {
  stats: [
    { v: "3,418", k: P("ดัชนีเอกสาร", "Document index") },
    { v: "86", k: P("เอกสารที่ขาด", "Missing documents") },
    { v: "2", k: P("ประเด็นล้มดีล", "Deal-breakers") },
    { v: "41", k: P("คำถาม Q&A", "Q&A requests") },
  ],
  missing: [
    P("สัญญาผู้ถือหุ้นฉบับลงนาม 2019", "2019 signed SHA"),
    P("รายชื่อบุคคลเกี่ยวโยงครบชุด", "Complete related-party schedule"),
    P("กรมธรรม์ D&O ปัจจุบัน", "Current D&O policy"),
  ],
};

export const FIRM_BRAIN = [
  { k: P("บรรทัดฐาน", "Precedents"), n: "184", d: P("ร่างที่ชนะและที่เดินออก", "Winning drafts and walk-aways"), href: "/intel?s=memory" },
  { k: P("คลังข้อสัญญา", "Clause library"), n: "612", d: P("ถ้อยคำหุ้นส่วนที่ล็อกแล้ว", "Locked partner wording"), href: "/assemble?s=lib" },
  { k: P("ความเห็นหุ้นส่วน", "Partner comments"), n: "91", d: P("ไม่ข้ามลูกค้า", "Never across clients"), href: "/intel?s=memory" },
  { k: P("จุดยืนเจรจา", "Negotiation positions"), n: "44", d: P("บันไดต่อประเภทสัญญา", "Ladders by contract type"), href: "/negotiate?s=nladder" },
  { k: P("บันทึกวิจัย", "Research memoranda"), n: "27", d: P("ผูกกับฐานกฎหมายไทย", "Tied to Thai authorities"), href: "/help?s=watch" },
  { k: P("เพลย์บุ๊กต่อลูกค้า", "Client-specific playbooks"), n: "3", d: P("สยามดิจิทัล · เจริญ · PTT", "Siam Digital · Charoen · PTT"), href: "/help?s=books" },
  { k: P("คำแนะนำในอดีต", "Past advice"), n: "156", d: P("อยู่หลังกำแพงเรื่อง", "Behind the matter wall"), href: "/intel?s=twin" },
  { k: P("แบบร่างที่สำเร็จ", "Successful drafting patterns"), n: "38", d: P("จูเนียร์ใช้ได้โดยไม่เปิดเรื่องอื่น", "Juniors can use without opening other matters"), href: "/assemble?s=type" },
];

export const CLIENT_ROOM = {
  client: P("สยามดิจิทัล จำกัด", "Siam Digital Co., Ltd."),
  risks: [
    { id: "R1", k: P("ความรับผิดจากข้อมูลไม่มีเพดาน", "Uncapped data-breach liability"), plain: P("ถ้าข้อมูลรั่ว คุณอาจถูกเรียกได้ไม่จำกัดจำนวน", "If data leaks, you can be claimed against with no ceiling."), rec: P("แก้เพดานให้ครอบคลุมข้อมูล", "Put data claims inside the cap") },
    { id: "R2", k: P("โอนข้อมูลไปสิงคโปร์/สหรัฐ", "Data transfer to SG/US"), plain: P("กฎหมายไทยยังต้องการมาตรการคุ้มครองก่อนส่งออก", "Thai law still needs safeguards before the data leaves."), rec: P("ลงนาม DPA และ SCC ก่อนวันเริ่ม", "Sign DPA and SCCs before go-live") },
    { id: "R3", k: P("พวกเขาเลิกได้ง่ายกว่าคุณ", "They can walk more easily than you"), plain: P("ผู้ให้บริการบอกกล่าว 30 วัน คุณเลิกได้เมื่อเขาผิดสัญญาเท่านั้น", "The provider exits on 30 days; you only exit for cause."), rec: P("ทำให้สิทธิเลิกสมมาตร", "Make termination rights symmetric") },
  ],
  questions: [
    P("ระบบนี้เป็นระบบหลักของบริษัทหรือไม่", "Is this a business-critical system?"),
    P("ยอมแลกสิทธิอ้างอิงลูกค้าเพื่อได้เพดานหรือไม่", "Will you trade reference-customer rights for the cap?"),
  ],
  cost: P("ค่าธรรมเนียมคงที่ ฿480,000 · ใช้ไปแล้ว 62%", "Fixed fee THB 480,000 · 62% consumed"),
  progress: P("ตรวจแล้ว · รอคุณอนุมัติคำแนะนำ", "Reviewed · waiting for your approval of recommendations"),
};

export const PACKAGES = [
  { id: "nda", k: P("ตรวจ NDA ด่วน", "NDA Review Express"), fee: "THB 12,000", cycle: P("24 ชม.", "24h") },
  { id: "emp", k: P("ตรวจสัญญาจ้าง", "Employment Contract Health Check"), fee: "THB 18,000", cycle: P("48 ชม.", "48h") },
  { id: "sme", k: P("ตรวจสุขภาพกฎหมาย SME", "SME Legal Health Check"), fee: "THB 45,000", cycle: P("5 วัน", "5 days") },
  { id: "mon", k: P("เฝ้าสัญญาประจำเดือน", "Monthly Contract Monitoring"), fee: "THB 25,000 / mo", cycle: P("รายเดือน", "Monthly") },
  { id: "ann", k: P("ทบทวนกำกับประจำปี", "Annual Corporate Compliance Review"), fee: "THB 180,000", cycle: P("รายปี", "Annual") },
  { id: "vnd", k: P("โต๊ะสัญญาผู้ขาย", "Vendor Contract Desk"), fee: "THB 35,000 / mo", cycle: P("รายเดือน", "Monthly") },
  { id: "dd", k: P("ชุดตรวจสอบสถานะ", "Legal Due Diligence Package"), fee: "from THB 350,000", cycle: P("ต่อดีล", "Per deal") },
  { id: "gc", k: P("ที่ปรึกษากฎหมายเศษส่วน", "Fractional General Counsel"), fee: "THB 80,000 / mo", cycle: P("สมาชิก", "Subscription") },
];

export const COMMAND = {
  requests: [
    { id: "LR-104", k: P("ตรวจสัญญาผู้ขายคลังสินค้า", "Warehouse vendor review"), by: "Procurement", st: "open", href: "/review?s=xray" },
    { id: "LR-105", k: P("อนุมัติ DPA นิมบัส", "Approve Nimbus DPA"), by: "DPO", st: "progress", href: "/assemble?s=draft" },
    { id: "LR-106", k: P("หนังสือบอกกล่าวอาคาร", "Facilities notice letter"), by: "Ops", st: "open", href: "/obligations?s=oalert" },
  ],
  approvals: [
    { k: P("DPO — นิมบัส CT-291", "DPO — Nimbus CT-291"), st: P("ค้าง", "Pending") },
    { k: P("CFO — เพดานข้อมูล", "CFO — data cap"), st: P("รอ GC", "Waiting on GC") },
  ],
  counsel: [
    { k: P("7L Advisory", "7L Advisory"), v: P("นิมบัส · ตรวจและเจรจา · ฿480,000", "Nimbus · review & negotiate · THB 480,000") },
    { k: P("ที่ปรึกษาภาษีภายนอก", "External tax counsel"), v: P("ยังไม่เปิดงาน", "Not instructed") },
  ],
  board: [
    { k: P("สรุปผู้บริหารหนึ่งหน้า", "One-page management brief"), href: "/review?s=xray" },
    { k: P("ประเด็นล้มดีล DD", "DD deal-breakers"), href: "/diligence?s=dflags" },
    { k: P("ข้อผูกพันที่เลยกำหนด", "Overdue obligations"), href: "/obligations?s=oalert" },
  ],
};

export const WEDGE_TYPES = [
  P("NDA", "NDAs"),
  P("จ้างงาน", "Employment"),
  P("จัดซื้อ / ผู้ขาย", "Procurement / vendor"),
  P("ซื้อขายสินค้าบริการ", "Sale of goods / services"),
  P("เช่า", "Leases"),
  P("กู้ยืม", "Loan agreements"),
];
