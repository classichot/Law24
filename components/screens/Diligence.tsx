"use client";

import { useStore } from "@/lib/store";
import { FX } from "@/lib/taxonomy";
import { Kicker, Sev, Stats, Title } from "@/components/ui";
import { L } from "@/lib/model";
import { AUTOPILOT } from "@/lib/wow";
import { T } from "@/lib/i18n";

export function DiligenceScreen({ screen }: { screen: string }) {
  if (screen === "dmatter") return <Matter />;
  if (screen === "droom") return <Room />;
  if (screen === "dgrid") return <Grid />;
  if (screen === "dmap") return <Map />;
  if (screen === "dflags") return <Flags />;
  if (screen === "dreq") return <Req />;
  if (screen === "dqa") return <Qa />;
  if (screen === "drep") return <Rep />;
  if (screen === "autopilot") return <Auto />;
  return <Matter />;
}

function D() {
  return FX.dil;
}

function Matter() {
  const s = useStore();
  const d = D();
  return (
    <div className="pad-page">
      <Kicker>diligence · matter</Kicker>
      <Title>{L(s.lang, d.matter.name)}</Title>
      <div className="grid-2" style={{ marginTop: 20 }}>
        {d.matter.rows.map((r, i) => (
          <div key={i} style={{ padding: 14, border: "2px solid var(--color-divider)" }}>
            <div className="page-kicker">{L(s.lang, r.k)}</div>
            <div style={{ fontWeight: 700, marginTop: 6 }}>{typeof r.v === "string" ? r.v : L(s.lang, r.v)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Room() {
  const s = useStore();
  const d = D();
  return (
    <div className="pad-page">
      <Kicker>diligence · data room</Kicker>
      <Title><T en="Ingest, OCR, versions" th="รับเอกสาร OCR และเวอร์ชัน" /></Title>
      <Stats items={d.ingest.map((x) => ({ v: typeof x.v === "string" ? x.v : L(s.lang, x.v), k: L(s.lang, x.k) }))} />
      <table className="table" style={{ marginTop: 24 }}>
        <thead><tr><th><T en="Document" th="เอกสาร" /></th><th>CT</th><th><T en="Version" th="เวอร์ชัน" /></th><th><T en="Issue" th="ประเด็น" /></th></tr></thead>
        <tbody>
          {d.docs.map((x, i) => (
            <tr key={i}>
              <td style={{ fontWeight: 700 }}>{L(s.lang, x.n)}</td>
              <td className="mono">{x.t}</td>
              <td>{L(s.lang, x.v)}</td>
              <td>{L(s.lang, x.i)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Grid() {
  const s = useStore();
  const d = D();
  return (
    <div className="pad-page">
      <Kicker>diligence · extraction matrix</Kicker>
      <Title><T en="Review grid" th="ตารางตรวจเอกสาร" /></Title>
      <div className="table-wrap">
        <table className="table">
          <thead><tr>{d.gridCols.map((c, i) => <th key={i}>{L(s.lang, c.k)}</th>)}</tr></thead>
          <tbody>
            {d.gridRows.map((r, i) => (
              <tr key={i}>
                {r.c.map((c, j) => (
                  <td key={j} style={{ background: r.f[j] === 2 ? "var(--color-accent-200)" : r.f[j] === 1 ? "var(--color-accent-100)" : undefined }}>
                    {typeof c === "string" ? c : L(s.lang, c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Map() {
  const s = useStore();
  const d = D();
  return (
    <div className="pad-page">
      <Kicker>diligence · legal deal graph</Kicker>
      <Title><T en="Deal Map" th="แผนผังดีล" /></Title>
      {d.map.map((m, i) => (
        <div key={i} style={{ marginBottom: 28 }}>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>{L(s.lang, m.q)} <span className="tag tag-accent">{m.n}</span></div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {m.chain.map((c, n) => (
              <span key={n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {n > 0 && <span style={{ color: "var(--color-accent)" }}>→</span>}
                <span className="graph-node" style={{ minWidth: 0 }}>{L(s.lang, c)}</span>
              </span>
            ))}
          </div>
          <p className="text-muted" style={{ marginTop: 8 }}>{L(s.lang, m.note)}</p>
        </div>
      ))}
    </div>
  );
}

function Flags() {
  const s = useStore();
  const d = D();
  return (
    <div className="pad-page">
      <Kicker>diligence · red flags</Kicker>
      <Title><T en="Findings & red flags" th="ธงแดงและข้อค้นพบ" /></Title>
      {d.flags.map((f) => (
        <div key={f.id} className="issue-card" style={{ padding: 16, marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span className="mono">{f.id}</span>
            <Sev sv={f.sev} lang={s.lang} />
            <span className="tag tag-neutral">{L(s.lang, f.ws)}</span>
            <span className="tag tag-outline">{f.st} · {f.conf}%</span>
          </div>
          <h4 style={{ marginTop: 10 }}>{L(s.lang, f.t)}</h4>
          <p>{L(s.lang, f.im)}</p>
          <div className="tag tag-accent">{L(s.lang, f.a)}</div>
        </div>
      ))}
    </div>
  );
}

function Req() {
  const s = useStore();
  const d = D();
  return (
    <div className="pad-page">
      <Kicker>diligence · Q&A</Kicker>
      <Title><T en="Requests & Q&A" th="คำขอและคำถาม" /></Title>
      <table className="table">
        <thead><tr><th>ID</th><th><T en="Request" th="คำขอ" /></th><th><T en="To" th="ถึง" /></th><th><T en="Due" th="กำหนด" /></th><th></th></tr></thead>
        <tbody>
          {d.requests.map((r) => (
            <tr key={r.id}><td className="mono">{r.id}</td><td>{L(s.lang, r.t)}</td><td>{L(s.lang, r.to)}</td><td>{r.d}</td><td><span className="tag tag-neutral">{r.st}</span></td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Qa() {
  const s = useStore();
  const d = D();
  return (
    <div className="pad-page">
      <Kicker>diligence · coverage</Kicker>
      <Title><T en="Coverage & QA" th="ความครบถ้วนของงานตรวจ" /></Title>
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {d.coverage.map((c, i) => (
          <div key={i} style={{ padding: 16, border: "2px solid var(--color-divider)" }}>
            <div className="page-kicker">{L(s.lang, c.k)}</div>
            <div style={{ font: "800 28px/1 var(--font-heading)", margin: "8px 0" }}>{c.v}</div>
            <div className="text-muted">{typeof c.n === "string" ? c.n : L(s.lang, c.n)}</div>
          </div>
        ))}
      </div>
      {d.workstreams.map((w) => (
        <div key={L(s.lang, w.k)} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>{L(s.lang, w.k)} · {w.o}</span><span>{w.p}%</span></div>
          <div className="bar-track"><div className="bar-fill" style={{ width: `${w.p}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

function Rep() {
  const s = useStore();
  const d = D();
  return (
    <div className="pad-page">
      <Kicker>diligence · reports</Kicker>
      <Title><T en="Evidence-linked reports" th="รายงานที่อ้างหลักฐาน" /></Title>
      <div className="grid-2">
        {d.reports.map((r, i) => (
          <div key={i} style={{ padding: 16, border: "2px solid var(--color-divider)", display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 700 }}>{L(s.lang, r.k)}</div>
              <div className="text-muted">{r.f}</div>
            </div>
            <span className="tag tag-neutral">{r.s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Auto() {
  const s = useStore();
  return (
    <div className="pad-page">
      <Kicker>wow · DD Autopilot</Kicker>
      <Title><T en="First-pass after the data room lands" th="ผลรอบแรกหลังอัปโหลดห้องข้อมูล" /></Title>
      <Stats items={[
        { v: AUTOPILOT.index, k: s.lang === "th" ? "ดัชนีเอกสาร" : "Document index" },
        { v: String(AUTOPILOT.missing.length), k: s.lang === "th" ? "เอกสารที่ขาด" : "Missing documents" },
        { v: String(AUTOPILOT.material.length), k: s.lang === "th" ? "สัญญาสำคัญ" : "Material contracts" },
        { v: "2", k: s.lang === "th" ? "ธงแดงรุนแรงมาก" : "Very-high flags" },
      ]} />
      <div className="grid-3" style={{ marginTop: 24 }}>
        <div><h5><T en="Missing" th="ขาด" /></h5><ul>{AUTOPILOT.missing.map((m, i) => <li key={i}>{L(s.lang, m)}</li>)}</ul></div>
        <div><h5><T en="Material contracts" th="สัญญาสำคัญ" /></h5><ul>{AUTOPILOT.material.map((m, i) => <li key={i}>{L(s.lang, m)}</li>)}</ul></div>
        <div><h5><T en="First-round Q&A" th="คำถามรอบแรก" /></h5><ul>{AUTOPILOT.qa.map((m, i) => <li key={i}>{L(s.lang, m)}</li>)}</ul></div>
      </div>
    </div>
  );
}
