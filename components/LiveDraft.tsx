"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { T } from "@/lib/i18n";
import { L } from "@/lib/model";
import { TAX_LIST } from "@/lib/taxonomy";
import { factsForLiveDraft } from "@/lib/assembly";
import { buildLiveDraft, type LiveDraftClause } from "@/lib/liveDraft";
import { StandardClause } from "@/components/StandardClause";

function compactRows(clauses: LiveDraftClause[]): LiveDraftClause[] {
  const woven = /Counsel-confirmed intake|ข้อมูลที่ทนายยืนยัน/;
  const preferred = clauses.filter((c) =>
    c.id === "draft:parties" ||
    c.id === "draft:purpose" ||
    c.id === "draft:law" ||
    woven.test(`${c.b.t} ${c.b.e}`)
  );
  const rest = clauses.filter((c) => !preferred.some((p) => p.id === c.id));
  const out: LiveDraftClause[] = [];
  const seen = new Set<string>();
  for (const c of [...preferred, ...rest]) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    out.push(c);
    if (out.length >= 5) break;
  }
  return out;
}

export function LiveDraftView({
  compact = false,
  showAdjust = true,
}: {
  compact?: boolean;
  showAdjust?: boolean;
}) {
  const s = useStore();
  const th = s.lang === "th";
  const type = TAX_LIST.find((r) => r.id === s.sel) || TAX_LIST[0];
  const facts = factsForLiveDraft(s.assembly);
  const draft = buildLiveDraft({
    typeId: type.id,
    facts,
    conflictChoice: s.conflictChoice,
  });
  const rows = compact ? compactRows(draft.clauses) : draft.clauses;
  const adjusted = draft.clauses.filter((c) => s.clauseEdits[c.id]).length;

  return (
    <div className={`live-draft${compact ? " compact" : ""}`}>
      <header className="live-draft-head">
        <div>
          <div className="page-kicker">live draft · {type.id} · {th ? "ยังไม่ลงนาม" : "not signed"}</div>
          <h3 style={{ margin: "6px 0 0" }}>{L(s.lang, draft.title)}</h3>
        </div>
        <div className="live-draft-meta">
          <span className="tag tag-accent">{draft.clauses.length} {th ? "ข้อ" : "clauses"}</span>
          {adjusted > 0 && <span className="tag tag-outline">{adjusted} {th ? "ปรับแล้ว" : "adjusted"}</span>}
          <span className="tag tag-outline">{facts.length} {th ? "ข้อเท็จจริง" : "facts"}</span>
        </div>
      </header>
      <p className="live-draft-lede">{L(s.lang, draft.posture)}</p>

      {rows.map((c) => {
        const body = s.clauseEdits[c.id]?.body ?? c.b;
        return (
          <div key={c.id} className="live-draft-clause">
            <div className="live-draft-fired">{L(s.lang, c.firedBy)}</div>
            {showAdjust && !compact ? (
              <StandardClause id={c.id} kicker={`${c.n} ${L(s.lang, c.h)}`} original={c.b} />
            ) : (
              <div className="clause-block">
                <div style={{ font: "800 12px/1 var(--font-heading)", color: "var(--color-accent)" }}>
                  {c.n} {L(s.lang, c.h)}
                </div>
                <p style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{L(s.lang, body)}</p>
              </div>
            )}
          </div>
        );
      })}

      {compact && (
        <div className="stack-actions" style={{ marginTop: 8 }}>
          {draft.clauses.length > rows.length && (
            <p className="text-muted" style={{ fontSize: 12, margin: "0 0 8px" }}>
              +{draft.clauses.length - rows.length} {th ? "ข้อในร่างเต็ม" : "more clauses in the full draft"}
            </p>
          )}
          <Link href="/assemble?s=asm" className="btn btn-primary">
            <T en="Open live draft and adjust clause by clause" th="เปิดร่างสดแล้วปรับทีละข้อ" />
          </Link>
        </div>
      )}
    </div>
  );
}
