import { PDFDocument, PageSizes } from "pdf-lib";
import { downloadBlob } from "./demo";
import type { Lang, TE } from "./model";
import type { AssemblyInput } from "./assembly";

const P = (t: string, e: string): TE => ({ t, e });

export const MOU_TYPE_ID = "CT-001";

export type MouFieldType = "text" | "textarea" | "select";

export type MouField = {
  id: string;
  label: TE;
  hint: TE;
  type: MouFieldType;
  required: boolean;
  kind: AssemblyInput["kind"];
  options?: TE[];
};

export const MOU_FIELDS: MouField[] = [
  { id: "matter", label: P("ลูกค้า / เรื่อง", "Client / matter"), hint: P("ชื่อลูกค้าและชื่องาน", "Client and engagement name"), type: "text", required: true, kind: "fact" },
  { id: "partyA", label: P("ฝ่าย A — ชื่อนิติบุคคลและบทบาท", "Party A — legal name and role"), hint: P("เช่น บริษัท เอ จำกัด (ผู้ร่วมมือหลัก)", "e.g. Alpha Co., Ltd. (principal collaborator)"), type: "text", required: true, kind: "fact" },
  { id: "signA", label: P("ผู้ลงนามฝ่าย A / ตำแหน่ง", "Party A signatory / title"), hint: P("ผู้มีอำนาจลงนาม", "Person with authority to sign"), type: "text", required: true, kind: "fact" },
  { id: "partyB", label: P("ฝ่าย B — ชื่อนิติบุคคลและบทบาท", "Party B — legal name and role"), hint: P("เช่น บริษัท บี จำกัด (คู่เจรจา)", "e.g. Beta Co., Ltd. (counterparty)"), type: "text", required: true, kind: "fact" },
  { id: "signB", label: P("ผู้ลงนามฝ่าย B / ตำแหน่ง", "Party B signatory / title"), hint: P("ผู้มีอำนาจลงนาม", "Person with authority to sign"), type: "text", required: true, kind: "fact" },
  { id: "purpose", label: P("วัตถุประสงค์ความร่วมมือ", "Purpose of cooperation"), hint: P("กรอบที่บันทึกนี้ครอบคลุม", "The frame this MOU is meant to cover"), type: "textarea", required: true, kind: "fact" },
  { id: "scope", label: P("ขอบเขต — รวม / ไม่รวม", "Scope — in / out"), hint: P("สิ่งที่ทำร่วมกัน และสิ่งที่ยังไม่ตกลง", "What is in the cooperation and what is still off the table"), type: "textarea", required: true, kind: "fact" },
  {
    id: "binding",
    label: P("ท่าทีการผูกพัน", "Binding posture"),
    hint: P("แยกส่วนที่ผูกพันออกจากส่วนที่ไม่ผูกพัน", "Separate binding from non-binding parts"),
    type: "select",
    required: true,
    kind: "instruction",
    options: [
      P("ไม่ผูกพัน ยกเว้นข้อที่ระบุ", "Non-binding except listed clauses"),
      P("ผูกพันบางส่วนตามที่ระบุ", "Partly binding as listed"),
      P("ตั้งใจให้ผูกพันทั้งฉบับ", "Intended to bind as a whole"),
    ],
  },
  { id: "bindClauses", label: P("ข้อที่ผูกพัน", "Clauses that bind"), hint: P("ความลับ / เอกสิทธิ์ / ค่าใช้จ่าย / กฎหมาย", "Confidentiality / exclusivity / costs / governing law"), type: "text", required: true, kind: "instruction" },
  { id: "term", label: P("วันเริ่ม ระยะเวลา และการเลิกเจรจา", "Start, term and walk-away"), hint: P("เมื่อเริ่ม เมื่อสิ้น และเลิกเจรจาได้อย่างไร", "When it starts, when it ends, and how talks stop"), type: "text", required: true, kind: "fact" },
  {
    id: "confidential",
    label: P("การรักษาความลับ", "Confidentiality"),
    hint: P("มีหน้าที่รักษาความลับหรือไม่ และกี่ปี", "Whether confidentiality applies, and for how long"),
    type: "select",
    required: true,
    kind: "instruction",
    options: [
      P("มี — 2 ปี หลังสิ้นสุด", "Yes — 2 years after end"),
      P("มี — 3 ปี หลังสิ้นสุด", "Yes — 3 years after end"),
      P("มี — ไม่จำกัดเวลาสำหรับความลับทางการค้า", "Yes — trade secrets unlimited"),
      P("ไม่มี — ใช้ NDA แยก", "No — a separate NDA applies"),
    ],
  },
  {
    id: "exclusive",
    label: P("เอกสิทธิ์การเจรจา", "Exclusivity"),
    hint: P("ห้ามเจรจาคู่ขนานหรือไม่", "Whether parallel talks are barred"),
    type: "select",
    required: false,
    kind: "instruction",
    options: [
      P("ไม่มีเอกสิทธิ์", "No exclusivity"),
      P("เจรจาเฉพาะในช่วงที่ระบุ", "Exclusive negotiation for a stated window"),
      P("เขตพื้นที่หรือธุรกิจเฉพาะ", "Exclusive territory or line of business"),
    ],
  },
  { id: "costs", label: P("ค่าใช้จ่าย", "Costs"), hint: P("ใครรับภาระค่าที่ปรึกษาและค่าดำเนินการ", "Who bears advisers and working costs"), type: "text", required: false, kind: "fact" },
  { id: "next", label: P("สัญญาฉบับสมบูรณ์ขั้นถัดไป", "Next definitive document"), hint: P("ประเภทสัญญาและวันที่เป้า", "Type of agreement and target date"), type: "text", required: true, kind: "instruction" },
  {
    id: "law",
    label: P("กฎหมายและศาล", "Governing law and forum"),
    hint: P("กฎหมายไทยเป็นท่าทีบ้าน", "Thai law is the house position"),
    type: "select",
    required: true,
    kind: "instruction",
    options: [
      P("กฎหมายไทย / ศาลไทย", "Thai law / Thai courts"),
      P("ขอยกเว้นพร้อมเหตุ", "Exception with recorded reason"),
    ],
  },
  {
    id: "language",
    label: P("ภาษาของบันทึก", "Language of the MOU"),
    hint: P("ฉบับที่ใช้บังคับถ้ามีสองภาษา", "The controlling text if bilingual"),
    type: "select",
    required: false,
    kind: "fact",
    options: [
      P("ไทยเป็นหลัก อังกฤษคู่", "Thai controlling, English mirror"),
      P("อังกฤษเป็นหลัก ไทยคู่", "English controlling, Thai mirror"),
      P("ภาษาเดียว — ไทย", "Thai only"),
      P("ภาษาเดียว — อังกฤษ", "English only"),
    ],
  },
];

function asFactKind(field: MouField): AssemblyInput["kind"] {
  return field.kind;
}

export function seedMou(): Record<string, string> {
  return Object.fromEntries(MOU_FIELDS.map((f) => [f.id, ""]));
}

export function hydrateMou(raw: unknown): Record<string, string> {
  const base = seedMou();
  if (!raw || typeof raw !== "object") return base;
  const v = raw as Record<string, unknown>;
  for (const f of MOU_FIELDS) {
    if (typeof v[f.id] === "string") base[f.id] = v[f.id] as string;
  }
  return base;
}

export function mouMissing(answers: Record<string, string>): MouField[] {
  return MOU_FIELDS.filter((f) => f.required && !answers[f.id]?.trim());
}

function optionOf(field: MouField, value: string): TE | null {
  return field.options?.find((o) => o.e === value || o.t === value) || null;
}

export function mouDisplay(lang: Lang, field: MouField, value: string) {
  const opt = optionOf(field, value);
  if (opt) return L(lang, opt);
  return value;
}

export function mouInputsOf(answers: Record<string, string>): AssemblyInput[] {
  return MOU_FIELDS
    .filter((f) => answers[f.id]?.trim())
    .map((f) => {
      const opt = optionOf(f, answers[f.id]);
      return {
        id: `MOU-${f.id.toUpperCase()}`,
        kind: asFactKind(f),
        title: f.label,
        value: opt || P(answers[f.id], answers[f.id]),
        source: P("ใบนำเข้า MOU หนึ่งหน้า — ทนายยืนยัน", "One-page MOU intake paper — counsel confirms"),
        href: "/assemble?s=mou",
        priority: f.required ? "must" as const : "should" as const,
      };
    });
}

function L(lang: Lang, x: TE) {
  return lang === "th" ? x.t : x.e;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const out: string[] = [];
  for (const para of (text || "—").split("\n")) {
    let line = "";
    for (const ch of para || "—") {
      const next = line + ch;
      if (ctx.measureText(next).width > maxW && line) {
        out.push(line);
        line = ch === " " ? "" : ch;
      } else line = next;
    }
    if (line) out.push(line);
  }
  return out.length ? out : ["—"];
}

export async function downloadMouIntakePdf(lang: Lang, answers: Record<string, string>) {
  const th = lang === "th";
  const [pw, ph] = PageSizes.A4;
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(pw * scale);
  canvas.height = Math.round(ph * scale);
  const rawCtx = canvas.getContext("2d");
  if (!rawCtx) throw new Error("canvas");
  const ctx: CanvasRenderingContext2D = rawCtx;
  ctx.scale(scale, scale);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, pw, ph);

  const m = 36;
  const maxW = pw - m * 2;
  let y = m;

  ctx.fillStyle = "#1c9a6a";
  ctx.fillRect(m, y, 4, 28);
  ctx.fillStyle = "#201e1d";
  ctx.font = "800 16px Archivo, sans-serif";
  ctx.fillText(th ? "LAW24 · ใบนำเข้า MOU หนึ่งหน้า" : "LAW24 · one-page MOU intake", m + 12, y + 12);
  ctx.font = "600 9px Archivo, sans-serif";
  ctx.fillStyle = "#2f5fd0";
  ctx.fillText("CT-001 · Memorandum of Understanding", m + 12, y + 26);
  ctx.fillStyle = "#605d5d";
  ctx.textAlign = "right";
  ctx.fillText(th ? "ไม่ใช่สัญญาที่ลงนามแล้ว" : "Not a signed contract", pw - m, y + 12);
  ctx.fillText(th ? "เครื่องยนต์ไม่ลงนามแทน" : "The engine never signs", pw - m, y + 26);
  ctx.textAlign = "left";
  y += 40;
  ctx.strokeStyle = "#201e1d66";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(m, y);
  ctx.lineTo(pw - m, y);
  ctx.stroke();
  y += 14;

  ctx.font = "700 8px Archivo, sans-serif";
  ctx.fillStyle = "#1c9a6a";
  ctx.fillText(th ? "กรอบความร่วมมือเบื้องต้น — แยกส่วนที่ผูกพันออกจากส่วนที่ไม่ผูกพัน" : "Preliminary cooperation frame — separate binding from non-binding parts", m, y);
  y += 16;

  const col = (maxW - 10) / 2;
  function field(label: string, value: string, x: number, width: number, boxH = 28) {
    ctx.fillStyle = "#605d5d";
    ctx.font = "700 7px Archivo, sans-serif";
    ctx.fillText(label.toUpperCase(), x, y);
    const lines = wrap(ctx, value, width);
    ctx.fillStyle = "#201e1d";
    ctx.font = "500 9px Archivo, sans-serif";
    let yy = y + 11;
    for (const line of lines.slice(0, boxH > 36 ? 4 : 2)) {
      ctx.fillText(line, x, yy);
      yy += 11;
    }
    return Math.max(boxH, 14 + lines.slice(0, boxH > 36 ? 4 : 2).length * 11);
  }

  const pairH = Math.max(
    field(L(lang, MOU_FIELDS[1].label), mouDisplay(lang, MOU_FIELDS[1], answers.partyA), m, col, 34),
    field(L(lang, MOU_FIELDS[3].label), mouDisplay(lang, MOU_FIELDS[3], answers.partyB), m + col + 10, col, 34),
  );
  y += pairH;
  const signH = Math.max(
    field(L(lang, MOU_FIELDS[2].label), mouDisplay(lang, MOU_FIELDS[2], answers.signA), m, col, 28),
    field(L(lang, MOU_FIELDS[4].label), mouDisplay(lang, MOU_FIELDS[4], answers.signB), m + col + 10, col, 28),
  );
  y += signH + 4;

  const rest = MOU_FIELDS.filter((f) => !["partyA", "partyB", "signA", "signB"].includes(f.id));
  for (const f of rest) {
    const h = field(L(lang, f.label), mouDisplay(lang, f, answers[f.id]), m, maxW, f.type === "textarea" ? 44 : 26);
    y += h;
    if (y > ph - 48) break;
  }

  ctx.fillStyle = "#605d5d";
  ctx.font = "500 8px Archivo, sans-serif";
  ctx.fillText(
    th
      ? "ทนายยืนยันข้อมูลบนใบนี้ก่อนประกอบข้อ  ·  CT-001  ·  ป.พ.พ. บรรพ 1–2 · พ.ร.บ.ธุรกรรมทางอิเล็กทรอนิกส์"
      : "Counsel confirms this paper before clauses assemble  ·  CT-001  ·  CCC Books I–II · Electronic Transactions Act",
    m,
    ph - 28,
  );
  ctx.fillText("LAW24 OS · one-page intake · not a signature", m, ph - 16);

  const png = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("png"))), "image/png");
  });
  const pdf = await PDFDocument.create();
  pdf.setTitle("LAW24-CT-001-MOU-intake");
  pdf.setAuthor("LAW24");
  pdf.setSubject("One-page MOU intake paper — the engine never signs.");
  const page = pdf.addPage(PageSizes.A4);
  const img = await pdf.embedPng(await png.arrayBuffer());
  page.drawImage(img, { x: 0, y: 0, width: pw, height: ph });
  const bytes = await pdf.save();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  downloadBlob("LAW24-CT-001-MOU-intake.pdf", new Blob([copy], { type: "application/pdf" }));
}
