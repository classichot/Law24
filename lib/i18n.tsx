"use client";

import { useStore } from "@/lib/store";
import type { Lang } from "@/lib/model";
import type { ReactNode } from "react";

export type Copy = { en: string; th: string };

export function pick(lang: Lang, o: Copy): string {
  return lang === "th" ? o.th : o.en;
}

export function T({ en, th }: { en: ReactNode; th: ReactNode }) {
  const { lang } = useStore();
  return <>{lang === "th" ? th : en}</>;
}

export function tx(lang: Lang, en: string, th: string) {
  return lang === "th" ? th : en;
}
