"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_STEPS, catalogHits, type SearchHit } from "@/lib/demo";
import { practiceHits } from "@/lib/firm";
import { FX, TAX_LIST } from "@/lib/taxonomy";
import { useStore } from "@/lib/store";
import { L } from "@/lib/model";
import { T } from "@/lib/i18n";

export function CommandPalette() {
  const s = useStore();
  const router = useRouter();
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (s.searchOpen) {
      setQ("");
      requestAnimationFrame(() => input.current?.focus());
    }
  }, [s.searchOpen]);

  const hits = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const th = s.lang === "th";
    if (!needle) {
      const starter: SearchHit[] = [
        { id: "xray", href: "/review?s=xray", kind: "X-Ray", title: th ? "Contract X-Ray" : "Contract X-Ray" },
        { id: "twin", href: "/intel?s=twin", kind: th ? "ฝาแฝด" : "Twin", title: th ? "Living Legal Twin" : "Living Legal Twin" },
        { id: "assist-ask", href: "/assist?s=ask", kind: th ? "ผู้ช่วย" : "Assist", title: th ? "อธิบายงานและคำสั่ง" : "Describe job & assignment" },
        { id: "help-trust", href: "/help?s=trust", kind: th ? "คู่มือ" : "Help", title: th ? "ความเชื่อถือที่มองเห็น" : "Visible trust" },
        ...(s.edition === "firm"
          ? [
              { id: "practice-dash", href: "/practice?s=dash", kind: "Firm", title: th ? "แดชบอร์ดสำนักงาน" : "Firm dashboard" },
              { id: "practice-brain", href: "/practice?s=brain", kind: "Firm", title: "Firm Brain" },
              { id: "practice-room", href: "/practice?s=room", kind: "Firm", title: th ? "ห้องตรวจลูกค้า" : "Client Review Room" },
            ]
          : [
              { id: "command-desk", href: "/command?s=desk", kind: th ? "ควบคุม" : "Control", title: th ? "ศูนย์บัญชาการกฎหมาย" : "Legal command center" },
            ]),
      ];
      return [
        ...starter,
        ...DEMO_STEPS.map((st, i) => ({
          id: `step-${i}`,
          href: st.href,
          kind: th ? `ขั้น ${i + 1}` : `Step ${i + 1}`,
          title: th ? st.th.title : st.en.title,
          sub: th ? st.th.action : st.en.action,
        })),
        ...catalogHits(s.lang).filter((h) => h.kind === (th ? "เรื่อง" : "Matter") || h.id === "home").slice(0, 4),
      ].slice(0, 10);
    }
    const extra: SearchHit[] = [];
    if (s.edition === "firm") extra.push(...practiceHits(s.practice, s.lang));
    TAX_LIST.forEach((r) => {
      extra.push({
        id: r.id,
        href: "/assemble?s=type",
        kind: "CT",
        title: `${r.id} · ${th ? r.nameTh : r.nameEn}`,
        sub: th ? r.nameEn : r.nameTh,
      });
    });
    FX.review.findings.forEach((f) => {
      extra.push({
        id: f.id,
        href: "/review?s=find",
        kind: th ? "ข้อค้นพบ" : "Finding",
        title: `${f.id} · ${L(s.lang, f.issue)}`,
      });
    });
    FX.dil.flags.forEach((f) => {
      extra.push({
        id: f.id,
        href: "/diligence?s=dflags",
        kind: th ? "ธงแดง" : "Red flag",
        title: `${f.id} · ${L(s.lang, f.t)}`,
      });
    });
    return [...catalogHits(s.lang), ...extra]
      .filter((h) => s.edition === "firm" || !h.href.startsWith("/practice"))
      .filter((h) => `${h.kind} ${h.title} ${h.sub || ""}`.toLowerCase().includes(needle))
      .slice(0, 12);
  }, [q, s.lang, s.edition, s.practice]);

  if (!s.searchOpen) return null;

  function go(h: SearchHit) {
    if (h.kind === "CT") s.setSel(h.id);
    if (h.id.startsWith("F-")) s.setOpenF(h.id);
    if (h.id === "demo") s.startDemo();
    if (h.id.startsWith("assign-")) s.setActiveAssignment(h.id.replace("assign-", ""));
    if (h.id.startsWith("client-")) s.setActiveClient(h.id.replace("client-", ""));
    s.setSearchOpen(false);
    router.push(h.href);
  }

  function askNow() {
    const text = q.trim();
    s.setSearchOpen(false);
    if (text) s.ask(text);
    else s.setCopilotOpen(true);
  }

  return (
    <div className="cmdk no-print" onClick={() => s.setSearchOpen(false)}>
      <div className="cmdk-panel" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={(e) => { e.preventDefault(); if (hits[0]) go(hits[0]); else askNow(); }}>
          <input
            ref={input}
            className="cmdk-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={s.lang === "th" ? "ค้นหาโมดูล ข้อค้นพบ ประเภทสัญญา หรือถามเลโอ…" : "Search modules, findings, types, or ask Leio…"}
          />
        </form>
        <div className="cmdk-list">
          {hits.map((h) => (
            <button key={h.id + h.href} className="cmdk-row" type="button" onClick={() => go(h)}>
              <span className="cmdk-kind">{h.kind}</span>
              <span>
                <strong>{h.title}</strong>
                {h.sub && <span className="text-muted" style={{ display: "block", fontSize: 12 }}>{h.sub}</span>}
              </span>
            </button>
          ))}
          {q.trim() && (
            <button className="cmdk-row" type="button" onClick={askNow}>
              <span className="cmdk-kind">✦</span>
              <span><strong><T en="Ask Leio" th="ถามเลโอ" /></strong> “{q.trim()}”</span>
            </button>
          )}
        </div>
        <div className="cmdk-foot">
          <span><T en="Enter to open · Esc to close" th="Enter เพื่อเปิด · Esc เพื่อปิด" /></span>
          <button type="button" className="btn btn-secondary" onClick={askNow}><T en="Ask Leio" th="ถามเลโอ" /></button>
        </div>
      </div>
    </div>
  );
}
