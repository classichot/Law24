"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { CAT_MAP, FX, TAX_CATS, TAX_ENUMS, TAX_LIST, TAX_SOURCES, TAX_TOTALS, esignShort, trClauses, trFormality, trNote, trParties } from "@/lib/taxonomy";
import { Chip, Kicker, Title } from "@/components/ui";
import { L } from "@/lib/model";
import { BILINGUAL } from "@/lib/wow";
import { T } from "@/lib/i18n";
import { DEMO_TYPE_ID } from "@/lib/demo";
import { downloadAssemblePack } from "@/lib/pack";
import { Dropzone } from "@/components/Dropzone";
import { StandardClause } from "@/components/StandardClause";
import { houseStandard } from "@/lib/clauses";
import { acceptedAssemblyInputs, assemblyInputsOf } from "@/lib/assembly";

function pinDemo(rows: typeof TAX_LIST, sel: string) {
  const pinned = rows.find((r) => r.id === sel) || rows.find((r) => r.id === DEMO_TYPE_ID);
  if (!pinned) return rows;
  return [pinned, ...rows.filter((r) => r.id !== pinned.id)];
}

export function AssembleScreen({ screen }: { screen: string }) {
  if (screen === "intake") return <ReviewIntake />;
  if (screen === "lib") return <Library />;
  if (screen === "type") return <TypeDetail />;
  if (screen === "iv") return <Interview />;
  if (screen === "asm") return <Assembly />;
  if (screen === "draft") return <Draft />;
  if (screen === "areview") return <ReviewReady />;
  if (screen === "bilingual") return <Bilingual />;
  return <Library />;
}

function ReviewIntake() {
  const s = useStore();
  const th = s.lang === "th";
  const rows = assemblyInputsOf(s.xrayLive, s.reviewLive);
  const imported = acceptedAssemblyInputs(s.assembly);
  const [selected, setSelected] = useState<string[]>(
    imported.length ? imported.map((x) => x.id) : rows.map((x) => x.id),
  );
  const chosen = rows.filter((x) => selected.includes(x.id));

  return (
    <div className="pad-page">
      <Kicker>assemble · review intake</Kicker>
      <Title><T en="Ingest Review before drafting" th="รับข้อมูลจาก Review ก่อนร่าง" /></Title>
      <p className="page-sub">
        <T
          en="Bring facts, findings, missing items and approved redline instructions into Assembly with their sources. Review evidence becomes drafting control — not copied prose."
          th="นำข้อเท็จจริง ข้อค้นพบ รายการที่ขาด และคำสั่ง redline ที่อนุมัติแล้วเข้า Assembly พร้อมแหล่ง Review กลายเป็นตัวควบคุมการร่าง ไม่ใช่ข้อความคัดลอก"
        />
      </p>

      {s.xrayLive ? (
        <>
          <div className="callout eng-card eng-draft" style={{ margin: "18px 0" }}>
            <strong>{s.xrayLive.ref} · {L(s.lang, s.xrayLive.doc)}</strong>
            <p className="text-muted" style={{ margin: "6px 0 0" }}>
              {rows.length} <T en="source-backed inputs available" th="รายการชี้แหล่งพร้อมรับเข้า" />
              {s.reviewLive ? ` · ${s.reviewLive.findings.length} ${th ? "ข้อค้นพบจากคณะตรวจ" : "Review findings"}` : ""}
            </p>
          </div>
          <div className="assemble-intake-list">
            {rows.map((r) => (
              <label key={r.id} className="assemble-intake-row">
                <input
                  type="checkbox"
                  checked={selected.includes(r.id)}
                  onChange={() => setSelected((v) => v.includes(r.id) ? v.filter((id) => id !== r.id) : [...v, r.id])}
                />
                <span>
                  <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span className="mono">{r.id}</span>
                    <span className={r.priority === "must" ? "tag tag-accent" : "tag tag-neutral"}>{r.priority}</span>
                    <span className="tag tag-outline">{r.kind}</span>
                  </span>
                  <strong style={{ display: "block", marginTop: 8 }}>{L(s.lang, r.title)}</strong>
                  <span style={{ display: "block", marginTop: 5 }}>{L(s.lang, r.value)}</span>
                  <span className="text-muted" style={{ display: "block", marginTop: 6, fontSize: 12 }}>
                    <T en="Source" th="แหล่ง" /> · {L(s.lang, r.source)}
                  </span>
                </span>
                <Link href={r.href} onClick={(e) => e.stopPropagation()}><T en="Open evidence" th="เปิดหลักฐาน" /> →</Link>
              </label>
            ))}
          </div>
          <div className="stack-actions" style={{ marginTop: 18 }}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!chosen.length}
              onClick={() => {
                s.ingestReviewToAssembly(chosen, s.xrayLive!.ref);
                s.flash(th ? `รับเข้า ${chosen.length} รายการแล้ว — พร้อมเลือกประเภท` : `${chosen.length} inputs ingested — ready to select a type`);
              }}
            >
              <T en="Ingest selected into Assembly" th="รับรายการที่เลือกเข้า Assembly" />
            </button>
            <Link href="/assemble?s=lib" className="btn btn-secondary"><T en="Continue to contract type" th="ไปเลือกประเภทสัญญา" /></Link>
          </div>
        </>
      ) : (
        <div className="callout" style={{ margin: "18px 0" }}>
          <strong><T en="No Review map is connected" th="ยังไม่มีแผนที่ Review ที่เชื่อมอยู่" /></strong>
          <p><T en="Map the source agreement in Contract Review, or attach a term sheet and source papers below." th="วางแผนที่สัญญาต้นทางใน Contract Review หรือแนบ term sheet และเอกสารต้นทางด้านล่าง" /></p>
          <div className="stack-actions">
            <Link href="/review?s=xray" className="btn btn-primary"><T en="Open Contract Review" th="เปิด Contract Review" /></Link>
          </div>
        </div>
      )}
      <Dropzone
        bucket="assemble"
        title={<T en="Attach term sheet, instructions or source papers" th="แนบ term sheet คำสั่ง หรือเอกสารต้นทาง" />}
        hint={<T en="These supplement Review; they do not replace source-backed findings." th="เอกสารเหล่านี้เสริม Review ไม่แทนข้อค้นพบที่ชี้แหล่ง" />}
      />
    </div>
  );
}

function Library() {
  const s = useStore();
  const router = useRouter();
  const th = s.lang === "th";
  let rows = TAX_LIST;
  if (s.cat) rows = rows.filter((r) => r.cat === s.cat);
  if (s.risk) rows = rows.filter((r) => r.risk === s.risk);
  if (s.prio) rows = rows.filter((r) => r.priority.indexOf(s.prio) === 0);
  if (s.esign) rows = rows.filter((r) => r.esign === s.esign);
  if (s.q) {
    const q = s.q.toLowerCase();
    rows = rows.filter((r) => (r.id + " " + r.nameTh + " " + r.nameEn + " " + r.tags).toLowerCase().includes(q));
  }
  const shown = pinDemo(rows.slice(0, 200), s.sel);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "264px 1fr", alignItems: "start" }}>
      <aside style={{ borderRight: "2px solid var(--color-divider)", padding: 22, display: "flex", flexDirection: "column", gap: 20, minHeight: "calc(100vh - 160px)" }}>
        <div>
          <div className="page-kicker" style={{ marginBottom: 9 }}><T en="Search" th="ค้นหา" /></div>
          <input className="input" value={s.q} onChange={(e) => s.setQ(e.target.value)} placeholder={th ? "ชื่อสัญญา หรือรหัส CT-…" : "Contract name or CT-…"} />
        </div>
        <div>
          <div className="page-kicker" style={{ marginBottom: 9 }}><T en="Main category" th="หมวดหลัก" /></div>
          <select className="input" value={s.cat} onChange={(e) => s.setCat(e.target.value)}>
            <option value="">{th ? "ทุกหมวด (25)" : "All categories (25)"}</option>
            {TAX_CATS.map((c) => <option key={c.code} value={c.code}>{c.code} · {th ? c.th : c.en}</option>)}
          </select>
        </div>
        <div>
          <div className="page-kicker" style={{ marginBottom: 9 }}><T en="Risk level" th="ระดับความเสี่ยง" /></div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {Object.keys(TAX_ENUMS.risk).map((r) => (
              <Chip key={r} active={s.risk === r} on={() => s.setRisk(s.risk === r ? "" : r)}>{th ? r : TAX_ENUMS.risk[r]}</Chip>
            ))}
          </div>
        </div>
        <div>
          <div className="page-kicker" style={{ marginBottom: 9 }}><T en="Build priority" th="ลำดับพัฒนา" /></div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {["P1", "P2", "P3"].map((p) => <Chip key={p} active={s.prio === p} on={() => s.setPrio(s.prio === p ? "" : p)}>{p}</Chip>)}
          </div>
        </div>
        <div>
          <div className="page-kicker" style={{ marginBottom: 9 }}><T en="e-Sign fitness" th="ความเหมาะสม e-Sign" /></div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {Object.keys(TAX_ENUMS.esign).map((e) => (
              <Chip key={e} active={s.esign === e} on={() => s.setEsign(s.esign === e ? "" : e)}>{esignShort(s.lang, e)}</Chip>
            ))}
          </div>
        </div>
        <button type="button" className="btn btn-secondary" onClick={s.resetFilters}><T en="Clear filters" th="ล้างตัวกรอง" /></button>
      </aside>
      <div className="pad-page">
        {s.demoOn && (
          <div className="callout" style={{ marginBottom: 16 }}>
            <T en="Live matter: Nimbus Cloud uses type CT-284 (SaaS). The counterparty paper you will review is CT-291." th="เรื่องสด: Nimbus Cloud ใช้ประเภท CT-284 (SaaS) ฉบับคู่สัญญาที่จะตรวจคือ CT-291" />
          </div>
        )}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 18, borderBottom: "2px solid var(--color-divider)", paddingBottom: 14, marginBottom: 8, flexWrap: "wrap" }}>
          <div>
            <Kicker>assemble · template library</Kicker>
            <Title><T en="Thai contract library — 500 types" th="คลังสัญญาไทย 500 ประเภท" /></Title>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 26 }}>
            {[{ v: String(TAX_TOTALS.types), k: th ? "ประเภทสัญญา" : "contract types" }, { v: String(TAX_TOTALS.cats), k: th ? "หมวดหลัก" : "main categories" }, { v: String(TAX_TOTALS.p1), k: "P1 core (MVP)" }, { v: String(TAX_TOTALS.hi), k: th ? "ความเสี่ยงสูง" : "high risk" }].map((st) => (
              <div key={st.k}><div style={{ font: "800 22px/1 var(--font-heading)" }}>{st.v}</div><div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-600)", marginTop: 4 }}>{st.k}</div></div>
            ))}
          </div>
        </div>
        <Dropzone
          bucket="assemble"
          compact
          title={<T en="Drop a draft, term sheet or source paper" th="ลากร่าง ข้อเสนอ หรือเอกสารต้นทางมาวาง" />}
          hint={<T en="PDF or DOCX. LAW24 will map it to a type in this library. Nothing is signed." th="PDF หรือ DOCX ระบบจะจับคู่ประเภทในคลังนี้ ไม่มีการลงนามแทน" />}
        />
        <div style={{ fontSize: 12, color: "var(--color-neutral-600)", padding: "10px 0" }}>
          {th ? `แสดง ${shown.length} จาก ${TAX_LIST.length} ประเภท` : `Showing ${shown.length} of ${TAX_LIST.length} types`}
        </div>
        {shown.length === 0 && (
          <div className="callout" style={{ marginBottom: 16 }}>
            <T en="No types match these filters." th="ไม่มีประเภทที่ตรงตัวกรองนี้" />
            <div className="stack-actions" style={{ marginTop: 10 }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => { s.resetFilters(); s.setQ("SaaS"); s.setCat("C15"); s.setSel(DEMO_TYPE_ID); s.flash(th ? "เปิด CT-284 นิมบัสแล้ว" : "Opened CT-284 Nimbus"); }}
              >
                <T en="Run demo on Nimbus (CT-284)" th="ทดลองกับนิมบัส (CT-284)" />
              </button>
            </div>
          </div>
        )}
        <div style={{ maxHeight: "calc(100vh - 280px)", overflow: "auto", borderTop: "2px solid var(--color-divider)" }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th><T en="Contract" th="ชื่อสัญญา" /></th>
                <th><T en="Category" th="หมวด" /></th>
                <th><T en="Legal status" th="สถานะทางกฎหมาย" /></th>
                <th><T en="Risk" th="ความเสี่ยง" /></th>
                <th>P</th>
                <th>e-Sign</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className="clickable" style={{ background: s.sel === r.id ? "var(--color-accent-100)" : undefined }} onClick={() => { s.setSel(r.id); router.push("/assemble?s=type"); }}>
                  <td className="mono" style={{ fontWeight: 700 }}>{r.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{th ? r.nameTh : r.nameEn}</div>
                    <div style={{ fontSize: 11, color: "var(--color-neutral-600)" }}>{th ? r.nameEn : r.nameTh}</div>
                  </td>
                  <td style={{ fontSize: 12 }}>{r.cat} · {(th ? CAT_MAP[r.cat]?.th : CAT_MAP[r.cat]?.en)?.slice(0, 26)}</td>
                  <td style={{ fontSize: 11 }}>{th ? r.status : TAX_ENUMS.status[r.status]}</td>
                  <td><span className={r.risk === "สูง" || r.risk === "สูงมาก" ? "tag tag-accent" : "tag tag-neutral"}>{th ? r.risk : TAX_ENUMS.risk[r.risk]}</span></td>
                  <td>{r.priority.slice(0, 2)}</td>
                  <td style={{ fontSize: 11 }}>{esignShort(s.lang, r.esign)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-muted" style={{ fontSize: 12, marginTop: 16 }}>
          <T en="This taxonomy is a product map, not legal advice. A lawyer must verify each template and its sector rules before release." th="Taxonomy นี้เป็นแผนผังผลิตภัณฑ์ ไม่ใช่คำวินิจฉัยทางกฎหมาย ต้องให้ทนายตรวจแม่แบบและกฎหมายเฉพาะก่อนเผยแพร่" />
        </p>
      </div>
    </div>
  );
}

function TypeDetail() {
  const s = useStore();
  const th = s.lang === "th";
  const c = TAX_LIST.find((r) => r.id === s.sel) || TAX_LIST[0];
  const srcIds = (c.sources || "").split(";").filter(Boolean);
  const clauses = trClauses(s.lang, c.keyTerms).split(";").map((x) => x.trim());
  return (
    <div className="pad-page" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 32 }}>
      <div>
        <Kicker>{c.id} · {c.cat}</Kicker>
        <Title>{th ? c.nameTh : c.nameEn}</Title>
        <div className="page-sub" style={{ marginBottom: 20 }}>{th ? c.nameEn : c.nameTh}</div>
        <p>{c.purpose}</p>
        <h5><T en="Principal parties" th="คู่สัญญาหลัก" /></h5>
        <p>{trParties(s.lang, c.parties)}</p>
        <h5><T en="Minimum clause set" th="ชุดข้อกำหนดขั้นต่ำ" /></h5>
        <p className="text-muted" style={{ fontSize: 13, margin: "0 0 8px" }}>
          <T
            en="These are the house standard clauses for this type. Adjust each one manually, or ask Leio for a playbook-backed proposal. Counsel applies."
            th="นี่คือข้อมาตรฐานบ้านของประเภทนี้ ปรับทีละข้อด้วยมือ หรือให้เลโอเสนอเทียบเพลย์บุ๊ก ทนายเป็นผู้ใช้ข้อ"
          />
        </p>
        {clauses.filter(Boolean).map((k) => (
          <StandardClause key={k} id={`${c.id}:${k}`} kicker={k} original={houseStandard(k)} />
        ))}
        <h5><T en="Statutory form" th="รูปแบบและพิธีการ" /></h5>
        <p>{trFormality(s.lang, c.formality)}</p>
        <h5><T en="Legal basis" th="ฐานกฎหมาย" /></h5>
        <p>{c.legalBasis}</p>
        <p className="text-muted">{trNote(s.lang, c.templateNote)}</p>
        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          <Link href="/assemble?s=iv" className="btn btn-primary"><T en="Start guided interview" th="เริ่มสัมภาษณ์นำทาง" /></Link>
          <Link href="/review?s=rsetup" className="btn btn-secondary"><T en="Review an existing contract" th="ส่งไปตรวจสัญญาที่มีอยู่" /></Link>
        </div>
        {c.id === DEMO_TYPE_ID && (
          <p className="text-muted" style={{ marginTop: 16, fontSize: 13 }}>
            <T en="This type maps to the live Nimbus matter. The paper under review is CT-291, counterparty draft, THB 24.6M." th="ประเภทนี้ผูกกับเรื่อง Nimbus ที่สาธิต ฉบับที่กำลังตรวจคือ CT-291 ร่างคู่สัญญา มูลค่า ฿24.6 ล้าน" />
          </p>
        )}
        <div style={{ marginTop: 20 }}>
          <Dropzone
            bucket="assemble"
            compact
            title={<T en="Attach intake papers" th="แนบเอกสารนำเข้า" />}
            hint={<T en="SOW, RFQ, emails, or an existing draft of this type." th="SOW, RFQ, อีเมล หรือร่างที่มีอยู่ของประเภทนี้" />}
          />
        </div>
      </div>
      <aside>
        <div className="panel">
          <div className="panel-head"><h5 style={{ margin: 0 }}><T en="Template metadata" th="ข้อมูลแม่แบบ" /></h5></div>
          <div className="panel-body">
            {[
              [th ? "รหัสถาวร" : "Permanent id", c.id],
              [th ? "สถานะทางกฎหมาย" : "Legal status", th ? c.status : TAX_ENUMS.status[c.status]],
              [th ? "ลำดับพัฒนา" : "Build priority", c.priority],
              ["Phase", CAT_MAP[c.cat]?.phase],
              [th ? "เขตอำนาจ" : "Jurisdiction", "Thailand (TH)"],
              [th ? "ความเสี่ยง" : "Risk", th ? c.risk : TAX_ENUMS.risk[c.risk]],
            ].map(([k, v]) => (
              <div key={String(k)} style={{ padding: "8px 0", borderBottom: "1px solid var(--color-divider)" }}>
                <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>{k}</div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>{v}</div>
              </div>
            ))}
            <h6 style={{ marginTop: 16 }}><T en="Legal sources" th="แหล่งอ้างอิงทางกฎหมาย" /></h6>
            {srcIds.map((id) => {
              const f = TAX_SOURCES.find((x) => x.id === id);
              return <div key={id} className="tag tag-outline" style={{ margin: "4px 4px 0 0" }}>{id} {f?.name}</div>;
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}

function Interview() {
  const s = useStore();
  const th = s.lang === "th";
  const IV = FX.interview;
  return (
    <div className="pad-page">
      <Kicker>assemble · guided interview</Kicker>
      <Title><T en="Guided interview & rules fired" th="สัมภาษณ์นำทางและกฎที่ทำงาน" /></Title>
      <div style={{ display: "flex", gap: 8, margin: "18px 0 24px", flexWrap: "wrap" }}>
        {IV.steps.map((st, i) => (
          <span key={i} style={{ padding: "8px 12px", background: i === 1 ? "var(--color-text)" : "var(--color-surface)", color: i === 1 ? "var(--color-bg)" : "inherit", fontWeight: 700, fontSize: 12 }}>0{i + 1} · {L(s.lang, st)}</span>
        ))}
      </div>
      <div className="grid-split">
        <div>
          {IV.qs.map((q, i) => (
            <div key={i} className="clause-block">
              <div style={{ fontWeight: 700 }}>{L(s.lang, q.q)}</div>
              <div style={{ marginTop: 6 }}>{L(s.lang, q.a)}</div>
              <div className="tag tag-accent" style={{ marginTop: 8 }}><T en="Rule fired" th="กฎที่ทำงาน" /> · {L(s.lang, q.rule)}</div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            <button
              type="button"
              className={`btn ${s.interviewDone ? "btn-secondary" : "btn-primary"}`}
              onClick={() => { s.confirmInterview(); s.flash(th ? "ยืนยันคำตอบแล้ว — กฎถูกบันทึก" : "Answers confirmed — rules locked"); }}
            >
              {s.interviewDone ? <T en="Answers confirmed" th="ยืนยันคำตอบแล้ว" /> : <T en="Confirm fixture answers" th="ยืนยันคำตอบจากข้อมูลจริง" />}
            </button>
            <Link href="/assemble?s=asm" className="btn btn-primary"><T en="Continue to assembly" th="ไปประกอบข้อสัญญา" /></Link>
          </div>
        </div>
        <div>
          <h5><T en="Resolved clause modules" th="โมดูลข้อสัญญาที่ถูกเลือก" /></h5>
          {IV.modules.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--color-divider)" }}>
              <span className={m.s === "in" ? "tag tag-accent" : m.s === "conflict" ? "tag tag-outline" : "tag tag-neutral"}>
                {m.s === "in" ? (th ? "รวม" : "Included") : m.s === "out" ? (th ? "ไม่รวม" : "Excluded") : (th ? "ขัดกัน" : "Conflict")}
              </span>
              <div>
                <div style={{ fontWeight: 700 }}>{L(s.lang, m.k)}</div>
                <div className="text-muted" style={{ fontSize: 12 }}>{L(s.lang, m.w)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Assembly() {
  const s = useStore();
  const router = useRouter();
  const th = s.lang === "th";
  const IV = FX.interview;
  return (
    <div className="pad-page">
      <Kicker>assemble · clause engine</Kicker>
      <Title><T en="Rule-driven clause assembly" th="ประกอบข้อสัญญาจากกฎ" /></Title>
      <p className="page-sub"><T en="Every module traces to an interview answer and the governing playbook. Adjust a standard clause only with a recorded reason." th="ทุกโมดูลผูกกับคำตอบในแบบสัมภาษณ์และ playbook ที่บังคับใช้ การปรับข้อมาตรฐานต้องมีเหตุในบันทึก" /></p>
      <div className="callout" style={{ margin: "18px 0" }}>
        <strong><T en="1 conflict needs a decision" th="ต้องตัดสินใจ 1 ข้อขัดกัน" /></strong>
        <p style={{ margin: "8px 0 12px" }}><T en="The foreign-arbitration module conflicts with the company Thai-law policy." th="โมดูลอนุญาโตตุลาการต่างประเทศขัดกับนโยบายกฎหมายไทยของบริษัท" /></p>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={`btn ${s.conflictChoice === "thai" ? "btn-primary" : "btn-secondary"}`} onClick={() => { s.setConflictChoice("thai"); s.flash(th ? "ใช้กฎหมายไทย" : "Thai law selected"); }}><T en="Keep Thai law (policy)" th="ใช้กฎหมายไทย (นโยบาย)" /></button>
          <button className={`btn ${s.conflictChoice === "waiver" ? "btn-primary" : "btn-secondary"}`} onClick={() => { s.setConflictChoice("waiver"); s.flash(th ? "ขออนุมัติยกเว้น" : "Waiver requested"); }}><T en="Request a policy waiver" th="ขออนุมัติยกเว้น" /></button>
        </div>
      </div>
      <table className="table">
        <thead><tr><th>#</th><th><T en="Clause module" th="โมดูลข้อสัญญา" /></th><th><T en="Trigger" th="เงื่อนไข" /></th><th><T en="State" th="สถานะ" /></th></tr></thead>
        <tbody>
          {IV.modules.map((m, i) => (
            <tr key={i}>
              <td>{String(i + 1).padStart(2, "0")}</td>
              <td style={{ fontWeight: 700 }}>{L(s.lang, m.k)}</td>
              <td>{L(s.lang, m.w)}</td>
              <td>
                <span className={m.s === "in" ? "tag tag-accent" : m.s === "conflict" ? "tag tag-outline" : "tag tag-neutral"}>
                  {m.s === "conflict" && s.conflictChoice
                    ? (s.conflictChoice === "thai" ? (th ? "ใช้กฎหมายไทย" : "Thai law") : (th ? "ขอยกเว้น" : "Waiver"))
                    : m.s}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        className="btn btn-primary"
        style={{ marginTop: 20 }}
        onClick={() => {
          if (!s.conflictChoice) {
            s.flash(th ? "ตัดสินข้อขัดกันก่อนสร้างเอกสาร" : "Resolve the conflict before generating");
            return;
          }
          router.push("/assemble?s=draft");
        }}
      >
        <T en="Generate DOCX + PDF" th="สร้างเอกสาร DOCX + PDF" />
      </button>
    </div>
  );
}

function Draft() {
  const s = useStore();
  const th = s.lang === "th";
  const draft = FX.interview.draft;
  const inputs = acceptedAssemblyInputs(s.assembly);
  return (
    <div className="pad-page grid-split">
      <div>
        <Kicker>assemble · draft</Kicker>
        <Title><T en="Assembled draft" th="ร่างสัญญาที่ประกอบแล้ว" /></Title>
        <p className="page-sub">
          <T
            en="Each block is a house standard clause. Adjust manually, or ask Leio — the engine never applies a rewrite by itself."
            th="แต่ละบล็อกคือข้อมาตรฐานบ้าน ปรับด้วยมือ หรือถามเลโอ — เครื่องยนต์ไม่ใช้ข้อที่เขียนใหม่เอง"
          />
        </p>
        {draft.map((x) => (
          <StandardClause key={x.n} id={`draft:${x.n}`} kicker={`${x.n} ${L(s.lang, x.h)}`} original={x.b} />
        ))}
      </div>
      <aside>
        <h5><T en="Review inputs in force" th="ข้อมูล Review ที่ใช้บังคับ" /></h5>
        {inputs.length ? (
          <>
            <div className="tag tag-accent" style={{ marginBottom: 8 }}>
              {s.assembly.sourceRef} · {inputs.length} <T en="inputs" th="รายการ" />
            </div>
            {inputs.slice(0, 6).map((x) => (
              <div key={x.id} style={{ padding: "9px 0", borderBottom: "1px solid var(--color-divider)" }}>
                <div className="mono" style={{ fontSize: 10 }}>{x.id} · {x.priority}</div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>{L(s.lang, x.title)}</div>
                <div className="text-muted" style={{ fontSize: 11, marginTop: 3 }}>{L(s.lang, x.source)}</div>
              </div>
            ))}
            <Link href="/assemble?s=intake" className="btn btn-secondary btn-block" style={{ marginTop: 10 }}>
              <T en="Review intake" th="ตรวจข้อมูลนำเข้า" />
            </Link>
          </>
        ) : (
          <div className="callout" style={{ marginBottom: 16 }}>
            <T en="No source-backed Review inputs are locked into this draft yet." th="ยังไม่มีข้อมูล Review ที่ชี้แหล่งถูกล็อกในร่างนี้" />
            <Link href="/assemble?s=intake" className="btn btn-secondary btn-block" style={{ marginTop: 10 }}>
              <T en="Ingest Review" th="รับข้อมูล Review" />
            </Link>
          </div>
        )}
        <h5><T en="Document package" th="ชุดเอกสารที่จะสร้าง" /></h5>
        {[{ k: th ? "สัญญาหลัก — บริการ SaaS" : "Main agreement — SaaS", v: "14 pp." }, { k: "Annex A — SLA", v: "4 pp." }, { k: "Annex B — DPA", v: "6 pp." }, { k: "Annex C — transfer", v: "3 pp." }].map((p) => (
          <div key={p.k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--color-divider)" }}><span>{p.k}</span><span className="mono">{p.v}</span></div>
        ))}
        <div style={{ marginTop: 16 }}>
          <Dropzone
            bucket="assemble"
            compact
            title={<T en="Drop missing annexes A–C" th="ลากภาคผนวก A–C ที่ยังขาด" />}
            hint={<T en="SLA, DPA and transfer schedule. These are incorporated but not attached." th="SLA, DPA และตารางโอนข้อมูล อ้างถึงแล้วแต่ยังไม่แนบ" />}
          />
        </div>
        <h5 style={{ marginTop: 24 }}><T en="Internal approvals" th="การอนุมัติภายใน" /></h5>
        {[
          { k: "General Counsel", v: th ? "อนุมัติแล้ว" : "Approved", pending: false },
          { k: "DPO", v: s.dpoApproved ? (th ? "อนุมัติแล้ว" : "Approved") : (th ? "รออนุมัติ" : "Pending"), pending: !s.dpoApproved },
          { k: "CIO", v: th ? "อนุมัติแล้ว" : "Approved", pending: false },
        ].map((a) => (
          <div key={a.k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
            <span>{a.k}</span>
            <span className={a.pending ? "tag tag-accent" : "tag tag-neutral"}>{a.v}</span>
          </div>
        ))}
        {!s.dpoApproved && (
          <button type="button" className="btn btn-secondary btn-block" onClick={() => { s.approveDpo(); s.flash(th ? "DPO อนุมัติแล้ว" : "DPO approved"); }}>
            <T en="Approve as DPO" th="อนุมัติในฐานะ DPO" />
          </button>
        )}
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => {
            if (!s.dpoApproved) {
              s.flash(th ? "ต้องได้อนุมัติ DPO ก่อน" : "DPO approval is still required");
              return;
            }
            s.flash(th ? "กำลังสร้างชุด Word + PDF…" : "Generating Word + PDF pack…");
            void downloadAssemblePack({
              lang: s.lang,
              conflictChoice: s.conflictChoice,
              clauseEdits: s.clauseEdits,
            }).then(() => {
              s.generatePack();
              s.flash(th ? "ดาวน์โหลด .docx และ .pdf แล้ว" : "Downloaded .docx and .pdf");
            }).catch(() => {
              s.flash(th ? "สร้างชุดไม่สำเร็จ" : "Pack generation failed");
            });
          }}
        >
          {s.packGenerated ? <T en="Download Word + PDF again" th="ดาวน์โหลด Word + PDF อีกครั้ง" /> : <T en="Generate Word + PDF pack" th="สร้างชุด Word + PDF" />}
        </button>
        <div className="stack-actions" style={{ marginTop: 8 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              if (!s.dpoApproved) {
                s.flash(th ? "ต้องได้อนุมัติ DPO ก่อน" : "DPO approval is still required");
                return;
              }
              void downloadAssemblePack({ lang: s.lang, conflictChoice: s.conflictChoice, clauseEdits: s.clauseEdits }, "docx")
                .then(() => { s.generatePack(); s.flash(th ? "ดาวน์โหลด Word แล้ว" : "Word downloaded"); })
                .catch(() => s.flash(th ? "สร้าง Word ไม่สำเร็จ" : "Word generation failed"));
            }}
          >
            <T en="Word (.docx)" th="Word (.docx)" />
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              if (!s.dpoApproved) {
                s.flash(th ? "ต้องได้อนุมัติ DPO ก่อน" : "DPO approval is still required");
                return;
              }
              void downloadAssemblePack({ lang: s.lang, conflictChoice: s.conflictChoice, clauseEdits: s.clauseEdits }, "pdf")
                .then(() => { s.generatePack(); s.flash(th ? "ดาวน์โหลด PDF แล้ว" : "PDF downloaded"); })
                .catch(() => s.flash(th ? "สร้าง PDF ไม่สำเร็จ" : "PDF generation failed"));
            }}
          >
            <T en="PDF" th="PDF" />
          </button>
        </div>
        <div className="callout" style={{ marginTop: 20 }}>
          <T en="e-Sign is suitable provided ET Act evidence is retained and both signatories are identity-assured." th="เหมาะกับ e-Sign หากเก็บหลักฐานตาม พ.ร.บ.ธุรกรรมทางอิเล็กทรอนิกส์ และยืนยันตัวตนผู้ลงนามทั้งสองฝ่าย" />
        </div>
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => {
            if (!s.packGenerated) {
              s.flash(th ? "สร้างชุดเอกสารก่อนส่งลงนาม" : "Generate the pack before issuing signature");
              return;
            }
            s.issueSigning();
            s.flash(th ? "ส่งเส้นทางลงนามแล้ว" : "Signing pack issued");
          }}
        >
          {s.signingIssued ? <T en="Signing path issued" th="ส่งเส้นทางลงนามแล้ว" /> : <T en="Identity-assured e-signature" th="ลงนามอิเล็กทรอนิกส์ระดับยืนยันตัวตน" />}
        </button>
        <Link href="/assemble?s=areview" className="btn btn-secondary btn-block" style={{ marginTop: 8 }}>
          <T en="Preflight for Contract Review" th="ตรวจความพร้อมก่อนส่ง Contract Review" />
        </Link>
      </aside>
    </div>
  );
}

function ReviewReady() {
  const s = useStore();
  const router = useRouter();
  const th = s.lang === "th";
  const c = TAX_LIST.find((r) => r.id === s.sel) || TAX_LIST[0];
  const inputs = acceptedAssemblyInputs(s.assembly);
  const draftTitle = `${th ? c.nameTh : c.nameEn} — ${s.assembly.sourceRef || c.id}`;
  const checks = [
    {
      k: <T en="Review information ingested" th="รับข้อมูล Review แล้ว" />,
      ok: inputs.length > 0,
      n: inputs.length ? `${inputs.length} · ${s.assembly.sourceRef}` : (th ? "ยังไม่มี" : "None"),
    },
    {
      k: <T en="Commercial interview confirmed" th="ยืนยันสัมภาษณ์เชิงพาณิชย์" />,
      ok: s.interviewDone,
      n: s.interviewDone ? (th ? "ล็อกแล้ว" : "Locked") : (th ? "ยังไม่ยืนยัน" : "Not confirmed"),
    },
    {
      k: <T en="Policy conflict resolved" th="ตัดสินข้อขัดนโยบาย" />,
      ok: Boolean(s.conflictChoice),
      n: s.conflictChoice || (th ? "ยังไม่ตัดสิน" : "Open"),
    },
    {
      k: <T en="Internal approval" th="การอนุมัติภายใน" />,
      ok: s.dpoApproved,
      n: s.dpoApproved ? "DPO approved" : "DPO pending",
    },
    {
      k: <T en="Review copy generated" th="สร้างชุดสำหรับตรวจ" />,
      ok: s.packGenerated,
      n: s.packGenerated ? "DOCX + PDF" : (th ? "ยังไม่สร้าง" : "Not generated"),
    },
  ];
  const ready = checks.every((x) => x.ok);

  return (
    <div className="pad-page">
      <Kicker>assemble · ready for review</Kicker>
      <Title><T en="Assembly → Contract Review" th="Assembly → Contract Review" /></Title>
      <p className="page-sub">
        <T
          en="Preflight the assembled draft, preserve its Review sources, then open a new contract-review assignment. The draft is reviewed before any signing path."
          th="ตรวจความพร้อมของร่าง รักษาแหล่งจาก Review แล้วเปิดงานตรวจสัญญาใหม่ ร่างต้องผ่านการตรวจก่อนเส้นทางลงนาม"
        />
      </p>
      <div className="review-preflight">
        {checks.map((x, i) => (
          <div key={i} className="review-preflight-row">
            <span className={x.ok ? "tag tag-neutral" : "tag tag-accent"}>{x.ok ? "READY" : "OPEN"}</span>
            <strong>{x.k}</strong>
            <span className="text-muted">{x.n}</span>
          </div>
        ))}
      </div>
      <div className="callout" style={{ marginTop: 18 }}>
        <strong><T en="Review handoff" th="ส่งต่องานตรวจ" /></strong>
        <p>{draftTitle}</p>
        <p className="text-muted" style={{ fontSize: 12 }}>
          <T
            en="LAW24 opens the Firm review record and carries the source manifest. Upload the generated DOCX/PDF there for a fresh X-Ray; the engine does not pretend that metadata is the document."
            th="LAW24 เปิดบันทึกงานตรวจของสำนักงานและพารายการแหล่งไปด้วย ให้อัปโหลด DOCX/PDF ที่สร้างแล้วเพื่อทำ X-Ray ใหม่ ระบบไม่แสร้งว่า metadata คือเอกสาร"
          />
        </p>
      </div>
      <div className="stack-actions" style={{ marginTop: 16 }}>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!ready}
          onClick={() => {
            s.sendAssemblyToReview(draftTitle);
            s.flash(th ? "เปิดงาน Contract Review แล้ว — อัปโหลดชุดที่สร้างเพื่อ X-Ray" : "Contract Review opened — upload the generated pack for X-Ray");
            router.push("/review?s=xray");
          }}
        >
          <T en="Send assembled draft to Review" th="ส่งร่างที่ประกอบแล้วเข้า Review" />
        </button>
        <Link href="/assemble?s=draft" className="btn btn-secondary"><T en="Back to draft" th="กลับร่าง" /></Link>
      </div>
    </div>
  );
}

function Bilingual() {
  const s = useStore();
  return (
    <div className="pad-page">
      <Kicker>wow · bilingual mirror</Kicker>
      <Title><T en="Thai and English remain structurally linked" th="ข้อไทยและอังกฤษผูกโครงสร้างเดียวกัน" /></Title>
      <p className="page-sub"><T en="When one language changes, LAW24 flags whether the translation creates a different legal meaning." th="เมื่อภาษาหนึ่งเปลี่ยน LAW24 ชี้ว่าคำแปลสร้างความหมายทางกฎหมายต่างกันหรือไม่" /></p>
      {BILINGUAL.map((b, i) => (
        <div key={i} style={{ marginTop: 20 }}>
          <div className="bilingual-grid">
            <div className="bilingual-col"><div className="page-kicker">TH</div><p>{b.th}</p></div>
            <div className="bilingual-col"><div className="page-kicker">EN</div><p>{b.en}</p></div>
          </div>
          <div className="callout" style={{ marginTop: 0, borderTop: 0 }}>
            <span className={b.risk === "high" ? "tag tag-signal" : b.risk === "ok" ? "tag tag-neutral" : "tag tag-accent"}>{b.risk}</span>
            <span style={{ marginLeft: 10 }}>{L(s.lang, b.drift)}</span>
          </div>
        </div>
      ))}
      <div className="stack-actions" style={{ marginTop: 18 }}>
        <Link href="/review?s=xray" className="btn btn-primary">X-Ray</Link>
        <Link href="/assemble?s=draft" className="btn btn-secondary"><T en="Back to draft" th="กลับร่าง" /></Link>
      </div>
    </div>
  );
}
