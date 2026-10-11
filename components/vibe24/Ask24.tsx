"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { T } from "@/lib/i18n";
import { L } from "@/lib/model";
import { useStore } from "@/lib/store";
import { detectIntent, missionsFor, type MissionId } from "@/lib/vibe24";
import { MissionCard } from "./MissionViews";

export function Ask24({ compact = false }: { compact?: boolean }) {
  const s = useStore();
  const router = useRouter();
  const th = s.lang === "th";
  const [goal, setGoal] = useState(s.experience.goal);
  const [ran, setRan] = useState(Boolean(s.experience.goal));

  const hits = useMemo(
    () => (ran ? detectIntent(goal, s.edition, s.uxRole) : []),
    [ran, goal, s.edition, s.uxRole],
  );

  function onAsk(e: FormEvent) {
    e.preventDefault();
    if (!goal.trim()) return;
    s.setGoal(goal);
    setRan(true);
  }

  function start(id: MissionId) {
    const href = s.startUxMission(id);
    router.push(href);
  }

  return (
    <section className={`vibe-ask${compact ? " compact" : ""}`}>
      <div className="page-kicker"><T en="Ask LAW24" th="ถาม LAW24" /></div>
      <h2 style={{ margin: "6px 0 10px" }}>
        <T en="What would you like to achieve?" th="ต้องการบรรลุอะไร" />
      </h2>
      <p className="text-muted" style={{ marginTop: 0, maxWidth: "70ch" }}>
        <T
          en="Describe the outcome. LAW24 names the mission, the evidence it needs, and the next human decision. You do not need the menu first."
          th="บอกผลที่ต้องการ ระบบจะชี้ภารกิจ หลักฐานที่ต้องมี และการตัดสินใจที่คนต้องทำ ไม่ต้องรู้จักเมนูก่อน"
        />
      </p>
      <form className="vibe-ask-form" onSubmit={onAsk}>
        <textarea
          className="input assist-area"
          rows={compact ? 2 : 3}
          value={goal}
          onChange={(e) => { setGoal(e.target.value); setRan(false); }}
          placeholder={th ? "เช่น ลูกค้าส่ง MSA คลาวด์มา ต้องรู้ว่าลงนามได้หรือไม่" : "e.g. Counterparty sent a cloud MSA. Can we sign?"}
        />
        <button className="btn btn-primary" type="submit">
          <T en="Understand this goal" th="เข้าใจเป้าหมายนี้" />
        </button>
      </form>
      {ran && (
        <div className="vibe-intent-list">
          {hits.map((h) => (
            <div key={h.mission.id} className="vibe-intent">
              <MissionCard
                def={h.mission}
                onStart={() => start(h.mission.id)}
                why={L(s.lang, h.why)}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function GoalCards() {
  const s = useStore();
  const router = useRouter();
  const cards = missionsFor(s.edition, s.uxRole);
  return (
    <div className="vibe-goals">
      {cards.map((m) => (
        <button
          key={m.id}
          type="button"
          className={`vibe-goal eng-card ${m.module === "office" ? "" : `eng-${m.module === "assemble" ? "draft" : m.module === "diligence" ? "dd" : "review"}`}`}
          onClick={() => router.push(s.startUxMission(m.id))}
        >
          <strong>{L(s.lang, m.name)}</strong>
          <span className="text-muted">{L(s.lang, m.goal)}</span>
        </button>
      ))}
    </div>
  );
}
