"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUp, BookOpen, X } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { type CopilotMsg } from "@/lib/copilot";
import { LEIO, LEIO_SUGGESTIONS_EN, LEIO_SUGGESTIONS_TH, answerLeio, leioIntro } from "@/lib/leio";
import { T } from "@/lib/i18n";
import { copyTE } from "@/lib/guides";

function LeioMark() {
  return <span className="leio-mark" aria-hidden>L</span>;
}

export function LeioChat({ variant }: { variant: "dock" | "page" }) {
  const { copilotOpen, setCopilotOpen, consumeAsk, pendingAsk, lang, edition } = useStore();
  const [log, setLog] = useState<CopilotMsg[]>(() => [leioIntro(lang)]);
  const [q, setQ] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const suggestions = lang === "th" ? LEIO_SUGGESTIONS_TH : LEIO_SUGGESTIONS_EN;

  useEffect(() => {
    if (variant !== "dock" || !pendingAsk) return;
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
    setLog((l) => [...l, { role: "user", text: t }, answerLeio(t, lang, edition)]);
    setQ("");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    run(q);
  }

  const body = (
    <>
      <div className={variant === "page" ? "leio-log" : "copilot-log"}>
        {log.map((m, i) => (
          <div key={i} className={`bubble ${m.role === "user" ? "user" : "ai"}`}>
            {m.role === "ai" && variant === "page" && (
              <div className="leio-bubble-name">Leio</div>
            )}
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
        {suggestions.map((s) => (
          <button key={s} type="button" className="tag tag-neutral" style={{ cursor: "pointer", border: 0 }} onClick={() => run(s)}>{s}</button>
        ))}
      </div>
      <form className="copilot-compose" onSubmit={onSubmit}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={lang === "th" ? "ถามเลโอ — วิธีใช้ วิจัย หรือกฎ…" : "Ask Leio — how to use, research or regulation…"}
          />
          <button className="btn btn-primary" type="submit" aria-label="Send"><ArrowUp size={16} /></button>
        </div>
      </form>
    </>
  );

  if (variant === "dock") {
    if (!copilotOpen) return null;
    return (
      <aside className="copilot open-m no-print">
        <div className="panel-head">
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <LeioMark />
            <div>
              <h5 style={{ margin: 0 }}>Leio</h5>
              <div className="text-muted" style={{ fontSize: 11 }}>{copyTE(lang, LEIO.never)}</div>
            </div>
          </div>
          <button className="icon-btn" onClick={() => setCopilotOpen(false)} aria-label="Close Leio"><X size={16} /></button>
        </div>
        {body}
      </aside>
    );
  }

  return (
    <div className="leio-desk-chat">
      <div className="panel-head" style={{ borderBottom: "2px solid var(--color-divider)" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <LeioMark />
          <div>
            <h5 style={{ margin: 0 }}>Leio</h5>
            <div className="text-muted" style={{ fontSize: 11 }}><T en="How to use · research · regulation watch" th="วิธีใช้ · วิจัย · ติดตามกฎ" /></div>
          </div>
        </div>
        <Link href="/help?s=watch" className="btn btn-secondary" style={{ fontSize: 11 }}><T en="Watch" th="วิจัยและกฎ" /></Link>
      </div>
      {body}
    </div>
  );
}

export { LeioMark };
