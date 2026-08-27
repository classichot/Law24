"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useStore, modeHref } from "@/lib/store";
import {
  MODULE_GUIDES,
  OS_FLOW,
  copyTE,
  helpBookHref,
  moduleFlowSteps,
  playbookKeyFor,
  playbookOf,
  screenGuide,
} from "@/lib/guides";
import { isMode } from "@/lib/nav";
import { T } from "@/lib/i18n";
import type { ModeKey } from "@/lib/model";

export function GuideRail({ mode, screen }: { mode: string; screen: string }) {
  const { lang, matter, edition, demoOn } = useStore();
  const [open, setOpen] = useState(true);
  useEffect(() => {
    if (demoOn) setOpen(false);
  }, [demoOn]);
  if (!isMode(mode)) return null;
  const th = lang === "th";
  const pb = playbookOf(mode, matter);
  const pbKey = playbookKeyFor(mode, matter);
  const mod = MODULE_GUIDES[mode];
  const sc = screenGuide(mode, screen);
  const steps = moduleFlowSteps(mode);
  const os = edition === "firm"
    ? OS_FLOW.filter((x) => x.k !== "command")
    : OS_FLOW.filter((x) => x.k !== "practice");

  return (
    <section className="guide-rail no-print">
      <div className="guide-compact">
        <Link href={helpBookHref(pbKey)} className="guide-book" title={copyTE(lang, pb.applies)}>
          <BookOpen size={14} />
          <span>
            <em><T en="Playbook" th="เพลย์บุ๊ก" /></em>
            {copyTE(lang, pb.name)} · {pb.ver}
          </span>
        </Link>
        <ol className="guide-flow">
          {steps.map((st) => (
            <li key={st.k}>
              <Link href={modeHref(mode as ModeKey, st.k)} className={st.k === screen ? "on" : ""}>
                {th ? st.t : st.e}
              </Link>
            </li>
          ))}
        </ol>
        <button type="button" className="guide-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <T en="Explain" th="คำอธิบาย" />
        </button>
      </div>
      {open && (
        <div className="guide-body">
          <div>
            <div className="guide-kicker"><T en="This menu" th="เมนูนี้" /></div>
            <p>{copyTE(lang, sc.why)}</p>
            <p className="guide-do"><strong><T en="Do now" th="ทำตอนนี้" /></strong> — {copyTE(lang, sc.do)}</p>
          </div>
          <div>
            <div className="guide-kicker"><T en="Rule in force" th="กฎที่ใช้บังคับ" /></div>
            <p>{copyTE(lang, sc.rule)}</p>
            <p className="guide-do">{copyTE(lang, mod.osFlow)}</p>
          </div>
          <div>
            <div className="guide-kicker">{copyTE(lang, pb.name)}</div>
            <ul className="guide-rules">
              {pb.rules.map((r) => (
                <li key={r.e}>{copyTE(lang, r)}</li>
              ))}
            </ul>
            <Link href={helpBookHref(pbKey)} className="guide-open"><T en="Open attached playbook" th="เปิดเพลย์บุ๊กที่ติดมา" /> →</Link>
          </div>
          <div className="guide-os">
            <div className="guide-kicker"><T en="OS flow" th="เส้นทางระบบ" /></div>
            <ol>
              {os.map((m) => (
                <li key={m.k} className={m.k === mode ? "on" : ""}>
                  <Link href={modeHref(m.k)}>{th ? m.th : m.en}</Link>
                </li>
              ))}
            </ol>
            <p>{copyTE(lang, mod.purpose)}</p>
          </div>
        </div>
      )}
    </section>
  );
}
