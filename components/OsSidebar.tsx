"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { ASSIST_MODE, HELP_MODE, MODULES, productModuleOf } from "@/lib/nav";
import { modeHref, useStore } from "@/lib/store";
import { T } from "@/lib/i18n";
import { EditionBadge } from "@/components/EditionBadge";

export function OsSidebar({
  mode,
  open,
  officeHref,
  officeLabel,
  officeOn,
  onClose,
}: {
  mode: string;
  open: boolean;
  officeHref: string;
  officeLabel: string;
  officeOn: boolean;
  onClose: () => void;
}) {
  const s = useStore();
  const th = s.lang === "th";
  const active = productModuleOf(mode);

  return (
    <>
      <div className={`os-rail-backdrop${open ? " open" : ""}`} onClick={onClose} />
      <aside className={`os-rail${open ? " open" : ""}`} aria-label={th ? "โมดูลหลัก" : "Product modules"}>
        <div className="os-rail-top">
          <Link href="/home" className="os-rail-brand" onClick={onClose}>
            <span className="os-brand-name">LAW<span className="os-brand-24">24</span></span>
            <span className="os-os-badge">os</span>
          </Link>
          <button className="icon-btn os-rail-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="os-rail-edition"><EditionBadge /></div>

        <Link href={officeHref} className={`os-rail-office${officeOn ? " on" : ""}`} onClick={onClose}>
          <span className="os-rail-k">{th ? "สำนักงาน" : "Office"}</span>
          <strong>{officeLabel}</strong>
        </Link>

        <div className="os-rail-kicker">
          <T en="Three modules" th="สามโมดูลหลัก" />
        </div>

        {MODULES.map((mod) => {
          const on = active?.id === mod.id;
          return (
            <div key={mod.id} className={`os-rail-mod ${mod.cls}${on ? " on" : ""}`}>
              <Link href={mod.href} className="os-rail-mod-head" onClick={onClose}>
                <span className="os-rail-n">{mod.n}</span>
                <span className="os-rail-mod-copy">
                  <strong>{th ? mod.th : mod.en}</strong>
                  <em>{th ? mod.markTh : mod.mark}</em>
                </span>
              </Link>
              {on && mod.engines.length > 1 && (
                <div className="os-rail-engines">
                  {mod.engines.map((eng) => (
                    <Link
                      key={eng.k}
                      href={eng.href}
                      className={mode === eng.k ? "on" : ""}
                      onClick={onClose}
                    >
                      {th ? eng.th : eng.en}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div className="os-rail-kicker">
          <T en="Guide" th="คู่มือ" />
        </div>
        <Link href={modeHref(ASSIST_MODE.k)} className={`os-rail-link${mode === "assist" ? " on" : ""}`} onClick={onClose}>
          {th ? ASSIST_MODE.th : ASSIST_MODE.en}
        </Link>
        <Link href={modeHref(HELP_MODE.k)} className={`os-rail-link${mode === "help" ? " on" : ""}`} onClick={onClose}>
          {th ? HELP_MODE.th : HELP_MODE.en}
        </Link>
      </aside>
    </>
  );
}
