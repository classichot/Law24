"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Kicker, Title } from "@/components/ui";
import { useStore } from "@/lib/store";
import { T } from "@/lib/i18n";
import {
  STAGE_LABEL,
  TYPE_LABEL,
  assignmentOf,
  clientOf,
  dashboardOf,
  formatThb,
  overdue,
  stageCopy,
  trailOf,
  typeCopy,
  type AssignmentStage,
  type AssignmentType,
} from "@/lib/firm";
import { CLIENT_ROOM, FIRM_BRAIN, PACKAGES, ENTRANCES } from "@/lib/product";
import { downloadText } from "@/lib/demo";
import { L } from "@/lib/model";

const STAGE_CLASS: Record<AssignmentStage, string> = {
  intake: "status-prep",
  work: "status-in",
  review: "status-rev",
  client: "status-out",
  closed: "status-done",
};

const TYPES = Object.keys(TYPE_LABEL) as AssignmentType[];
const FUNNEL = Object.keys(STAGE_LABEL) as AssignmentStage[];

export function PracticeScreen({ screen }: { screen: string }) {
  if (screen === "clients") return <Clients />;
  if (screen === "assign") return <Assignments />;
  if (screen === "trace") return <Trace />;
  if (screen === "brain") return <Brain />;
  if (screen === "room") return <Room />;
  if (screen === "packages") return <Packages />;
  if (screen === "quote") return <Quote />;
  return <Dash />;
}

function Dash() {
  const { lang, practice, setActiveAssignment } = useStore();
  const th = lang === "th";
  const d = dashboardOf(practice);
  const maxFunnel = Math.max(1, ...FUNNEL.map((k) => d.funnel[k]));

  return (
    <div className="pad-page">
      <Kicker>practice · management</Kicker>
      <Title><T en="Practice dashboard" th="แดชบอร์ดสำนักงาน" /></Title>
      <p className="page-sub">
        <T
          en="Clients, assignments and the movement trail — so partners can read a matter from intake to close."
          th="ลูกค้า งาน และเส้นทางเคลื่อนไหว — พาร์ทเนอร์ไล่เรื่องได้ตั้งแต่รับงานจนปิด"
        />
      </p>
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginTop: 24 }}>
        {[
          { v: String(d.clients), k: th ? "ลูกค้าที่เปิด" : "Active clients" },
          { v: String(d.open), k: th ? "งานที่ยังไม่ปิด" : "Open assignments" },
          { v: String(d.late), k: th ? "เกินกำหนด" : "Overdue", hot: d.late > 0 },
          { v: formatThb(d.wip), k: th ? "ค่าธรรมเนียมระหว่างทำ" : "WIP fees" },
        ].map((x) => (
          <div key={x.k} className="stat-cell-os">
            <div style={{ font: "800 24px/1 var(--font-heading)", color: x.hot ? "var(--color-hot)" : undefined }}>{x.v}</div>
            <div style={{ fontSize: 11, color: "var(--color-neutral-600)", marginTop: 7 }}>{x.k}</div>
          </div>
        ))}
      </div>

      <div className="grid-split" style={{ marginTop: 32 }}>
        <div>
          <h5><T en="Stage funnel" th="กรวยสถานะงาน" /></h5>
          {FUNNEL.map((k) => (
            <div key={k} className="funnel-row">
              <span className="funnel-label">{th ? STAGE_LABEL[k].th : STAGE_LABEL[k].en}</span>
              <div className="bar-track" style={{ flex: 1 }}>
                <div className="bar-fill" style={{ width: `${Math.round((d.funnel[k] / maxFunnel) * 100)}%` }} />
              </div>
              <span className="funnel-n">{d.funnel[k]}</span>
            </div>
          ))}
        </div>
        <div>
          <h5><T en="Partner load" th="ภาระงานพาร์ทเนอร์" /></h5>
          <table className="table">
            <thead>
              <tr>
                <th><T en="Lead" th="หัวหน้างาน" /></th>
                <th className="num"><T en="Open" th="เปิด" /></th>
                <th className="num"><T en="WIP" th="ระหว่างทำ" /></th>
              </tr>
            </thead>
            <tbody>
              {d.load.map((row) => (
                <tr key={row.lead}>
                  <td>{row.lead}</td>
                  <td className="num">{row.n}</td>
                  <td className="num">{formatThb(row.fee)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h5 style={{ marginTop: 32 }}><T en="Recent movement" th="ความเคลื่อนไหวล่าสุด" /></h5>
      <table className="table">
        <thead>
          <tr>
            <th><T en="When" th="เวลา" /></th>
            <th><T en="Assignment" th="งาน" /></th>
            <th><T en="Movement" th="เหตุการณ์" /></th>
            <th />
          </tr>
        </thead>
        <tbody>
          {d.recent.map((m) => (
              <tr key={m.id}>
                <td style={{ whiteSpace: "nowrap", fontSize: 12, color: "var(--color-neutral-600)" }}>{m.at}</td>
                <td style={{ fontWeight: 700 }}>{m.assignmentId}</td>
                <td>{th ? m.th : m.en}</td>
                <td>
                  <Link
                    href="/practice?s=trace"
                    className="btn btn-secondary"
                    style={{ fontSize: 11, padding: "4px 10px" }}
                    onClick={() => setActiveAssignment(m.assignmentId)}
                  >
                    <T en="Trail" th="เส้นทาง" />
                  </Link>
                </td>
              </tr>
          ))}
        </tbody>
      </table>
      <p className="text-muted" style={{ marginTop: 16, fontSize: 12 }}>
        {aHint(practice.assignments[0] ? (th ? practice.assignments[0].titleTh : practice.assignments[0].title) : "", th)}
      </p>
    </div>
  );
}

function aHint(title: string, th: boolean) {
  return th
    ? `งานหลักที่เปิดอยู่: ${title || "—"} · เปิดแท็บเส้นทางงานเพื่อไล่จากรับเรื่องถึงสถานะปัจจุบัน`
    : `Lead open matter: ${title || "—"} · Open Movement trail to read intake through the current stage.`;
}

function Clients() {
  const s = useStore();
  const router = useRouter();
  const th = s.lang === "th";
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [nameTh, setNameTh] = useState("");
  const [sector, setSector] = useState("");
  const [owner, setOwner] = useState("Kanit S.");

  function onAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    s.addClient({ name: name.trim(), nameTh: nameTh.trim() || name.trim(), sector: sector.trim() || "General", owner: owner.trim() || "Kanit S." });
    s.flash(th ? "เพิ่มลูกค้าแล้ว" : "Client added");
    setName("");
    setNameTh("");
    setSector("");
    setOpen(false);
  }

  return (
    <div className="pad-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <Kicker>practice · clients</Kicker>
          <Title><T en="Clients" th="ลูกค้า" /></Title>
          <p className="page-sub"><T en="Every assignment sits under a client. Open a row to see that client's work." th="ทุกงานอยู่ภายใต้ลูกค้า เปิดแถวเพื่อดูงานของลูกค้ารายนั้น" /></p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setOpen((v) => !v)}>
          {open ? <T en="Cancel" th="ยกเลิก" /> : <T en="Add client" th="เพิ่มลูกค้า" />}
        </button>
      </div>

      {open && (
        <form className="practice-form" onSubmit={onAdd}>
          <div className="field">
            <label><T en="Name" th="ชื่อ" /></label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label><T en="Thai name" th="ชื่อภาษาไทย" /></label>
            <input className="input" value={nameTh} onChange={(e) => setNameTh(e.target.value)} />
          </div>
          <div className="field">
            <label><T en="Sector" th="อุตสาหกรรม" /></label>
            <input className="input" value={sector} onChange={(e) => setSector(e.target.value)} />
          </div>
          <div className="field">
            <label><T en="Owner" th="ผู้ดูแล" /></label>
            <input className="input" value={owner} onChange={(e) => setOwner(e.target.value)} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <button className="btn btn-primary" type="submit"><T en="Save client" th="บันทึกลูกค้า" /></button>
          </div>
        </form>
      )}

      <table className="table" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th><T en="Client" th="ลูกค้า" /></th>
            <th><T en="Sector" th="อุตสาหกรรม" /></th>
            <th><T en="Owner" th="ผู้ดูแล" /></th>
            <th><T en="Opened" th="เปิดเมื่อ" /></th>
            <th className="num"><T en="Assignments" th="งาน" /></th>
          </tr>
        </thead>
        <tbody>
          {s.practice.clients.map((c) => {
            const n = s.practice.assignments.filter((a) => a.clientId === c.id).length;
            return (
              <tr
                key={c.id}
                className="clickable"
                onClick={() => {
                  s.setActiveClient(c.id);
                  router.push(`/practice?s=assign&c=${c.id}`);
                }}
              >
                <td style={{ fontWeight: 800 }}>{c.id}</td>
                <td>
                  <div style={{ fontWeight: 700 }}>{th ? c.nameTh : c.name}</div>
                  <div style={{ fontSize: 12, color: "var(--color-neutral-600)" }}>{th ? c.name : c.nameTh}</div>
                </td>
                <td>{c.sector}</td>
                <td>{c.owner}</td>
                <td>{c.opened}</td>
                <td className="num">{n}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Assignments() {
  const s = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const th = s.lang === "th";
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState(s.practice.activeClientId || s.practice.clients[0]?.id || "");
  const [title, setTitle] = useState("");
  const [titleTh, setTitleTh] = useState("");
  const [type, setType] = useState<AssignmentType>("review");
  const [due, setDue] = useState("2026-09-30");
  const [lead, setLead] = useState("Kanit S.");
  const [fee, setFee] = useState("150000");
  const [filter, setFilter] = useState(params.get("c") || "all");

  const rows = useMemo(() => {
    return s.practice.assignments.filter((a) => filter === "all" || a.clientId === filter);
  }, [s.practice.assignments, filter]);

  function onAdd(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !clientId) return;
    s.addAssignment({
      clientId,
      title: title.trim(),
      titleTh: titleTh.trim() || title.trim(),
      type,
      due,
      lead: lead.trim() || "Kanit S.",
      fee: fee.trim() ? `THB ${Number(fee.replace(/[^\d]/g, "") || 0).toLocaleString("en-US")}` : "THB 0",
    });
    s.flash(th ? "เปิดงานแล้ว" : "Assignment opened");
    setTitle("");
    setTitleTh("");
    setOpen(false);
  }

  return (
    <div className="pad-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <Kicker>practice · assignments</Kicker>
          <Title><T en="Assignments" th="งาน" /></Title>
          <p className="page-sub"><T en="Each assignment has a movement trail. Open a row to trace it from intake to now." th="ทุกงานมีเส้นทางเคลื่อนไหว เปิดแถวเพื่อไล่จากรับเรื่องถึงปัจจุบัน" /></p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/assist?s=ask" className="btn btn-secondary">
            <T en="Describe job & assignment" th="อธิบายงานแล้วให้ AI ชี้ทาง" />
          </Link>
          <button type="button" className="btn btn-primary" onClick={() => setOpen((v) => !v)}>
            {open ? <T en="Cancel" th="ยกเลิก" /> : <T en="Add assignment" th="เพิ่มงาน" />}
          </button>
        </div>
      </div>

      {open && (
        <form className="practice-form" onSubmit={onAdd}>
          <div className="field">
            <label><T en="Client" th="ลูกค้า" /></label>
            <select className="input" value={clientId} onChange={(e) => setClientId(e.target.value)}>
              {s.practice.clients.map((c) => (
                <option key={c.id} value={c.id}>{th ? c.nameTh : c.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label><T en="Type" th="ประเภท" /></label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value as AssignmentType)}>
              {TYPES.map((k) => (
                <option key={k} value={k}>{th ? TYPE_LABEL[k].th : TYPE_LABEL[k].en}</option>
              ))}
            </select>
          </div>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label><T en="Title" th="ชื่องาน" /></label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label><T en="Thai title" th="ชื่องานภาษาไทย" /></label>
            <input className="input" value={titleTh} onChange={(e) => setTitleTh(e.target.value)} />
          </div>
          <div className="field">
            <label><T en="Due" th="กำหนด" /></label>
            <input className="input" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
          <div className="field">
            <label><T en="Lead" th="หัวหน้างาน" /></label>
            <input className="input" value={lead} onChange={(e) => setLead(e.target.value)} />
          </div>
          <div className="field">
            <label><T en="Fee (THB)" th="ค่าธรรมเนียม (บาท)" /></label>
            <input className="input" value={fee} onChange={(e) => setFee(e.target.value)} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <button className="btn btn-primary" type="submit"><T en="Open assignment" th="เปิดงาน" /></button>
          </div>
        </form>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "16px 0 8px" }}>
        <button type="button" className={`filter-chip${filter === "all" ? " on" : ""}`} onClick={() => setFilter("all")}>
          <T en="All clients" th="ลูกค้าทั้งหมด" />
        </button>
        {s.practice.clients.map((c) => (
          <button key={c.id} type="button" className={`filter-chip${filter === c.id ? " on" : ""}`} onClick={() => setFilter(c.id)}>
            {th ? c.nameTh : c.name}
          </button>
        ))}
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th><T en="Assignment" th="งาน" /></th>
            <th><T en="Client" th="ลูกค้า" /></th>
            <th><T en="Type" th="ประเภท" /></th>
            <th><T en="Stage" th="สถานะ" /></th>
            <th><T en="Due" th="กำหนด" /></th>
            <th><T en="Lead" th="หัวหน้างาน" /></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => {
            const c = clientOf(s.practice, a.clientId);
            const late = overdue(a);
            return (
              <tr
                key={a.id}
                className="clickable"
                onClick={() => {
                  s.setActiveAssignment(a.id);
                  router.push("/practice?s=trace");
                }}
              >
                <td style={{ fontWeight: 800 }}>{a.id}</td>
                <td style={{ fontWeight: 700 }}>{th ? a.titleTh : a.title}</td>
                <td>{c ? (th ? c.nameTh : c.name) : a.clientId}</td>
                <td>{typeCopy(a.type, s.lang)}</td>
                <td><span className={STAGE_CLASS[a.stage]}>{stageCopy(a.stage, s.lang)}</span></td>
                <td style={{ color: late ? "var(--color-hot)" : undefined, fontWeight: late ? 800 : 400 }}>
                  {a.due}{late ? (th ? " · เกิน" : " · late") : ""}
                </td>
                <td>{a.lead}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Trace() {
  const s = useStore();
  const th = s.lang === "th";
  const id = s.practice.activeAssignmentId;
  const a = assignmentOf(s.practice, id);
  const c = a ? clientOf(s.practice, a.clientId) : undefined;
  const trail = trailOf(s.practice, id);

  return (
    <div className="pad-page">
      <Kicker>practice · trail</Kicker>
      <Title><T en="Movement trail" th="เส้นทางงาน" /></Title>
      <p className="page-sub">
        <T
          en="Management reads an assignment from the first instruction to the current control point. Each step links into the engine."
          th="ฝ่ายบริหารไล่งานจากคำสั่งแรกถึงจุดควบคุมปัจจุบัน แต่ละขั้นลิงก์เข้าเครื่องยนต์"
        />
      </p>
      <div className="trace-layout">
        <aside className="trace-list">
          {s.practice.assignments.map((row) => (
            <button
              key={row.id}
              type="button"
              className={`trace-item${row.id === id ? " on" : ""}`}
              onClick={() => s.setActiveAssignment(row.id)}
            >
              <div className="trace-item-id">{row.id}</div>
              <div className="trace-item-title">{th ? row.titleTh : row.title}</div>
              <div className="trace-item-meta">
                <span className={STAGE_CLASS[row.stage]}>{stageCopy(row.stage, s.lang)}</span>
                {overdue(row) && <span style={{ color: "var(--color-hot)", fontWeight: 800 }}>{th ? "เกินกำหนด" : "Overdue"}</span>}
              </div>
            </button>
          ))}
        </aside>
        <div>
          {!a ? (
            <p className="text-muted"><T en="Select an assignment." th="เลือกงาน" /></p>
          ) : (
            <>
              <div className="trace-head">
                <div>
                  <div style={{ font: "800 11px/1 var(--font-heading)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-neutral-600)", marginBottom: 8 }}>{a.id}</div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 20 }}>{th ? a.titleTh : a.title}</h3>
                  <div style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>
                    {c ? (th ? c.nameTh : c.name) : a.clientId} · {typeCopy(a.type, s.lang)} · {a.lead} · {th ? "กำหนด" : "Due"} {a.due}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className={STAGE_CLASS[a.stage]}>{stageCopy(a.stage, s.lang)}</span>
                  <Link href={a.href} className="btn btn-primary" style={{ fontSize: 12 }}>
                    <T en="Open in engine" th="เปิดในเครื่องยนต์" />
                  </Link>
                </div>
              </div>
              <ol className="timeline">
                {trail.map((m, i) => (
                  <li key={m.id} className="tl-item">
                    <div className="tl-when">{m.at} · {m.actor}</div>
                    <div className="tl-copy">{th ? m.th : m.en}</div>
                    <div className="tl-foot">
                      <span className={STAGE_CLASS[m.stage]}>{stageCopy(m.stage, s.lang)}</span>
                      {m.href && (
                        <Link href={m.href} style={{ fontSize: 12 }}>
                          {th ? "เปิดขั้นตอนนี้" : "Open this step"} →
                        </Link>
                      )}
                      {i === trail.length - 1 && (
                        <span style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 800 }}>
                          {th ? "จุดปัจจุบัน" : "Current"}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Brain() {
  const { lang } = useStore();
  return (
    <div className="pad-page">
      <Kicker>firm · brain</Kicker>
      <Title><T en="Firm Brain" th="สมองสำนักงาน" /></Title>
      <p className="page-sub">
        <T en="Precedents, clause library, partner comments, negotiation positions, research memoranda, client playbooks, past advice and successful drafting patterns — juniors benefit from partner knowledge without exposing information across clients. This growing layer is LAW24’s real moat." th="บรรทัดฐาน คลังข้อ ความเห็นหุ้นส่วน จุดยืนเจรจา บันทึกวิจัย เพลย์บุ๊กต่อลูกค้า คำแนะนำในอดีต และแบบร่างที่สำเร็จ — จูเนียร์ใช้ความรู้หุ้นส่วนได้โดยไม่เปิดข้อมูลข้ามลูกค้า ชั้นนี้ที่โตขึ้นคือคูเมืองของ LAW24" />
      </p>
      <div className="grid-2" style={{ marginTop: 20 }}>
        {FIRM_BRAIN.map((b) => (
          <div key={b.k.e} className="xray-layer">
            <div className="page-kicker">{b.n}</div>
            <strong>{L(lang, b.k)}</strong>
            <p className="text-muted" style={{ margin: "6px 0 0", fontSize: 13 }}>{L(lang, b.d)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Room() {
  const s = useStore();
  const r = CLIENT_ROOM;
  return (
    <div className="pad-page">
      <Kicker>firm · client review room</Kicker>
      <Title><T en="Client Review Room" th="ห้องตรวจลูกค้า" /></Title>
      <p className="page-sub">{L(s.lang, r.client)} · {L(s.lang, r.progress)}</p>
      <p className="text-muted" style={{ fontSize: 13, marginBottom: 18 }}>
        <T en="Branded for the firm. The law firm remains the trusted adviser; LAW24 stays behind the brand." th="ภายใต้แบรนด์สำนักงาน สำนักงานยังเป็นที่ปรึกษาที่เชื่อถือได้ LAW24 อยู่หลังแบรนด์" />
      </p>
      {r.risks.map((x) => (
        <div key={x.id} className="xray-layer" style={{ marginBottom: 12 }}>
          <strong>{L(s.lang, x.k)}</strong>
          <p>{L(s.lang, x.plain)}</p>
          <p className="text-muted" style={{ fontSize: 13 }}>{L(s.lang, x.rec)}</p>
          <div className="stack-actions" style={{ marginTop: 8 }}>
            <button type="button" className={`btn ${s.roomVotes[x.id] === "approve" ? "btn-primary" : "btn-secondary"}`} onClick={() => s.setRoomVote(x.id, "approve")}><T en="Approve" th="อนุมัติ" /></button>
            <button type="button" className={`btn ${s.roomVotes[x.id] === "reject" ? "btn-primary" : "btn-secondary"}`} onClick={() => s.setRoomVote(x.id, "reject")}><T en="Reject" th="ปฏิเสธ" /></button>
          </div>
        </div>
      ))}
      <h5><T en="Lawyer questions" th="คำถามจากทนาย" /></h5>
      {r.questions.map((q) => <div key={q.e} className="xray-row">{L(s.lang, q)}</div>)}
      <p style={{ marginTop: 16 }}>{L(s.lang, r.cost)}</p>
    </div>
  );
}

function Packages() {
  const { lang } = useStore();
  return (
    <div className="pad-page">
      <Kicker>firm · productize</Kicker>
      <Title><T en="Packaged services" th="บริการสำเร็จรูป" /></Title>
      <p className="page-sub">{L(lang, ENTRANCES.firm.pitch)}</p>
      <div className="grid-2" style={{ marginTop: 20 }}>
        {PACKAGES.map((p) => (
          <div key={p.id} className="xray-layer">
            <strong>{L(lang, p.k)}</strong>
            <div className="xray-kv" style={{ marginTop: 8 }}><span>{p.fee}</span><span>{L(lang, p.cycle)}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Quote() {
  const s = useStore();
  const pkg = PACKAGES.find((p) => p.id === s.quotePkg) || PACKAGES[0];
  const th = s.lang === "th";
  const letter = th
    ? `หนังสือว่าจ้าง\nสำนักงาน 7L Advisory\nบริการ: ${pkg.k.t}\nค่าธรรมเนียม: ${pkg.fee}\nขอบเขต: ตามเพลย์บุ๊กสำนักงาน ไม่รวมการว่าความ\nตรวจผลประโยชน์ทับซ้อน: ผ่าน\nLAW24 อยู่หลังแบรนด์สำนักงาน — ทนายเป็นผู้ลงนามในท่าที`
    : `Engagement letter\n7L Advisory\nService: ${pkg.k.e}\nFee: ${pkg.fee}\nScope: per firm playbook, excluding advocacy\nConflict check: clear\nLAW24 stays behind the firm brand — counsel signs the posture`;
  return (
    <div className="pad-page">
      <Kicker>firm · quote</Kicker>
      <Title><T en="Fixed-fee quotation & engagement" th="ใบเสนอค่าธรรมเนียมคงที่และหนังสือว่าจ้าง" /></Title>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "16px 0" }}>
        {PACKAGES.map((p) => (
          <button key={p.id} type="button" className={`btn ${s.quotePkg === p.id ? "btn-primary" : "btn-secondary"}`} onClick={() => s.setQuotePkg(p.id)}>{L(s.lang, p.k)}</button>
        ))}
      </div>
      <pre className="xray-layer" style={{ whiteSpace: "pre-wrap", fontFamily: "var(--font-body)", fontSize: 14 }}>{letter}</pre>
      <button type="button" className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => { downloadText("LAW24-engagement.txt", letter); s.flash(th ? "สร้างหนังสือว่าจ้างแล้ว" : "Engagement letter generated"); }}>
        <T en="Generate engagement letter" th="สร้างหนังสือว่าจ้าง" />
      </button>
    </div>
  );
}
