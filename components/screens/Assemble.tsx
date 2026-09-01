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
import {
  acceptedAssemblyInputs,
  assemblyInputsOf,
  fallbackQuestionnaire,
  questionnaireInputsOf,
  type IntakeQuestionnaire,
} from "@/lib/assembly";
import { fetchAiStatus, postAi } from "@/lib/ai/client";
import { AiLiveMark } from "@/components/AiLiveMark";

function pinDemo(rows: typeof TAX_LIST, sel: string) {
  const pinned = rows.find((r) => r.id === sel) || rows.find((r) => r.id === DEMO_TYPE_ID);
  if (!pinned) return rows;
  return [pinned, ...rows.filter((r) => r.id !== pinned.id)];
}

export function AssembleScreen({ screen }: { screen: string }) {
  if (screen === "intake") return <IntakeChoice />;
  if (screen === "papers") return <PaperIntake />;
  if (screen === "aiq") return <AiQuestionnaire />;
  if (screen === "lib") return <Library />;
  if (screen === "type") return <TypeDetail />;
  if (screen === "iv") return <Interview />;
  if (screen === "asm") return <Assembly />;
  if (screen === "draft") return <Draft />;
  if (screen === "areview") return <ReviewReady />;
  if (screen === "bilingual") return <Bilingual />;
  return <Library />;
}

function IntakeChoice() {
  const s = useStore();
  const papers = s.uploads.filter((x) => x.bucket === "assemble").length;
  const answers = Object.values(s.assembly.questionnaire.answers).filter((x) => x.trim()).length;
  return (
    <div className="pad-page">
      <Kicker>assemble · intake</Kicker>
      <Title><T en="How do you want to give drafting information?" th="ต้องการให้ข้อมูลสำหรับร่างอย่างไร" /></Title>
      <p className="page-sub">
        <T
          en="Both routes produce the same controlled drafting intake. Use source papers when the deal is already documented; use the AI questionnaire when the information is still with the client or lawyer."
          th="ทั้งสองทางสร้างข้อมูลร่างที่ควบคุมแบบเดียวกัน ใช้เอกสารต้นทางเมื่อดีลมีเอกสารแล้ว หรือใช้แบบสอบถาม AI เมื่อข้อมูลยังอยู่กับลูกค้าหรือทนาย"
        />
      </p>
      <div className="grid-2" style={{ marginTop: 20 }}>
        <Link href="/assemble?s=papers" className="home-card eng-card eng-draft" style={{ color: "inherit", textDecoration: "none" }}>
          <div className="page-kicker">ROUTE 01</div>
          <h3 style={{ margin: 0 }}><T en="Upload intake papers" th="อัปโหลดเอกสารนำเข้า" /></h3>
          <p className="text-muted" style={{ margin: 0 }}>
            <T en="Term sheet, instruction email, proposal, SOW, existing draft, or connected Contract Review." th="Term sheet อีเมลคำสั่ง ข้อเสนอ SOW ร่างเดิม หรือ Contract Review ที่เชื่อมอยู่" />
          </p>
          <div className="tag tag-outline">{papers} <T en="files attached" th="ไฟล์แนบ" /></div>
          <span className="btn btn-primary"><T en="Open paper intake" th="เปิดรับเอกสาร" /></span>
        </Link>
        <Link href="/assemble?s=aiq" className="home-card eng-card eng-draft" style={{ color: "inherit", textDecoration: "none" }}>
          <div className="page-kicker">ROUTE 02 · <AiLiveMark compact /></div>
          <h3 style={{ margin: 0 }}><T en="AI intake questionnaire" th="แบบสอบถามนำเข้า AI" /></h3>
          <p className="text-muted" style={{ margin: 0 }}>
            <T en="Select a contract type. AI asks only the facts, risks and formalities that affect that contract." th="เลือกประเภทสัญญา AI จะถามเฉพาะข้อเท็จจริง ความเสี่ยง และพิธีการที่กระทบสัญญาประเภทนั้น" />
          </p>
          <div className="tag tag-outline">{answers} <T en="answers saved" th="คำตอบที่บันทึก" /></div>
          <span className="btn btn-primary"><T en="Start AI questionnaire" th="เริ่มแบบสอบถาม AI" /></span>
        </Link>
      </div>
      <div className="callout" style={{ marginTop: 20 }}>
        <T
          en="Neither route signs or treats an answer as verified law. Counsel confirms the intake before clauses are assembled."
          th="ทั้งสองทางไม่ลงนามและไม่ถือคำตอบเป็นข้อกฎหมายที่ยืนยันแล้ว ทนายต้องยืนยันข้อมูลก่อนประกอบข้อ"
        />
      </div>
    </div>
  );
}

function PaperIntake() {
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
      <Kicker>assemble · paper intake</Kicker>
      <Title><T en="Upload intake papers" th="อัปโหลดเอกสารนำเข้า" /></Title>
      <p className="page-sub">
        <T
          en="Drop a term sheet, instruction email, proposal, SOW or existing draft. If Contract Review is connected, select its source-backed facts and findings too."
          th="วาง term sheet อีเมลคำสั่ง ข้อเสนอ SOW หรือร่างเดิม หากเชื่อม Contract Review ให้เลือกข้อเท็จจริงและข้อค้นพบที่ชี้แหล่งด้วย"
        />
      </p>
      <Dropzone
        bucket="assemble"
        title={<T en="Drop intake papers" th="ลากเอกสารนำเข้ามาวาง" />}
        hint={<T en="PDF, DOCX, XLSX, email or ZIP. Counsel confirms extracted information before assembly." th="PDF DOCX XLSX อีเมล หรือ ZIP ทนายยืนยันข้อมูลที่สกัดก่อนประกอบสัญญา" />}
      />

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
        <div className="callout" style={{ margin: "18px 0 0" }}>
          <strong><T en="Paper route ready" th="ทางเอกสารพร้อม" /></strong>
          <p><T en="No Contract Review map is connected. The uploaded papers remain the intake source until counsel maps an existing draft." th="ยังไม่มีแผนที่ Contract Review เอกสารที่อัปโหลดเป็นแหล่งนำเข้าจนกว่าทนายจะ map ร่างเดิม" /></p>
          <div className="stack-actions">
            <Link href="/review?s=xray" className="btn btn-primary"><T en="Open Contract Review" th="เปิด Contract Review" /></Link>
            <Link href="/assemble?s=aiq" className="btn btn-secondary"><T en="Use AI questionnaire instead" th="ใช้แบบสอบถาม AI แทน" /></Link>
          </div>
        </div>
      )}
    </div>
  );
}

function AiQuestionnaire() {
  const s = useStore();
  const th = s.lang === "th";
  const qn = s.assembly.questionnaire;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const c = TAX_LIST.find((r) => r.id === s.sel) || TAX_LIST[0];
  const active = qn.typeId === c.id;
  const answered = active ? Object.values(qn.answers).filter((x) => x.trim()).length : 0;
  const openRequired = active ? qn.questions.filter((q) => q.required && !qn.answers[q.id]?.trim()).length : 0;
  const inputs = active ? questionnaireInputsOf(qn) : [];

  async function askNext(reset = false) {
    setLoading(true);
    setError("");
    const fresh = reset || !active;
    const answers = fresh ? {} : qn.answers;
    const round = fresh ? 1 : qn.round + 1;
    try {
      let next: Pick<IntakeQuestionnaire, "questions" | "summary" | "missing" | "ready">;
      if (await fetchAiStatus()) {
        next = await postAi<typeof next>("/api/ai/assembly-intake", {
          type: {
            id: c.id,
            nameTh: c.nameTh,
            nameEn: c.nameEn,
            category: `${c.cat} · ${CAT_MAP[c.cat]?.en || ""}`,
            purpose: c.purpose,
            parties: c.parties,
            keyTerms: c.keyTerms,
            legalBasis: c.legalBasis,
            formality: c.formality,
          },
          answers,
          round,
        });
      } else {
        next = fallbackQuestionnaire({
          typeId: c.id,
          typeName: `${c.nameEn} ${c.nameTh}`,
          category: `${c.cat} ${CAT_MAP[c.cat]?.en || ""}`,
          keyTerms: c.keyTerms,
          answers,
          round,
        });
      }
      if (fresh) s.resetAssemblyQuestionnaire(c.id);
      s.setAssemblyQuestionnaire({ ...next, typeId: c.id, round });
      if (!next.questions.length && next.ready) {
        s.flash(th ? "ข้อมูลพอสำหรับร่างรอบแรก — รอทนายยืนยัน" : "Enough for a first draft — counsel confirmation required");
      }
    } catch (err) {
      const fallback = fallbackQuestionnaire({
        typeId: c.id,
        typeName: `${c.nameEn} ${c.nameTh}`,
        category: `${c.cat} ${CAT_MAP[c.cat]?.en || ""}`,
        keyTerms: c.keyTerms,
        answers,
        round,
      });
      s.setAssemblyQuestionnaire({ ...fallback, typeId: c.id, round });
      setError(err instanceof Error ? err.message : "Live AI unavailable");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pad-page">
      <Kicker>assemble · AI intake questionnaire · <AiLiveMark compact /></Kicker>
      <Title><T en="Questions that change with the contract" th="คำถามที่เปลี่ยนตามประเภทสัญญา" /></Title>
      <p className="page-sub">
        <T
          en="Choose the contract type first. AI asks the commercial facts, risk positions, approvals and formalities that determine its clauses, then follows up on your answers."
          th="เลือกประเภทสัญญาก่อน AI จะถามข้อเท็จจริงเชิงพาณิชย์ ท่าทีความเสี่ยง การอนุมัติ และพิธีการที่กำหนดข้อสัญญา แล้วถามต่อจากคำตอบ"
        />
      </p>
      <div className="practice-form" style={{ margin: "18px 0" }}>
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label><T en="Contract type" th="ประเภทสัญญา" /></label>
          <select
            className="input"
            value={s.sel}
            onChange={(e) => {
              s.setSel(e.target.value);
              s.resetAssemblyQuestionnaire(e.target.value);
            }}
          >
            {TAX_LIST.map((row) => <option key={row.id} value={row.id}>{row.id} · {th ? row.nameTh : row.nameEn}</option>)}
          </select>
        </div>
        <div style={{ gridColumn: "1 / -1" }} className="text-muted">
          {c.cat} · {th ? c.nameEn : c.nameTh} · {th ? CAT_MAP[c.cat]?.th : CAT_MAP[c.cat]?.en}
        </div>
      </div>

      {!active || (!qn.questions.length && !qn.ready) ? (
        <div className="callout eng-card eng-draft">
          <strong><T en="Ready to interview" th="พร้อมเริ่มสัมภาษณ์" /></strong>
          <p>{th ? `AI จะสร้างคำถามเฉพาะ ${c.nameTh}` : `AI will create questions specifically for ${c.nameEn}.`}</p>
          <button type="button" className="btn btn-primary" disabled={loading} onClick={() => void askNext(true)}>
            {loading ? <T en="Building questions…" th="กำลังสร้างคำถาม…" /> : <T en="Generate type-aware questions" th="สร้างคำถามตามประเภท" />}
          </button>
        </div>
      ) : (
        <>
          <div className="callout eng-card eng-draft" style={{ marginBottom: 16 }}>
            <strong>{L(s.lang, qn.summary) || `${c.id} · ${th ? c.nameTh : c.nameEn}`}</strong>
            <p className="text-muted" style={{ margin: "6px 0 0" }}>
              <T en="Round" th="รอบ" /> {qn.round} · {answered} <T en="answered" th="ตอบแล้ว" /> · {openRequired} <T en="required open" th="ข้อบังคับยังเปิด" />
            </p>
          </div>
          {qn.questions.map((q) => (
            <div key={q.id} className="ai-intake-question">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <span className="mono">{q.id}</span>
                <span className={q.required ? "tag tag-accent" : "tag tag-neutral"}>{q.required ? (th ? "ต้องตอบ" : "required") : (th ? "เสริม" : "optional")}</span>
                <span className="tag tag-outline">{q.category}</span>
              </div>
              <label htmlFor={q.id}>{L(s.lang, q.prompt)}</label>
              <p className="text-muted">{L(s.lang, q.why)}</p>
              {q.answerType === "select" ? (
                <select id={q.id} className="input" value={qn.answers[q.id] || ""} onChange={(e) => s.answerAssemblyQuestion(q.id, e.target.value)}>
                  <option value="">{th ? "เลือก…" : "Select…"}</option>
                  {q.options.map((o) => <option key={o.e} value={L(s.lang, o)}>{L(s.lang, o)}</option>)}
                </select>
              ) : q.answerType === "boolean" ? (
                <select id={q.id} className="input" value={qn.answers[q.id] || ""} onChange={(e) => s.answerAssemblyQuestion(q.id, e.target.value)}>
                  <option value="">{th ? "เลือก…" : "Select…"}</option>
                  <option value={th ? "ใช่" : "Yes"}>{th ? "ใช่" : "Yes"}</option>
                  <option value={th ? "ไม่" : "No"}>{th ? "ไม่" : "No"}</option>
                </select>
              ) : (
                <input
                  id={q.id}
                  className="input"
                  type={q.answerType === "number" ? "number" : q.answerType === "date" ? "date" : "text"}
                  value={qn.answers[q.id] || ""}
                  onChange={(e) => s.answerAssemblyQuestion(q.id, e.target.value)}
                  placeholder={th ? "คำตอบของลูกค้า / ทนาย" : "Client / counsel answer"}
                />
              )}
            </div>
          ))}
          {error && <p className="text-muted" style={{ fontSize: 12 }}><T en="Live AI was unavailable; LAW24 used the contract-type fallback." th="AI สดไม่พร้อม ระบบใช้คำถามสำรองตามประเภทสัญญา" /> ({error})</p>}
          <div className="stack-actions" style={{ marginTop: 18 }}>
            {!qn.ready && (
              <button type="button" className="btn btn-primary" disabled={loading || openRequired > 0} onClick={() => void askNext()}>
                {loading ? <T en="Adapting…" th="กำลังปรับคำถาม…" /> : <T en="Ask adaptive follow-up" th="ถามต่อจากคำตอบ" />}
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary"
              disabled={!qn.ready || !inputs.length || openRequired > 0}
              onClick={() => {
                s.ingestQuestionnaireToAssembly(inputs, c.id);
                s.flash(th ? `${inputs.length} คำตอบถูกล็อกเป็นข้อมูลร่าง — ทนายยืนยัน` : `${inputs.length} answers locked as drafting inputs — counsel confirmed`);
              }}
            >
              <T en="Counsel confirms and ingests answers" th="ทนายยืนยันและรับคำตอบเข้า Assembly" />
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => { s.resetAssemblyQuestionnaire(c.id); setError(""); }}>
              <T en="Restart questionnaire" th="เริ่มแบบสอบถามใหม่" />
            </button>
            <Link href="/assemble?s=lib" className="btn btn-secondary"><T en="Continue to library" th="ไปคลังประเภท" /></Link>
          </div>
        </>
      )}
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
  const aiInputs = acceptedAssemblyInputs(s.assembly).filter((x) => x.id.startsWith("AQ-"));
  const questions = aiInputs.length
    ? aiInputs.map((x) => ({ q: x.title, a: x.value, rule: x.source }))
    : IV.qs;
  const modules = aiInputs.length
    ? aiInputs.map((x) => ({ k: x.title, w: x.value, s: "in" as const }))
    : IV.modules;
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
          {questions.map((q, i) => (
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
              {s.interviewDone ? <T en="Answers confirmed" th="ยืนยันคำตอบแล้ว" /> : <T en="Confirm intake answers" th="ยืนยันคำตอบนำเข้า" />}
            </button>
            <Link href="/assemble?s=asm" className="btn btn-primary"><T en="Continue to assembly" th="ไปประกอบข้อสัญญา" /></Link>
          </div>
        </div>
        <div>
          <h5><T en="Resolved clause modules" th="โมดูลข้อสัญญาที่ถูกเลือก" /></h5>
          {modules.map((m, i) => (
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
  const intake = acceptedAssemblyInputs(s.assembly);
  const aiInputs = intake.filter((x) => x.id.startsWith("AQ-"));
  const modules = aiInputs.length
    ? aiInputs.map((x) => ({ k: x.title, w: x.value, s: "in" as const }))
    : IV.modules;
  const needsLawDecision = !aiInputs.length || s.conflictChoice === "waiver";
  return (
    <div className="pad-page">
      <Kicker>assemble · clause engine</Kicker>
      <Title><T en="Rule-driven clause assembly" th="ประกอบข้อสัญญาจากกฎ" /></Title>
      <p className="page-sub"><T en="Every module traces to an interview answer and the governing playbook. Adjust a standard clause only with a recorded reason." th="ทุกโมดูลผูกกับคำตอบในแบบสัมภาษณ์และ playbook ที่บังคับใช้ การปรับข้อมาตรฐานต้องมีเหตุในบันทึก" /></p>
      {needsLawDecision ? (
        <div className="callout" style={{ margin: "18px 0" }}>
          <strong><T en="Governing-law posture needs a decision" th="ต้องตัดสินท่าทีกฎหมายที่ใช้" /></strong>
          <p style={{ margin: "8px 0 12px" }}><T en="A requested exception must be recorded against the company Thai-law policy." th="คำขอยกเว้นต้องบันทึกเทียบนโยบายกฎหมายไทยของบริษัท" /></p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className={`btn ${s.conflictChoice === "thai" ? "btn-primary" : "btn-secondary"}`} onClick={() => { s.setConflictChoice("thai"); s.flash(th ? "ใช้กฎหมายไทย" : "Thai law selected"); }}><T en="Keep Thai law (policy)" th="ใช้กฎหมายไทย (นโยบาย)" /></button>
            <button className={`btn ${s.conflictChoice === "waiver" ? "btn-primary" : "btn-secondary"}`} onClick={() => { s.setConflictChoice("waiver"); s.flash(th ? "ขออนุมัติยกเว้น" : "Waiver requested"); }}><T en="Request a policy waiver" th="ขออนุมัติยกเว้น" /></button>
          </div>
        </div>
      ) : (
        <div className="callout" style={{ margin: "18px 0" }}>
          <strong><T en="AI intake applied to module selection" th="ใช้ข้อมูล AI เลือกโมดูลแล้ว" /></strong>
          <p style={{ margin: "8px 0 0" }}><T en="The questionnaire kept the Thai-law house posture. Counsel can still reopen the decision." th="แบบสอบถามคงท่าทีกฎหมายไทย ทนายยังเปิดตัดสินใหม่ได้" /></p>
        </div>
      )}
      <table className="table">
        <thead><tr><th>#</th><th><T en="Clause module" th="โมดูลข้อสัญญา" /></th><th><T en="Trigger" th="เงื่อนไข" /></th><th><T en="State" th="สถานะ" /></th></tr></thead>
        <tbody>
          {modules.map((m, i) => (
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
  const packInput = {
    lang: s.lang,
    conflictChoice: s.conflictChoice,
    clauseEdits: s.clauseEdits,
    typeId: s.sel,
    sourceRef: s.assembly.sourceRef,
    reviewInputs: inputs,
  };
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
              <T en="Intake information" th="ตรวจข้อมูลนำเข้า" />
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
            void downloadAssemblePack(packInput).then(() => {
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
              void downloadAssemblePack(packInput, "docx")
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
              void downloadAssemblePack(packInput, "pdf")
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
