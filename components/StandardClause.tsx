"use client";

import { useState } from "react";
import Link from "next/link";
import { PenLine, RotateCcw, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { T } from "@/lib/i18n";
import { copyTE } from "@/lib/guides";
import { L } from "@/lib/model";
import type { TE } from "@/lib/model";
import { proposeAiClause, type AiProposal, type ClauseAdjustMode } from "@/lib/clauses";

export function StandardClause({
  id,
  kicker,
  original,
}: {
  id: string;
  kicker: string;
  original: TE;
}) {
  const s = useStore();
  const th = s.lang === "th";
  const edit = s.clauseEdits[id];
  const current = edit?.body ?? original;
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ClauseAdjustMode>(edit?.mode ?? "manual");
  const [text, setText] = useState(L(s.lang, current));
  const [reason, setReason] = useState(edit?.reason ?? "");
  const [instruction, setInstruction] = useState(edit?.instruction ?? "");
  const [proposal, setProposal] = useState<AiProposal | null>(null);
  const [proposing, setProposing] = useState(false);

  function start(next: ClauseAdjustMode) {
    setMode(next);
    setOpen(true);
    setText(L(s.lang, current));
    setProposal(null);
  }

  function applyManual() {
    const body = text.trim();
    const why = reason.trim();
    if (!body) {
      s.flash(th ? "ใส่ข้อความข้อสัญญาก่อนใช้" : "Enter clause text before applying");
      return;
    }
    if (!why) {
      s.flash(th ? "บันทึกเหตุก่อนใช้ข้อ" : "Record a reason before applying");
      return;
    }
    s.applyClauseEdit(id, {
      mode: "manual",
      body: s.lang === "th" ? { t: body, e: current.e } : { t: current.t, e: body },
      reason: why,
    });
    setOpen(false);
    s.flash(th ? "ใช้ข้อที่ปรับแล้ว — ทนายเป็นผู้ตัดสิน" : "Adjusted clause applied — counsel decided");
  }

  async function runAi() {
    setProposing(true);
    try {
      const next = proposeAiClause({ heading: kicker, original, instruction });
      setProposal(next);
      if (!next.blocked) setText(L(s.lang, next.body));
    } finally {
      setProposing(false);
    }
  }

  function applyAi() {
    if (!proposal || proposal.blocked) {
      s.flash(th ? "เลโอไม่ย้ายข้อออกจากเพลย์บุ๊ก" : "Leio will not move the clause off the playbook");
      return;
    }
    const why = reason.trim() || copyTE(s.lang, proposal.why);
    s.applyClauseEdit(id, {
      mode: "ai",
      body: proposal.body,
      reason: why,
      instruction: instruction.trim() || undefined,
      cites: proposal.cites,
    });
    setOpen(false);
    s.flash(th ? "ใช้ข้อที่เลโอเสนอ — ทนายเป็นผู้ใช้" : "AI proposal applied — counsel applied it");
  }

  return (
    <div className="clause-block">
      <div className="clause-block-head">
        <div>
          <div style={{ font: "800 12px/1 var(--font-heading)", color: "var(--color-accent)" }}>{kicker}</div>
          {edit && (
            <span className="tag tag-accent" style={{ marginTop: 8 }}>
              {edit.mode === "ai" ? <T en="Adjusted · AI" th="ปรับแล้ว · AI" /> : <T en="Adjusted · manual" th="ปรับแล้ว · ด้วยมือ" />}
            </span>
          )}
        </div>
        <button type="button" className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => (open ? setOpen(false) : start(mode))}>
          <PenLine size={14} /> <T en="Adjust" th="ปรับข้อ" />
        </button>
      </div>
      <p style={{ marginTop: 8 }}>{L(s.lang, current)}</p>
      {edit && (
        <p className="text-muted" style={{ fontSize: 12, marginTop: 8 }}>
          <T en="Reason on the record:" th="เหตุในบันทึก:" /> {edit.reason}
        </p>
      )}

      {open && (
        <div className="clause-adjust">
          <div className="guide-kicker"><T en="Adjust this standard clause" th="ปรับข้อมาตรฐานนี้" /></div>
          <p className="text-muted" style={{ fontSize: 12, margin: "6px 0 12px" }}>
            <T
              en="Two modes. Manual: counsel rewrites. AI: Leio proposes against the playbook — it does not apply itself and never signs."
              th="สองโหมด ด้วยมือ: ทนายเขียนใหม่ AI: เลโอเสนอเทียบเพลย์บุ๊ก — ไม่ใช้ข้อเองและไม่ลงนามแทน"
            />
          </p>
          <div className="clause-adjust-modes">
            <button type="button" className={`filter-chip${mode === "manual" ? " on" : ""}`} onClick={() => start("manual")}>
              <PenLine size={12} /> <T en="1 · Manual adjust" th="1 · ปรับด้วยมือ" />
            </button>
            <button type="button" className={`filter-chip${mode === "ai" ? " on" : ""}`} onClick={() => start("ai")}>
              <Sparkles size={12} /> <T en="2 · AI adjust" th="2 · ปรับด้วย AI" />
            </button>
          </div>

          {mode === "manual" && (
            <>
              <label className="page-kicker" style={{ display: "block", margin: "14px 0 6px" }}>
                <T en="Clause text" th="ข้อความข้อสัญญา" />
              </label>
              <textarea className="input" rows={5} value={text} onChange={(e) => setText(e.target.value)} />
              <label className="page-kicker" style={{ display: "block", margin: "12px 0 6px" }}>
                <T en="Reason (required)" th="เหตุ (ต้องมี)" />
              </label>
              <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder={th ? "ทำไมข้อบ้านต้องขยับ" : "Why the house clause must move"} />
              <p className="text-muted" style={{ fontSize: 12, marginTop: 8 }}>
                <T en="Both languages must mean the same thing. Open the bilingual mirror after you apply." th="ทั้งสองภาษาต้องมีความหมายเดียวกัน เปิดร่างคู่ภาษาหลังใช้ข้อ" />
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                <button type="button" className="btn btn-primary" onClick={applyManual}>
                  <T en="Apply manual adjust" th="ใช้ข้อที่ปรับด้วยมือ" />
                </button>
                {edit && (
                  <button type="button" className="btn btn-secondary" onClick={() => { s.revertClauseEdit(id); setOpen(false); s.flash(th ? "กลับข้อมาตรฐานบ้าน" : "Reverted to house standard"); }}>
                    <RotateCcw size={14} /> <T en="Revert to standard" th="กลับข้อมาตรฐาน" />
                  </button>
                )}
              </div>
            </>
          )}

          {mode === "ai" && (
            <>
              <label className="page-kicker" style={{ display: "block", margin: "14px 0 6px" }}>
                <T en="Instruction to Leio (optional)" th="คำสั่งถึงเลโอ (ไม่บังคับ)" />
              </label>
              <input
                className="input"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder={th ? "เช่น ใส่รายชื่อผู้ประมวลผลช่วง และล็อกที่ตั้งประมวลผล" : "e.g. add the sub-processor list and lock processing location"}
              />
              <button type="button" className="btn btn-secondary" style={{ marginTop: 10 }} onClick={runAi} disabled={proposing}>
                <Sparkles size={14} /> {proposing ? <T en="Proposing…" th="กำลังเสนอ…" /> : <T en="Propose from playbook" th="เสนอจากเพลย์บุ๊ก" />}
              </button>
              {proposal && (
                <div className={`callout${proposal.blocked ? "" : ""}`} style={{ marginTop: 12 }}>
                  <strong>{proposal.blocked ? <T en="Leio will not move this off the playbook" th="เลโอไม่ย้ายข้อนี้จากเพลย์บุ๊ก" /> : <T en="Proposal — counsel applies" th="ข้อเสนอ — ทนายเป็นผู้ใช้" />}</strong>
                  <p style={{ margin: "8px 0" }}>{copyTE(s.lang, proposal.why)}</p>
                  {!proposal.blocked && <p style={{ margin: "0 0 8px" }}>{L(s.lang, proposal.body)}</p>}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {proposal.cites.map((c) => (
                      <Link key={c.label} href={c.href} className="tag tag-outline" style={{ fontSize: 10 }}>{c.label}</Link>
                    ))}
                  </div>
                </div>
              )}
              <label className="page-kicker" style={{ display: "block", margin: "12px 0 6px" }}>
                <T en="Reason on the record" th="เหตุในบันทึก" />
              </label>
              <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder={th ? "ทนายยืนยันเหตุที่ใช้ข้อนี้" : "Counsel's reason for applying this text"} />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                <button type="button" className="btn btn-primary" onClick={applyAi} disabled={!proposal || proposal.blocked}>
                  <T en="Apply AI adjust" th="ใช้ข้อที่ AI เสนอ" />
                </button>
                {edit && (
                  <button type="button" className="btn btn-secondary" onClick={() => { s.revertClauseEdit(id); setOpen(false); setProposal(null); s.flash(th ? "กลับข้อมาตรฐานบ้าน" : "Reverted to house standard"); }}>
                    <RotateCcw size={14} /> <T en="Revert to standard" th="กลับข้อมาตรฐาน" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
