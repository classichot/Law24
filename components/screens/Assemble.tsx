"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { CAT_MAP, FX, TAX_CATS, TAX_ENUMS, TAX_LIST, TAX_SOURCES, TAX_TOTALS, esignShort, trClauses, trFormality, trNote, trParties } from "@/lib/taxonomy";
import { Chip, Kicker, Title } from "@/components/ui";
import { L } from "@/lib/model";
import { BILINGUAL } from "@/lib/wow";
import { T } from "@/lib/i18n";

export function AssembleScreen({ screen }: { screen: string }) {
  if (screen === "lib") return <Library />;
  if (screen === "type") return <TypeDetail />;
  if (screen === "iv") return <Interview />;
  if (screen === "asm") return <Assembly />;
  if (screen === "draft") return <Draft />;
  if (screen === "bilingual") return <Bilingual />;
  return <Library />;
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
  const shown = rows.slice(0, 200);

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
        <div style={{ fontSize: 12, color: "var(--color-neutral-600)", padding: "10px 0" }}>
          {th ? `แสดง ${shown.length} จาก ${TAX_LIST.length} ประเภท` : `Showing ${shown.length} of ${TAX_LIST.length} types`}
        </div>
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
        <ul>{clauses.map((k) => <li key={k}>{k}</li>)}</ul>
        <h5><T en="Statutory form" th="รูปแบบและพิธีการ" /></h5>
        <p>{trFormality(s.lang, c.formality)}</p>
        <h5><T en="Legal basis" th="ฐานกฎหมาย" /></h5>
        <p>{c.legalBasis}</p>
        <p className="text-muted">{trNote(s.lang, c.templateNote)}</p>
        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          <Link href="/assemble?s=iv" className="btn btn-primary"><T en="Start guided interview" th="เริ่มสัมภาษณ์นำทาง" /></Link>
          <Link href="/review?s=rsetup" className="btn btn-secondary"><T en="Review an existing contract" th="ส่งไปตรวจสัญญาที่มีอยู่" /></Link>
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
          <Link href="/assemble?s=asm" className="btn btn-primary" style={{ marginTop: 16 }}><T en="Continue to assembly" th="ไปประกอบข้อสัญญา" /></Link>
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
  const th = s.lang === "th";
  const IV = FX.interview;
  return (
    <div className="pad-page">
      <Kicker>assemble · clause engine</Kicker>
      <Title><T en="Rule-driven clause assembly" th="ประกอบข้อสัญญาจากกฎ" /></Title>
      <p className="page-sub"><T en="Every module traces to an interview answer and the governing playbook." th="ทุกโมดูลผูกกับคำตอบในแบบสัมภาษณ์และ playbook ที่บังคับใช้" /></p>
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
              <td><span className={m.s === "in" ? "tag tag-accent" : m.s === "conflict" ? "tag tag-outline" : "tag tag-neutral"}>{m.s}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link href="/assemble?s=draft" className="btn btn-primary" style={{ marginTop: 20 }}><T en="Generate DOCX + PDF" th="สร้างเอกสาร DOCX + PDF" /></Link>
    </div>
  );
}

function Draft() {
  const s = useStore();
  const th = s.lang === "th";
  const draft = FX.interview.draft;
  return (
    <div className="pad-page grid-split">
      <div>
        <Kicker>assemble · draft</Kicker>
        <Title><T en="Assembled draft" th="ร่างสัญญาที่ประกอบแล้ว" /></Title>
        {draft.map((x) => (
          <div key={x.n} className="clause-block">
            <div style={{ font: "800 12px/1 var(--font-heading)", color: "var(--color-accent)" }}>{x.n} {L(s.lang, x.h)}</div>
            <p style={{ marginTop: 8 }}>{L(s.lang, x.b)}</p>
          </div>
        ))}
      </div>
      <aside>
        <h5><T en="Document package" th="ชุดเอกสารที่จะสร้าง" /></h5>
        {[{ k: th ? "สัญญาหลัก — บริการ SaaS" : "Main agreement — SaaS", v: "14 pp." }, { k: "Annex A — SLA", v: "4 pp." }, { k: "Annex B — DPA", v: "6 pp." }, { k: "Annex C — transfer", v: "3 pp." }].map((p) => (
          <div key={p.k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--color-divider)" }}><span>{p.k}</span><span className="mono">{p.v}</span></div>
        ))}
        <h5 style={{ marginTop: 24 }}><T en="Internal approvals" th="การอนุมัติภายใน" /></h5>
        {[{ k: "General Counsel", v: th ? "อนุมัติแล้ว" : "Approved" }, { k: "DPO", v: th ? "รออนุมัติ" : "Pending" }, { k: "CIO", v: th ? "อนุมัติแล้ว" : "Approved" }].map((a) => (
          <div key={a.k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}><span>{a.k}</span><span className={a.v.includes("Pend") || a.v.includes("รอ") ? "tag tag-accent" : "tag tag-neutral"}>{a.v}</span></div>
        ))}
        <div className="callout" style={{ marginTop: 20 }}>
          <T en="e-Sign is suitable provided ET Act evidence is retained and both signatories are identity-assured." th="เหมาะกับ e-Sign หากเก็บหลักฐานตาม พ.ร.บ.ธุรกรรมทางอิเล็กทรอนิกส์ และยืนยันตัวตนผู้ลงนามทั้งสองฝ่าย" />
        </div>
        <button className="btn btn-primary btn-block" onClick={() => s.flash(th ? "ส่งเส้นทางลงนามแล้ว" : "Signing pack issued")}><T en="Identity-assured e-signature" th="ลงนามอิเล็กทรอนิกส์ระดับยืนยันตัวตน" /></button>
      </aside>
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
    </div>
  );
}
