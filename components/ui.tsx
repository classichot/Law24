"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { L, type Lang } from "@/lib/model";
import type { TE } from "@/lib/model";
import { PlaybookMark } from "@/components/PlaybookMark";
import { useStore } from "@/lib/store";
import { T } from "@/lib/i18n";
import { copyTE } from "@/lib/guides";
import { REVIEWER_PATH } from "@/lib/help";

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <div className="kicker-row">
      <div className="kicker-label">{children}</div>
      <PlaybookMark compact />
    </div>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <h2 style={{ margin: "0 0 10px", fontSize: 26, letterSpacing: "-0.015em" }}>{children}</h2>;
}

export function Sev({ sv, lang }: { sv: string; lang: Lang }) {
  const map: Record<string, { l: string; bg: string; fg: string; bd: string }> = {
    vhigh: { l: lang === "th" ? "สูงมาก" : "Very high", bg: "var(--color-hot)", fg: "#f3f2f2", bd: "transparent" },
    high: { l: lang === "th" ? "สูง" : "High", bg: "var(--color-signal-200)", fg: "var(--color-hot)", bd: "transparent" },
    med: { l: lang === "th" ? "ปานกลาง" : "Medium", bg: "var(--color-neutral-200)", fg: "var(--color-neutral-900)", bd: "transparent" },
    low: { l: lang === "th" ? "ต่ำ" : "Low", bg: "transparent", fg: "var(--color-neutral-600)", bd: "var(--color-divider)" },
  };
  const s = map[sv] || map.med;
  return <span className="sev-pill" style={{ background: s.bg, color: s.fg, border: `1px solid ${s.bd}` }}>{s.l}</span>;
}

export function Stats({ items }: { items: { v: string; k: string }[] }) {
  return (
    <div className="stat-grid" style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 6)}, 1fr)` }}>
      {items.map((s) => (
        <div key={s.k} className="stat-cell-os">
          <div style={{ font: "800 24px/1 var(--font-heading)" }}>{s.v}</div>
          <div style={{ fontSize: 11, color: "var(--color-neutral-600)", marginTop: 7 }}>{s.k}</div>
        </div>
      ))}
    </div>
  );
}

export function Chip({ on, active, children }: { on: () => void; active: boolean; children: ReactNode }) {
  return (
    <button type="button" className={`filter-chip${active ? " on" : ""}`} onClick={on}>{children}</button>
  );
}

export function te(lang: Lang, x: TE | string) {
  return L(lang, x);
}

/** Compact in-app walkthrough for reviewers — lives on Home and Help. */
export function ReviewerPath() {
  const { edition, lang, startDemo, startXray } = useStore();
  const router = useRouter();
  const steps = REVIEWER_PATH[edition];
  return (
    <div className="reviewer-path">
      <h5><T en="Reviewer path" th="เส้นทางผู้ตรวจ" /></h5>
      <p className="text-muted" style={{ fontSize: 13, margin: "0 0 12px" }}>
        {edition === "firm"
          ? <T en="Firm walk: X-Ray → Brain → Room → packages. Click a step — every screen has seeded Nimbus / practice data." th="เส้นสำนักงาน: X-Ray → สมอง → ห้องลูกค้า → แพ็ก คลิกขั้น — ทุกจอมีข้อมูลนิมบัส / งานสำนักงาน" />
          : <T en="Corporate walk: X-Ray → Twin → Control. Click a step — every screen has seeded Nimbus / Charoen data." th="เส้นองค์กร: X-Ray → ฝาแฝด → ควบคุม คลิกขั้น — ทุกจอมีข้อมูลนิมบัส / เจริญ" />}
      </p>
      <ol className="assist-path">
        {steps.map((st, i) => (
          <li key={st.href}>
            <span className="assist-n">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <Link href={st.href} onClick={() => { if (st.href.includes("xray")) startXray(); }}>{copyTE(lang, st.k)}</Link>
              <div className="text-muted" style={{ fontSize: 12 }}>{copyTE(lang, st.do)}</div>
            </div>
          </li>
        ))}
      </ol>
      <div className="stack-actions" style={{ marginTop: 12 }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => { startDemo(); router.push("/review?s=xray"); }}
        >
          <T en="Start live demo" th="เริ่มสาธิตสด" />
        </button>
        <Link href="/assist?s=ask" className="btn btn-secondary"><T en="Assist router" th="ผู้ช่วยจัดเส้นทาง" /></Link>
        <Link href="/help?s=books" className="btn btn-secondary"><T en="Playbook library" th="คลังเพลย์บุ๊ก" /></Link>
      </div>
    </div>
  );
}
