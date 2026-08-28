"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BookOpen } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  PLAYBOOKS,
  copyTE,
  helpBookHref,
  modeFromHref,
  playbookKeyFor,
  screenGuide,
} from "@/lib/guides";
import { isMode, NAV } from "@/lib/nav";

export function PlaybookMark({
  mode: modeProp,
  screen: screenProp,
  href,
  compact = true,
}: {
  mode?: string;
  screen?: string;
  href?: string;
  compact?: boolean;
}) {
  const path = usePathname();
  const params = useSearchParams();
  const { lang, matter } = useStore();
  const parsed = href ? modeFromHref(href) : null;
  const mode = modeProp ?? parsed?.mode ?? (path === "/home" || path === "/" ? "home" : path.replace("/", "").split("/")[0]);
  const screen = screenProp ?? parsed?.screen ?? params.get("s") ?? (isMode(mode) ? NAV[mode][0][0] : "home");

  if (mode === "home" || !mode) {
    return (
      <Link href="/help?s=books" className={`pb-mark${compact ? " compact" : ""}`}>
        <BookOpen size={12} />
        <span>PB-HLP · {lang === "th" ? "คลังเพลย์บุ๊ก" : "Playbook library"}</span>
      </Link>
    );
  }
  if (!isMode(mode)) return null;
  const key = playbookKeyFor(mode, matter);
  const pb = PLAYBOOKS[key];
  const guide = screenGuide(mode, screen);
  return (
    <Link
      href={helpBookHref(key)}
      className={`pb-mark${compact ? " compact" : ""}`}
      title={copyTE(lang, guide.rule)}
    >
      <BookOpen size={12} />
      <span>{pb.id} · {copyTE(lang, pb.name)} · {pb.ver}</span>
    </Link>
  );
}
