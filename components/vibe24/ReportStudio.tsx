"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Kicker, Title } from "@/components/ui";
import { T } from "@/lib/i18n";
import { L } from "@/lib/model";
import { FIRM_USER, CORPORATE_USER } from "@/lib/model";
import { useStore } from "@/lib/store";
import {
  REPORT_PACKS,
  canFinalExport,
  exportNotice,
  type ReportPackId,
} from "@/lib/vibe24";
import { AdvancedSettings, ExplainThis, NextBestAction, ResultInterpreter, WhyAiChose } from "./primitives";

const PACKS = Object.keys(REPORT_PACKS) as ReportPackId[];

export function ReportBriefScreen() {
  const s = useStore();
  const pack = (useSearchParams().get("pack") as ReportPackId) || "xray-brief";
  const spec = REPORT_PACKS[pack] || REPORT_PACKS["xray-brief"];
  return (
    <div className="pad-page">
      <Kicker>outputs · report brief</Kicker>
      <Title><T en="Report brief" th="ขอบเขตรายงาน" /></Title>
      <p className="page-sub">{L(s.lang, spec.oneClick)}</p>
      <div className="callout">
        <p><strong><T en="Audience" th="ผู้รับ" /></strong> — {L(s.lang, spec.audience)}</p>
        <p><strong><T en="Pack" th="ชุดรายงาน" /></strong> — {spec.version}</p>
        <p><strong><T en="Jurisdiction" th="เขตอำนาจ" /></strong> — <T en="Thai law is the house default." th="กฎหมายไทยเป็นค่าเริ่มต้นของสำนักงาน" /></p>
        <p><strong><T en="Must never" th="ห้าม" /></strong> — {L(s.lang, spec.never)}</p>
      </div>
      <div className="stack-actions" style={{ marginTop: 16 }}>
        <Link href={`/outputs?s=studio&pack=${spec.id}`} className="btn btn-primary">
          <T en="Open report studio" th="เปิดห้องรายงาน" />
        </Link>
        <Link href={spec.engineHref} className="btn btn-secondary">
          <T en="Open the engine that feeds this pack" th="เปิดเครื่องยนต์ที่ป้อนชุดนี้" />
        </Link>
      </div>
    </div>
  );
}

export function ReportStudio() {
  const s = useStore();
  const params = useSearchParams();
  const [pack, setPack] = useState<ReportPackId>((params.get("pack") as ReportPackId) || "xray-brief");
  const spec = REPORT_PACKS[pack];
  const user = s.edition === "firm" ? FIRM_USER : CORPORATE_USER;
  const rev = s.experience.reports.find((r) => r.packId === pack) || null;
  const th = s.lang === "th";

  const next = useMemo(() => {
    if (!rev) return { title: th ? "สร้างร่างคลิกเดียว" : "Create a one-click draft", href: undefined as string | undefined };
    const fail = rev.gates.find((g) => g.state === "fail");
    if (fail) return { title: L(s.lang, fail.detail), href: spec.engineHref };
    if (rev.status !== "approved") return { title: th ? "ให้ผู้อนุมัติที่มีชื่อล็อกฉบับนี้" : "Have a named approver lock this revision", href: undefined };
    return { title: th ? "ส่งออกให้ผู้รับที่ได้รับอนุญาต" : "Export to the authorised recipient", href: spec.engineHref };
  }, [rev, spec, s.lang, th]);

  return (
    <div className="pad-page vibe-studio">
      <Kicker>outputs · report studio</Kicker>
      <Title><T en="Report studio" th="ห้องรายงาน" /></Title>
      <p className="page-sub">
        <T
          en="One Click Draft and section-by-section studio share the same evidence, gates and approval. One click is not approval. Demo data stays labelled."
          th="ร่างคลิกเดียวกับห้องทีละตอนใช้หลักฐาน เกณฑ์ และการอนุมัติชุดเดียวกัน คลิกเดียวไม่ใช่การอนุมัติ ข้อมูลสาธิตต้องติดป้าย"
        />
      </p>

      <div className="vibe-seg vibe-seg-wide" style={{ marginBottom: 16 }}>
        {PACKS.map((id) => (
          <button key={id} type="button" className={pack === id ? "on" : ""} onClick={() => setPack(id)}>
            {L(s.lang, REPORT_PACKS[id].name)}
          </button>
        ))}
      </div>

      <div className="stack-actions" style={{ marginBottom: 18 }}>
        <button type="button" className="btn btn-primary" onClick={() => s.oneClickDraft(pack)}>
          <T en="One Click Draft" th="ร่างคลิกเดียว" />
        </button>
        <Link href={spec.engineHref} className="btn btn-secondary">
          <T en="Do it myself in the engine" th="ทำเองในเครื่องยนต์" />
        </Link>
        <Link href={`/outputs?s=brief&pack=${pack}`} className="btn btn-ghost">
          <T en="Edit report brief" th="แก้ขอบเขตรายงาน" />
        </Link>
      </div>

      <ExplainThis
        term={L(s.lang, spec.name)}
        what={L(s.lang, spec.oneClick)}
        why={L(s.lang, spec.requirement)}
        meaning={L(s.lang, spec.audience)}
        action={L(s.lang, spec.never)}
      />

      {!rev && (
        <div className="callout" style={{ marginTop: 16 }}>
          <T en="No draft yet. One Click Draft prepares the paper and lists gaps. It will not invent a missing fact." th="ยังไม่มีร่าง ร่างคลิกเดียวจัดกระดาษและชี้ช่องว่าง จะไม่แต่งข้อเท็จจริงที่ขาด" />
        </div>
      )}

      {rev && (
        <>
          {rev.demo && (
            <div className="callout" style={{ marginTop: 16 }}>
              <strong><T en="Demonstration data" th="ข้อมูลสาธิต" /></strong>
              <T en=" — isolated and labelled. It cannot be approved as a real authority report." th=" — แยกและติดป้าย อนุมัติเป็นรายงานจริงไปยังหน่วยงานไม่ได้" />
            </div>
          )}
          <p className="text-muted" style={{ marginTop: 12 }}>
            {rev.id} · {rev.status} · {rev.brief.packVersion} · {rev.model.id}
            {rev.model.fallback ? " · fallback" : ""}
          </p>

          <h5><T en="Quality gates" th="เกณฑ์คุณภาพ" /></h5>
          <div className="vibe-gates">
            {rev.gates.map((g) => (
              <div key={g.id} className={`vibe-gate ${g.state}`}>
                <strong>{L(s.lang, g.name)}</strong>
                <span>{g.state}</span>
                <em>{L(s.lang, g.detail)}</em>
              </div>
            ))}
          </div>

          <ResultInterpreter
            result={L(s.lang, rev.editorialNote)}
            happened={<T en="A draft was assembled from the allowlisted data contract." th="ร่างถูกประกอบจากสัญญาข้อมูลที่อนุญาต" />}
            meaning={<T en="Writing quality is editorial — not an AI-detector score and not a 98% claim." th="คุณภาพงานเขียนเป็นงานบรรณาธิการ ไม่ใช่คะแนนจับ AI และไม่ใช่คำกล่าว 98%" />}
            goodBad={rev.findings.length ? <T en="Not releasable until major gaps close." th="ยังส่งไม่ได้จนกว่าช่องว่างสำคัญจะปิด" /> : <T en="Ready for named human approval." th="พร้อมให้คนที่มีชื่ออนุมัติ" />}
            compare={<T en="Compared to the pack requirements, not to a leaderboard." th="เทียบกับข้อกำหนดของชุดรายงาน ไม่ใช่ตารางจัดอันดับโมเดล" />}
            why={<T en="Facts must cite a registered source. Numbers stay in the calculation layer." th="ข้อเท็จจริงต้องชี้แหล่งที่ลงทะเบียน ตัวเลขอยู่ในชั้นคำนวณ" />}
            next={next.title}
            fixHref={spec.engineHref}
            fixLabel={<T en="Collect missing evidence" th="เก็บหลักฐานที่ขาด" />}
          />

          <h5><T en="Sections" th="ตอน" /></h5>
          {rev.sections.map((sec) => (
            <article key={sec.id} className="vibe-section">
              <h3>{L(s.lang, sec.title)}</h3>
              <p>{L(s.lang, sec.body)}</p>
              <div className="stack-actions">
                {rev.claims.filter((c) => c.section === sec.id).map((c) => {
                  const src = rev.sources.find((x) => c.sourceIds.includes(x.id));
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => s.flash(src ? `${src.id} · ${src.locator}` : (th ? "ยังไม่มีแหล่ง" : "No source registered"))}
                    >
                      <T en="Click to source" th="คลิกไปยังแหล่ง" /> · {c.id}
                    </button>
                  );
                })}
              </div>
            </article>
          ))}

          <h5><T en="Claim ledger" th="บัญชีข้ออ้าง" /></h5>
          <table className="vibe-table">
            <thead>
              <tr>
                <th>ID</th>
                <th><T en="Kind" th="ชนิด" /></th>
                <th><T en="Claim" th="ข้ออ้าง" /></th>
                <th><T en="Support" th="การรองรับ" /></th>
              </tr>
            </thead>
            <tbody>
              {rev.claims.map((c) => (
                <tr key={c.id}>
                  <td className="mono">{c.id}</td>
                  <td>{c.kind}</td>
                  <td>{L(s.lang, c.text)}</td>
                  <td>{c.support}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h5><T en="Review findings" th="ข้อตรวจ" /></h5>
          {rev.findings.length === 0 && <p className="text-muted"><T en="No open major findings." th="ไม่มีประเด็นสำคัญที่เปิด" /></p>}
          {rev.findings.map((f) => (
            <div key={f.id} className="issue-card" style={{ marginBottom: 8, padding: 14 }}>
              <div className="page-kicker">{f.severity} · {f.category} · {f.status}</div>
              <p>{L(s.lang, f.issue)}</p>
              <p className="text-muted">{L(s.lang, f.remedy)}</p>
            </div>
          ))}

          <WhyAiChose
            reason={L(s.lang, spec.oneClick)}
            data={rev.fields.map((f) => `${L(s.lang, f.label)}=${f.value ?? "—"}`).join(" · ")}
            assumptions={L(s.lang, spec.never)}
            alternatives={<T en="Report Studio section rewrite, or Do It Myself in the source engine." th="แก้ทีละตอนในห้องรายงาน หรือทำเองในเครื่องยนต์ต้นทาง" />}
          />

          <AdvancedSettings>
            <p className="text-muted">
              <T
                en="Model, prompt template and routing stay in the audit package. They do not appear as business results."
                th="โมเดล แม่แบบพรอมต์ และการจัดเส้นทางอยู่ในชุดตรวจสอบ ไม่ขึ้นเป็นผลทางธุรกิจ"
              />
            </p>
            <p className="mono">{rev.model.provider} · {rev.model.id} · {rev.brief.packVersion}</p>
          </AdvancedSettings>

          <div className="stack-actions" style={{ marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={rev.status === "approved"}
              onClick={() => s.approveReport(rev.id, s.lang === "th" ? user.nameTh : user.name)}
            >
              <T en="Approve this exact revision" th="อนุมัติฉบับนี้" />
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => s.flash(exportNotice(rev, s.lang))}
            >
              {canFinalExport(rev)
                ? <T en="Export approved DOCX/PDF" th="ส่งออก DOCX/PDF ที่อนุมัติ" />
                : <T en="Preview draft (marked DRAFT)" th="ดูร่าง (ติดตรา DRAFT)" />}
            </button>
          </div>
        </>
      )}

      <NextBestAction title={next.title} why={L(s.lang, spec.never)} href={next.href || spec.engineHref} />
    </div>
  );
}
