"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { Kicker, Stats, Title } from "@/components/ui";
import { L } from "@/lib/model";
import { T } from "@/lib/i18n";
import { copyText, statusLabel, downloadText } from "@/lib/demo";
import { Dropzone } from "@/components/Dropzone";
import { AiLiveMark } from "@/components/AiLiveMark";
import { NeedMap } from "@/components/NeedMap";
import { negotiateOf, noticeText, obligationsOf } from "@/lib/ai/fromMap";

export function NegotiateScreen({ screen }: { screen: string }) {
  const s = useStore();
  if (!s.xrayLive) return <NeedMap kicker="negotiate · copilot" />;
  if (screen === "nstrat") return <Strat />;
  if (screen === "nladder") return <Ladder />;
  if (screen === "npos") return <Pos />;
  if (screen === "nresp") return <Resp />;
  if (screen === "nhist") return <Hist />;
  return <Strat />;
}

function Strat() {
  const s = useStore();
  const NG = negotiateOf(s.xrayLive!, s.reviewLive);
  return (
    <div className="pad-page">
      <Kicker>negotiate · cockpit</Kicker>
      <Title><T en="Positions, leverage and what we can trade" th="จุดยืน อำนาจต่อรอง และสิ่งที่แลกได้" /></Title>
      <Dropzone
        bucket="negotiate"
        compact
        title={<T en="Drop counterparty markup" th="ลาก redline ของคู่สัญญามาวาง" />}
        hint={<T en="DOCX with tracked changes, PDF, or a round table. Mapped to open positions on this paper." th="DOCX ที่มี tracked changes, PDF หรือตารางรอบเจรจา จับคู่จุดยืนที่ยังเปิดในฉบับนี้" />}
      />
      <div className="grid-3" style={{ margin: "20px 0" }}>
        {NG.tiers.map((t, i) => (
          <div key={i} style={{ padding: 16, border: "2px solid var(--color-divider)" }}>
            <div className="page-kicker">{L(s.lang, t.k)}</div>
            <div style={{ font: "800 28px/1 var(--font-heading)", margin: "8px 0" }}>{t.n}</div>
            <div className="text-muted">{L(s.lang, t.d)}</div>
          </div>
        ))}
      </div>
      <div className="grid-split">
        <div>
          <h5><T en="Our leverage" th="อำนาจต่อรองของเรา" /></h5>
          {NG.leverage.us.map((x, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>{L(s.lang, x.k)}</span><span>{x.w}</span></div>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${x.w}%` }} /></div>
            </div>
          ))}
        </div>
        <div>
          <h5><T en="Their leverage" th="อำนาจต่อรองของคู่สัญญา" /></h5>
          {NG.leverage.them.map((x, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>{L(s.lang, x.k)}</span><span>{x.w}</span></div>
              <div className="bar-track"><div className="bar-fill hot" style={{ width: `${x.w}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
      <h5 style={{ marginTop: 28 }}><T en="Concession ladder" th="บันไดการแลกเปลี่ยน" /></h5>
      <table className="table">
        <thead><tr><th><T en="What we give" th="สิ่งที่เราให้" /></th><th><T en="What we get" th="สิ่งที่เราได้" /></th><th><T en="Cost" th="ต้นทุน" /></th></tr></thead>
        <tbody>
          {NG.ladder.map((x, i) => (
            <tr key={i}><td>{L(s.lang, x.g)}</td><td>{L(s.lang, x.get)}</td><td>{L(s.lang, x.v)}</td></tr>
          ))}
        </tbody>
      </table>
      <h5 style={{ marginTop: 24 }}>{L(s.lang, NG.cpIntel.title)}</h5>
      {NG.cpIntel.rows.map((r, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--color-divider)" }}>
          <span>{L(s.lang, r.k)}</span><strong>{L(s.lang, r.v)}</strong>
        </div>
      ))}
      <div className="stack-actions" style={{ marginTop: 18 }}>
        <Link href="/negotiate?s=nladder" className="btn btn-primary"><T en="Open negotiation ladder" th="เปิดบันไดเจรจา" /></Link>
        <Link href="/negotiate?s=nresp" className="btn btn-secondary"><T en="Recommended responses" th="คำตอบที่แนะนำ" /></Link>
      </div>
    </div>
  );
}

function Ladder() {
  const s = useStore();
  const X = s.xrayLive!;
  const ladder = X.ladder;
  const email = X.email;
  return (
    <div className="pad-page">
      <Kicker>negotiate · copilot</Kicker>
      <Title><T en="Negotiation ladder" th="บันไดเจรจา" /></Title>
      <p className="page-sub">
        <T
          en="Preferred → acceptable → minimum → walk-away. Written from this map."
          th="จุดยืนที่ต้องการ → ประนีประนอมได้ → จุดต่ำสุด → เดินออก เขียนจากแผนที่นี้"
        />
      </p>
      <div className="grid-2" style={{ marginTop: 8 }}>
        {ladder.map((r) => (
          <div key={r.n} className="xray-layer">
            <div className="page-kicker">{r.n} · {L(s.lang, r.k)}</div>
            <p>{L(s.lang, r.v)}</p>
          </div>
        ))}
      </div>
      <h5 style={{ marginTop: 24 }}><T en="If they reject the redline" th="ถ้าพวกเขาปฏิเสธ redline" /></h5>
      <p style={{ maxWidth: "72ch" }}>{L(s.lang, X.brief)}</p>
      <div className="stack-actions" style={{ marginTop: 16 }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => { copyText(L(s.lang, email)).then(() => s.flash(s.lang === "th" ? "คัดลอกอีเมลคู่สัญญาแล้ว" : "Counterparty email copied")).catch(() => s.flash(s.lang === "th" ? "บันทึกจุดยืนแล้ว" : "Position recorded")); }}
        >
          <T en="Copy counterparty email" th="คัดลอกอีเมลคู่สัญญา" />
        </button>
        <Link href="/negotiate?s=nresp" className="btn btn-secondary"><T en="Recommended responses" th="คำตอบที่แนะนำ" /></Link>
        <Link href="/review?s=xray" className="btn btn-secondary">X-Ray</Link>
      </div>
    </div>
  );
}

function Pos() {
  const s = useStore();
  const NG = negotiateOf(s.xrayLive!, s.reviewLive);
  return (
    <div className="pad-page">
      <Kicker>negotiate · tracker</Kicker>
      <Title><T en="Position tracker" th="ตารางจุดยืนรายประเด็น" /></Title>
      <table className="table">
        <thead><tr><th><T en="Issue" th="ประเด็น" /></th><th><T en="Tier" th="ลำดับ" /></th><th><T en="Us" th="เรา" /></th><th><T en="Them" th="คู่สัญญา" /></th><th><T en="Gap" th="ระยะ" /></th><th></th></tr></thead>
        <tbody>
          {NG.positions.map((p, i) => {
            const id = String(i);
            const st = s.positionStatus[id] || p.st;
            return (
              <tr key={i}>
                <td style={{ fontWeight: 700 }}>{L(s.lang, p.i)}</td>
                <td>{p.tier}</td>
                <td>{L(s.lang, p.us)}</td>
                <td>{L(s.lang, p.them)}</td>
                <td>{p.gap}</td>
                <td>
                  <button type="button" className="tag tag-neutral" style={{ cursor: "pointer", border: 0 }} onClick={() => {
                    const cycle: "hold" | "agreed" | "open" = st === "open" || st === "countered" ? "hold" : st === "hold" ? "agreed" : "open";
                    s.setPositionStatus(id, cycle);
                    s.flash(`${L(s.lang, p.i)} → ${statusLabel(s.lang, cycle)}`);
                  }}>
                    {statusLabel(s.lang, st)}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Resp() {
  const s = useStore();
  const NG = negotiateOf(s.xrayLive!, s.reviewLive);
  const moves = s.negotiateLive?.moves ?? NG.moves;

  return (
    <div className="pad-page">
      <Kicker>negotiate · recommended moves · <AiLiveMark compact /></Kicker>
      <Title><T en="Recommended next moves, with draft wording" th="ก้าวถัดไปที่แนะนำ พร้อมร่างข้อความ" /></Title>
      {moves.map((m, i) => {
        const id = String(i);
        const sent = s.sentMoves[id];
        return (
          <div key={i} className="panel" style={{ marginBottom: 12 }}>
            <div className="panel-head">
              <h5 style={{ margin: 0 }}>{L(s.lang, m.i)}</h5>
              <span className="tag tag-accent">{m.k}</span>
            </div>
            <div className="panel-body">
              <p className="text-muted">{L(s.lang, m.why)}</p>
              <div className="callout"><T en="Draft message" th="ร่างข้อความถึงคู่สัญญา" /> — {L(s.lang, m.msg)}</div>
              <button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: 12 }}
                onClick={() => {
                  copyText(L(s.lang, m.msg)).then(() => {
                    s.sendMove(id);
                    s.flash(s.lang === "th" ? "คัดลอกข้อความแล้ว" : "Message copied");
                  }).catch(() => {
                    s.sendMove(id);
                    s.flash(s.lang === "th" ? "บันทึกจุดยืนแล้ว" : "Position recorded");
                  });
                }}
              >
                {sent ? <T en="Copied — copy again" th="คัดลอกแล้ว — คัดลอกอีกครั้ง" /> : <T en="Copy to negotiation table" th="คัดลอกไปโต๊ะเจรจา" />}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Hist() {
  const s = useStore();
  const th = s.lang === "th";
  const NG = negotiateOf(s.xrayLive!, s.reviewLive);
  return (
    <div className="pad-page">
      <Kicker>negotiate · rounds</Kicker>
      <Title><T en="Negotiation rounds and what moved" th="รอบการเจรจาและสิ่งที่เปลี่ยนไป" /></Title>
      <Dropzone
        bucket="negotiate"
        compact
        title={<T en="Drop this round’s paper" th="ลากเอกสารรอบนี้มาวาง" />}
        hint={<T en="Incoming markup or our outgoing pack for the next round." th="redline ที่เข้ามา หรือชุดที่เราจะส่งออกรอบถัดไป" />}
      />
      {NG.rounds.map((r) => (
        <div key={r.n} style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 16, padding: "16px 0", borderBottom: "2px solid var(--color-divider)" }}>
          <div style={{ font: "800 22px/1 var(--font-heading)", color: r.st === "next" ? "var(--color-accent)" : "inherit" }}>{r.n}</div>
          <div>
            <div style={{ fontWeight: 700 }}>{L(s.lang, r.who)} · {th ? r.d : r.de}</div>
            <p>{L(s.lang, r.s)}</p>
          </div>
        </div>
      ))}
      <div className="stack-actions" style={{ marginTop: 16 }}>
        <Link href="/negotiate?s=nresp" className="btn btn-primary"><T en="Copy next move" th="คัดลอกก้าวถัดไป" /></Link>
        <Link href="/obligations?s=oreg" className="btn btn-secondary"><T en="Obligation register" th="ทะเบียนข้อผูกพัน" /></Link>
      </div>
    </div>
  );
}

export function ObligationsScreen({ screen }: { screen: string }) {
  const s = useStore();
  if (!s.xrayLive) return <NeedMap kicker="obligations" />;
  if (screen === "oreg") return <Reg />;
  if (screen === "ocal") return <Cal />;
  if (screen === "oren") return <Ren />;
  if (screen === "oalert") return <Alert />;
  return <Reg />;
}

function Reg() {
  const s = useStore();
  const OB = obligationsOf(s.xrayLive!);
  return (
    <div className="pad-page">
      <Kicker>obligations · register</Kicker>
      <Title><T en="Post-signature obligation register" th="ทะเบียนข้อผูกพันหลังลงนาม" /></Title>
      <Dropzone
        bucket="obligations"
        compact
        title={<T en="Drop executed copies or evidence" th="ลากฉบับลงนามหรือหลักฐานมาวาง" />}
        hint={<T en="Signed PDF, e-Sign certificate, invoices, notices served. Filed against this map." th="PDF ที่ลงนามแล้ว ใบรับรอง e-Sign ใบแจ้งหนี้ หนังสือบอกกล่าว เก็บเข้าทะเบียนของฉบับนี้" />}
      />
      <Stats items={OB.stats.map((x) => ({ v: typeof x.v === "string" ? x.v : L(s.lang, x.v), k: L(s.lang, x.k) }))} />
      <table className="table" style={{ marginTop: 20 }}>
        <thead><tr><th><T en="Obligation" th="ข้อผูกพัน" /></th><th>cl.</th><th><T en="Owner" th="ผู้รับผิดชอบ" /></th><th><T en="Type" th="ประเภท" /></th><th><T en="Due" th="กำหนด" /></th><th></th></tr></thead>
        <tbody>
          {OB.register.map((r, i) => (
            <tr key={i}>
              <td>{L(s.lang, r.o)}</td>
              <td className="mono">{r.c}</td>
              <td>{L(s.lang, r.ow)}</td>
              <td>{L(s.lang, r.ty)}</td>
              <td>{r.d}</td>
              <td><span className={r.st === "over" || r.st === "soon" ? "tag tag-signal" : "tag tag-neutral"}>{r.st}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="stack-actions" style={{ marginTop: 16 }}>
        <Link href="/obligations?s=ocal" className="btn btn-primary"><T en="Open calendar" th="เปิดปฏิทิน" /></Link>
        <Link href="/obligations?s=oalert" className="btn btn-secondary"><T en="Open alerts" th="เปิดการแจ้งเตือน" /></Link>
      </div>
    </div>
  );
}

function Cal() {
  const s = useStore();
  const OB = obligationsOf(s.xrayLive!);
  const max = Math.max(1, ...OB.cal.map((c) => c.n));
  return (
    <div className="pad-page">
      <Kicker>obligations · calendar</Kicker>
      <Title><T en="Deadlines from this map" th="กำหนดเวลาจากแผนที่นี้" /></Title>
      <div className="grid-2" style={{ marginTop: 20 }}>
        {OB.cal.map((c, i) => (
          <div key={i} style={{ padding: 16, border: "2px solid var(--color-divider)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><strong>{L(s.lang, c.m)}</strong><span>{c.n}</span></div>
            <div className="bar-track" style={{ margin: "10px 0" }}><div className="bar-fill" style={{ width: `${Math.round((c.n / max) * 100)}%`, background: "var(--color-text)" }} /></div>
            {c.items.map((it, n) => <div key={n} className="text-muted" style={{ fontSize: 13 }}>{L(s.lang, it)}</div>)}
          </div>
        ))}
      </div>
      <div className="stack-actions" style={{ marginTop: 16 }}>
        <Link href="/obligations?s=oalert" className="btn btn-primary"><T en="Open alerts" th="เปิดการแจ้งเตือน" /></Link>
        <Link href="/obligations?s=oren" className="btn btn-secondary"><T en="Renewal pipeline" th="ท่อต่ออายุ" /></Link>
      </div>
    </div>
  );
}

function Ren() {
  const s = useStore();
  const OB = obligationsOf(s.xrayLive!);
  const X = s.xrayLive!;
  return (
    <div className="pad-page">
      <Kicker>obligations · renewals</Kicker>
      <Title><T en="Renewals awaiting a decision" th="การต่ออายุที่ต้องตัดสินใจ" /></Title>
      <table className="table">
        <thead><tr><th><T en="Contract" th="สัญญา" /></th><th><T en="Value" th="มูลค่า" /></th><th><T en="Expiry" th="สิ้นสุด" /></th><th><T en="Notice" th="บอกกล่าว" /></th><th><T en="Left" th="เหลือ" /></th><th></th></tr></thead>
        <tbody>
          {OB.renewals.map((r, i) => (
            <tr key={i}>
              <td>{L(s.lang, r.c)}</td>
              <td>{L(s.lang, r.v)}</td>
              <td>{r.x}</td>
              <td>{r.d}</td>
              <td>{r.l}d</td>
              <td><span className={r.k === "reneg" || r.k === "exit" ? "tag tag-signal" : "tag tag-neutral"}>{r.k}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="stack-actions" style={{ marginTop: 16 }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            downloadText(`LAW24-${X.ref}-notice.txt`, noticeText(s.lang, X));
            s.completeAlert("0");
            s.flash(s.lang === "th" ? "ร่างหนังสือจากแผนที่แล้ว — ทนายเป็นผู้ลงนาม" : "Notice drafted from the map — counsel signs");
          }}
        >
          <T en="Draft notice from this map" th="ร่างหนังสือจากแผนที่นี้" />
        </button>
        <Link href="/obligations?s=oalert" className="btn btn-secondary"><T en="Serve from alerts" th="ส่งจากรายการแจ้งเตือน" /></Link>
      </div>
    </div>
  );
}

function Alert() {
  const s = useStore();
  const OB = obligationsOf(s.xrayLive!);
  return (
    <div className="pad-page">
      <Kicker>obligations · alerts</Kicker>
      <Title><T en="Alerts requiring action" th="การแจ้งเตือนที่ต้องดำเนินการ" /></Title>
      {OB.alerts.map((a, i) => {
        const id = String(i);
        const done = s.alertDone[id];
        return (
          <div key={i} style={{ display: "flex", gap: 14, padding: 14, marginBottom: 8, border: "2px solid var(--color-divider)", background: done ? "var(--color-surface)" : a.k === "red" ? "var(--color-signal-200)" : "var(--color-bg)" }}>
            <span className="sev-pill" style={{ background: done ? "var(--color-neutral-800)" : a.k === "red" ? "var(--color-hot)" : a.k === "amber" ? "var(--color-accent-200)" : "var(--color-neutral-200)", color: a.k === "red" && !done ? "#f3f2f2" : "inherit" }}>{done ? (s.lang === "th" ? "เสร็จ" : "Done") : a.t}</span>
            <div style={{ flex: 1 }}>
              <div>{L(s.lang, a.i)}</div>
              <div className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>{L(s.lang, a.ow)} · {L(s.lang, a.a)}</div>
            </div>
            <button
              type="button"
              className={`btn ${done ? "btn-secondary" : "btn-primary"}`}
              onClick={() => { s.completeAlert(id); s.flash(s.lang === "th" ? "ดำเนินการแล้ว" : "Action recorded"); }}
            >
              {done ? <T en="Recorded" th="บันทึกแล้ว" /> : <T en="Do this now" th="ทำทันที" />}
            </button>
          </div>
        );
      })}
    </div>
  );
}
