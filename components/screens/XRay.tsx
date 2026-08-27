"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Kicker, Title } from "@/components/ui";
import { Dropzone } from "@/components/Dropzone";
import { useStore } from "@/lib/store";
import { T } from "@/lib/i18n";
import { L } from "@/lib/model";
import { XRAY } from "@/lib/product";
import { copyText, downloadText } from "@/lib/demo";

export function XRayScreen() {
  const s = useStore();
  const th = s.lang === "th";
  const [mapping, setMapping] = useState(false);

  useEffect(() => {
    if (s.xrayReady) return;
    const has = s.uploads.some((u) => u.bucket === "xray");
    if (has) {
      setMapping(true);
      const t = window.setTimeout(() => {
        s.startXray();
        setMapping(false);
      }, 1400);
      return () => window.clearTimeout(t);
    }
  }, [s.uploads, s.xrayReady, s]);

  function runDemo() {
    setMapping(true);
    window.setTimeout(() => {
      s.startXray();
      setMapping(false);
      s.flash(th ? "แผนที่สัญญาเสร็จ — คำตัดสิน: เจรจา" : "Contract mapped — verdict: Negotiate");
    }, 1400);
  }

  if (!s.xrayReady || mapping) {
    return (
      <div className="pad-page">
        <Kicker>review · contract x-ray</Kicker>
        <Title><T en="Contract X-Ray" th="Contract X-Ray" /></Title>
        <p className="page-sub">
          <T
            en="Upload any Thai or English agreement. LAW24 produces a complete X-Ray in under three minutes — verdict, heatmap, missing clauses, Thai citations. Not a chat window."
            th="อัปโหลดสัญญาไทยหรืออังกฤษ ระบบทำ X-Ray ครบในไม่ถึงสามนาที — คำตัดสิน แผนความร้อน ข้อที่ขาด อ้างอิงกฎหมายไทย ไม่ใช่หน้าต่างแชต"
          />
        </p>
        {mapping ? (
          <div className="xray-map">
            <div className="xray-scan" />
            <strong><T en="Mapping the contract…" th="กำลังวางแผนที่สัญญา…" /></strong>
            <p><T en="Clauses · parties · dates · Thai authorities · playbook fit" th="ข้อสัญญา · คู่สัญญา · วันที่ · ฐานกฎหมายไทย · เทียบเพลย์บุ๊ก" /></p>
          </div>
        ) : (
          <>
            <Dropzone
              bucket="xray"
              title={<T en="Drop a Thai or English agreement" th="ลากสัญญาไทยหรืออังกฤษมาวาง" />}
              hint={<T en="PDF or DOCX. One document. Facts, interpretations and suggested actions stay distinct." th="PDF หรือ DOCX หนึ่งฉบับ ข้อเท็จจริง การตีความ และการกระทำที่แนะนำแยกกันชัด" />}
              multiple={false}
            />
            <div className="stack-actions" style={{ marginTop: 16 }}>
              <button type="button" className="btn btn-primary" onClick={runDemo}>
                <T en="Run demo on Nimbus CT-291" th="ทดลองกับนิมบัส CT-291" />
              </button>
              <Link href="/holistic?s=cockpit" className="btn btn-secondary"><T en="Open cockpit" th="เปิดห้องบังคับ" /></Link>
            </div>
            <p className="text-muted" style={{ marginTop: 18, fontSize: 12 }}>
              <T en="Free entry: one document. No permanent storage by default. No final redlines without professional review." th="ทางเข้าฟรี: หนึ่งฉบับ ไม่เก็บถาวรโดยค่าเริ่มต้น ไม่มี redline สุดท้ายโดยไม่มีทนายตรวจ" />
            </p>
          </>
        )}
      </div>
    );
  }

  const heatColor = (sev: string) => sev === "high" ? "var(--color-hot)" : sev === "med" ? "var(--color-warn)" : "var(--color-ok)";

  return (
    <div className="pad-page">
      <Kicker>review · contract x-ray · {XRAY.mappedIn.e}</Kicker>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <Title>{L(s.lang, XRAY.doc)}</Title>
          <p className="page-sub">{XRAY.ref} · {XRAY.pages} {th ? "หน้า" : "pages"} · {L(s.lang, XRAY.langs)}</p>
        </div>
        <div className="xray-verdict">
          <span className="page-kicker"><T en="Overall verdict" th="คำตัดสินรวม" /></span>
          <strong>{L(s.lang, XRAY.verdictLabel)}</strong>
          <span className="text-muted" style={{ fontSize: 12 }}><T en="Accept / Negotiate / Do Not Sign" th="ยอมรับ / เจรจา / ห้ามลงนาม" /></span>
        </div>
      </div>
      <p style={{ maxWidth: "72ch", marginBottom: 22 }}>{L(s.lang, XRAY.verdictWhy)}</p>

      <h5><T en="Risk heatmap by clause" th="แผนความร้อนตามข้อสัญญา" /></h5>
      <div className="xray-heat">
        {XRAY.heatmap.map((h) => (
          <div key={h.cl} className="xray-heat-cell">
            <span className="mono">cl.{h.cl}</span>
            <strong>{L(s.lang, h.k)}</strong>
            <div className="bar-track"><div className="bar-fill" style={{ width: `${h.pct}%`, background: heatColor(h.sev) }} /></div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginTop: 28 }}>
        <div>
          <h5><T en="Missing clauses" th="ข้อที่ขาด" /></h5>
          {XRAY.missing.map((m) => (
            <div key={m.k.e} className="xray-row">
              <strong>{L(s.lang, m.k)}</strong>
              <span className="text-muted">{L(s.lang, m.src)}</span>
            </div>
          ))}
        </div>
        <div>
          <h5><T en="Unusual vs house standards" th="ผิดปกติเทียบมาตรฐานบ้าน" /></h5>
          {XRAY.unusual.map((m) => (
            <div key={m.k.e} className="xray-row">
              <strong>{L(s.lang, m.k)}</strong>
              <span>{L(s.lang, m.vs)}</span>
              <span className="text-muted">{L(s.lang, m.src)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 24 }}>
        <div>
          <h5><T en="Financial exposure" th="ความเสี่ยงทางการเงิน" /></h5>
          {XRAY.money.map((m) => (
            <div key={m.k.e} className="xray-kv"><span>{L(s.lang, m.k)}</span><strong>{typeof m.v === "string" ? m.v : L(s.lang, m.v)}</strong></div>
          ))}
        </div>
        <div>
          <h5><T en="Key dates → obligation calendar" th="วันที่สำคัญ → ปฏิทินข้อผูกพัน" /></h5>
          {XRAY.dates.map((m) => (
            <div key={m.k.e} className="xray-kv">
              <span>{L(s.lang, m.k)}</span>
              <strong>{typeof m.v === "string" ? m.v : L(s.lang, m.v)}</strong>
              <span className="text-muted" style={{ fontSize: 11 }}>{L(s.lang, m.src)}</span>
            </div>
          ))}
        </div>
      </div>

      <h5 style={{ marginTop: 24 }}><T en="Parties, guarantees, termination, payment" th="คู่สัญญา ค้ำประกัน สิทธิเลิก เงื่อนไขชำระ" /></h5>
      {XRAY.parties.map((m) => (
        <div key={m.k.e} className="xray-kv"><span>{L(s.lang, m.k)}</span><strong>{L(s.lang, m.v)}</strong></div>
      ))}

      <h5 style={{ marginTop: 24 }}><T en="Thai law and citations" th="กฎหมายไทยและแหล่งอ้างอิง" /></h5>
      {XRAY.laws.map((m) => (
        <div key={m.k.e} className="xray-kv"><span>{L(s.lang, m.k)}</span><span className="text-muted">{L(s.lang, m.src)}</span></div>
      ))}

      <h5 style={{ marginTop: 24 }}><T en="Fact · interpretation · action" th="ข้อเท็จจริง · การตีความ · การกระทำ" /></h5>
      <div className="grid-3">
        {XRAY.layers.map((m) => (
          <div key={m.k.e} className="xray-layer">
            <div className="page-kicker">{L(s.lang, m.k)}</div>
            <p>{L(s.lang, m.v)}</p>
          </div>
        ))}
      </div>

      <h5 style={{ marginTop: 24 }}><T en="Recommended redlines" th="redline ที่แนะนำ" /></h5>
      {XRAY.redlines.map((r) => (
        <div key={r.cl} className="xray-row"><span className="mono">cl.{r.cl}</span><span>{L(s.lang, r.text)}</span></div>
      ))}

      <h5 style={{ marginTop: 24 }}><T en="Negotiation fallback ladder" th="บันไดจุดยืนสำรอง" /></h5>
      <div className="grid-4 xray-ladder">
        {XRAY.ladder.map((r) => (
          <div key={r.n} className="xray-layer">
            <div className="page-kicker">{r.n} · {L(s.lang, r.k)}</div>
            <p>{L(s.lang, r.v)}</p>
          </div>
        ))}
      </div>

      <h5 style={{ marginTop: 24 }}><T en="One-page management brief" th="สรุปผู้บริหารหนึ่งหน้า" /></h5>
      <p style={{ maxWidth: "72ch" }}>{L(s.lang, XRAY.brief)}</p>
      <div className="stack-actions" style={{ marginTop: 10 }}>
        <button type="button" className="btn btn-secondary" onClick={() => { downloadText("LAW24-management-brief.txt", L(s.lang, XRAY.brief)); s.flash(th ? "ส่งออกสรุปแล้ว" : "Brief exported"); }}><T en="Export brief" th="ส่งออกสรุป" /></button>
        <button type="button" className="btn btn-secondary" onClick={() => { copyText(L(s.lang, XRAY.email)); s.flash(th ? "คัดลอกอีเมลคู่สัญญาแล้ว" : "Counterparty email copied"); }}><T en="Copy email to counterparty" th="คัดลอกอีเมลถึงคู่สัญญา" /></button>
        <Link href="/holistic?s=dna" className="btn btn-secondary"><T en="Clause DNA" th="Clause DNA" /></Link>
        <Link href="/negotiate?s=nladder" className="btn btn-secondary"><T en="Negotiation copilot" th="ผู้ช่วยเจรจา" /></Link>
      </div>

      <div className="xray-lawyer">
        <div>
          <strong><T en="Send to my lawyer" th="ส่งถึงทนายของฉัน" /></strong>
          <p className="text-muted" style={{ margin: "6px 0 0", fontSize: 13 }}>
            {s.lawyerSent
              ? <T en="Pack queued for 7L Advisory — the firm stays the trusted adviser. LAW24 stays behind the brand." th="ชุดถูกส่งเข้า 7L Advisory — สำนักงานยังเป็นที่ปรึกษาที่เชื่อถือได้ LAW24 อยู่หลังแบรนด์" />
              : <T en="No final redlines without professional review. Invite your firm, or a LAW24 founding firm." th="ไม่มี redline สุดท้ายโดยไม่มีทนายตรวจ เชิญสำนักงานของคุณ หรือสำนักงานก่อตั้ง LAW24" />}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={s.lawyerSent}
          onClick={() => { s.sendToLawyer(); s.flash(th ? "ส่งถึงทนายแล้ว — สำนักงานยังเป็นผู้ให้คำแนะนำ" : "Sent to counsel — the firm remains the adviser"); }}
        >
          {s.lawyerSent ? <T en="Sent" th="ส่งแล้ว" /> : <T en="Send to my lawyer" th="ส่งถึงทนายของฉัน" />}
        </button>
      </div>
    </div>
  );
}
