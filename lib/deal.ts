import type { TE } from "@/lib/model";
import type { ClientRecord, AssignmentRecord, PracticeState } from "@/lib/firm";
import { assignmentOf, clientOf, formatThb } from "@/lib/firm";
import type { DdLive, ReviewLive, XrayView } from "@/lib/ai/types";

export type DealUpload = { name: string; size: number; bucket: string };
import { asLine, asTE } from "@/lib/ai/fromMap";

const P = (t: string, e: string): TE => ({ t, e });

export type DealTx =
  | "share"
  | "asset"
  | "investment"
  | "jv"
  | "ipo"
  | "financing"
  | "re"
  | "vendor"
  | "health";

export type DealScenario = "share100" | "share49" | "asset";

export type DealClass =
  | "corporate"
  | "commercial"
  | "financing"
  | "employment"
  | "ip"
  | "regulatory"
  | "litigation"
  | "property"
  | "privacy"
  | "tax"
  | "insurance"
  | "minutes"
  | "policy"
  | "transaction"
  | "other";

export type CheckStatus = "received" | "missing" | "incomplete" | "review" | "issue" | "cleared";
export type FindingSev = "critical" | "high" | "medium" | "low";
export type RemedyKind = "consent" | "amendment" | "assignment" | "review" | "cp" | "indemnity" | "disclosure" | "request";

export type DealState = {
  assignmentId: string;
  clientId: string;
  transaction: DealTx;
  scenario: DealScenario;
  materiality: { contract: number; litigation: number; customerPct: number; supplierPct: number };
  answers: Record<string, { text: string }>;
  cpStatus: Record<string, "open" | "in_progress" | "cleared">;
  verified: boolean;
};

export type DealFile = {
  id: string;
  name: string;
  size: number;
  class: DealClass;
  type: TE;
  family: string;
  status: "received" | "unsigned" | "incomplete" | "duplicate";
  source: "upload" | "xray" | "referenced";
  parties: string[];
  version: string;
  governingLaw?: string;
  effective?: string;
};

export const DEAL_TX: Record<DealTx, { en: string; th: string; why: TE }> = {
  share: { en: "Share acquisition", th: "ซื้อหุ้น", why: P("ซื้อหุ้นทั้งบริษัท — สิทธิ หนี้ และใบอนุญาตติดตัวบริษัท", "Buy the shares — rights, debts and licences stay with the company") },
  asset: { en: "Asset acquisition", th: "ซื้อสินทรัพย์", why: P("ย้ายสัญญา ใบอนุญาต พนักงาน และทรัพย์สินทางปัญญาเป็นรายชิ้น", "Move contracts, licences, people and IP piece by piece") },
  investment: { en: "Investment", th: "ลงทุน", why: P("รอบทุน — สิทธิผู้ถือหุ้น บุริมสิทธิ และข้อสงวน", "A funding round — shareholder rights, preference and reserved matters") },
  jv: { en: "Joint venture", th: "ร่วมทุน", why: P("หุ้นส่วน ทางออก และสิทธิ put/call", "Partners, exits and put/call rights") },
  ipo: { en: "IPO", th: "เสนอขายหุ้นต่อประชาชน", why: P("ความพร้อมเปิดเผยและโครงสร้างก่อนเข้าตลาด", "Disclosure readiness and pre-listing structure") },
  financing: { en: "Financing", th: "จัดหาเงิน", why: P("หนี้ หลักประกัน และการผิดนัดไขว้", "Debt, security and cross-default") },
  re: { en: "Real estate acquisition", th: "ซื้ออสังหาริมทรัพย์", why: P("กรรมสิทธิ์ การเช่า และภาระผูกพันบนที่ดิน", "Title, leases and land encumbrances") },
  vendor: { en: "Vendor diligence", th: "ตรวจฝั่งผู้ขาย", why: P("ผู้ขายเตรียมห้องก่อนเปิดให้ผู้ซื้อ", "The seller prepares the room before the buyer opens it") },
  health: { en: "Corporate health check", th: "ตรวจสุขภาพนิติบุคคล", why: P("สภาพกฎหมายของบริษัทโดยไม่ผูกดีล", "The legal condition of the company, deal-agnostic") },
};

export const DEAL_SCENARIO: Record<DealScenario, { en: string; th: string }> = {
  share100: { en: "Acquire 100%", th: "ซื้อ 100%" },
  share49: { en: "Acquire 49%", th: "ซื้อ 49%" },
  asset: { en: "Acquire assets", th: "ซื้อสินทรัพย์" },
};

export const DEAL_CLASS: Record<DealClass, { en: string; th: string }> = {
  corporate: { en: "Corporate", th: "นิติบุคคล" },
  commercial: { en: "Commercial", th: "พาณิชย์" },
  financing: { en: "Financing", th: "การเงิน" },
  employment: { en: "Employment", th: "แรงงาน" },
  ip: { en: "IP", th: "ทรัพย์สินทางปัญญา" },
  regulatory: { en: "Regulatory", th: "กำกับ" },
  litigation: { en: "Litigation", th: "คดี" },
  property: { en: "Property", th: "ทรัพย์สิน" },
  privacy: { en: "Privacy / cyber", th: "ข้อมูล / ไซเบอร์" },
  tax: { en: "Tax", th: "ภาษี" },
  insurance: { en: "Insurance", th: "ประกัน" },
  minutes: { en: "Minutes / resolutions", th: "รายงานการประชุม" },
  policy: { en: "Policies", th: "นโยบาย" },
  transaction: { en: "Transaction papers", th: "เอกสารธุรกรรม" },
  other: { en: "Other", th: "อื่น" },
};

type CheckDef = { id: string; cls: DealClass; title: TE; keys: string[]; expect: number };

const ACQ_CHECKS: CheckDef[] = [
  { id: "COR-01", cls: "corporate", title: P("หนังสือบริคณห์สนธิ / ข้อบังคับ", "Memorandum / articles"), keys: ["article", "aoa", "moa", "memorandum", "ข้อบังคับ", "บริคณห์"], expect: 2 },
  { id: "COR-02", cls: "corporate", title: P("บัญชีผู้ถือหุ้น / ตารางทุน", "Shareholder list / cap table"), keys: ["shareholder", "cap table", "register", "ผู้ถือหุ้น", "ตารางทุน"], expect: 2 },
  { id: "COR-03", cls: "corporate", title: P("ใบหุ้น", "Share certificates"), keys: ["certificate", "ใบหุ้น", "share cert"], expect: 1 },
  { id: "COR-04", cls: "minutes", title: P("รายงานกรรมการ 24 เดือน", "Board minutes — 24 months"), keys: ["board", "minutes", "กรรมการ", "รายงานการประชุม"], expect: 4 },
  { id: "COR-05", cls: "minutes", title: P("มติผู้ถือหุ้น", "Shareholder resolutions"), keys: ["resolution", "ผู้ถือหุ้น", "มติ"], expect: 2 },
  { id: "COM-01", cls: "commercial", title: P("สัญญาลูกค้าสำคัญ", "Material customer agreements"), keys: ["customer", "msa", "supply", "distribution", "ลูกค้า"], expect: 3 },
  { id: "COM-02", cls: "commercial", title: P("สัญญาผู้ขาย / ตัวแทน", "Supplier / agent agreements"), keys: ["supplier", "agent", "franchise", "ผู้ขาย", "ตัวแทน"], expect: 2 },
  { id: "FIN-01", cls: "financing", title: P("สัญญากู้ / หลักประกัน", "Loans / security"), keys: ["loan", "facility", "security", "debenture", "กู้", "สินเชื่อ"], expect: 1 },
  { id: "FIN-02", cls: "financing", title: P("หนังสือค้ำ / หนังสือข้างเคียง", "Guarantees / side letters"), keys: ["guarantee", "side letter", "ค้ำ"], expect: 1 },
  { id: "EMP-01", cls: "employment", title: P("สัญญาจ้าง / ผู้บริหาร", "Employment / executive agreements"), keys: ["employment", "executive", "พนักงาน", "จ้าง"], expect: 2 },
  { id: "EMP-02", cls: "employment", title: P("แผนสิทธิ / ESOP", "Incentive / ESOP plans"), keys: ["esop", "incentive", "option", "สิทธิ"], expect: 1 },
  { id: "IP-01", cls: "ip", title: P("เครื่องหมาย / สิทธิบัตร / ลิขสิทธิ์", "Trade marks / patents / copyright"), keys: ["trademark", "patent", "copyright", "เครื่องหมาย", "สิทธิบัตร"], expect: 1 },
  { id: "IP-02", cls: "ip", title: P("ใบอนุญาตใช้สิทธิ / กรรมสิทธิ์ซอฟต์แวร์", "Licences / software ownership"), keys: ["ip licence", "software", "assignment", "โอนสิทธิ"], expect: 1 },
  { id: "REG-01", cls: "regulatory", title: P("ใบอนุญาต / ใบอนุญาตประกอบกิจการ", "Licences / operating permits"), keys: ["licence", "license", "permit", "ใบอนุญาต"], expect: 1 },
  { id: "LIT-01", cls: "litigation", title: P("คดี / คำพิพากษา / ประนีประนอม", "Claims / judgments / settlements"), keys: ["litigation", "complaint", "judgment", "settlement", "คดี", "ฟ้อง"], expect: 1 },
  { id: "PRV-01", cls: "privacy", title: P("DPA / ประกาศความเป็นส่วนตัว / PDPA", "DPAs / privacy notices / PDPA"), keys: ["dpa", "privacy", "pdpa", "ข้อมูลส่วนบุคคล"], expect: 1 },
  { id: "PRP-01", cls: "property", title: P("เช่า / ที่ดิน / จำนอง", "Leases / land / mortgages"), keys: ["lease", "land", "mortgage", "เช่า", "ที่ดิน"], expect: 1 },
  { id: "TAX-01", cls: "tax", title: P("เอกสารภาษี", "Tax documentation"), keys: ["tax", "vat", "ภาษี"], expect: 1 },
  { id: "INS-01", cls: "insurance", title: P("กรมธรรม์", "Insurance policies"), keys: ["insurance", "กรมธรรม์"], expect: 1 },
  { id: "POL-01", cls: "policy", title: P("นโยบายภายใน", "Internal policies"), keys: ["policy", "นโยบาย"], expect: 1 },
  { id: "TXN-01", cls: "transaction", title: P("เอกสารธุรกรรมก่อนหน้า / SPA", "Prior deal papers / SPA"), keys: ["spa", "share purchase", "asset purchase", "ซื้อขายหุ้น"], expect: 1 },
];

const CHECKS_BY_TX: Record<DealTx, CheckDef[]> = {
  share: ACQ_CHECKS,
  asset: ACQ_CHECKS.filter((c) => !["COR-03"].includes(c.id)).concat([
    { id: "AST-01", cls: "transaction", title: P("รายการสินทรัพย์ที่โอน", "Asset transfer schedule"), keys: ["asset schedule", "transfer list", "รายการสินทรัพย์"], expect: 1 },
  ]),
  investment: ACQ_CHECKS.filter((c) => ["COR-01", "COR-02", "COR-04", "COR-05", "FIN-01", "EMP-01", "EMP-02", "IP-01", "TXN-01"].includes(c.id)),
  jv: ACQ_CHECKS.filter((c) => ["COR-01", "COR-02", "COM-01", "FIN-01", "IP-01", "TXN-01"].includes(c.id)),
  ipo: ACQ_CHECKS,
  financing: ACQ_CHECKS.filter((c) => ["COR-01", "COR-04", "FIN-01", "FIN-02", "PRP-01", "LIT-01"].includes(c.id)),
  re: ACQ_CHECKS.filter((c) => ["COR-01", "PRP-01", "FIN-01", "REG-01", "INS-01", "LIT-01"].includes(c.id)),
  vendor: ACQ_CHECKS,
  health: ACQ_CHECKS.filter((c) => !c.id.startsWith("TXN")),
};

const CLASSIFY: { cls: DealClass; type: TE; keys: string[] }[] = [
  { cls: "corporate", type: P("เอกสารนิติบุคคล", "Corporate paper"), keys: ["article", "aoa", "moa", "memorandum", "shareholder", "cap table", "register", "certificate", "ข้อบังคับ", "บริคณห์", "ผู้ถือหุ้น", "ใบหุ้น"] },
  { cls: "minutes", type: P("รายงานการประชุม / มติ", "Minutes / resolution"), keys: ["board", "minutes", "resolution", "กรรมการ", "มติ", "รายงานการประชุม"] },
  { cls: "financing", type: P("เอกสารการเงิน", "Financing paper"), keys: ["loan", "facility", "security", "guarantee", "debenture", "กู้", "สินเชื่อ", "ค้ำ"] },
  { cls: "employment", type: P("เอกสารแรงงาน", "Employment paper"), keys: ["employment", "executive", "esop", "incentive", "พนักงาน", "จ้าง"] },
  { cls: "ip", type: P("เอกสารทรัพย์สินทางปัญญา", "IP paper"), keys: ["trademark", "patent", "copyright", "เครื่องหมาย", "สิทธิบัตร", "ลิขสิทธิ์"] },
  { cls: "regulatory", type: P("ใบอนุญาต / หนังสือราชการ", "Licence / regulator paper"), keys: ["licence", "license", "permit", "ใบอนุญาต", "regulatory"] },
  { cls: "litigation", type: P("เอกสารคดี", "Litigation paper"), keys: ["litigation", "complaint", "judgment", "settlement", "claim", "คดี", "ฟ้อง"] },
  { cls: "property", type: P("เอกสารทรัพย์สิน", "Property paper"), keys: ["lease", "land", "mortgage", "construction", "เช่า", "ที่ดิน"] },
  { cls: "privacy", type: P("เอกสารข้อมูลส่วนบุคคล", "Privacy paper"), keys: ["dpa", "privacy", "pdpa", "processing", "breach", "ข้อมูลส่วนบุคคล"] },
  { cls: "tax", type: P("เอกสารภาษี", "Tax paper"), keys: ["tax", "vat", "ภาษี"] },
  { cls: "insurance", type: P("กรมธรรม์", "Insurance paper"), keys: ["insurance", "กรมธรรม์"] },
  { cls: "policy", type: P("นโยบาย", "Policy"), keys: ["policy", "นโยบาย"] },
  { cls: "transaction", type: P("เอกสารธุรกรรม", "Transaction paper"), keys: ["spa", "share purchase", "asset purchase", "ซื้อขายหุ้น"] },
  { cls: "commercial", type: P("สัญญาพาณิชย์", "Commercial contract"), keys: ["msa", "nda", "supply", "distribution", "customer", "supplier", "agent", "franchise", "side letter", "amendment", "termination"] },
];

const CLAUSE_KEYS: { id: string; en: string; th: string; keys: string[] }[] = [
  { id: "coc", en: "Change of control", th: "การเปลี่ยนอำนาจควบคุม", keys: ["change of control", "change-of-control", "อำนาจควบคุม"] },
  { id: "assign", en: "Assignment", th: "การโอนสิทธิ", keys: ["assignment", "assign", "โอนสิทธิ"] },
  { id: "term", en: "Termination", th: "การเลิก", keys: ["termination", "terminate", "เลิก"] },
  { id: "excl", en: "Exclusivity", th: "เอกสิทธิ์", keys: ["exclusiv"] },
  { id: "mfn", en: "MFN", th: "MFN", keys: ["mfn", "most favoured", "most favored"] },
  { id: "ncomp", en: "Non-compete", th: "ห้ามแข่งขัน", keys: ["non-compete", "noncompete", "ห้ามแข่งขัน"] },
  { id: "nsol", en: "Non-solicitation", th: "ห้ามชักชวน", keys: ["non-solicit"] },
  { id: "indem", en: "Indemnity", th: "การชดใช้", keys: ["indemnit"] },
  { id: "cap", en: "Liability cap", th: "เพดานความรับผิด", keys: ["liability", "cap", "ความรับผิด", "เพดาน"] },
  { id: "warr", en: "Warranty", th: "รับประกัน", keys: ["warrant"] },
  { id: "ld", en: "Liquidated damages", th: "เบี้ยปรับ", keys: ["liquidated"] },
  { id: "price", en: "Price adjustment", th: "ปรับราคา", keys: ["price adjustment", "earn"] },
  { id: "fm", en: "Force majeure", th: "เหตุสุดวิสัย", keys: ["force majeure"] },
  { id: "renew", en: "Renewal", th: "ต่ออายุ", keys: ["renew"] },
  { id: "conf", en: "Confidentiality", th: "ความลับ", keys: ["confidential"] },
  { id: "dp", en: "Data processing", th: "ประมวลผลข้อมูล", keys: ["data", "pdpa", "dpa", "ข้อมูล"] },
  { id: "ipown", en: "IP ownership", th: "กรรมสิทธิ์ไอพี", keys: ["intellectual", "ip owner"] },
  { id: "audit", en: "Audit rights", th: "สิทธิตรวจสอบ", keys: ["audit"] },
  { id: "sanc", en: "Sanctions", th: "มาตรการคว่ำบาตร", keys: ["sanction"] },
  { id: "abc", en: "Anti-bribery", th: "ต่อต้านสินบน", keys: ["bribery", "abc", "anti-corrupt"] },
  { id: "ins", en: "Insurance", th: "ประกัน", keys: ["insurance"] },
  { id: "def", en: "Default / cross-default", th: "ผิดนัด / ผิดนัดไขว้", keys: ["default", "acceleration", "ผิดนัด"] },
];

const THAI_PACK: Record<string, TE> = {
  corporate: P("พ.ร.บ.บริษัทมหาชน / ป.พ.พ. ลักษณะหุ้นส่วนบริษัท", "Public Company Act / CCC partnership & company books"),
  employment: P("พ.ร.บ.คุ้มครองแรงงาน พ.ศ. 2541", "Labour Protection Act B.E. 2541"),
  privacy: P("พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562", "PDPA B.E. 2562"),
  ip: P("พ.ร.บ.เครื่องหมายการค้า / สิทธิบัตร / ลิขสิทธิ์", "Trade Marks / Patent / Copyright Acts"),
  property: P("ป.พ.พ. ลักษณะทรัพย์ / ประมวลกฎหมายที่ดิน", "CCC property book / Land Code"),
  financing: P("ป.พ.พ. ลักษณะกู้ยืม / หลักประกันทางธุรกิจ", "CCC loan book / Business Security Act"),
  regulatory: P("กฎหมายอนุญาตประกอบกิจการที่เกี่ยวข้อง + สิทธิ BOI (ถ้ามี)", "Sector licensing + BOI privileges where claimed"),
  litigation: P("ป.วิ.พ. / ป.วิ.อาญา ตามประเภทคดี", "Civil / criminal procedure as the claim type requires"),
  commercial: P("ป.พ.พ. มาตรา 368 ต่อไป — สัญญาต่างตอบแทน", "CCC s.368 ff. — reciprocal contracts"),
};

export function seedDeal(): DealState {
  return {
    assignmentId: "",
    clientId: "",
    transaction: "share",
    scenario: "share100",
    materiality: { contract: 50_000_000, litigation: 10_000_000, customerPct: 5, supplierPct: 10 },
    answers: {},
    cpStatus: {},
    verified: false,
  };
}

export function hydrateDeal(raw: unknown): DealState {
  const base = seedDeal();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<DealState>;
  const tx = r.transaction && r.transaction in DEAL_TX ? r.transaction : base.transaction;
  const sc = r.scenario && r.scenario in DEAL_SCENARIO ? r.scenario : base.scenario;
  return {
    assignmentId: r.assignmentId || "",
    clientId: r.clientId || "",
    transaction: tx,
    scenario: sc,
    materiality: { ...base.materiality, ...(r.materiality || {}) },
    answers: r.answers && typeof r.answers === "object" ? r.answers : {},
    cpStatus: r.cpStatus && typeof r.cpStatus === "object" ? r.cpStatus : {},
    verified: Boolean(r.verified),
  };
}

export function inferDealTx(title: string): DealTx {
  const n = title.toLowerCase();
  if (/asset|สินทรัพย์/.test(n)) return "asset";
  if (/invest|รอบทุน|series/.test(n)) return "investment";
  if (/\bjv\b|joint venture|ร่วมทุน/.test(n)) return "jv";
  if (/\bipo\b|listing|เข้าตลาด/.test(n)) return "ipo";
  if (/financ|facility|loan|สินเชื่อ|กู้/.test(n)) return "financing";
  if (/real estate|property|lease|อสังหา|ที่ดิน/.test(n)) return "re";
  if (/vendor|sell-side|ฝั่งผู้ขาย/.test(n)) return "vendor";
  if (/health|internal|สุขภาพ/.test(n)) return "health";
  if (/acqui|share|ซื้อ|m&a|diligence|dd/.test(n)) return "share";
  return "share";
}

export function classifyFilename(name: string): { class: DealClass; type: TE; family: string } {
  const n = name.toLowerCase();
  for (const row of CLASSIFY) {
    if (row.keys.some((k) => n.includes(k))) {
      return { class: row.cls, type: row.type, family: familyOf(name) };
    }
  }
  return { class: "other", type: P("ยังไม่จัดประเภท", "Unclassified"), family: familyOf(name) };
}

function familyOf(name: string) {
  return name
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[\s_-]*(amend(ment)?|side[-\s]?letter|addendum|variation|supplement|guarantee|termination|#?\d+)[\s_-]*/gi, " ")
    .replace(/\s+/g, " ")
    .trim() || name;
}

export function parseMoney(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const s = String(raw).replace(/,/g, "").toLowerCase();
  const m = s.match(/([\d]+(?:\.\d+)?)\s*(bn|b|พันล้าน|billion|m|ล้าน|million|k)?/);
  if (!m) return null;
  let n = Number(m[1]);
  const u = m[2] || "";
  if (/bn|b|billion|พันล้าน/.test(u)) n *= 1_000_000_000;
  else if (/m|ล้าน|million/.test(u)) n *= 1_000_000;
  else if (u === "k") n *= 1_000;
  return Number.isFinite(n) ? n : null;
}

function hit(text: string, keys: string[]) {
  const n = text.toLowerCase();
  return keys.some((k) => n.includes(k));
}

function moneyLine(X: XrayView | null) {
  if (!X?.money?.[0]) return "";
  const v = X.money[0].v;
  return typeof v === "string" ? v : asLine(v);
}

export type DealFinding = {
  id: string;
  sev: FindingSev;
  title: TE;
  dims: { legal: boolean; financial: boolean; transaction: boolean; operational: boolean; regulatory: boolean; reputational: boolean };
  exposure?: number;
  exposureNote?: TE;
  material: boolean;
  breaker: boolean;
  cls: DealClass | "deal";
  fact: TE;
  interpretation: TE;
  law?: TE;
  evidence: { why: TE; page: string; source: TE; reasoning: TE; action: TE };
  remedy: { kind: RemedyKind; en: string; th: string; href: string };
};

export type DealView = {
  client?: ClientRecord;
  assignment?: AssignmentRecord;
  tx: DealTx;
  scenario: DealScenario;
  files: DealFile[];
  families: { name: string; files: DealFile[] }[];
  index: { cls: DealClass; n: number }[];
  checklist: { id: string; cls: DealClass; title: TE; status: CheckStatus; got: number; expect: number }[];
  missing: { id: string; title: TE; why: TE; cls: DealClass; status: "open" | "answered" }[];
  facts: { k: TE; v: string; src: TE; kind: "fact" | "interpretation" }[];
  clauses: { id: string; label: TE; hits: number; src: TE }[];
  consents: { id: string; contract: TE; party: string; need: TE; deadline: string; status: string }[];
  contradictions: { id: string; title: TE; a: TE; b: TE; why: TE }[];
  authority: { id: string; title: TE; note: TE; sev: FindingSev }[];
  graph: { id: string; label: TE; via?: string }[];
  findings: DealFinding[];
  material: DealFinding[];
  breakers: DealFinding[];
  exposure: { k: TE; v: string; n?: number }[];
  questions: { id: string; q: TE; answer?: string; sufficient: boolean; followUp?: TE }[];
  law: { issue: TE; fact: TE; interp: TE; authority: TE }[];
  health: { overall: "high" | "medium" | "low" | "clear"; critical: number; high: number; medium: number; cleared: number; rec: TE };
  cps: { id: string; title: TE; owner: string; status: "open" | "in_progress" | "cleared"; from: string }[];
  disclosures: { id: string; warranty: TE; body: TE; href: string }[];
  spa: { id: string; move: TE; why: TE; href: string }[];
  sim: {
    scenario: DealScenario;
    rows: { k: TE; share100: string; share49: string; asset: string }[];
    note: TE;
  };
  coverage: { k: TE; v: string; n: TE }[];
  verified: boolean;
};

export function dealOf(input: {
  deal: DealState;
  practice: PracticeState;
  uploads: DealUpload[];
  xray: XrayView | null;
  review?: ReviewLive | null;
  ddLive?: DdLive | null;
}): DealView {
  const { deal, practice, uploads, xray, review, ddLive } = input;
  const assignment = assignmentOf(practice, deal.assignmentId || practice.activeAssignmentId);
  const client = assignment ? clientOf(practice, assignment.clientId) : clientOf(practice, deal.clientId || practice.activeClientId);
  const tx = deal.transaction;
  const scenario = deal.scenario;
  const mat = deal.materiality;

  const files: DealFile[] = [];
  const names = new Set<string>();
  uploads.filter((u) => u.bucket === "diligence" || u.bucket === "xray").forEach((u, i) => {
    const key = `${u.bucket}:${u.name}:${u.size}`;
    if (names.has(key)) return;
    names.add(key);
    const c = classifyFilename(u.name);
    files.push({
      id: `F-${i + 1}`,
      name: u.name,
      size: u.size,
      class: c.class,
      type: c.type,
      family: c.family,
      status: /unsigned|draft|ไม่ลงนาม/.test(u.name) ? "unsigned" : /incomplete|ขาด|missing/.test(u.name) ? "incomplete" : "received",
      source: u.bucket === "xray" ? "xray" : "upload",
      parties: [],
      version: "v1",
    });
  });

  if (xray) {
    const already = files.some((f) => f.source === "xray" || f.name.toLowerCase().includes((xray.ref || "").toLowerCase()));
    if (!already) {
      const title = asLine(xray.doc);
      const c = classifyFilename(title);
      files.unshift({
        id: "F-XRAY",
        name: title,
        size: (xray.pages || 0) * 4000,
        class: c.class === "other" ? "commercial" : c.class,
        type: P("ฉบับที่วางแผนที่", "Mapped instrument"),
        family: familyOf(title),
        status: "received",
        source: "xray",
        parties: [asLine(xray.parties?.[0]?.v)],
        version: xray.ref || "map",
        governingLaw: asLine(xray.laws?.[0]?.k),
        effective: typeof xray.dates?.[0]?.v === "string" ? xray.dates[0].v : asLine(xray.dates?.[0]?.v),
      });
    }
    (xray.missing || []).forEach((m, i) => {
      const title = asLine(m.k);
      files.push({
        id: `F-MISS-${i + 1}`,
        name: title,
        size: 0,
        class: classifyFilename(title).class,
        type: P("อ้างแล้วไม่พบ", "Referenced — not in the room"),
        family: familyOf(title),
        status: "incomplete",
        source: "referenced",
        parties: [],
        version: "—",
      });
    });
  }

  const seenFamily = new Map<string, DealFile[]>();
  files.filter((f) => f.source !== "referenced").forEach((f) => {
    const k = f.family.toLowerCase();
    seenFamily.set(k, [...(seenFamily.get(k) || []), f]);
  });
  seenFamily.forEach((group) => {
    if (group.length < 2) return;
    group.forEach((f) => {
      if (f.status === "received") f.status = "received";
    });
  });
  const nameCount: Record<string, number> = {};
  files.forEach((f) => {
    const k = f.name.toLowerCase();
    nameCount[k] = (nameCount[k] || 0) + 1;
  });
  files.forEach((f) => {
    if (nameCount[f.name.toLowerCase()] > 1 && f.source !== "referenced") f.status = "duplicate";
  });

  const families = [...seenFamily.entries()]
    .filter(([, rows]) => rows.length > 1)
    .map(([name, rows]) => ({ name: rows[0].family || name, files: rows }));

  const index = (Object.keys(DEAL_CLASS) as DealClass[])
    .map((cls) => ({ cls, n: files.filter((f) => f.class === cls && f.source !== "referenced").length }))
    .filter((r) => r.n > 0);

  const received = files.filter((f) => f.source !== "referenced");
  const checks = CHECKS_BY_TX[tx] || ACQ_CHECKS;
  const checklist = checks.map((c) => {
    const hits = received.filter((f) => f.class === c.cls && (c.keys.some((k) => f.name.toLowerCase().includes(k)) || f.class === c.cls));
    const precise = received.filter((f) => c.keys.some((k) => f.name.toLowerCase().includes(k)));
    const got = Math.max(precise.length, hits.length ? 1 : 0);
    const classGot = received.filter((f) => f.class === c.cls).length;
    let status: CheckStatus = "missing";
    if (precise.length >= c.expect || classGot >= c.expect) status = deal.verified ? "cleared" : "received";
    else if (precise.length > 0 || classGot > 0) status = "incomplete";
    else status = "missing";
    return { id: c.id, cls: c.cls, title: c.title, status, got: precise.length || classGot, expect: c.expect };
  });

  const missing = [
    ...checklist.filter((c) => c.status === "missing" || c.status === "incomplete").map((c, i) => ({
      id: `DD-${String(i + 1).padStart(3, "0")}`,
      title: c.title,
      why: c.status === "incomplete"
        ? P(`มี ${c.got} จากที่ควรมีอย่างน้อย ${c.expect} — ชุดยังไม่ครบ`, `${c.got} on file against an expected ${c.expect} — the set is incomplete`)
        : P("รายการตรวจของธุรกรรมนี้ต้องการเอกสารนี้ แต่ห้องยังว่าง", "The transaction checklist requires this paper and the room does not have it"),
      cls: c.cls,
      status: "open" as const,
    })),
    ...(xray?.missing || []).map((m, i) => ({
      id: `DD-X-${String(i + 1).padStart(2, "0")}`,
      title: asTE(m.k),
      why: asTE(m.src),
      cls: classifyFilename(asLine(m.k)).class,
      status: "open" as const,
    })),
  ];

  const party = xray ? asLine(xray.parties?.[0]?.v) : "";
  const value = moneyLine(xray);
  const valueN = parseMoney(value);
  const facts: DealView["facts"] = [];
  if (client) facts.push({ k: P("ลูกค้า / เป้าหมาย", "Client / target"), v: client.name, src: P("บันทึกงานสำนักงาน", "Firm engagement record"), kind: "fact" });
  if (assignment) facts.push({ k: P("งาน", "Engagement"), v: assignment.title, src: P(assignment.id, assignment.id), kind: "fact" });
  facts.push({ k: P("ประเภทธุรกรรม", "Transaction"), v: DEAL_TX[tx].en, src: P("ที่ทนายล็อก", "Counsel-locked"), kind: "fact" });
  if (xray) {
    facts.push({ k: P("คู่สัญญาในแผนที่", "Mapped parties"), v: party || "—", src: asTE(xray.doc), kind: "fact" });
    facts.push({ k: P("มูลค่า", "Value"), v: value || "—", src: P(xray.ref, xray.ref), kind: "fact" });
    if (xray.dates?.[0]) facts.push({ k: P("วันเริ่ม / มีผล", "Start / effective"), v: typeof xray.dates[0].v === "string" ? xray.dates[0].v : asLine(xray.dates[0].v), src: asTE(xray.dates[0].src), kind: "fact" });
    if (xray.laws?.[0]) facts.push({ k: P("กฎหมายที่ใช้ (จากแผนที่)", "Governing law (from the map)"), v: asLine(xray.laws[0].k), src: asTE(xray.laws[0].src), kind: "interpretation" });
  }
  received.slice(0, 12).forEach((f) => {
    facts.push({ k: f.type, v: f.name, src: P(`${f.id} · ${DEAL_CLASS[f.class].en}`, `${f.id} · ${DEAL_CLASS[f.class].en}`), kind: "fact" });
  });

  const blob = [
    xray ? asLine(xray.doc) : "",
    xray ? asLine(xray.brief) : "",
    ...(xray?.heatmap || []).map((h) => asLine(h.k)),
    ...(xray?.unusual || []).map((u) => `${asLine(u.k)} ${asLine(u.vs)}`),
    ...(xray?.missing || []).map((m) => asLine(m.k)),
    ...(review?.findings || []).map((f) => `${asLine(f.issue)} ${asLine(f.cat)}`),
    files.map((f) => f.name).join(" "),
  ].join(" ").toLowerCase();

  const clauses = CLAUSE_KEYS.map((c) => {
    const fromHeat = (xray?.heatmap || []).filter((h) => hit(asLine(h.k), c.keys));
    const fromUn = (xray?.unusual || []).filter((u) => hit(`${asLine(u.k)} ${asLine(u.vs)}`, c.keys));
    const hits = fromHeat.length + fromUn.length + (hit(blob, c.keys) ? 1 : 0);
    const src = fromHeat[0]
      ? P(`ข้อ ${fromHeat[0].cl}`, `cl.${fromHeat[0].cl}`)
      : fromUn[0]
        ? asTE(fromUn[0].src)
        : P("ยังไม่สกัดจากห้อง", "Not yet extracted from the room");
    return { id: c.id, label: P(c.th, c.en), hits, src };
  }).filter((c) => c.hits > 0);

  const findings: DealFinding[] = [];
  const pushF = (f: DealFinding) => {
    const material = f.breaker
      || f.sev === "critical"
      || (f.exposure != null && f.exposure >= mat.contract)
      || (f.cls === "litigation" && (f.exposure || 0) >= mat.litigation);
    findings.push({ ...f, material });
  };

  checklist.filter((c) => c.status === "missing" && ["corporate", "regulatory", "ip", "financing"].includes(c.cls)).forEach((c, i) => {
    const breaker = c.cls === "regulatory" || c.cls === "corporate";
    pushF({
      id: `DF-M-${c.id}`,
      sev: breaker ? "critical" : "high",
      title: P(`เอกสารที่ควรมีแต่ยังไม่มา — ${c.title.t}`, `Should exist, not in the room — ${c.title.e}`),
      dims: { legal: true, financial: false, transaction: true, operational: c.cls === "ip", regulatory: c.cls === "regulatory", reputational: false },
      material: true,
      breaker,
      cls: c.cls,
      fact: P(`ห้องข้อมูลยังไม่มีหลักฐานสำหรับ ${c.title.t}`, `The room has no evidence for ${c.title.e}`),
      interpretation: P("ช่องว่างหลักฐานไม่เท่ากับข้อสรุปทางกฎหมาย — แต่ปิดดีลด้วยช่องนี้ไม่ได้", "A gap is not a legal conclusion — it is still enough to hold the deal"),
      law: THAI_PACK[c.cls],
      evidence: {
        why: P("รายการตรวจของธุรกรรมนี้กำหนดเอกสารชุดนี้", "The transaction checklist requires this set"),
        page: "—",
        source: P("รายการตรวจ Deal X-Ray", "Deal X-Ray checklist"),
        reasoning: P("ระบบถามว่าเอกสารใดควรมี ไม่ใช่แค่สิ่งที่อัปโหลดแล้ว", "The engine asks what should exist, not only what was uploaded"),
        action: P("ออกคำขอเอกสาร แล้วอย่าขึ้นรายงานว่าเคลียร์", "Issue a document request — do not report the item as cleared"),
      },
      remedy: { kind: "request", en: "Open missing-document request", th: "เปิดคำขอเอกสารที่ขาด", href: "/diligence?s=dmiss" },
    });
    void i;
  });

  if (xray) {
    (xray.unusual || []).forEach((u, i) => {
      const title = asTE(u.k);
      const coc = hit(asLine(u.k), ["change of control", "อำนาจควบคุม", "consent", "ยินยอม"]);
      const cap = hit(`${asLine(u.k)} ${asLine(u.vs)}`, ["uncap", "ไม่มีเพดาน", "liability", "ความรับผิด"]);
      pushF({
        id: `DF-X-${i + 1}`,
        sev: coc || cap ? "critical" : "high",
        title,
        dims: { legal: true, financial: cap, transaction: coc, operational: false, regulatory: hit(asLine(u.k), ["pdpa", "ข้อมูล"]), reputational: false },
        exposure: cap ? valueN || undefined : valueN || undefined,
        exposureNote: value ? P(`มูลค่าฉบับที่ map: ${value}`, `Mapped contract value: ${value}`) : undefined,
        material: true,
        breaker: coc || cap,
        cls: "commercial",
        fact: asTE(u.k),
        interpretation: asTE(u.vs),
        law: xray.laws?.[0] ? asTE(xray.laws[0].k) : THAI_PACK.commercial,
        evidence: {
          why: asTE(u.src),
          page: (asLine(u.src).match(/p\.?\s*\d+|หน้า\s*\d+/i) || ["—"])[0],
          source: asTE(xray.doc),
          reasoning: asTE(xray.verdictWhy),
          action: P("เปิดตรวจสัญญา แล้วประกอบฉบับแก้ไขหรือหนังสือยินยอม", "Open Contract Review, then assemble the amendment or consent"),
        },
        remedy: coc
          ? { kind: "consent", en: "Generate consent request", th: "สร้างหนังสือขอความยินยอม", href: "/assemble?s=lib" }
          : { kind: "review", en: "Open Contract Review", th: "เปิดตรวจสัญญา", href: "/review?s=xray" },
      });
    });
    (xray.missing || []).slice(0, 4).forEach((m, i) => {
      pushF({
        id: `DF-XM-${i + 1}`,
        sev: "high",
        title: asTE(m.k),
        dims: { legal: true, financial: false, transaction: true, operational: true, regulatory: hit(asLine(m.k), ["pdpa", "dpa"]), reputational: false },
        material: true,
        breaker: hit(asLine(m.k), ["annex", "ภาคผนวก", "licence", "ใบอนุญาต"]),
        cls: classifyFilename(asLine(m.k)).class,
        fact: P(`แผนที่อ้างถึง แต่ห้องไม่มี: ${asLine(m.k)}`, `The map cites this and the room does not have it: ${asLine(m.k)}`),
        interpretation: P("การอ้างถึงเอกสารที่ไม่มี = ความครบถ้วนของฉบับยังไม่ปิด", "A broken reference means the instrument is not complete"),
        evidence: {
          why: asTE(m.src),
          page: "—",
          source: asTE(xray.doc),
          reasoning: P("เอกสารที่อ้างแล้วหาไม่เจอเป็นช่องว่างหลักฐาน ไม่ใช่ข้อสรุปว่าไม่มีผล", "A cited-but-absent paper is an evidence gap, not a conclusion that the term is void"),
          action: P("ออกคำขอเอกสาร แล้วอย่าเคลียร์รายการ", "Issue the request and do not clear the row"),
        },
        remedy: { kind: "request", en: "Request the missing paper", th: "ขอเอกสารที่ขาด", href: "/diligence?s=dmiss" },
      });
    });
  }

  (review?.findings || []).filter((f) => f.sev === "high").forEach((f, i) => {
    pushF({
      id: f.id || `DF-R-${i + 1}`,
      sev: "high",
      title: asTE(f.issue),
      dims: { legal: true, financial: true, transaction: true, operational: false, regulatory: false, reputational: false },
      material: true,
      breaker: false,
      cls: "commercial",
      fact: asTE(f.src),
      interpretation: asTE(f.inter),
      evidence: {
        why: asTE(f.why),
        page: "—",
        source: asTE(f.src),
        reasoning: asTE(f.why),
        action: asTE(f.word),
      },
      remedy: { kind: "amendment", en: "Generate amendment", th: "สร้างฉบับแก้ไข", href: "/assemble?s=iv" },
    });
  });

  (ddLive?.flags || []).forEach((f) => {
    if (findings.some((x) => x.id === f.id)) return;
    pushF({
      id: f.id,
      sev: f.sev === "vhigh" || f.sev === "high" ? "critical" : f.sev === "low" ? "low" : "medium",
      title: asTE(f.t),
      dims: { legal: true, financial: true, transaction: true, operational: false, regulatory: false, reputational: false },
      material: true,
      breaker: f.sev === "vhigh" || f.sev === "high",
      cls: "deal",
      fact: asTE(f.im),
      interpretation: asTE(f.a),
      evidence: {
        why: asTE(f.im),
        page: "—",
        source: asTE(f.ws),
        reasoning: P("ธงจากเครื่องตรวจห้อง — ทนายเป็นผู้ยืนยัน", "Room-engine flag — counsel verifies"),
        action: asTE(f.a),
      },
      remedy: { kind: "cp", en: "Turn into a condition precedent", th: "แปลงเป็นเงื่อนไขบังคับก่อน", href: "/diligence?s=dcp" },
    });
  });

  const consents: DealView["consents"] = [];
  if (clauses.some((c) => c.id === "coc" || c.id === "assign")) {
    const contract = xray ? asTE(xray.doc) : P("สัญญาพาณิชย์ในห้อง", "Commercial contracts in the room");
    consents.push({
      id: "CT-COC-01",
      contract,
      party: party.split("/")[1]?.trim() || party || "—",
      need: P("ความยินยอมเป็นหนังสือก่อนปิด", "Written consent before closing"),
      deadline: "CP",
      status: "open",
    });
    if (!findings.some((f) => f.remedy.kind === "consent")) {
      pushF({
        id: "DF-COC-01",
        sev: "critical",
        title: P("สัญญาสำคัญมีเงื่อนไขเปลี่ยนอำนาจควบคุม", "Material contract carries a change-of-control condition"),
        dims: { legal: true, financial: true, transaction: true, operational: true, regulatory: false, reputational: false },
        exposure: valueN || undefined,
        exposureNote: value ? P(`รายได้/มูลค่าที่ผูกกับฉบับนี้: ${value}`, `Value tied to this paper: ${value}`) : undefined,
        material: true,
        breaker: scenario !== "share49",
        cls: "commercial",
        fact: P("พบถ้อยคำ change of control / การโอนสิทธิ ในแผนที่หรือชื่อเอกสาร", "Change-of-control or assignment language is on the map or in the file name"),
        interpretation: P(
          scenario === "asset" ? "ซื้อสินทรัพย์มักเข้าเงื่อนไขโอนสิทธิ — ต้องขอความยินยอมหรือบอกกล่าว" : scenario === "share49" ? "ซื้อ 49% อาจไม่เข้านิยามอำนาจควบคุม ถ้าเกณฑ์คือเสียงข้างมาก — ต้องอ่านนิยาม" : "ซื้อ 100% มักเข้าเงื่อนไขยินยอมหรือบอกกล่าว",
          scenario === "asset" ? "An asset deal usually triggers assignment — consent or notice is required" : scenario === "share49" ? "A 49% buy may miss a majority-control definition — read the clause" : "A 100% buy usually triggers consent or notice"
        ),
        law: THAI_PACK.commercial,
        evidence: {
          why: P("เงื่อนไขคู่สัญญาบุคคลที่สามกระทบสิทธิปิดดีล", "A third-party consent right can hold closing"),
          page: clauses.find((c) => c.id === "coc")?.src.e || "—",
          source: contract,
          reasoning: P("สมมติฐาน: นิยาม change of control รวมการเปลี่ยนผู้ถือหุ้นเสียงข้างมาก — ทนายต้องยืนยันถ้อยคำ", "Assumption: change of control includes a majority-share shift — counsel must confirm the words"),
          action: P("สร้างหนังสือขอความยินยอม แล้วติดตามใน Consent Tracker", "Assemble the consent request and track it"),
        },
        remedy: { kind: "consent", en: "Generate consent request", th: "สร้างหนังสือขอความยินยอม", href: "/assemble?s=lib" },
      });
    }
  } else if (received.some((f) => f.class === "commercial" || f.class === "financing") && !xray) {
    pushF({
      id: "DF-COC-SCAN",
      sev: "medium",
      title: P("ยังไม่ได้สกัดเงื่อนไขเปลี่ยนอำนาจควบคุมจากสัญญาในห้อง", "Change-of-control terms are not yet extracted from room contracts"),
      dims: { legal: true, financial: false, transaction: true, operational: false, regulatory: false, reputational: false },
      material: true,
      breaker: false,
      cls: "commercial",
      fact: P(`${received.filter((f) => f.class === "commercial" || f.class === "financing").length} ฉบับพาณิชย์/การเงินอยู่ในห้อง แต่ยังไม่มีแผนที่ข้อสัญญา`, "Commercial/financing papers are in the room without a clause map"),
      interpretation: P("ยังสรุปไม่ได้ว่าต้องขอความยินยอมกี่ฉบับ", "Consent count is not yet a fact"),
      evidence: {
        why: P("ไม่มีแผนที่ X-Ray ของฉบับในห้อง", "No X-Ray map of the room instruments"),
        page: "—",
        source: P("ห้องข้อมูล", "Data room"),
        reasoning: P("การมีไฟล์ ≠ การอ่านข้อ — ต้อง map ก่อนขึ้นธงยินยอม", "A file is not a reading — map before you flag consents"),
        action: P("วางแผนที่สัญญาสำคัญใน Contract Review แล้วป้อนกลับ Deal X-Ray", "Map the material contracts in Review and feed Deal X-Ray"),
      },
      remedy: { kind: "review", en: "Map a material contract", th: "วางแผนที่สัญญาสำคัญ", href: "/review?s=xray" },
    });
  }

  const contradictions: DealView["contradictions"] = [];
  if (xray?.dates && xray.dates.length > 1 && /conflict|ขัด/.test(asLine(xray.dates[1]?.v) + asLine(xray.dates[1]?.src))) {
    contradictions.push({
      id: "CX-01",
      title: P("วันที่ในแผนที่ขัดกัน", "Mapped dates contradict each other"),
      a: P(`${asLine(xray.dates[0].k)} · ${typeof xray.dates[0].v === "string" ? xray.dates[0].v : asLine(xray.dates[0].v)}`, `${asLine(xray.dates[0].k)} · ${typeof xray.dates[0].v === "string" ? xray.dates[0].v : asLine(xray.dates[0].v)}`),
      b: P(`${asLine(xray.dates[1].k)} · ${typeof xray.dates[1].v === "string" ? xray.dates[1].v : asLine(xray.dates[1].v)}`, `${asLine(xray.dates[1].k)} · ${typeof xray.dates[1].v === "string" ? xray.dates[1].v : asLine(xray.dates[1].v)}`),
      why: asTE(xray.dates[1].src),
    });
  }
  if (value && xray?.money?.some((m) => /uncap|ไม่มีเพดาน/i.test(typeof m.v === "string" ? m.v : asLine(m.v)))) {
    contradictions.push({
      id: "CX-02",
      title: P("มูลค่ามีตัวเลข แต่ความรับผิดบางหัวไม่มีเพดาน", "The paper states a value, and a liability head is uncapped"),
      a: P(`มูลค่า ${value}`, `Value ${value}`),
      b: P("ข้อเรียกร้องบางประเภทอยู่นอกเพดาน", "A claim class sits outside the cap"),
      why: P("ข้อเท็จจริงสองข้อในฉบับเดียวกัน — ต้องอ่านคู่กันก่อนตั้งเพดานใน SPA", "Two facts in one paper — read them together before you set SPA caps"),
    });
  }
  const hasRegister = received.some((f) => /shareholder|cap table|ผู้ถือหุ้น|ตารางทุน/i.test(f.name));
  const hasEmployment = received.some((f) => f.class === "employment");
  if (hasRegister && hasEmployment) {
    contradictions.push({
      id: "CX-03",
      title: P("ต้องเทียบสิทธิในสัญญาจ้างกับบัญชีผู้ถือหุ้น", "Equity grants in employment papers must be checked against the register"),
      a: P("มีเอกสารแรงงานที่อาจให้สิทธิ", "Employment papers that may grant equity"),
      b: P("มีบัญชีผู้ถือหุ้น / ตารางทุนในห้อง", "A shareholder list / cap table is in the room"),
      why: P("ระบบไม่ invent ตัวเลขหุ้น — ชี้ให้ทนายเทียบสองแหล่ง", "The engine does not invent share counts — it sends counsel to the two sources"),
    });
  }
  const hasBoard = received.some((f) => f.class === "minutes");
  const hasLoan = received.some((f) => f.class === "financing") || clauses.some((c) => c.id === "def");
  if (hasBoard && hasLoan) {
    contradictions.push({
      id: "CX-04",
      title: P("วงเงินกู้ต้องเทียบมติกรรมการ", "Borrowing limits must be read against board authority"),
      a: P("มีเอกสารการเงินในห้องหรือในแผนที่", "Financing paper is in the room or on the map"),
      b: P("มีรายงาน/มติกรรมการ", "Board minutes / resolutions are on file"),
      why: P("ถ้าวงเงินในสัญญาสูงกว่าอำนาจที่อนุมัติ ถือเป็นประเด็นอำนาจลงนาม", "If the facility exceeds the approved authority, it is an authorization issue"),
    });
  }
  contradictions.forEach((c) => {
    pushF({
      id: `DF-${c.id}`,
      sev: c.id === "CX-02" ? "high" : "medium",
      title: c.title,
      dims: { legal: true, financial: c.id !== "CX-03", transaction: true, operational: false, regulatory: false, reputational: c.id === "CX-03" },
      material: true,
      breaker: false,
      cls: "deal",
      fact: c.a,
      interpretation: c.b,
      evidence: {
        why: c.why,
        page: "—",
        source: P("เครื่องเทียบข้ามเอกสาร", "Cross-document engine"),
        reasoning: P("ข้อขัดแย้งคือสมมติฐานที่ต้องพิสูจน์ — ไม่ใช่คำพิพากษา", "A contradiction is a hypothesis to prove — not a verdict"),
        action: P("ตั้งคำถามฝ่ายบริหารแล้วแนบหลักฐาน", "Put the question to management and attach evidence"),
      },
      remedy: { kind: "request", en: "Ask management", th: "ถามฝ่ายบริหาร", href: "/diligence?s=dqa" },
    });
  });

  const authority: DealView["authority"] = [];
  if (valueN && valueN > 100_000_000 && !hasBoard) {
    authority.push({
      id: "AU-01",
      title: P("มูลค่าฉบับสูง แต่ยังไม่มีมติกรรมการในห้อง", "High contract value and no board resolution in the room"),
      note: P(`${formatThb(valueN)} — ต้องพิสูจน์อำนาจลงนามและมติ`, `${formatThb(valueN)} — signing authority and a resolution still need proof`),
      sev: "high",
    });
    pushF({
      id: "DF-AU-01",
      sev: "high",
      title: P("ช่องว่างอำนาจลงนาม — ไม่มีมติรองรับมูลค่านี้", "Authorization gap — no resolution supporting this value"),
      dims: { legal: true, financial: true, transaction: true, operational: false, regulatory: false, reputational: false },
      exposure: valueN,
      material: true,
      breaker: false,
      cls: "corporate",
      fact: P(`มูลค่าที่อ่านได้ ${formatThb(valueN)} และห้องไม่มีรายงาน/มติกรรมการ`, `Readable value ${formatThb(valueN)} and the room has no board minutes/resolution`),
      interpretation: P("อาจเกินอำนาจกรรมการหรือผู้รับมอบ — ยังไม่ใช่ข้อสรุปว่าสัญญาเป็นโมฆะ", "It may exceed delegated authority — that is not yet a finding that the contract is void"),
      law: THAI_PACK.corporate,
      evidence: {
        why: P("อำนาจลงนามต้องมีหลักฐาน ไม่ใช่เดาจากตำแหน่ง", "Authority needs evidence, not an inferred title"),
        page: "—",
        source: P("เครื่องอำนาจนิติบุคคล", "Corporate authority engine"),
        reasoning: P("เกณฑ์ภายในที่ใช้: มูลค่า > THB 100m ต้องมีมติในห้อง", "Working assumption: value above THB 100m needs a resolution in the room"),
        action: P("ขอสำเนามติและตารางอำนาจลงนาม", "Request the resolution and the signing-authority matrix"),
      },
      remedy: { kind: "request", en: "Request board evidence", th: "ขอมติกรรมการ", href: "/diligence?s=dmiss" },
    });
  }
  if (hasBoard && hasLoan) {
    authority.push({
      id: "AU-02",
      title: P("ต้องเทียบอำนาจกู้กับมติ", "Borrowing authority must be read against the minutes"),
      note: P("อย่าสรุปว่าวงเงินถูกต้องจนกว่าจะอ่านมติ", "Do not treat the facility limit as approved until the minutes are read"),
      sev: "medium",
    });
  }

  const graph: DealView["graph"] = [
    { id: "g-co", label: P(client?.name || "บริษัทเป้าหมาย", client?.name || "Target company") },
    { id: "g-sh", label: P("ผู้ถือหุ้น / UBO", "Shareholders / UBO"), via: hasRegister ? "register" : "gap" },
    { id: "g-dir", label: P("กรรมการ", "Directors"), via: hasBoard ? "minutes" : "gap" },
    { id: "g-ct", label: P("สัญญา", "Contracts"), via: String(received.filter((f) => f.class === "commercial").length + (xray ? 1 : 0)) },
    { id: "g-cp", label: P(party || "คู่สัญญา", party || "Counterparties") },
    { id: "g-ln", label: P("สินเชื่อ / ค้ำ", "Loans / guarantees"), via: hasLoan ? "on-file" : "gap" },
    { id: "g-lit", label: P("คดี", "Litigation"), via: received.some((f) => f.class === "litigation") ? "on-file" : "gap" },
    { id: "g-reg", label: P("ผู้กำกับ", "Regulators"), via: received.some((f) => f.class === "regulatory") ? "on-file" : "gap" },
  ];

  if (clauses.some((c) => c.id === "coc") && hasLoan) {
    pushF({
      id: "DF-XD-01",
      sev: "critical",
      title: P("สายความเสี่ยง: ดีล → สัญญา → สินเชื่อ (ผิดนัด/เร่งชำระ)", "Risk chain: deal → contract → facility (default / acceleration)"),
      dims: { legal: true, financial: true, transaction: true, operational: true, regulatory: false, reputational: false },
      exposure: valueN || undefined,
      material: true,
      breaker: true,
      cls: "financing",
      fact: P("พบทั้งเงื่อนไขอำนาจควบคุมและเอกสาร/ข้อผิดนัดทางการเงิน", "Both change-of-control language and a financing default path are present"),
      interpretation: P("อาจเกิดเร่งชำระหรือผิดนัดไขว้เมื่อปิดดีล — ต้องอ่านนิยาม event of default", "Closing may accelerate or cross-default — read the event-of-default definition"),
      law: THAI_PACK.financing,
      evidence: {
        why: P("กราฟนิติบุคคลเชื่อมสัญญาเข้ากับสินเชื่อ", "The legal graph links the contract family to the facility"),
        page: "—",
        source: P("Risk graph", "Risk graph"),
        reasoning: P("สมมติฐาน: เอกสารการเงินในห้องเป็นสัญญาเดียวกับสาย CoC — ทนายยืนยันก่อนขึ้น IC", "Assumption: the financing paper in the room is on the same CoC chain — counsel confirms before IC"),
        action: P("ขอ waiver / consent จากเจ้าหนี้ แล้วตั้งเป็น CP", "Seek a lender waiver/consent and park it as a CP"),
      },
      remedy: { kind: "cp", en: "Create lender CP", th: "ตั้ง CP เจ้าหนี้", href: "/diligence?s=dcp" },
    });
  }

  const material = findings.filter((f) => f.material);
  const breakers = findings.filter((f) => f.breaker);
  const critical = findings.filter((f) => f.sev === "critical").length;
  const high = findings.filter((f) => f.sev === "high").length;
  const medium = findings.filter((f) => f.sev === "medium").length;
  const cleared = deal.verified ? checklist.filter((c) => c.status === "cleared").length : 0;

  const exposure: DealView["exposure"] = [
    { k: P("มูลค่าฉบับที่ map", "Mapped contract value"), v: value || "—", n: valueN || undefined },
    { k: P("ความรับผิดไม่มีเพดาน", "Uncapped indemnities / caps"), v: String(clauses.filter((c) => c.id === "cap" || c.id === "indem").length || (xray?.money || []).filter((m) => /uncap|ไม่มีเพดาน/i.test(typeof m.v === "string" ? m.v : asLine(m.v))).length) },
    { k: P("สัญญาที่อาจต้องยินยอม", "Contracts that may need consent"), v: String(consents.length) },
    { k: P("ประเด็นที่ผ่านเกณฑ์นัยสำคัญ", "Findings above materiality"), v: String(material.length) },
    { k: P("เกณฑ์สัญญาสำคัญ", "Material-contract threshold"), v: formatThb(mat.contract) },
    { k: P("เกณฑ์คดี", "Litigation threshold"), v: formatThb(mat.litigation) },
  ];

  const questions: DealView["questions"] = [
    ...contradictions.map((c, i) => ({
      id: `DD-Q-${String(i + 1).padStart(3, "0")}`,
      q: P(`โปรดอธิบาย: ${c.title.t}`, `Please explain: ${c.title.e}`),
      answer: deal.answers[`DD-Q-${String(i + 1).padStart(3, "0")}`]?.text,
      sufficient: false,
      followUp: undefined as TE | undefined,
    })),
    ...missing.slice(0, 6).map((m, i) => ({
      id: `DD-Q-${String(contradictions.length + i + 1).padStart(3, "0")}`,
      q: P(`โปรดส่งหลักฐาน: ${m.title.t}`, `Please provide evidence: ${m.title.e}`),
      answer: deal.answers[`DD-Q-${String(contradictions.length + i + 1).padStart(3, "0")}`]?.text,
      sufficient: false,
      followUp: undefined as TE | undefined,
    })),
    ...consents.map((c, i) => ({
      id: `DD-Q-C${i + 1}`,
      q: P(`โปรดยืนยันสถานะความยินยอมตาม ${c.contract.t}`, `Please confirm consent status under ${c.contract.e}`),
      answer: deal.answers[`DD-Q-C${i + 1}`]?.text,
      sufficient: false,
      followUp: undefined as TE | undefined,
    })),
  ].map((q) => {
    const text = (q.answer || "").trim();
    if (!text) return q;
    const weak = text.length < 24 || /should not|ไม่จำเป็น|ไม่ต้อง|unnecessary/i.test(text);
    return {
      ...q,
      sufficient: !weak,
      followUp: weak
        ? P("คำตอบยังไม่ชี้ข้อสัญญาหรือหลักฐานที่ขอ — สร้างคำถามติดตาม", "The answer does not address the clause or the evidence requested — a follow-up is required")
        : undefined,
    };
  });

  const law: DealView["law"] = findings.slice(0, 8).map((f) => ({
    issue: f.title,
    fact: f.fact,
    interp: f.interpretation,
    authority: f.law || P("ยังไม่ผูกบท — ทนายเลือกชุดกฎหมายไทย", "No statute bound yet — counsel picks the Thai pack"),
  }));

  const overall: DealView["health"]["overall"] = breakers.length || critical ? "high" : high ? "medium" : medium ? "low" : "clear";
  const health = {
    overall,
    critical,
    high,
    medium,
    cleared,
    rec: breakers.length
      ? P(`เดินหน้าได้ถ้าตั้ง ${Math.min(breakers.length, 7)} เงื่อนไขบังคับก่อน`, `Proceed subject to ${Math.min(breakers.length, 7)} conditions precedent`)
      : P("ยังไม่เห็นประเด็นที่ฆ่าดีลจากหลักฐานที่มี — ช่องว่างเอกสารยังต้องปิด", "No kill item from the evidence on file — documentary gaps still have to close"),
  };

  const cps: DealView["cps"] = breakers.slice(0, 8).map((f, i) => {
    const id = `CP-${String(i + 1).padStart(2, "0")}`;
    return {
      id,
      title: f.title,
      owner: assignment?.lead || "Counsel",
      status: deal.cpStatus[id] || "open",
      from: f.id,
    };
  });

  const disclosures: DealView["disclosures"] = [
    ...findings.filter((f) => f.cls === "litigation" || /litigat|คดี|claim/i.test(f.title.e + f.title.t)).map((f, i) => ({
      id: `SCH-LIT-${i + 1}`,
      warranty: P("บริษัทไม่มีคดีหรือข้อพิพาทที่มีนัยสำคัญ", "The Company is not party to material litigation"),
      body: f.fact,
      href: "/assemble?s=draft",
    })),
    ...consents.map((c, i) => ({
      id: `SCH-CON-${i + 1}`,
      warranty: P("สัญญาสำคัญไม่ต้องการความยินยอมเมื่อเปลี่ยนอำนาจควบคุม", "Material contracts do not require consent on change of control"),
      body: c.need,
      href: "/assemble?s=draft",
    })),
    ...findings.filter((f) => f.cls === "ip").slice(0, 2).map((f, i) => ({
      id: `SCH-IP-${i + 1}`,
      warranty: P("บริษัทเป็นเจ้าของทรัพย์สินทางปัญญาที่ใช้ในการประกอบกิจการ", "The Company owns the IP used in the business"),
      body: f.fact,
      href: "/assemble?s=draft",
    })),
  ];

  const spa: DealView["spa"] = breakers.slice(0, 6).map((f, i) => ({
    id: `SPA-${i + 1}`,
    move: f.remedy.kind === "consent"
      ? P("เงื่อนไขบังคับก่อน + รับรองเรื่องความยินยอม", "Condition precedent + consent representation")
      : f.cls === "ip"
        ? P("รับชดใช้เฉพาะเรื่อง + โอนสิทธิไอพี", "Specific indemnity + IP assignment")
        : P("รับชดใช้เฉพาะเรื่อง / บัญชี Escrow / ปรับราคา", "Specific indemnity / escrow / price adjustment"),
    why: f.title,
    href: f.remedy.href,
  }));

  const simCounts = {
    share100: {
      consent: String(Math.max(consents.length, clauses.some((c) => c.id === "coc") ? 1 : 0)),
      licence: received.some((f) => f.class === "regulatory") ? "notify" : "missing evidence",
      employees: "stay with company",
      ip: "stays with company",
      finance: clauses.some((c) => c.id === "def") || hasLoan ? "CoC / default risk" : "untested",
    },
    share49: {
      consent: clauses.some((c) => c.id === "coc") ? "maybe — read definition" : "0 known",
      licence: "usually no transfer",
      employees: "stay with company",
      ip: "stays with company",
      finance: "reserved-matters / change-of-control threshold",
    },
    asset: {
      consent: String(Math.max(consents.length, 1) + received.filter((f) => f.class === "commercial").length),
      licence: "transfer / re-apply",
      employees: "TUPE-like transfer analysis",
      ip: "assignment required",
      finance: "may remain with seller unless novated",
    },
  };
  const sim: DealView["sim"] = {
    scenario,
    rows: [
      { k: P("สัญญาที่ต้องขอความยินยอม / บอกกล่าว", "Contracts needing consent / notice"), share100: simCounts.share100.consent, share49: simCounts.share49.consent, asset: simCounts.asset.consent },
      { k: P("ใบอนุญาต", "Licences"), share100: simCounts.share100.licence, share49: simCounts.share49.licence, asset: simCounts.asset.licence },
      { k: P("พนักงาน", "Employees"), share100: simCounts.share100.employees, share49: simCounts.share49.employees, asset: simCounts.asset.employees },
      { k: P("ทรัพย์สินทางปัญญา", "IP"), share100: simCounts.share100.ip, share49: simCounts.share49.ip, asset: simCounts.asset.ip },
      { k: P("การเงิน", "Financing"), share100: simCounts.share100.finance, share49: simCounts.share49.finance, asset: simCounts.asset.finance },
    ],
    note: P(
      "การจำลองเปลี่ยนสมมติฐานโครงสร้าง ไม่ได้เปลี่ยนข้อเท็จจริงในเอกสาร — ทนายยืนยันก่อนใช้กับ SPA",
      "The simulator changes structure assumptions, not the facts in the papers — counsel confirms before the SPA moves"
    ),
  };

  const coverage: DealView["coverage"] = [
    { k: P("เอกสารในห้อง", "Documents in the room"), v: String(received.length), n: P("อัปโหลด + ฉบับที่ map", "Uploads + mapped instrument") },
    { k: P("รายการตรวจ", "Checklist items"), v: `${checklist.filter((c) => c.status === "received" || c.status === "cleared").length}/${checklist.length}`, n: P("ตามประเภทธุรกรรม", "By transaction type") },
    { k: P("คำขอเอกสารที่ขาด", "Missing-document requests"), v: String(missing.length), n: P("สิ่งที่ควรมีแต่ยังไม่มา", "What should exist but is not here") },
    { k: P("ข้อค้นพบที่ผ่านนัยสำคัญ", "Material findings"), v: String(material.length), n: P(`จาก ${findings.length} ข้อ`, `of ${findings.length} findings`) },
  ];

  return {
    client,
    assignment,
    tx,
    scenario,
    files,
    families,
    index,
    checklist,
    missing,
    facts,
    clauses,
    consents,
    contradictions,
    authority,
    graph,
    findings,
    material,
    breakers,
    exposure,
    questions,
    law,
    health,
    cps,
    disclosures,
    spa,
    sim,
    coverage,
    verified: deal.verified,
  };
}

export function dealReportText(lang: "en" | "th", view: DealView) {
  const th = lang === "th";
  const line = (x: TE) => (th ? x.t : x.e);
  return [
    `LAW24 · ${th ? "รายงาน Deal X-Ray" : "Deal X-Ray report"}`,
    `${view.assignment?.id || "—"} · ${view.client?.name || "—"} · ${th ? DEAL_TX[view.tx].th : DEAL_TX[view.tx].en}`,
    "",
    th ? "ประเด็นที่อาจฆ่าดีล" : "Potential deal breakers",
    ...(view.breakers.length ? view.breakers.map((f) => `${f.id}  ${line(f.title)}`) : [th ? "ยังไม่มีจากหลักฐานในห้อง" : "None from the evidence in the room"]),
    "",
    th ? "ข้อค้นพบสำคัญ" : "Material findings",
    ...view.material.slice(0, 12).map((f) => `${f.id}  ${line(f.title)}`),
    "",
    th ? "คำแนะนำ" : "Recommendation",
    line(view.health.rec),
    "",
    th ? "ทุกข้อสรุปชี้หลักฐาน — เครื่องยนต์ไม่ลงนามแทน" : "Every conclusion cites evidence — the engine never signs.",
  ].join("\n");
}
