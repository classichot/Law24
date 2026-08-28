"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Kicker, Title } from "@/components/ui";
import { PlaybookMark } from "@/components/PlaybookMark";
import { useStore } from "@/lib/store";
import { T } from "@/lib/i18n";
import { L } from "@/lib/model";
import { COMMAND, ENTRANCES, TRUST_STRIP } from "@/lib/product";
import { boardPackText, downloadText, statusLabel, type RequestStatus } from "@/lib/demo";

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
            <PlaybookMark href={x.href} compact />
            <div style={{ fontWeight: 700, marginTop: 8 }}>{x.k}</div>
            <div className="text-muted" style={{ fontSize: 12, marginTop: 8 }}>{x.n}</div>
          </Link>
        ))}
      </div>
      <div className="stack-actions">
        <Link href="/command?s=requests" className="btn btn-primary"><T en="Work open requests" th="ไล่คำขอที่ยังเปิด" /></Link>
        <Link href="/review?s=xray" className="btn btn-secondary">X-Ray · Nimbus</Link>
        <Link href="/intel?s=twin" className="btn btn-secondary"><T en="Ask the Twin" th="ถามฝาแฝด" /></Link>
      </div>
      <p className="text-muted" style={{ fontSize: 12, marginTop: 16 }}>{L(s.lang, ENTRANCES.corporate.fear)} {L(s.lang, TRUST_STRIP[1])}</p>
    </div>
  );
}

function Requests() {
  const s = useStore();
  const router = useRouter();
  const th = s.lang === "th";
  return (
    <div className="pad-page">
      <Kicker>control · intake</Kicker>
      <Title><T en="Legal requests" th="คำขอกฎหมาย" /></Title>
      <p className="page-sub"><T en="Open a row to work it in the engine. Status is recorded on this desk — the engine never signs." th="เปิดแถวเพื่อทำงานในเครื่องยนต์ สถานะบันทึกที่โต๊ะนี้ — เครื่องยนต์ไม่ลงนามแทน" /></p>
      <table className="table">
        <thead><tr><th>ID</th><th><T en="Request" th="คำขอ" /></th><th><T en="From" th="จาก" /></th><th><T en="Status" th="สถานะ" /></th><th /></tr></thead>
        <tbody>
          {COMMAND.requests.map((r) => {
            const st = (s.requestStatus[r.id] || r.st) as RequestStatus | string;
            return (
              <tr key={r.id} className="clickable" onClick={() => { s.startXray(); router.push(r.href); }}>
                <td className="mono">{r.id}</td>
                <td>{L(s.lang, r.k)}</td>
                <td>{r.by}</td>
                <td>
                  <button
                    type="button"
                    className="tag tag-neutral"
                    style={{ cursor: "pointer", border: 0 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const next: RequestStatus = st === "open" ? "progress" : st === "progress" ? "answered" : "open";
                      s.setRequestStatus(r.id, next);
                      s.flash(`${r.id} → ${statusLabel(s.lang, next)}`);
                    }}
                  >
                    {statusLabel(s.lang, String(st))}
                  </button>
                </td>
                <td>
                  <Link href={r.href} className="btn btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }} onClick={(e) => e.stopPropagation()}>
                    {th ? "เปิดในเครื่องยนต์" : "Open in engine"}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Approvals() {
  const s = useStore();
  const th = s.lang === "th";
  return (
    <div className="pad-page">
      <Kicker>control · approvals</Kicker>
      <Title><T en="Approvals" th="การอนุมัติ" /></Title>
      {COMMAND.approvals.map((a) => (
        <div key={a.k.e} className="xray-kv"><span>{L(s.lang, a.k)}</span><strong>{a.k.e.includes("DPO") && s.dpoApproved ? (th ? "อนุมัติแล้ว" : "Approved") : L(s.lang, a.st)}</strong></div>
      ))}
      <div className="stack-actions" style={{ marginTop: 18 }}>
        <button
          type="button"
          className={`btn ${s.dpoApproved ? "btn-secondary" : "btn-primary"}`}
          onClick={() => {
            s.approveDpo();
            s.flash(th ? "DPO อนุมัติชุดนิมบัสแล้ว — เครื่องยนต์ยังไม่ลงนาม" : "DPO approved the Nimbus pack — the engine still does not sign");
          }}
        >
          {s.dpoApproved ? <T en="DPO recorded" th="บันทึก DPO แล้ว" /> : <T en="Approve as DPO" th="อนุมัติในฐานะ DPO" />}
        </button>
        <Link href="/assemble?s=draft" className="btn btn-secondary"><T en="Open DPO gate" th="เปิดด่าน DPO" /></Link>
        <button type="button" className="btn btn-secondary" onClick={() => s.flash(th ? "ส่งถึง GC แล้ว — รอท่าที" : "Escalated to GC — posture pending")}>
          <T en="Escalate CFO item to GC" th="ส่งเรื่อง CFO ถึง GC" />
        </button>
      </div>
    </div>
  );
}

function Counsel() {
  const s = useStore();
  const th = s.lang === "th";
  return (
    <div className="pad-page">
      <Kicker>control · outside counsel</Kicker>
      <Title><T en="Outside-counsel management" th="บริหารที่ปรึกษาภายนอก" /></Title>
      {COMMAND.counsel.map((c) => (
        <div key={c.k.e} className="xray-kv"><span>{L(s.lang, c.k)}</span><strong>{L(s.lang, c.v)}</strong></div>
      ))}
      <div className="stack-actions" style={{ marginTop: 18 }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            s.sendToLawyer();
            s.flash(th ? "ส่งชุดนิมบัสถึง 7L Advisory — สำนักงานยังเป็นที่ปรึกษา" : "Nimbus pack sent to 7L Advisory — the firm remains the adviser");
          }}
        >
          {s.lawyerSent ? <T en="Instructed 7L — send again" th="ว่าจ้าง 7L แล้ว — ส่งอีกครั้ง" /> : <T en="Instruct 7L on Nimbus" th="ว่าจ้าง 7L เรื่องนิมบัส" />}
        </button>
        <Link href="/review?s=xray" className="btn btn-secondary">X-Ray</Link>
        <Link href="/intel?s=twin" className="btn btn-secondary"><T en="Ask the Twin" th="ถามฝาแฝด" /></Link>
      </div>
    </div>
  );
}

function Board() {
  const s = useStore();
  const th = s.lang === "th";
  return (
    <div className="pad-page">
      <Kicker>control · board</Kicker>
      <Title><T en="Management and board reports" th="รายงานผู้บริหารและคณะกรรมการ" /></Title>
      <div className="stack-actions" style={{ marginTop: 12 }}>
        {COMMAND.board.map((b) => (
          <Link key={b.href} href={b.href} className="btn btn-secondary">{L(s.lang, b.k)}</Link>
        ))}
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            downloadText("LAW24-board-pack.txt", boardPackText(s.lang));
            s.flash(th ? "ส่งออกชุดกรรมการแล้ว — เครื่องยนต์ไม่ลงนามแทน" : "Board pack exported — the engine never signs");
          }}
        >
          <T en="Download board pack" th="ดาวน์โหลดชุดกรรมการ" />
        </button>
      </div>
    </div>
  );
}
