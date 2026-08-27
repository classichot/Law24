"use client";

import Link from "next/link";
import { Kicker, Title } from "@/components/ui";
import { useStore } from "@/lib/store";
import { T } from "@/lib/i18n";
import { L } from "@/lib/model";
import { COMMAND, ENTRANCES, TRUST_STRIP } from "@/lib/product";

export function CommandScreen({ screen }: { screen: string }) {
  if (screen === "requests") return <Requests />;
  if (screen === "approvals") return <Approvals />;
  if (screen === "counsel") return <Counsel />;
  if (screen === "board") return <Board />;
  return <Desk />;
}

function Desk() {
  const s = useStore();
  const th = s.lang === "th";
  return (
    <div className="pad-page">
      <Kicker>control · corporate command</Kicker>
      <Title><T en="Legal command center" th="ศูนย์บัญชาการกฎหมาย" /></Title>
      <p className="page-sub">{L(s.lang, ENTRANCES.corporate.pitch)}</p>
      <div className="grid-3" style={{ margin: "24px 0" }}>
        {[
          { href: "/command?s=requests", k: th ? "คำขอกฎหมาย" : "Legal requests", n: "3 open" },
          { href: "/command?s=approvals", k: th ? "การอนุมัติ" : "Approvals", n: th ? "DPO ค้าง" : "DPO pending" },
          { href: "/review?s=xray", k: "Contract X-Ray", n: "Nimbus · Negotiate" },
          { href: "/intel?s=twin", k: th ? "ฝาแฝดกฎหมาย" : "Legal Twin", n: "212 uncapped" },
          { href: "/command?s=counsel", k: th ? "ที่ปรึกษาภายนอก" : "Outside counsel", n: "7L Advisory" },
          { href: "/command?s=board", k: th ? "รายงานคณะกรรมการ" : "Board reports", n: th ? "หนึ่งหน้า" : "One-pager" },
        ].map((x) => (
          <Link key={x.href} href={x.href} className="home-card" style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ fontWeight: 700 }}>{x.k}</div>
            <div className="text-muted" style={{ fontSize: 12, marginTop: 8 }}>{x.n}</div>
          </Link>
        ))}
      </div>
      <p className="text-muted" style={{ fontSize: 12 }}>{L(s.lang, ENTRANCES.corporate.fear)} {L(s.lang, TRUST_STRIP[1])}</p>
    </div>
  );
}

function Requests() {
  const s = useStore();
  return (
    <div className="pad-page">
      <Kicker>control · intake</Kicker>
      <Title><T en="Legal requests" th="คำขอกฎหมาย" /></Title>
      <table className="table">
        <thead><tr><th>ID</th><th><T en="Request" th="คำขอ" /></th><th><T en="From" th="จาก" /></th><th><T en="Status" th="สถานะ" /></th></tr></thead>
        <tbody>
          {COMMAND.requests.map((r) => (
            <tr key={r.id}><td className="mono">{r.id}</td><td>{L(s.lang, r.k)}</td><td>{r.by}</td><td>{r.st}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Approvals() {
  const s = useStore();
  return (
    <div className="pad-page">
      <Kicker>control · approvals</Kicker>
      <Title><T en="Approvals" th="การอนุมัติ" /></Title>
      {COMMAND.approvals.map((a) => (
        <div key={a.k.e} className="xray-kv"><span>{L(s.lang, a.k)}</span><strong>{L(s.lang, a.st)}</strong></div>
      ))}
      <Link href="/assemble?s=draft" className="btn btn-primary" style={{ marginTop: 18 }}><T en="Open DPO gate" th="เปิดด่าน DPO" /></Link>
    </div>
  );
}

function Counsel() {
  const s = useStore();
  return (
    <div className="pad-page">
      <Kicker>control · outside counsel</Kicker>
      <Title><T en="Outside-counsel management" th="บริหารที่ปรึกษาภายนอก" /></Title>
      {COMMAND.counsel.map((c) => (
        <div key={c.k.e} className="xray-kv"><span>{L(s.lang, c.k)}</span><strong>{L(s.lang, c.v)}</strong></div>
      ))}
    </div>
  );
}

function Board() {
  const s = useStore();
  return (
    <div className="pad-page">
      <Kicker>control · board</Kicker>
      <Title><T en="Management and board reports" th="รายงานผู้บริหารและคณะกรรมการ" /></Title>
      <div className="stack-actions" style={{ marginTop: 12 }}>
        {COMMAND.board.map((b) => (
          <Link key={b.href} href={b.href} className="btn btn-secondary">{L(s.lang, b.k)}</Link>
        ))}
      </div>
    </div>
  );
}
