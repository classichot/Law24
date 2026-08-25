"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ScreenRouter } from "@/components/screens/ScreenRouter";
import { defaultScreen, isMode } from "@/lib/nav";
import { HomeScreen } from "@/components/screens/Home";
import type { ModeKey } from "@/lib/model";

function Inner() {
  const params = useParams<{ mode: string }>();
  const search = useSearchParams();
  const mode = params.mode;
  if (!isMode(mode)) return <HomeScreen />;
  const screen = search.get("s") || defaultScreen(mode as ModeKey);
  return <ScreenRouter mode={mode} screen={screen} />;
}

export default function ModePage() {
  return (
    <Suspense fallback={<div className="pad-page" />}>
      <Inner />
    </Suspense>
  );
}
