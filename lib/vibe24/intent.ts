import type { Edition, TE } from "@/lib/model";
import { routeAssist } from "@/lib/assist";
import { MISSIONS, missionsFor, type MissionDef, type MissionId } from "./missions";
import type { UxRole } from "./ux";

const P = (t: string, e: string): TE => ({ t, e });

export type IntentHit = {
  mission: MissionDef;
  score: number;
  why: TE;
};

function scoreMission(text: string, mission: MissionDef): number {
  const q = text.toLowerCase();
  if (!q.trim()) return 0;
  return mission.keywords.reduce((n, k) => n + (q.includes(k.toLowerCase()) ? 2 : 0), 0);
}

/** Goal → mission. Reuses the Assist router as a capability hint, then maps to a mission. */
export function detectIntent(goal: string, edition: Edition, role: UxRole): IntentHit[] {
  const catalog = missionsFor(edition, role);
  const scored = catalog
    .map((mission) => ({
      mission,
      score: scoreMission(goal, mission),
      why: mission.why,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length) return scored.slice(0, 3);

  const assist = goal.trim() ? routeAssist(role === "specialist" ? "Partner" : "GC", goal, edition) : null;
  if (assist) {
    const mapped = catalog.find((m) =>
      (assist.assignmentType === "review" && m.id === "analyse-contract")
      || (assist.assignmentType === "assemble" && m.id === "draft-contract")
      || (assist.assignmentType === "diligence" && m.id === "diligence-deal")
      || (assist.assignmentType === "obligations" && m.id === "track-obligations"),
    );
    if (mapped) {
      return [{ mission: mapped, score: assist.start.score, why: assist.start.why }];
    }
  }

  return [{ mission: MISSIONS["dont-know"], score: 1, why: P("ยังไม่ชัด — เริ่มจากคำอธิบายงาน", "Not yet clear — start by describing the job") }];
}

export function missionById(id: string): MissionDef | null {
  return (MISSIONS as Record<string, MissionDef>)[id] ?? null;
}

export function recommendedMissions(edition: Edition, role: UxRole, hasXray: boolean, hasDeal: boolean): MissionId[] {
  const out: MissionId[] = [];
  if (!hasXray) out.push("analyse-contract");
  else out.push("decision-paper");
  if (!hasDeal) out.push("diligence-deal");
  out.push("draft-contract");
  if (role === "contributor") out.unshift("track-obligations");
  if (role === "management") out.push("decision-paper");
  return [...new Set(out)].slice(0, 4);
}
