"use client";

import { AssembleScreen } from "./Assemble";
import { ReviewScreen } from "./Review";
import { HolisticScreen } from "./Holistic";
import { DiligenceScreen } from "./Diligence";
import { NegotiateScreen, ObligationsScreen } from "./Negotiate";
import { IntelScreen } from "./Intel";
import { HomeScreen } from "./Home";
import type { ModeKey } from "@/lib/model";

export function ScreenRouter({ mode, screen }: { mode: ModeKey; screen: string }) {
  if (mode === "home") return <HomeScreen />;
  if (mode === "assemble") return <AssembleScreen screen={screen} />;
  if (mode === "review") return <ReviewScreen screen={screen} />;
  if (mode === "holistic") return <HolisticScreen screen={screen} />;
  if (mode === "diligence") return <DiligenceScreen screen={screen} />;
  if (mode === "negotiate") return <NegotiateScreen screen={screen} />;
  if (mode === "obligations") return <ObligationsScreen screen={screen} />;
  if (mode === "intel") return <IntelScreen screen={screen} />;
  return <HomeScreen />;
}
