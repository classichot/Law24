"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { T } from "@/lib/i18n";
import { L } from "@/lib/model";
import { useStore } from "@/lib/store";
import { MISSIONS, recommendedMissions, currentMission } from "@/lib/vibe24";
import { assignmentOf, clientOf } from "@/lib/firm";
import { withLiveMatter } from "@/lib/ai/fromMap";
import { Ask24, GoalCards } from "./Ask24";
import { MissionCard, MissionJourney } from "./MissionViews";
import { AgiTeamSwitch, AssistLevelSwitch, ComplexityGuard, NextBestAction, RoleSwitch, UxModeToggle } from "./primitives";
import { EditionBadge } from "@/components/EditionBadge";

export function ExperienceHome() {
  const s = useStore();
  const router = useRouter();
  const books = withLiveMatter(s.practice, s.xrayLive, s.reviewLive);
  const a = assignmentOf(books, books.activeAssignmentId) || books.assignments[0];
  const c = a ? clientOf(books, a.clientId) : undefined;
  const rec = recommendedMissions(s.edition, s.uxRole, Boolean(s.xrayReady || s.xrayLive), Boolean(s.deal?.verified));
  const inst = currentMission(s.experience);
  const waiting = s.experience.missions.filter((m) => m.status === "waiting" || m.status === "in-progress");
  const nextDef = inst ? MISSIONS[inst.defId] : MISSIONS[rec[0]];

  return (
    <div className="home-wrap vibe-home">
      <header className="vibe-home-head">
        <div>
          <div className="home-kicker-row">
            <span>LAW24</span>
            <EditionBadge size="lg" />
          </div>
          <h1><T en="Complex underneath. Simple on top." th="ซับซ้อนข้างล่าง ง่ายข้างบน" /></h1>
          <p className="text-muted">
            <T
              en="Tell LAW24 the outcome. It routes Review, Assembly and Diligence, then asks you only for gaps and approvals. The engine never signs."
              th="บอกผลที่ต้องการ ระบบจะจัดตรวจ ร่าง และตรวจสอบสถานะ แล้วถามเฉพาะช่องว่างกับการอนุมัติ เครื่องยนต์ไม่ลงนาม"
            />
          </p>
        </div>
        <div className="vibe-home-modes">
          <UxModeToggle />
          <AssistLevelSwitch />
          <RoleSwitch />
          <AgiTeamSwitch />
        </div>
      </header>

      <Ask24 />

      <section>
        <h5><T en="Recommended actions" th="การกระทำที่แนะนำ" /></h5>
        <GoalCards />
      </section>

      <section>
        <h5><T en="My missions" th="ภารกิจของฉัน" /></h5>
        {inst ? (
          <MissionJourney inst={inst} />
        ) : (
          <div className="vibe-mission-grid">
            {rec.map((id) => (
              <MissionCard key={id} def={MISSIONS[id]} onStart={() => router.push(s.startUxMission(id))} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h5><T en="Attention required" th="ต้องตัดสินใจ" /></h5>
        <div className="vibe-attention">
          {!s.xrayReady && !s.xrayLive && (
            <p><T en="No mapped contract yet — analyse a paper or run the Review demo." th="ยังไม่มีแผนที่สัญญา — วิเคราะห์ฉบับหรือเปิดสาธิตตรวจ" /></p>
          )}
          {waiting.length === 0 && (s.xrayReady || s.xrayLive) && (
            <p className="text-muted"><T en="No open exceptions. Humans review decisions — they do not chase menus." th="ไม่มีข้อยกเว้นที่เปิด คนตรวจการตัดสินใจ ไม่ไล่เมนู" /></p>
          )}
          {c && a && (
            <p>{s.lang === "th" ? c.nameTh : c.name} · {a.id} · {s.lang === "th" ? a.titleTh : a.title}</p>
          )}
        </div>
      </section>

      <section>
        <h5><T en="Management snapshot" th="ภาพรวมผู้บริหาร" /></h5>
        <div className="stat-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          {[
            { v: s.xrayLive || s.xrayReady ? "1" : "0", k: s.lang === "th" ? "แผนที่สัญญา" : "Mapped papers" },
            { v: String(s.experience.missions.filter((m) => m.status !== "complete").length), k: s.lang === "th" ? "ภารกิจที่เปิด" : "Open missions" },
            { v: String(s.experience.reports.filter((r) => r.status !== "approved").length), k: s.lang === "th" ? "รายงานรออนุมัติ" : "Reports awaiting approval" },
            { v: s.deal?.verified ? "1" : "0", k: s.lang === "th" ? "ห้องดีลที่ยืนยัน" : "Verified deal rooms" },
          ].map((x) => (
            <div key={x.k} className="stat-cell-os">
              <div style={{ font: "800 24px/1 var(--font-heading)" }}>{x.v}</div>
              <div style={{ fontSize: 11, color: "var(--color-neutral-600)", marginTop: 7 }}>{x.k}</div>
            </div>
          ))}
        </div>
      </section>

      {nextDef && (
        <NextBestAction
          title={L(s.lang, nextDef.steps[inst?.step || 0]?.name || nextDef.name)}
          why={L(s.lang, nextDef.steps[inst?.step || 0]?.need || nextDef.goal)}
          href={nextDef.steps[inst?.step || 0]?.href || "/assist?s=ask"}
          label={<T en="Continue" th="ทำต่อ" />}
        />
      )}

      <div className="stack-actions" style={{ marginTop: 24 }}>
        <Link href="/outputs?s=studio" className="btn btn-secondary"><T en="Reports / outputs" th="รายงาน / ผลลัพธ์" /></Link>
        <Link href={s.edition === "firm" ? "/practice?s=dash" : "/command?s=desk"} className="btn btn-ghost">
          <T en="All modules" th="โมดูลทั้งหมด" />
        </Link>
      </div>
      <ComplexityGuard />
    </div>
  );
}
