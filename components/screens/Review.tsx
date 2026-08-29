"use client";

import { useStore } from "@/lib/store";
import { FX } from "@/lib/taxonomy";
import { Chip, Kicker, Sev, Stats, Title } from "@/components/ui";
import { L } from "@/lib/model";
import { BOARD, DIFF } from "@/lib/wow";
import { T } from "@/lib/i18n";
import { statusLabel, type FindingStatus } from "@/lib/demo";
import { Dropzone } from "@/components/Dropzone";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CONTRACT_ACCEPT } from "@/lib/ai/files";
import { AiLiveMark } from "@/components/AiLiveMark";

const REC: Record<string, [string, string]> = {
  amend: ["Amend", "แก้ไข"], docs: ["Request documents", "ขอเอกสาร"], reject: ["Reject", "ปฏิเสธ"],
  fallback: ["Use fallback", "ใช้ข้อสำรอง"], clarify: ["Seek clarification", "ขอความชัดเจน"],
  escalate: ["Escalate", "ส่งต่อผู้เชี่ยวชาญ"], accept: ["Accept", "ยอมรับ"],
};

import { XRayScreen } from "./XRay";

export function ReviewScreen({ screen }: { screen: string }) {
  if (screen === "xray") return <XRayScreen />;
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

function te(v: { t: string; e: string } | string | undefined) {
  if (!v) return { t: "—", e: "—" };
  if (typeof v === "string") return { t: v, e: v };
  return v;
}

/** When a live map exists, the other Review screens read it instead of the Nimbus fixture. */
function liveQuickTerms(s: ReturnType<typeof useStore>) {
  const X = s.xrayLive;
  if (!X) return R().terms;
  const heat = X.heatmap.map((h) => ({
    k: te(h.k),
    v: { t: `ข้อ ${h.cl} · ความเสี่ยง ${h.pct}%`, e: `cl.${h.cl} · risk ${h.pct}%` },
    f: h.sev === "high" ? "high" : h.sev === "med" ? "flag" : "",
  }));
  const money = X.money.map((m) => ({
    k: te(m.k),
    v: typeof m.v === "string" ? { t: m.v, e: m.v } : te(m.v),
    f: "" as const,
  }));
  return [...heat, ...money];
}

function livePlaybook(s: ReturnType<typeof useStore>) {
  const X = s.xrayLive;
  if (!X) return R().playbook;
  const missing = X.missing.map((m) => ({
    p: te(m.k),
    pol: te(m.src),
    got: { t: "ไม่มีในฉบับ", e: "Absent from this paper" },
    v: "miss" as const,
    a: { t: "ขอเอกสาร / แก้ไข", e: "Request documents / amend" },
  }));
  const unusual = X.unusual.map((m) => ({
    p: te(m.k),
    pol: te(m.vs),
    got: te(m.src),
    v: "dev" as const,
    a: { t: "แก้ไข", e: "Amend" },
  }));
  return [...missing, ...unusual];
}

function liveRedline(s: ReturnType<typeof useStore>) {
  const X = s.xrayLive;
  if (!X) return R().redline;
  return X.redlines.map((r) => ({
    c: r.cl,
    ch: te(r.text),
    eff: te(r.text),
    r: { t: "แก้ไข — ตาม redline ในแผนที่", e: "Amend — as mapped" },
    k: "amend" as const,
  }));
}

function liveDiff(s: ReturnType<typeof useStore>) {
  const X = s.xrayLive;
  if (!X) return DIFF;
  const fromUnusual = X.unusual.map((m, i) => ({
    c: String(i + 1),
    change: te(m.k),
    rights: te(m.vs),
    who: { t: "คู่สัญญาได้เปรียบ", e: "Counterparty benefits" },
    risk: te(m.src),
    appr: { t: "ทนายยืนยัน", e: "Counsel confirms" },
    other: { t: "ดูแผนที่ข้อและ redline", e: "See heatmap and redlines" },
  }));
  const fromRed = X.redlines.map((r) => ({
    c: r.cl,
    change: te(r.text),
    rights: te(r.text),
    who: { t: "เราเสนอแก้", e: "We propose the mark" },
    risk: { t: "ต้องปิดก่อนลงนาม", e: "Must close before signature" },
    appr: { t: "GC", e: "GC" },
    other: { t: "กระทบบันไดเจรจา", e: "Affects the negotiation ladder" },
  }));
  return [...fromUnusual, ...fromRed];
}

function Setup() {
  const s = useStore();
  const router = useRouter();
  const r = R();
  const X = s.xrayLive;
  return (
    <div className="pad-page">
      <Kicker>review · context</Kicker>
      <Title>{X ? L(s.lang, X.doc) : L(s.lang, r.doc.title)}</Title>
      <p className="page-sub">
        {X
          ? `${X.ref} · ${X.pages} ${s.lang === "th" ? "หน้า" : "pages"} · ${L(s.lang, X.langs)} · ${L(s.lang, X.verdictLabel)}`
          : `${L(s.lang, r.doc.client)} · ${L(s.lang, r.doc.cp)} · ${r.doc.ref} · ${L(s.lang, r.doc.value)}`}
      </p>
      <Dropzone
        bucket="xray"
        accept={CONTRACT_ACCEPT}
        title={<T en="Drop the contract to review" th="ลากสัญญาที่ต้องการตรวจมาวาง" />}
        hint={<T en="Counterparty paper, PDF or DOCX. LAW24 extracts terms and opens issue cards — the lawyer keeps the decision." th="ฉบับคู่สัญญา PDF หรือ DOCX ระบบสกัดข้อกำหนดและเปิดบัตรประเด็น — ทนายเป็นผู้ตัดสิน" />}
        multiple={false}
        onAfter={() => { router.push("/review?s=xray"); }}
      />
      <div className="stack-actions" style={{ margin: "8px 0 16px" }}>
        {!s.xrayReady && (
          <button type="button" className="btn btn-primary" onClick={() => { s.startXray(); }}>
            <T en="Run demo on Nimbus" th="ทดลองกับนิมบัส" />
          </button>
        )}
        <Link href="/review?s=xray" className="btn btn-secondary">X-Ray</Link>
        <Link href="/review?s=find" className="btn btn-secondary"><T en="Open findings" th="เปิดข้อค้นพบ" /></Link>
      </div>
      <div className="grid-2" style={{ marginTop: 8 }}>
        {(X
          ? [
              { k: { t: "คำตัดสิน", e: "Verdict" }, v: X.verdictLabel },
              { k: { t: "ทำไม", e: "Why" }, v: X.verdictWhy },
              { k: { t: "ภาษา", e: "Languages" }, v: X.langs },
              { k: { t: "หน้า", e: "Pages" }, v: { t: String(X.pages), e: String(X.pages) } },
              ...(X.parties.slice(0, 4).map((p) => ({ k: p.k, v: p.v }))),
            ]
          : r.setup
        ).map((x) => (
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
  const X = s.xrayLive;
  const terms = liveQuickTerms(s);
  return (
    <div className="pad-page">
      <Kicker>review · overview</Kicker>
      <Title><T en="Quick review & key terms" th="ตรวจเร็วและข้อกำหนดสำคัญ" /></Title>
      <p style={{ maxWidth: "72ch", marginBottom: 24 }}>
        {X
          ? L(s.lang, X.verdictWhy)
          : th
          ? "ฉบับนี้เป็นกระดาษของคู่สัญญาและเอียงไปทางผู้ให้บริการอย่างมีนัยสำคัญ ประเด็นที่ต้องแก้ก่อนลงนามมี 4 ข้อ ได้แก่ ความรับผิดจากข้อมูลรั่วไหลที่ไม่มีเพดาน การโอนข้อมูลข้ามแดนที่ยังไม่มีมาตรการตาม PDPA สิทธิเลิกสัญญาที่ไม่สมมาตร และภาคผนวกที่อ้างถึงแต่ไม่แนบมา 3 ฉบับ"
          : "This is counterparty paper and materially provider-favouring. Four items must be closed before signature: uncapped data-breach liability, cross-border transfer without PDPA safeguards, asymmetric termination rights, and three incorporated annexes that were never delivered."}
      </p>
      <div className="grid-2">
        {terms.map((t) => (
          <div key={L(s.lang, t.k)} style={{ padding: 14, border: `2px solid ${t.f === "high" ? "var(--color-hot)" : t.f === "flag" ? "var(--color-accent-300)" : "var(--color-divider)"}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <strong>{L(s.lang, t.k)}</strong>
              {t.f === "high" && <span className="sev-pill" style={{ background: "var(--color-hot)", color: "#f3f2f2" }}>{th ? "ต้องแก้" : "Must fix"}</span>}
              {t.f === "flag" && <span className="tag tag-accent">{th ? "ตรวจ" : "Check"}</span>}
            </div>
            <div style={{ marginTop: 6 }}>{L(s.lang, t.v)}</div>
          </div>
        ))}
      </div>
      <div className="stack-actions" style={{ marginTop: 18 }}>
        <Link href="/review?s=find" className="btn btn-primary"><T en="Open findings" th="เปิดข้อค้นพบ" /></Link>
        <Link href="/review?s=xray" className="btn btn-secondary">X-Ray</Link>
      </div>
    </div>
  );
}

function Findings() {
  const s = useStore();
  const th = s.lang === "th";
  const r = R();
  const listSource = s.reviewLive?.findings ?? r.findings;
  const list = listSource.filter((f) => !s.gsev || f.sev === s.gsev);
  const stOf = (id: string, fallback: string) => s.findingStatus[id] || fallback;
  const high = listSource.filter((f) => f.sev === "high").length;
  const acted = listSource.filter((f) => {
    const st = stOf(f.id, "status" in f ? String((f as { status?: string }).status) : "pending");
    return st === "accepted" || st === "amended" || st === "escalated";
  }).length;
  return (
    <div className="pad-page">
      <Kicker>review · LAW24 issue cards</Kicker>
      <Title><T en="Findings" th="ข้อค้นพบ" /></Title>
      <Stats items={[
        { v: String(high), k: th ? "ความเสี่ยงสูง" : "High severity" },
        { v: String(listSource.length), k: th ? "ข้อค้นพบทั้งหมด" : "All findings" },
        { v: String(acted), k: th ? "ดำเนินการแล้ว" : "Acted on" },
        { v: String(listSource.length - acted), k: th ? "ยังเปิดอยู่" : "Still open" },
      ]} />
      <div style={{ display: "flex", gap: 6, margin: "16px 0" }}>
        {[["", th ? "ทั้งหมด" : "All"], ["high", th ? "สูง" : "High"], ["med", th ? "ปานกลาง" : "Medium"], ["low", th ? "ต่ำ" : "Low"]].map(([v, lb]) => (
          <Chip key={v} active={s.gsev === v} on={() => s.setGsev(s.gsev === v ? "" : v)}>{lb}</Chip>
        ))}
      </div>
      {list.map((f) => {
        const open = s.openF === f.id;
        const rec = REC[f.rec] || REC.amend;
        const st = stOf(f.id, "status" in f ? String((f as { status?: string }).status) : "pending") as FindingStatus | string;
        return (
          <div key={f.id} className={`issue-card${open ? " open" : ""}`} style={{ marginBottom: 8 }}>
            <button className="issue-head" onClick={() => s.setOpenF(open ? "" : f.id)}>
              <span className="mono" style={{ fontWeight: 800 }}>{f.id}</span>
              <Sev sv={f.sev} lang={s.lang} />
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontWeight: 700 }}>{L(s.lang, f.issue)}</div>
                <div className="text-muted" style={{ fontSize: 12 }}>{L(s.lang, f.cat)} · {L(s.lang, f.src)} · {f.conf}%</div>
              </div>
              <span className="tag tag-outline">{statusLabel(s.lang, String(st))}</span>
              <span className="tag tag-outline">{th ? rec[1] : rec[0]}</span>
            </button>
            {open && (
              <div style={{ padding: "0 16px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <p><strong><T en="Why" th="เหตุผล" /></strong> {L(s.lang, f.why)}</p>
                <p><strong><T en="Consequence" th="ผลที่ตามมา" /></strong> {L(s.lang, f.mat)} · {L(s.lang, f.like)}</p>
                <p><strong><T en="Redline" th="ข้อความแก้ไข" /></strong> {L(s.lang, f.word)}</p>
                <p><strong><T en="Fallback" th="ข้อสำรอง" /></strong> {L(s.lang, f.alt)}</p>
                <p><strong><T en="Evidence" th="หลักฐาน" /></strong> {L(s.lang, f.src)} · {L(s.lang, f.inter)} · {L(s.lang, f.pb)}</p>
                <p><strong><T en="Owner" th="ผู้รับผิดชอบ" /></strong> {L(s.lang, f.appr)} · {statusLabel(s.lang, String(st))} · {f.conf}%</p>
                <div className="issue-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => { s.setFindingStatus(f.id, "accepted"); s.flash(th ? `ยอมรับ ${f.id}` : `${f.id} accepted`); }}><T en="Accept" th="ยอมรับ" /></button>
                  <button type="button" className="btn btn-primary" onClick={() => { s.setFindingStatus(f.id, "amended"); s.flash(th ? `แก้ ${f.id} เข้าชุดแล้ว` : `${f.id} amended into the pack`); }}><T en="Amend into pack" th="แก้เข้าชุด" /></button>
                  <button type="button" className="btn btn-secondary" onClick={() => { s.setFindingStatus(f.id, "escalated"); s.flash(th ? `ส่ง ${f.id} ถึงทนาย` : `${f.id} escalated to counsel`); }}><T en="Escalate to counsel" th="ส่งต่อทนาย" /></button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <div className="stack-actions" style={{ marginTop: 16 }}>
        <Link href="/review?s=pb" className="btn btn-primary"><T en="Compare playbook" th="เทียบเพลย์บุ๊ก" /></Link>
        <Link href="/review?s=board" className="btn btn-secondary"><T en="Review Board" th="คณะทบทวน" /></Link>
      </div>
    </div>
  );
}

function Playbook() {
  const s = useStore();
  const rows = livePlaybook(s);
  return (
    <div className="pad-page">
      <Kicker>review · organization playbook</Kicker>
      <Title><T en="Playbook comparison — IT & Cloud v4.2" th="เทียบ playbook — IT & Cloud v4.2" /></Title>
      <p className="page-sub">
        <Link href="/help?s=book&b=itcloud"><T en="Open the full house book in Help" th="เปิดเล่มเต็มในคู่มือ" /> →</Link>
      </p>
      <table className="table">
        <thead><tr><th><T en="Position" th="จุดยืน" /></th><th><T en="Policy" th="นโยบาย" /></th><th><T en="Got" th="ได้มา" /></th><th><T en="Fit" th="ผล" /></th><th><T en="Action" th="การกระทำ" /></th></tr></thead>
        <tbody>
          {rows.map((x, i) => (
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
      <div className="stack-actions" style={{ marginTop: 16 }}>
        <Link href="/review?s=red" className="btn btn-primary"><T en="Open counterparty redline" th="เปิด redline คู่สัญญา" /></Link>
        <Link href="/help?s=book&b=itcloud" className="btn btn-secondary"><T en="Full house book" th="เล่มเต็มในคู่มือ" /></Link>
      </div>
    </div>
  );
}

function Redline() {
  const s = useStore();
  const rows = liveRedline(s);
  return (
    <div className="pad-page">
      <Kicker>review · what changed and why it matters</Kicker>
      <Title><T en="Counterparty redline" th="redline คู่สัญญา" /></Title>
      <table className="table">
        <thead><tr><th>cl.</th><th><T en="Change" th="สิ่งที่เปลี่ยน" /></th><th><T en="Effect" th="ผล" /></th><th><T en="Response" th="คำตอบ" /></th></tr></thead>
        <tbody>
          {rows.map((x) => (
            <tr key={x.c}>
              <td className="mono">{x.c}</td>
              <td>{L(s.lang, x.ch)}</td>
              <td>{L(s.lang, x.eff)}</td>
              <td><span className={x.k === "reject" ? "tag tag-signal" : x.k === "accept" ? "tag tag-neutral" : "tag tag-accent"}>{L(s.lang, x.r)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="stack-actions" style={{ marginTop: 16 }}>
        <Link href="/review?s=board" className="btn btn-primary"><T en="Open Review Board" th="เปิดคณะทบทวน" /></Link>
        <Link href="/negotiate?s=nladder" className="btn btn-secondary"><T en="Negotiation ladder" th="บันไดเจรจา" /></Link>
      </div>
    </div>
  );
}

function Board() {
  const s = useStore();
  const th = s.lang === "th";
  const seats = s.reviewLive?.board ?? BOARD;
  const agreement = s.reviewLive?.agreement;
  const rec = s.reviewLive?.recommendation;

  return (
    <div className="pad-page">
      <Kicker>wow · AI Legal Review Board · <AiLiveMark compact /></Kicker>
      <Title><T en="Specialized reviewers, not one chatbot" th="คณะทบทวนเฉพาะทาง ไม่ใช่แชตบอทตัวเดียว" /></Title>
      <div className="grid-3" style={{ marginTop: 20 }}>
        {seats.map((b) => (
          <div key={L(s.lang, b.k)} className="reviewer-col">
            <div className="page-kicker">{L(s.lang, b.k)}</div>
            <div style={{ font: "800 20px/1 var(--font-heading)", margin: "10px 0" }}>{L(s.lang, b.v)}</div>
            <p className="text-muted" style={{ fontSize: 13 }}>{L(s.lang, b.note)}</p>
          </div>
        ))}
      </div>
      <div className="callout" style={{ marginTop: 24 }}>
        {agreement
          ? L(s.lang, agreement)
          : <T en="Agreement: data cap, DPA/SCCs, and asymmetric termination must close. Disagreement: tax reviewer would sign with an FX clause; commercial reviewer would not." th="จุดที่เห็นพ้อง: เพดานข้อมูล DPA/SCC และสิทธิเลิกที่ไม่สมมาตรต้องปิด จุดที่เห็นต่าง: ฝ่ายภาษียอมลงนามได้ถ้ามีข้อ FX ฝ่ายพาณิชย์ไม่ยอม" />}
      </div>
      <div className="stack-actions" style={{ marginTop: 16 }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => { s.acceptBoard(); s.flash(th ? (rec ? L(s.lang, rec) : "รับคำแนะนำ: เจรจาใหม่ สี่ข้อต้องได้") : (rec ? L(s.lang, rec) : "Board taken: renegotiate the four must-haves")); }}
        >
          {s.boardAccepted
            ? <T en="Board recommendation recorded" th="บันทึกคำแนะนำของคณะแล้ว" />
            : <T en="Take board recommendation — renegotiate" th="รับคำแนะนำคณะ — เจรจาใหม่" />}
        </button>
      </div>
    </div>
  );
}

function Diff() {
  const s = useStore();
  const rows = liveDiff(s);
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
          {rows.map((d) => (
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
      <div className="stack-actions" style={{ marginTop: 16 }}>
        <Link href="/negotiate?s=nladder" className="btn btn-primary"><T en="Open Copilot" th="เปิดผู้ช่วยเจรจา" /></Link>
        <Link href="/holistic?s=memo" className="btn btn-secondary"><T en="Decision memo" th="บันทึกตัดสินใจ" /></Link>
      </div>
    </div>
  );
}
