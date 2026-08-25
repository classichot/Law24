"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, BookOpen, X } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { answerCopilot, copilotIntro, SUGGESTIONS_EN, SUGGESTIONS_TH, type CopilotMsg } from "@/lib/copilot";
import { T } from "@/lib/i18n";

export function Copilot() {
  const { copilotOpen, setCopilotOpen, consumeAsk, pendingAsk, lang } = useStore();
  const [log, setLog] = useState<CopilotMsg[]>(() => [copilotIntro(lang)]);
  const [q, setQ] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const suggestions = lang === "th" ? SUGGESTIONS_TH : SUGGESTIONS_EN;

  useEffect(() => {
    if (!pendingAsk) return;
    const pending = consumeAsk();
    if (pending) run(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAsk]);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [log, copilotOpen]);

  function run(text: string) {
    const t = text.trim();
    if (!t) return;
    setLog((l) => [...l, { role: "user", text: t }, answerCopilot(t, lang)]);
    setQ("");
  }

  if (!copilotOpen) return null;

  return (
    <aside className="copilot open-m no-print">
      <div className="panel-head">
        <div>
          <h5 style={{ margin: 0 }}><T en="Ask LAW24" th="ถาม LAW24" /></h5>
          <div className="text-muted" style={{ fontSize: 11 }}><T en="Evidence-first · never unsigned" th="อ้างหลักฐานทุกข้อ · ไม่ลงนามแทน" /></div>
        </div>
        <button className="icon-btn" onClick={() => setCopilotOpen(false)} aria-label="Close copilot"><X size={16} /></button>
      </div>
      <div className="copilot-log">
        {log.map((m, i) => (
          <div key={i} className={`bubble ${m.role === "user" ? "user" : "ai"}`}>
            {m.text}
            {m.cites && m.cites.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {m.cites.map((c) =>
                  c.href ? (
                    <Link key={c.label} href={c.href} className="tag tag-outline" style={{ fontSize: 10 }}>
                      <BookOpen size={10} style={{ marginRight: 4 }} />{c.label}
                    </Link>
                  ) : (
                    <span key={c.label} className="tag tag-outline" style={{ fontSize: 10 }}>{c.label}</span>
                  ),
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={end} />
      </div>
      <div style={{ padding: "8px 12px", display: "flex", flexWrap: "wrap", gap: 6, borderTop: "2px solid var(--color-divider)" }}>
        {suggestions.slice(0, 3).map((s) => (
          <button key={s} className="tag tag-neutral" style={{ cursor: "pointer", border: 0 }} onClick={() => run(s)}>{s}</button>
        ))}
      </div>
      <form
        className="copilot-compose"
        onSubmit={(e) => { e.preventDefault(); run(q); }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={lang === "th" ? "ถามพร้อมหลักฐาน…" : "Ask with citations…"} />
          <button className="btn btn-primary" type="submit" aria-label="Send"><ArrowUp size={16} /></button>
        </div>
      </form>
    </aside>
  );
}
