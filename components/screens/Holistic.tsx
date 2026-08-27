"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { FX } from "@/lib/taxonomy";
import { Kicker, Title } from "@/components/ui";
import { L } from "@/lib/model";
import { MEMO, SIMULATE } from "@/lib/wow";
import { T } from "@/lib/i18n";
import { downloadText, packText } from "@/lib/demo";
import { Dropzone } from "@/components/Dropzone";

import { COCKPIT, DNA } from "@/lib/product";

export function HolisticScreen({ screen }: { screen: string }) {
  if (screen === "cockpit") return <Cockpit />;
  if (screen === "dna") return <Dna />;
  if (screen === "hinter") return <Inter />;
  if (screen === "hcons") return <Cons />;
  if (screen === "hbal") return <Bal />;
  if (screen === "simulate") return <Sim />;
  if (screen === "memo") return <Memo />;
  return <Cockpit />;
}

function H() {
  return FX.holistic;
}

function Inter() {
  const s = useStore();
  const h = H();
  return (
    <div className="pad-page">
      <Kicker>holistic · flagship</Kicker>
      <Title><T en="Clause interaction" th="ปฏิสัมพันธ์ระหว่างข้อสัญญา" /></Title>
      <Dropzone
        bucket="holistic"
        compact
        title={<T en="Drop related instruments" th="ลากเอกสารที่เกี่ยวข้องมาวาง" />}
        hint={<T en="Annexes, DPA, SOW or side letters. Completeness fails until they are in the pack." th="ภาคผนวก DPA SOW หรือหนังสือข้างเคียง ความครบถ้วนไม่ผ่านจนกว่าจะอยู่ในชุด" />}
      />
      {h.interactions.map((x, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center", padding: "14px 0", borderBottom: "2px solid var(--color-divider)" }}>
          <div style={{ fontWeight: 700 }}>{L(s.lang, x.a)}</div>
          <span className={x.v === "conflict" ? "tag tag-signal" : "tag tag-accent"}>{x.v === "conflict" ? (s.lang === "th" ? "ขัดกัน" : "Conflict") : (s.lang === "th" ? "อ่อนแอ" : "Weak")}</span>
          <div style={{ fontWeight: 700 }}>{L(s.lang, x.b)}</div>
          <div style={{ gridColumn: "1 / -1", fontSize: 13, color: "var(--color-neutral-700)" }}>{L(s.lang, x.w)}</div>
        </div>
      ))}
    </div>
  );
}

function Cons() {
  const s = useStore();
  const h = H();
  return (
    <div className="pad-page">
      <Kicker>holistic · completeness</Kicker>
      <Title><T en="Completeness & consistency" th="ความครบถ้วนและความสอดคล้อง" /></Title>
      <Dropzone
        bucket="holistic"
        compact
        title={<T en="Attach the missing annexes" th="แนบภาคผนวกที่ยังขาด" />}
        hint={<T en="A–C are incorporated by reference and never delivered." th="ภาคผนวก A–C ถูกอ้างถึงแต่ไม่เคยส่งมา" />}
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
    </div>
  );
}

function Bal() {
  const s = useStore();
  const h = H();
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
              <td><span className={x.s === "fail" ? "tag tag-signal" : x.s === "warn" ? "tag tag-accent" : "tag tag-neutral"}>{x.s}</span></td>
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
        <T en="Signing-readiness: reject until four must-haves close. Recommended strategy: hold liability and PDPA; trade reference rights for the price cap." th="ความพร้อมลงนาม: ปฏิเสธจนกว่าสี่ข้อต้องได้จะปิด กลยุทธ์: ยืนเพดานความรับผิดและ PDPA แลกสิทธิลูกค้าอ้างอิงกับเพดานราคา" />
      </div>
    </div>
  );
}

function Sim() {
  const s = useStore();
  const [i, setI] = useState(0);
  const sc = SIMULATE[i];
  return (
    <div className="pad-page">
      <Kicker>wow · consequence simulator</Kicker>
      <Title><T en="Follow the connected clauses" th="ตามข้อที่เชื่อมกัน" /></Title>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "16px 0 24px" }}>
        {SIMULATE.map((x, n) => (
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
  return (
    <div className="pad-page" style={{ maxWidth: 820 }}>
      <Kicker>wow · one-click decision memo</Kicker>
      <Title><T en="Management paper" th="บันทึกสำหรับผู้บริหาร" /></Title>
      <h5><T en="Transaction summary" th="สรุปธุรกรรม" /></h5>
      <p>{L(s.lang, MEMO.summary)}</p>
      <h5><T en="Major risks" th="ความเสี่ยงหลัก" /></h5>
      <ol>{MEMO.risks.map((r, i) => <li key={i}>{L(s.lang, r)}</li>)}</ol>
      <h5><T en="Financial exposure" th="ความเสี่ยงทางการเงิน" /></h5>
      <p>{L(s.lang, MEMO.money)}</p>
      <h5><T en="Required approvals" th="การอนุมัติที่ต้องมี" /></h5>
      <p>{L(s.lang, MEMO.approvals)}</p>
      <div className="callout"><strong><T en="Recommended decision" th="คำแนะนำ" />:</strong> {L(s.lang, MEMO.decision)}</div>
      <h5 style={{ marginTop: 20 }}><T en="Conditions before signing" th="เงื่อนไขก่อนลงนาม" /></h5>
      <ol>{MEMO.conditions.map((c, i) => <li key={i}>{L(s.lang, c)}</li>)}</ol>
      <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            s.issueMemo();
            downloadText("LAW24_Nimbus_decision-memo.txt", packText(s.lang));
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
  const c = COCKPIT;
  return (
    <div className="pad-page">
      <Kicker>cockpit · live agreement</Kicker>
      <Title><T en="Contract Cockpit" th="Contract Cockpit" /></Title>
      <p className="page-sub"><T en="A visual command center for this agreement — value, stage, risk, owner, approvals, negotiation, obligations, deadlines, related instruments." th="ห้องบังคับของสัญญานี้ — มูลค่า ขั้น ความเสี่ยง เจ้าของ อนุมัติ เจรจา ข้อผูกพัน กำหนด และเอกสารที่เกี่ยวข้อง" /></p>
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
      {c.related.map((r) => <div key={r.e} className="xray-row">{L(s.lang, r)}</div>)}
      <div className="stack-actions" style={{ marginTop: 18 }}>
        <Link href="/holistic?s=dna" className="btn btn-primary">Clause DNA</Link>
        <Link href="/review?s=xray" className="btn btn-secondary">X-Ray</Link>
        <Link href="/negotiate?s=nladder" className="btn btn-secondary"><T en="Copilot" th="เจรจา" /></Link>
      </div>
    </div>
  );
}

function Dna() {
  const s = useStore();
  return (
    <div className="pad-page">
      <Kicker>cockpit · clause dna</Kicker>
      <Title>{L(s.lang, DNA.clause)}</Title>
      <p style={{ fontSize: 18, fontWeight: 700, maxWidth: "54ch", marginBottom: 24 }}>{L(s.lang, DNA.quote)}</p>
      {DNA.vs.map((r) => (
        <div key={r.k.e} className="xray-kv"><span>{L(s.lang, r.k)}</span><strong>{L(s.lang, r.v)}</strong></div>
      ))}
      <p className="text-muted" style={{ marginTop: 18, fontSize: 13 }}>
        <T en="This is more defensible than generic AI because it learns from this organisation's own legal history. The engine never signs." th="นี่ป้องกันได้ดีกว่า AI ทั่วไป เพราะฉลาดจากประวัติกฎหมายขององค์กรนี้เอง เครื่องยนต์ไม่ลงนามแทน" />
      </p>
    </div>
  );
}
