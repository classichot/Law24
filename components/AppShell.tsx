"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, LogOut, Menu, X } from "lucide-react";
import { CORPORATE_USER, FIRM_USER } from "@/lib/model";
import { MODES, NAV, isMode } from "@/lib/nav";
import { modeHref, useStore } from "@/lib/store";
import { LangToggle } from "@/components/LangToggle";
import { ModeToggle } from "@/components/ModeToggle";
import { Copilot } from "@/components/Copilot";
import { T } from "@/lib/i18n";
import type { ReactNode } from "react";
import { useState } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const { logout, toast, setCopilotOpen, copilotOpen, lang, edition } = useStore();
  const user = edition === "firm" ? FIRM_USER : CORPORATE_USER;
  const [menu, setMenu] = useState(false);

  const mode = path === "/home" || path === "/" ? "home" : path.replace("/", "").split("/")[0];
  const screen = params.get("s") || (isMode(mode) ? NAV[mode][0][0] : "home");
  const notHome = mode !== "home";
  const sub = isMode(mode) ? NAV[mode] : [];

  return (
    <div className="os-shell">
      <header className="os-topbar">
        <button className="os-grid-btn menu-btn" onClick={() => setMenu(true)} aria-label="Menu"><Menu size={16} /></button>
        <Link href="/home" className="os-grid-btn" title={lang === "th" ? "โมดูลทั้งหมด" : "All modules"}>
          <span className="os-grid-dots"><span /><span /><span /><span /></span>
        </Link>
        <Link href="/home" className="os-brand">
          <span className="os-brand-name">LAW24</span>
          <span className="os-os-badge">os</span>
        </Link>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", minWidth: 0 }}>
          <button className="os-ask" type="button" onClick={() => setCopilotOpen(!copilotOpen)}>
            <span style={{ color: "var(--color-accent)", fontSize: 12 }}>✦</span>
            <span><T en="Ask LAW24 or search…" th="ถาม LAW24 หรือค้นหา…" /></span>
          </button>
        </div>
        <span className="os-online header-hide-sm"><span className="os-dot" /> <T en="Online" th="ออนไลน์" /></span>
        <LangToggle />
        <ModeToggle compact />
        <div className="os-user">
          <div className="os-avatar">{user.initials}</div>
          <div style={{ lineHeight: 1.35 }} className="header-hide-sm">
            <div style={{ fontSize: 12, fontWeight: 600 }}>{lang === "th" ? user.nameTh : user.name}</div>
            <div style={{ fontSize: 10, color: "var(--color-neutral-600)" }}>{lang === "th" ? user.roleTh : user.role}</div>
          </div>
          <button title="Sign out" onClick={() => { logout(); router.push("/"); }} style={{ border: 0, background: "transparent", cursor: "pointer", color: "var(--color-neutral-600)", display: "inline-flex" }}>
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {notHome && (
        <>
          <div className="os-modes">
            <Link href="/home" style={{ color: "var(--color-neutral-600)", fontSize: 11, textDecoration: "none", padding: "13px 0" }}>← <T en="All modules" th="โมดูลทั้งหมด" /></Link>
            <span style={{ width: 1, height: 16, background: "var(--color-neutral-400)", flex: "none" }} />
            {MODES.map((m) => (
              <Link key={m.k} href={modeHref(m.k)} className={mode === m.k ? "on" : ""}>{m.en}</Link>
            ))}
            <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--color-neutral-600)", whiteSpace: "nowrap" }}>
              {edition === "firm"
                ? (lang === "th" ? "สยาม ดิจิทัล — M-2481 จัดหาระบบ core platform" : "Siam Digital — M-2481 core platform sourcing")
                : (lang === "th" ? "สยาม ดิจิทัล — จัดหาระบบ core platform" : "Siam Digital — core platform sourcing")}
            </span>
          </div>
          <div className="os-subnav">
            {sub.map(([k, th, en]) => (
              <Link key={k} href={modeHref(mode as "assemble", k)} className={screen === k ? "on" : ""}>
                {lang === "th" ? th : en}
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="os-body">
        <main className="page-main">{children}</main>
        <Copilot />
      </div>

      <nav className="bottom-nav no-print">
        <Link href="/home" className={mode === "home" ? "active" : ""}>Home</Link>
        <Link href="/assemble?s=lib" className={mode === "assemble" ? "active" : ""}>Assemble</Link>
        <Link href="/review?s=find" className={mode === "review" ? "active" : ""}>Review</Link>
        <Link href="/diligence?s=dflags" className={mode === "diligence" ? "active" : ""}>DD</Link>
        <Link href="/obligations?s=oreg" className={mode === "obligations" ? "active" : ""}>Oblig.</Link>
      </nav>

      {menu && (
        <>
          <div className="os-drawer-backdrop" onClick={() => setMenu(false)} />
          <aside className="os-drawer">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <span className="os-brand-name">LAW24</span>
              <button className="icon-btn" onClick={() => setMenu(false)} aria-label="Close"><X size={16} /></button>
            </div>
            <Link href="/home" className="os-drawer-link" onClick={() => setMenu(false)}><T en="All modules" th="โมดูลทั้งหมด" /></Link>
            {MODES.map((m) => (
              <Link key={m.k} href={modeHref(m.k)} className={`os-drawer-link${mode === m.k ? " on" : ""}`} onClick={() => setMenu(false)}>
                {lang === "th" ? m.th : m.en}
              </Link>
            ))}
          </aside>
        </>
      )}
      {toast && (
        <div className="toast">
          <Check size={16} color="var(--color-accent-400)" />
          {toast}
        </div>
      )}
    </div>
  );
}
