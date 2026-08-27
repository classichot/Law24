export type Lang = "en" | "th";
export type Edition = "corporate" | "firm";
export type ModeKey = "home" | "practice" | "command" | "assist" | "help" | "assemble" | "review" | "holistic" | "diligence" | "negotiate" | "obligations" | "intel";
export type ScreenKey = string;

export const CORPORATE_USER = { name: "P. Rojana", nameTh: "ปรีชา โรจนา", role: "General Counsel", roleTh: "ที่ปรึกษากฎหมายอาวุโส", initials: "PR", email: "preecha@siamdigital.co.th" };
export const FIRM_USER = { name: "Kanit S.", nameTh: "คณิต สิริวรรณ", role: "Partner", roleTh: "หุ้นส่วน", initials: "KS", email: "kanit@7l-advisory.com" };

export type TE = { t: string; e: string };

export function L(lang: Lang, x: TE | string | null | undefined): string {
  if (x == null) return "";
  if (typeof x === "object") return lang === "th" ? x.t : x.e;
  return x;
}
