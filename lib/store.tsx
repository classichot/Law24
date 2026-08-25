"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { THEMES, normalizeTheme, type ThemeKey } from "./format";
import type { Edition, Lang, ModeKey, ScreenKey } from "./model";
import { defaultScreen } from "./nav";

const AUTH_KEY = "law24-auth";
const THEME_KEY = "law24-theme";
const LANG_KEY = "law24-lang";
const EDITION_KEY = "law24-edition";

type Store = {
  ready: boolean;
  authed: boolean;
  login: (edition: Edition) => void;
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
  pendingAsk: string | null;
  ask: (q: string) => void;
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
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [theme, setThemeState] = useState<ThemeKey>("light");
  const [lang, setLangState] = useState<Lang>("th");
  const [edition, setEditionState] = useState<Edition>("corporate");
  const [toast, setToast] = useState<string | null>(null);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [pendingAsk, setPendingAsk] = useState<string | null>(null);
  const [sel, setSel] = useState("CT-291");
  const [openF, setOpenF] = useState("F-01");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [risk, setRisk] = useState("");
  const [prio, setPrio] = useState("");
  const [esign, setEsign] = useState("");
  const [gsev, setGsev] = useState("");
  const [conflictChoice, setConflictChoice] = useState<"thai" | "waiver" | null>(null);

  useEffect(() => {
    setAuthed(localStorage.getItem(AUTH_KEY) === "1");
    setThemeState(normalizeTheme(localStorage.getItem(THEME_KEY)));
    const l = localStorage.getItem(LANG_KEY);
    if (l === "en" || l === "th") setLangState(l);
    const e = localStorage.getItem(EDITION_KEY);
    if (e === "firm" || e === "corporate") setEditionState(e);
    setReady(true);
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
  const login = useCallback((ed: Edition) => {
    setEdition(ed);
    setAuthed(true);
    localStorage.setItem(AUTH_KEY, "1");
  }, [setEdition]);
  const logout = useCallback(() => {
    setAuthed(false);
    localStorage.removeItem(AUTH_KEY);
  }, []);
  const flash = useCallback((m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2400);
  }, []);
  const ask = useCallback((question: string) => {
    setCopilotOpen(true);
    setPendingAsk(question);
  }, []);
  const consumeAsk = useCallback(() => {
    const v = pendingAsk;
    setPendingAsk(null);
    return v;
  }, [pendingAsk]);
  const resetFilters = useCallback(() => {
    setQ(""); setCat(""); setRisk(""); setPrio(""); setEsign("");
  }, []);

  const themeVars = useMemo(() => ({ ...THEMES[theme].vars }), [theme]);

  const value: Store = {
    ready, authed, login, logout, theme, setTheme, themeVars, lang, setLang, edition, setEdition,
    toast, flash, copilotOpen, setCopilotOpen, pendingAsk, ask, consumeAsk,
    sel, setSel, openF, setOpenF, q, setQ, cat, setCat, risk, setRisk, prio, setPrio, esign, setEsign,
    gsev, setGsev, resetFilters, conflictChoice, setConflictChoice,
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
