"use client";

import { AssembleScreen } from "./Assemble";
import { ReviewScreen } from "./Review";
import { HolisticScreen } from "./Holistic";
import { DiligenceScreen } from "./Diligence";
import { NegotiateScreen, ObligationsScreen } from "./Negotiate";
import { IntelScreen } from "./Intel";
import { HomeScreen } from "./Home";
import { PracticeScreen } from "./Practice";
import { AssistScreen } from "./Assist";
import { HelpScreen } from "./Help";
import { CommandScreen } from "./Command";
import type { ModeKey } from "@/lib/model";

export function ScreenRouter({ mode, screen }: { mode: ModeKey; screen: string }) {
  if (mode === "home") return <HomeScreen />;
  if (mode === "practice") return <PracticeScreen screen={screen} />;
  if (mode === "command") return <CommandScreen screen={screen} />;
  if (mode === "assist") return <AssistScreen />;
  if (mode === "help") return <HelpScreen screen={screen} />;
  if (mode === "assemble") return <AssembleScreen screen={screen} />;
  if (mode === "review") return <ReviewScreen screen={screen} />;
  if (mode === "holistic") return <HolisticScreen screen={screen} />;
  if (mode === "diligence") return <DiligenceScreen screen={screen} />;
  if (mode === "negotiate") return <NegotiateScreen screen={screen} />;
  if (mode === "obligations") return <ObligationsScreen screen={screen} />;
  if (mode === "intel") return <IntelScreen screen={screen} />;
  return <HomeScreen />;
}
