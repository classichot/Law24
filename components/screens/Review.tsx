"use client";

import { useStore } from "@/lib/store";
import { FX } from "@/lib/taxonomy";
import { Chip, Kicker, Sev, Stats, Title } from "@/components/ui";
import { L } from "@/lib/model";
import { BOARD, DIFF } from "@/lib/wow";
import { T } from "@/lib/i18n";

const REC: Record<string, [string, string]> = {
  amend: ["Amend", "แก้ไข"], docs: ["Request documents", "ขอเอกสาร"], reject: ["Reject", "ปฏิเสธ"],
  fallback: ["Use fallback", "ใช้ข้อสำรอง"], clarify: ["Seek clarification", "ขอความชัดเจน"],
  escalate: ["Escalate", "ส่งต่อผู้เชี่ยวชาญ"], accept: ["Accept", "ยอมรับ"],
};

export function ReviewScreen({ screen }: { screen: string }) {
  if (screen === "rsetup") return <Setup />;
  if (screen === "quick") return <Quick />;
  if (screen === "find") return <Findings />;
  if (screen === "pb") return <Playbook />;
  if (screen === "red") return <Redline />;
  if (screen === "board") return <Board />;
  if (screen === "diff") return <Diff />;
  return <Setup />;
}

function R() {
  return FX.review;
}

function Setup() {
  const s = useStore();
  const r = R();
  return (
    <div className="pad-page">
      <Kicker>review · context</Kicker>
      <Title>{L(s.lang, r.doc.title)}</Title>
      <p className="page-sub">{L(s.lang, r.doc.client)} · {L(s.lang, r.doc.cp)} · {r.doc.ref} · {L(s.lang, r.doc.value)}</p>
      <div className="grid-2" style={{ marginTop: 24 }}>
        {r.setup.map((x) => (
          <div key={L(s.lang, x.k)} style={{ padding: 14, border: "2px solid var(--color-divider)" }}>
            <div className="page-kicker">{L(s.lang, x.k)}</div>
            <div style={{ fontWeight: 700, marginTop: 6 }}>{L(s.lang, x.v)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Quick() {
  const s = useStore();
  const th = s.lang === "th";
  const r = R();
  return (
    <div className="pad-page">
      <Kicker>review · overview</Kicker>
      <Title><T en="Quick review & key terms" th="ตรวจเร็วและข้อกำหนดสำคัญ" /></Title>
      <p style={{ maxWidth: "72ch", marginBottom: 24 }}>
        {th
          ? "ฉบับนี้เป็นกระดาษของคู่สัญญาและเอียงไปทางผู้ให้บริการอย่างมีนัยสำคัญ ประเด็นที่ต้องแก้ก่อนลงนามมี 4 ข้อ ได้แก่ ความรับผิดจากข้อมูลรั่วไหลที่ไม่มีเพดาน การโอนข้อมูลข้ามแดนที่ยังไม่มีมาตรการตาม PDPA สิทธิเลิกสัญญาที่ไม่สมมาตร และภาคผนวกที่อ้างถึงแต่ไม่แนบมา 3 ฉบับ"
          : "This is counterparty paper and materially provider-favouring. Four items must be closed before signature: uncapped data-breach liability, cross-border transfer without PDPA safeguards, asymmetric termination rights, and three incorporated annexes that were never delivered."}
      </p>
      <div className="grid-2">
        {r.terms.map((t) => (
          <div key={L(s.lang, t.k)} style={{ padding: 14, border: `2px solid ${t.f === "high" ? "var(--color-accent)" : t.f === "flag" ? "var(--color-accent-300)" : "var(--color-divider)"}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <strong>{L(s.lang, t.k)}</strong>
              {t.f === "high" && <span className="sev-pill" style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}>{th ? "ต้องแก้" : "Must fix"}</span>}
              {t.f === "flag" && <span className="tag tag-accent">{th ? "ตรวจ" : "Check"}</span>}
            </div>
            <div style={{ marginTop: 6 }}>{L(s.lang, t.v)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Findings() {
  const s = useStore();
  const th = s.lang === "th";
  const r = R();
  const list = r.findings.filter((f) => !s.gsev || f.sev === s.gsev);
  return (
    <div className="pad-page">
      <Kicker>review · LAW24 issue cards</Kicker>
      <Title><T en="Findings" th="ข้อค้นพบ" /></Title>
      <Stats items={[
        { v: "3", k: th ? "ความเสี่ยงสูง" : "High severity" },
        { v: "4", k: th ? "ปานกลาง" : "Medium" },
        { v: "1", k: th ? "ต่ำ" : "Low" },
        { v: "2", k: th ? "ความเชื่อมั่นต่ำ" : "Low confidence" },
      ]} />
      <div style={{ display: "flex", gap: 6, margin: "16px 0" }}>
        {[["", th ? "ทั้งหมด" : "All"], ["high", th ? "สูง" : "High"], ["med", th ? "ปานกลาง" : "Medium"], ["low", th ? "ต่ำ" : "Low"]].map(([v, lb]) => (
          <Chip key={v} active={s.gsev === v} on={() => s.setGsev(s.gsev === v ? "" : v)}>{lb}</Chip>
        ))}
      </div>
      {list.map((f) => {
        const open = s.openF === f.id;
        const rec = REC[f.rec] || REC.amend;
        return (
          <div key={f.id} className={`issue-card${open ? " open" : ""}`} style={{ marginBottom: 8 }}>
            <button className="issue-head" onClick={() => s.setOpenF(open ? "" : f.id)}>
              <span className="mono" style={{ fontWeight: 800 }}>{f.id}</span>
              <Sev sv={f.sev} lang={s.lang} />
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontWeight: 700 }}>{L(s.lang, f.issue)}</div>
                <div className="text-muted" style={{ fontSize: 12 }}>{L(s.lang, f.cat)} · {L(s.lang, f.src)} · {f.conf}%</div>
              </div>
              <span className="tag tag-outline">{th ? rec[1] : rec[0]}</span>
            </button>
            {open && (
              <div style={{ padding: "0 16px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <p><strong><T en="Why" th="เหตุผล" /></strong> {L(s.lang, f.why)}</p>
                <p><strong><T en="Consequence" th="ผลที่ตามมา" /></strong> {L(s.lang, f.mat)} · {L(s.lang, f.like)}</p>
                <p><strong><T en="Redline" th="ข้อความแก้ไข" /></strong> {L(s.lang, f.word)}</p>
                <p><strong><T en="Fallback" th="ข้อสำรอง" /></strong> {L(s.lang, f.alt)}</p>
                <p><strong><T en="Evidence" th="หลักฐาน" /></strong> {L(s.lang, f.src)} · {L(s.lang, f.inter)} · {L(s.lang, f.pb)}</p>
                <p><strong><T en="Owner" th="ผู้รับผิดชอบ" /></strong> {L(s.lang, f.appr)} · {f.status} · {f.conf}%</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Playbook() {
  const s = useStore();
  const r = R();
  return (
    <div className="pad-page">
      <Kicker>review · organization playbook</Kicker>
      <Title><T en="Playbook comparison — IT & Cloud v4.2" th="เทียบ playbook — IT & Cloud v4.2" /></Title>
      <table className="table">
        <thead><tr><th><T en="Position" th="จุดยืน" /></th><th><T en="Policy" th="นโยบาย" /></th><th><T en="Got" th="ได้มา" /></th><th><T en="Fit" th="ผล" /></th><th><T en="Action" th="การกระทำ" /></th></tr></thead>
        <tbody>
          {r.playbook.map((x, i) => (
            <tr key={i}>
              <td style={{ fontWeight: 700 }}>{L(s.lang, x.p)}</td>
              <td>{L(s.lang, x.pol)}</td>
              <td>{L(s.lang, x.got)}</td>
              <td><span className={x.v === "ok" ? "tag tag-neutral" : x.v === "miss" ? "tag tag-signal" : "tag tag-accent"}>{x.v}</span></td>
              <td>{L(s.lang, x.a)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Redline() {
  const s = useStore();
  const r = R();
  return (
    <div className="pad-page">
      <Kicker>review · what changed and why it matters</Kicker>
      <Title><T en="Counterparty redline" th="redline คู่สัญญา" /></Title>
      <table className="table">
        <thead><tr><th>cl.</th><th><T en="Change" th="สิ่งที่เปลี่ยน" /></th><th><T en="Effect" th="ผล" /></th><th><T en="Response" th="คำตอบ" /></th></tr></thead>
        <tbody>
          {r.redline.map((x) => (
            <tr key={x.c}>
              <td className="mono">{x.c}</td>
              <td>{L(s.lang, x.ch)}</td>
              <td>{L(s.lang, x.eff)}</td>
              <td><span className={x.k === "reject" ? "tag tag-signal" : x.k === "accept" ? "tag tag-neutral" : "tag tag-accent"}>{L(s.lang, x.r)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Board() {
  const s = useStore();
  return (
    <div className="pad-page">
      <Kicker>wow · AI Legal Review Board</Kicker>
      <Title><T en="Specialized reviewers, not one chatbot" th="คณะทบทวนเฉพาะทาง ไม่ใช่แชตบอทตัวเดียว" /></Title>
      <div className="grid-3" style={{ marginTop: 20 }}>
        {BOARD.map((b) => (
          <div key={L(s.lang, b.k)} className="reviewer-col">
            <div className="page-kicker">{L(s.lang, b.k)}</div>
            <div style={{ font: "800 20px/1 var(--font-heading)", margin: "10px 0" }}>{L(s.lang, b.v)}</div>
            <p className="text-muted" style={{ fontSize: 13 }}>{L(s.lang, b.note)}</p>
          </div>
        ))}
      </div>
      <div className="callout" style={{ marginTop: 24 }}>
        <T en="Agreement: data cap, DPA/SCCs, and asymmetric termination must close. Disagreement: tax reviewer would sign with an FX clause; commercial reviewer would not." th="จุดที่เห็นพ้อง: เพดานข้อมูล DPA/SCC และสิทธิเลิกที่ไม่สมมาตรต้องปิด จุดที่เห็นต่าง: ฝ่ายภาษียอมลงนามได้ถ้ามีข้อ FX ฝ่ายพาณิชย์ไม่ยอม" />
      </div>
    </div>
  );
}

function Diff() {
  const s = useStore();
  return (
    <div className="pad-page">
      <Kicker>wow · what changed and why it matters</Kicker>
      <Title><T en="Version intelligence, not just word diff" th="ความฉลาดของเวอร์ชัน ไม่ใช่แค่คำที่เปลี่ยน" /></Title>
      <table className="table">
        <thead>
          <tr>
            <th>cl.</th>
            <th><T en="Change" th="สิ่งที่เปลี่ยน" /></th>
            <th><T en="Rights" th="สิทธิ" /></th>
            <th><T en="Who benefits" th="ใครได้เปรียบ" /></th>
            <th><T en="Risk" th="ความเสี่ยง" /></th>
            <th><T en="Approval" th="การอนุมัติ" /></th>
            <th><T en="Knock-on" th="ข้ออื่นที่กระทบ" /></th>
          </tr>
        </thead>
        <tbody>
          {DIFF.map((d) => (
            <tr key={d.c}>
              <td className="mono">{d.c}</td>
              <td>{L(s.lang, d.change)}</td>
              <td>{L(s.lang, d.rights)}</td>
              <td>{L(s.lang, d.who)}</td>
              <td>{L(s.lang, d.risk)}</td>
              <td>{L(s.lang, d.appr)}</td>
              <td>{L(s.lang, d.other)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
