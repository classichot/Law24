import type { Edition } from "@/lib/model";
import { defaultAssist, defaultRole, type AgiTeam, type AssistLevel, type UxMode, type UxRole } from "./ux";
import type { JourneyStage, MissionId } from "./missions";
import { MISSIONS } from "./missions";
import type { ReportPackId, ReportRevision } from "./reports/types";

export type MissionStatus = "ready" | "in-progress" | "waiting" | "ai-working" | "complete";

export type MissionInstance = {
  id: string;
  defId: MissionId;
  status: MissionStatus;
  step: number;
  startedAt: string;
};

export type ExperienceState = {
  uxMode: UxMode;
  assistLevel: AssistLevel;
  role: UxRole;
  agiTeam: AgiTeam;
  goal: string;
  activeMissionId: string | null;
  missions: MissionInstance[];
  reports: ReportRevision[];
  guardDismissed: boolean;
  navHits: number;
};

export function defaultExperience(edition: Edition): ExperienceState {
  const uxMode: UxMode = "easy";
  return {
    uxMode,
    assistLevel: defaultAssist(uxMode),
    role: defaultRole(edition),
    agiTeam: "single",
    goal: "",
    activeMissionId: null,
    missions: [],
    reports: [],
    guardDismissed: false,
    navHits: 0,
  };
}

export function hydrateExperience(raw: Partial<ExperienceState> | null, edition: Edition): ExperienceState {
  const base = defaultExperience(edition);
  if (!raw) return base;
  return {
    ...base,
    ...raw,
    missions: raw.missions || [],
    reports: raw.reports || [],
  };
}

export function startMissionState(prev: ExperienceState, defId: MissionId, now: string): ExperienceState {
  const existing = prev.missions.find((m) => m.defId === defId && m.status !== "complete");
  if (existing) return { ...prev, activeMissionId: existing.id, goal: MISSIONS[defId].goal.e };
  const row: MissionInstance = {
    id: `MSN-${defId}-${now.replace(/\W/g, "").slice(-8)}`,
    defId,
    status: "in-progress",
    step: 0,
    startedAt: now,
  };
  return {
    ...prev,
    activeMissionId: row.id,
    missions: [row, ...prev.missions],
    goal: MISSIONS[defId].goal.e,
  };
}

export function currentMission(state: ExperienceState): MissionInstance | null {
  return state.missions.find((m) => m.id === state.activeMissionId) || state.missions[0] || null;
}

export function stageOf(state: ExperienceState): JourneyStage | null {
  const inst = currentMission(state);
  if (!inst) return null;
  return MISSIONS[inst.defId].steps[inst.step]?.stage ?? null;
}

export function upsertReport(state: ExperienceState, report: ReportRevision): ExperienceState {
  const rest = state.reports.filter((r) => r.packId !== report.packId || r.demo !== report.demo);
  return { ...state, reports: [report, ...rest] };
}

export function latestReport(state: ExperienceState, pack?: ReportPackId): ReportRevision | null {
  return state.reports.find((r) => (pack ? r.packId === pack : true)) || null;
}
