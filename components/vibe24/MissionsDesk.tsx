"use client";

import { useRouter } from "next/navigation";
import { Kicker, Title } from "@/components/ui";
import { T } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { MISSIONS, missionsFor, currentMission } from "@/lib/vibe24";
import { Ask24, GoalCards } from "./Ask24";
import { MissionCard, MissionJourney } from "./MissionViews";
import { AssistLevelSwitch, ComplexityGuard } from "./primitives";

export function MissionsDesk() {
  const s = useStore();
  const router = useRouter();
  const inst = currentMission(s.experience);
  const mine = s.experience.missions;
  const catalog = missionsFor(s.edition, s.uxRole);

  return (
    <div className="pad-page">
      <Kicker>ask 24 · missions</Kicker>
      <Title><T en="My missions" th="ภารกิจของฉัน" /></Title>
      <p className="page-sub">
        <T
          en="A mission is the bridge from a goal to Review, Assembly or Diligence. Agents may draft. Counsel confirms. The engine never signs."
          th="ภารกิจคือสะพานจากเป้าหมายสู่ตรวจ ร่าง หรือตรวจสอบสถานะ เอเจนต์ร่างได้ ทนายยืนยัน เครื่องยนต์ไม่ลงนาม"
        />
      </p>
      <AssistLevelSwitch />
      <div style={{ margin: "18px 0 28px" }}><Ask24 compact /></div>
      {inst && <MissionJourney inst={inst} />}
      <h5 style={{ marginTop: 28 }}><T en="In progress" th="กำลังทำ" /></h5>
      <div className="vibe-mission-grid">
        {mine.filter((m) => m.status !== "complete").map((m) => (
          <MissionCard key={m.id} def={MISSIONS[m.defId]} inst={m} />
        ))}
        {mine.filter((m) => m.status !== "complete").length === 0 && (
          <p className="text-muted"><T en="No open missions. Pick a goal below." th="ยังไม่มีภารกิจที่เปิด เลือกเป้าหมายด้านล่าง" /></p>
        )}
      </div>
      <h5 style={{ marginTop: 28 }}><T en="Start a mission" th="เริ่มภารกิจ" /></h5>
      <GoalCards />
      <h5 style={{ marginTop: 28 }}><T en="Catalog" th="รายการภารกิจ" /></h5>
      <div className="vibe-mission-grid">
        {catalog.map((d) => (
          <MissionCard key={d.id} def={d} onStart={() => router.push(s.startUxMission(d.id))} />
        ))}
      </div>
      <ComplexityGuard />
    </div>
  );
}
