"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { Kicker, Stats, Title } from "@/components/ui";
import { L } from "@/lib/model";
import { T } from "@/lib/i18n";
import { AiLiveMark } from "@/components/AiLiveMark";
import { NeedMap } from "@/components/NeedMap";
import { intelOf, memoryOf, twinAsksOf, twinLayersOf } from "@/lib/ai/fromMap";

export function IntelScreen({ screen }: { screen: string }) {
  const s = useStore();
  if (!s.xrayLive) return <NeedMap kicker="twin" />;
  if (screen === "twin") return <Twin />;
  if (screen === "ipf") return <Port />;
  if (screen === "ikg") return <Kg />;
  if (screen === "memory") return <Mem />;
  return <Twin />;
}

function Port() {
  const s = useStore();
  const intel = intelOf(s.xrayLive!);
  const max = Math.max(1, ...intel.renew.map((m) => m.n));
  return (
    <div className="pad-page">
      <Kicker>intelligence · portfolio</Kicker>
      <Title><T en="Contract portfolio" th="ภาพรวมพอร์ตสัญญา" /></Title>
      <Stats items={intel.stats.map((x) => ({ v: typeof x.v === "string" ? x.v : L(s.lang, x.v), k: L(s.lang, x.k) }))} />
      <div className="grid-split" style={{ marginTop: 32 }}>
        <div>
          <h5><T en="Risk on this paper" th="ความเสี่ยงในฉบับนี้" /></h5>
          {intel.risks.map((r) => (
            <div key={L(s.lang, r.k)} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 700 }}>{L(s.lang, r.k)}</span><span>{r.n}</span></div>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${r.pct}%` }} /></div>
            </div>
          ))}
        </div>
        <div>
          <h5><T en="Key dates" th="วันที่สำคัญ" /></h5>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 150 }}>
            {intel.renew.map((m) => (
              <div key={L(s.lang, m.m)} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 6 }}>
                <span style={{ font: "800 12px/1 var(--font-heading)", textAlign: "center" }}>{m.n}</span>
                <span style={{ display: "block", height: Math.round((m.n / max) * 120), background: "var(--color-text)" }} />
                <span style={{ fontSize: 11, textAlign: "center", color: "var(--color-neutral-600)" }}>{L(s.lang, m.m)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="stack-actions" style={{ marginTop: 18 }}>
        <Link href="/intel?s=twin" className="btn btn-primary"><T en="Ask the Twin" th="ถามฝาแฝด" /></Link>
        <Link href="/obligations?s=ocal" className="btn btn-secondary"><T en="Deadline calendar" th="ปฏิทินกำหนดเวลา" /></Link>
      </div>
    </div>
  );
}

function Kg() {
  const s = useStore();
  const X = s.xrayLive!;
  const intel = intelOf(X);
  const nodes = [
    { n: "1", k: s.lang === "th" ? "สัญญา" : "Contracts" },
    { n: String(X.parties?.length || 0), k: s.lang === "th" ? "คู่สัญญา" : "Parties" },
    { n: String((X.dates?.length || 0) + (X.missing?.length || 0)), k: s.lang === "th" ? "ข้อผูกพัน" : "Obligations" },
    { n: String(X.unusual?.length || 0), k: s.lang === "th" ? "เบี่ยงเบน" : "Deviations" },
    { n: String(X.heatmap.filter((h) => h.sev === "high").length), k: s.lang === "th" ? "ความเสี่ยงสูง" : "High risk" },
  ];
  return (
    <div className="pad-page">
      <Kicker>intelligence · knowledge graph</Kicker>
      <Title><T en="Legal knowledge graph" th="กราฟความรู้ทางกฎหมาย" /></Title>
      <p className="page-sub"><T en="This graph is the mapped instrument — not a demo portfolio." th="กราฟนี้คือฉบับที่วางแผนที่ — ไม่ใช่พอร์ตตัวอย่าง" /></p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "24px 0 32px", alignItems: "center" }}>
        {nodes.map((k, i) => (
          <span key={k.k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {i > 0 && <span style={{ color: "var(--color-accent)", fontSize: 17 }}>→</span>}
            <div className="graph-node">
              <div style={{ font: "800 19px/1 var(--font-heading)" }}>{k.n}</div>
              <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-600)", marginTop: 6 }}>{k.k}</div>
            </div>
          </span>
        ))}
      </div>
      <h5><T en="Questions it answers" th="ตัวอย่างคำถามที่ตอบได้" /></h5>
      {intel.queries.map((q, i) => (
        <button
          key={i}
          type="button"
          onClick={() => s.ask(L(s.lang, q), "twin")}
          style={{ display: "flex", gap: 16, padding: "15px 0", border: 0, borderBottom: "1px solid var(--color-divider)", width: "100%", background: "transparent", cursor: "pointer", textAlign: "left", color: "inherit", font: "inherit" }}
        >
          <span style={{ color: "var(--color-accent)", font: "800 14px/1 var(--font-heading)" }}>?</span>
          <span style={{ fontSize: 16 }}>{L(s.lang, q)}</span>
        </button>
      ))}
    </div>
  );
}

function Mem() {
  const s = useStore();
  const rows = memoryOf(s.xrayLive!);
  return (
    <div className="pad-page">
      <Kicker>wow · organizational legal memory</Kicker>
      <Title><T en="Tenant-specific learning" th="ความจำเฉพาะองค์กร" /></Title>
      <p className="page-sub"><T en="Accepted redlines and rejected counterparty wording from this map stay in this session." th="redline ที่ยอมและถ้อยคำคู่สัญญาที่ปฏิเสธจากแผนที่นี้อยู่ในเซสชันนี้" /></p>
      <table className="table" style={{ marginTop: 20 }}>
        <thead><tr><th><T en="Clause" th="ข้อ" /></th><th><T en="Usually accepted" th="ที่ยอมรับ" /></th><th><T en="Usually rejected" th="ที่ปฏิเสธ" /></th><th>n</th></tr></thead>
        <tbody>
          {rows.map((m, i) => (
            <tr key={i}>
              <td style={{ fontWeight: 700 }}>{L(s.lang, m.clause)}</td>
              <td>{L(s.lang, m.accepted)}</td>
              <td>{L(s.lang, m.rejected)}</td>
              <td>{m.n}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="stack-actions" style={{ marginTop: 16 }}>
        <button type="button" className="btn btn-primary" onClick={() => s.ask(s.lang === "th" ? "ฉบับนี้ยอมเพดานแบบใด" : "What cap does this paper accept?", "twin")}>
          <T en="Ask legal memory" th="ถามความจำทางกฎหมาย" />
        </button>
        <Link href="/intel?s=twin" className="btn btn-secondary"><T en="Open Twin" th="เปิดฝาแฝด" /></Link>
      </div>
    </div>
  );
}

function Twin() {
  const s = useStore();
  const X = s.xrayLive!;
  const layers = twinLayersOf(X);
  const asks = twinAsksOf(X);
  return (
    <div className="pad-page">
      <Kicker>twin · living legal position · <AiLiveMark compact /></Kicker>
      <Title>{L(s.lang, X.doc)}</Title>
      <p className="page-sub">
        <T
          en="The Twin answers from this mapped instrument. Every answer should cite a clause on this paper."
          th="ฝาแฝดตอบจากฉบับที่วางแผนที่ ทุกคำตอบควรชี้ข้อในเอกสารนี้"
        />
      </p>
      <div className="twin-tags">
        {layers.map((x) => <span key={x.e} className="tag tag-outline">{L(s.lang, x)}</span>)}
      </div>
      <h5 style={{ marginTop: 28 }}><T en="Ask about this paper" th="ถามเกี่ยวกับฉบับนี้" /></h5>
      <div className="stack-actions" style={{ margin: "0 0 14px" }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => s.ask(s.lang === "th" ? `สรุปความเสี่ยงของ ${L(s.lang, X.doc)}` : `Summarise the risk on ${L(s.lang, X.doc)}`, "twin")}
        >
          <T en="Ask the Twin" th="ถามฝาแฝด" />
        </button>
      </div>
      {asks.map((q) => (
        <button
          key={q.q.e}
          type="button"
          className="twin-ask"
          onClick={() => s.ask(s.lang === "th" ? q.q.t : q.q.e, "twin")}
        >
          <strong>{L(s.lang, q.q)}</strong>
          <span>{L(s.lang, q.a)}</span>
          <em>{L(s.lang, q.src)}</em>
        </button>
      ))}
      <div className="stack-actions" style={{ marginTop: 18 }}>
        <Link href="/intel?s=ipf" className="btn btn-secondary"><T en="Portfolio" th="พอร์ต" /></Link>
        <Link href="/intel?s=memory" className="btn btn-secondary"><T en="Legal memory" th="ความจำทางกฎหมาย" /></Link>
        <Link href="/review?s=xray" className="btn btn-secondary">X-Ray</Link>
      </div>
    </div>
  );
}
