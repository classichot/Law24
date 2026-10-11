"use client";

import Link from "next/link";
import { T } from "@/lib/i18n";
import { L } from "@/lib/model";
import { useStore } from "@/lib/store";
import { JOURNEY_STAGES, MISSIONS, type MissionDef, type MissionInstance } from "@/lib/vibe24";

export function MissionCard({
  def,
  inst,
  onStart,
  why,
}: {
  def: MissionDef;
  inst?: MissionInstance;
  onStart?: () => void;
  why?: string;
}) {
  const s = useStore();
  const th = s.lang === "th";
  const step = inst ? def.steps[inst.step] : def.steps[0];
  return (
    <article className="vibe-mission">
      <div className="page-kicker">
        {inst ? inst.status.replace("-", " ") : <T en="Ready to start" th="พร้อมเริ่ม" />}
        {def.reportPack ? ` · ${def.reportPack}` : ""}
      </div>
      <h3>{L(s.lang, def.name)}</h3>
      <p className="text-muted">{why || L(s.lang, def.goal)}</p>
      <div className="vibe-mission-meta">
        <span><T en="AI can complete" th="AI ทำให้ได้" /> <strong>{def.aiShare}%</strong></span>
        <span><T en="Your time" th="เวลาของคุณ" /> <strong>{L(s.lang, def.userTime)}</strong></span>
        <span><T en="Involvement" th="คุณต้องร่วม" /> <strong>{def.involvement}</strong></span>
      </div>
      {def.requires.length > 0 && (
        <ul className="vibe-requires">
          {def.requires.map((r) => (
            <li key={r.label.e}>{r.ok ? "✓" : "⚠"} {L(s.lang, r.label)}</li>
          ))}
        </ul>
      )}
      {step && (
        <p className="text-muted" style={{ fontSize: 13 }}>
          {th ? "ขั้นถัดไป" : "Next"}: {L(s.lang, step.name)} — {L(s.lang, step.need)}
        </p>
      )}
      <div className="stack-actions">
        {onStart
          ? <button type="button" className="btn btn-primary" onClick={onStart}><T en="Start mission" th="เริ่มภารกิจ" /></button>
          : <Link href={step?.href || "/home"} className="btn btn-primary"><T en="Continue mission" th="ทำภารกิจต่อ" /></Link>}
        {def.reportPack && (
          <Link href={`/outputs?s=studio&pack=${def.reportPack}`} className="btn btn-secondary">
            <T en="Report studio" th="ห้องรายงาน" />
          </Link>
        )}
      </div>
    </article>
  );
}

export function MissionJourney({ inst }: { inst: MissionInstance }) {
  const s = useStore();
  const def = MISSIONS[inst.defId];
  const used = new Set(def.steps.map((x) => x.stage));
  return (
    <div className="vibe-journey">
      <div className="vibe-journey-head">
        <strong>{L(s.lang, def.name)}</strong>
        <span><T en={`Step ${inst.step + 1} of ${def.steps.length}`} th={`ขั้นที่ ${inst.step + 1} จาก ${def.steps.length}`} /></span>
      </div>
      <ol className="vibe-journey-rail">
        {JOURNEY_STAGES.filter((st) => used.has(st.id)).map((st) => {
          const idx = def.steps.findIndex((x) => x.stage === st.id);
          const on = idx === inst.step;
          const done = idx >= 0 && idx < inst.step;
          return (
            <li key={st.id} className={`${on ? "on" : ""} ${done ? "done" : ""}`}>
              {L(s.lang, st.name)}
            </li>
          );
        })}
      </ol>
      <p>
        <T en="Where am I?" th="ตอนนี้อยู่ไหน" /> — {L(s.lang, def.steps[inst.step]?.name)}
      </p>
      <p className="text-muted">
        <T en="What does AI need from me?" th="AI ต้องการอะไรจากฉัน" /> — {L(s.lang, def.steps[inst.step]?.need)}
      </p>
      <div className="stack-actions">
        <Link href={def.steps[inst.step]?.href || "/home"} className="btn btn-primary">
          <T en="Continue mission" th="ทำภารกิจต่อ" />
        </Link>
        {inst.step > 0 && (
          <button type="button" className="btn btn-secondary" onClick={() => s.setMissionStep(inst.id, inst.step - 1)}>
            <T en="Back" th="ย้อน" />
          </button>
        )}
        {inst.step < def.steps.length - 1 && (
          <button type="button" className="btn btn-secondary" onClick={() => s.setMissionStep(inst.id, inst.step + 1)}>
            <T en="Mark step done" th="ทำขั้นนี้แล้ว" />
          </button>
        )}
      </div>
    </div>
  );
}
