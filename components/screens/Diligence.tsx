"use client";

import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Kicker, Sev, Stats, Title } from "@/components/ui";
import { L, type TE } from "@/lib/model";
import { T } from "@/lib/i18n";
import { downloadText } from "@/lib/demo";
import { Dropzone } from "@/components/Dropzone";
import { AiLiveMark } from "@/components/AiLiveMark";
import { NeedMap } from "@/components/NeedMap";
import { EngPill } from "@/components/EngagementMark";
import { warOf } from "@/lib/ai/fromMap";
import {
  DEAL_CLASS,
  DEAL_SCENARIO,
  DEAL_TX,
  dealOf,
  dealReportText,
  type DealFinding,
  type DealTx,
  type DealView,
} from "@/lib/deal";
import { ddContextOf } from "@/lib/firm";

const WOW = [
  { href: "/diligence?s=deal", en: "Deal X-Ray", th: "Deal X-Ray" },
  { href: "/diligence?s=dmiss", en: "Missing papers", th: "เอกสารที่ขาด" },
  { href: "/diligence?s=dcontra", en: "Contradictions", th: "ข้อขัดแย้ง" },
  { href: "/diligence?s=dfix", en: "Remediate", th: "แก้ไข" },
  { href: "/diligence?s=dsim", en: "Simulator", th: "จำลองดีล" },
] as const;

export function DiligenceScreen({ screen }: { screen: string }) {
  const s = useStore();
  const ctx = ddContextOf(s.practice);

  useEffect(() => {
    if (ctx) s.ensureDeal();
  }, [ctx?.assignment.id, ctx?.client.id, s.ensureDeal]);

  if (!ctx) return <DealIntake />;

  if (screen === "dwar") {
    if (!s.xrayLive) {
      return (
        <>
          <NeedMap kicker="diligence · contract flags" />
        </>
      );
    }
    return <War />;
  }

  const view = dealOf({
    deal: s.deal,
    practice: s.practice,
    uploads: s.uploads,
    xray: s.xrayLive,
    review: s.reviewLive,
    ddLive: s.ddLive,
  });

  if (screen === "dmatter") return <Transaction view={view} />;
  if (screen === "droom") return <Room view={view} />;
  if (screen === "dclass") return <Index view={view} />;
  if (screen === "dcheck" || screen === "dgrid") return <Control view={view} />;
  if (screen === "dmiss") return <Missing view={view} />;
  if (screen === "dfacts") return <Facts view={view} />;
  if (screen === "dclause") return <Clauses view={view} />;
  if (screen === "dcoc") return <Coc view={view} />;
  if (screen === "dcontra") return <Contra view={view} />;
  if (screen === "dauth") return <Authority view={view} />;
  if (screen === "dgraph" || screen === "dmap") return <Graph view={view} />;
  if (screen === "drisk" || screen === "dflags") return <Risk view={view} />;
  if (screen === "dmat") return <Material view={view} />;
  if (screen === "dexpo") return <Exposure view={view} />;
  if (screen === "dqa" || screen === "dreq") return <Qa view={view} />;
  if (screen === "dlaw") return <Law view={view} />;
  if (screen === "dev") return <Evidence view={view} />;
  if (screen === "dbreak") return <Breakers view={view} />;
  if (screen === "dsim") return <Sim view={view} />;
  if (screen === "dic") return <Health view={view} />;
  if (screen === "dcp") return <Cps view={view} />;
  if (screen === "dfix") return <Fix view={view} />;
  if (screen === "ddisc") return <Disc view={view} />;
  if (screen === "dspa") return <Spa view={view} />;
  if (screen === "drep") return <Rep view={view} />;
  if (screen === "autopilot") return <Auto view={view} />;
  return <Hub view={view} />;
}

function DealIntake() {
  const s = useStore();
  const th = s.lang === "th";
  const [clientName, setClientName] = useState("");
  const [engagementName, setEngagementName] = useState("");
  const [transaction, setTransaction] = useState<DealTx>("share");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!clientName.trim() || !engagementName.trim()) return;
    s.openDealEngagement({ clientName, engagementName, transaction });
    s.flash(th ? "เปิดลูกค้าและงาน DD แล้ว — พร้อมรับห้องเอกสาร" : "Client and DD engagement opened — ready for the room");
  }

  return (
    <div className="pad-page">
      <Kicker>diligence · deal x-ray · <AiLiveMark compact /></Kicker>
      <Title><T en="Deal X-Ray" th="Deal X-Ray" /></Title>
      <p className="page-sub">
        <T
          en="Understand the transaction, expose the risk, and fix it. Not a third contract viewer — the diligence OS that feeds Review and Assemble."
          th="เข้าใจธุรกรรม เปิดความเสี่ยง แล้วแก้ไข ไม่ใช่เครื่องอ่านสัญญาเครื่องที่สาม — เป็นระบบ DD ที่ป้อนงานตรวจและงานร่าง"
        />
      </p>
      <form className="practice-form eng-card eng-dd" style={{ marginTop: 20 }} onSubmit={onSubmit}>
        <div style={{ gridColumn: "1 / -1" }}>
          <div className="eng-pill eng-dd"><T en="Firm-controlled intake" th="รับเรื่องภายใต้สำนักงาน" /></div>
          <h3 style={{ margin: "12px 0 6px", fontSize: 20 }}>
            <T en="Client, engagement and transaction required" th="ต้องระบุลูกค้า งาน และประเภทธุรกรรมก่อน" />
          </h3>
          <p className="text-muted" style={{ margin: 0, fontSize: 13, maxWidth: "70ch" }}>
            <T
              en="Deal X-Ray does not run outside a Firm legal-DD workspace. Name the client and engagement, lock the transaction type, then ingest the room."
              th="Deal X-Ray ไม่ทำงานนอกพื้นที่งานตรวจสอบสถานะของสำนักงาน ระบุลูกค้าและงาน ล็อกประเภทธุรกรรม แล้วรับห้องเอกสาร"
            />
          </p>
        </div>
        <div className="field">
          <label><T en="Client / target" th="ลูกค้า / บริษัทเป้าหมาย" /></label>
          <input className="input" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder={th ? "เช่น ออร์คิด เวนเจอร์ส" : "e.g. Orchid Ventures"} required />
        </div>
        <div className="field">
          <label><T en="Engagement name" th="ชื่องาน" /></label>
          <input className="input" value={engagementName} onChange={(e) => setEngagementName(e.target.value)} placeholder={th ? "เช่น ตรวจสอบสถานะการซื้อหุ้น" : "e.g. Share acquisition legal DD"} required />
        </div>
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label><T en="What transaction are you doing?" th="ทำธุรกรรมอะไร" /></label>
          <select className="input" value={transaction} onChange={(e) => setTransaction(e.target.value as DealTx)}>
            {(Object.keys(DEAL_TX) as DealTx[]).map((k) => (
              <option key={k} value={k}>{th ? DEAL_TX[k].th : DEAL_TX[k].en}</option>
            ))}
          </select>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <button type="submit" className="btn btn-primary"><T en="Open Deal X-Ray" th="เปิด Deal X-Ray" /></button>
        </div>
      </form>
    </div>
  );
}

function Chrome({ kicker, title, sub, view, children }: { kicker: string; title: TE | string; sub?: TE; view: DealView; children: ReactNode }) {
  const s = useStore();
  return (
    <div className="pad-page deal-page">
      <Kicker>diligence · deal x-ray · {kicker} · <AiLiveMark compact /></Kicker>
      <div className="eng-card eng-dd" style={{ padding: "4px 0 8px 14px", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", margin: "8px 0 6px" }}>
          <EngPill track="diligence" />
          <span className="tag tag-outline">{s.lang === "th" ? DEAL_TX[view.tx].th : DEAL_TX[view.tx].en}</span>
          {view.assignment && <span className="mono">{view.assignment.id}</span>}
          {view.client && <span className="text-muted">{s.lang === "th" ? view.client.nameTh : view.client.name}</span>}
        </div>
        <Title>{typeof title === "string" ? title : L(s.lang, title)}</Title>
        {sub && <p className="page-sub">{L(s.lang, sub)}</p>}
      </div>
      {children}
      <div className="wow-hops" style={{ marginTop: 28 }}>
        {WOW.map((h) => (
          <Link key={h.href} href={h.href} className="btn btn-secondary" style={{ fontSize: 12 }}>{s.lang === "th" ? h.th : h.en}</Link>
        ))}
      </div>
    </div>
  );
}

function Hub({ view }: { view: DealView }) {
  const s = useStore();
  const th = s.lang === "th";
  return (
    <Chrome kicker="hub" title={P("Deal X-Ray", "Deal X-Ray")} sub={P("เอกสาร → ข้อเท็จจริง → ความสัมพันธ์ → ข้อผูกพัน → ความเสี่ยง → มูลค่า → การกระทำ → คำตัดสิน", "Documents → facts → relationships → obligations → risks → exposure → actions → deal decision")} view={view}>
      <p className="text-muted" style={{ maxWidth: "72ch", marginTop: 0 }}>
        <T en="LAW24 Diligence is the legal condition of the company or transaction. Review still reads one agreement. Assemble still drafts the fix. This screen decides what must happen." th="LAW24 Diligence คือสภาพกฎหมายของบริษัทหรือธุรกรรม งานตรวจยังอ่านสัญญาทีละฉบับ งานร่างยังสร้างฉบับแก้ไข จอนี้ตัดสินว่าต้องเกิดอะไร" />
      </p>
      <Stats items={[
        { v: String(view.files.filter((f) => f.source !== "referenced").length), k: th ? "เอกสารในห้อง" : "In the room" },
        { v: String(view.missing.length), k: th ? "ที่ควรมีแต่ยังไม่มา" : "Should exist, missing" },
        { v: String(view.breakers.length), k: th ? "ข้อที่อาจฆ่าดีล" : "Deal breakers" },
        { v: String(view.material.length), k: th ? "ประเด็นมีนัยสำคัญ" : "Material issues" },
      ]} />
      <div className="health-band health-" data-risk={view.health.overall} style={{ marginTop: 18, padding: 16, border: "2px solid var(--color-divider)" }}>
        <div className="page-kicker"><T en="Deal health" th="สุขภาพดีล" /></div>
        <div style={{ font: "800 28px/1.1 var(--font-heading)", margin: "8px 0" }}>
          {view.health.overall === "high" ? (th ? "ความเสี่ยงสูง" : "HIGH") : view.health.overall === "medium" ? (th ? "ปานกลาง" : "MEDIUM") : view.health.overall === "low" ? (th ? "ต่ำ" : "LOW") : (th ? "ยังไม่ขึ้นธงฆ่าดีล" : "NO KILL ITEM")}
        </div>
        <p>{L(s.lang, view.health.rec)}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span className="tag tag-accent">🔴 {view.health.critical} {th ? "วิกฤต" : "critical"}</span>
          <span className="tag tag-neutral">🟠 {view.health.high} {th ? "สูง" : "high"}</span>
          <span className="tag tag-neutral">🟡 {view.health.medium} {th ? "กลาง" : "medium"}</span>
          <span className="tag tag-outline">🟢 {view.health.cleared} {th ? "เคลียร์" : "cleared"}</span>
        </div>
      </div>
      <h5 style={{ marginTop: 24 }}><T en="What can hurt this deal" th="สิ่งที่ทำร้ายดีลนี้ได้" /></h5>
      {view.breakers.length === 0 && view.material.length === 0 ? (
        <p className="text-muted"><T en="No kill item from the evidence on file. Missing-document requests still have to close before IC." th="ยังไม่มีประเด็นฆ่าดีลจากหลักฐานในห้อง คำขอเอกสารที่ขาดยังต้องปิดก่อน IC" /></p>
      ) : (
        (view.breakers.length ? view.breakers : view.material.slice(0, 5)).map((f) => <FindingCard key={f.id} f={f} />)
      )}
      <Dropzone
        bucket="diligence"
        title={<T en="Drop the deal room" th="ลากห้องเอกสารมาวาง" />}
        hint={<T en="Corporate, contracts, financing, licences, employment, IP, litigation, property, privacy, tax, minutes, policies." th="นิติบุคคล สัญญา การเงิน ใบอนุญาต แรงงาน ไอพี คดี ทรัพย์สิน ข้อมูล ภาษี รายงานการประชุม นโยบาย" />}
      />
      <div className="stack-actions" style={{ marginTop: 16 }}>
        <Link href="/diligence?s=dic" className="btn btn-primary"><T en="IC / Deal health" th="สุขภาพดีล / คณะกรรมการ" /></Link>
        <Link href="/diligence?s=dmiss" className="btn btn-secondary"><T en="What should exist" th="สิ่งที่ควรมี" /></Link>
        <Link href="/diligence?s=dfix" className="btn btn-secondary"><T en="Fix a finding" th="แก้ไขข้อค้นพบ" /></Link>
        <button type="button" className="btn btn-secondary" onClick={() => { s.verifyDeal(); s.flash(th ? "ทนายยืนยันรอบนี้แล้ว" : "Counsel verified this round"); }}><T en="Counsel verifies" th="ทนายยืนยัน" /></button>
      </div>
    </Chrome>
  );
}

function Transaction({ view }: { view: DealView }) {
  const s = useStore();
  return (
    <Chrome kicker="transaction" title={P("ธุรกรรมที่ล็อกแล้ว", "Locked transaction")} sub={DEAL_TX[view.tx].why} view={view}>
      <div className="grid-2">
        {(Object.keys(DEAL_TX) as DealTx[]).map((k) => (
          <button
            key={k}
            type="button"
            className={`home-card eng-card ${s.deal.transaction === k ? "eng-dd" : ""}`}
            style={{ minHeight: 0, textAlign: "left" }}
            onClick={() => { s.setDealTransaction(k); s.flash(s.lang === "th" ? `ล็อก ${DEAL_TX[k].th}` : `Locked ${DEAL_TX[k].en}`); }}
          >
            <div style={{ fontWeight: 800 }}>{s.lang === "th" ? DEAL_TX[k].th : DEAL_TX[k].en}</div>
            <div className="text-muted" style={{ fontSize: 12 }}>{L(s.lang, DEAL_TX[k].why)}</div>
          </button>
        ))}
      </div>
      <div className="stack-actions" style={{ marginTop: 16 }}>
        <Link href="/diligence?s=dcheck" className="btn btn-primary"><T en="Open Control Center" th="เปิดศูนย์ควบคุม DD" /></Link>
      </div>
    </Chrome>
  );
}

function Room({ view }: { view: DealView }) {
  const s = useStore();
  const received = view.files.filter((f) => f.source !== "referenced");
  return (
    <Chrome kicker="data room" title={P("เครื่องอ่านห้องข้อมูล", "Data-room intelligence")} sub={P("จัดประเภท เวอร์ชัน ครอบครัวสัญญา และเอกสารที่ยังไม่ลงนาม — ไม่ใช่แค่รายชื่อไฟล์", "Type, version, contract families and unsigned papers — not a file list")} view={view}>
      <Dropzone
        bucket="diligence"
        title={<T en="Ingest the room" th="รับเข้าห้องเอกสาร" />}
        hint={<T en="PDF, DOCX, XLSX, ZIP, scans. Classified against the transaction checklist." th="PDF DOCX XLSX ZIP และสแกน จัดประเภทเทียบรายการตรวจของธุรกรรม" />}
      />
      <Stats items={view.coverage.map((c) => ({ v: c.v, k: L(s.lang, c.k) }))} />
      {view.families.length > 0 && (
        <>
          <h5 style={{ marginTop: 24 }}><T en="Contract families" th="ครอบครัวสัญญา" /></h5>
          {view.families.map((fam) => (
            <div key={fam.name} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 800 }}>{fam.name} <span className="tag tag-accent">{fam.files.length}</span></div>
              <p className="text-muted" style={{ margin: "4px 0 8px" }}><T en="One legal relationship, not unrelated PDFs." th="ความสัมพันธ์ทางกฎหมายเดียว ไม่ใช่ PDF ที่ไม่เกี่ยวกัน" /></p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                {fam.files.map((f, i) => (
                  <span key={f.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {i > 0 && <span style={{ color: "var(--eng-dd)" }}>→</span>}
                    <span className="graph-node" style={{ minWidth: 0 }}>{f.name}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
      <div className="table-wrap" style={{ marginTop: 16 }}>
        <table className="table">
          <thead><tr><th><T en="Document" th="เอกสาร" /></th><th><T en="Class" th="ประเภท" /></th><th><T en="Status" th="สถานะ" /></th><th><T en="Source" th="แหล่ง" /></th></tr></thead>
          <tbody>
            {received.map((f) => (
              <tr key={f.id}>
                <td style={{ fontWeight: 700 }}>{f.name}</td>
                <td>{s.lang === "th" ? DEAL_CLASS[f.class].th : DEAL_CLASS[f.class].en}</td>
                <td>{f.status}</td>
                <td className="mono">{f.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Chrome>
  );
}

function Index({ view }: { view: DealView }) {
  const s = useStore();
  return (
    <Chrome kicker="index" title={P("ดัชนีตรวจสอบสถานะเสมือน", "Virtual diligence index")} sub={P("ระบบจัดโฟลเดอร์ให้ แทนที่ทนายเรียง VDR เอง", "The system builds the diligence folder — lawyers stop arranging the VDR by hand")} view={view}>
      <div className="grid-3">
        {view.index.length ? view.index.map((r) => (
          <div key={r.cls} style={{ padding: 14, border: "2px solid var(--color-divider)" }}>
            <div className="page-kicker">{s.lang === "th" ? DEAL_CLASS[r.cls].th : DEAL_CLASS[r.cls].en}</div>
            <div style={{ font: "800 28px/1 var(--font-heading)", marginTop: 8 }}>{r.n}</div>
          </div>
        )) : <p className="text-muted"><T en="Nothing classified yet — drop the room." th="ยังไม่จัดประเภท — วางห้องเอกสาร" /></p>}
      </div>
    </Chrome>
  );
}

function Control({ view }: { view: DealView }) {
  const s = useStore();
  const counts = view.checklist.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});
  return (
    <Chrome kicker="control center" title={P("ศูนย์ควบคุม DD", "DD Control Center")} sub={P("รายการตรวจตามธุรกรรม — รับแล้ว / ขาด / ไม่ครบ / กำลังตรวจ / พบประเด็น / เคลียร์", "Transaction-aware checklist — received / missing / incomplete / under review / issue / cleared")} view={view}>
      <Stats items={[
        { v: String(counts.received || 0), k: s.lang === "th" ? "รับแล้ว" : "Received" },
        { v: String(counts.missing || 0), k: s.lang === "th" ? "ขาด" : "Missing" },
        { v: String(counts.incomplete || 0), k: s.lang === "th" ? "ไม่ครบ" : "Incomplete" },
        { v: String(counts.cleared || 0), k: s.lang === "th" ? "เคลียร์" : "Cleared" },
      ]} />
      <table className="table" style={{ marginTop: 18 }}>
        <thead><tr><th>ID</th><th><T en="Item" th="รายการ" /></th><th><T en="Stream" th="สายงาน" /></th><th><T en="Got" th="มี" /></th><th><T en="Status" th="สถานะ" /></th></tr></thead>
        <tbody>
          {view.checklist.map((c) => (
            <tr key={c.id}>
              <td className="mono">{c.id}</td>
              <td>{L(s.lang, c.title)}</td>
              <td>{s.lang === "th" ? DEAL_CLASS[c.cls].th : DEAL_CLASS[c.cls].en}</td>
              <td>{c.got}/{c.expect}</td>
              <td><span className="tag tag-outline">{c.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Chrome>
  );
}

function Missing({ view }: { view: DealView }) {
  const s = useStore();
  return (
    <Chrome kicker="missing" title={P("สิ่งที่ควรมีแต่ยังไม่มา", "What should exist but is not here")} sub={P("คำถามของ DD แบบเดิมคือได้รับอะไร Deal X-Ray ถามเพิ่มว่าเอกสารใดควรมี", "Traditional DD asks what arrived. Deal X-Ray also asks what should exist.")} view={view}>
      {!view.missing.length ? (
        <p className="text-muted"><T en="No missing-document requests on this checklist yet." th="ยังไม่มีคำขอเอกสารที่ขาดจากรายการนี้" /></p>
      ) : view.missing.map((m) => (
        <div key={m.id} className="issue-card" style={{ padding: 16, marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span className="mono">{m.id}</span>
            <span className="tag tag-accent">{s.lang === "th" ? DEAL_CLASS[m.cls].th : DEAL_CLASS[m.cls].en}</span>
            <span className="tag tag-outline">{m.status}</span>
          </div>
          <h4 style={{ marginTop: 10 }}>{L(s.lang, m.title)}</h4>
          <p className="text-muted">{L(s.lang, m.why)}</p>
        </div>
      ))}
      <div className="stack-actions" style={{ marginTop: 16 }}>
        <Link href="/diligence?s=dqa" className="btn btn-primary"><T en="Turn into management Q&A" th="แปลงเป็นคำถามฝ่ายบริหาร" /></Link>
      </div>
    </Chrome>
  );
}

function Facts({ view }: { view: DealView }) {
  const s = useStore();
  return (
    <Chrome kicker="facts" title={P("ฐานข้อเท็จจริงร่วม", "Shared legal-fact base")} sub={P("ทุกเอกสารป้อนฐานเดียวกัน แยกข้อเท็จจริงจากการตีความ", "Every document feeds one table. Facts stay separate from interpretation.")} view={view}>
      <table className="table">
        <thead><tr><th><T en="Field" th="หัวข้อ" /></th><th><T en="Extracted" th="ที่สกัด" /></th><th><T en="Source" th="แหล่ง" /></th><th><T en="Layer" th="ชั้น" /></th></tr></thead>
        <tbody>
          {view.facts.map((r, i) => (
            <tr key={i}>
              <td>{L(s.lang, r.k)}</td>
              <td style={{ fontWeight: 700 }}>{r.v}</td>
              <td>{L(s.lang, r.src)}</td>
              <td><span className={r.kind === "fact" ? "tag tag-accent" : "tag tag-neutral"}>{r.kind}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Chrome>
  );
}

function Clauses({ view }: { view: DealView }) {
  const s = useStore();
  return (
    <Chrome kicker="clauses" title={P("คลังข้อสัญญาของห้อง", "Room clause intelligence")} sub={P("ใช้เทคโนโลยีเดียวกับงานตรวจสัญญา — ข้ามทั้งชุดเอกสาร", "Same engine as Contract Review — across the set, not one PDF")} view={view}>
      {!view.clauses.length ? (
        <p className="text-muted"><T en="No clause hits yet. Map a material contract or drop files whose names carry the term." th="ยังไม่พบข้อ สกัดจากแผนที่สัญญาสำคัญ หรือวางไฟล์ที่ชื่อสื่อถึงข้อนั้น" /></p>
      ) : (
        <table className="table">
          <thead><tr><th><T en="Clause" th="ข้อ" /></th><th><T en="Hits" th="ครั้ง" /></th><th><T en="Source" th="แหล่ง" /></th></tr></thead>
          <tbody>
            {view.clauses.map((c) => (
              <tr key={c.id}><td>{L(s.lang, c.label)}</td><td>{c.hits}</td><td>{L(s.lang, c.src)}</td></tr>
            ))}
          </tbody>
        </table>
      )}
      <Link href="/review?s=xray" className="btn btn-secondary" style={{ marginTop: 16 }}><T en="Map a contract in Review" th="วางแผนที่สัญญาในงานตรวจ" /></Link>
    </Chrome>
  );
}

function Coc({ view }: { view: DealView }) {
  const s = useStore();
  return (
    <Chrome kicker="change of control" title={P("เครื่องเปลี่ยนอำนาจควบคุม", "Change-of-control engine")} sub={P("ยินยอม บอกกล่าว เลิกอัตโนมัติ ผิดนัดเร่งชำระ — แล้วตามใน Consent Tracker", "Consent, notice, automatic termination, acceleration — then the Consent Tracker")} view={view}>
      <Stats items={[
        { v: String(view.consents.length), k: s.lang === "th" ? "ฉบับที่ต้องตาม" : "Contracts on the tracker" },
        { v: String(view.breakers.filter((f) => f.remedy.kind === "consent").length), k: s.lang === "th" ? "ที่อาจฆ่าดีล" : "May kill the deal" },
      ]} />
      <table className="table" style={{ marginTop: 16 }}>
        <thead><tr><th><T en="Contract" th="สัญญา" /></th><th><T en="Counterparty" th="คู่สัญญา" /></th><th><T en="Requirement" th="ข้อกำหนด" /></th><th><T en="Deadline" th="กำหนด" /></th><th><T en="Status" th="สถานะ" /></th></tr></thead>
        <tbody>
          {view.consents.length ? view.consents.map((c) => (
            <tr key={c.id}>
              <td>{L(s.lang, c.contract)}</td>
              <td>{c.party}</td>
              <td>{L(s.lang, c.need)}</td>
              <td>{c.deadline}</td>
              <td>{c.status}</td>
            </tr>
          )) : <tr><td colSpan={5} className="text-muted"><T en="No consent row yet — map the material contracts." th="ยังไม่มีแถวยินยอม — วางแผนที่สัญญาสำคัญ" /></td></tr>}
        </tbody>
      </table>
      <Link href="/assemble?s=lib" className="btn btn-primary" style={{ marginTop: 16 }}><T en="Generate consent request" th="สร้างหนังสือขอความยินยอม" /></Link>
    </Chrome>
  );
}

function Contra({ view }: { view: DealView }) {
  const s = useStore();
  return (
    <Chrome kicker="contradictions" title={P("ข้อเท็จจริงที่ขัดกันข้ามเอกสาร", "Cross-document contradictions")} sub={P("ไม่วิเคราะห์ PDF ทีละฉบับ — ค้นหาสิ่งที่พูดคนละอย่าง", "Do not analyse PDFs in isolation. Find the facts that disagree.")} view={view}>
      {!view.contradictions.length ? (
        <p className="text-muted"><T en="No contradiction hypothesis yet. Add a register and an employment paper, or map a contract with conflicting dates." th="ยังไม่มีสมมติฐานข้อขัดแย้ง เพิ่มบัญชีผู้ถือหุ้นกับสัญญาจ้าง หรือ map สัญญาที่มีวันที่ขัดกัน" /></p>
      ) : view.contradictions.map((c) => (
        <div key={c.id} className="issue-card" style={{ padding: 16, marginBottom: 8 }}>
          <div className="mono">{c.id}</div>
          <h4 style={{ marginTop: 8 }}>{L(s.lang, c.title)}</h4>
          <div className="grid-2" style={{ marginTop: 8 }}>
            <div><div className="page-kicker">A</div><p>{L(s.lang, c.a)}</p></div>
            <div><div className="page-kicker">B</div><p>{L(s.lang, c.b)}</p></div>
          </div>
          <p className="text-muted">{L(s.lang, c.why)}</p>
        </div>
      ))}
    </Chrome>
  );
}

function Authority({ view }: { view: DealView }) {
  const s = useStore();
  return (
    <Chrome kicker="authority" title={P("อำนาจนิติบุคคล", "Corporate authority")} sub={P("บริษัท → กรรมการ → ผู้ถือหุ้น → UBO แล้วเทียบอำนาจลงนาม", "Company → directors → shareholders → UBO, then signing authority")} view={view}>
      {!view.authority.length ? (
        <p className="text-muted"><T en="No authorization gap from the evidence on file." th="ยังไม่มีช่องว่างอำนาจจากหลักฐานในห้อง" /></p>
      ) : view.authority.map((a) => (
        <div key={a.id} className="issue-card" style={{ padding: 16, marginBottom: 8 }}>
          <Sev sv={a.sev === "critical" || a.sev === "high" ? "high" : a.sev === "low" ? "low" : "med"} lang={s.lang} />
          <h4 style={{ marginTop: 8 }}>{L(s.lang, a.title)}</h4>
          <p>{L(s.lang, a.note)}</p>
        </div>
      ))}
    </Chrome>
  );
}

function Graph({ view }: { view: DealView }) {
  const s = useStore();
  return (
    <Chrome kicker="legal graph" title={P("กราฟนิติบุคคล", "Legal entity knowledge graph")} sub={P("บริษัท → ผู้ถือหุ้น → กรรมการ → สัญญา → คู่ค้า → สินเชื่อ → คดี → ผู้กำกับ", "Company → shareholders → directors → contracts → counterparties → loans → litigation → regulators")} view={view}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 420 }}>
        {view.graph.map((n, i) => (
          <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="graph-node" style={{ minWidth: 0, flex: 1 }}>{L(s.lang, n.label)}{n.via ? ` · ${n.via}` : ""}</span>
            {i < view.graph.length - 1 && <span style={{ color: "var(--eng-dd)" }}>↓</span>}
          </div>
        ))}
      </div>
      <h5 style={{ marginTop: 24 }}><T en="Change-of-control risk graph" th="กราฟความเสี่ยงอำนาจควบคุม" /></h5>
      <pre className="deal-tree">{`Acquisition
   │
   ├── ${s.lang === "th" ? "สัญญาพาณิชย์" : "Commercial contracts"}
   │      └── ${view.consents.length ? (s.lang === "th" ? "ต้องขอความยินยอม" : "consent required") : (s.lang === "th" ? "ยังไม่สกัด" : "not yet extracted")}
   ├── ${s.lang === "th" ? "สินเชื่อ" : "Facility"}
   │      └── ${view.findings.some((f) => f.id === "DF-XD-01") ? (s.lang === "th" ? "เร่งชำระ / ผิดนัด" : "acceleration / default") : (s.lang === "th" ? "ยังไม่โยง" : "unlinked")}
   ├── ${s.lang === "th" ? "ใบอนุญาต" : "Licence"}
   │      └── ${view.files.some((f) => f.class === "regulatory") ? (s.lang === "th" ? "บอกกล่าวผู้กำกับ" : "regulator notice") : (s.lang === "th" ? "หลักฐานขาด" : "evidence missing")}
   └── ${s.lang === "th" ? "ร่วมทุน / ผู้ถือหุ้น" : "JV / shareholders"}
          └── ${s.lang === "th" ? "สิทธิ put/call ถ้ามีในห้อง" : "put/call if on file"}`}</pre>
    </Chrome>
  );
}

function Risk({ view }: { view: DealView }) {
  const s = useStore();
  return (
    <Chrome kicker="risk" title={P("เครื่องความเสี่ยงหลายมิติ", "Multi-dimension risk engine")} sub={P("กฎหมาย การเงิน ธุรกรรม ปฏิบัติการ กำกับ ชื่อเสียง — แสดงสมมติฐาน ไม่แสร้งว่าคะแนนเป็นความจริงทางคณิต", "Legal, financial, transaction, operational, regulatory, reputational — show the assumptions. Do not pretend the score is mathematically true.")} view={view}>
      {view.findings.map((f) => <FindingCard key={f.id} f={f} />)}
    </Chrome>
  );
}

function Material({ view }: { view: DealView }) {
  const s = useStore();
  const m = s.deal.materiality;
  return (
    <Chrome kicker="materiality" title={P("เครื่องนัยสำคัญ", "Materiality engine")} sub={P("มิฉะนั้น AI จะสร้างข้อค้นพบนับพัน — กำหนดเกณฑ์แล้วเหลือประเด็นที่มีนัย", "Otherwise AI produces thousands of findings. Set the floor, keep the material set.")} view={view}>
      <div className="practice-form">
        <div className="field">
          <label><T en="Material contract (THB)" th="สัญญาสำคัญ (บาท)" /></label>
          <input className="input" type="number" value={m.contract} onChange={(e) => s.setDealMateriality({ contract: Number(e.target.value) || 0 })} />
        </div>
        <div className="field">
          <label><T en="Litigation (THB)" th="คดี (บาท)" /></label>
          <input className="input" type="number" value={m.litigation} onChange={(e) => s.setDealMateriality({ litigation: Number(e.target.value) || 0 })} />
        </div>
        <div className="field">
          <label><T en="Customer % of revenue" th="ลูกค้า % รายได้" /></label>
          <input className="input" type="number" value={m.customerPct} onChange={(e) => s.setDealMateriality({ customerPct: Number(e.target.value) || 0 })} />
        </div>
        <div className="field">
          <label><T en="Supplier % of purchases" th="ผู้ขาย % ยอดซื้อ" /></label>
          <input className="input" type="number" value={m.supplierPct} onChange={(e) => s.setDealMateriality({ supplierPct: Number(e.target.value) || 0 })} />
        </div>
      </div>
      <p style={{ marginTop: 16, fontWeight: 700 }}>{view.findings.length} → {view.material.length} <T en="material issues" th="ประเด็นมีนัยสำคัญ" /></p>
      {view.material.map((f) => <FindingCard key={f.id} f={f} />)}
    </Chrome>
  );
}

function Exposure({ view }: { view: DealView }) {
  const s = useStore();
  return (
    <Chrome kicker="exposure" title={P("มูลค่าความเสี่ยงทางธุรกิจ", "Financial exposure")} sub={P("แปลข้อกฎหมายเป็นตัวเลขที่ผู้บริหารอ่านได้", "Turn legal findings into numbers executives can read")} view={view}>
      <div className="grid-2">
        {view.exposure.map((e, i) => (
          <div key={i} style={{ padding: 16, border: "2px solid var(--color-divider)" }}>
            <div className="page-kicker">{L(s.lang, e.k)}</div>
            <div style={{ font: "800 24px/1.2 var(--font-heading)", marginTop: 8 }}>{e.v}</div>
          </div>
        ))}
      </div>
    </Chrome>
  );
}

function Qa({ view }: { view: DealView }) {
  const s = useStore();
  const [draft, setDraft] = useState<Record<string, string>>({});
  return (
    <Chrome kicker="management q&a" title={P("คำถามฝ่ายบริหาร + เครื่องติดตาม", "Management Q&A + follow-up")} sub={P("คำตอบไม่เท่ากับปิดประเด็น — ระบบถามว่าพอหรือยัง และมีหลักฐานหรือไม่", "Answered is not closed. The engine asks whether the answer is sufficient and evidenced.")} view={view}>
      {view.questions.map((q) => (
        <div key={q.id} className="issue-card" style={{ padding: 16, marginBottom: 10 }}>
          <div className="mono">{q.id}</div>
          <h4 style={{ marginTop: 8 }}>{L(s.lang, q.q)}</h4>
          {q.answer && (
            <p><T en="Management:" th="ฝ่ายบริหาร:" /> {q.answer}</p>
          )}
          {q.answer && !q.sufficient && q.followUp && (
            <div className="tag tag-accent" style={{ marginBottom: 8 }}>{L(s.lang, q.followUp)}</div>
          )}
          {q.answer && q.sufficient && <div className="tag tag-outline"><T en="Sufficient for this round — counsel still confirms" th="พอสำหรับรอบนี้ — ทนายยังเป็นผู้ยืนยัน" /></div>}
          <textarea
            className="input"
            rows={3}
            style={{ marginTop: 8, width: "100%" }}
            value={draft[q.id] ?? q.answer ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, [q.id]: e.target.value }))}
            placeholder={s.lang === "th" ? "วางคำตอบฝ่ายบริหาร" : "Paste the management response"}
          />
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: 8 }}
            onClick={() => {
              s.answerDealQuestion(q.id, draft[q.id] ?? "");
              s.flash(s.lang === "th" ? `ประเมิน ${q.id} แล้ว` : `${q.id} evaluated`);
            }}
          >
            <T en="Evaluate answer" th="ประเมินคำตอบ" />
          </button>
        </div>
      ))}
    </Chrome>
  );
}

function Law({ view }: { view: DealView }) {
  const s = useStore();
  return (
    <Chrome kicker="applicable law" title={P("เอกสาร → ข้อ → ประเด็น → กฎหมาย", "Document → clause → issue → law")} sub={P("แยกข้อเท็จจริงในสัญญา จากการตีความของ AI และจากแหล่งกฎหมายภายนอก", "Separate the contract fact from the AI interpretation and from external authority.")} view={view}>
      {view.law.map((r, i) => (
        <div key={i} className="issue-card" style={{ padding: 16, marginBottom: 8 }}>
          <h4>{L(s.lang, r.issue)}</h4>
          <div className="xray-row"><strong><T en="Fact" th="ข้อเท็จจริง" /></strong> — {L(s.lang, r.fact)}</div>
          <div className="xray-row"><strong><T en="Interpretation" th="การตีความ" /></strong> — {L(s.lang, r.interp)}</div>
          <div className="xray-row"><strong><T en="Authority" th="แหล่งกฎหมาย" /></strong> — {L(s.lang, r.authority)}</div>
        </div>
      ))}
    </Chrome>
  );
}

function Evidence({ view }: { view: DealView }) {
  return (
    <Chrome kicker="evidence" title={P("ทุกข้อสรุปต้องมีหลักฐาน", "Every conclusion needs evidence")} sub={P("ข้อค้นพบ / เหตุ / หน้า / แหล่ง / เหตุผล AI / การกระทำ — ไม่มีประโยคลอยในรายงาน", "Finding / why / page / source / AI reasoning / action — no unsupported line in the report")} view={view}>
      {view.findings.map((f) => <FindingCard key={f.id} f={f} evidence />)}
    </Chrome>
  );
}

function Breakers({ view }: { view: DealView }) {
  const s = useStore();
  return (
    <Chrome kicker="deal breakers" title={P("สิ่งที่อาจฆ่าดีล", "The things that could kill the deal")} sub={P("ไม่ใช่ 842 ข้อค้นพบ — คือรายการที่ผู้ตัดสินใจต้องเห็นก่อน", "Not 842 legal findings. The list decision-makers need first.")} view={view}>
      {!view.breakers.length ? (
        <p className="text-muted"><T en="No potential deal-breaker from the evidence on file. Documentary gaps may still hold IC." th="ยังไม่มีประเด็นที่อาจฆ่าดีลจากหลักฐานในห้อง ช่องว่างเอกสารยังหน่วง IC ได้" /></p>
      ) : view.breakers.map((f) => <FindingCard key={f.id} f={f} evidence />)}
      <Link href="/diligence?s=dic" className="btn btn-primary" style={{ marginTop: 12 }}><T en="Open IC mode" th="เปิดโหมดคณะกรรมการ" /></Link>
    </Chrome>
  );
}

function Sim({ view }: { view: DealView }) {
  const s = useStore();
  return (
    <Chrome kicker="simulator" title={P("จำลองผลกระทบโครงสร้าง", "Deal impact simulator")} sub={P("เปลี่ยนซื้อหุ้นเป็นซื้อสินทรัพย์ หรือ 100% เป็น 49% — แล้วคำนวณใหม่", "Switch share to asset, or 100% to 49% — then recalculate.")} view={view}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {(["share100", "share49", "asset"] as const).map((sc) => (
          <button
            key={sc}
            type="button"
            className={`filter-chip eng-dd ${s.deal.scenario === sc ? "on" : ""}`}
            onClick={() => s.setDealScenario(sc)}
          >
            {s.lang === "th" ? DEAL_SCENARIO[sc].th : DEAL_SCENARIO[sc].en}
          </button>
        ))}
      </div>
      <p className="text-muted">{L(s.lang, view.sim.note)}</p>
      <table className="table">
        <thead>
          <tr>
            <th />
            <th>{s.lang === "th" ? DEAL_SCENARIO.share100.th : DEAL_SCENARIO.share100.en}</th>
            <th>{s.lang === "th" ? DEAL_SCENARIO.share49.th : DEAL_SCENARIO.share49.en}</th>
            <th>{s.lang === "th" ? DEAL_SCENARIO.asset.th : DEAL_SCENARIO.asset.en}</th>
          </tr>
        </thead>
        <tbody>
          {view.sim.rows.map((r, i) => (
            <tr key={i}>
              <td style={{ fontWeight: 700 }}>{L(s.lang, r.k)}</td>
              <td style={{ background: view.scenario === "share100" ? "var(--color-accent-100)" : undefined }}>{r.share100}</td>
              <td style={{ background: view.scenario === "share49" ? "var(--color-accent-100)" : undefined }}>{r.share49}</td>
              <td style={{ background: view.scenario === "asset" ? "var(--color-accent-100)" : undefined }}>{r.asset}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Chrome>
  );
}

function Health({ view }: { view: DealView }) {
  const s = useStore();
  const th = s.lang === "th";
  return (
    <Chrome kicker="ic mode" title={P("สุขภาพดีล — โหมดคณะกรรมการ", "Deal health — IC mode")} sub={P("อย่าเปิดรายงาน 150 หน้าก่อน ให้ผู้บริหารเห็นความเสี่ยงรวม แล้วเจาะลง", "Do not lead with a 150-page report. Show overall risk, then let executives drill down.")} view={view}>
      <div style={{ padding: 20, border: "2px solid var(--eng-dd)" }}>
        <div className="page-kicker">LAW24 DEAL HEALTH</div>
        <div style={{ font: "800 36px/1 var(--font-heading)", margin: "10px 0" }}>
          {th ? "ความเสี่ยงรวม: " : "Overall risk: "}{view.health.overall.toUpperCase()}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span className="tag tag-accent">🔴 {view.health.critical} Critical</span>
          <span className="tag tag-neutral">🟠 {view.health.high} High</span>
          <span className="tag tag-neutral">🟡 {view.health.medium} Medium</span>
          <span className="tag tag-outline">🟢 {view.health.cleared} Cleared</span>
        </div>
        <h5 style={{ marginTop: 18 }}><T en="Biggest risks" th="ความเสี่ยงใหญ่สุด" /></h5>
        <ol>
          {(view.breakers.length ? view.breakers : view.material).slice(0, 4).map((f) => (
            <li key={f.id}>{L(s.lang, f.title)}</li>
          ))}
        </ol>
        <p style={{ fontWeight: 700 }}><T en="Transaction recommendation" th="คำแนะนำธุรกรรม" /> — {L(s.lang, view.health.rec)}</p>
      </div>
      <div className="stack-actions" style={{ marginTop: 16 }}>
        <Link href="/diligence?s=dbreak" className="btn btn-primary"><T en="Drill into breakers" th="เจาะข้อที่อาจฆ่าดีล" /></Link>
        <Link href="/diligence?s=drep" className="btn btn-secondary"><T en="Full report" th="รายงานเต็ม" /></Link>
      </div>
    </Chrome>
  );
}

function Cps({ view }: { view: DealView }) {
  const s = useStore();
  return (
    <Chrome kicker="closing conditions" title={P("จากข้อค้นพบสู่เงื่อนไขปิดดีล", "Findings become closing conditions")} sub={P("เจ้าของ / สถานะ / กำหนด / หลักฐาน", "Owner / status / deadline / evidence")} view={view}>
      {!view.cps.length ? (
        <p className="text-muted"><T en="No CP generated — no deal-breaker is on file yet." th="ยังไม่มี CP — ยังไม่มีประเด็นฆ่าดีลในห้อง" /></p>
      ) : (
        <table className="table">
          <thead><tr><th>ID</th><th><T en="Condition" th="เงื่อนไข" /></th><th><T en="Owner" th="ผู้รับ" /></th><th><T en="Status" th="สถานะ" /></th></tr></thead>
          <tbody>
            {view.cps.map((c) => (
              <tr key={c.id}>
                <td className="mono">{c.id}</td>
                <td>{L(s.lang, c.title)}</td>
                <td>{c.owner}</td>
                <td>
                  <select className="input" value={c.status} onChange={(e) => s.setDealCpStatus(c.id, e.target.value as "open" | "in_progress" | "cleared")}>
                    <option value="open">open</option>
                    <option value="in_progress">in progress</option>
                    <option value="cleared">cleared</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Chrome>
  );
}

function Fix({ view }: { view: DealView }) {
  const s = useStore();
  return (
    <Chrome kicker="remediate" title={P("ค้นพบ → วิเคราะห์ → แก้ไข → ลงมือ", "Discover → analyse → fix → execute")} sub={P("คลิกข้อค้นพบ แล้ว LAW24 สร้างฉบับแก้ไข หนังสือยินยอม รับชดใช้ หรือ CP", "Click a finding and LAW24 creates the amendment, consent, indemnity or CP")} view={view}>
      {view.findings.filter((f) => f.material).map((f) => (
        <div key={f.id} className="issue-card" style={{ padding: 16, marginBottom: 8 }}>
          <div className="mono">{f.id}</div>
          <h4 style={{ marginTop: 8 }}>{L(s.lang, f.title)}</h4>
          <p>{L(s.lang, f.evidence.action)}</p>
          <div className="stack-actions">
            <Link href={f.remedy.href} className="btn btn-primary">{s.lang === "th" ? f.remedy.th : f.remedy.en}</Link>
            {f.remedy.kind !== "review" && <Link href="/review?s=xray" className="btn btn-secondary"><T en="Open Review" th="เปิดงานตรวจ" /></Link>}
            {f.remedy.kind !== "amendment" && f.remedy.kind !== "consent" && <Link href="/assemble?s=lib" className="btn btn-secondary"><T en="Open Assemble" th="เปิดงานร่าง" /></Link>}
          </div>
        </div>
      ))}
    </Chrome>
  );
}

function Disc({ view }: { view: DealView }) {
  const s = useStore();
  return (
    <Chrome kicker="disclosures" title={P("ตารางเปิดเผยจากข้อค้นพบ", "Disclosure schedules from findings")} sub={P("เทียบคำรับรองใน SPA แล้วเติมตาราง", "Read the SPA warranties and populate the schedules")} view={view}>
      {!view.disclosures.length ? (
        <p className="text-muted"><T en="No disclosure suggestion yet — breakers and consents feed this table." th="ยังไม่มีตารางเปิดเผย — ประเด็นฆ่าดีลและความยินยอมจะเติมตารางนี้" /></p>
      ) : view.disclosures.map((d) => (
        <div key={d.id} className="issue-card" style={{ padding: 16, marginBottom: 8 }}>
          <div className="mono">{d.id}</div>
          <h4 style={{ marginTop: 8 }}>{L(s.lang, d.warranty)}</h4>
          <p>{L(s.lang, d.body)}</p>
          <Link href={d.href} className="btn btn-primary"><T en="Generate schedule language" th="สร้างถ้อยคำตาราง" /></Link>
        </div>
      ))}
    </Chrome>
  );
}

function Spa({ view }: { view: DealView }) {
  const s = useStore();
  return (
    <Chrome kicker="spa" title={P("ผล DD เข้าเอกสารธุรกรรม", "Diligence into the transaction papers")} sub={P("รับชดใช้เฉพาะเรื่อง Escrow ปรับราคา CP คำรับรอง — แล้วประกอบข้อ", "Specific indemnity, escrow, price adjustment, CP, R&W — then assemble the clause")} view={view}>
      {!view.spa.length ? (
        <p className="text-muted"><T en="No SPA move yet — deal-breakers become clause recommendations." th="ยังไม่มีท่าทาง SPA — ประเด็นฆ่าดีลจะกลายเป็นข้อแนะนำ" /></p>
      ) : view.spa.map((r) => (
        <div key={r.id} className="issue-card" style={{ padding: 16, marginBottom: 8 }}>
          <div className="mono">{r.id}</div>
          <h4 style={{ marginTop: 8 }}>{L(s.lang, r.move)}</h4>
          <p className="text-muted">{L(s.lang, r.why)}</p>
          <Link href={r.href} className="btn btn-primary"><T en="Generate clause" th="สร้างข้อสัญญา" /></Link>
        </div>
      ))}
    </Chrome>
  );
}

function Rep({ view }: { view: DealView }) {
  const s = useStore();
  const sections: { k: TE; rows: DealFinding[] }[] = [
    { k: P("ประเด็นที่อาจฆ่าดีล", "Deal breakers"), rows: view.breakers },
    { k: P("ข้อค้นพบสำคัญ", "Key findings"), rows: view.material },
  ];
  return (
    <Chrome kicker="report" title={P("รายงานตรวจสอบสถานะที่ชี้หลักฐาน", "Evidence-linked diligence report")} view={view}>
      {sections.map((sec) => (
        <div key={sec.k.e} style={{ marginBottom: 20 }}>
          <h5>{L(s.lang, sec.k)}</h5>
          {sec.rows.length ? sec.rows.map((f) => (
            <div key={f.id} className="xray-row"><span className="mono">{f.id}</span> {L(s.lang, f.title)} — {L(s.lang, f.evidence.source)}</div>
          )) : <p className="text-muted">—</p>}
        </div>
      ))}
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          downloadText(`LAW24-Deal-XRay-${view.assignment?.id || "draft"}.txt`, dealReportText(s.lang, view));
          s.flash(s.lang === "th" ? "ส่งออกรายงานจาก Deal X-Ray แล้ว" : "Deal X-Ray report exported");
        }}
      >
        <T en="Download report" th="ดาวน์โหลดรายงาน" />
      </button>
    </Chrome>
  );
}

function Auto({ view }: { view: DealView }) {
  const s = useStore();
  return (
    <Chrome kicker="autopilot" title={P("รอบแรกทั้งห้อง — ทนายยืนยัน", "First pass over the room — counsel verifies")} view={view}>
      <Stats items={view.coverage.map((c) => ({ v: c.v, k: L(s.lang, c.k) }))} />
      <div className="grid-3" style={{ marginTop: 20 }}>
        <div><h5><T en="Missing" th="ขาด" /></h5><ul>{view.missing.slice(0, 6).map((m) => <li key={m.id}>{L(s.lang, m.title)}</li>)}</ul></div>
        <div><h5><T en="Material" th="มีนัยสำคัญ" /></h5><ul>{view.material.slice(0, 6).map((f) => <li key={f.id}>{L(s.lang, f.title)}</li>)}</ul></div>
        <div><h5><T en="First Q&A" th="คำถามรอบแรก" /></h5><ul>{view.questions.slice(0, 6).map((q) => <li key={q.id}>{L(s.lang, q.q)}</li>)}</ul></div>
      </div>
    </Chrome>
  );
}

function War() {
  const s = useStore();
  const w = warOf(s.xrayLive!, s.reviewLive);
  const X = s.xrayLive!;
  return (
    <div className="pad-page">
      <Kicker>diligence · contract flags</Kicker>
      <Title>{L(s.lang, X.doc)}</Title>
      <p className="page-sub">
        <T en="Flags for this mapped instrument. The whole transaction lives on Deal X-Ray." th="ธงของฉบับที่วางแผนที่ ทั้งธุรกรรมอยู่ที่ Deal X-Ray" />
      </p>
      <Stats items={w.stats.map((x) => ({ v: x.v, k: L(s.lang, x.k) }))} />
      <div className="stack-actions" style={{ marginTop: 18 }}>
        <Link href="/diligence?s=deal" className="btn btn-primary"><T en="Deal X-Ray" th="Deal X-Ray" /></Link>
        <Link href="/diligence?s=dflags" className="btn btn-secondary"><T en="Room findings" th="ข้อค้นพบทั้งห้อง" /></Link>
        <Link href="/review?s=xray" className="btn btn-secondary">X-Ray</Link>
      </div>
    </div>
  );
}

function FindingCard({ f, evidence }: { f: DealFinding; evidence?: boolean }) {
  const s = useStore();
  const dims = [
    f.dims.legal && (s.lang === "th" ? "กฎหมาย" : "legal"),
    f.dims.financial && (s.lang === "th" ? "การเงิน" : "financial"),
    f.dims.transaction && (s.lang === "th" ? "ธุรกรรม" : "transaction"),
    f.dims.operational && (s.lang === "th" ? "ปฏิบัติการ" : "operational"),
    f.dims.regulatory && (s.lang === "th" ? "กำกับ" : "regulatory"),
    f.dims.reputational && (s.lang === "th" ? "ชื่อเสียง" : "reputational"),
  ].filter(Boolean);
  return (
    <div className="issue-card" style={{ padding: 16, marginBottom: 8 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span className="mono">{f.id}</span>
        <Sev sv={f.sev === "critical" || f.sev === "high" ? "high" : f.sev === "low" ? "low" : "med"} lang={s.lang} />
        {f.breaker && <span className="tag tag-accent"><T en="Deal breaker" th="อาจฆ่าดีล" /></span>}
        {f.material && <span className="tag tag-outline"><T en="Material" th="มีนัยสำคัญ" /></span>}
        {dims.map((d) => <span key={String(d)} className="tag tag-neutral">{d}</span>)}
      </div>
      <h4 style={{ marginTop: 10 }}>{L(s.lang, f.title)}</h4>
      {f.exposureNote && <p style={{ fontWeight: 700 }}>{L(s.lang, f.exposureNote)}</p>}
      <p>{L(s.lang, f.fact)}</p>
      {evidence && (
        <div style={{ marginTop: 8 }}>
          <div className="xray-row"><strong>WHY</strong> — {L(s.lang, f.evidence.why)}</div>
          <div className="xray-row"><strong>EVIDENCE</strong> — {f.evidence.page} · {L(s.lang, f.evidence.source)}</div>
          <div className="xray-row"><strong>AI</strong> — {L(s.lang, f.evidence.reasoning)}</div>
          <div className="xray-row"><strong>ACTION</strong> — {L(s.lang, f.evidence.action)}</div>
        </div>
      )}
      <div className="stack-actions" style={{ marginTop: 10 }}>
        <Link href={f.remedy.href} className="btn btn-primary">{s.lang === "th" ? f.remedy.th : f.remedy.en}</Link>
      </div>
    </div>
  );
}

function P(t: string, e: string): TE {
  return { t, e };
}
