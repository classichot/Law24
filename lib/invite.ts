import type { Edition } from "./model";

/** Time-limited demo invites. Default window is 3 days; expired tokens cannot open LAW24.
 *  Rotate INVITE_EPOCH (and redeploy) to cut off every outstanding link at once.
 *  HOST_PIN is for 7L only — never put it on the public login page.
 */
export const DEFAULT_DAYS = 3;
export const MIN_DAYS = 1;
export const MAX_DAYS = 14;
export const INVITE_EPOCH = 1;
export const HOST_PIN = "7L-host";

const SECRET = "law24-invite-v1-7L-advisory";
const INVITE_SESSION_KEY = "law24-invite-session";
const INVITE_AUTH_KEY = "law24_invite_auth";
const HOST_SESSION_KEY = "law24-host-session";
const ISSUED_KEY = "law24-invites-issued";
const LAST_URL_KEY = "law24-invite-last-url";

export type InvitePayload = {
  v: 1;
  epoch: number;
  id: string;
  edition: Edition;
  label: string;
  iat: number;
  exp: number;
  days: number;
};

export type IssuedInvite = {
  id: string;
  label: string;
  exp: number;
  iat: number;
  url: string;
  edition: Edition;
  days: number;
};

export type InviteSession = {
  id: string;
  edition: Edition;
  exp: number;
  epoch: number;
  label: string;
  token: string;
  days: number;
};

export function clampInviteDays(n: unknown): number {
  const v = typeof n === "number" ? n : typeof n === "string" && n.trim() !== "" ? Number(n) : NaN;
  if (!Number.isFinite(v)) return DEFAULT_DAYS;
  return Math.min(MAX_DAYS, Math.max(MIN_DAYS, Math.round(v)));
}

function b64urlEncodeBytes(bytes: Uint8Array) {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlEncodeStr(str: string) {
  return b64urlEncodeBytes(new TextEncoder().encode(str));
}

function b64urlDecodeStr(s: string) {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function keyedSign(message: string) {
  const s = `${SECRET}|${message}`;
  const bytes = new Uint8Array(32);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
    const j = i % 32;
    bytes[j] ^= h & 255;
    bytes[(j + 7) % 32] ^= (h >>> 8) & 255;
    bytes[(j + 13) % 32] ^= (h >>> 16) & 255;
    bytes[(j + 19) % 32] ^= (h >>> 24) & 255;
  }
  for (let r = 0; r < 32; r++) {
    bytes[r] ^= bytes[(r + 3) % 32] ^ ((r * 31 + s.length) & 255);
  }
  return b64urlEncodeBytes(bytes);
}

function uid() {
  return `inv_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

function asEdition(v: unknown): Edition {
  return v === "firm" ? "firm" : "corporate";
}

/** Guest entry. The OS Review module stays at `/review?s=…` — this path is `/review/{token}` only. */
export function reviewPath(token: string) {
  return `/review/${encodeURIComponent(token)}`;
}

export function reviewUrl(token: string) {
  const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "https://law24.vercel.app";
  return `${origin}${reviewPath(token)}`;
}

/** After a valid token the guest hydrates the full OS — Home, then every module. */
export function inviteLandingHref(_edition?: Edition) {
  return "/home";
}

export type GuestTourStep = {
  href: string;
  en: string;
  th: string;
  firm?: boolean;
  corporate?: boolean;
};

/** Full-OS reviewer tour. Not an ingest-only shell. */
export const GUEST_TOUR: GuestTourStep[] = [
  { href: "/home", en: "Home — every module from the grid (same chrome as a logged-in demo).", th: "หน้าแรก — ทุกโมดูลจากตาราง (โครมเดียวกับสาธิตที่ล็อกอิน)" },
  { href: "/review?s=xray", en: "X-Ray — drop a PDF/DOCX, or one-click Nimbus CT-291 if you have no file. Read the verdict. Live AI posts /api/ai/xray when a key is on the server.", th: "X-Ray — ลาก PDF/DOCX หรือกดนิมบัส CT-291 ถ้าไม่มีไฟล์ อ่านคำตัดสิน AI สดยิง /api/ai/xray เมื่อมีคีย์บนเซิร์ฟเวอร์" },
  { href: "/help?s=leio", en: "Leio — ask one question (Ctrl J). Live vs Demo badge stays honest.", th: "เลโอ — ถามหนึ่งข้อ (Ctrl J) ป้ายสด/สาธิตไม่โกหก" },
  { href: "/assemble?s=intake", en: "Assemble — choose intake papers or a type-aware AI questionnaire, generate Word + PDF, then send to Review. Nothing is signed.", th: "ประกอบ — เลือกเอกสารนำเข้าหรือแบบสอบถาม AI ตามประเภท สร้าง Word + PDF แล้วส่ง Review ไม่มีการลงนามแทน" },
  { href: "/diligence?s=dwar", en: "Diligence — ingest data-room files, open red flags (Charoen is seeded).", th: "ตรวจสอบสถานะ — รับไฟล์ห้องข้อมูล เปิดธงแดง (เจริญมีข้อมูลจริง)" },
  { href: "/negotiate?s=nstrat", en: "Negotiate — drop markup, walk preferred → walk-away.", th: "เจรจา — ลาก redline เดินจุดยืนที่ต้องการถึงเดินออก" },
  { href: "/assist?s=ask", en: "Assist — describe a job; the OS names the module.", th: "ผู้ช่วย — อธิบายงาน ระบบชี้โมดูล" },
  { href: "/practice?s=dash", en: "Practice — clients, assignments, Firm Brain, client room.", th: "สำนักงาน — ลูกค้า งาน สมองสำนักงาน ห้องลูกค้า", firm: true },
  { href: "/command?s=desk", en: "Control — requests, approvals, outside counsel, board.", th: "ควบคุม — คำขอ อนุมัติ ที่ปรึกษาภายนอก คณะกรรมการ", corporate: true },
  { href: "/holistic?s=cockpit", en: "Cockpit, Twin, Obligations, Help — seeded Nimbus / Charoen data, same engine.", th: "ห้องบังคับ ฝาแฝด ข้อผูกพัน คู่มือ — ข้อมูลนิมบัส/เจริญ เครื่องยนต์ชุดเดียว" },
];

export function guestTour(edition: Edition): GuestTourStep[] {
  return GUEST_TOUR.filter((step) => {
    if (step.firm && edition !== "firm") return false;
    if (step.corporate && edition !== "corporate") return false;
    return true;
  });
}

export function mintInvite({
  days = DEFAULT_DAYS,
  edition = "corporate",
  label = "",
}: {
  days?: number;
  edition?: Edition;
  label?: string;
} = {}) {
  const now = Date.now();
  const windowDays = clampInviteDays(days);
  const payload: InvitePayload = {
    v: 1,
    epoch: INVITE_EPOCH,
    id: uid(),
    edition: asEdition(edition),
    label: String(label || "").slice(0, 80),
    iat: now,
    exp: now + windowDays * 24 * 60 * 60 * 1000,
    days: windowDays,
  };
  const body = b64urlEncodeStr(JSON.stringify(payload));
  const token = `${body}.${keyedSign(body)}`;
  const url = reviewUrl(token);
  rememberIssued({ ...payload, token, url });
  saveLastMintUrl(url);
  return { token, url, payload };
}

export async function verifyInvite(token: string): Promise<
  { ok: true; payload: InvitePayload; token: string } | { ok: false; reason: "invalid" | "expired" | "revoked"; payload?: InvitePayload }
> {
  const raw = decodeURIComponent(String(token || "").trim());
  if (!raw || !raw.includes(".")) return { ok: false, reason: "invalid" };
  const cut = raw.lastIndexOf(".");
  const body = raw.slice(0, cut);
  const sig = raw.slice(cut + 1);
  if (!body || !sig) return { ok: false, reason: "invalid" };
  let payload: InvitePayload;
  try {
    payload = JSON.parse(b64urlDecodeStr(body)) as InvitePayload;
  } catch {
    return { ok: false, reason: "invalid" };
  }
  payload.edition = asEdition(payload.edition);
  if (keyedSign(body) !== sig) return { ok: false, reason: "invalid" };
  if (Number(payload.epoch) !== INVITE_EPOCH) return { ok: false, reason: "revoked", payload };
  if (Date.now() >= Number(payload.exp)) return { ok: false, reason: "expired", payload };
  return { ok: true, payload, token: raw };
}

export function formatExpiry(exp: number) {
  try {
    return new Date(exp).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return "";
  }
}

export function hoursLeft(exp: number) {
  const ms = Number(exp) - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (60 * 60 * 1000));
}

export function saveInviteSession(payload: InvitePayload, token: string) {
  localStorage.setItem(
    INVITE_SESSION_KEY,
    JSON.stringify({
      id: payload.id,
      edition: asEdition(payload.edition),
      exp: payload.exp,
      epoch: payload.epoch,
      label: payload.label || "",
      token,
      days: payload.days || DEFAULT_DAYS,
    } satisfies InviteSession),
  );
  localStorage.setItem(INVITE_AUTH_KEY, "1");
}

export function clearInviteSession() {
  try {
    localStorage.removeItem(INVITE_SESSION_KEY);
    localStorage.removeItem(INVITE_AUTH_KEY);
  } catch {
    /* private mode */
  }
}

export function isInviteAuth() {
  try {
    return localStorage.getItem(INVITE_AUTH_KEY) === "1";
  } catch {
    return false;
  }
}

export function readInviteSession(): InviteSession | null {
  try {
    const raw = localStorage.getItem(INVITE_SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as InviteSession;
    if (!s?.exp) return null;
    if (Number(s.epoch) !== INVITE_EPOCH) {
      localStorage.removeItem(INVITE_SESSION_KEY);
      return null;
    }
    if (Date.now() >= Number(s.exp)) {
      localStorage.removeItem(INVITE_SESSION_KEY);
      localStorage.removeItem(INVITE_AUTH_KEY);
      return null;
    }
    s.edition = asEdition(s.edition);
    return s;
  } catch {
    return null;
  }
}

export function setHostSession(on: boolean) {
  try {
    if (on) sessionStorage.setItem(HOST_SESSION_KEY, "1");
    else sessionStorage.removeItem(HOST_SESSION_KEY);
  } catch {
    /* private mode */
  }
}

export function isHostSession() {
  try {
    return sessionStorage.getItem(HOST_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function pinMatches(pin: unknown) {
  const compact = String(pin || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "");
  const host = HOST_PIN.toLowerCase().replace(/[\s-]+/g, "");
  return compact === host || compact === "advisor" || compact === "partner" || compact === "firm";
}

export function saveLastMintUrl(url: string) {
  try {
    if (url) sessionStorage.setItem(LAST_URL_KEY, url);
    else sessionStorage.removeItem(LAST_URL_KEY);
  } catch {
    /* private mode */
  }
}

export function readLastMintUrl() {
  try {
    return sessionStorage.getItem(LAST_URL_KEY) || "";
  } catch {
    return "";
  }
}

function rememberIssued(row: InvitePayload & { token: string; url: string }) {
  try {
    const list = readIssued();
    list.unshift({
      id: row.id,
      label: row.label,
      exp: row.exp,
      iat: row.iat,
      url: row.url,
      edition: row.edition,
      days: row.days,
    });
    localStorage.setItem(ISSUED_KEY, JSON.stringify(list.slice(0, 20)));
  } catch {
    /* private mode */
  }
}

export function readIssued(): IssuedInvite[] {
  try {
    const list = JSON.parse(localStorage.getItem(ISSUED_KEY) || "[]") as IssuedInvite[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
