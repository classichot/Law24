"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { THEMES, normalizeTheme, type ThemeKey } from "./format";
import { FIRM_USER, type Edition, type Lang, type ModeKey, type ScreenKey } from "./model";
import { defaultScreen } from "./nav";
import {
  DEMO_TYPE_ID,
  defaultLive,
  type FlagStatus,
  type FindingStatus,
  type LiveState,
  type MatterId,
  type PositionStatus,
  type RequestStatus,
  type UploadFile,
} from "./demo";
import type { ClauseEdit } from "./clauses";
import { applyMapToPractice, isDemoFixturePractice } from "./ai/fromMap";
import {
  ENGAGEMENT,
  HREF_FOR_TYPE,
  ddContextOf,
  engagementOf,
  nextIds,
  nextPoolId,
  seedPractice,
  stampDay,
  stampNow,
  xrayContextOf,
  type AssignmentStage,
  type AssignmentType,
  type Movement,
  type PracticeState,
} from "./firm";
import { hydrateDeal, inferDealTx, seedDeal, type DealScenario, type DealState, type DealTx } from "./deal";
import { hydrateAssembly, seedAssembly, type AssemblyInput, type AssemblyState } from "./assembly";
import { clearInviteSession } from "./invite";
import { fetchAiStatus, postAi } from "./ai/client";
import { peekFile } from "./ai/files";
import type { DdLive, NegotiateLive, ReviewLive, XrayLivePayload, XrayView } from "./ai/types";

const AUTH_KEY = "law24-auth";
const THEME_KEY = "law24-theme";
const LANG_KEY = "law24-lang";
const EDITION_KEY = "law24-edition";
const LIVE_KEY = "law24-live";
/** Stays under the route's maxDuration so the user gets our message, not a gateway timeout. */
const AI_STAGE_MS = 70_000;
/**
 * The map and the board are minted in parallel stages that Anthropic queues, so
 * both routinely run past a minute. These sit just above the server's own abort
 * so the browser receives the server's message instead of cancelling first.
 */
const AI_REVIEW_MS = 110_000;
const AI_XRAY_MS = 110_000;

type Store = {
  ready: boolean;
  authed: boolean;
  login: (edition: Edition, opts?: { invite?: boolean }) => void;
  logout: () => void;
  theme: ThemeKey;
  setTheme: (k: ThemeKey) => void;
  themeVars: Record<string, string>;
  lang: Lang;
  setLang: (l: Lang) => void;
  edition: Edition;
  setEdition: (e: Edition) => void;
  toast: string | null;
  flash: (m: string) => void;
  copilotOpen: boolean;
  setCopilotOpen: (v: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  pendingAsk: string | null;
  pendingAskSource: "leio" | "twin";
  ask: (q: string, source?: "leio" | "twin") => void;
  consumeAsk: () => string | null;
  sel: string;
  setSel: (id: string) => void;
  openF: string;
  setOpenF: (id: string) => void;
  q: string;
  setQ: (v: string) => void;
  cat: string;
  setCat: (v: string) => void;
  risk: string;
  setRisk: (v: string) => void;
  prio: string;
  setPrio: (v: string) => void;
  esign: string;
  setEsign: (v: string) => void;
  gsev: string;
  setGsev: (v: string) => void;
  resetFilters: () => void;
  conflictChoice: "thai" | "waiver" | null;
  setConflictChoice: (v: "thai" | "waiver" | null) => void;
  demoOn: boolean;
  demoStep: number;
  matter: MatterId;
  setMatter: (m: MatterId) => void;
  startDemo: () => void;
  stopDemo: () => void;
  resetDemo: () => void;
  setDemoStep: (n: number) => void;
  interviewDone: boolean;
  confirmInterview: () => void;
  dpoApproved: boolean;
  approveDpo: () => void;
  packGenerated: boolean;
  generatePack: () => void;
  signingIssued: boolean;
  issueSigning: () => void;
  findingStatus: Record<string, FindingStatus>;
  setFindingStatus: (id: string, st: FindingStatus) => void;
  boardAccepted: boolean;
  acceptBoard: () => void;
  simRan: boolean;
  markSimRan: () => void;
  memoIssued: boolean;
  issueMemo: () => void;
  sentMoves: Record<string, boolean>;
  sendMove: (id: string) => void;
  positionStatus: Record<string, PositionStatus>;
  setPositionStatus: (id: string, st: PositionStatus) => void;
  flagStatus: Record<string, FlagStatus>;
  setFlagStatus: (id: string, st: FlagStatus) => void;
  requestStatus: Record<string, RequestStatus>;
  setRequestStatus: (id: string, st: RequestStatus) => void;
  alertDone: Record<string, boolean>;
  completeAlert: (id: string) => void;
  uploads: UploadFile[];
  addUploads: (bucket: string, files: { name: string; size: number }[]) => void;
  clauseEdits: Record<string, ClauseEdit>;
  applyClauseEdit: (id: string, edit: ClauseEdit) => void;
  revertClauseEdit: (id: string) => void;
  practice: PracticeState;
  deal: DealState;
  assembly: AssemblyState;
  ingestReviewToAssembly: (inputs: AssemblyInput[], sourceRef: string) => void;
  sendAssemblyToReview: (title: string) => void;
  addClient: (input: { name: string; nameTh?: string; sector: string; owner: string }) => void;
  addAssignment: (input: { clientId: string; title: string; titleTh?: string; type: AssignmentType; due: string; lead: string; fee?: string }) => void;
  addPoolIntake: (input: { clientName: string; engagementName: string; type: AssignmentType }) => void;
  assignPoolIntake: (id: string) => void;
  openXrayEngagement: (input: { clientName: string; engagementName: string }) => void;
  openDealEngagement: (input: { clientName: string; engagementName: string; transaction: DealTx }) => void;
  ensureDeal: () => void;
  setDealTransaction: (tx: DealTx) => void;
  setDealScenario: (sc: DealScenario) => void;
  setDealMateriality: (partial: Partial<{ contract: number; litigation: number; customerPct: number; supplierPct: number }>) => void;
  answerDealQuestion: (id: string, text: string) => void;
  setDealCpStatus: (id: string, status: "open" | "in_progress" | "cleared") => void;
  verifyDeal: () => void;
  setActiveClient: (id: string) => void;
  setActiveAssignment: (id: string) => void;
  xrayReady: boolean;
  xrayLive: XrayView | null;
  xrayError: string | null;
  reviewLive: ReviewLive | null;
  ddLive: DdLive | null;
  negotiateLive: NegotiateLive | null;
  aiLive: boolean | null;
  startXray: (name?: string) => void;
  clearXray: () => void;
  runXray: (opts?: { demo?: boolean; name?: string }) => Promise<"live" | "demo" | "error">;
  setReviewLive: (v: ReviewLive | null) => void;
  setDdLive: (v: DdLive | null) => void;
  setNegotiateLive: (v: NegotiateLive | null) => void;
  lawyerSent: boolean;
  sendToLawyer: () => void;
  roomVotes: Record<string, "approve" | "reject">;
  setRoomVote: (id: string, v: "approve" | "reject") => void;
  quotePkg: string;
  setQuotePkg: (id: string) => void;
};

const Ctx = createContext<Store | null>(null);

function readLive(): LiveState {
  try {
    const raw = localStorage.getItem(LIVE_KEY);
    if (!raw) return defaultLive();
    const parsed = JSON.parse(raw) as Partial<LiveState>;
    const merged = { ...defaultLive(), ...parsed };
    merged.uploads = (merged.uploads || []).map((u) => ({
      name: u.name,
      size: u.size,
      bucket: u.bucket || "diligence",
    }));
    merged.clauseEdits = merged.clauseEdits || {};
    merged.xrayReady = Boolean(merged.xrayReady);
    merged.xrayLive = merged.xrayLive || null;
    merged.reviewLive = merged.reviewLive || null;
    merged.ddLive = merged.ddLive || null;
    merged.negotiateLive = merged.negotiateLive || null;
    merged.lawyerSent = Boolean(merged.lawyerSent);
    merged.roomVotes = merged.roomVotes || {};
    merged.quotePkg = merged.quotePkg || "nda";
    merged.deal = hydrateDeal(merged.deal);
    merged.assembly = hydrateAssembly(merged.assembly);
    if (!merged.practice || isDemoFixturePractice(merged.practice)) {
      merged.practice = seedPractice();
    } else {
      merged.practice = {
        ...merged.practice,
        pool: merged.practice.pool || [],
        assignments: (merged.practice.assignments || []).map((a) => {
          const track = engagementOf(a.type);
          return { ...a, type: track, href: a.href || ENGAGEMENT[track].href };
        }),
      };
    }
    return merged;
  } catch {
    return defaultLive();
  }
}

function bindDeal(p: LiveState, assignmentId: string, clientId: string, title: string, transaction?: DealTx): LiveState {
  const prev = hydrateDeal(p.deal);
  const same = prev.assignmentId === assignmentId;
  return {
    ...p,
    deal: {
      ...(same ? prev : seedDeal()),
      assignmentId,
      clientId,
      transaction: transaction || inferDealTx(title) || (same ? prev.transaction : "share"),
    },
  };
}

function appendMv(
  p: LiveState,
  en: string,
  th: string,
  href: string,
  stage: AssignmentStage,
  extra?: { bump?: AssignmentStage; actor?: string; assignmentId?: string }
): LiveState {
  const assignmentId = extra?.assignmentId ?? p.practice.activeAssignmentId;
  if (!assignmentId || !p.practice.assignments.some((a) => a.id === assignmentId)) return p;
  const mv: Movement = {
    id: `MV-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    assignmentId,
    at: stampNow(),
    actor: extra?.actor ?? FIRM_USER.name,
    stage,
    en,
    th,
    href,
  };
  return {
    ...p,
    practice: {
      ...p.practice,
      movements: [...p.practice.movements, mv],
      assignments: extra?.bump
        ? p.practice.assignments.map((a) => (a.id === assignmentId ? { ...a, stage: extra.bump! } : a))
        : p.practice.assignments,
    },
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [theme, setThemeState] = useState<ThemeKey>("light");
  const [lang, setLangState] = useState<Lang>("th");
  const [edition, setEditionState] = useState<Edition>("corporate");
  const [toast, setToast] = useState<string | null>(null);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pendingAsk, setPendingAsk] = useState<string | null>(null);
  const [pendingAskSource, setPendingAskSource] = useState<"leio" | "twin">("leio");
  const [aiLive, setAiLive] = useState<boolean | null>(null);
  const [xrayError, setXrayError] = useState<string | null>(null);
  const [openF, setOpenF] = useState("F-01");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [risk, setRisk] = useState("");
  const [prio, setPrio] = useState("");
  const [esign, setEsign] = useState("");
  const [gsev, setGsev] = useState("");
  const [live, setLive] = useState<LiveState>(defaultLive);

  useEffect(() => {
    setAuthed(localStorage.getItem(AUTH_KEY) === "1");
    setThemeState(normalizeTheme(localStorage.getItem(THEME_KEY)));
    const l = localStorage.getItem(LANG_KEY);
    if (l === "en" || l === "th") setLangState(l);
    const e = localStorage.getItem(EDITION_KEY);
    if (e === "firm" || e === "corporate") setEditionState(e);
    setLive(readLive());
    setReady(true);
    fetchAiStatus().then(setAiLive);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(LIVE_KEY, JSON.stringify(live));
  }, [live, ready]);

  const patchLive = useCallback((partial: Partial<LiveState> | ((prev: LiveState) => LiveState)) => {
    setLive((prev) => (typeof partial === "function" ? partial(prev) : { ...prev, ...partial }));
  }, []);

  const setTheme = useCallback((k: ThemeKey) => {
    setThemeState(k);
    localStorage.setItem(THEME_KEY, k);
  }, []);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(LANG_KEY, l);
  }, []);
  const setEdition = useCallback((ed: Edition) => {
    setEditionState(ed);
    localStorage.setItem(EDITION_KEY, ed);
  }, []);
  const login = useCallback((ed: Edition, opts?: { invite?: boolean }) => {
    if (!opts?.invite) clearInviteSession();
    setEdition(ed);
    setAuthed(true);
    localStorage.setItem(AUTH_KEY, "1");
  }, [setEdition]);
  const logout = useCallback(() => {
    setAuthed(false);
    localStorage.removeItem(AUTH_KEY);
    clearInviteSession();
  }, []);
  const flash = useCallback((m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2600);
  }, []);
  const ask = useCallback((question: string, source: "leio" | "twin" = "leio") => {
    setSearchOpen(false);
    setCopilotOpen(true);
    setPendingAsk(question);
    setPendingAskSource(source);
  }, []);
  const consumeAsk = useCallback(() => {
    const v = pendingAsk;
    setPendingAsk(null);
    return v;
  }, [pendingAsk]);
  const resetFilters = useCallback(() => {
    setQ(""); setCat(""); setRisk(""); setPrio(""); setEsign("");
  }, []);

  const startDemo = useCallback(() => {
    setLive((prev) => {
      const next = defaultLive();
      next.demoOn = true;
      next.demoStep = 0;
      next.matter = "nimbus";
      next.sel = DEMO_TYPE_ID;
      next.xrayReady = true;
      next.xrayLive = null;
      next.reviewLive = null;
      next.ddLive = null;
      next.negotiateLive = null;
      next.uploads = [{ name: "Nimbus_Cloud_SaaS_CT-291.pdf", size: 842_110, bucket: "xray" }];
      next.practice = seedPractice();
      return next;
    });
    setQ("SaaS");
    setCat("C15");
    setOpenF("F-01");
  }, []);
  const stopDemo = useCallback(() => patchLive({ demoOn: false }), [patchLive]);
  const resetDemo = useCallback(() => startDemo(), [startDemo]);
  const setDemoStep = useCallback((n: number) => patchLive({ demoStep: n }), [patchLive]);
  const setMatter = useCallback((m: MatterId) => patchLive({ matter: m }), [patchLive]);
  const setSel = useCallback((id: string) => patchLive({ sel: id }), [patchLive]);
  const setConflictChoice = useCallback((v: "thai" | "waiver" | null) => {
    patchLive((p) => {
      const next = { ...p, conflictChoice: v };
      if (edition !== "firm" || !v) return next;
      return appendMv(
        next,
        v === "thai" ? "Thai-law conflict resolved. House position kept." : "Conflict waived in favour of counterparty paper.",
        v === "thai" ? "ยุติความขัดแย้งกฎหมายไทย คงท่าทีสำนักงาน" : "สละท่าทีให้ตามร่างคู่สัญญา",
        "/assemble?s=asm",
        "work"
      );
    });
  }, [patchLive, edition]);
  const confirmInterview = useCallback(() => {
    patchLive((p) => {
      const next = { ...p, interviewDone: true };
      return edition === "firm"
        ? appendMv(next, "Client interview confirmed. Commercial positions locked for this round.", "ยืนยันสัมภาษณ์ลูกค้า ล็อกท่าทีเชิงพาณิชย์รอบนี้", "/assemble?s=iv", "work")
        : next;
    });
  }, [patchLive, edition]);
  const ingestReviewToAssembly = useCallback((inputs: AssemblyInput[], sourceRef: string) => {
    patchLive((p) => {
      const next = {
        ...p,
        assembly: {
          ...hydrateAssembly(p.assembly),
          sourceRef,
          acceptedInputs: inputs,
          ingestedAt: stampNow(),
          reviewHandoff: null,
        },
        interviewDone: false,
        packGenerated: false,
        signingIssued: false,
      };
      return edition === "firm"
        ? appendMv(
            next,
            `${inputs.length} source-backed Review inputs ingested into Assembly from ${sourceRef}.`,
            `รับข้อมูลจาก Review ที่ชี้แหล่ง ${inputs.length} รายการเข้า Assembly จาก ${sourceRef}`,
            "/assemble?s=intake",
            "work"
          )
        : next;
    });
  }, [patchLive, edition]);
  const sendAssemblyToReview = useCallback((title: string) => {
    patchLive((p) => {
      const current = p.practice.assignments.find((a) => a.id === p.practice.activeAssignmentId);
      const assembly = hydrateAssembly(p.assembly);
      const at = stampNow();
      const handoff = {
        title: title.trim() || "Assembled draft",
        sourceRef: assembly.sourceRef,
        inputCount: assembly.acceptedInputs.length,
        at,
      };
      if (edition !== "firm" || !current) {
        return { ...p, assembly: { ...assembly, reviewHandoff: handoff } };
      }
      const existing = p.practice.assignments.find((a) =>
        a.clientId === current.clientId
        && engagementOf(a.type) === "review"
        && a.stage !== "closed"
        && a.title === handoff.title
      );
      const assignmentId = existing?.id || nextIds(p.practice).assignmentId;
      const next: LiveState = {
        ...p,
        xrayReady: false,
        xrayLive: null,
        reviewLive: null,
        assembly: { ...assembly, reviewHandoff: handoff },
        practice: {
          ...p.practice,
          activeClientId: current.clientId,
          activeAssignmentId: assignmentId,
          assignments: existing
            ? p.practice.assignments
            : [
                ...p.practice.assignments,
                {
                  id: assignmentId,
                  clientId: current.clientId,
                  title: handoff.title,
                  titleTh: handoff.title,
                  type: "review",
                  stage: "intake",
                  lead: current.lead,
                  due: current.due,
                  fee: "THB 0",
                  href: "/review?s=xray",
                },
              ],
        },
      };
      return appendMv(
        next,
        `Assembled draft received for Contract Review with ${handoff.inputCount} source-backed inputs.`,
        `รับร่างจาก Assembly เข้างานตรวจ พร้อมข้อมูลชี้แหล่ง ${handoff.inputCount} รายการ`,
        "/review?s=xray",
        "intake",
        { assignmentId }
      );
    });
  }, [patchLive, edition]);
  const approveDpo = useCallback(() => {
    patchLive((p) => {
      const next = { ...p, dpoApproved: true };
      return edition === "firm"
        ? appendMv(next, "DPO approved the pack.", "DPO อนุมัติชุดเอกสาร", "/assemble?s=draft", "work")
        : next;
    });
  }, [patchLive, edition]);
  const generatePack = useCallback(() => {
    patchLive((p) => {
      const next = { ...p, packGenerated: true };
      return edition === "firm"
        ? appendMv(next, "DOCX/PDF pack generated.", "สร้างชุด DOCX/PDF แล้ว", "/assemble?s=draft", "work")
        : next;
    });
  }, [patchLive, edition]);
  const issueSigning = useCallback(() => patchLive({ signingIssued: true }), [patchLive]);
  const applyClauseEdit = useCallback((id: string, edit: ClauseEdit) => {
    patchLive((p) => {
      const next: LiveState = {
        ...p,
        clauseEdits: { ...(p.clauseEdits || {}), [id]: edit },
        packGenerated: false,
        signingIssued: false,
      };
      if (edition !== "firm") return next;
      return appendMv(
        next,
        `Standard clause ${id} adjusted (${edit.mode}). Pack must be regenerated.`,
        `ปรับข้อมาตรฐาน ${id} (${edit.mode === "ai" ? "AI" : "ด้วยมือ"}) ต้องสร้างชุดใหม่`,
        "/assemble?s=draft",
        "work"
      );
    });
  }, [patchLive, edition]);
  const revertClauseEdit = useCallback((id: string) => {
    patchLive((p) => {
      const nextEdits = { ...(p.clauseEdits || {}) };
      delete nextEdits[id];
      return { ...p, clauseEdits: nextEdits, packGenerated: false, signingIssued: false };
    });
  }, [patchLive]);
  const setFindingStatus = useCallback((id: string, st: FindingStatus) => {
    patchLive((p) => {
      const next = { ...p, findingStatus: { ...p.findingStatus, [id]: st } };
      if (edition !== "firm") return next;
      return appendMv(next, `Finding ${id} marked ${st}.`, `ข้อค้นพบ ${id} เป็น ${st}`, "/review?s=find", "work");
    });
  }, [patchLive, edition]);
  const acceptBoard = useCallback(() => {
    patchLive((p) => {
      const next = { ...p, boardAccepted: true };
      return edition === "firm"
        ? appendMv(next, "Review board accepted. Posture: renegotiate.", "คณะกรรมการรับคำแนะนำ ท่าที: เจรจาใหม่", "/review?s=board", "review")
        : next;
    });
  }, [patchLive, edition]);
  const markSimRan = useCallback(() => patchLive({ simRan: true }), [patchLive]);
  const issueMemo = useCallback(() => {
    patchLive((p) => {
      const next = { ...p, memoIssued: true };
      return edition === "firm"
        ? appendMv(next, "Decision memo issued to client.", "ออกบันทึกตัดสินใจถึงลูกค้า", "/holistic?s=memo", "client", { bump: "client" })
        : next;
    });
  }, [patchLive, edition]);
  const sendMove = useCallback((id: string) => {
    patchLive((p) => ({ ...p, sentMoves: { ...p.sentMoves, [id]: true } }));
  }, [patchLive]);
  const setPositionStatus = useCallback((id: string, st: PositionStatus) => {
    patchLive((p) => ({ ...p, positionStatus: { ...p.positionStatus, [id]: st } }));
  }, [patchLive]);
  const setFlagStatus = useCallback((id: string, st: FlagStatus) => {
    patchLive((p) => {
      const next = { ...p, flagStatus: { ...p.flagStatus, [id]: st } };
      if (edition !== "firm") return next;
      return appendMv(next, `Flag ${id} marked ${st}.`, `ธง ${id} เป็น ${st}`, "/diligence?s=dflags", "work");
    });
  }, [patchLive, edition]);
  const setRequestStatus = useCallback((id: string, st: RequestStatus) => {
    patchLive((p) => ({ ...p, requestStatus: { ...p.requestStatus, [id]: st } }));
  }, [patchLive]);
  const completeAlert = useCallback((id: string) => {
    patchLive((p) => {
      const next = { ...p, alertDone: { ...p.alertDone, [id]: true } };
      if (edition !== "firm") return next;
      return appendMv(next, `Alert ${id} completed.`, `ปิดการแจ้งเตือน ${id}`, "/obligations?s=oalert", "work");
    });
  }, [patchLive, edition]);
  const addUploads = useCallback((bucket: string, files: { name: string; size: number }[]) => {
    if (bucket === "xray") setXrayError(null);
    patchLive((p) => ({
      ...p,
      uploads: [
        ...files.map((f) => ({ ...f, bucket })),
        ...p.uploads.filter((u) => u.bucket !== bucket),
      ].slice(0, 40),
      ...(bucket === "xray" ? { xrayReady: false, xrayLive: null, reviewLive: null } : {}),
    }));
  }, [patchLive]);
  const addClient = useCallback((input: { name: string; nameTh?: string; sector: string; owner: string }) => {
    patchLive((p) => {
      const { clientId } = nextIds(p.practice);
      return {
        ...p,
        practice: {
          ...p.practice,
          activeClientId: clientId,
          clients: [
            ...p.practice.clients,
            {
              id: clientId,
              name: input.name,
              nameTh: input.nameTh || input.name,
              sector: input.sector,
              owner: input.owner,
              opened: stampDay(),
              status: "active",
            },
          ],
        },
      };
    });
  }, [patchLive]);
  const addAssignment = useCallback((input: { clientId: string; title: string; titleTh?: string; type: AssignmentType; due: string; lead: string; fee?: string }) => {
    patchLive((p) => {
      const { assignmentId } = nextIds(p.practice);
      const href = ENGAGEMENT[engagementOf(input.type)].href || HREF_FOR_TYPE[input.type];
      const next = {
        ...p,
        practice: {
          ...p.practice,
          activeClientId: input.clientId,
          activeAssignmentId: assignmentId,
          assignments: [
            ...p.practice.assignments,
            {
              id: assignmentId,
              clientId: input.clientId,
              title: input.title,
              titleTh: input.titleTh || input.title,
              type: input.type,
              stage: "intake" as const,
              lead: input.lead,
              due: stampDay(input.due),
              fee: input.fee || "THB 0",
              href,
            },
          ],
        },
      };
      const bound = engagementOf(input.type) === "diligence"
        ? bindDeal(next, assignmentId, input.clientId, input.title, inferDealTx(input.title))
        : next;
      return appendMv(
        bound,
        "Assignment opened. Intake logged.",
        "เปิดงาน บันทึกการรับเรื่อง",
        href,
        "intake",
        { assignmentId }
      );
    });
  }, [patchLive]);
  const addPoolIntake = useCallback((input: { clientName: string; engagementName: string; type: AssignmentType }) => {
    patchLive((p) => ({
      ...p,
      practice: {
        ...p.practice,
        pool: [
          ...(p.practice.pool || []),
          {
            id: nextPoolId(p.practice),
            clientName: input.clientName.trim(),
            engagementName: input.engagementName.trim(),
            type: engagementOf(input.type),
            received: stampNow(),
          },
        ],
      },
    }));
  }, [patchLive]);
  const assignPoolIntake = useCallback((id: string) => {
    patchLive((p) => {
      const item = (p.practice.pool || []).find((row) => row.id === id);
      if (!item) return p;
      const existingClient = p.practice.clients.find((c) =>
        c.name.trim().toLowerCase() === item.clientName.toLowerCase()
        || c.nameTh.trim().toLowerCase() === item.clientName.toLowerCase()
      );
      const ids = nextIds(p.practice);
      const clientId = existingClient?.id || ids.clientId;
      const assignmentId = ids.assignmentId;
      const href = ENGAGEMENT[item.type].href;
      const next = {
        ...p,
        practice: {
          ...p.practice,
          activeClientId: clientId,
          activeAssignmentId: assignmentId,
          pool: (p.practice.pool || []).filter((row) => row.id !== id),
          clients: existingClient
            ? p.practice.clients
            : [
                ...p.practice.clients,
                {
                  id: clientId,
                  name: item.clientName,
                  nameTh: item.clientName,
                  sector: ENGAGEMENT[item.type].en,
                  owner: FIRM_USER.name,
                  opened: stampDay(),
                  status: "active" as const,
                },
              ],
          assignments: [
            ...p.practice.assignments,
            {
              id: assignmentId,
              clientId,
              title: item.engagementName,
              titleTh: item.engagementName,
              type: item.type,
              stage: "intake" as const,
              lead: FIRM_USER.name,
              due: stampDay("2026-09-30"),
              fee: "THB 0",
              href,
            },
          ],
        },
      };
      const bound = item.type === "diligence"
        ? bindDeal(next, assignmentId, clientId, item.engagementName, inferDealTx(item.engagementName))
        : next;
      return appendMv(
        bound,
        `Assigned from Firm pool (${item.id}). Intake logged.`,
        `รับจากคิวสำนักงาน (${item.id}) และบันทึกรับเรื่อง`,
        href,
        "intake",
        { assignmentId }
      );
    });
  }, [patchLive]);
  const openXrayEngagement = useCallback((input: { clientName: string; engagementName: string }) => {
    patchLive((p) => {
      const clientName = input.clientName.trim();
      const engagementName = input.engagementName.trim();
      const existingClient = p.practice.clients.find((c) =>
        c.name.trim().toLowerCase() === clientName.toLowerCase()
        || c.nameTh.trim().toLowerCase() === clientName.toLowerCase()
      );
      const ids = nextIds(p.practice);
      const clientId = existingClient?.id || ids.clientId;
      const assignmentId = ids.assignmentId;
      const next = {
        ...p,
        practice: {
          ...p.practice,
          activeClientId: clientId,
          activeAssignmentId: assignmentId,
          clients: existingClient
            ? p.practice.clients
            : [
                ...p.practice.clients,
                {
                  id: clientId,
                  name: clientName,
                  nameTh: clientName,
                  sector: "Contract review",
                  owner: FIRM_USER.name,
                  opened: stampDay(),
                  status: "active" as const,
                },
              ],
          assignments: [
            ...p.practice.assignments,
            {
              id: assignmentId,
              clientId,
              title: engagementName,
              titleTh: engagementName,
              type: "review" as const,
              stage: "intake" as const,
              lead: FIRM_USER.name,
              due: stampDay("2026-09-30"),
              fee: "THB 0",
              href: "/review?s=xray",
            },
          ],
        },
      };
      return appendMv(
        next,
        "Contract review engagement opened for X-Ray. Intake logged.",
        "เปิดงานตรวจสัญญาสำหรับ X-Ray และบันทึกรับเรื่อง",
        "/review?s=xray",
        "intake",
        { assignmentId }
      );
    });
  }, [patchLive]);
  const openDealEngagement = useCallback((input: { clientName: string; engagementName: string; transaction: DealTx }) => {
    patchLive((p) => {
      const clientName = input.clientName.trim();
      const engagementName = input.engagementName.trim();
      const existingClient = p.practice.clients.find((c) =>
        c.name.trim().toLowerCase() === clientName.toLowerCase()
        || c.nameTh.trim().toLowerCase() === clientName.toLowerCase()
      );
      const existingAssignment = p.practice.assignments.find((a) =>
        a.clientId === (existingClient?.id || "")
        && engagementOf(a.type) === "diligence"
        && a.stage !== "closed"
        && a.title.trim().toLowerCase() === engagementName.toLowerCase()
      );
      const ids = nextIds(p.practice);
      const clientId = existingClient?.id || ids.clientId;
      const assignmentId = existingAssignment?.id || ids.assignmentId;
      const href = "/diligence?s=deal";
      let next: LiveState = {
        ...p,
        practice: {
          ...p.practice,
          activeClientId: clientId,
          activeAssignmentId: assignmentId,
          clients: existingClient
            ? p.practice.clients
            : [
                ...p.practice.clients,
                {
                  id: clientId,
                  name: clientName,
                  nameTh: clientName,
                  sector: "Legal due diligence",
                  owner: FIRM_USER.name,
                  opened: stampDay(),
                  status: "active" as const,
                },
              ],
          assignments: existingAssignment
            ? p.practice.assignments
            : [
                ...p.practice.assignments,
                {
                  id: assignmentId,
                  clientId,
                  title: engagementName,
                  titleTh: engagementName,
                  type: "diligence" as const,
                  stage: "intake" as const,
                  lead: FIRM_USER.name,
                  due: stampDay("2026-09-30"),
                  fee: "THB 0",
                  href,
                },
              ],
        },
      };
      next = bindDeal(next, assignmentId, clientId, engagementName, input.transaction);
      if (existingAssignment) return next;
      return appendMv(
        next,
        "Legal DD engagement opened for Deal X-Ray. Intake logged.",
        "เปิดงานตรวจสอบสถานะสำหรับ Deal X-Ray และบันทึกรับเรื่อง",
        href,
        "intake",
        { assignmentId }
      );
    });
  }, [patchLive]);
  const ensureDeal = useCallback(() => {
    patchLive((p) => {
      const ctx = ddContextOf(p.practice);
      if (!ctx) return p;
      const d = hydrateDeal(p.deal);
      if (d.assignmentId === ctx.assignment.id && d.clientId === ctx.client.id) return p;
      return bindDeal(p, ctx.assignment.id, ctx.client.id, ctx.assignment.title);
    });
  }, [patchLive]);
  const setDealTransaction = useCallback((tx: DealTx) => {
    patchLive((p) => ({ ...p, deal: { ...hydrateDeal(p.deal), transaction: tx } }));
  }, [patchLive]);
  const setDealScenario = useCallback((sc: DealScenario) => {
    patchLive((p) => ({ ...p, deal: { ...hydrateDeal(p.deal), scenario: sc } }));
  }, [patchLive]);
  const setDealMateriality = useCallback((partial: Partial<{ contract: number; litigation: number; customerPct: number; supplierPct: number }>) => {
    patchLive((p) => {
      const d = hydrateDeal(p.deal);
      return { ...p, deal: { ...d, materiality: { ...d.materiality, ...partial } } };
    });
  }, [patchLive]);
  const answerDealQuestion = useCallback((id: string, text: string) => {
    patchLive((p) => {
      const d = hydrateDeal(p.deal);
      return { ...p, deal: { ...d, answers: { ...d.answers, [id]: { text } } } };
    });
  }, [patchLive]);
  const setDealCpStatus = useCallback((id: string, status: "open" | "in_progress" | "cleared") => {
    patchLive((p) => {
      const d = hydrateDeal(p.deal);
      return { ...p, deal: { ...d, cpStatus: { ...d.cpStatus, [id]: status } } };
    });
  }, [patchLive]);
  const verifyDeal = useCallback(() => {
    patchLive((p) => {
      const next = { ...p, deal: { ...hydrateDeal(p.deal), verified: true } };
      return appendMv(next, "Counsel verified the Deal X-Ray for this round.", "ทนายยืนยัน Deal X-Ray รอบนี้", "/diligence?s=deal", "review");
    });
  }, [patchLive]);
  const setActiveClient = useCallback((id: string) => {
    patchLive((p) => ({ ...p, practice: { ...p.practice, activeClientId: id } }));
  }, [patchLive]);
  const setActiveAssignment = useCallback((id: string) => {
    patchLive((p) => ({ ...p, practice: { ...p.practice, activeAssignmentId: id } }));
  }, [patchLive]);
  const startXray = useCallback((name?: string) => {
    setXrayError(null);
    patchLive((p) => {
      // Navigation may request X-Ray before Firm intake exists. Keep the map
      // closed and let the X-Ray screen collect client + engagement first.
      if (!xrayContextOf(p.practice)) {
        return { ...p, xrayReady: false, xrayLive: null, reviewLive: null };
      }
      return {
        ...p,
        xrayReady: true,
        xrayLive: null,
        reviewLive: null,
        sel: p.sel || DEMO_TYPE_ID,
        matter: p.matter || "nimbus",
        uploads: p.uploads.some((u) => u.bucket === "xray")
          ? p.uploads
          : [{ name: name || "Nimbus_Cloud_SaaS_CT-291.pdf", size: 842_110, bucket: "xray" }, ...p.uploads].slice(0, 40),
      };
    });
    setQ("SaaS");
    setCat("C15");
    setOpenF("F-01");
  }, [patchLive]);
  const clearXray = useCallback(() => {
    setXrayError(null);
    patchLive((p) => ({ ...p, xrayReady: false, xrayLive: null }));
  }, [patchLive]);
  /** Second stage. Findings and the board fall back to the house fixture if this fails. */
  const loadReview = useCallback(async (file: File) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("filename", file.name);
      const pack = await postAi<ReviewLive>("/api/ai/review", fd, AI_REVIEW_MS);
      // Cards and the board are separate stages — keep whichever one arrived.
      if (pack?.findings?.length || pack?.board?.length) {
        patchLive((p) => ({
          ...p,
          reviewLive: pack,
          practice: p.xrayLive ? applyMapToPractice(p.practice, p.xrayLive, pack) : p.practice,
        }));
      }
    } catch {
      /* the map still stands on its own */
    }
  }, [patchLive]);
  const runXray = useCallback(async (opts?: { demo?: boolean; name?: string }) => {
    if (!xrayContextOf(live.practice)) {
      setXrayError("Choose a Firm client and contract-review engagement before Contract X-Ray can process a document.");
      return "error" as const;
    }
    if (opts?.demo) {
      startXray(opts.name);
      return "demo" as const;
    }
    const file = peekFile("xray") || peekFile("review");
    if (!file) {
      setXrayError("That upload is no longer held in this browser session. Drop the file again, or run the Nimbus sample.");
      return "error" as const;
    }
    const providerLive = await fetchAiStatus();
    if (!providerLive) {
      startXray(file.name);
      return "demo" as const;
    }
    setXrayError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("filename", file.name);
      const pack = await postAi<XrayLivePayload>("/api/ai/xray", fd, AI_XRAY_MS);
      if (!pack?.xray) throw new Error("Live X-Ray returned an empty map");
      patchLive((p) => ({
        ...p,
        xrayReady: true,
        xrayLive: pack.xray,
        reviewLive: null,
        sel: p.sel || DEMO_TYPE_ID,
        matter: p.xrayLive ? p.matter : (p.matter || "nimbus"),
        uploads: p.uploads.some((u) => u.bucket === "xray")
          ? p.uploads
          : [{ name: file.name, size: file.size, bucket: "xray" }, ...p.uploads].slice(0, 40),
        practice: applyMapToPractice(p.practice, pack.xray),
      }));
      setQ("SaaS");
      setCat("C15");
      setOpenF("F-01");
      fetchAiStatus(true).then(setAiLive);
      void loadReview(file);
      return "live" as const;
    } catch (err) {
      setXrayError(err instanceof Error ? err.message : "Live X-Ray failed");
      return "error" as const;
    }
  }, [live.practice, loadReview, patchLive, startXray]);
  const setReviewLive = useCallback((v: ReviewLive | null) => patchLive({ reviewLive: v }), [patchLive]);
  const setDdLive = useCallback((v: DdLive | null) => patchLive({ ddLive: v }), [patchLive]);
  const setNegotiateLive = useCallback((v: NegotiateLive | null) => patchLive({ negotiateLive: v }), [patchLive]);
  const sendToLawyer = useCallback(() => {
    patchLive((p) => ({ ...p, lawyerSent: true }));
  }, [patchLive]);
  const setRoomVote = useCallback((id: string, v: "approve" | "reject") => {
    patchLive((p) => ({ ...p, roomVotes: { ...p.roomVotes, [id]: v } }));
  }, [patchLive]);
  const setQuotePkg = useCallback((id: string) => {
    patchLive((p) => ({ ...p, quotePkg: id }));
  }, [patchLive]);

  const themeVars = useMemo(() => ({ ...THEMES[theme].vars }), [theme]);

  const value: Store = {
    ready, authed, login, logout, theme, setTheme, themeVars, lang, setLang, edition, setEdition,
    toast, flash, copilotOpen, setCopilotOpen, searchOpen, setSearchOpen, pendingAsk, pendingAskSource, ask, consumeAsk,
    sel: live.sel, setSel, openF, setOpenF, q, setQ, cat, setCat, risk, setRisk, prio, setPrio, esign, setEsign,
    gsev, setGsev, resetFilters, conflictChoice: live.conflictChoice, setConflictChoice,
    demoOn: live.demoOn, demoStep: live.demoStep, matter: live.matter, setMatter,
    startDemo, stopDemo, resetDemo, setDemoStep,
    interviewDone: live.interviewDone, confirmInterview,
    dpoApproved: live.dpoApproved, approveDpo,
    packGenerated: live.packGenerated, generatePack,
    signingIssued: live.signingIssued, issueSigning,
    findingStatus: live.findingStatus, setFindingStatus,
    boardAccepted: live.boardAccepted, acceptBoard,
    simRan: live.simRan, markSimRan,
    memoIssued: live.memoIssued, issueMemo,
    sentMoves: live.sentMoves, sendMove,
    positionStatus: live.positionStatus, setPositionStatus,
    flagStatus: live.flagStatus, setFlagStatus,
    requestStatus: live.requestStatus, setRequestStatus,
    alertDone: live.alertDone, completeAlert,
    uploads: live.uploads, addUploads,
    clauseEdits: live.clauseEdits ?? {}, applyClauseEdit, revertClauseEdit,
    practice: live.practice ?? seedPractice(), addClient, addAssignment, addPoolIntake, assignPoolIntake, openXrayEngagement, openDealEngagement, ensureDeal, setDealTransaction, setDealScenario, setDealMateriality, answerDealQuestion, setDealCpStatus, verifyDeal, setActiveClient, setActiveAssignment,
    deal: live.deal ?? seedDeal(),
    assembly: live.assembly ?? seedAssembly(), ingestReviewToAssembly, sendAssemblyToReview,
    xrayReady: live.xrayReady,
    xrayLive: live.xrayLive ?? null,
    xrayError,
    reviewLive: live.reviewLive ?? null,
    ddLive: live.ddLive ?? null,
    negotiateLive: live.negotiateLive ?? null,
    aiLive,
    startXray,
    clearXray,
    runXray,
    setReviewLive,
    setDdLive,
    setNegotiateLive,
    lawyerSent: live.lawyerSent, sendToLawyer,
    roomVotes: live.roomVotes ?? {}, setRoomVote, quotePkg: live.quotePkg || "nda", setQuotePkg,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("StoreProvider missing");
  return v;
}

export function modeHref(mode: ModeKey, screen?: ScreenKey) {
  if (mode === "home") return "/home";
  const s = screen ?? defaultScreen(mode);
  return `/${mode}?s=${s}`;
}
