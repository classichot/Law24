"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { T } from "@/lib/i18n";
import { L } from "@/lib/model";
import { useStore } from "@/lib/store";
import {
  AGI_TEAMS,
  ASSIST_LEVELS,
  UX_MODES,
  UX_ROLES,
  type AssistLevel,
  type UxMode,
} from "@/lib/vibe24";

export function ExplainThis({
  term,
  what,
  why,
  meaning,
  action,
}: {
  term: ReactNode;
  what: ReactNode;
  why: ReactNode;
  meaning: ReactNode;
  action: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <span className="vibe-explain">
      <button type="button" className="vibe-explain-btn" onClick={() => setOpen((v) => !v)}>
        ⓘ <T en="Explain this" th="อธิบายข้อนี้" />
      </button>
      {open && (
        <div className="vibe-explain-card" role="note">
          <strong>{term}</strong>
          <p><span className="page-kicker"><T en="What is this?" th="นี่คืออะไร" /></span> {what}</p>
          <p><span className="page-kicker"><T en="Why it matters" th="ทำไมสำคัญ" /></span> {why}</p>
          <p><span className="page-kicker"><T en="For this matter" th="กับงานนี้" /></span> {meaning}</p>
          <p><span className="page-kicker"><T en="What you should do" th="ควรทำอะไร" /></span> {action}</p>
        </div>
      )}
    </span>
  );
}

export function UxModeToggle() {
  const s = useStore();
  return (
    <div className="vibe-seg" role="tablist" aria-label="UX mode">
      {UX_MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          className={s.uxMode === m.id ? "on" : ""}
          onClick={() => s.setUxMode(m.id as UxMode)}
        >
          {L(s.lang, m.name)}
        </button>
      ))}
    </div>
  );
}

export function AssistLevelSwitch() {
  const s = useStore();
  return (
    <div className="vibe-seg vibe-seg-wide" role="tablist" aria-label="Assistance">
      {ASSIST_LEVELS.map((m) => (
        <button
          key={m.id}
          type="button"
          className={s.assistLevel === m.id ? "on" : ""}
          onClick={() => s.setAssistLevel(m.id as AssistLevel)}
        >
          {L(s.lang, m.name)}
        </button>
      ))}
    </div>
  );
}

export function RoleSwitch() {
  const s = useStore();
  return (
    <div className="vibe-seg" role="tablist" aria-label="Role">
      {UX_ROLES.map((m) => (
        <button key={m.id} type="button" className={s.uxRole === m.id ? "on" : ""} onClick={() => s.setUxRole(m.id)}>
          {L(s.lang, m.name)}
        </button>
      ))}
    </div>
  );
}

export function AgiTeamSwitch() {
  const s = useStore();
  if (s.uxMode !== "agi") return null;
  return (
    <div className="vibe-seg" role="tablist" aria-label="AGI team">
      {AGI_TEAMS.map((m) => (
        <button key={m.id} type="button" className={s.agiTeam === m.id ? "on" : ""} onClick={() => s.setAgiTeam(m.id)}>
          {L(s.lang, m.name)}
        </button>
      ))}
    </div>
  );
}

export function AdvancedSettings({ title, children }: { title?: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="vibe-advanced">
      <button type="button" className="btn btn-ghost" onClick={() => setOpen((v) => !v)}>
        {title || <T en="Advanced settings" th="การตั้งค่าขั้นสูง" />} {open ? "▴" : "▾"}
      </button>
      {open && <div className="vibe-advanced-body">{children}</div>}
    </div>
  );
}

export function NextBestAction({
  title,
  why,
  href,
  onClick,
  label,
}: {
  title: ReactNode;
  why: ReactNode;
  href?: string;
  onClick?: () => void;
  label?: ReactNode;
}) {
  const inner = (
    <>
      <span className="page-kicker"><T en="What should I do next?" th="ขั้นถัดไปคืออะไร" /></span>
      <strong>{title}</strong>
      <span className="text-muted">{why}</span>
      <span className="btn btn-primary">{label || <T en="Continue" th="ทำต่อ" />}</span>
    </>
  );
  if (href) {
    return <Link href={href} className="vibe-nba">{inner}</Link>;
  }
  return (
    <button type="button" className="vibe-nba" onClick={onClick}>
      {inner}
    </button>
  );
}

export function WhyAiChose({
  reason,
  data,
  assumptions,
  alternatives,
}: {
  reason: ReactNode;
  data: ReactNode;
  assumptions: ReactNode;
  alternatives: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="vibe-why">
      <button type="button" className="btn btn-ghost" onClick={() => setOpen((v) => !v)}>
        <T en="Why did AI choose this?" th="ทำไม AI เลือกแบบนี้" />
      </button>
      {open && (
        <div className="callout">
          <p><strong><T en="Reasoning" th="เหตุผล" /></strong> — {reason}</p>
          <p><strong><T en="Data used" th="ข้อมูลที่ใช้" /></strong> — {data}</p>
          <p><strong><T en="Assumptions" th="สมมติฐาน" /></strong> — {assumptions}</p>
          <p><strong><T en="Alternatives" th="ทางเลือกอื่น" /></strong> — {alternatives}</p>
        </div>
      )}
    </div>
  );
}

export function ResultInterpreter({
  result,
  happened,
  meaning,
  goodBad,
  compare,
  why,
  next,
  fixHref,
  fixLabel,
}: {
  result: ReactNode;
  happened: ReactNode;
  meaning: ReactNode;
  goodBad: ReactNode;
  compare: ReactNode;
  why: ReactNode;
  next: ReactNode;
  fixHref?: string;
  fixLabel?: ReactNode;
}) {
  return (
    <div className="vibe-result">
      <div className="vibe-result-head">{result}</div>
      <dl>
        <div><dt><T en="What happened?" th="เกิดอะไร" /></dt><dd>{happened}</dd></div>
        <div><dt><T en="What does it mean?" th="หมายความว่าอะไร" /></dt><dd>{meaning}</dd></div>
        <div><dt><T en="Good or bad?" th="ดีหรือไม่ดี" /></dt><dd>{goodBad}</dd></div>
        <div><dt><T en="Compared with what?" th="เทียบกับอะไร" /></dt><dd>{compare}</dd></div>
        <div><dt><T en="Why?" th="ทำไม" /></dt><dd>{why}</dd></div>
        <div><dt><T en="What next?" th="ต่อไปอะไร" /></dt><dd>{next}</dd></div>
      </dl>
      {fixHref && (
        <Link href={fixHref} className="btn btn-primary">{fixLabel || <T en="Let AI help" th="ให้ AI ช่วย" />}</Link>
      )}
    </div>
  );
}

export function ComplexityGuard() {
  const s = useStore();
  if (s.guardDismissed || s.navHits < 8 || s.uxMode === "professional") return null;
  const inst = s.experience.missions[0];
  return (
    <div className="vibe-guard" role="status">
      <strong><T en="Need some help?" th="ต้องการความช่วยเหลือไหม" /></strong>
      <p>
        <T
          en="LAW24 can guide this, or do the repetitive work and ask you only for gaps and approvals."
          th="LAW24 พาทำได้ หรือทำส่วนซ้ำแล้วถามเฉพาะช่องว่างและการอนุมัติ"
        />
      </p>
      <div className="stack-actions">
        <button type="button" className="btn btn-primary" onClick={() => { s.setAssistLevel("guide"); s.setUxMode("easy"); }}>
          <T en="Guide me" th="พาทำ" />
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => { s.setAssistLevel("forMe"); s.setUxMode("agi"); }}>
          <T en="Do it for me" th="ทำให้" />
        </button>
        {inst && (
          <Link href="/missions?s=desk" className="btn btn-ghost"><T en="Open my missions" th="เปิดภารกิจของฉัน" /></Link>
        )}
        <button type="button" className="btn btn-ghost" onClick={s.dismissGuard}><T en="Dismiss" th="ปิด" /></button>
      </div>
    </div>
  );
}
