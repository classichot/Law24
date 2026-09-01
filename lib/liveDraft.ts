import type { TE } from "./model";
import type { AssemblyInput } from "./assembly";
import { houseStandard } from "./clauses";
import { TAX_LIST, trClauses, trParties, type TaxRow } from "./taxonomy";

const P = (t: string, e: string): TE => ({ t, e });

export type LiveDraftClause = {
  id: string;
  n: string;
  h: TE;
  b: TE;
  firedBy: TE;
};

export type LiveDraft = {
  typeId: string;
  title: TE;
  posture: TE;
  clauses: LiveDraftClause[];
};

export function governingLawBody(conflictChoice: "thai" | "waiver" | null): TE {
  if (conflictChoice === "waiver") {
    return P(
      "ขอยกเว้นนโยบาย — ที่นั่งอนุญาโตตุลาการต้องบันทึกเหตุในสัมภาษณ์ กฎหมายบังคับไทย (รวม PDPA) ยังใช้ เครื่องยนต์ไม่ลงนามแทน",
      "Policy waiver requested — any foreign seat needs a recorded interview reason. Thai mandatory rules including PDPA still apply. The engine never signs.",
    );
  }
  return P(
    "กฎหมายไทยเป็นท่าทีบ้าน ข้อพิพาทระงับในราชอาณาจักร อนุญาโตตุลาการต่างประเทศไม่ได้รวมในร่างนี้จนกว่าทนายจะบันทึกเหตุ",
    "Thai law is the house position. Disputes are seated in the Kingdom. Foreign arbitration is not included in this draft until counsel records a reason.",
  );
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9ก-๙]+/gi, "-").replace(/^-|-$/g, "").slice(0, 48) || "clause";
}

function hay(x: AssemblyInput) {
  return `${x.id} ${x.title.e} ${x.title.t} ${x.value.e} ${x.value.t}`.toLowerCase();
}

function weave(base: TE, fact?: TE): TE {
  if (!fact) return base;
  const t = fact.t.trim();
  const e = fact.e.trim();
  if (!t && !e) return base;
  return P(
    `${base.t}\n\nข้อมูลที่ทนายยืนยัน: ${t || e}`,
    `${base.e}\n\nCounsel-confirmed intake: ${e || t}`,
  );
}

function pick(facts: AssemblyInput[], re: RegExp) {
  return facts.find((x) => re.test(hay(x)));
}

function keysOf(type: TaxRow): TE[] {
  const th = type.keyTerms.split(";").map((s) => s.trim()).filter(Boolean);
  const en = trClauses("en", type.keyTerms).split(";").map((s) => s.trim()).filter(Boolean);
  return th.map((t, i) => P(t, en[i] || t));
}

/**
 * Build the operative draft the lawyer sees and can adjust.
 * House-standard language plus counsel-confirmed facts. Not a signed instrument.
 */
export function buildLiveDraft(input: {
  typeId: string;
  facts: AssemblyInput[];
  conflictChoice: "thai" | "waiver" | null;
}): LiveDraft {
  const type = TAX_LIST.find((r) => r.id === input.typeId) || TAX_LIST[0];
  const facts = input.facts;
  const parties = pick(facts, /aq-part|af-p-|part(?:y|ies)|คู่สัญญา|ลูกค้า|customer|signator/);
  const purpose = pick(facts, /aq-purpose|aq-deliver|purpose|scope|วัตถุประสงค์|ขอบเขต|สิ่งส่งมอบ/);
  const value = pick(facts, /aq-value|af-m-|price|fee|มูลค่า|ค่าบริการ|ค่าจ้าง|rent/);
  const term = pick(facts, /aq-term|af-d-|term|renew|ระยะเวลา|ต่ออายุ|notice/);
  const sla = pick(facts, /aq-sla|sla|uptime|ระดับบริการ/);
  const data = pick(facts, /aq-data|pdpa|personal data|ข้อมูลส่วนบุคคล|controller|processor/);
  const exit = pick(facts, /aq-exit|aq-terminate|exit|escrow|เลิก|เปลี่ยนผ่าน/);
  const lawFact = pick(facts, /aq-law|governing|กฎหมาย/);
  const auth = pick(facts, /aq-auth|sign|อำนาจ|อนุมัติ/);

  const rows: LiveDraftClause[] = [];
  const used = new Set<string>();
  const seenIds = new Map<string, number>();
  const mark = (x?: AssemblyInput) => { if (x) used.add(x.id); };

  const push = (id: string, h: TE, b: TE, firedBy: TE) => {
    const n = (seenIds.get(id) || 0) + 1;
    seenIds.set(id, n);
    const unique = n === 1 ? id : `${id}-${n}`;
    rows.push({ id: `draft:${unique}`, n: `${rows.length + 1}.`, h, b, firedBy });
  };

  push(
    "definitions",
    P("คำนิยาม", "Definitions"),
    P(
      `“สัญญา” หมายถึง ${type.nameTh} (${type.id}) ตามคลังไทย 500 ประเภท “คู่สัญญา” หมายถึงคู่สัญญาหลักของประเภทนี้จนกว่าทนายจะยืนยันชื่อนิติบุคคล`,
      `"Agreement" means ${type.nameEn} (${type.id}) in the Thai 500-type library. "Parties" means the principal parties of this type until counsel confirms legal names.`,
    ),
    P("ประเภทสัญญาในคลัง", "Library contract type"),
  );

  const partyLine = parties
    ? parties.value
    : P(trParties("th", type.parties), trParties("en", type.parties));
  mark(parties);
  push(
    "parties",
    P("คู่สัญญา", "Parties"),
    weave(
      P(
        `สัญญานี้ทำขึ้นระหว่างคู่สัญญาของ ${type.nameTh} รายละเอียดชื่อนิติบุคคลและผู้มีอำนาจลงนามต้องยืนยันก่อนลงนาม เครื่องยนต์ไม่ลงนามแทน`,
        `This Agreement is between the parties to ${type.nameEn}. Legal names and signing authority must be confirmed before signature. The engine never signs.`,
      ),
      partyLine,
    ),
    parties ? parties.title : P("คู่สัญญาตามประเภท", "Parties from the type"),
  );
  if (auth) {
    mark(auth);
    push("authority", P("อำนาจลงนาม", "Signing authority"), weave(houseStandard("approval"), auth.value), auth.title);
  }

  mark(purpose);
  push(
    "purpose",
    P("วัตถุประสงค์และขอบเขต", "Purpose and scope"),
    weave(
      P(
        type.purpose,
        `This ${type.nameEn} (${type.id}) sets the commercial purpose and scope. Deal-specific purpose is counsel-confirmed below. The engine never signs.`,
      ),
      purpose?.value,
    ),
    purpose ? purpose.title : P("วัตถุประสงค์ของประเภท", "Type purpose"),
  );

  for (const key of keysOf(type)) {
    const label = `${key.t} ${key.e}`.toLowerCase();
    let fact: AssemblyInput | undefined;
    if (/sla|service level|ระดับ/.test(label)) fact = sla;
    else if (/data|pdpa|dpa|ข้อมูล|security|โอน/.test(label)) fact = data;
    else if (/term|renew|ระยะ|ต่ออายุ/.test(label)) fact = term;
    else if (/liability|ความรับผิด|เพดาน|indemnity/.test(label)) fact = pick(facts, /aq-liability|cap|เพดาน|ความรับผิด/);
    else if (/exit|terminate|เลิก|เปลี่ยนผ่าน|escrow/.test(label)) fact = exit;
    else if (/fee|price|ค่า|commercial/.test(label)) fact = value;
    else if (/part|คู่/.test(label)) fact = parties;
    else if (/law|กฎหมาย/.test(label)) fact = lawFact;
    mark(fact);
    push(
      slug(key.e || key.t),
      key,
      weave(houseStandard(key.e || key.t), fact?.value),
      fact ? fact.title : P("ข้อมาตรฐานบ้านของประเภท", "House standard for this type"),
    );
  }

  if (value && !used.has(value.id)) {
    mark(value);
    push("value", P("ค่าตอบแทน", "Fees"), weave(houseStandard("fees"), value.value), value.title);
  }
  if (term && !used.has(term.id)) {
    mark(term);
    push("term", P("ระยะเวลา", "Term"), weave(houseStandard("term"), term.value), term.title);
  }
  if (sla && !used.has(sla.id)) {
    mark(sla);
    push("sla", P("ระดับการให้บริการ", "Service levels"), weave(houseStandard("SLA"), sla.value), sla.title);
  }
  if (data && !used.has(data.id)) {
    mark(data);
    push("data", P("ข้อมูลส่วนบุคคล", "Personal data"), weave(houseStandard("DPA"), data.value), data.title);
  }
  if (exit && !used.has(exit.id)) {
    mark(exit);
    push("exit", P("การเลิกสัญญาและการเปลี่ยนผ่าน", "Termination and exit"), weave(houseStandard("exit"), exit.value), exit.title);
  }

  for (const fact of facts) {
    if (used.has(fact.id)) continue;
    if (/aq-law|governing/.test(hay(fact))) continue;
    push(
      slug(fact.id),
      fact.title,
      weave(houseStandard(fact.title.e || fact.title.t), fact.value),
      fact.title,
    );
    used.add(fact.id);
  }

  mark(lawFact);
  push(
    "law",
    P("กฎหมายที่ใช้บังคับ", "Governing law"),
    weave(governingLawBody(input.conflictChoice), lawFact?.value),
    lawFact ? lawFact.title : P("ท่าทีบ้าน — กฎหมายไทย", "House posture — Thai law"),
  );

  return {
    typeId: type.id,
    title: P(`${type.id} · ${type.nameTh}`, `${type.id} · ${type.nameEn}`),
    posture: P(
      "ร่างสดจากประเภทสัญญา ข้อมาตรฐานบ้าน และข้อมูลที่ทนายยืนยัน — ยังไม่ใช่เอกสารที่ลงนาม ปรับทีละข้อได้",
      "Live draft from the contract type, house standards and counsel-confirmed facts — not a signed instrument. Adjust clause by clause.",
    ),
    clauses: rows,
  };
}
