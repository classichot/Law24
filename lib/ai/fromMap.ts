import type { TE } from "@/lib/model";
import { FIRM_USER } from "@/lib/model";
import type { AssignmentRecord, ClientRecord, PracticeState } from "@/lib/firm";
import { engagementOf, nextIds, stampDay, stampNow } from "@/lib/firm";
import type { ReviewLive, XrayView } from "./types";

const P = (t: string, e: string): TE => ({ t, e });

export function asTE(v: TE | string | undefined | null): TE {
  if (!v) return { t: "—", e: "—" };
  if (typeof v === "string") return { t: v, e: v };
  return { t: v.t || v.e || "—", e: v.e || v.t || "—" };
}

export function asLine(v: TE | string | undefined | null): string {
  const x = asTE(v);
  return x.e && x.e !== "—" ? x.e : x.t;
}

function pct(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function heat(X: XrayView) {
  return X.heatmap || [];
}

function high(X: XrayView) {
  return heat(X).filter((h) => h.sev === "high" || h.pct >= 70);
}

function moneyStr(X: XrayView) {
  const m = X.money?.[0];
  return m ? asLine(m.v) : "—";
}

function partyStr(X: XrayView) {
  return asTE(X.parties?.[0]?.v);
}

function dateRow(X: XrayView, i = 0) {
  return X.dates?.[i];
}

function dateLine(X: XrayView, i = 0) {
  const d = dateRow(X, i);
  if (!d) return "—";
  return typeof d.v === "string" ? d.v : asLine(d.v);
}

function worst(X: XrayView) {
  const rows = [...heat(X)].sort((a, b) => b.pct - a.pct);
  return rows[0] || { cl: "—", k: P("ข้อสัญญา", "Clause"), sev: "med" as const, pct: 0 };
}

function findings(R?: ReviewLive | null) {
  return R?.findings || [];
}

/** Command center tiles for this mapped instrument. */
export function cockpitOf(X: XrayView) {
  const open = (X.missing?.length || 0) + (X.unusual?.length || 0);
  const risk = asTE(X.verdictLabel);
  const d0 = dateRow(X, 0);
  return {
    value: moneyStr(X),
    stage: P("แผนที่แล้ว — ยังไม่ลงนาม", "Mapped — not signed"),
    risk,
    owner: P("ทนายยืนยัน", "Counsel confirms"),
    approvals: P("รอทนายยืนยันท่าที", "Awaiting counsel on posture"),
    nego: X.ladder?.[0] ? asTE(X.ladder[0].v) : P(`${open} ข้อยังเปิด`, `${open} items still open`),
    obligations: X.dates?.length
      ? P(`${X.dates.length} วันที่สำคัญจากแผนที่`, `${X.dates.length} key dates from the map`)
      : P("ยังไม่ลงนาม — ปฏิทินยังไม่เปิด", "Not signed — calendar not live"),
    deadline: d0
      ? P(`${dateLine(X, 0)} · ${asTE(d0.k).t}`, `${dateLine(X, 0)} · ${asTE(d0.k).e}`)
      : P("ยังไม่มีกำหนดในแผนที่", "No deadline mapped"),
    related: (X.missing || []).map((m) => asTE(m.k)),
  };
}

export function dnaOf(X: XrayView) {
  const w = worst(X);
  const u = X.unusual?.[0];
  const r = X.redlines?.[0];
  return {
    clause: P(`ข้อ ${w.cl} · ${asTE(w.k).t}`, `cl.${w.cl} · ${asTE(w.k).e}`),
    quote: u ? asTE(u.k) : asTE(X.verdictWhy),
    vs: [
      { k: P("ถ้อยคำที่สำนักงานต้องการ", "Firm preferred wording"), v: r ? asTE(r.text) : P("ตามเพลย์บุ๊กบ้าน", "Per house playbook") },
      { k: P("เพลย์บุ๊กองค์กร", "Corporate playbook"), v: P("IT & Cloud v4.2 / เพลย์บุ๊กที่ใช้บังคับ", "IT & Cloud v4.2 / playbook in force") },
      { k: P("ฉบับนี้", "This paper"), v: u ? asTE(u.vs) : asTE(w.k) },
      { k: P("หลักฐาน", "Evidence"), v: u ? asTE(u.src) : P(`ข้อ ${w.cl} · ความเสี่ยง ${w.pct}%`, `cl.${w.cl} · risk ${w.pct}%`) },
      { k: P("ขั้นเจรจา", "Negotiation rung"), v: X.ladder?.[0] ? asTE(X.ladder[0].v) : asTE(X.verdictLabel) },
    ],
  };
}

export function holisticOf(X: XrayView) {
  const h = heat(X);
  const interactions = [];
  for (let i = 0; i < h.length - 1 && interactions.length < 6; i++) {
    const a = h[i];
    const b = h[i + 1];
    const conflict = a.sev === "high" || b.sev === "high";
    interactions.push({
      a: P(`${asTE(a.k).t} (ข้อ ${a.cl})`, `${asTE(a.k).e} (cl.${a.cl})`),
      b: P(`${asTE(b.k).t} (ข้อ ${b.cl})`, `${asTE(b.k).e} (cl.${b.cl})`),
      v: conflict ? "conflict" : "weak",
      w: P(
        `ความเสี่ยง ${a.pct}% เทียบ ${b.pct}% — อ่านคู่กันก่อนลงนาม`,
        `Risk ${a.pct}% vs ${b.pct}% — read the pair before signature`
      ),
    });
  }
  for (const u of (X.unusual || []).slice(0, 3)) {
    interactions.push({
      a: asTE(u.k),
      b: asTE(u.vs),
      v: "conflict" as const,
      w: asTE(u.src),
    });
  }
  const consistency = [
    ...(X.missing || []).map((m) => ({ k: asTE(m.k), s: "fail" as const, n: asTE(m.src) })),
    ...(X.unusual || []).map((m) => ({ k: asTE(m.k), s: "warn" as const, n: asTE(m.vs) })),
  ];
  const hierarchy = [
    { o: 1, d: asTE(X.doc), n: P("ฉบับหลักที่วางแผนที่", "Master instrument just mapped"), s: "ok" as const },
    ...((X.missing || []).slice(0, 4).map((m, i) => ({
      o: i + 2,
      d: asTE(m.k),
      n: asTE(m.src),
      s: "fail" as const,
    }))),
  ];
  const avg = h.length ? h.reduce((s, x) => s + x.pct, 0) / h.length : 50;
  const them = pct(avg);
  const balance = [
    { k: P("ความเสี่ยงรวม", "Overall risk"), us: 100 - them, them },
    { k: P("ข้อที่ความเสี่ยงสูง", "High-risk clauses"), us: pct(100 - (high(X).length / Math.max(1, h.length)) * 100), them: pct((high(X).length / Math.max(1, h.length)) * 100) },
    { k: P("ข้อที่ขาด", "Missing clauses"), us: X.missing?.length ? 25 : 70, them: X.missing?.length ? 75 : 30 },
    { k: P("จุดยืนเจรจา", "Negotiation posture"), us: 40, them: 60 },
  ];
  return { interactions, consistency, hierarchy, balance };
}

export function simulateOf(X: XrayView) {
  const fromUnusual = (X.unusual || []).slice(0, 3).map((u) => ({
    q: asTE(u.k),
    legal: asTE(u.vs),
    money: X.money?.[0] ? asTE(typeof X.money[0].v === "string" ? P(X.money[0].v, X.money[0].v) : X.money[0].v) : asTE(X.verdictWhy),
    ops: asTE(u.src),
    chain: [asLine(u.src)],
  }));
  const fromMissing = (X.missing || []).slice(0, 2).map((m) => ({
    q: P(`ถ้าไม่มี${asTE(m.k).t}จะเกิดอะไร`, `What if ${asTE(m.k).e} stays missing?`),
    legal: asTE(m.src),
    money: P("ความเสี่ยงเปิดจนกว่าจะปิดช่อง", "Exposure stays open until the gap closes"),
    ops: P("ห้ามลงนามจนกว่าเอกสารนี้จะอยู่ในชุด", "Do not sign until this item is in the pack"),
    chain: [asLine(m.src)],
  }));
  const rows = [...fromUnusual, ...fromMissing];
  return rows.length
    ? rows
    : [{
        q: P("ถ้าลงนามตามฉบับนี้จะเกิดอะไร", "What happens if we sign this paper as mapped?"),
        legal: asTE(X.verdictWhy),
        money: P(moneyStr(X), moneyStr(X)),
        ops: asTE(X.brief),
        chain: heat(X).slice(0, 4).map((h) => `cl.${h.cl}`),
      }];
}

export function memoOf(X: XrayView, R?: ReviewLive | null) {
  const risks = [
    ...(X.unusual || []).map((u) => asTE(u.k)),
    ...(X.missing || []).map((m) => asTE(m.k)),
    ...findings(R).slice(0, 3).map((f) => asTE(f.issue)),
  ].slice(0, 6);
  return {
    summary: asTE(X.brief),
    risks: risks.length ? risks : [asTE(X.verdictWhy)],
    money: X.money?.length
      ? P(X.money.map((m) => `${asTE(m.k).t}: ${asLine(m.v)}`).join(" · "), X.money.map((m) => `${asTE(m.k).e}: ${asLine(m.v)}`).join(" · "))
      : asTE(X.brief),
    approvals: P("ทนาย (GC) ยืนยันท่าทีก่อนส่งคู่สัญญา — เครื่องยนต์ไม่ลงนาม", "Counsel (GC) confirms posture before it goes to the counterparty — the engine never signs"),
    decision: R?.recommendation ? asTE(R.recommendation) : asTE(X.verdictLabel),
    conditions: (X.redlines || []).map((r) => P(`ข้อ ${r.cl}: ${asTE(r.text).t}`, `cl.${r.cl}: ${asTE(r.text).e}`)),
  };
}

export function memoText(lang: "en" | "th", X: XrayView, R?: ReviewLive | null) {
  const m = memoOf(X, R);
  const th = lang === "th";
  return [
    `LAW24 · ${th ? "บันทึกตัดสินใจ" : "Decision memo"}`,
    `${X.ref} · ${asTE(X.doc)[th ? "t" : "e"]}`,
    "",
    th ? m.summary.t : m.summary.e,
    "",
    ...(m.risks.map((r, i) => `${i + 1}. ${th ? r.t : r.e}`)),
    "",
    th ? m.money.t : m.money.e,
    th ? m.decision.t : m.decision.e,
    "",
    th ? "เครื่องยนต์ไม่ลงนามแทน" : "The engine never signs.",
  ].join("\n");
}

export function twinAsksOf(X: XrayView) {
  const asks = [
    ...((X.unusual || []).slice(0, 2).map((u) => ({ q: asTE(u.k), a: asTE(u.vs), src: asTE(u.src) }))),
    ...((X.missing || []).slice(0, 1).map((m) => ({
      q: P(`ฉบับนี้ขาดอะไร`, `What is missing from this paper?`),
      a: asTE(m.k),
      src: asTE(m.src),
    }))),
    ...(X.dates?.[0] ? [{ q: P("วันที่สำคัญถัดไปคือเมื่อใด", "What is the next key date?"), a: P(dateLine(X, 0), dateLine(X, 0)), src: asTE(X.dates[0].k) }] : []),
    ...(X.money?.[0] ? [{ q: P("มูลค่าและความรับผิดในฉบับนี้", "Value and liability on this paper"), a: P(moneyStr(X), moneyStr(X)), src: asTE(X.money[0].k) }] : []),
  ];
  return asks.slice(0, 4);
}

export function twinLayersOf(X: XrayView) {
  return [
    asTE(X.doc),
    P(`${X.parties?.length || 0} คู่สัญญา`, `${X.parties?.length || 0} party rows`),
    P(`${X.dates?.length || 0} วันที่สำคัญ`, `${X.dates?.length || 0} key dates`),
    P(`${X.missing?.length || 0} ข้อที่ขาด`, `${X.missing?.length || 0} missing clauses`),
    P(`${X.unusual?.length || 0} ข้อผิดปกติ`, `${X.unusual?.length || 0} unusual terms`),
    asTE(X.verdictLabel),
  ];
}

export function intelOf(X: XrayView) {
  const hi = high(X).length;
  const dev = (X.unusual?.length || 0) + (X.missing?.length || 0);
  return {
    stats: [
      { k: P("สัญญาในแผนที่นี้", "Contracts in this map"), v: "1" },
      { k: P("มูลค่าตามฉบับ", "Value on this paper"), v: P(moneyStr(X), moneyStr(X)) },
      { k: P("วันที่สำคัญ", "Key dates"), v: String(X.dates?.length || 0) },
      { k: P("ข้อที่ขาด / ผิดปกติ", "Missing / unusual"), v: String(dev) },
      { k: P("ข้อความเสี่ยงสูง", "High-risk clauses"), v: String(hi) },
      { k: P("คำตัดสิน", "Verdict"), v: asTE(X.verdictLabel) },
    ],
    risks: [
      ...high(X).slice(0, 4).map((h) => ({ k: asTE(h.k), n: h.pct, pct: h.pct })),
      ...((X.missing || []).slice(0, 2).map((m) => ({ k: asTE(m.k), n: 1, pct: 80 }))),
    ],
    renew: (X.dates || []).slice(0, 6).map((d) => ({ m: asTE(d.k), n: 1 })),
    queries: [
      asTE(X.doc),
      P("ข้อใดความเสี่ยงสูงในฉบับนี้", "Which clauses are high-risk on this paper?"),
      P("วันที่สำคัญถัดไปคือเมื่อใด", "What is the next key date?"),
      P("ข้อใดขาดเมื่อเทียบเพลย์บุ๊ก", "What is missing against the playbook?"),
    ],
  };
}

export function memoryOf(X: XrayView) {
  const rows = (X.redlines || []).map((r, i) => {
    const u = X.unusual?.[i];
    return {
      clause: P(`ข้อ ${r.cl}`, `cl.${r.cl}`),
      accepted: asTE(r.text),
      rejected: u ? asTE(u.k) : P("ถ้อยคำคู่สัญญาตามแผนที่", "Counterparty wording as mapped"),
      n: 1,
    };
  });
  if (rows.length) return rows;
  return heat(X).slice(0, 4).map((h) => ({
    clause: P(`ข้อ ${h.cl} · ${asTE(h.k).t}`, `cl.${h.cl} · ${asTE(h.k).e}`),
    accepted: P("ตามเพลย์บุ๊กบ้าน", "House playbook"),
    rejected: P(`ความเสี่ยง ${h.pct}% ในฉบับนี้`, `${h.pct}% risk on this paper`),
    n: 1,
  }));
}

export function warOf(X: XrayView, R?: ReviewLive | null) {
  const flags = findings(R).length || (X.unusual?.length || 0) + (X.missing?.length || 0);
  return {
    stats: [
      { v: "1", k: P("เอกสารในแผนที่", "Documents in the map") },
      { v: String(X.missing?.length || 0), k: P("เอกสาร/ข้อที่ขาด", "Missing items") },
      { v: String(high(X).length), k: P("ประเด็นความเสี่ยงสูง", "High-risk items") },
      { v: String(flags), k: P("ข้อค้นพบ / คำถาม", "Findings / questions") },
    ],
    missing: (X.missing || []).map((m) => asTE(m.k)),
  };
}

export function dilOf(X: XrayView, R?: ReviewLive | null) {
  const cards = findings(R);
  const flags = cards.length
    ? cards.map((f, i) => ({
        id: f.id || `F-${String(i + 1).padStart(2, "0")}`,
        sev: f.sev === "high" ? "high" : f.sev === "low" ? "low" : "med",
        ws: asTE(f.cat),
        t: asTE(f.issue),
        im: asTE(f.mat),
        a: asTE(f.rec),
        st: f.status || "open",
        conf: f.conf || 80,
      }))
    : [
        ...(X.unusual || []).map((u, i) => ({
          id: `XF-${String(i + 1).padStart(2, "0")}`,
          sev: "high",
          ws: P("ข้อผิดปกติ", "Unusual term"),
          t: asTE(u.k),
          im: asTE(u.vs),
          a: P("แก้ไขก่อนลงนาม", "Amend before signature"),
          st: "open",
          conf: 80,
        })),
        ...(X.missing || []).map((m, i) => ({
          id: `XM-${String(i + 1).padStart(2, "0")}`,
          sev: "med",
          ws: P("ข้อที่ขาด", "Missing"),
          t: asTE(m.k),
          im: asTE(m.src),
          a: P("ขอเอกสาร / เติมข้อ", "Request document / add clause"),
          st: "open",
          conf: 70,
        })),
      ];
  const party = partyStr(X);
  return {
    matter: {
      name: asTE(X.doc),
      rows: [
        { k: P("เลขที่", "Reference"), v: P(X.ref, X.ref) },
        { k: P("คู่สัญญา", "Parties"), v: party },
        { k: P("หน้า", "Pages"), v: P(String(X.pages), String(X.pages)) },
        { k: P("มูลค่า", "Value"), v: P(moneyStr(X), moneyStr(X)) },
        { k: P("คำตัดสิน", "Verdict"), v: asTE(X.verdictLabel) },
        { k: P("ภาษา", "Languages"), v: asTE(X.langs) },
        { k: P("เพลย์บุ๊ก", "Playbook"), v: P("PB-IT v4.2 / PB-DD v3.1", "PB-IT v4.2 / PB-DD v3.1") },
        { k: P("สถานะ", "Status"), v: P("แผนที่แล้ว — ทนายยืนยัน", "Mapped — counsel confirms") },
      ],
    },
    ingest: [
      { k: P("เอกสารรับเข้า", "Documents ingested"), v: "1" },
      { k: P("หน้า", "Pages"), v: String(X.pages) },
      { k: P("ข้อในแผนความร้อน", "Heatmap clauses"), v: String(heat(X).length) },
      { k: P("ข้อที่ขาด", "Missing"), v: String(X.missing?.length || 0) },
      { k: P("ภาษา", "Languages"), v: asTE(X.langs) },
    ],
    docs: [
      { n: asTE(X.doc), t: X.ref, v: P(`${X.pages} หน้า`, `${X.pages} pages`), i: asTE(X.verdictLabel) },
      ...(X.missing || []).slice(0, 6).map((m) => ({ n: asTE(m.k), t: "—", v: P("ขาด", "Missing"), i: asTE(m.src) })),
    ],
    gridCols: [
      { k: P("ข้อ", "Clause") },
      { k: P("หัวข้อ", "Topic") },
      { k: P("ความเสี่ยง", "Risk") },
      { k: P("%", "%") },
    ],
    gridRows: heat(X).map((h) => ({
      c: [h.cl, asTE(h.k), P(h.sev, h.sev), String(h.pct)],
      f: [0, 0, h.sev === "high" ? 2 : h.sev === "med" ? 1 : 0, 0],
    })),
    map: [
      {
        q: P("ใครเป็นคู่สัญญา", "Who are the parties?"),
        n: String(X.parties?.length || 1),
        chain: [asTE(X.doc), party, asTE(X.verdictLabel)],
        note: asTE(X.brief),
      },
      ...((X.unusual || []).slice(0, 2).map((u) => ({
        q: asTE(u.k),
        n: "1",
        chain: [asTE(u.k), asTE(u.vs), asTE(u.src)],
        note: asTE(X.verdictWhy),
      }))),
    ],
    flags,
    workstreams: [
      { k: P("แผนที่สัญญา", "Contract map"), p: 100, o: "Engine" },
      { k: P("ข้อค้นพบ", "Findings"), p: cards.length ? 80 : 40, o: "Counsel" },
      { k: P("เจรจา", "Negotiation"), p: X.ladder?.length ? 50 : 20, o: "Counsel" },
    ],
    coverage: [
      { k: P("ข้อที่วางแผนที่", "Clauses mapped"), v: String(heat(X).length), n: P("จากแผนความร้อน", "From the heatmap") },
      { k: P("ข้อที่ขาด", "Missing"), v: String(X.missing?.length || 0), n: P("เทียบเพลย์บุ๊ก", "Against playbook") },
      { k: P("บัตรประเด็น", "Issue cards"), v: String(cards.length), n: P("จากคณะทบทวน", "From the review") },
      { k: P("ความเชื่อมั่นต่ำที่ส่งทนาย", "Low-confidence routed to counsel"), v: String(cards.filter((f) => (f.conf || 100) < 70).length), n: P("เครื่องยนต์ไม่ลงนาม", "The engine never signs") },
    ],
    requests: [
      ...(X.missing || []).map((m, i) => ({
        id: `RQ-${String(i + 1).padStart(2, "0")}`,
        t: asTE(m.k),
        to: P("คู่สัญญา", "Counterparty"),
        d: dateLine(X, 0),
        st: "open" as const,
      })),
      ...(X.redlines || []).slice(0, 3).map((r, i) => ({
        id: `RL-${r.cl || i + 1}`,
        t: P(`ยืนยัน redline ข้อ ${r.cl}`, `Confirm redline cl.${r.cl}`),
        to: P("ทนาย", "Counsel"),
        d: "—",
        st: "open" as const,
      })),
    ],
    reports: [
      { k: P("แผนที่ X-Ray", "X-Ray map"), f: "TXT" },
      { k: P("สรุปผู้บริหาร", "Management brief"), f: "TXT" },
      { k: P("ทะเบียนธงแดง", "Red-flag register"), f: "TXT" },
      { k: P("บันไดเจรจา", "Negotiation ladder"), f: "TXT" },
    ],
  };
}

export function autopilotOf(X: XrayView, R?: ReviewLive | null) {
  return {
    index: "1",
    missing: (X.missing || []).map((m) => asTE(m.k)),
    material: [asTE(X.doc), ...heat(X).slice(0, 3).map((h) => P(`ข้อ ${h.cl} · ${asTE(h.k).t}`, `cl.${h.cl} · ${asTE(h.k).e}`))],
    qa: [
      ...(X.missing || []).slice(0, 3).map((m) => asTE(m.k)),
      ...(findings(R).slice(0, 2).map((f) => asTE(f.issue))),
    ],
  };
}

export function dilReportText(lang: "en" | "th", X: XrayView, R?: ReviewLive | null) {
  const th = lang === "th";
  const d = dilOf(X, R);
  return [
    `LAW24 · ${th ? "รายงานจากแผนที่" : "Report from the map"}`,
    `${X.ref} · ${asTE(X.doc)[th ? "t" : "e"]}`,
    "",
    ...(d.flags.slice(0, 8).map((f) => `${f.id}  ${th ? asTE(f.t).t : asTE(f.t).e}`)),
    "",
    th ? asTE(X.brief).t : asTE(X.brief).e,
    "",
    th ? "เครื่องยนต์ไม่ลงนามแทน" : "The engine never signs.",
  ].join("\n");
}

export function negotiateOf(X: XrayView, R?: ReviewLive | null) {
  const must = (X.missing?.length || 0) + (X.unusual?.length || 0);
  const should = X.redlines?.length || 0;
  const positions = [
    ...(X.unusual || []).map((u) => ({
      i: asTE(u.k),
      tier: "must",
      us: asTE(u.vs),
      them: asTE(u.k),
      gap: "wide",
      st: "open" as const,
    })),
    ...(X.missing || []).map((m) => ({
      i: asTE(m.k),
      tier: "must",
      us: P("ต้องมีในฉบับ", "Must be in the paper"),
      them: P("ยังไม่มี", "Absent"),
      gap: "wide",
      st: "open" as const,
    })),
    ...(X.redlines || []).map((r) => ({
      i: P(`ข้อ ${r.cl}`, `cl.${r.cl}`),
      tier: "should",
      us: asTE(r.text),
      them: P("ถ้อยคำคู่สัญญา", "Counterparty wording"),
      gap: "narrow",
      st: "open" as const,
    })),
  ];
  const ladderTrade = (X.ladder || []).slice(0, 4).map((r, i) => ({
    g: i === 0 ? P("ยืนจุดยืนที่ต้องการ", "Hold the preferred rung") : asTE(r.k),
    get: asTE(r.v),
    v: i < 2 ? P("สูง", "High") : P("ปานกลาง", "Medium"),
  }));
  const moves = findings(R).length
    ? findings(R).slice(0, 6).map((f) => ({ i: asTE(f.issue), k: f.rec || "hold", why: asTE(f.why), msg: asTE(f.word) }))
    : (X.redlines || []).map((r) => ({
        i: P(`ข้อ ${r.cl}`, `cl.${r.cl}`),
        k: "hold",
        why: asTE(X.verdictWhy),
        msg: asTE(r.text),
      }));
  const email = asTE(X.email);
  return {
    tiers: [
      { k: P("ต้องได้", "Must have"), n: Math.max(must, 1), d: P("ไม่ลงนามหากยังไม่ได้", "No signature without these") },
      { k: P("ควรได้", "Should have"), n: should, d: P("แลกได้ตามบันได", "Tradeable on the ladder") },
      { k: P("ได้ก็ดี", "Nice to have"), n: Math.max(0, (X.ladder?.length || 0) - 2), d: P("เหรียญต่อรอง", "Bargaining currency") },
    ],
    leverage: {
      us: [
        { k: P("แผนที่ชี้ช่องที่ปิดได้", "The map names closable gaps"), w: 70 },
        { k: asTE(X.verdictLabel), w: String(X.verdict) === "reject" ? 85 : String(X.verdict) === "sign" ? 30 : 60 },
      ],
      them: [
        { k: P("ฉบับนี้เป็นกระดาษคู่สัญญา", "This is their paper"), w: 75 },
        { k: P("ข้อที่เอียงตามแผนความร้อน", "Heatmap tilt"), w: pct(heat(X).reduce((s, h) => s + h.pct, 0) / Math.max(1, heat(X).length)) },
      ],
    },
    positions,
    ladder: ladderTrade,
    moves: moves.length ? moves : [{ i: asTE(X.verdictLabel), k: "hold", why: asTE(X.verdictWhy), msg: email }],
    rounds: [
      {
        n: "01",
        d: stampDay(),
        de: stampDay(),
        who: P("แผนที่นี้", "This map"),
        s: asTE(X.brief),
        st: "done" as const,
      },
      {
        n: "02",
        d: "—",
        de: "—",
        who: P("รอบถัดไป — ทนายส่ง", "Next round — counsel sends"),
        s: X.ladder?.[0] ? asTE(X.ladder[0].v) : asTE(X.verdictWhy),
        st: "next" as const,
      },
    ],
    cpIntel: {
      title: P("จากฉบับนี้ — ไม่ใช่ประวัติพอร์ตสมมติ", "From this instrument — not a demo portfolio"),
      rows: [
        { k: P("คู่สัญญา", "Parties"), v: partyStr(X) },
        { k: P("มูลค่า", "Value"), v: P(moneyStr(X), moneyStr(X)) },
        { k: P("คำตัดสิน", "Verdict"), v: asTE(X.verdictLabel) },
        { k: P("ข้อต้องได้ที่เปิด", "Open must-haves"), v: P(String(must), String(must)) },
      ],
    },
    email,
  };
}

export function obligationsOf(X: XrayView) {
  const register = (X.dates || []).map((d, i) => ({
    o: asTE(d.k),
    c: asLine(d.src) || "—",
    ow: P("ฝ่ายกฎหมาย", "Legal"),
    ty: P("กำหนด", "Deadline"),
    d: typeof d.v === "string" ? d.v : asLine(d.v),
    st: i === 0 ? "soon" : "ok",
  }));
  const extra = (X.missing || []).map((m) => ({
    o: asTE(m.k),
    c: asLine(m.src) || "—",
    ow: P("ทนาย", "Counsel"),
    ty: P("เอกสารที่ขาด", "Missing document"),
    d: "—",
    st: "risk",
  }));
  const rows = [...register, ...extra];
  const cal = (X.dates || []).map((d) => ({
    m: asTE(d.k),
    n: 1,
    items: [P(`${typeof d.v === "string" ? d.v : asLine(d.v)}`, `${typeof d.v === "string" ? d.v : asLine(d.v)}`)],
  }));
  const first = X.dates?.[0];
  return {
    stats: [
      { k: P("ข้อผูกพันจากแผนที่", "Obligations from the map"), v: String(rows.length) },
      { k: P("วันที่สำคัญ", "Key dates"), v: String(X.dates?.length || 0) },
      { k: P("ข้อที่ขาด", "Missing items"), v: String(X.missing?.length || 0) },
      { k: P("สถานะ", "Status"), v: P("ยังไม่ลงนาม", "Not signed") },
    ],
    register: rows,
    cal: cal.length ? cal : [{ m: P("ยังไม่มีปฏิทิน", "No calendar yet"), n: 0, items: [P("วางแผนที่แล้ววันที่จึงลงปฏิทิน", "Dates land on the calendar once mapped")] }],
    renewals: first
      ? [{
          c: asTE(X.doc),
          v: P(moneyStr(X), moneyStr(X)),
          x: dateLine(X, 0),
          d: dateLine(X, 1) === "—" ? dateLine(X, 0) : dateLine(X, 1),
          l: "—",
          k: String(X.verdict) === "reject" ? "exit" : "reneg",
        }]
      : [],
    alerts: [
      ...(X.dates || []).slice(0, 3).map((d, i) => ({
        t: i === 0 ? "T–?" : `T`,
        i: P(`${asTE(d.k).t} · ${typeof d.v === "string" ? d.v : asLine(d.v)}`, `${asTE(d.k).e} · ${typeof d.v === "string" ? d.v : asLine(d.v)}`),
        ow: P("ฝ่ายกฎหมาย", "Legal"),
        a: P("ใส่ในปฏิทินหลังลงนาม", "Diary after signature"),
        k: i === 0 ? "amber" : "grey",
      })),
      ...(X.missing || []).slice(0, 2).map((m) => ({
        t: "GAP",
        i: asTE(m.k),
        ow: P("ทนาย", "Counsel"),
        a: P("ปิดก่อนลงนาม", "Close before signature"),
        k: "red",
      })),
    ],
  };
}

export function noticeText(lang: "en" | "th", X: XrayView) {
  const th = lang === "th";
  const d = dateRow(X, 0);
  return [
    th ? "ร่างหนังสือบอกกล่าว" : "Draft notice",
    `${th ? "เรื่อง" : "Re"}: ${asTE(X.doc)[th ? "t" : "e"]} (${X.ref})`,
    d ? `${th ? "กำหนดในแผนที่" : "Date on the map"}: ${dateLine(X, 0)}` : "",
    "",
    th ? asTE(X.email).t : asTE(X.email).e,
    "",
    th ? "ร่างโดย LAW24 · ทนายเป็นผู้ลงนามในท่าที · เครื่องยนต์ไม่ลงนามแทน" : "Drafted by LAW24 · counsel signs the posture · the engine never signs",
  ].filter(Boolean).join("\n");
}

export function clientRoomOf(X: XrayView, R?: ReviewLive | null) {
  const risks = [
    ...(X.unusual || []).map((u, i) => ({
      id: `R${i + 1}`,
      k: asTE(u.k),
      plain: asTE(u.vs),
      rec: asTE(u.src),
    })),
    ...(findings(R).slice(0, 4).map((f, i) => ({
      id: f.id || `F${i + 1}`,
      k: asTE(f.issue),
      plain: asTE(f.why),
      rec: asTE(f.word),
    }))),
  ].slice(0, 6);
  return {
    client: partyStr(X),
    risks: risks.length ? risks : [{ id: "R1", k: asTE(X.verdictLabel), plain: asTE(X.verdictWhy), rec: asTE(X.brief) }],
    questions: (X.ladder || []).slice(0, 3).map((r) => asTE(r.v)),
    cost: P("ค่าธรรมเนียมตามใบเสนอสำนักงาน", "Fee per the firm quote"),
    progress: P(`แผนที่แล้ว · ${asTE(X.verdictLabel).t}`, `Mapped · ${asTE(X.verdictLabel).e}`),
  };
}

export function firmBrainOf(X: XrayView) {
  return [
    { k: P("บรรทัดฐานจากฉบับนี้", "Precedents from this paper"), n: String(X.redlines?.length || 0), d: P("redline ที่แผนที่เพิ่งเขียน", "Redlines the map just wrote"), href: "/negotiate?s=nladder" },
    { k: P("ข้อในแผนความร้อน", "Heatmap clauses"), n: String(heat(X).length), d: asTE(X.doc), href: "/review?s=xray" },
    { k: P("ข้อค้นพบ", "Findings"), n: String((X.unusual?.length || 0) + (X.missing?.length || 0)), d: P("ผิดปกติและข้อที่ขาด", "Unusual terms and gaps"), href: "/review?s=find" },
    { k: P("จุดยืนเจรจา", "Negotiation positions"), n: String(X.ladder?.length || 0), d: P("บันไดจากแผนที่", "Ladder from the map"), href: "/negotiate?s=nladder" },
    { k: P("วันที่สำคัญ", "Key dates"), n: String(X.dates?.length || 0), d: P("ลงทะเบียนข้อผูกพัน", "Onto the obligation register"), href: "/obligations?s=oreg" },
    { k: P("กฎหมายที่อ้าง", "Authorities cited"), n: String(X.laws?.length || 0), d: P("ผูกกับฐานกฎหมายไทย", "Tied to Thai authorities"), href: "/help?s=watch" },
  ];
}

function normName(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function namesMatch(a: string, b: string) {
  const x = normName(a);
  const y = normName(b);
  return Boolean(x && y && x === y);
}

function clientMatchesParty(c: ClientRecord, party: { t: string; e: string }) {
  return namesMatch(c.name, party.e)
    || namesMatch(c.nameTh, party.t)
    || namesMatch(c.name, party.t)
    || namesMatch(c.nameTh, party.e);
}

function mapFee(X: XrayView) {
  const raw = moneyStr(X);
  if (raw === "—") return "";
  return raw.startsWith("THB") ? raw : `THB ${raw}`;
}

function mapDue(X: XrayView) {
  const due = dateLine(X, 0);
  return due === "—" ? stampDay() : due;
}

function xrayMovement(assignmentId: string, X: XrayView, R?: ReviewLive | null) {
  const nFind = findings(R).length;
  const at = stampNow();
  return [
    {
      id: `MV-${assignmentId}-xray`,
      assignmentId,
      at,
      actor: "Engine",
      stage: "work" as const,
      en: `Contract X-Ray mapped as ${X.ref} (${X.pages} pages). Verdict: ${asTE(X.verdictLabel).e}.`,
      th: `X-Ray วางแผนที่ฉบับ ${X.ref} (${X.pages} หน้า) คำตัดสิน: ${asTE(X.verdictLabel).t}`,
      href: "/review?s=xray",
    },
    ...(nFind
      ? [{
          id: `MV-${assignmentId}-find`,
          assignmentId,
          at,
          actor: FIRM_USER.name,
          stage: "work" as const,
          en: `Review pack: ${nFind} issue cards. Heatmap ${heat(X).length} clauses, ${X.missing?.length || 0} missing.`,
          th: `ชุดตรวจ: ${nFind} บัตรประเด็น แผนความร้อน ${heat(X).length} ข้อ ขาด ${X.missing?.length || 0}`,
          href: "/review?s=find",
        }]
      : []),
  ];
}

function mergeMovements(existing: PracticeState["movements"], added: PracticeState["movements"]) {
  const ids = new Set(existing.map((m) => m.id));
  return [...existing, ...added.filter((m) => !ids.has(m.id))];
}

function findMappedAssignment(p: PracticeState, X: XrayView, party: { t: string; e: string }): AssignmentRecord | undefined {
  const ref = (X.ref || "").trim();
  if (ref) {
    const byRef = p.assignments.find((a) => a.ref === ref);
    if (byRef) return byRef;
  }
  const active = p.assignments.find((a) => a.id === p.activeAssignmentId);
  if (active && active.stage !== "closed" && engagementOf(active.type) === "review" && !active.ref) return active;
  const client = p.clients.find((c) => clientMatchesParty(c, party));
  if (!client) return undefined;
  return [...p.assignments].reverse().find((a) =>
    a.clientId === client.id && a.stage !== "closed" && (!a.ref || a.ref === ref)
  );
}

/**
 * Persist (or refresh) a Firm client + assignment from a live X-Ray map.
 * Idempotent on `X.ref`. Attaches to the open Firm assignment when the user
 * mapped from that row; otherwise reuses a client whose name matches party 0.
 */
export function applyMapToPractice(p: PracticeState, X: XrayView, R?: ReviewLive | null): PracticeState {
  const party = partyStr(X);
  const ref = (X.ref || "").trim();
  const titleE = asTE(X.doc).e;
  const titleT = asTE(X.doc).t;
  const fee = mapFee(X);
  const due = mapDue(X);
  const existing = findMappedAssignment(p, X, party);

  if (existing) {
    const assignments = p.assignments.map((a) =>
      a.id === existing.id
        ? {
            ...a,
            type: "review" as const,
            stage: a.stage === "intake" ? "work" as const : a.stage,
            due: due || a.due,
            fee: fee || a.fee,
            href: "/review?s=xray",
            ref: ref || a.ref,
          }
        : a
    );
    return {
      ...p,
      // Client and engagement names came from Firm intake. Contract parties
      // and document title belong to the X-Ray map and must not rename them.
      clients: p.clients,
      assignments,
      movements: mergeMovements(p.movements, xrayMovement(existing.id, X, R)),
      activeClientId: existing.clientId,
      activeAssignmentId: existing.id,
    };
  }

  const reuse = p.clients.find((c) => clientMatchesParty(c, party));
  const ids = nextIds(p);
  const clientId = reuse?.id || ids.clientId;
  const assignmentId = ids.assignmentId;
  const clients = reuse
    ? p.clients.map((c) =>
        c.id === reuse.id
          ? { ...c, status: "active" as const, name: party.e && party.e !== "—" ? party.e : c.name, nameTh: party.t && party.t !== "—" ? party.t : c.nameTh }
          : c
      )
    : [
        ...p.clients,
        {
          id: clientId,
          name: party.e && party.e !== "—" ? party.e : "Mapped client",
          nameTh: party.t && party.t !== "—" ? party.t : "ลูกค้าจากแผนที่",
          sector: "Mapped",
          owner: FIRM_USER.name,
          opened: stampDay(),
          status: "active" as const,
        },
      ];
  const assignments: AssignmentRecord[] = [
    ...p.assignments,
    {
      id: assignmentId,
      clientId,
      title: titleE && titleE !== "—" ? titleE : `Mapped · ${ref || "contract"}`,
      titleTh: titleT && titleT !== "—" ? titleT : `แผนที่ · ${ref || "สัญญา"}`,
      type: "review",
      stage: "work",
      lead: FIRM_USER.name,
      due,
      fee: fee || "THB —",
      href: "/review?s=xray",
      ref: ref || undefined,
    },
  ];
  return {
    ...p,
    clients,
    assignments,
    movements: mergeMovements(p.movements, [
      {
        id: `MV-${assignmentId}-intake`,
        assignmentId,
        at: stampNow(),
        actor: "Engine",
        stage: "intake",
        en: `Assignment opened from Contract X-Ray (${X.ref}, ${X.pages} pages).`,
        th: `เปิดงานจาก Contract X-Ray (${X.ref}, ${X.pages} หน้า)`,
        href: "/review?s=xray",
      },
      ...xrayMovement(assignmentId, X, R),
    ]),
    activeClientId: clientId,
    activeAssignmentId: assignmentId,
  };
}

export function practiceFromMap(X: XrayView, R?: ReviewLive | null): PracticeState {
  return applyMapToPractice({
    activeClientId: "",
    activeAssignmentId: "",
    clients: [],
    assignments: [],
    movements: [],
    pool: [],
  }, X, R);
}

export function isDemoFixturePractice(p: PracticeState) {
  return p.assignments.some((a) => a.matter === "nimbus" || a.matter === "charoen" || a.matter === "portfolio")
    || p.clients.some((c) => c.id === "CL-01" && /siam digital/i.test(c.name));
}

function stripFixturePractice(p: PracticeState): PracticeState {
  const fixtureClient = (id: string, name: string) =>
    (id === "CL-01" && /siam digital/i.test(name))
    || (id === "CL-02" && /charoen/i.test(name))
    || (id === "CL-03" && /ptt/i.test(name));
  const base: PracticeState = {
    ...p,
    clients: p.clients.filter((c) => c.id !== "CL-MAP" && !fixtureClient(c.id, c.name)),
    assignments: p.assignments.filter((a) => a.clientId !== "CL-MAP" && a.id !== "A-MAP" && !a.matter),
    movements: p.movements.filter((m) => !String(m.id).startsWith("MV-MAP") && !/^A-248[1-4]$/.test(m.assignmentId)),
  };
  return {
    ...base,
    activeClientId: base.clients.some((c) => c.id === p.activeClientId) ? p.activeClientId : (base.clients[0]?.id || ""),
    activeAssignmentId: base.assignments.some((a) => a.id === p.activeAssignmentId) ? p.activeAssignmentId : (base.assignments[0]?.id || ""),
  };
}

export function withLiveMatter(p: PracticeState, X: XrayView | null, R?: ReviewLive | null): PracticeState {
  const base = stripFixturePractice(p);
  if (!X) return base;
  return applyMapToPractice(base, X, R);
}
