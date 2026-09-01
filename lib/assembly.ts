import type { TE } from "./model";
import type { ReviewLive, XrayView } from "./ai/types";
import { asLine, asTE } from "./ai/fromMap";

const P = (t: string, e: string): TE => ({ t, e });

export type AssemblyInputKind = "fact" | "finding" | "missing" | "instruction";
export type IntakeAnswerType = "text" | "number" | "date" | "boolean" | "select";

export type IntakeQuestion = {
  id: string;
  prompt: TE;
  why: TE;
  category: "parties" | "commercial" | "scope" | "risk" | "approval" | "formality";
  answerType: IntakeAnswerType;
  required: boolean;
  options: TE[];
};

export type IntakeQuestionnaire = {
  typeId: string;
  round: number;
  questions: IntakeQuestion[];
  answers: Record<string, string>;
  summary: TE;
  missing: TE[];
  ready: boolean;
};

export type AssemblyInput = {
  id: string;
  kind: AssemblyInputKind;
  title: TE;
  value: TE;
  source: TE;
  href: string;
  priority: "must" | "should" | "context";
};

export type AssemblyState = {
  sourceRef: string;
  acceptedInputs: AssemblyInput[];
  ingestedAt: string;
  reviewHandoff: null | {
    title: string;
    sourceRef: string;
    inputCount: number;
    at: string;
  };
  questionnaire: IntakeQuestionnaire;
  mou: Record<string, string>;
};

export function seedAssembly(): AssemblyState {
  return {
    sourceRef: "",
    acceptedInputs: [],
    ingestedAt: "",
    reviewHandoff: null,
    questionnaire: {
      typeId: "",
      round: 0,
      questions: [],
      answers: {},
      summary: P("", ""),
      missing: [],
      ready: false,
    },
    mou: {},
  };
}

export function hydrateAssembly(raw: unknown): AssemblyState {
  const base = seedAssembly();
  if (!raw || typeof raw !== "object") return base;
  const v = raw as Partial<AssemblyState>;
  return {
    sourceRef: v.sourceRef || "",
    acceptedInputs: Array.isArray(v.acceptedInputs)
      ? v.acceptedInputs.filter((x): x is AssemblyInput => Boolean(x && typeof x === "object" && x.id))
      : [],
    ingestedAt: v.ingestedAt || "",
    reviewHandoff: v.reviewHandoff && typeof v.reviewHandoff === "object"
      ? {
          title: v.reviewHandoff.title || "Assembled draft",
          sourceRef: v.reviewHandoff.sourceRef || "",
          inputCount: Number(v.reviewHandoff.inputCount) || 0,
          at: v.reviewHandoff.at || "",
        }
      : null,
    questionnaire: v.questionnaire && typeof v.questionnaire === "object"
      ? {
          ...base.questionnaire,
          ...v.questionnaire,
          questions: Array.isArray(v.questionnaire.questions) ? v.questionnaire.questions : [],
          answers: v.questionnaire.answers && typeof v.questionnaire.answers === "object" ? v.questionnaire.answers : {},
          missing: Array.isArray(v.questionnaire.missing) ? v.questionnaire.missing : [],
        }
      : base.questionnaire,
    mou: v.mou && typeof v.mou === "object"
      ? Object.fromEntries(Object.entries(v.mou).filter(([, x]) => typeof x === "string")) as Record<string, string>
      : {},
  };
}

function q(
  id: string,
  t: string,
  e: string,
  whyT: string,
  whyE: string,
  category: IntakeQuestion["category"],
  answerType: IntakeAnswerType = "text",
  required = true,
  options: TE[] = [],
): IntakeQuestion {
  return { id, prompt: P(t, e), why: P(whyT, whyE), category, answerType, required, options };
}

export function fallbackQuestionnaire(input: {
  typeId: string;
  typeName: string;
  category: string;
  keyTerms?: string;
  answers?: Record<string, string>;
  round?: number;
}): Omit<IntakeQuestionnaire, "answers" | "typeId"> {
  const hay = `${input.typeName} ${input.category} ${input.keyTerms || ""}`.toLowerCase();
  const common = [
    q("AQ-PARTIES", "คู่สัญญาเต็มและบทบาทของแต่ละฝ่ายคือใคร", "Who are the full legal parties and what is each party's role?", "ชื่อและบทบาทจะควบคุมคำนิยามและช่องลงนาม", "Names and roles control definitions and signature blocks", "parties"),
    q("AQ-PURPOSE", "วัตถุประสงค์และขอบเขตธุรกิจของสัญญาคืออะไร", "What is the commercial purpose and scope of the contract?", "ขอบเขตควบคุมบริการ สินค้า และสิ่งส่งมอบ", "Scope controls services, goods and deliverables", "scope"),
    q("AQ-VALUE", "ราคา ค่าธรรมเนียม หรือมูลค่ารวมเท่าใด และชำระเมื่อใด", "What is the price, fee or total value, and when is it paid?", "มูลค่าและกำหนดชำระควบคุมความเสี่ยงและการอนุมัติ", "Value and payment timing control risk and approvals", "commercial"),
    q("AQ-TERM", "วันเริ่ม ระยะเวลา การต่ออายุ และกำหนดบอกกล่าวคืออะไร", "What are the start date, term, renewal and notice period?", "คำตอบสร้างข้อระยะเวลา ต่ออายุ และปฏิทิน", "The answer drives term, renewal and calendar clauses", "commercial"),
    q("AQ-AUTH", "ใครมีอำนาจอนุมัติและลงนามของแต่ละฝ่าย", "Who may approve and sign for each party?", "ระบบไม่ควรสร้างช่องลงนามโดยเดาอำนาจ", "The engine must not guess signing authority", "approval"),
    q("AQ-LAW", "ต้องการกฎหมายไทยและศาลไทยหรือมีเหตุขอยกเว้น", "Should Thai law and Thai courts apply, or is there a reason for an exception?", "กฎหมายไทยเป็นค่าเริ่มของเพลย์บุ๊ก", "Thai law is the house default", "risk", "select", true, [P("กฎหมายไทย / ศาลไทย", "Thai law / Thai courts"), P("ขอยกเว้นพร้อมเหตุ", "Exception with recorded reason")]),
  ];
  const specific: IntakeQuestion[] = [];

  if (/saas|software|cloud|data|ไอที|ซอฟต์แวร์|คลาวด์/.test(hay)) {
    specific.push(
      q("AQ-SLA", "ระดับบริการ uptime เครดิต และสิทธิเลิกที่ต้องการคืออะไร", "What SLA, uptime, credits and termination right are required?", "คำตอบเลือกโมดูล SLA และสิทธิเลิก", "This selects the SLA and termination modules", "commercial"),
      q("AQ-DATA", "มีข้อมูลส่วนบุคคลหรือไม่ ใครเป็น controller/processor และประมวลผลประเทศใด", "Is personal data involved, who is controller/processor, and in which countries is it processed?", "PDPA, DPA และการโอนข้ามแดนขึ้นกับคำตอบ", "PDPA, DPA and transfer safeguards depend on this answer", "risk"),
      q("AQ-EXIT", "เมื่อเลิกสัญญาต้องส่งคืนข้อมูล ช่วยเปลี่ยนผ่าน หรือ escrow อย่างไร", "On exit, what data return, transition assistance or escrow is required?", "ระบบสำคัญต้องมีทางออกใช้งานได้จริง", "A critical system needs an operational exit", "risk"),
    );
  } else if (/employment|employee|แรงงาน|จ้างงาน|ผู้บริหาร/.test(hay)) {
    specific.push(
      q("AQ-ROLE", "ตำแหน่ง หน้าที่ สถานที่ทำงาน และวันเริ่มงานคืออะไร", "What are the role, duties, workplace and start date?", "เป็นแกนของข้อจ้างงาน", "These are core employment terms", "scope"),
      q("AQ-COMP", "เงินเดือน โบนัส สวัสดิการ และสิทธิหุ้นคืออะไร", "What are salary, bonus, benefits and equity rights?", "ค่าตอบแทนต้องครบและไม่ขัดนโยบาย", "Compensation must be complete and policy-aligned", "commercial"),
      q("AQ-IP", "ผลงานและทรัพย์สินทางปัญญาที่สร้างระหว่างจ้างจะเป็นของใคร", "Who owns work product and IP created during employment?", "กรรมสิทธิ์ IP ต้องเขียนชัด", "IP ownership must be explicit", "risk"),
    );
  } else if (/mou|memorandum of understanding|บันทึกความเข้าใจ/.test(hay)) {
    specific.push(
      q("AQ-BINDING", "บันทึกนี้ผูกพันทั้งฉบับ หรือเฉพาะข้อที่ระบุ", "Does this MOU bind as a whole, or only listed clauses?", "แยกส่วนเจรจาออกจากหน้าที่ที่บังคับได้", "Separate negotiation from enforceable duties", "risk", "select", true, [P("ไม่ผูกพัน ยกเว้นข้อที่ระบุ", "Non-binding except listed clauses"), P("ผูกพันบางส่วนตามที่ระบุ", "Partly binding as listed"), P("ตั้งใจให้ผูกพันทั้งฉบับ", "Intended to bind as a whole")]),
      q("AQ-CONF", "มีหน้าที่รักษาความลับในบันทึกนี้ หรือใช้ NDA แยก", "Does confidentiality sit in this MOU, or in a separate NDA?", "ความลับมักเป็นข้อที่ผูกพันแม้ส่วนอื่นไม่ผูกพัน", "Confidentiality is often binding even when the rest is not", "risk"),
      q("AQ-NEXT", "สัญญาฉบับสมบูรณ์ขั้นถัดไปคืออะไร และเป้าเมื่อใด", "What is the next definitive agreement, and by when?", "MOU ต้องชี้ไปที่เอกสารที่จะล็อกท่าทีจริง", "An MOU must point to the paper that will lock the real posture", "scope"),
    );
  } else if (/nda|confidential|non-disclosure|ความลับ/.test(hay)) {
    specific.push(
      q("AQ-DISCLOSURE", "เปิดเผยข้อมูลเพื่อวัตถุประสงค์ใด และฝ่ายใดเป็นผู้เปิดเผย", "For what purpose is information disclosed, and which party discloses it?", "กำหนดขอบเขตข้อมูลและการใช้", "This sets the information and permitted-use scope", "scope"),
      q("AQ-RECIPIENTS", "ใครบ้างที่รับข้อมูลได้ และต้องมีมาตรการคุ้มครองใด", "Who may receive the information and what safeguards apply?", "ควบคุมผู้แทน ที่ปรึกษา และการเปิดเผยตามกฎหมาย", "This controls representatives, advisers and compelled disclosure", "risk"),
      q("AQ-SURVIVE", "หน้าที่รักษาความลับอยู่กี่ปี และข้อมูลใดคุ้มครองไม่จำกัดเวลา", "How long does confidentiality survive, and what information is protected indefinitely?", "ระยะคุ้มครองต้องเหมาะกับชนิดข้อมูล", "Survival must fit the information type", "risk"),
    );
  } else if (/share|หุ้น|investment|ลงทุน|acquisition|ซื้อกิจการ/.test(hay)) {
    specific.push(
      q("AQ-TARGET", "บริษัทเป้าหมาย หุ้น จำนวน และสัดส่วนที่ซื้อคืออะไร", "What are the target, share class, number and percentage acquired?", "ข้อมูลนี้ควบคุมทรัพย์สินที่โอน", "This defines the asset being transferred", "scope"),
      q("AQ-PRICE", "ราคาซื้อ กลไกปรับราคา escrow และการชำระเป็นอย่างไร", "What are the purchase price, adjustment, escrow and payment mechanics?", "สร้างกลไกราคาและเงื่อนไขปิด", "This drives price mechanics and closing conditions", "commercial"),
      q("AQ-CP", "เงื่อนไขบังคับก่อน ความยินยอม และการอนุมัติใดต้องครบก่อนปิด", "Which conditions precedent, consents and approvals must be satisfied before closing?", "ข้อค้นพบ DD ต้องกลายเป็น CP", "DD findings must become CPs", "risk"),
    );
  } else if (/lease|เช่า|property|อสังหา|ที่ดิน/.test(hay)) {
    specific.push(
      q("AQ-PREMISES", "ทรัพย์ที่เช่า ที่ตั้ง พื้นที่ และการใช้ประโยชน์คืออะไร", "What are the premises, location, area and permitted use?", "ระบุทรัพย์และขอบเขตสิทธิให้แน่นอน", "The property and rights must be certain", "scope"),
      q("AQ-RENT", "ค่าเช่า เงินประกัน การปรับค่าเช่า และค่าใช้จ่ายคืออะไร", "What are rent, deposit, rent review and outgoings?", "ควบคุมภาระทางการเงินตลอดอายุเช่า", "This controls financial exposure over the lease", "commercial"),
      q("AQ-REG", "ต้องจดทะเบียนเช่าหรือมีใบอนุญาต/ความยินยอมใด", "Must the lease be registered, or are licences/consents required?", "พิธีการอาจกระทบการบังคับใช้", "Formalities may affect enforceability", "formality"),
    );
  } else {
    specific.push(
      q("AQ-DELIVER", "สิ่งส่งมอบ มาตรฐานรับมอบ และกำหนดส่งคืออะไร", "What are the deliverables, acceptance standard and delivery dates?", "ทำให้หน้าที่และการผิดสัญญาวัดได้", "This makes performance and breach measurable", "scope"),
      q("AQ-LIABILITY", "ความรับผิด การรับประกัน การชดใช้ และเพดานที่ต้องการคืออะไร", "What warranties, indemnities, liability and cap are required?", "เป็นท่าทีความเสี่ยงหลักของสัญญา", "This is the contract's core risk posture", "risk"),
      q("AQ-TERMINATE", "เหตุเลิกสัญญา ระยะเยียวยา และผลหลังเลิกคืออะไร", "What termination events, cure period and exit consequences apply?", "ต้องมีทางออกและผลหลังเลิกที่ปฏิบัติได้", "The agreement needs a workable exit", "risk"),
    );
  }

  const answers = input.answers || {};
  const questions = [...common, ...specific].filter((item) => !answers[item.id]?.trim());
  const requiredOpen = questions.filter((item) => item.required);
  return {
    round: Math.max(1, input.round || 1),
    questions: questions.slice(0, 8),
    summary: P(
      `แบบสอบถาม ${input.typeId} ปรับตามประเภท ${input.typeName}`,
      `${input.typeId} questionnaire adapted to ${input.typeName}`,
    ),
    missing: requiredOpen.slice(0, 6).map((item) => item.prompt),
    ready: requiredOpen.length === 0,
  };
}

export function questionnaireInputsOf(questionnaire: IntakeQuestionnaire): AssemblyInput[] {
  return questionnaire.questions
    .filter((item) => questionnaire.answers[item.id]?.trim())
    .map((item) => ({
      id: item.id,
      kind: item.category === "risk" ? "instruction" as const : "fact" as const,
      title: item.prompt,
      value: P(questionnaire.answers[item.id], questionnaire.answers[item.id]),
      source: P("คำตอบแบบสอบถาม AI — ทนายยืนยัน", "AI intake answer — counsel confirms"),
      href: "/assemble?s=aiq",
      priority: item.required ? "must" as const : "context" as const,
    }));
}

export function assemblyInputsOf(X: XrayView | null, R?: ReviewLive | null): AssemblyInput[] {
  if (!X) return [];
  const rows: AssemblyInput[] = [];
  const add = (row: AssemblyInput) => {
    if (!rows.some((x) => x.id === row.id)) rows.push(row);
  };

  (X.parties || []).slice(0, 3).forEach((x, i) => add({
    id: `AF-P-${i + 1}`,
    kind: "fact",
    title: asTE(x.k),
    value: asTE(x.v),
    source: P(`${X.ref} · X-Ray`, `${X.ref} · X-Ray`),
    href: "/review?s=quick",
    priority: "context",
  }));
  (X.money || []).slice(0, 4).forEach((x, i) => add({
    id: `AF-M-${i + 1}`,
    kind: "fact",
    title: asTE(x.k),
    value: asTE(x.v),
    source: P(`${X.ref} · X-Ray`, `${X.ref} · X-Ray`),
    href: "/review?s=quick",
    priority: i === 0 ? "must" : "context",
  }));
  (X.dates || []).slice(0, 4).forEach((x, i) => add({
    id: `AF-D-${i + 1}`,
    kind: "fact",
    title: asTE(x.k),
    value: asTE(x.v),
    source: asTE(x.src),
    href: "/review?s=quick",
    priority: "context",
  }));
  (R?.findings || []).forEach((x, i) => add({
    id: `AF-F-${x.id || i + 1}`,
    kind: "finding",
    title: asTE(x.issue),
    value: asTE(x.word || x.rec),
    source: asTE(x.src),
    href: "/review?s=find",
    priority: x.sev === "high" ? "must" : "should",
  }));
  (X.unusual || []).forEach((x, i) => add({
    id: `AF-U-${i + 1}`,
    kind: "finding",
    title: asTE(x.k),
    value: P(`แก้ให้ตรงท่าทีบ้าน: ${asLine(x.vs)}`, `Draft to the house position: ${asLine(x.vs)}`),
    source: asTE(x.src),
    href: "/review?s=find",
    priority: "must",
  }));
  (X.missing || []).forEach((x, i) => add({
    id: `AF-X-${i + 1}`,
    kind: "missing",
    title: asTE(x.k),
    value: P("ต้องเติมในร่างหรือแนบก่อนส่งตรวจ", "Add to the draft or attach before review"),
    source: asTE(x.src),
    href: "/review?s=find",
    priority: "must",
  }));
  (X.redlines || []).forEach((x, i) => add({
    id: `AF-R-${i + 1}`,
    kind: "instruction",
    title: P(`ถ้อยคำข้อ ${x.cl}`, `Drafting instruction · cl.${x.cl}`),
    value: asTE(x.text),
    source: P(`${X.ref} · redline`, `${X.ref} · redline`),
    href: "/review?s=red",
    priority: "must",
  }));
  return rows;
}

export function acceptedAssemblyInputs(
  state: AssemblyState,
) {
  return state.acceptedInputs;
}
