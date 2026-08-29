"use client";

import { useStore } from "@/lib/store";
import { Kicker, Sev, Stats, Title } from "@/components/ui";
import { L } from "@/lib/model";
import { T } from "@/lib/i18n";
import { statusLabel, downloadText } from "@/lib/demo";
import { Dropzone } from "@/components/Dropzone";
import Link from "next/link";
import { AiLiveMark } from "@/components/AiLiveMark";
import { NeedMap } from "@/components/NeedMap";
import { autopilotOf, dilOf, dilReportText, warOf } from "@/lib/ai/fromMap";

export function DiligenceScreen({ screen }: { screen: string }) {
  const s = useStore();
  if (!s.xrayLive) return <NeedMap kicker="diligence · war room" />;
  if (screen === "dwar") return <War />;
  if (screen === "dmatter") return <Matter />;
  if (screen === "droom") return <Room />;
  if (screen === "dgrid") return <Grid />;
  if (screen === "dmap") return <Map />;
  if (screen === "dflags") return <Flags />;
  if (screen === "dreq") return <Req />;
  if (screen === "dqa") return <Qa />;
  if (screen === "drep") return <Rep />;
  if (screen === "autopilot") return <Auto />;
  return <War />;
}

function Matter() {
  const s = useStore();
  const d = dilOf(s.xrayLive!, s.reviewLive);
  return (
    <div className="pad-page">
      <Kicker>diligence · matter</Kicker>
      <Title>{L(s.lang, d.matter.name)}</Title>
      <Dropzone
        bucket="diligence"
        title={<T en="Drop related papers" th="ลากเอกสารที่เกี่ยวข้องมาวาง" />}
        hint={<T en="Annexes, data-room files, side letters. Indexed against this map." th="ภาคผนวก ห้องข้อมูล หนังสือข้างเคียง จัดดัชนีเทียบแผนที่นี้" />}
      />
      <div className="grid-2" style={{ marginTop: 8 }}>
        {d.matter.rows.map((r, i) => (
          <div key={i} style={{ padding: 14, border: "2px solid var(--color-divider)" }}>
            <div className="page-kicker">{L(s.lang, r.k)}</div>
            <div style={{ fontWeight: 700, marginTop: 6 }}>{typeof r.v === "string" ? r.v : L(s.lang, r.v)}</div>
          </div>
        ))}
      </div>
      <div className="stack-actions" style={{ marginTop: 16 }}>
        <Link href="/diligence?s=dwar" className="btn btn-primary"><T en="War Room" th="ห้องสงคราม" /></Link>
        <Link href="/review?s=xray" className="btn btn-secondary">X-Ray</Link>
      </div>
    </div>
  );
}

function Room() {
  const s = useStore();
  const d = dilOf(s.xrayLive!, s.reviewLive);
  const th = s.lang === "th";
  const extra = s.uploads.filter((u) => u.bucket === "diligence").length;
  return (
    <div className="pad-page">
      <Kicker>diligence · data room</Kicker>
      <Title><T en="Ingest, OCR, versions" th="รับเอกสาร OCR และเวอร์ชัน" /></Title>
      <Dropzone
        bucket="diligence"
        title={<T en="Drop related files here" th="ลากไฟล์ที่เกี่ยวข้องมาวางที่นี่" />}
        hint={<T en="PDF, DOCX, XLSX and ZIP. Indexed against the mapped instrument." th="PDF DOCX XLSX และ ZIP จัดดัชนีเทียบฉบับที่วางแผนที่" />}
      />
      <Stats items={[
        ...d.ingest.map((x) => ({ v: typeof x.v === "string" ? x.v : L(s.lang, x.v), k: L(s.lang, x.k) })),
        ...(extra ? [{ v: `+${extra}`, k: th ? "อัปโหลดในรอบนี้" : "Uploaded this session" }] : []),
      ]} />
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
      <div className="stack-actions" style={{ marginTop: 16 }}>
        <Link href="/diligence?s=dflags" className="btn btn-primary"><T en="Red flags" th="ธงแดง" /></Link>
      </div>
    </div>
  );
}

function Grid() {
  const s = useStore();
  const d = dilOf(s.xrayLive!, s.reviewLive);
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
      <div className="stack-actions" style={{ marginTop: 16 }}>
        <Link href="/diligence?s=dflags" className="btn btn-primary"><T en="Open red flags" th="เปิดธงแดง" /></Link>
      </div>
    </div>
  );
}

function Map() {
  const s = useStore();
  const d = dilOf(s.xrayLive!, s.reviewLive);
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
      <div className="stack-actions" style={{ marginTop: 16 }}>
        <Link href="/diligence?s=dflags" className="btn btn-primary"><T en="Open red flags" th="เปิดธงแดง" /></Link>
      </div>
    </div>
  );
}

function Flags() {
  const s = useStore();
  const d = dilOf(s.xrayLive!, s.reviewLive);
  const flags = s.ddLive?.flags ?? d.flags;
  return (
    <div className="pad-page">
      <Kicker>diligence · red flags · <AiLiveMark compact /></Kicker>
      <Title><T en="Findings & red flags" th="ธงแดงและข้อค้นพบ" /></Title>
      {flags.map((f) => {
        const st = s.flagStatus[f.id] || f.st;
        return (
          <div key={f.id} className="issue-card" style={{ padding: 16, marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span className="mono">{f.id}</span>
              <Sev sv={f.sev} lang={s.lang} />
              <span className="tag tag-neutral">{L(s.lang, f.ws)}</span>
              <span className="tag tag-outline">{statusLabel(s.lang, st)} · {f.conf}%</span>
            </div>
            <h4 style={{ marginTop: 10 }}>{L(s.lang, f.t)}</h4>
            <p>{L(s.lang, f.im)}</p>
            <div className="tag tag-accent">{typeof f.a === "string" ? f.a : L(s.lang, f.a)}</div>
            <div className="issue-actions">
              <button type="button" className="btn btn-primary" onClick={() => { s.setFlagStatus(f.id, "escalated"); s.flash(s.lang === "th" ? `ส่ง ${f.id} เข้าชุดกรรมการ` : `${f.id} escalated to IC pack`); }}><T en="Escalate to IC" th="ส่งเข้าชุดกรรมการ" /></button>
              <button type="button" className="btn btn-secondary" onClick={() => { s.setFlagStatus(f.id, "progress"); s.flash(s.lang === "th" ? `มอบหมาย ${f.id}` : `${f.id} assigned`); }}><T en="Assign" th="มอบหมาย" /></button>
              <button type="button" className="btn btn-secondary" onClick={() => { s.setFlagStatus(f.id, "closed"); s.flash(s.lang === "th" ? `ปิด ${f.id}` : `${f.id} closed`); }}><T en="Close" th="ปิด" /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Req() {
  const s = useStore();
  const d = dilOf(s.xrayLive!, s.reviewLive);
  return (
    <div className="pad-page">
      <Kicker>diligence · Q&A</Kicker>
      <Title><T en="Requests & Q&A" th="คำขอและคำถาม" /></Title>
      <table className="table">
        <thead><tr><th>ID</th><th><T en="Request" th="คำขอ" /></th><th><T en="To" th="ถึง" /></th><th><T en="Due" th="กำหนด" /></th><th></th></tr></thead>
        <tbody>
          {d.requests.map((r) => {
            const st = s.requestStatus[r.id] || r.st;
            return (
              <tr key={r.id}>
                <td className="mono">{r.id}</td>
                <td>{L(s.lang, r.t)}</td>
                <td>{L(s.lang, r.to)}</td>
                <td>{r.d}</td>
                <td>
                  <button type="button" className="tag tag-neutral" style={{ cursor: "pointer", border: 0 }} onClick={() => {
                    const next: "answered" | "open" = st === "answered" ? "open" : "answered";
                    s.setRequestStatus(r.id, next);
                    s.flash(next === "answered" ? (s.lang === "th" ? `ตอบ ${r.id} แล้ว` : `${r.id} marked answered`) : (s.lang === "th" ? `เปิด ${r.id} อีกครั้ง` : `${r.id} reopened`));
                  }}>
                    {statusLabel(s.lang, st)}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Qa() {
  const s = useStore();
  const d = dilOf(s.xrayLive!, s.reviewLive);
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
      <div className="stack-actions" style={{ marginTop: 16 }}>
        <Link href="/diligence?s=drep" className="btn btn-primary"><T en="Open reports" th="เปิดรายงาน" /></Link>
      </div>
    </div>
  );
}

function Rep() {
  const s = useStore();
  const d = dilOf(s.xrayLive!, s.reviewLive);
  const X = s.xrayLive!;
  return (
    <div className="pad-page">
      <Kicker>diligence · reports</Kicker>
      <Title><T en="Evidence-linked reports" th="รายงานที่อ้างหลักฐาน" /></Title>
      <div className="grid-2">
        {d.reports.map((r, i) => (
          <div key={i} style={{ padding: 16, border: "2px solid var(--color-divider)", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700 }}>{L(s.lang, r.k)}</div>
              <div className="text-muted">{r.f}</div>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ fontSize: 12 }}
              onClick={() => {
                downloadText(`LAW24-${X.ref}-${r.f}.txt`, dilReportText(s.lang, X, s.reviewLive));
                s.flash(s.lang === "th" ? `ส่งออก ${r.f} แล้ว — จากแผนที่นี้` : `${r.f} exported — from this map`);
              }}
            >
              {s.lang === "th" ? "ดาวน์โหลด" : "Download"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Auto() {
  const s = useStore();
  const X = s.xrayLive!;
  const ap = autopilotOf(X, s.reviewLive);
  const missing = s.ddLive?.missing ?? ap.missing;

  return (
    <div className="pad-page">
      <Kicker>wow · DD Autopilot · <AiLiveMark compact /></Kicker>
      <Title><T en="First-pass from the mapped instrument" th="ผลรอบแรกจากฉบับที่วางแผนที่" /></Title>
      <Stats items={[
        { v: ap.index, k: s.lang === "th" ? "ดัชนีเอกสาร" : "Document index" },
        { v: String(missing.length), k: s.lang === "th" ? "เอกสารที่ขาด" : "Missing documents" },
        { v: String(ap.material.length), k: s.lang === "th" ? "สัญญาสำคัญ" : "Material contracts" },
        { v: String(X.heatmap.filter((h) => h.sev === "high").length), k: s.lang === "th" ? "ความเสี่ยงสูง" : "High-risk flags" },
      ]} />
      <div className="grid-3" style={{ marginTop: 24 }}>
        <div><h5><T en="Missing" th="ขาด" /></h5><ul>{missing.map((m, i) => <li key={i}>{L(s.lang, m)}</li>)}</ul></div>
        <div><h5><T en="Material contracts" th="สัญญาสำคัญ" /></h5><ul>{ap.material.map((m, i) => <li key={i}>{L(s.lang, m)}</li>)}</ul></div>
        <div><h5><T en="First-round Q&A" th="คำถามรอบแรก" /></h5><ul>{ap.qa.map((m, i) => <li key={i}>{L(s.lang, m)}</li>)}</ul></div>
      </div>
      <div className="stack-actions" style={{ marginTop: 18 }}>
        <Link href="/diligence?s=dflags" className="btn btn-primary"><T en="Open red flags" th="เปิดธงแดง" /></Link>
        <Link href="/diligence?s=droom" className="btn btn-secondary"><T en="Data room" th="ห้องข้อมูล" /></Link>
        <Link href="/review?s=xray" className="btn btn-secondary">X-Ray</Link>
      </div>
    </div>
  );
}

function War() {
  const s = useStore();
  const w = warOf(s.xrayLive!, s.reviewLive);
  const X = s.xrayLive!;
  return (
    <div className="pad-page">
      <Kicker>diligence · war room</Kicker>
      <Title>{L(s.lang, X.doc)}</Title>
      <p className="page-sub">
        <T en="This war room is the mapped instrument — index, missing list, flags and a source-linked report. Every conclusion stays traceable to the X-Ray." th="ห้องสงครามนี้คือฉบับที่วางแผนที่ — ดัชนี รายการที่ขาด ธงแดง และรายงานที่ชี้แหล่ง ทุกข้อสรุปย้อนไปที่ X-Ray" />
      </p>
      <Stats items={w.stats.map((x) => ({ v: x.v, k: L(s.lang, x.k) }))} />
      <h5 style={{ marginTop: 24 }}><T en="Missing-document list" th="เอกสารที่ขาด" /></h5>
      {w.missing.length
        ? w.missing.map((m) => <div key={m.e} className="xray-row">{L(s.lang, m)}</div>)
        : <p className="text-muted"><T en="The map did not flag missing documents." th="แผนที่ไม่ได้ชี้เอกสารที่ขาด" /></p>}
      <div className="stack-actions" style={{ marginTop: 18 }}>
        <Link href="/diligence?s=droom" className="btn btn-primary"><T en="Data room" th="ห้องข้อมูล" /></Link>
        <Link href="/diligence?s=dflags" className="btn btn-secondary"><T en="Red-flag register" th="ทะเบียนธงแดง" /></Link>
        <Link href="/diligence?s=dmap" className="btn btn-secondary"><T en="Entity map" th="แผนผังนิติบุคคล" /></Link>
        <Link href="/diligence?s=drep" className="btn btn-secondary"><T en="Source-linked report" th="รายงานชี้แหล่ง" /></Link>
      </div>
    </div>
  );
}
