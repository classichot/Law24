"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, BookOpen, Keyboard } from "lucide-react";
import { Kicker, Title, ReviewerPath } from "@/components/ui";
import { useStore } from "@/lib/store";
import { T } from "@/lib/i18n";
import { LeioChat } from "@/components/LeioChat";
import {
  PLAYBOOKS,
  copyTE,
  helpBookHref,
  isPlaybookKey,
  playbookEntries,
  type PlaybookKey,
} from "@/lib/guides";
import { HELP_KEYS, HELP_PRINCIPLES, HELP_START, MODULE_GROUPS, visibleModules, visiblePlaybooks } from "@/lib/help";
import { LEIO, REG_UPDATES, RESEARCH_BRIEFS } from "@/lib/leio";
import { TRUST_CONTROLS } from "@/lib/product";

export function HelpScreen({ screen }: { screen: string }) {
  if (screen === "books") return <Books />;
  if (screen === "book") return <Book />;
  if (screen === "leio") return <LeioDesk />;
  if (screen === "watch") return <Watch />;
  if (screen === "trust") return <Trust />;
  return <HowTo />;
}

function HowTo() {
  const s = useStore();
  const th = s.lang === "th";
  const mods = visibleModules(s.edition);
  return (
    <div className="pad-page">
      <Kicker>help · how to use</Kicker>
      <Title><T en="How to use LAW24" th="วิธีใช้ LAW24" /></Title>
      <p className="page-sub">
        <T
          en="LAW24 is the legal operating system. Read the house rule, walk the first session, then open the module that does the work."
          th="LAW24 คือระบบปฏิบัติการกฎหมาย อ่านกฎบ้าน เดินขั้นแรก แล้วเปิดโมดูลที่ทำงานนั้น"
        />
      </p>

      <h5><T en="Four rules of the OS" th="สี่กฎของระบบ" /></h5>
      <div className="help-principles">
        {HELP_PRINCIPLES.map((p) => (
          <div key={p.k.e} className="help-card">
            <strong>{copyTE(s.lang, p.k)}</strong>
            <p>{copyTE(s.lang, p.d)}</p>
          </div>
        ))}
      </div>

      <h5><T en="Live AI (X-Ray and Leio)" th="AI สด (X-Ray และเลโอ)" /></h5>
      <div className="help-card" style={{ marginBottom: 24 }}>
        <p>
          <T
            en="Without a key, X-Ray and Leio use the Nimbus demo. To run a real model on the server, put OPENAI_API_KEY or ANTHROPIC_API_KEY in .env.local (see .env.example), restart npm run dev, then drop a PDF/DOCX on Contract X-Ray or ask Leio. The engine never signs — counsel confirms. Documents are not used to train the public model."
            th="ถ้าไม่มีคีย์ X-Ray และเลโอใช้สาธิตนิมบัส ถ้าจะให้โมเดลจริงทำงานบนเซิร์ฟเวอร์ ให้ใส่ OPENAI_API_KEY หรือ ANTHROPIC_API_KEY ใน .env.local (ดู .env.example) แล้วรีสตาร์ท npm run dev จากนั้นวาง PDF/DOCX ที่ Contract X-Ray หรือถามเลโอ เครื่องยนต์ไม่ลงนามแทน — ทนายเป็นผู้ยืนยัน เอกสารไม่ถูกใช้ฝึกโมเดลสาธารณะ"
          />
        </p>
        <p className="text-muted" style={{ fontSize: 12, margin: 0 }}>
          {s.aiLive ? (th ? "ตอนนี้: AI สดเปิดอยู่" : "Now: Live AI is on") : (th ? "ตอนนี้: โหมดสาธิต (ยังไม่มีคีย์)" : "Now: demo mode (no key)")}
        </p>
      </div>

      <h5><T en="First session" th="ขั้นแรก" /></h5>
      <ol className="assist-path">
        {HELP_START.map((st) => (
          <li key={st.n}>
            <span className="assist-n">{st.n}</span>
            <div>
              <strong>{copyTE(s.lang, st.t)}</strong>
              <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>{copyTE(s.lang, st.d)}</div>
            </div>
          </li>
        ))}
      </ol>

      <ReviewerPath />

      <h5><T en="Which module, when" th="โมดูลไหน เมื่อใด" /></h5>
      {MODULE_GROUPS.map((g) => {
        const items = mods.filter((m) => m.group === g.id);
        if (!items.length) return null;
        return (
          <div key={g.id} className={`help-mod-group ${g.cls || ""}`}>
            <h6>{g.n ? `${g.n} · ` : ""}{th ? g.th : g.en}</h6>
            <div className="help-mods">
              {items.map((m) => (
                <div key={m.mode} className="help-card">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
                    <strong style={{ textTransform: "capitalize" }}>{m.mode}</strong>
                    <Link href={helpBookHref(m.playbook)} style={{ fontSize: 12 }}>{PLAYBOOKS[m.playbook].id}</Link>
                  </div>
                  <p>{copyTE(s.lang, m.when)}</p>
                  <p className="text-muted" style={{ fontSize: 12, margin: 0 }}>{copyTE(s.lang, m.first)}</p>
                  <Link href={m.href} className="btn btn-secondary" style={{ marginTop: 8, alignSelf: "flex-start", fontSize: 12 }}>
                    <T en="Open module" th="เปิดโมดูล" /> <ArrowRight size={12} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <h5><T en="Host desk (7L)" th="โต๊ะโฮสต์ (7L)" /></h5>
      <div className="help-card" style={{ marginBottom: 24 }}>
        <p>
          <T
            en="Demo links mint only at Host desk. Unlock with the host key (never on public login), set 1–14 days (default 3), Generate, then send the signed /review/{token} URL. Guests open that URL on another device until it expires — they do not use /host."
            th="ลิงก์สาธิตสร้างได้ที่โต๊ะโฮสต์เท่านั้น ปลดล็อกด้วยคีย์โฮสต์ (ไม่อยู่หน้าเข้าสู่ระบบสาธารณะ) ตั้ง 1–14 วัน (ค่าเริ่มต้น 3) กดสร้าง แล้วส่ง URL /review/{token} ที่เซ็นแล้ว ผู้รับเปิด URL นั้นบนเครื่องอื่นได้จนกว่าจะหมดอายุ — ไม่ได้ใช้ /host"
          />
        </p>
        <Link href="/host" className="btn btn-secondary" style={{ marginTop: 8, alignSelf: "flex-start", fontSize: 12 }}>
          <T en="Open Host desk" th="เปิดโต๊ะโฮสต์" /> <ArrowRight size={12} />
        </Link>
      </div>

      <div className="help-keys">
        <div className="guide-kicker" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Keyboard size={12} /> <T en="Shortcuts" th="ทางลัด" />
        </div>
        {HELP_KEYS.map((k) => (
          <div key={k.k} className="help-key-row">
            <kbd className="os-kbd">{k.k}</kbd>
            <span>{copyTE(s.lang, k.d)}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 28 }}>
        <Link href="/help?s=leio" className="btn btn-primary">
          <T en="Ask Leio" th="ถามเลโอ" /> <ArrowRight size={14} />
        </Link>
        <Link href="/help?s=watch" className="btn btn-secondary">
          <T en="Research & regulations" th="วิจัยและกฎ" />
        </Link>
        <Link href="/help?s=books" className="btn btn-secondary">
          <BookOpen size={16} /> <T en="Playbook library" th="คลังเพลย์บุ๊ก" />
        </Link>
        <Link href="/assist?s=ask" className="btn btn-secondary">
          <T en="Describe a job in Assist" th="อธิบายงานในผู้ช่วย" />
        </Link>
      </div>
      <p className="text-muted" style={{ marginTop: 16, fontSize: 12 }}>
        {th
          ? `โหมดปัจจุบัน: ${s.edition === "firm" ? "LAW24 Firm" : "LAW24 Corporate"} — เครื่องยนต์ชุดเดียวกัน`
          : `Current mode: ${s.edition === "firm" ? "LAW24 Firm" : "LAW24 Corporate"} — same engine`}
      </p>
    </div>
  );
}

function LeioDesk() {
  const s = useStore();
  return (
    <div className="pad-page">
      <Kicker>help · leio</Kicker>
      <Title>Leio</Title>
      <p className="page-sub">{copyTE(s.lang, LEIO.role)}. {copyTE(s.lang, LEIO.never)}</p>
      <div className="leio-desk">
        <LeioChat variant="page" />
        <aside className="leio-rail">
          <div className="guide-kicker"><T en="On watch" th="กำลังติดตาม" /></div>
          {REG_UPDATES.filter((r) => r.hot).map((r) => (
            <Link key={r.id} href="/help?s=watch" className="leio-rail-item">
              <span>{r.id}</span>
              {copyTE(s.lang, r.title)}
            </Link>
          ))}
          <div className="guide-kicker" style={{ marginTop: 16 }}><T en="Research" th="วิจัย" /></div>
          {RESEARCH_BRIEFS.slice(0, 3).map((b) => (
            <Link key={b.id} href="/help?s=watch" className="leio-rail-item">
              <span>{b.id}</span>
              {copyTE(s.lang, b.q)}
            </Link>
          ))}
        </aside>
      </div>
    </div>
  );
}

function Watch() {
  const s = useStore();
  return (
    <div className="pad-page">
      <Kicker>help · research & regulations</Kicker>
      <Title><T en="Research and regulation watch" th="วิจัยและติดตามกฎ" /></Title>
      <p className="page-sub">
        <T
          en="Leio tracks gazettes and house research against the live matters. A new rule does not move the playbook until counsel confirms."
          th="เลโอติดตามประกาศและงานวิจัยบ้านเทียบเรื่องที่กำลังทำ กฎใหม่ไม่ย้ายเพลย์บุ๊กจนกว่าทนายจะยืนยัน"
        />
      </p>
      <div className="leio-watch">
        <section>
          <h5><T en="Regulation updates" th="กฎที่เพิ่งออก" /></h5>
          <div className="leio-watch-list">
            {REG_UPDATES.map((r) => (
              <article key={r.id} className={`help-card${r.hot ? " hot" : ""}`}>
                <div className="guide-kicker">{r.id} · {r.date} · {copyTE(s.lang, r.source)}</div>
                <strong>{copyTE(s.lang, r.title)}</strong>
                <p>{copyTE(s.lang, r.impact)}</p>
                <p className="text-muted" style={{ fontSize: 12, margin: 0 }}>{copyTE(s.lang, r.applies)}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                  <Link href={r.href} className="btn btn-secondary" style={{ fontSize: 12 }}><T en="Open" th="เปิด" /></Link>
                  <button type="button" className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => s.ask(s.lang === "th" ? `กฎ ${r.id}` : `regulation ${r.id}`)}>
                    <T en="Ask Leio" th="ถามเลโอ" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section>
          <h5><T en="Research briefs" th="บันทึกวิจัย" /></h5>
          <div className="leio-watch-list">
            {RESEARCH_BRIEFS.map((b) => (
              <article key={b.id} className="help-card">
                <div className="guide-kicker">{b.id}</div>
                <strong>{copyTE(s.lang, b.q)}</strong>
                <p>{copyTE(s.lang, b.a)}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {b.cites.map((c) => (
                    <Link key={c.label} href={c.href} className="tag tag-outline" style={{ fontSize: 10 }}>{c.label}</Link>
                  ))}
                </div>
                <button type="button" className="btn btn-primary" style={{ fontSize: 12, alignSelf: "flex-start" }} onClick={() => s.ask(copyTE(s.lang, b.q))}>
                  <T en="Ask Leio" th="ถามเลโอ" />
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Books() {
  const s = useStore();
  const keys = visiblePlaybooks(s.edition);
  const entries = playbookEntries().filter((x) => keys.includes(x.key));
  return (
    <div className="pad-page">
      <Kicker>help · playbook library</Kicker>
      <Title><T en="House playbooks" th="เพลย์บุ๊กบ้าน" /></Title>
      <p className="page-sub">
        <T
          en="These are the books in force. Open the volume that governs the work, then enter the module it names."
          th="นี่คือหนังสือที่ใช้บังคับ เปิดเล่มที่กำกับงาน แล้วเข้าโมดูลที่เล่มนั้นชี้"
        />
      </p>
      <div className="help-grid">
        {entries.map(({ key, book }) => (
          <Link key={key} href={helpBookHref(key)} className="help-card help-book">
            <div className="guide-kicker">{book.id} · {book.ver}</div>
            <strong>{copyTE(s.lang, book.name)}</strong>
            <p>{copyTE(s.lang, book.applies)}</p>
            <span className="text-muted" style={{ fontSize: 12 }}>{book.rules.length} {s.lang === "th" ? "กฎ" : "rules"} →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Book() {
  const s = useStore();
  const params = useSearchParams();
  const keys = visiblePlaybooks(s.edition);
  const raw = params.get("b");
  const key: PlaybookKey = isPlaybookKey(raw) && keys.includes(raw) ? raw : keys[0];
  const book = PLAYBOOKS[key];
  const others = playbookEntries().filter((x) => keys.includes(x.key));
  return (
    <div className="pad-page">
      <Kicker>help · playbook in force</Kicker>
      <Title>{copyTE(s.lang, book.name)}</Title>
      <p className="page-sub">{copyTE(s.lang, book.applies)}</p>
      <div className="help-book-meta">
        <span>{book.id}</span>
        <span>{book.ver}</span>
      </div>
      <h5><T en="Rules in force" th="กฎที่ใช้บังคับ" /></h5>
      <ol className="help-rules">
        {book.rules.map((r, i) => (
          <li key={r.e}>
            <span className="assist-n">{String(i + 1).padStart(2, "0")}</span>
            <span>{copyTE(s.lang, r)}</span>
          </li>
        ))}
      </ol>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "24px 0 32px" }}>
        <Link href={book.href} className="btn btn-primary">
          <T en="Open in the engine" th="เปิดในเครื่องยนต์" /> <ArrowRight size={14} />
        </Link>
        <Link href="/help?s=books" className="btn btn-secondary">
          <T en="Back to library" th="กลับคลังเพลย์บุ๊ก" />
        </Link>
      </div>
      <div className="guide-kicker"><T en="Other house books" th="เล่มอื่นในบ้าน" /></div>
      <div className="help-examples">
        {others.map((x) => (
          <Link key={x.key} href={helpBookHref(x.key)} className={`filter-chip${x.key === key ? " on" : ""}`}>
            {x.book.id} · {copyTE(s.lang, x.book.name)}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Trust() {
  const s = useStore();
  return (
    <div className="pad-page">
      <Kicker>help · visible trust</Kicker>
      <Title><T en="Trust is inside the product" th="ความเชื่อถืออยู่ในตัวผลิตภัณฑ์" /></Title>
      <p className="page-sub">
        <T en="For legal users, security cannot be hidden in a policy page. LAW24 turns ETDA AI-governance and electronic-transaction principles into visible controls. The engine never signs." th="สำหรับผู้ใช้กฎหมาย ความปลอดภัยซ่อนในหน้านโยบายไม่ได้ LAW24 เปลี่ยนหลักธรรมาภิบาล AI ของ ETDA และธุรกรรมอิเล็กทรอนิกส์เป็นการควบคุมที่มองเห็น เครื่องยนต์ไม่ลงนามแทน" />
      </p>
      {TRUST_CONTROLS.map((c) => (
        <div key={c.k.e} className="xray-kv"><span>{copyTE(s.lang, c.k)}</span><strong>{copyTE(s.lang, c.v)}</strong></div>
      ))}
      <div className="stack-actions" style={{ marginTop: 18 }}>
        <Link href="/help?s=books" className="btn btn-primary"><T en="Open playbooks" th="เปิดเพลย์บุ๊ก" /></Link>
        <Link href="/help?s=leio" className="btn btn-secondary"><T en="Ask Leio" th="ถามเลโอ" /></Link>
        <button type="button" className="btn btn-secondary" onClick={() => s.ask(s.lang === "th" ? "เครื่องยนต์ลงนามแทนได้หรือไม่" : "Does the engine ever sign?")}>
          <T en="Ask: does the engine sign?" th="ถาม: เครื่องยนต์ลงนามแทนไหม" />
        </button>
      </div>
    </div>
  );
}
