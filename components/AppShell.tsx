"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, LogOut, Menu, Search, X } from "lucide-react";
import { CORPORATE_USER, FIRM_USER } from "@/lib/model";
import { NAV, isMode, navModes } from "@/lib/nav";
import { modeHref, useStore } from "@/lib/store";
import { DEMO_STEPS, MATTERS, matterForMode, type MatterId } from "@/lib/demo";
import { LangToggle } from "@/components/LangToggle";
import { ModeToggle } from "@/components/ModeToggle";
import { EditionBadge } from "@/components/EditionBadge";
import { Copilot } from "@/components/Copilot";
import { DemoBar } from "@/components/DemoBar";
import { CommandPalette } from "@/components/CommandPalette";
import { ScreenNav } from "@/components/ScreenNav";
import { GuideRail } from "@/components/GuideRail";
import { T } from "@/lib/i18n";
import { TrustStrip } from "@/components/TrustStrip";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const s = useStore();
  const user = s.edition === "firm" ? FIRM_USER : CORPORATE_USER;
  const [menu, setMenu] = useState(false);

  const mode = path === "/home" || path === "/" ? "home" : path.replace("/", "").split("/")[0];
  const screen = params.get("s") || (isMode(mode) ? NAV[mode][0][0] : "home");
  const notHome = mode !== "home";
  const sub = isMode(mode) ? NAV[mode] : [];
  const matter = MATTERS[s.matter];
  const tabs = navModes(s.edition);
  const assignment = s.practice.assignments.find((a) => a.id === s.practice.activeAssignmentId);

  useEffect(() => {
    if (mode === "practice" && s.edition !== "firm") {
      router.replace("/home");
    }
    if (mode === "command" && s.edition === "firm") {
      router.replace("/home");
    }
  }, [mode, s.edition, router]);

  useEffect(() => {
    if (isMode(mode)) {
      const next = matterForMode(mode);
      if (next && next !== s.matter) s.setMatter(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        s.setSearchOpen(!s.searchOpen);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        s.setCopilotOpen(!s.copilotOpen);
        return;
      }
      if (e.key === "Escape") {
        s.setSearchOpen(false);
        if (s.copilotOpen) s.setCopilotOpen(false);
        setMenu(false);
      }
      if (!typing && s.demoOn && (e.key === "n" || e.key === "N") && !e.metaKey && !e.ctrlKey) {
        const i = Math.min(s.demoStep + 1, DEMO_STEPS.length - 1);
        s.setDemoStep(i);
        s.setMatter(DEMO_STEPS[i].matter);
        router.push(DEMO_STEPS[i].href);
      }
      if (!typing && s.demoOn && (e.key === "p" || e.key === "P") && !e.metaKey && !e.ctrlKey) {
        const i = Math.max(s.demoStep - 1, 0);
        s.setDemoStep(i);
        s.setMatter(DEMO_STEPS[i].matter);
        router.push(DEMO_STEPS[i].href);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [s, router]);

  function jumpMatter(id: MatterId) {
    s.setMatter(id);
    router.push(MATTERS[id].href);
  }

  function startLive() {
    s.startDemo();
    router.push(DEMO_STEPS[0].href);
  }

  return (
    <div className="os-shell">
      <header className="os-topbar">
        <button className="os-grid-btn menu-btn" onClick={() => setMenu(true)} aria-label="Menu"><Menu size={16} /></button>
        <Link href="/home" className="os-grid-btn" title={s.lang === "th" ? "โมดูลทั้งหมด" : "All modules"}>
          <span className="os-grid-dots"><span /><span /><span /><span /></span>
        </Link>
        <Link href="/home" className="os-brand">
          <span className="os-brand-name">LAW<span className="os-brand-24">24</span></span>
          <span className="os-os-badge">os</span>
        </Link>
        <EditionBadge />
        <button className="os-grid-btn search-toggle" onClick={() => s.setSearchOpen(true)} aria-label="Search"><Search size={16} /></button>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", minWidth: 0 }}>
          <button className="os-ask" type="button" onClick={() => s.setSearchOpen(true)}>
            <span style={{ color: "var(--color-accent)", fontSize: 12 }}>✦</span>
            <span><T en="Ask Leio or search…" th="ถามเลโอ หรือค้นหา…" /></span>
            <kbd className="os-kbd header-hide-sm">Ctrl K</kbd>
          </button>
        </div>
        <span className="os-online header-hide-sm"><span className="os-dot" /> <T en="Online" th="ออนไลน์" /></span>
        <LangToggle />
        <ModeToggle compact />
        <div className="os-user">
          <div className="os-avatar">{user.initials}</div>
          <div style={{ lineHeight: 1.35 }} className="header-hide-sm">
            <div style={{ fontSize: 12, fontWeight: 600 }}>{s.lang === "th" ? user.nameTh : user.name}</div>
            <div style={{ fontSize: 10, color: "var(--color-neutral-600)" }}>
              {s.edition === "firm"
                ? (s.lang === "th" ? "LAW24 Firm · " : "LAW24 Firm · ")
                : (s.lang === "th" ? "LAW24 Corporate · " : "LAW24 Corporate · ")}
              {s.lang === "th" ? user.roleTh : user.role}
            </div>
          </div>
          <button title="Sign out" onClick={() => { s.logout(); router.push("/"); }} style={{ border: 0, background: "transparent", cursor: "pointer", color: "var(--color-neutral-600)", display: "inline-flex" }}>
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {notHome && (
        <>
          <div className="os-modes">
            <Link href="/home" style={{ color: "var(--color-neutral-600)", fontSize: 11, textDecoration: "none", padding: "13px 0" }}>← <T en="All modules" th="โมดูลทั้งหมด" /></Link>
            <span style={{ width: 1, height: 16, background: "var(--color-neutral-400)", flex: "none" }} />
            {tabs.map((m) => (
              <Link key={m.k} href={modeHref(m.k)} className={mode === m.k ? "on" : ""}>{s.lang === "th" ? m.th : m.en}</Link>
            ))}
            {mode !== "practice" && mode !== "command" && mode !== "assist" && mode !== "help" && (
            <div className="os-matters header-hide-sm">
              {(Object.keys(MATTERS) as MatterId[]).map((id) => (
                <button key={id} type="button" className={`matter-chip${s.matter === id ? " on" : ""}`} onClick={() => jumpMatter(id)}>
                  {s.lang === "th" ? MATTERS[id].th.name : MATTERS[id].en.name}
                </button>
              ))}
            </div>
            )}
          </div>
          <div className="os-subnav">
            {sub.map(([k, th, en]) => (
              <Link key={k} href={modeHref(mode as "assemble", k)} className={screen === k ? "on" : ""}>
                {s.lang === "th" ? th : en}
              </Link>
            ))}
            <span className="os-matter-line header-hide-sm">
              {mode === "practice"
                ? (assignment
                  ? `${assignment.id} · ${s.lang === "th" ? assignment.titleTh : assignment.title}`
                  : (s.lang === "th" ? "สำนักงานที่ปรึกษา" : "Advisory practice"))
                : mode === "command"
                  ? (s.lang === "th" ? "ศูนย์บัญชาการกฎหมายของบริษัท" : "Company legal command center")
                : mode === "assist"
                  ? (s.lang === "th" ? "อธิบายงาน แล้วระบบชี้โมดูล" : "Describe the work — the OS names the module")
                : mode === "help"
                  ? (s.lang === "th" ? "เลโอ · เพลย์บุ๊กบ้าน วิจัย และกฎ" : "Leio · house books, research and regulation")
                : (s.lang === "th" ? matter.th.line : matter.en.line)}
            </span>
            {!s.demoOn && (
              <button type="button" className="btn btn-secondary" style={{ marginLeft: 8, fontSize: 11, padding: "4px 10px" }} onClick={startLive}>
                <T en="Live demo" th="สาธิตสด" />
              </button>
            )}
          </div>
        </>
      )}

      <DemoBar />
      {notHome && <GuideRail mode={mode} screen={screen} />}
      {!notHome && (
        <div style={{ padding: "8px 24px 0" }}><TrustStrip compact /></div>
      )}

      <div className="os-body">
        <main className="page-main">
          {children}
          {notHome && <ScreenNav mode={mode} screen={screen} />}
        </main>
        <Copilot />
      </div>

      <nav className="bottom-nav no-print">
        {s.edition === "firm" && <Link href="/practice?s=dash" className={mode === "practice" ? "active" : ""}>Firm</Link>}
        {s.edition !== "firm" && <Link href="/command?s=desk" className={mode === "command" ? "active" : ""}>Control</Link>}
        <Link href="/home" className={mode === "home" ? "active" : ""}>Home</Link>
        <Link href="/review?s=xray" className={mode === "review" ? "active" : ""}>X-Ray</Link>
        <Link href="/intel?s=twin" className={mode === "intel" ? "active" : ""}>Twin</Link>
        {s.edition === "firm"
          ? <Link href="/practice?s=room" className={screen === "room" ? "active" : ""}>Room</Link>
          : <Link href="/diligence?s=dwar" className={mode === "diligence" ? "active" : ""}>DD</Link>}
      </nav>

      {menu && (
        <>
          <div className="os-drawer-backdrop" onClick={() => setMenu(false)} />
          <aside className="os-drawer">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span className="os-brand-name">LAW<span className="os-brand-24">24</span></span>
              <button className="icon-btn" onClick={() => setMenu(false)} aria-label="Close"><X size={16} /></button>
            </div>
            <div style={{ marginBottom: 18 }}><EditionBadge /></div>
            <Link href="/home" className="os-drawer-link" onClick={() => setMenu(false)}><T en="All modules" th="โมดูลทั้งหมด" /></Link>
            {tabs.map((m) => (
              <Link key={m.k} href={modeHref(m.k)} className={`os-drawer-link${mode === m.k ? " on" : ""}`} onClick={() => setMenu(false)}>
                {s.lang === "th" ? m.th : m.en}
              </Link>
            ))}
            <button type="button" className="os-drawer-link" onClick={() => { setMenu(false); startLive(); }}>
              <T en="Start live demo" th="เริ่มสาธิตสด" />
            </button>
          </aside>
        </>
      )}
      <CommandPalette />
      {s.toast && (
        <div className="toast">
          <Check size={16} color="var(--color-accent-400)" />
          {s.toast}
        </div>
      )}
    </div>
  );
}
