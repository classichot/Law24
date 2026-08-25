"use client";

import { useStore } from "@/lib/store";
import modules from "@/data/modules.json";
import { Kicker, Stats, Title } from "@/components/ui";
import { L } from "@/lib/model";
import { T } from "@/lib/i18n";

const NG = modules.ng;
const OB = modules.ob;

export function NegotiateScreen({ screen }: { screen: string }) {
  if (screen === "nstrat") return <Strat />;
  if (screen === "npos") return <Pos />;
  if (screen === "nresp") return <Resp />;
  if (screen === "nhist") return <Hist />;
  return <Strat />;
}

function Strat() {
  const s = useStore();
  return (
    <div className="pad-page">
      <Kicker>negotiate · cockpit</Kicker>
      <Title><T en="Positions, leverage and what we can trade" th="จุดยืน อำนาจต่อรอง และสิ่งที่แลกได้" /></Title>
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
    </div>
  );
}

function Pos() {
  const s = useStore();
  return (
    <div className="pad-page">
      <Kicker>negotiate · tracker</Kicker>
      <Title><T en="Position tracker" th="ตารางจุดยืนรายประเด็น" /></Title>
      <table className="table">
        <thead><tr><th><T en="Issue" th="ประเด็น" /></th><th><T en="Tier" th="ลำดับ" /></th><th><T en="Us" th="เรา" /></th><th><T en="Them" th="คู่สัญญา" /></th><th><T en="Gap" th="ระยะ" /></th><th></th></tr></thead>
        <tbody>
          {NG.positions.map((p, i) => (
            <tr key={i}>
              <td style={{ fontWeight: 700 }}>{L(s.lang, p.i)}</td>
              <td>{p.tier}</td>
              <td>{L(s.lang, p.us)}</td>
              <td>{L(s.lang, p.them)}</td>
              <td>{p.gap}</td>
              <td><span className="tag tag-neutral">{p.st}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Resp() {
  const s = useStore();
  return (
    <div className="pad-page">
      <Kicker>negotiate · recommended moves</Kicker>
      <Title><T en="Recommended next moves, with draft wording" th="ก้าวถัดไปที่แนะนำ พร้อมร่างข้อความ" /></Title>
      {NG.moves.map((m, i) => (
        <div key={i} className="panel" style={{ marginBottom: 12 }}>
          <div className="panel-head">
            <h5 style={{ margin: 0 }}>{L(s.lang, m.i)}</h5>
            <span className="tag tag-accent">{m.k}</span>
          </div>
          <div className="panel-body">
            <p className="text-muted">{L(s.lang, m.why)}</p>
            <div className="callout"><T en="Draft message" th="ร่างข้อความถึงคู่สัญญา" /> — {L(s.lang, m.msg)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Hist() {
  const s = useStore();
  const th = s.lang === "th";
  return (
    <div className="pad-page">
      <Kicker>negotiate · rounds</Kicker>
      <Title><T en="Negotiation rounds and what moved" th="รอบการเจรจาและสิ่งที่เปลี่ยนไป" /></Title>
      {NG.rounds.map((r) => (
        <div key={r.n} style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 16, padding: "16px 0", borderBottom: "2px solid var(--color-divider)" }}>
          <div style={{ font: "800 22px/1 var(--font-heading)", color: r.st === "next" ? "var(--color-accent)" : "inherit" }}>{r.n}</div>
          <div>
            <div style={{ fontWeight: 700 }}>{L(s.lang, r.who)} · {th ? r.d : r.de}</div>
            <p>{L(s.lang, r.s)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ObligationsScreen({ screen }: { screen: string }) {
  if (screen === "oreg") return <Reg />;
  if (screen === "ocal") return <Cal />;
  if (screen === "oren") return <Ren />;
  if (screen === "oalert") return <Alert />;
  return <Reg />;
}

function Reg() {
  const s = useStore();
  return (
    <div className="pad-page">
      <Kicker>obligations · register</Kicker>
      <Title><T en="Post-signature obligation register" th="ทะเบียนข้อผูกพันหลังลงนาม" /></Title>
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
    </div>
  );
}

function Cal() {
  const s = useStore();
  const max = Math.max(...OB.cal.map((c) => c.n));
  return (
    <div className="pad-page">
      <Kicker>obligations · calendar</Kicker>
      <Title><T en="The next six months of deadlines" th="ปฏิทินกำหนดเวลาหกเดือนข้างหน้า" /></Title>
      <div className="grid-2" style={{ marginTop: 20 }}>
        {OB.cal.map((c, i) => (
          <div key={i} style={{ padding: 16, border: "2px solid var(--color-divider)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><strong>{L(s.lang, c.m)}</strong><span>{c.n}</span></div>
            <div className="bar-track" style={{ margin: "10px 0" }}><div className="bar-fill" style={{ width: `${Math.round((c.n / max) * 100)}%`, background: c.n > 150 ? "var(--color-accent)" : "var(--color-text)" }} /></div>
            {c.items.map((it, n) => <div key={n} className="text-muted" style={{ fontSize: 13 }}>{L(s.lang, it)}</div>)}
          </div>
        ))}
      </div>
    </div>
  );
}

function Ren() {
  const s = useStore();
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
    </div>
  );
}

function Alert() {
  const s = useStore();
  return (
    <div className="pad-page">
      <Kicker>obligations · alerts</Kicker>
      <Title><T en="Alerts requiring action" th="การแจ้งเตือนที่ต้องดำเนินการ" /></Title>
      {OB.alerts.map((a, i) => (
        <div key={i} style={{ display: "flex", gap: 14, padding: 14, marginBottom: 8, border: "2px solid var(--color-divider)", background: a.k === "red" ? "var(--color-accent-100)" : "var(--color-bg)" }}>
          <span className="sev-pill" style={{ background: a.k === "red" ? "var(--color-accent)" : a.k === "amber" ? "var(--color-accent-200)" : "var(--color-neutral-200)", color: a.k === "red" ? "var(--color-bg)" : "inherit" }}>{a.t}</span>
          <div style={{ flex: 1 }}>
            <div>{L(s.lang, a.i)}</div>
            <div className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>{L(s.lang, a.ow)} · {L(s.lang, a.a)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
