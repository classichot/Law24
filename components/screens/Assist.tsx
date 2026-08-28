"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { Kicker, Title } from "@/components/ui";
import { useStore } from "@/lib/store";
import { T } from "@/lib/i18n";
import { copyTE, helpBookHref } from "@/lib/guides";
import { TYPE_LABEL } from "@/lib/firm";
import { ASSIST_EXAMPLES, assistTitle, playbookName, routeAssist } from "@/lib/assist";
import { AiLiveMark } from "@/components/AiLiveMark";

export function AssistScreen() {
  const s = useStore();
  const router = useRouter();
  const th = s.lang === "th";
  const [job, setJob] = useState(s.edition === "firm" ? (th ? "หุ้นส่วน ที่ปรึกษา" : "Partner, external counsel") : (th ? "GC องค์กร" : "In-house GC"));
  const [brief, setBrief] = useState("");
  const [clientId, setClientId] = useState(s.practice.clients[0]?.id || "");
  const [ran, setRan] = useState(false);

  const result = useMemo(() => (ran ? routeAssist(job, brief, s.edition) : null), [ran, job, brief, s.edition]);

  function onAsk(e: FormEvent) {
    e.preventDefault();
    if (!job.trim() && !brief.trim()) return;
    setRan(true);
  }

  function useExample(jobT: string, briefT: string) {
    setJob(jobT);
    setBrief(briefT);
    setRan(true);
  }

  function openAssignment() {
    if (!result || s.edition !== "firm" || !clientId) return;
    const title = assistTitle(brief, s.lang);
    s.addAssignment({
      clientId,
      title,
      titleTh: title,
      type: result.assignmentType,
      due: "2026-09-30",
      lead: "Kanit S.",
      fee: "THB 0",
    });
    s.flash(th ? "เปิดงานจากผู้ช่วยแล้ว" : "Assignment opened from Assist");
    router.push("/practice?s=trace");
  }

  return (
    <div className="pad-page">
      <Kicker>assist · intake</Kicker>
      <Title><T en="Describe the job and the assignment" th="อธิบายงานและคำสั่ง" /> <AiLiveMark compact /></Title>
      <p className="page-sub">
        <T
          en="Tell LAW24 who you are and what must be done. It names the module and the function that should run the work — the lawyer still decides."
          th="บอกว่าคุณเป็นใครและต้องทำอะไร ระบบจะชี้โมดูลและฟังก์ชันที่ควรรันงานนี้ — ทนายเป็นผู้ตัดสิน"
        />
      </p>

      <form className="assist-form" onSubmit={onAsk}>
        <div className="field">
          <label><T en="Your job / role" th="งาน / บทบาทของคุณ" /></label>
          <input
            className="input"
            value={job}
            onChange={(e) => { setJob(e.target.value); setRan(false); }}
            placeholder={th ? "เช่น GC, หุ้นส่วน, จัดซื้อ, DPO, ทนายฝั่งผู้ซื้อ" : "e.g. GC, partner, procurement, DPO, buy-side counsel"}
          />
        </div>
        <div className="field">
          <label><T en="The assignment" th="คำสั่ง / งานที่ต้องทำ" /></label>
          <textarea
            className="input assist-area"
            rows={4}
            value={brief}
            onChange={(e) => { setBrief(e.target.value); setRan(false); }}
            placeholder={th ? "อธิบายว่าลูกค้าหรือธุรกิจต้องการอะไร ใครส่งเอกสารมา กำหนดเมื่อใด" : "What the business or client needs, who sent the paper, and when it is due"}
          />
        </div>
        <div className="assist-examples">
          {ASSIST_EXAMPLES.map((ex) => (
            <button
              key={ex.brief.e}
              type="button"
              className="filter-chip"
              onClick={() => useExample(copyTE(s.lang, ex.job), copyTE(s.lang, ex.brief))}
            >
              {copyTE(s.lang, ex.job)} — {copyTE(s.lang, ex.brief)}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" type="submit">
          <Sparkles size={16} /> <T en="Suggest modules and functions" th="แนะนำโมดูลและฟังก์ชัน" />
        </button>
      </form>

      {ran && result && (
        <div className="assist-out">
          <div className="assist-read">
            <div>
              <div className="guide-kicker"><T en="Job as read" th="บทบาทที่อ่านได้" /></div>
              <p>{copyTE(s.lang, result.jobRead)}</p>
            </div>
            <div>
              <div className="guide-kicker"><T en="Assignment as read" th="งานที่อ่านได้" /></div>
              <p>{copyTE(s.lang, result.briefRead)}</p>
            </div>
            <div>
              <div className="guide-kicker"><T en="Playbook to attach" th="เพลย์บุ๊กที่ควรติด" /></div>
              <p>{playbookName(result.playbook, s.lang)}</p>
              <Link href={helpBookHref(result.playbook)}>{th ? "เปิดเพลย์บุ๊ก" : "Open playbook"} →</Link>
            </div>
          </div>

          <div className="assist-start">
            <div className="guide-kicker"><T en="Start here" th="เริ่มที่นี่" /></div>
            <h3 style={{ margin: "0 0 8px", fontSize: 20 }}>
              {result.start.mode} · {copyTE(s.lang, result.start.label)}
            </h3>
            <p className="page-sub" style={{ margin: "0 0 14px" }}>{copyTE(s.lang, result.start.why)}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Link href={result.start.href} className="btn btn-primary">
                <T en="Open this function" th="เปิดฟังก์ชันนี้" /> <ArrowRight size={14} />
              </Link>
              {s.edition === "firm" && (
                <>
                  <select className="input" style={{ width: 220 }} value={clientId} onChange={(e) => setClientId(e.target.value)}>
                    {s.practice.clients.map((c) => (
                      <option key={c.id} value={c.id}>{th ? c.nameTh : c.name}</option>
                    ))}
                  </select>
                  <button type="button" className="btn btn-secondary" onClick={openAssignment}>
                    <T en="Open as assignment" th="เปิดเป็นงานในสำนักงาน" />
                  </button>
                </>
              )}
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--color-neutral-600)" }}>
              <T en="Suggested assignment type" th="ประเภทงานที่แนะนำ" />: {th ? TYPE_LABEL[result.assignmentType].th : TYPE_LABEL[result.assignmentType].en}
            </div>
          </div>

          <h5><T en="Modules that can help" th="โมดูลที่ช่วยได้" /></h5>
          <div className="assist-mods">
            {result.modules.map((m) => (
              <div key={m.mode} className="assist-mod">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                  <strong style={{ textTransform: "capitalize" }}>{m.mode}</strong>
                  <Link href={m.href} style={{ fontSize: 12 }}><T en="Open" th="เปิด" /> →</Link>
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--color-neutral-700)" }}>{copyTE(s.lang, m.why)}</p>
                <ul>
                  {m.functions.map((fn) => (
                    <li key={fn.href}>
                      <Link href={fn.href}>{copyTE(s.lang, fn.label)}</Link>
                      <span>{copyTE(s.lang, fn.why)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h5><T en="Suggested path" th="เส้นทางที่แนะนำ" /></h5>
          <ol className="assist-path">
            {result.path.map((step, i) => (
              <li key={step.href}>
                <span className="assist-n">{i + 1}</span>
                <div>
                  <Link href={step.href}>{step.mode} · {copyTE(s.lang, step.label)}</Link>
                  <div className="text-muted" style={{ fontSize: 12 }}>{copyTE(s.lang, step.why)}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {ran && !result && (
        <p className="text-muted" style={{ marginTop: 20 }}>
          <T en="Add a job or an assignment first." th="ใส่บทบาทหรือคำสั่งก่อน" />
        </p>
      )}
    </div>
  );
}
