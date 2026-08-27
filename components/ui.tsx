"use client";

import type { ReactNode } from "react";
import { L, type Lang } from "@/lib/model";
import type { TE } from "@/lib/model";

export function Kicker({ children }: { children: ReactNode }) {
  return <div style={{ font: "800 10px/1 var(--font-heading)", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: 10 }}>{children}</div>;
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
