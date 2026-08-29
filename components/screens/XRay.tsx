"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Kicker, Title } from "@/components/ui";
import { Dropzone } from "@/components/Dropzone";
import { useStore } from "@/lib/store";
import { T } from "@/lib/i18n";
import { L } from "@/lib/model";
import { XRAY } from "@/lib/product";
import { copyText, downloadText } from "@/lib/demo";
import { AiLiveMark } from "@/components/AiLiveMark";
import { CONTRACT_ACCEPT } from "@/lib/ai/files";
import { XRAY_ENGINE_HOPS, XRAY_HOPS, XRAY_REVIEW_HOPS } from "@/lib/nav";
import { assignmentOf, clientOf, engagementOf, xrayContextOf } from "@/lib/firm";
import { withLiveMatter } from "@/lib/ai/fromMap";
import { EngPill } from "@/components/EngagementMark";

export function XRayScreen() {
  const s = useStore();
  const th = s.lang === "th";
  const [mapping, setMapping] = useState(false);
  const [drop, setDrop] = useState(0);
  const [clientName, setClientName] = useState("");
  const [engagementName, setEngagementName] = useState("");
  const firmContext = xrayContextOf(s.practice);
  const contextKey = firmContext ? `${firmContext.client.id}:${firmContext.assignment.id}` : "";
  const xrayKey = s.uploads.filter((u) => u.bucket === "xray").map((u) => `${u.name}:${u.size}`).join("|");
  const queued = Boolean(xrayKey);
  // Re-dropping the identical file leaves xrayKey unchanged, so the drop counter is what re-arms the run.
  const attemptKey = `${xrayKey}#${drop}`;
  const attempted = useRef<string | null>(null);

  useEffect(() => {
    if (!contextKey) {
      setMapping(false);
      return;
    }
    if (s.xrayReady) {
      setMapping(false);
      return;
    }
    if (!xrayKey || attempted.current === attemptKey) return;
    attempted.current = attemptKey;
    setMapping(true);
    void s.runXray().then((kind) => {
      if (kind === "live") {
        s.flash(th ? "แผนที่สัญญาเสร็จ — AI สด (ทนายเป็นผู้ยืนยัน)" : "Contract mapped — live AI (counsel confirms)");
      }
    }).finally(() => setMapping(false));
  }, [attemptKey, contextKey, xrayKey, s.xrayReady, s.runXray, s.flash, th]);

  function openFirmIntake(e: FormEvent) {
    e.preventDefault();
    if (!clientName.trim() || !engagementName.trim()) return;
    s.openXrayEngagement({ clientName, engagementName });
    s.flash(th ? "เปิดลูกค้าและงานตรวจแล้ว — พร้อมรับเอกสาร" : "Client and review engagement opened — ready for the document");
  }

  async function runDemo() {
    setMapping(true);
    await s.runXray({ demo: true });
    setMapping(false);
    s.flash(th ? "แผนที่สัญญาเสร็จ — คำตัดสิน: เจรจา" : "Contract mapped — verdict: Negotiate");
  }

  async function retryMap() {
    attempted.current = attemptKey;
    setMapping(true);
    try {
      const kind = await s.runXray();
      if (kind === "live") {
        s.flash(th ? "แผนที่สัญญาเสร็จ — AI สด (ทนายเป็นผู้ยืนยัน)" : "Contract mapped — live AI (counsel confirms)");
      }
    } finally {
      setMapping(false);
    }
  }

  if (!firmContext || !s.xrayReady || mapping) {
    return (
      <div className="pad-page">
        <Kicker>review · contract x-ray · <AiLiveMark compact /></Kicker>
        <Title><T en="Contract X-Ray" th="Contract X-Ray" /></Title>
        <p className="page-sub">
          <T
            en="Upload any Thai or English agreement. LAW24 produces a complete X-Ray in under three minutes — verdict, heatmap, missing clauses, Thai citations. Not a chat window."
            th="อัปโหลดสัญญาไทยหรืออังกฤษ ระบบทำ X-Ray ครบในไม่ถึงสามนาที — คำตัดสิน แผนความร้อน ข้อที่ขาด อ้างอิงกฎหมายไทย ไม่ใช่หน้าต่างแชต"
          />
        </p>
        {!firmContext ? (
          <form className="practice-form eng-card eng-review" style={{ marginTop: 20 }} onSubmit={openFirmIntake}>
            <div style={{ gridColumn: "1 / -1" }}>
              <div className="eng-pill eng-review"><T en="Firm-controlled intake" th="รับเรื่องภายใต้สำนักงาน" /></div>
              <h3 style={{ margin: "12px 0 6px", fontSize: 20 }}>
                <T en="Client and engagement required" th="ต้องระบุลูกค้าและงานก่อน" />
              </h3>
              <p className="text-muted" style={{ margin: 0, fontSize: 13, maxWidth: "70ch" }}>
                <T
                  en="Contract X-Ray cannot process a document outside a Firm workspace. Name the client and contract-review engagement first; the map, verdict and movement trail will stay under that record."
                  th="Contract X-Ray ไม่ประมวลผลเอกสารนอกพื้นที่งานสำนักงาน ระบุชื่อลูกค้าและงานตรวจสัญญาก่อน แผนที่ คำตัดสิน และเส้นทางจะอยู่ใต้บันทึกนี้"
                />
              </p>
            </div>
            <div className="field">
              <label><T en="Client name" th="ชื่อลูกค้า" /></label>
              <input
                className="input"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder={th ? "เช่น บริษัท นอร์ธวินด์ จำกัด" : "e.g. Northwind Ltd"}
                required
              />
            </div>
            <div className="field">
              <label><T en="Engagement name" th="ชื่องาน" /></label>
              <input
                className="input"
                value={engagementName}
                onChange={(e) => setEngagementName(e.target.value)}
                placeholder={th ? "เช่น ตรวจสัญญา SaaS MSA" : "e.g. SaaS MSA contract review"}
                required
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }} className="stack-actions">
              <button className="btn btn-primary" type="submit">
                <T en="Open engagement and continue" th="เปิดงานและดำเนินการต่อ" />
              </button>
              <Link href="/practice?s=clients" className="btn btn-secondary">
                <T en="Open Firm clients" th="เปิดบัญชีลูกค้า" />
              </Link>
            </div>
          </form>
        ) : mapping ? (
          <div className="xray-map">
            <div className="xray-scan" />
            <strong><T en="Mapping the contract…" th="กำลังวางแผนที่สัญญา…" /></strong>
            <p><T en="Scans can take up to two minutes. Leave this tab open." th="ไฟล์สแกนอาจใช้ถึงสองนาที อย่าปิดแท็บนี้" /></p>
          </div>
        ) : (
          <>
            <div className="xray-layer eng-card eng-review" style={{ marginBottom: 18 }}>
              <div className="page-kicker"><T en="Firm-controlled X-Ray" th="X-Ray ภายใต้สำนักงาน" /></div>
              <div style={{ marginTop: 8 }}><EngPill track="review" /></div>
              <strong style={{ display: "block", marginTop: 8 }}>
                {th ? firmContext.client.nameTh : firmContext.client.name}
              </strong>
              <p className="text-muted" style={{ margin: "5px 0 0", fontSize: 13 }}>
                {firmContext.assignment.id} · {th ? firmContext.assignment.titleTh : firmContext.assignment.title}
              </p>
              <div className="stack-actions" style={{ marginTop: 10 }}>
                <Link href="/practice?s=ereview" className="btn btn-secondary">
                  <T en="Review control" th="ควบคุมงานตรวจ" />
                </Link>
                <Link href="/practice?s=assign&eng=review" className="btn btn-ghost">
                  <T en="Change engagement" th="เปลี่ยนงาน" />
                </Link>
              </div>
            </div>
            {s.xrayError && (
              <div className="xray-fail">
                <strong><T en="The live X-Ray did not complete" th="X-Ray สดไม่สำเร็จ" /></strong>
                <p>{s.xrayError}</p>
                <p className="text-muted" style={{ fontSize: 12 }}>
                  <T
                    en="Nothing was mapped. Retry, or run the Nimbus sample — the sample is fixture data, not your document."
                    th="ยังไม่มีการวางแผนที่ ลองใหม่ หรือใช้ตัวอย่างนิมบัส — ตัวอย่างเป็นข้อมูลสมมติ ไม่ใช่เอกสารของคุณ"
                  />
                </p>
              </div>
            )}
            <Dropzone
              bucket="xray"
              accept={CONTRACT_ACCEPT}
              title={<T en="Drop a Thai or English agreement" th="ลากสัญญาไทยหรืออังกฤษมาวาง" />}
              hint={<T en="PDF or DOCX. Scanned PDFs are read with OCR. Facts, interpretations and suggested actions stay distinct." th="PDF หรือ DOCX สแกนแล้วระบบอ่านด้วย OCR ข้อเท็จจริง การตีความ และการกระทำที่แนะนำแยกกันชัด" />}
              multiple={false}
              onAfter={() => setDrop((n) => n + 1)}
            />
            <div className="stack-actions" style={{ marginTop: 16 }}>
              {queued && (
                <button type="button" className="btn btn-primary" onClick={retryMap}>
                  {s.xrayError
                    ? <T en="Retry live X-Ray" th="ลอง X-Ray สดอีกครั้ง" />
                    : <T en="Map uploaded contract" th="วางแผนที่สัญญาที่อัปโหลด" />}
                </button>
              )}
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

  const X = s.xrayLive ?? XRAY;
  const practice = withLiveMatter(s.practice, s.xrayLive, s.reviewLive);
  const matterA = s.xrayLive ? (assignmentOf(practice, practice.activeAssignmentId) || practice.assignments[0]) : undefined;
  const matterC = matterA ? clientOf(practice, matterA.clientId) : undefined;
  // Live review stages are minted after the map, so the board may still be in
  // flight. A fixture map is served by fixture cards, which are always there.
  const reviewReady = !s.xrayLive || Boolean(s.reviewLive?.findings?.length || s.reviewLive?.board?.length);
  const heatColor = (sev: string) => sev === "high" ? "var(--color-hot)" : sev === "med" ? "var(--color-warn)" : "var(--color-ok)";

  return (
    <div className="pad-page">
      <Kicker>review · contract x-ray · {X.mappedIn.e} <AiLiveMark compact /></Kicker>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <Title>{L(s.lang, X.doc)}</Title>
          <p className="page-sub">{X.ref} · {X.pages} {th ? "หน้า" : "pages"} · {L(s.lang, X.langs)}</p>
        </div>
        <div className="xray-verdict">
          <span className="page-kicker"><T en="Overall verdict" th="คำตัดสินรวม" /></span>
          <strong>{L(s.lang, X.verdictLabel)}</strong>
          <span className="text-muted" style={{ fontSize: 12 }}><T en="Accept / Negotiate / Do Not Sign" th="ยอมรับ / เจรจา / ห้ามลงนาม" /></span>
        </div>
      </div>
      <p style={{ maxWidth: "72ch", margin: "0 0 22px" }}>{L(s.lang, X.verdictWhy)}</p>

      {s.xrayLive && (matterC || matterA) && (
        <div className="xray-layer eng-card eng-review" style={{ marginBottom: 22 }}>
          <div className="page-kicker"><T en="Firm client · assignment" th="ลูกค้า · งานในสำนักงาน" /></div>
          <div style={{ marginTop: 8 }}><EngPill track={matterA ? engagementOf(matterA.type) : "review"} /></div>
          <div style={{ font: "800 18px/1.25 var(--font-heading)", marginTop: 8 }}>
            {matterC ? (th ? matterC.nameTh : matterC.name) : (th ? "ลูกค้าจากแผนที่" : "Mapped client")}
          </div>
          <p className="text-muted" style={{ margin: "6px 0 0", fontSize: 13 }}>
            {matterA
              ? `${matterA.id} · ${th ? matterA.titleTh : matterA.title}${matterA.ref ? ` · ${matterA.ref}` : ""}`
              : X.ref}
          </p>
          <div className="stack-actions" style={{ marginTop: 12 }}>
            <Link href="/practice?s=dash" className="btn btn-primary"><T en="Firm control" th="ศูนย์ควบคุมสำนักงาน" /></Link>
            <Link href="/practice?s=clients" className="btn btn-secondary"><T en="Clients" th="ลูกค้า" /></Link>
            <Link href="/practice?s=assign" className="btn btn-secondary"><T en="Assignments" th="งาน" /></Link>
            <Link href="/practice?s=trace" className="btn btn-secondary"><T en="Trail" th="เส้นทาง" /></Link>
          </div>
        </div>
      )}

      <h5><T en="Open the rest of the OS" th="เปิดโมดูลถัดไปของระบบ" /></h5>
      <p className="text-muted" style={{ margin: "6px 0 12px", fontSize: 13, maxWidth: "72ch" }}>
        <T
          en="The map is the entry, not the end. Cockpit, Twin, Deal X-Ray, Copilot and Obligations take this document into the rest of the engine."
          th="แผนที่เป็นทางเข้า ไม่ใช่จุดจบ ห้องบังคับ ฝาแฝด Deal X-Ray เจรจา และข้อผูกพันพาเอกสารนี้เข้าโมดูลอื่นของเครื่องยนต์"
        />
      </p>
      <div className="home-cards" style={{ marginBottom: 22 }}>
        {XRAY_HOPS.map((h) => (
          <Link key={h.href} href={h.href} className="home-card" style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ fontWeight: 800 }}>{th ? h.th : h.en}</div>
            <div className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>{th ? h.why.t : h.why.e}</div>
          </Link>
        ))}
      </div>

      <Dropzone
        bucket="xray"
        compact
        accept={CONTRACT_ACCEPT}
        title={<T en="Map another PDF or DOCX" th="วางแผนที่ PDF หรือ DOCX อีกฉบับ" />}
        hint={<T en="Replaces this map. Scanned PDFs are read with OCR. Live AI when the badge says Live; otherwise the Nimbus fixture." th="แทนที่แผนที่นี้ PDF สแกนอ่านด้วย OCR AI สดเมื่อป้ายบอกสด ไม่เช่นนั้นใช้ข้อมูลนิมบัส" />}
        multiple={false}
        onAfter={() => { setDrop((n) => n + 1); s.clearXray(); }}
      />
      <div className="stack-actions" style={{ margin: "10px 0 22px" }}>
        <button type="button" className="btn btn-ghost" onClick={runDemo}>
          <T en="Run Nimbus sample instead" th="ใช้ตัวอย่างนิมบัสแทน" />
        </button>
      </div>

      <h5><T en="Risk heatmap by clause" th="แผนความร้อนตามข้อสัญญา" /></h5>
      <div className="xray-heat">
        {X.heatmap.map((h) => (
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
          {X.missing.map((m) => (
            <div key={m.k.e} className="xray-row">
              <strong>{L(s.lang, m.k)}</strong>
              <span className="text-muted">{L(s.lang, m.src)}</span>
            </div>
          ))}
        </div>
        <div>
          <h5><T en="Unusual vs house standards" th="ผิดปกติเทียบมาตรฐานบ้าน" /></h5>
          {X.unusual.map((m) => (
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
          {X.money.map((m) => (
            <div key={m.k.e} className="xray-kv"><span>{L(s.lang, m.k)}</span><strong>{typeof m.v === "string" ? m.v : L(s.lang, m.v)}</strong></div>
          ))}
        </div>
        <div>
          <h5>
            <Link href="/obligations?s=ocal" style={{ color: "inherit" }}>
              <T en="Key dates → obligation calendar" th="วันที่สำคัญ → ปฏิทินข้อผูกพัน" />
            </Link>
          </h5>
          {X.dates.map((m) => (
            <div key={m.k.e} className="xray-kv">
              <span>{L(s.lang, m.k)}</span>
              <strong>{typeof m.v === "string" ? m.v : L(s.lang, m.v)}</strong>
              <span className="text-muted" style={{ fontSize: 11 }}>{L(s.lang, m.src)}</span>
            </div>
          ))}
        </div>
      </div>

      <h5 style={{ marginTop: 24 }}><T en="Parties, guarantees, termination, payment" th="คู่สัญญา ค้ำประกัน สิทธิเลิก เงื่อนไขชำระ" /></h5>
      {X.parties.map((m) => (
        <div key={m.k.e} className="xray-kv"><span>{L(s.lang, m.k)}</span><strong>{L(s.lang, m.v)}</strong></div>
      ))}

      <h5 style={{ marginTop: 24 }}><T en="Thai law and citations" th="กฎหมายไทยและแหล่งอ้างอิง" /></h5>
      {X.laws.map((m) => (
        <div key={m.k.e} className="xray-kv"><span>{L(s.lang, m.k)}</span><span className="text-muted">{L(s.lang, m.src)}</span></div>
      ))}

      <h5 style={{ marginTop: 24 }}><T en="Fact · interpretation · action" th="ข้อเท็จจริง · การตีความ · การกระทำ" /></h5>
      <div className="grid-3">
        {X.layers.map((m) => (
          <div key={m.k.e} className="xray-layer">
            <div className="page-kicker">{L(s.lang, m.k)}</div>
            <p>{L(s.lang, m.v)}</p>
          </div>
        ))}
      </div>

      <h5 style={{ marginTop: 24 }}><T en="Recommended redlines" th="redline ที่แนะนำ" /></h5>
      {X.redlines.map((r) => (
        <div key={r.cl} className="xray-row"><span className="mono">cl.{r.cl}</span><span>{L(s.lang, r.text)}</span></div>
      ))}

      <h5 style={{ marginTop: 24 }}><T en="Negotiation fallback ladder" th="บันไดจุดยืนสำรอง" /></h5>
      <div className="grid-4 xray-ladder">
        {X.ladder.map((r) => (
          <div key={r.n} className="xray-layer">
            <div className="page-kicker">{r.n} · {L(s.lang, r.k)}</div>
            <p>{L(s.lang, r.v)}</p>
          </div>
        ))}
      </div>

      <h5 style={{ marginTop: 24 }}><T en="One-page management brief" th="สรุปผู้บริหารหนึ่งหน้า" /></h5>
      <p style={{ maxWidth: "72ch" }}>{L(s.lang, X.brief)}</p>
      <div className="stack-actions" style={{ marginTop: 10 }}>
        <button type="button" className="btn btn-secondary" onClick={() => { downloadText("LAW24-management-brief.txt", L(s.lang, X.brief)); s.flash(th ? "ส่งออกสรุปแล้ว" : "Brief exported"); }}><T en="Export brief" th="ส่งออกสรุป" /></button>
        <button type="button" className="btn btn-secondary" onClick={() => { copyText(L(s.lang, X.email)); s.flash(th ? "คัดลอกอีเมลคู่สัญญาแล้ว" : "Counterparty email copied"); }}><T en="Copy email to counterparty" th="คัดลอกอีเมลถึงคู่สัญญา" /></button>
        <Link href="/holistic?s=dna" className="btn btn-secondary"><T en="Clause DNA" th="Clause DNA" /></Link>
      </div>

      <h5 style={{ marginTop: 24 }}><T en="Continue the review" th="ตรวจต่อ" /></h5>
      <p className="text-muted" style={{ margin: "6px 0 0", fontSize: 13, maxWidth: "72ch" }}>
        {reviewReady
          ? <T
              en="Every X-Ray screen below is this document — setup, key terms, findings, playbook, redline, board and what changed."
              th="ทุกหน้าใน X-Ray ด้านล่างคือเอกสารนี้ — ตั้งค่า ข้อกำหนด ข้อค้นพบ เพลย์บุ๊ก redline คณะทบทวน และสิ่งที่เปลี่ยน"
            />
          : <T
              en="Issue cards and the board are still being written for this document. The map above stands on its own."
              th="กำลังเขียนบัตรประเด็นและคณะทบทวนสำหรับเอกสารนี้ แผนที่ด้านบนใช้ได้ด้วยตัวเอง"
            />}
      </p>
      <div className="stack-actions" style={{ marginTop: 10 }}>
        {XRAY_REVIEW_HOPS.map((h, i) => (
          <Link key={h.href} href={h.href} className={i === 2 ? "btn btn-primary" : "btn btn-secondary"}>
            {th ? h.th : h.en}
          </Link>
        ))}
      </div>
      <div className="stack-actions" style={{ marginTop: 10 }}>
        {XRAY_HOPS.map((h) => (
          <Link key={h.href} href={h.href} className="btn btn-secondary">{th ? h.th : h.en}</Link>
        ))}
      </div>
      <h5 style={{ marginTop: 22 }}><T en="Every submenu on those modules" th="ทุกเมนูย่อยในโมดูลเหล่านั้น" /></h5>
      <p className="text-muted" style={{ margin: "6px 0 0", fontSize: 13, maxWidth: "72ch" }}>
        <T
          en="Firm, Cockpit, Twin, Deal X-Ray, Copilot and Obligations now read this map — not the Nimbus sample."
          th="สำนักงาน ห้องบังคับ ฝาแฝด Deal X-Ray เจรจา และข้อผูกพันอ่านแผนที่นี้ — ไม่ใช่ตัวอย่างนิมบัส"
        />
      </p>
      <div className="stack-actions" style={{ marginTop: 10 }}>
        {XRAY_ENGINE_HOPS.map((h) => (
          <Link key={h.href} href={h.href} className="btn btn-ghost" style={{ fontSize: 12 }}>{th ? h.th : h.en}</Link>
        ))}
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
