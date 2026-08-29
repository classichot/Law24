export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const MAX_TEXT_CHARS = 60_000;
const MIN_USABLE_CHARS = 80;

export type ExtractedDoc = {
  text: string;
  pages: number;
  filename: string;
  /** Present when the PDF has no usable text layer — attach to the model instead of OCR. */
  pdf?: Uint8Array;
};

function extOf(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

function clip(text: string) {
  const t = text.replace(/\u0000/g, " ").replace(/[ \t]+\n/g, "\n").trim();
  if (t.length <= MAX_TEXT_CHARS) return t;
  return `${t.slice(0, MAX_TEXT_CHARS)}\n\n[Truncated for token cap — first ${MAX_TEXT_CHARS} characters.]`;
}

export function hasContractText(text: string) {
  return text.replace(/\s+/g, " ").trim().length >= MIN_USABLE_CHARS;
}

async function fromPdfLayer(buf: Uint8Array): Promise<{ text: string; pages: number }> {
  const { extractText } = await import("unpdf");
  const copy = new Uint8Array(buf);
  const out = await extractText(copy, { mergePages: false });
  const pages = Array.isArray(out.text) ? out.text : [out.text || ""];
  const raw = pages.map((p, i) => {
    const body = (p || "").trim();
    return body ? `--- page ${i + 1} ---\n${body}` : "";
  }).filter(Boolean).join("\n\n");
  return { text: clip(raw), pages: out.totalPages || pages.length };
}

async function fromPdf(buf: Uint8Array): Promise<{ text: string; pages: number; pdf?: Uint8Array }> {
  const layer = await fromPdfLayer(buf);
  if (hasContractText(layer.text)) return layer;
  return { text: "", pages: layer.pages || 1, pdf: buf };
}

async function fromDocx(buf: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const { value } = await mammoth.extractRawText({ buffer: buf });
  return clip(value || "");
}

export async function extractDocument(input: {
  filename: string;
  bytes?: Uint8Array | Buffer;
  text?: string;
}): Promise<ExtractedDoc> {
  const filename = input.filename || "document";
  if (input.text && input.text.trim()) {
    const text = clip(input.text);
    return { text, pages: Math.max(1, Math.round(text.length / 2800)), filename };
  }
  if (!input.bytes || input.bytes.byteLength === 0) {
    throw new Error("No file bytes and no text to extract");
  }
  if (input.bytes.byteLength > MAX_UPLOAD_BYTES) {
    throw new Error("File is over 8 MB — drop a smaller extract or paste text");
  }
  const bytes = input.bytes instanceof Uint8Array ? input.bytes : new Uint8Array(input.bytes);
  const buf = Buffer.from(bytes);
  const ext = extOf(filename);

  if (ext === ".txt" || ext === ".md") {
    const text = clip(buf.toString("utf8"));
    return { text, pages: Math.max(1, Math.round(text.length / 2800)), filename };
  }
  if (ext === ".docx") {
    const text = await fromDocx(buf);
    if (!hasContractText(text)) throw new Error("DOCX produced no extractable text");
    return { text, pages: Math.max(1, Math.round(text.length / 2800)), filename };
  }
  if (ext === ".pdf" || bytes[0] === 0x25) {
    const { text, pages, pdf } = await fromPdf(bytes);
    return { text, pages: pages || 1, filename, pdf };
  }
  if (ext === ".doc") {
    throw new Error("Legacy .doc is not supported — save as PDF or DOCX");
  }
  throw new Error("Use PDF, DOCX, or plain text");
}

export async function extractFromRequest(req: Request): Promise<ExtractedDoc> {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    const named = String(form.get("filename") || "");
    const pasted = String(form.get("text") || "");
    if (file instanceof File) {
      const ab = await file.arrayBuffer();
      return extractDocument({
        filename: named || file.name || "upload",
        bytes: new Uint8Array(ab),
        text: pasted || undefined,
      });
    }
    if (pasted.trim()) {
      return extractDocument({ filename: named || "pasted.txt", text: pasted });
    }
    throw new Error("No file in the upload");
  }
  const body = await req.json() as { filename?: string; text?: string; name?: string };
  if (!body.text?.trim()) throw new Error("No contract text");
  return extractDocument({ filename: body.filename || body.name || "document.txt", text: body.text });
}
