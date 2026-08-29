"use client";

import Link from "next/link";
import { T } from "@/lib/i18n";
import { ENGAGEMENT, type EngagementTrack } from "@/lib/firm";
import { firmControlFor } from "@/lib/nav";
import { useStore } from "@/lib/store";

export function EngPill({ track }: { track: EngagementTrack }) {
  const th = useStore().lang === "th";
  const e = ENGAGEMENT[track];
  return <span className={`eng-pill ${e.cls}`}>{th ? e.tagTh : e.tagEn}</span>;
}

export function TrackCard({ track, open }: { track: EngagementTrack; open: number }) {
  const th = useStore().lang === "th";
  const e = ENGAGEMENT[track];
  const hops = firmControlFor(track);
  return (
    <div className={`home-card eng-card ${e.cls}`} style={{ minHeight: 0, gap: 10 }}>
      <div className="eng-bar" />
      <EngPill track={track} />
      <div style={{ fontWeight: 800, fontSize: 18 }}>{th ? e.th : e.en}</div>
      <p className="text-muted" style={{ margin: 0, fontSize: 13 }}>{th ? e.why.t : e.why.e}</p>
      <div style={{ fontSize: 12, color: "var(--color-neutral-600)" }}>
        {open} {th ? "งานเปิด" : "open"} · {th ? e.record.t : e.record.e}
      </div>
      <div className="text-muted" style={{ fontSize: 11 }}>
        {hops.map((h) => (th ? h.th : h.en)).join(" · ")}
      </div>
      <div className="stack-actions" style={{ marginTop: 4 }}>
        <Link href={e.firmHref} className="btn btn-primary" style={{ fontSize: 12 }}>
          <T en="Control" th="ควบคุม" />
        </Link>
        <Link href={e.recordHref} className="btn btn-secondary" style={{ fontSize: 12 }}>
          <T en="Record" th="บันทึก" />
        </Link>
        <Link href={e.href} className="btn btn-ghost" style={{ fontSize: 12 }}>
          {track === "review" ? "X-Ray" : track === "assemble" ? <T en="Assemble" th="ประกอบ" /> : <T en="DD" th="DD" />}
        </Link>
      </div>
    </div>
  );
}
