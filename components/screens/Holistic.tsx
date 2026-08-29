"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Kicker, Title } from "@/components/ui";
import { L } from "@/lib/model";
import { T } from "@/lib/i18n";
import { downloadText } from "@/lib/demo";
import { Dropzone } from "@/components/Dropzone";
import { NeedMap } from "@/components/NeedMap";
import { cockpitOf, dnaOf, holisticOf, memoOf, memoText, simulateOf } from "@/lib/ai/fromMap";

export function HolisticScreen({ screen }: { screen: string }) {
  const s = useStore();
  if (!s.xrayLive) return <NeedMap kicker="cockpit" />;
  if (screen === "cockpit") return <Cockpit />;
  if (screen === "dna") return <Dna />;
  if (screen === "hinter") return <Inter />;
  if (screen === "hcons") return <Cons />;
  if (screen === "hbal") return <Bal />;
  if (screen === "simulate") return <Sim />;
  if (screen === "memo") return <Memo />;
  return <Cockpit />;
}

function Inter() {
  const s = useStore();
  const h = holisticOf(s.xrayLive!);
  return (
    <div className="pad-page">
      <Kicker>holistic · flagship</Kicker>
      <Title><T en="Clause interaction" th="ปฏิสัมพันธ์ระหว่างข้อสัญญา" /></Title>
      <Dropzone
        bucket="holistic"
        compact
        title={<T en="Drop related instruments" th="ลากเอกสารที่เกี่ยวข้องมาวาง" />}
        hint={<T en="Annexes, DPA, SOW or side letters referenced by this paper." th="ภาคผนวก DPA SOW หรือหนังสือข้างเคียงที่ฉบับนี้อ้างถึง" />}
      />
      {h.interactions.map((x, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center", padding: "14px 0", borderBottom: "2px solid var(--color-divider)" }}>
          <div style={{ fontWeight: 700 }}>{L(s.lang, x.a)}</div>
          <span className={x.v === "conflict" ? "tag tag-signal" : "tag tag-accent"}>{x.v === "conflict" ? (s.lang === "th" ? "ขัดกัน" : "Conflict") : (s.lang === "th" ? "อ่อนแอ" : "Weak")}</span>
          <div style={{ fontWeight: 700 }}>{L(s.lang, x.b)}</div>
          <div style={{ gridColumn: "1 / -1", fontSize: 13, color: "var(--color-neutral-700)" }}>{L(s.lang, x.w)}</div>
        </div>
      ))}
      <div className="stack-actions" style={{ marginTop: 16 }}>
        <Link href="/holistic?s=hcons" className="btn btn-primary"><T en="Completeness" th="ความครบถ้วน" /></Link>
        <Link href="/holistic?s=simulate" className="btn btn-secondary"><T en="Simulate" th="จำลองผล" /></Link>
      </div>
    </div>
  );
}

function Cons() {
  const s = useStore();
  const h = holisticOf(s.xrayLive!);
  return (
    <div className="pad-page">
      <Kicker>holistic · completeness</Kicker>
      <Title><T en="Completeness & consistency" th="ความครบถ้วนและความสอดคล้อง" /></Title>
      <Dropzone
        bucket="holistic"
        compact
        title={<T en="Attach the missing annexes" th="แนบภาคผนวกที่ยังขาด" />}
        hint={<T en="Items the map marked missing against the house playbook." th="รายการที่แผนที่บอกว่าขาดเมื่อเทียบเพลย์บุ๊กบ้าน" />}
      />
      <div className="grid-2" style={{ marginTop: 16 }}>
        {h.consistency.map((x, i) => (
          <div key={i} style={{ padding: 14, border: "2px solid var(--color-divider)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{L(s.lang, x.k)}</strong>
              <span className={x.s === "fail" ? "tag tag-signal" : x.s === "warn" ? "tag tag-accent" : "tag tag-neutral"}>{x.s}</span>
            </div>
            <p className="text-muted" style={{ marginTop: 8 }}>{L(s.lang, x.n)}</p>
          </div>
        ))}
      </div>
      <div className="stack-actions" style={{ marginTop: 16 }}>
        <Link href="/holistic?s=hbal" className="btn btn-primary"><T en="Hierarchy & balance" th="ลำดับและความสมดุล" /></Link>
      </div>
    </div>
  );
}

function Bal() {
  const s = useStore();
  const h = holisticOf(s.xrayLive!);
  const X = s.xrayLive!;
  return (
    <div className="pad-page">
      <Kicker>holistic · hierarchy & balance</Kicker>
      <Title><T en="Document hierarchy and commercial balance" th="ลำดับเอกสารและความสมดุลเชิงพาณิชย์" /></Title>
      <table className="table" style={{ marginBottom: 28 }}>
        <thead><tr><th>#</th><th><T en="Document" th="เอกสาร" /></th><th><T en="Note" th="หมายเหตุ" /></th><th></th></tr></thead>
        <tbody>
          {h.hierarchy.map((x) => (
            <tr key={x.o}>
              <td>{x.o}</td>
              <td style={{ fontWeight: 700 }}>{typeof x.d === "string" ? x.d : L(s.lang, x.d)}</td>
              <td>{L(s.lang, x.n)}</td>
              <td><span className={x.s === "fail" ? "tag tag-signal" : x.s === "ok" ? "tag tag-neutral" : "tag tag-accent"}>{x.s}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      {h.balance.map((b) => (
        <div key={L(s.lang, b.k)} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
            <span>{L(s.lang, b.k)}</span>
            <span>us {b.us}% · them {b.them}%</span>
          </div>
          <div className="bar-track"><div className="bar-fill hot" style={{ width: `${b.them}%` }} /></div>
        </div>
      ))}
      <div className="callout" style={{ marginTop: 20 }}>
        {L(s.lang, X.verdictWhy)}
      </div>
      <div className="stack-actions" style={{ marginTop: 16 }}>
        <Link href="/holistic?s=simulate" className="btn btn-primary"><T en="Run a consequence" th="จำลองผล" /></Link>
        <Link href="/negotiate?s=nladder" className="btn btn-secondary"><T en="Copilot" th="เจรจา" /></Link>
      </div>
    </div>
  );
}

function Sim() {
  const s = useStore();
  const [i, setI] = useState(0);
  const rows = simulateOf(s.xrayLive!);
  const sc = rows[Math.min(i, rows.length - 1)];
  return (
    <div className="pad-page">
      <Kicker>wow · consequence simulator</Kicker>
      <Title><T en="Follow the connected clauses" th="ตามข้อที่เชื่อมกัน" /></Title>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "16px 0 24px" }}>
        {rows.map((x, n) => (
          <button key={n} className={`btn ${i === n ? "btn-primary" : "btn-secondary"}`} onClick={() => { setI(n); s.markSimRan(); }}>{L(s.lang, x.q)}</button>
        ))}
      </div>
      <div className="grid-3">
        <div className="panel"><div className="panel-head"><h5><T en="Legal" th="กฎหมาย" /></h5></div><div className="panel-body">{L(s.lang, sc.legal)}</div></div>
        <div className="panel"><div className="panel-head"><h5><T en="Financial" th="การเงิน" /></h5></div><div className="panel-body">{L(s.lang, sc.money)}</div></div>
        <div className="panel"><div className="panel-head"><h5><T en="Operational" th="ปฏิบัติการ" /></h5></div><div className="panel-body">{L(s.lang, sc.ops)}</div></div>
      </div>
      <div style={{ marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {sc.chain.map((c) => <span key={c} className="tag tag-outline">{c}</span>)}
      </div>
    </div>
  );
}

function Memo() {
  const s = useStore();
  const m = memoOf(s.xrayLive!, s.reviewLive);
  const X = s.xrayLive!;
  return (
    <div className="pad-page" style={{ maxWidth: 820 }}>
      <Kicker>wow · one-click decision memo</Kicker>
      <Title><T en="Management paper" th="บันทึกสำหรับผู้บริหาร" /></Title>
      <h5><T en="Transaction summary" th="สรุปธุรกรรม" /></h5>
      <p>{L(s.lang, m.summary)}</p>
      <h5><T en="Major risks" th="ความเสี่ยงหลัก" /></h5>
      <ol>{m.risks.map((r, i) => <li key={i}>{L(s.lang, r)}</li>)}</ol>
      <h5><T en="Financial exposure" th="ความเสี่ยงทางการเงิน" /></h5>
      <p>{L(s.lang, m.money)}</p>
      <h5><T en="Required approvals" th="การอนุมัติที่ต้องมี" /></h5>
      <p>{L(s.lang, m.approvals)}</p>
      <div className="callout"><strong><T en="Recommended decision" th="คำแนะนำ" />:</strong> {L(s.lang, m.decision)}</div>
      <h5 style={{ marginTop: 20 }}><T en="Conditions before signing" th="เงื่อนไขก่อนลงนาม" /></h5>
      <ol>{m.conditions.map((c, i) => <li key={i}>{L(s.lang, c)}</li>)}</ol>
      <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            s.issueMemo();
            downloadText(`LAW24-${X.ref}-decision-memo.txt`, memoText(s.lang, X, s.reviewLive));
            s.flash(s.lang === "th" ? "ส่งออกบันทึกผู้บริหารแล้ว" : "Management memo exported");
          }}
        >
          {s.memoIssued ? <T en="Memo issued — download again" th="ออกบันทึกแล้ว — ดาวน์โหลดอีกครั้ง" /> : <T en="Export for management" th="ส่งออกให้ผู้บริหาร" />}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => window.print()}><T en="Print" th="พิมพ์" /></button>
      </div>
    </div>
  );
}

function Cockpit() {
  const s = useStore();
  const X = s.xrayLive!;
  const c = cockpitOf(X);
  return (
    <div className="pad-page">
      <Kicker>cockpit · live agreement</Kicker>
      <Title>{L(s.lang, X.doc)}</Title>
      <p className="page-sub">
        {`${X.ref} · ${X.pages} ${s.lang === "th" ? "หน้า" : "pages"} · ${L(s.lang, X.langs)}`}
      </p>
      <div className="grid-3" style={{ margin: "22px 0" }}>
        {[
          { k: s.lang === "th" ? "มูลค่า" : "Value", v: c.value },
          { k: s.lang === "th" ? "ขั้น" : "Stage", v: L(s.lang, c.stage) },
          { k: s.lang === "th" ? "ความเสี่ยง" : "Risk", v: L(s.lang, c.risk) },
          { k: s.lang === "th" ? "เจ้าของ" : "Owner", v: L(s.lang, c.owner) },
          { k: s.lang === "th" ? "อนุมัติค้าง" : "Pending approvals", v: L(s.lang, c.approvals) },
          { k: s.lang === "th" ? "เจรจา" : "Negotiation", v: L(s.lang, c.nego) },
          { k: s.lang === "th" ? "ข้อผูกพัน" : "Obligations", v: L(s.lang, c.obligations) },
          { k: s.lang === "th" ? "กำหนดใกล้" : "Upcoming deadline", v: L(s.lang, c.deadline) },
        ].map((x) => (
          <div key={x.k} className="xray-layer">
            <div className="page-kicker">{x.k}</div>
            <p style={{ fontWeight: 700, margin: "8px 0 0" }}>{x.v}</p>
          </div>
        ))}
      </div>
      <h5><T en="Related agreements" th="สัญญาที่เกี่ยวข้อง" /></h5>
      {c.related.length
        ? c.related.map((r) => <div key={r.e} className="xray-row">{L(s.lang, r)}</div>)
        : <p className="text-muted"><T en="None mapped as missing." th="แผนที่ไม่ได้ระบุเอกสารที่ขาด" /></p>}
      <div className="stack-actions" style={{ marginTop: 18 }}>
        <Link href="/holistic?s=dna" className="btn btn-primary">Clause DNA</Link>
        <Link href="/review?s=xray" className="btn btn-secondary">X-Ray</Link>
        <Link href="/intel?s=twin" className="btn btn-secondary"><T en="Twin" th="ฝาแฝด" /></Link>
        <Link href="/diligence?s=dwar" className="btn btn-secondary"><T en="War Room" th="ห้องสงคราม" /></Link>
        <Link href="/negotiate?s=nladder" className="btn btn-secondary"><T en="Copilot" th="เจรจา" /></Link>
        <Link href="/obligations?s=oreg" className="btn btn-secondary"><T en="Obligations" th="ข้อผูกพัน" /></Link>
      </div>
    </div>
  );
}

function Dna() {
  const s = useStore();
  const d = dnaOf(s.xrayLive!);
  return (
    <div className="pad-page">
      <Kicker>cockpit · clause dna</Kicker>
      <Title>{L(s.lang, d.clause)}</Title>
      <p style={{ fontSize: 18, fontWeight: 700, maxWidth: "54ch", marginBottom: 24 }}>{L(s.lang, d.quote)}</p>
      {d.vs.map((r) => (
        <div key={r.k.e} className="xray-kv"><span>{L(s.lang, r.k)}</span><strong>{L(s.lang, r.v)}</strong></div>
      ))}
      <p className="text-muted" style={{ marginTop: 18, fontSize: 13 }}>
        <T en="Compared against this organisation's playbook. The engine never signs." th="เทียบกับเพลย์บุ๊กขององค์กรนี้ เครื่องยนต์ไม่ลงนามแทน" />
      </p>
      <div className="stack-actions" style={{ marginTop: 16 }}>
        <Link href="/holistic?s=simulate" className="btn btn-primary"><T en="Run a consequence" th="จำลองผล" /></Link>
        <Link href="/holistic?s=memo" className="btn btn-secondary"><T en="Decision memo" th="บันทึกตัดสินใจ" /></Link>
        <Link href="/review?s=xray" className="btn btn-secondary">X-Ray</Link>
      </div>
    </div>
  );
}
