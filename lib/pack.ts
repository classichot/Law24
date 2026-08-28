import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  TextRun,
  type IParagraphOptions,
  type IRunOptions,
} from "docx";
import { PDFDocument, PageSizes } from "pdf-lib";
import type { ClauseEdit } from "./clauses";
import { houseStandard } from "./clauses";
import { downloadBlob } from "./demo";
import { PLAYBOOKS, copyTE } from "./guides";
import type { Lang, TE } from "./model";
import { L } from "./model";
import { FX, TAX_LIST, trParties } from "./taxonomy";
import { BILINGUAL } from "./wow";

export const PACK_STEM = "CT-284-Nimbus-SaaS-pack";

export type PackInput = {
  lang: Lang;
  conflictChoice: "thai" | "waiver" | null;
  clauseEdits: Record<string, ClauseEdit>;
};

type DraftRow = { n: string; h: TE; b: TE };

type PackBlock =
  | { kind: "kicker"; text: string }
  | { kind: "title"; text: string }
  | { kind: "sub"; text: string }
  | { kind: "h"; text: string }
  | { kind: "p"; text: string }
  | { kind: "meta"; k: string; v: string }
  | { kind: "clause"; n: string; heading: string; th: string; en: string; note?: string }
  | { kind: "callout"; text: string }
  | { kind: "rule"; text: string };

const NAVY = "1B2A4A";
const MUTED = "605D5D";

function te(t: string, e: string): TE {
  return { t, e };
}

function clauseBody(id: string, original: TE, edits: Record<string, ClauseEdit>): { body: TE; note?: string } {
  const edit = edits[id];
  if (!edit) return { body: original };
  const mode = edit.mode === "ai" ? "Leio" : "manual";
  return {
    body: edit.body,
    note: edit.reason ? `${mode}: ${edit.reason}` : mode,
  };
}

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const PDF_MIME = "application/pdf";

export function packFilename(ext: "docx" | "pdf") {
  return `${PACK_STEM}.${ext}`;
}

function asBinaryBlob(data: ArrayBuffer | Uint8Array, mime: string) {
  const src = data instanceof Uint8Array ? data : new Uint8Array(data);
  const copy = new Uint8Array(src.byteLength);
  copy.set(src);
  return new Blob([copy], { type: mime });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function buildPackBlocks(input: PackInput): PackBlock[] {
  const { lang, conflictChoice, clauseEdits } = input;
  const th = lang === "th";
  const type = TAX_LIST.find((r) => r.id === "CT-284") || TAX_LIST[0];
  const iv = FX.interview;
  const draft = iv.draft as DraftRow[];
  const law = conflictChoice === "waiver"
    ? te(
      "ขอยกเว้นนโยบาย — ที่นั่งอนุญาโตตุลาการต้องบันทึกเหตุในสัมภาษณ์ กฎหมายบังคับไทย (รวม PDPA) ยังใช้",
      "Policy waiver requested — any foreign seat needs a recorded interview reason. Thai mandatory rules including PDPA still apply.",
    )
    : te(
      "กฎหมายไทยเป็นท่าทีบ้าน ข้อพิพาทระงับในราชอาณาจักร อนุญาโตตุลาการต่างประเทศไม่ได้รวมในชุดนี้",
      "Thai law is the house position. Disputes are seated in the Kingdom. Foreign arbitration is not included in this pack.",
    );

  const blocks: PackBlock[] = [
    { kind: "kicker", text: th ? "LAW24 · ชุดเอกสารประกอบสัญญา" : "LAW24 · assembled contract pack" },
    { kind: "title", text: th ? `${type.id} · ${type.nameTh}` : `${type.id} · ${type.nameEn}` },
    { kind: "sub", text: th ? type.nameEn : type.nameTh },
    {
      kind: "callout",
      text: th
        ? "เครื่องยนต์ไม่ลงนามแทน — ชุดนี้คือสิ่งส่งมอบ ทนายเป็นผู้ใช้ข้อ GC · CIO · DPO อนุมัติครบแล้ว"
        : "The engine never signs — this pack is the deliverable. Counsel applies the clauses. GC, CIO and DPO have signed off.",
    },
    { kind: "h", text: th ? "หน้าปกเรื่อง" : "Matter cover" },
    { kind: "meta", k: th ? "เรื่อง" : "Matter", v: th ? "Nimbus Cloud · สัญญาบริการ SaaS" : "Nimbus Cloud · SaaS agreement" },
    { kind: "meta", k: th ? "ลูกค้า" : "Customer", v: th ? "บริษัท สยาม ดิจิทัล จำกัด" : "Siam Digital Co., Ltd." },
    { kind: "meta", k: th ? "ผู้ให้บริการ" : "Provider", v: "Nimbus Cloud Pte. Ltd. (Singapore)" },
    { kind: "meta", k: th ? "มูลค่า / อายุ" : "Value / term", v: th ? "฿24.6 ล้าน · 36 เดือน" : "THB 24.6M · 36 months" },
    { kind: "meta", k: th ? "ประเภทในคลัง" : "Library type", v: `${type.id} · C15` },
    { kind: "meta", k: th ? "คู่สัญญาหลัก" : "Principal parties", v: trParties(lang, type.parties) },
    {
      kind: "meta",
      k: th ? "เพลย์บุ๊ก" : "Playbooks",
      v: `${PLAYBOOKS.assembly.id} ${PLAYBOOKS.assembly.ver} · ${PLAYBOOKS.itcloud.id} ${PLAYBOOKS.itcloud.ver}`,
    },
    {
      kind: "meta",
      k: th ? "การอนุมัติภายใน" : "Internal approvals",
      v: th ? "GC อนุมัติ · CIO อนุมัติ · DPO อนุมัติ" : "GC approved · CIO approved · DPO approved",
    },
    { kind: "p", text: type.purpose },
    { kind: "h", text: th ? "ล็อกจากแบบสัมภาษณ์" : "Interview lock" },
  ];

  for (const q of iv.qs) {
    blocks.push({
      kind: "meta",
      k: L(lang, q.q),
      v: `${L(lang, q.a)} · ${L(lang, q.rule)}`,
    });
  }

  blocks.push({ kind: "h", text: th ? "เพลย์บุ๊กที่บังคับใช้กับชุดนี้" : "Playbook overlay on this pack" });
  for (const rule of [...PLAYBOOKS.assembly.rules, ...PLAYBOOKS.itcloud.rules]) {
    blocks.push({ kind: "rule", text: copyTE(lang, rule) });
  }

  blocks.push(
    { kind: "h", text: th ? "กฎหมายที่ใช้บังคับ" : "Governing law" },
    { kind: "p", text: L(lang, law) },
  );

  blocks.push({
    kind: "h",
    text: th ? "ข้อสัญญาที่ใช้บังคับ (ไทย + อังกฤษ)" : "Operative clauses (Thai + English)",
  });

  const extra: { id: string; n: string; h: TE; b: TE }[] = [
    ...draft.map((row) => ({ id: `draft:${row.n}`, n: row.n, h: row.h, b: row.b })),
    {
      id: "draft:2.",
      n: "2.",
      h: te("คู่สัญญา", "Parties"),
      b: te(
        "สัญญานี้ทำขึ้นระหว่างบริษัท สยาม ดิจิทัล จำกัด (“ลูกค้า”) กับ Nimbus Cloud Pte. Ltd. (“ผู้ให้บริการ”) เพื่อให้บริการซอฟต์แวร์ในรูปแบบบริการตามประเภท CT-284",
        "This Agreement is between Siam Digital Co., Ltd. (“Customer”) and Nimbus Cloud Pte. Ltd. (“Provider”) for software-as-a-service of type CT-284.",
      ),
    },
    {
      id: "draft:11.",
      n: "11.",
      h: te("การเลิกสัญญาและการเปลี่ยนผ่าน", "Termination and exit"),
      b: houseStandard("exit"),
    },
    {
      id: "draft:16.",
      n: "16.",
      h: te("กฎหมายที่ใช้บังคับ", "Governing law"),
      b: law,
    },
  ].sort((a, b) => parseFloat(a.n) - parseFloat(b.n));

  for (const row of extra) {
    const { body, note } = clauseBody(row.id, row.b, clauseEdits);
    blocks.push({
      kind: "clause",
      n: row.n,
      heading: L(lang, row.h),
      th: body.t,
      en: body.e,
      note,
    });
  }

  const annexes: { n: string; h: TE; body: TE }[] = [
    {
      n: "A",
      h: te("ภาคผนวก ก. — ระดับการให้บริการ (SLA)", "Annex A — Service levels (SLA)"),
      body: houseStandard("SLA"),
    },
    {
      n: "B",
      h: te("ภาคผนวก ข. — ข้อตกลงประมวลผลข้อมูล (DPA)", "Annex B — Data processing agreement"),
      body: houseStandard("DPA"),
    },
    {
      n: "C",
      h: te("ภาคผนวก ค. — ตารางโอนข้อมูล", "Annex C — Transfer schedule"),
      body: houseStandard("transfer"),
    },
  ];

  blocks.push({ kind: "h", text: th ? "ภาคผนวกที่รวมเป็นส่วนหนึ่งของสัญญา" : "Annexes incorporated into this pack" });
  for (const a of annexes) {
    const { body, note } = clauseBody(`annex:${a.n}`, a.body, clauseEdits);
    blocks.push({
      kind: "clause",
      n: a.n,
      heading: L(lang, a.h),
      th: body.t,
      en: body.e,
      note,
    });
  }

  blocks.push({
    kind: "h",
    text: th ? "ตรวจคำแปลคู่ขนาน" : "Bilingual translation check",
  });
  blocks.push({
    kind: "p",
    text: th
      ? "เมื่อภาษาหนึ่งเปลี่ยน LAW24 ชี้ว่าคำแปลสร้างความหมายทางกฎหมายต่างกันหรือไม่ — ไม่ใช่ฉบับลงนาม"
      : "When one language changes, LAW24 flags whether the translation creates a different legal meaning — this is not a signed instrument.",
  });
  BILINGUAL.forEach((b, i) => {
    blocks.push({
      kind: "clause",
      n: String(i + 1),
      heading: b.risk === "high" ? (th ? "ความเสี่ยงสูง — ความหมายไม่ตรงกัน" : "High drift — legal meaning diverges") : b.risk === "ok" ? (th ? "ตรงกัน" : "Aligned") : (th ? "ต้องตรวจ" : "Check"),
      th: b.th,
      en: b.en,
      note: L(lang, b.drift),
    });
  });

  blocks.push(
    { kind: "h", text: th ? "ช่องลงนาม — ว่างไว้" : "Signature blocks — left unsigned" },
    {
      kind: "p",
      text: th
        ? "ลงนามโดยผู้มีอำนาจของลูกค้า: ________________________    วันที่: ______________"
        : "For the Customer, authorised signatory: ________________________    Date: ______________",
    },
    {
      kind: "p",
      text: th
        ? "ลงนามโดยผู้มีอำนาจของผู้ให้บริการ: ________________________    วันที่: ______________"
        : "For the Provider, authorised signatory: ________________________    Date: ______________",
    },
    {
      kind: "callout",
      text: th
        ? "LAW24 ไม่ลงนามในชุดนี้ เส้นทาง e-Sign แยกต่างหากเมื่อทนายสั่งออก"
        : "LAW24 does not sign this pack. The e-Sign path issues only when counsel sends it.",
    },
  );

  return blocks;
}

function para(opts: IParagraphOptions) {
  return new Paragraph(opts);
}

function run(text: string, opts: Omit<IRunOptions, "text"> = {}) {
  return new TextRun({
    font: "Calibri",
    size: 22,
    ...opts,
    text,
  });
}

async function buildDocx(blocks: PackBlock[]): Promise<Blob> {
  const children: Paragraph[] = [];

  for (const b of blocks) {
    if (b.kind === "kicker") {
      children.push(para({
        spacing: { after: 80 },
        children: [run(b.text, { bold: true, allCaps: true, size: 16, color: MUTED, characterSpacing: 80 })],
      }));
    } else if (b.kind === "title") {
      children.push(para({
        heading: HeadingLevel.TITLE,
        spacing: { after: 80 },
        children: [run(b.text, { bold: true, size: 40, color: NAVY, font: "Calibri" })],
      }));
    } else if (b.kind === "sub") {
      children.push(para({ spacing: { after: 200 }, children: [run(b.text, { italics: true, color: MUTED })] }));
    } else if (b.kind === "h") {
      children.push(para({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 280, after: 120 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: NAVY, space: 4 } },
        children: [run(b.text, { bold: true, size: 24, color: NAVY })],
      }));
    } else if (b.kind === "p") {
      children.push(para({
        spacing: { after: 160 },
        alignment: AlignmentType.JUSTIFIED,
        children: [run(b.text)],
      }));
    } else if (b.kind === "meta") {
      children.push(para({
        spacing: { after: 80 },
        children: [run(`${b.k}: `, { bold: true, color: NAVY }), run(b.v)],
      }));
    } else if (b.kind === "rule") {
      children.push(para({
        spacing: { after: 80 },
        indent: { left: 200 },
        children: [run("·  ", { bold: true, color: NAVY }), run(b.text)],
      }));
    } else if (b.kind === "callout") {
      children.push(para({
        spacing: { before: 120, after: 200 },
        shading: { fill: "E8EBF0" },
        children: [run(b.text, { italics: true, size: 20 })],
      }));
    } else {
      children.push(para({
        spacing: { before: 200, after: 60 },
        children: [run(`${b.n}  ${b.heading}`, { bold: true, size: 24, color: NAVY })],
      }));
      children.push(para({
        spacing: { after: 40 },
        children: [run("TH  ", { bold: true, size: 16, color: MUTED }), run(b.th)],
      }));
      children.push(para({
        spacing: { after: 80 },
        children: [run("EN  ", { bold: true, size: 16, color: MUTED }), run(b.en)],
      }));
      if (b.note) {
        children.push(para({
          spacing: { after: 120 },
          children: [run(b.note, { italics: true, size: 18, color: MUTED })],
        }));
      }
    }
  }

  const doc = new Document({
    creator: "LAW24",
    title: "CT-284 Nimbus SaaS pack",
    description: "Assembled contract pack — the engine never signs.",
    styles: {
      default: { document: { run: { font: "Calibri", size: 22 } } },
    },
    sections: [{
      properties: {
        page: { margin: { top: 720, bottom: 720, left: 850, right: 850 } },
      },
      footers: {
        default: new Footer({
          children: [para({
            alignment: AlignmentType.CENTER,
            children: [
              run("LAW24 · CT-284-Nimbus-SaaS-pack · engine never signs · ", { size: 16, color: MUTED }),
              new TextRun({ font: "Calibri", size: 16, color: MUTED, children: [PageNumber.CURRENT] }),
            ],
          })],
        }),
      },
      children,
    }],
  });

  const raw = await Packer.toArrayBuffer(doc);
  const bytes = new Uint8Array(raw);
  if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
    throw new Error("docx pack is not a Word zip");
  }
  return asBinaryBlob(bytes, DOCX_MIME);
}

function wrapCanvas(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const out: string[] = [];
  for (const paraLine of text.split("\n")) {
    if (!paraLine) {
      out.push("");
      continue;
    }
    let line = "";
    for (const ch of paraLine) {
      const next = line + ch;
      if (ctx.measureText(next).width > maxW && line) {
        out.push(line);
        line = ch === " " ? "" : ch;
      } else {
        line = next;
      }
    }
    if (line) out.push(line);
  }
  return out;
}

function renderPdfPages(blocks: PackBlock[]): HTMLCanvasElement[] {
  const scale = 2;
  const w = PageSizes.A4[0];
  const h = PageSizes.A4[1];
  const margin = 50;
  const maxW = w - margin * 2;
  const pages: HTMLCanvasElement[] = [];
  let ctx!: CanvasRenderingContext2D;
  let y = 0;

  function newPage() {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const next = canvas.getContext("2d");
    if (!next) throw new Error("canvas");
    ctx = next;
    ctx.scale(scale, scale);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    y = margin;
    pages.push(canvas);
  }

  function ensure(need: number) {
    if (y + need > h - margin) newPage();
  }

  function setFont(weight: string, size: number) {
    ctx.font = `${weight} ${size}px "Leelawadee UI", "Sarabun", "Segoe UI", Tahoma, sans-serif`;
  }

  newPage();

  for (const b of blocks) {
    if (b.kind === "kicker") {
      ensure(18);
      setFont("700", 9);
      ctx.fillStyle = "#605d5d";
      ctx.fillText(b.text.toUpperCase(), margin, y);
      y += 16;
    } else if (b.kind === "title") {
      setFont("800", 18);
      const lines = wrapCanvas(ctx, b.text, maxW);
      ensure(lines.length * 22 + 8);
      ctx.fillStyle = "#1b2a4a";
      for (const line of lines) {
        ctx.fillText(line, margin, y);
        y += 22;
      }
    } else if (b.kind === "sub") {
      ensure(16);
      setFont("italic 400", 11);
      ctx.fillStyle = "#605d5d";
      ctx.fillText(b.text, margin, y);
      y += 18;
    } else if (b.kind === "h") {
      ensure(28);
      y += 10;
      setFont("700", 12);
      ctx.fillStyle = "#1b2a4a";
      ctx.fillText(b.text, margin, y);
      y += 6;
      ctx.strokeStyle = "#1b2a4a";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(margin, y);
      ctx.lineTo(w - margin, y);
      ctx.stroke();
      y += 14;
    } else if (b.kind === "p" || b.kind === "callout") {
      setFont(b.kind === "callout" ? "italic 400" : "400", 10);
      const lines = wrapCanvas(ctx, b.text, maxW);
      ensure(lines.length * 13 + (b.kind === "callout" ? 16 : 8));
      if (b.kind === "callout") {
        ctx.fillStyle = "#e8ebf0";
        ctx.fillRect(margin - 6, y - 12, maxW + 12, lines.length * 13 + 16);
      }
      ctx.fillStyle = "#201e1d";
      for (const line of lines) {
        ctx.fillText(line, margin, y);
        y += 13;
      }
      y += 8;
    } else if (b.kind === "meta") {
      setFont("700", 10);
      const keyW = Math.min(140, ctx.measureText(`${b.k}: `).width);
      setFont("400", 10);
      const lines = wrapCanvas(ctx, b.v, maxW - keyW);
      ensure(Math.max(1, lines.length) * 13 + 2);
      ctx.fillStyle = "#1b2a4a";
      setFont("700", 10);
      ctx.fillText(`${b.k}:`, margin, y);
      ctx.fillStyle = "#201e1d";
      setFont("400", 10);
      lines.forEach((line, i) => {
        ctx.fillText(line, margin + keyW, y);
        if (i < lines.length - 1) y += 13;
      });
      y += 14;
    } else if (b.kind === "rule") {
      setFont("400", 10);
      const lines = wrapCanvas(ctx, `·  ${b.text}`, maxW - 10);
      ensure(lines.length * 13 + 2);
      ctx.fillStyle = "#201e1d";
      for (const line of lines) {
        ctx.fillText(line, margin + 8, y);
        y += 13;
      }
      y += 4;
    } else {
      ensure(40);
      setFont("700", 11);
      ctx.fillStyle = "#1b2a4a";
      ctx.fillText(`${b.n}  ${b.heading}`, margin, y);
      y += 16;
      setFont("700", 8);
      ctx.fillStyle = "#605d5d";
      ctx.fillText("TH", margin, y);
      setFont("400", 10);
      ctx.fillStyle = "#201e1d";
      let lines = wrapCanvas(ctx, b.th, maxW - 28);
      ensure(lines.length * 13 + 20);
      for (const line of lines) {
        ctx.fillText(line, margin + 24, y);
        y += 13;
      }
      y += 6;
      setFont("700", 8);
      ctx.fillStyle = "#605d5d";
      ctx.fillText("EN", margin, y);
      setFont("400", 10);
      ctx.fillStyle = "#201e1d";
      lines = wrapCanvas(ctx, b.en, maxW - 28);
      ensure(lines.length * 13 + 8);
      for (const line of lines) {
        ctx.fillText(line, margin + 24, y);
        y += 13;
      }
      if (b.note) {
        y += 4;
        setFont("italic 400", 9);
        ctx.fillStyle = "#605d5d";
        lines = wrapCanvas(ctx, b.note, maxW);
        ensure(lines.length * 12 + 6);
        for (const line of lines) {
          ctx.fillText(line, margin, y);
          y += 12;
        }
      }
      y += 10;
    }
  }

  for (const page of pages) {
    const c = page.getContext("2d");
    if (!c) continue;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.scale(scale, scale);
    c.fillStyle = "#9b9797";
    c.font = "9px Calibri, sans-serif";
    c.fillText("LAW24 · CT-284-Nimbus-SaaS-pack · engine never signs", margin, h - 22);
  }

  return pages;
}

async function buildPdf(blocks: PackBlock[]): Promise<Blob> {
  const canvases = renderPdfPages(blocks);
  const pdf = await PDFDocument.create();
  pdf.setTitle("CT-284 Nimbus SaaS pack");
  pdf.setAuthor("LAW24");
  pdf.setSubject("Assembled contract pack — the engine never signs.");
  pdf.setCreator("LAW24");
  const [pw, ph] = PageSizes.A4;

  for (const canvas of canvases) {
    const png = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("png"))), "image/png");
    });
    const img = await pdf.embedPng(await png.arrayBuffer());
    const page = pdf.addPage([pw, ph]);
    page.drawImage(img, { x: 0, y: 0, width: pw, height: ph });
  }

  const bytes = await pdf.save();
  const blob = asBinaryBlob(bytes, PDF_MIME);
  const head = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
  const sig = String.fromCharCode(head[0], head[1], head[2], head[3]);
  if (sig !== "%PDF") throw new Error("pdf pack is not a PDF");
  return blob;
}

export async function downloadAssemblePack(input: PackInput, which: "both" | "docx" | "pdf" = "both") {
  const blocks = buildPackBlocks(input);
  if (which === "docx") {
    downloadBlob(packFilename("docx"), await buildDocx(blocks));
    return;
  }
  if (which === "pdf") {
    downloadBlob(packFilename("pdf"), await buildPdf(blocks));
    return;
  }
  const [docx, pdf] = await Promise.all([buildDocx(blocks), buildPdf(blocks)]);
  downloadBlob(packFilename("docx"), docx);
  await sleep(450);
  downloadBlob(packFilename("pdf"), pdf);
}
