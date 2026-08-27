"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { isMode, screenSiblings } from "@/lib/nav";
import { modeHref, useStore } from "@/lib/store";
import { T } from "@/lib/i18n";

export function ScreenNav({ mode, screen }: { mode: string; screen: string }) {
  const { lang } = useStore();
  if (!isMode(mode)) return null;
  const { prev, next } = screenSiblings(mode, screen);
  if (!prev && !next) return null;
  return (
    <div className="screen-nav no-print">
      {prev ? (
        <Link href={modeHref(mode, prev[0])} className="btn btn-secondary">
          <ChevronLeft size={14} /> {lang === "th" ? prev[1] : prev[2]}
        </Link>
      ) : <span />}
      {next ? (
        <Link href={modeHref(mode, next[0])} className="btn btn-primary">
          {lang === "th" ? next[1] : next[2]} <ChevronRight size={14} />
        </Link>
      ) : (
        <span className="text-muted" style={{ fontSize: 12 }}><T en="End of this module" th="จบโมดูลนี้" /></span>
      )}
    </div>
  );
}
