"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, RotateCcw, X } from "lucide-react";
import { DEMO_STEPS, clampStep, isNeedMet, stepForHref } from "@/lib/demo";
import { useStore } from "@/lib/store";
import { T } from "@/lib/i18n";

export function DemoBar() {
  const s = useStore();
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const screen = params.get("s") || "";
  const th = s.lang === "th";
  const step = DEMO_STEPS[clampStep(s.demoStep)];
  const onScript = stepForHref(path, screen) === s.demoStep;
  const onHome = path === "/home";
  const done = isNeedMet(step.need, s);

  useEffect(() => {
    if (!s.demoOn) return;
    const i = stepForHref(path, screen);
    if (i >= 0 && i !== s.demoStep) s.setDemoStep(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, screen, s.demoOn]);

  if (!s.demoOn) return null;

  function go(n: number) {
    const i = clampStep(n);
    s.setDemoStep(i);
    const next = DEMO_STEPS[i];
    s.setMatter(next.matter);
    router.push(next.href);
  }

  const copy = th ? step.th : step.en;

  return (
    <div className="demo-bar no-print">
      <span className="demo-bar-kicker">
        {th ? "สาธิตสด" : "Live demo"} {s.demoStep + 1}/{DEMO_STEPS.length}
      </span>
      <div className="demo-bar-copy">
        <strong>{copy.title}</strong>
        <span>{onHome || onScript ? copy.coach : (th ? "ออกจากเส้นทางแล้ว — กลับไปขั้นนี้เพื่อทำต่อ" : "Off-script — return to this step to continue.")}</span>
      </div>
      <span className={`demo-bar-flag${done ? " on" : ""}`}>
        {done ? (th ? "ทำแล้ว" : "Done") : copy.action}
      </span>
      <div className="demo-bar-actions">
        {!(onScript || onHome) && (
          <button className="btn btn-secondary" onClick={() => router.push(step.href)}>
            <T en="Return" th="กลับขั้นนี้" />
          </button>
        )}
        <button className="icon-btn" disabled={s.demoStep === 0} onClick={() => go(s.demoStep - 1)} aria-label="Previous step">
          <ChevronLeft size={16} />
        </button>
        {onHome ? (
          <button className="btn btn-primary" onClick={() => { s.setMatter(step.matter); router.push(step.href); }}>
            <T en="Continue" th="ทำต่อ" />
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => go(s.demoStep + 1)} disabled={s.demoStep >= DEMO_STEPS.length - 1}>
            <T en="Next" th="ขั้นถัดไป" /> <ChevronRight size={14} />
          </button>
        )}
        <button className="icon-btn" title={th ? "เริ่มใหม่" : "Reset"} onClick={() => { s.resetDemo(); router.push(DEMO_STEPS[0].href); }}>
          <RotateCcw size={14} />
        </button>
        <button className="icon-btn" title={th ? "ซ่อน" : "Hide"} onClick={s.stopDemo}><X size={14} /></button>
      </div>
    </div>
  );
}
