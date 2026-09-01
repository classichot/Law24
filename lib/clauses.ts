import type { Lang } from "./model";
import type { TE } from "./model";

const P = (t: string, e: string): TE => ({ t, e });

export type ClauseAdjustMode = "manual" | "ai";

export type ClauseEdit = {
  mode: ClauseAdjustMode;
  body: TE;
  reason: string;
  instruction?: string;
  cites?: { label: string; href: string }[];
};

export type AiProposal = {
  body: TE;
  why: TE;
  cites: { label: string; href: string }[];
  blocked?: boolean;
};

const PB_ASM = { label: "PB-ASM", href: "/help?s=book&b=assembly" };
const PB_IT = { label: "PB-IT v4.2", href: "/help?s=book&b=itcloud" };
const PB_CTL = { label: "PB-CTL v1.4", href: "/help?s=book&b=control" };
const RG_01 = { label: "RG-01 PDPC", href: "/help?s=watch" };

function hay(heading: string, original: TE, instruction: string) {
  return `${heading} ${original.e} ${original.t} ${instruction}`.toLowerCase();
}

export function houseStandard(name: string): TE {
  const n = name.toLowerCase();
  if (n.includes("liability") || n.includes("ความรับผิด") || n.includes("เพดาน")) {
    return P(
      "ความรับผิดรวมของแต่ละฝ่ายไม่เกินสองเท่าของค่าบริการในรอบสิบสองเดือนก่อนเกิดเหตุ รวมข้อเรียกร้องข้อมูลส่วนบุคคล — ห้ามยกข้อมูลออกจากเพดาน",
      "Each party's aggregate liability shall not exceed two times the fees in the twelve months preceding the event, including personal-data claims — data shall not be carved out of the cap.",
    );
  }
  if (n.includes("data") || n.includes("pdpa") || n.includes("dpa") || n.includes("ข้อมูล") || n.includes("โอน")) {
    return P(
      "ลูกค้าเป็นผู้ควบคุม ผู้ให้บริการเป็นผู้ประมวลผล ต้องมี DPA รายชื่อผู้ประมวลผลช่วง และมาตรการตาม PDPA ม.28 ก่อนโอนออกนอกราชอาณาจักร ที่ตั้งประมวลผลต้องล็อกในสัมภาษณ์",
      "The Customer is controller and the Provider processor. A DPA, sub-processor list and PDPA s.28 safeguards must exist before any transfer out of the Kingdom. Processing location locks in the interview.",
    );
  }
  if (n.includes("sla") || n.includes("service level") || n.includes("ระดับ")) {
    return P(
      "ความพร้อมใช้งานไม่น้อยกว่าร้อยละ 99.9 ต่อเดือนปฏิทิน หากไม่เป็นไปตามระดับติดต่อกันสามเดือน ลูกค้าบอกเลิกได้โดยไม่ต้องรับผิด",
      "Availability of not less than 99.9% per calendar month. On three consecutive months of failure the Customer may terminate without liability.",
    );
  }
  if (n.includes("term") || n.includes("renew") || n.includes("ระยะเวลา") || n.includes("ต่ออายุ")) {
    return P(
      "อายุ 36 เดือน ต่อคราวละ 12 เดือน ต้องบอกกล่าวล่วงหน้าไม่น้อยกว่า 90 วัน เพดานปรับราคา CPI หรือร้อยละ 5 แล้วแต่จำนวนใดต่ำกว่า หน้าต่างบอกกล่าวต้องอยู่ในปฏิทินข้อผูกพัน",
      "A 36-month term renewing for 12 months, with not less than 90 days' written notice. Uplift shall not exceed CPI or 5%, whichever is lower. The notice window sits on the obligation calendar.",
    );
  }
  if (n.includes("law") || n.includes("governing") || n.includes("กฎหมาย") || n.includes("อนุญาโต")) {
    return P(
      "กฎหมายไทยเป็นท่าทีบ้าน อนุญาโตตุลาการต่างประเทศต้องมีเหตุในสัมภาษณ์ — ห้ามร่างลอย",
      "Thai law is the house position. Foreign arbitration needs a reason in the interview — no freehand draft.",
    );
  }
  if (n.includes("escrow") || n.includes("exit") || n.includes("เปลี่ยนผ่าน") || n.includes("เลิก")) {
    return P(
      "ผู้ให้บริการต้องช่วยเหลือการเปลี่ยนผ่านไม่น้อยกว่าหกเดือน และจัด escrow ซอร์สโค้ดเมื่อระบบถูกระบุว่าสำคัญ",
      "The Provider shall give not less than six months' exit assistance, and source-code escrow when the system is stated as critical.",
    );
  }
  if (n.includes("approv") || n.includes("authority") || n.includes("อำนาจ") || n.includes("อนุมัติ") || n.includes("ลงนาม")) {
    return P(
      "ผู้ลงนามต้องมีอำนาจตามหนังสือรับรองหรือมติที่ประชุมที่ยังไม่หมดอายุ เครื่องยนต์ไม่ลงนามแทน และไม่เดาอำนาจจากชื่อตำแหน่ง",
      "Signatories must have authority under a current affidavit or board resolution. The engine never signs, and it does not infer authority from a job title.",
    );
  }
  if (n.includes("fee") || n.includes("price") || n.includes("ค่าตอบแทน") || n.includes("ค่าบริการ") || n.includes("ค่าจ้าง") || n.includes("rent")) {
    return P(
      "ค่าตอบแทนและกำหนดชำระต้องตรงข้อมูลที่ทนายยืนยัน การปรับราคาต้องมีเพดานและบอกกล่าวล่วงหน้า ห้ามร่างตัวเลขลอย",
      "Fees and payment timing must match counsel-confirmed facts. Any uplift needs a cap and prior notice. No freehand figures.",
    );
  }
  return P(
    `ข้อมาตรฐานบ้านเรื่อง ${name} — ใช้กฎหมายไทยเป็นค่าเริ่ม ต้องมีเหตุจึงจะสละได้ และห้ามร่างลอย`,
    `House standard on ${name} — Thai law is the default, waiver needs a recorded reason, and no freehand draft.`,
  );
}

export function proposeAiClause(input: {
  heading: string;
  original: TE;
  instruction: string;
}): AiProposal {
  const t = hay(input.heading, input.original, input.instruction);
  const asksUncapped = /uncapped|ไม่จำกัด|carve.?out|ยกข้อมูลออก|no cap/.test(t);
  const asksForeign = /singapore law|english law|foreign arbitration|กฎหมายสิงคโปร์|อนุญาโตตุลาการต่างประเทศ/.test(t) && !/reason|เหตุ|waiver|ยกเว้น/.test(t);

  if (asksUncapped) {
    return {
      blocked: true,
      body: input.original,
      why: P(
        "เลโอไม่ย้ายเพดานออกจากเพลย์บุ๊ก IT & Cloud v4.2 — ข้อเรียกร้องข้อมูลต้องอยู่ในเพดานสองเท่า ทนายจะสละได้เมื่อมีเหตุในสัมภาษณ์",
        "Leio will not move the cap off IT & Cloud v4.2 — data claims stay inside a 2× cap. Counsel may waive only with a recorded reason.",
      ),
      cites: [PB_IT, { label: "F-01", href: "/review?s=find" }],
    };
  }
  if (asksForeign) {
    return {
      blocked: true,
      body: input.original,
      why: P(
        "กฎหมายไทยเป็นท่าทีบ้าน อนุญาโตตุลาการต่างประเทศต้องมีเหตุในสัมภาษณ์ — เลโอไม่ร่างลอย",
        "Thai law is the house position. Foreign arbitration needs a reason in the interview — Leio does not freehand a draft.",
      ),
      cites: [PB_ASM],
    };
  }

  if (t.includes("liability") || t.includes("ความรับผิด") || t.includes("cap") || t.includes("เพดาน") || input.heading.includes("12")) {
    return {
      body: P(
        "ความรับผิดรวมของแต่ละฝ่ายไม่เกินสองเท่าของค่าบริการที่ชำระในรอบสิบสองเดือนก่อนเกิดเหตุ รวมข้อเรียกร้องข้อมูลส่วนบุคคลโดยไม่มีข้อยกเว้น ห้ามลดเพดานหรือยกข้อมูลออกโดยไม่มีเหตุในสัมภาษณ์",
        "Each party's aggregate liability shall not exceed two times the fees paid in the twelve months preceding the event, including personal-data claims with no carve-out. The cap shall not be lowered, nor data excluded, without a recorded interview reason.",
      ),
      why: P(
        "เพลย์บุ๊ก IT & Cloud v4.2 บังคับเพดาน 2 เท่า รวมข้อมูล — ข้อ 12 ของร่างบ้านต้องตรงนี้ก่อนออกชุด",
        "IT & Cloud v4.2 requires a 2× cap including data — house clause 12 must match before the pack issues.",
      ),
      cites: [PB_IT, { label: "F-01", href: "/review?s=find" }],
    };
  }

  if (t.includes("personal data") || t.includes("ข้อมูลส่วนบุคคล") || t.includes("pdpa") || t.includes("dpa") || t.includes("transfer") || t.includes("โอน") || input.heading.includes("9")) {
    return {
      body: P(
        "ลูกค้าเป็นผู้ควบคุมข้อมูลส่วนบุคคล ผู้ให้บริการเป็นผู้ประมวลผล จะประมวลผลตามคำสั่งเป็นหนังสือเท่านั้น ห้ามโอนออกนอกราชอาณาจักรจนกว่าจะมี DPA, SCC หรือฐานเทียบเท่า รายชื่อผู้ประมวลผลช่วง และความยินยอมเป็นหนังสือ ตาม PDPA ม.28 ที่ตั้งประมวลผลล็อกในสัมภาษณ์และภาคผนวก",
        "The Customer is the controller and the Provider the processor. Processing is on written instructions only. No transfer out of the Kingdom until a DPA, SCCs or equivalent basis, a sub-processor list and written consent are in place under PDPA s.28. Processing location locks in the interview and the annex.",
      ),
      why: P(
        "ประกาศ สคส. 1 ส.ค. 2569 และเพลย์บุ๊ก IT & Cloud ห้าม go-live ถ้ายังไม่มีมาตรการม.28 — F-02 ยังเปิด",
        "The 1 Aug 2026 PDPC notification and IT & Cloud bar go-live without s.28 safeguards — F-02 is still open.",
      ),
      cites: [PB_IT, RG_01, { label: "F-02", href: "/review?s=find" }],
    };
  }

  if (t.includes("term") || t.includes("renew") || t.includes("ระยะเวลา") || t.includes("ต่ออายุ") || t.includes("notice") || input.heading.includes("3")) {
    return {
      body: P(
        "สัญญานี้มีผล 36 เดือน นับแต่วันเริ่มให้บริการ และต่ออายุคราวละ 12 เดือน เว้นแต่ฝ่ายใดฝ่ายหนึ่งบอกกล่าวเป็นหนังสือล่วงหน้าไม่น้อยกว่า 90 วัน หน้าต่างบอกกล่าวต้องถูกใส่ในปฏิทินข้อผูกพัน การปรับค่าบริการต่อรอบไม่เกิน CPI หรือร้อยละ 5 แล้วแต่จำนวนใดต่ำกว่า",
        "This Agreement runs for 36 months from commencement and renews for successive 12-month terms unless either party gives not less than 90 days' written notice. The notice window must sit on the obligation calendar. Any uplift per renewal shall not exceed CPI or 5%, whichever is lower.",
      ),
      why: P(
        "เพลย์บุ๊กกำกับหลังลงนามให้หน้าต่างบอกกล่าวอยู่ในปฏิทิน — ต่ออัตโนมัติที่พ้นแล้วแก้ไม่ทัน",
        "The control playbook requires the notice window on the calendar — a missed auto-renew cannot be unwound in time.",
      ),
      cites: [PB_CTL, PB_ASM],
    };
  }

  if (t.includes("sla") || t.includes("service level") || t.includes("availability") || t.includes("ระดับ") || t.includes("พร้อมใช้") || input.heading.includes("7")) {
    return {
      body: P(
        "ผู้ให้บริการต้องรักษาความพร้อมใช้งานไม่น้อยกว่าร้อยละ 99.9 ต่อเดือนปฏิทิน มีเครดิตบริการตามภาคผนวก ก. หากไม่เป็นไปตามระดับติดต่อกันสามเดือน ลูกค้าบอกเลิกได้โดยไม่ต้องรับผิด และผู้ให้บริการต้องช่วยเหลือการเปลี่ยนผ่านหกเดือน",
        "The Provider shall maintain availability of not less than 99.9% per calendar month, with service credits under Annex A. On three consecutive months of failure the Customer may terminate without liability, and the Provider shall give six months' exit assistance.",
      ),
      why: P(
        "โมดูล SLA ถูกเลือกจากสัมภาษณ์ — เครดิตและสิทธิเลิกต้องอยู่ในข้อ ไม่ใช่แค่ภาคผนวกที่ยังไม่แนบ",
        "The SLA module fired from the interview — credits and the termination right belong in the clause, not only in an unattached annex.",
      ),
      cites: [PB_ASM],
    };
  }

  if (t.includes("definition") || t.includes("คำนิยาม") || input.heading.includes("1")) {
    return {
      body: P(
        "“บริการ” หมายถึงบริการซอฟต์แวร์ในรูปแบบบริการตามภาคผนวก ก. “ข้อมูลส่วนบุคคล” หมายถึงข้อมูลตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 “ที่ตั้งประมวลผล” หมายถึงประเทศที่ระบบประมวลผลหลักตั้งอยู่ ซึ่งต้องล็อกในสัมภาษณ์ “ผู้ประมวลผลช่วง” หมายถึงบุคคลที่ผู้ให้บริการใช้ประมวลผลข้อมูลส่วนบุคคล",
        "\"Services\" means the software-as-a-service under Annex A. \"Personal Data\" has the meaning in the Personal Data Protection Act B.E. 2562. \"Processing Location\" means the country of the primary processing system, which must lock in the interview. \"Sub-processor\" means a person the Provider uses to process Personal Data.",
      ),
      why: P(
        "นิยามที่ตั้งประมวลผลและผู้ประมวลผลช่วงจำเป็นต่อข้อข้อมูลและประกาศ กสทช. — ห้ามร่างลอยเรื่องข้อมูล",
        "Processing Location and Sub-processor are required for the data clause and the NBTC cloud consultation — no freehand data drafting.",
      ),
      cites: [PB_IT, PB_ASM],
    };
  }

  const extra = input.instruction.trim();
  return {
    body: P(
      extra
        ? `${input.original.t} (ปรับตามคำสั่งทนาย: ${extra} — ต้องไม่ขัดเพลย์บุ๊กบ้าน และต้องมีเหตุในบันทึก)`
        : `${input.original.t} ข้อนี้คงท่าทีบ้าน ใช้กฎหมายไทย และต้องมีเหตุเป็นหนังสือจึงจะสละได้`,
      extra
        ? `${input.original.e} (Adjusted on counsel's instruction: ${extra} — must not leave the house playbook, and the reason stays on the record.)`
        : `${input.original.e} This clause keeps the house position, Thai law, and a written reason before any waiver.`,
    ),
    why: P(
      extra
        ? "เลโอผนวกคำสั่งเข้ากับข้อมาตรฐาน แต่ไม่ลงนามแทน — ทนายเป็นผู้ใช้ข้อ"
        : "ไม่มีคำสั่งเฉพาะ เลโอคงข้อมาตรฐานบ้านและชี้เพลย์บุ๊กประกอบสัญญา",
      extra
        ? "Leio folds the instruction into the house clause but does not sign — counsel applies it."
        : "No specific instruction — Leio keeps the house standard and cites the assembly playbook.",
    ),
    cites: [PB_ASM],
  };
}

export function clauseBody(lang: Lang, edit: ClauseEdit | undefined, original: TE) {
  const te = edit?.body ?? original;
  return lang === "th" ? te.t : te.e;
}
