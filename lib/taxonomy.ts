import taxRaw from "@/data/taxonomy.json";
import type { Lang } from "./model";
import { L } from "./model";
import fx from "@/data/fixtures.json";

export type TaxCat = {
  code: string;
  th: string;
  en: string;
  n: number;
  p1: number;
  hi: number;
  phase: string;
  src: string;
};

export type TaxSource = { id: string; name: string; scope?: string };

export type TaxRow = {
  id: string;
  cat: string;
  nameTh: string;
  nameEn: string;
  status: string;
  parties: string;
  purpose: string;
  keyTerms: string;
  formality: string;
  legalBasis: string;
  risk: string;
  priority: string;
  esign: string;
  templateNote: string;
  sources: string;
  tags: string;
};

type Packed = {
  fields: string[];
  cats: TaxCat[];
  enums: { risk: Record<string, string>; status: Record<string, string>; esign: Record<string, string> };
  pool: string[];
  rows: (string | number)[][];
  totals: { types: number; cats: number; p1: number; hi: number };
  sources: TaxSource[];
};

const packed = taxRaw as Packed;

export const TAX_CATS = packed.cats;
export const TAX_ENUMS = packed.enums;
export const TAX_TOTALS = packed.totals;
export const TAX_SOURCES = packed.sources ?? [];
export const CAT_MAP = Object.fromEntries(TAX_CATS.map((c) => [c.code, c]));

export const TAX_LIST: TaxRow[] = packed.rows.map((r) => {
  const o: Record<string, string> = { id: String(r[0]) };
  for (let i = 1; i < packed.fields.length; i++) {
    o[packed.fields[i]] = packed.pool[r[i] as number];
  }
  return o as TaxRow;
});

export const FX = fx as typeof fx;

export function esignShort(lang: Lang, v: string) {
  if (lang === "th") {
    if (v.indexOf("เหมาะกับ") === 0) return "ลงนามได้";
    if (v.indexOf("ยืนยันตัวตน") > -1) return "ต้องยืนยันตัวตน";
    return "มีข้อจำกัด";
  }
  if (v.indexOf("เหมาะกับ") === 0) return "e-Sign fit";
  if (v.indexOf("ยืนยันตัวตน") > -1) return "High assurance";
  return "Restricted";
}

export function trParties(lang: Lang, v: string) {
  const map = (FX as { tr: { parties: Record<string, string> } }).tr.parties;
  return lang === "th" ? v : map[v] || v;
}

export function trClauses(lang: Lang, v: string) {
  const map = (FX as { tr: { clauses: Record<string, string> } }).tr.clauses;
  return lang === "th" ? v : map[v] || v;
}

export function trFormality(lang: Lang, v: string) {
  const map = (FX as { tr: { formality: Record<string, string> } }).tr.formality;
  return lang === "th" ? v : map[v] || v;
}

export function trNote(lang: Lang, v: string) {
  const map = (FX as { tr: { note: Record<string, string> } }).tr.note;
  return lang === "th" ? v : map[v] || v;
}

export { L };
