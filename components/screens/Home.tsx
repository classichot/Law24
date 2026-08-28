"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { T } from "@/lib/i18n";
import { L } from "@/lib/model";
import { EditionBadge } from "@/components/EditionBadge";
import { Dropzone } from "@/components/Dropzone";
import { TrustStrip } from "@/components/TrustStrip";
import { PlaybookMark } from "@/components/PlaybookMark";
import { CLIENT_ROOM, ENTRANCES, PACKAGES, POSITION, TWIN_ASKS, WEDGE_TYPES } from "@/lib/product";
import { OS_FLOW, PLAYBOOKS, copyTE, helpBookHref, playbookKeyFor } from "@/lib/guides";
import { ReviewerPath } from "@/components/ui";
import { CONTRACT_ACCEPT } from "@/lib/ai/files";
import { formatExpiry, readInviteSession } from "@/lib/invite";
import { GuestBriefing } from "@/components/GuestBriefing";

export function HomeScreen() {
  const { edition } = useStore();
  return edition === "firm" ? <FirmHome /> : <CorporateHome />;
}

function HomePlaybooks() {
  const { lang, edition } = useStore();
  const th = lang === "th";
  const mods = edition === "firm"
    ? OS_FLOW.filter((x) => x.k !== "command")
    : OS_FLOW.filter((x) => x.k !== "practice");
  return (
    <>
      <h5 style={{ marginTop: 28 }}><T en="Playbook in force on each module" th="เพลย์บุ๊กที่ใช้บังคับในแต่ละโมดูล" /></h5>
      <div className="home-cards">
        {mods.map((m) => {
          const key = playbookKeyFor(m.k);
          const pb = PLAYBOOKS[key];
          return (
            <Link key={m.k} href={helpBookHref(key)} className="home-card" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="pb-mark compact" style={{ marginBottom: 8 }}>
                {pb.id} · {pb.ver}
              </div>
              <div style={{ fontWeight: 700 }}>{copyTE(lang, pb.name)}</div>
              <div className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>{th ? m.th : m.en}</div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

function InviteHomeStrip() {
  const { edition, startXray } = useStore();
  const router = useRouter();
  const invite = readInviteSession();
  if (!invite) return null;
  return (
    <div className="callout" style={{ marginBottom: 22 }}>
      <div className="stat-label">
        <T en="Host desk trial — full OS" th="ทดลองโต๊ะโฮสต์ — ทั้งระบบ" />
      </div>
      <GuestBriefing edition={edition} linked expiry={formatExpiry(invite.exp)} />
      <div className="stack-actions" style={{ marginTop: 12 }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => { startXray(); router.push("/review?s=xray"); }}
        >
          <T en="Sample ingest — Nimbus CT-291" th="รับเข้าตัวอย่าง — นิมบัส CT-291" />
        </button>
        <Link href="/review?s=xray" className="btn btn-secondary"><T en="Drop your own PDF/DOCX" th="ลาก PDF/DOCX ของคุณ" /></Link>
        <Link href="/help?s=leio" className="btn btn-ghost">Leio</Link>
      </div>
    </div>
  );
}

function CorporateHome() {
  const { lang, startXray, ask } = useStore();
  const router = useRouter();
  const th = lang === "th";
  return (
    <div className="home-wrap">
      <InviteHomeStrip />
      <div className="home-hero">
        <div>
          <div className="home-kicker-row">
            <span>{th ? "LAW24 Corporate" : "LAW24 Corporate"}</span>
            <EditionBadge size="lg" />
          </div>
          <h1>{L(lang, POSITION.hook)}</h1>
          <p>{L(lang, ENTRANCES.corporate.pitch)}</p>
          <p className="text-muted" style={{ fontSize: 13 }}>{L(lang, ENTRANCES.corporate.fear)}</p>
          <div style={{ marginTop: 12 }}><PlaybookMark mode="command" screen="desk" /></div>
        </div>
        <Dropzone
          bucket="xray"
          compact
          accept={CONTRACT_ACCEPT}
          title={<T en="Analyse a contract" th="วิเคราะห์สัญญา" />}
          hint={<T en="Thai or English. X-Ray in under three minutes." th="ไทยหรืออังกฤษ X-Ray ในไม่ถึงสามนาที" />}
          multiple={false}
          onAfter={() => { router.push("/review?s=xray"); }}
        />
      </div>
      <div className="stack-actions" style={{ marginBottom: 28 }}>
        <button type="button" className="btn btn-primary" onClick={() => { startXray(); router.push("/review?s=xray"); }}>
          <T en="Open Contract X-Ray" th="เปิด Contract X-Ray" />
        </button>
        <Link href="/intel?s=twin" className="btn btn-secondary"><T en="Ask the Legal Twin" th="ถามฝาแฝดกฎหมาย" /></Link>
        <Link href="/command?s=desk" className="btn btn-secondary"><T en="Legal command center" th="ศูนย์บัญชาการกฎหมาย" /></Link>
      </div>
      <TrustStrip />
      <ReviewerPath />
      <h5 style={{ marginTop: 28 }}><T en="Management can ask" th="ฝ่ายบริหารถามได้" /></h5>
      <div className="home-cards" style={{ marginBottom: 28 }}>
        {TWIN_ASKS.map((q) => (
          <button key={q.q.e} type="button" className="home-card" style={{ textAlign: "left", cursor: "pointer", color: "inherit" }} onClick={() => ask(th ? q.q.t : q.q.e, "twin")}>
            <div className="pb-mark compact">{PLAYBOOKS.memory.id} · {PLAYBOOKS.memory.ver}</div>
            <div style={{ fontWeight: 700, marginBottom: 6, marginTop: 8 }}>{L(lang, q.q)}</div>
            <div className="text-muted" style={{ fontSize: 12 }}>{L(lang, q.src)}</div>
          </button>
        ))}
      </div>
      <div className="home-cards">
        {[
          { href: "/holistic?s=cockpit", k: "Contract Cockpit", d: th ? "มูลค่า ขั้น ความเสี่ยง อนุมัติ" : "Value, stage, risk, approvals" },
          { href: "/holistic?s=dna", k: "Clause DNA", d: th ? "เทียบเพลย์บุ๊กและสัญญาที่ลงนามแล้ว" : "Vs playbook and signed history" },
          { href: "/diligence?s=dwar", k: th ? "ห้องสงคราม DD" : "DD War Room", d: th ? "ดัชนี ธงแดง รายงานชี้แหล่ง" : "Index, flags, source-linked report" },
          { href: "/obligations?s=oreg", k: th ? "ข้อผูกพัน" : "Obligations", d: th ? "ปฏิทินหลังลงนาม" : "Post-signature calendar" },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="home-card" style={{ textDecoration: "none", color: "inherit" }}>
            <PlaybookMark href={c.href} compact />
            <div style={{ fontWeight: 700, marginTop: 8 }}>{c.k}</div>
            <div className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>{c.d}</div>
          </Link>
        ))}
      </div>
      <HomePlaybooks />
    </div>
  );
}

function FirmHome() {
  const { lang, startXray } = useStore();
  const router = useRouter();
  const th = lang === "th";
  return (
    <div className="home-wrap">
      <InviteHomeStrip />
      <div className="home-hero">
        <div>
          <div className="home-kicker-row">
            <span>LAW24 Firm</span>
            <EditionBadge size="lg" />
          </div>
          <h1>{L(lang, ENTRANCES.firm.pitch)}</h1>
          <p>{L(lang, ENTRANCES.firm.help)}</p>
          <p className="text-muted" style={{ fontSize: 13 }}>{L(lang, ENTRANCES.firm.fear)}</p>
          <div style={{ marginTop: 12 }}><PlaybookMark mode="practice" screen="dash" /></div>
        </div>
        <div className="xray-layer">
          <div className="page-kicker"><T en="Client Review Room" th="ห้องตรวจลูกค้า" /></div>
          <PlaybookMark href="/practice?s=room" compact />
          <strong style={{ display: "block", marginTop: 8 }}>{L(lang, CLIENT_ROOM.client)}</strong>
          <p className="text-muted" style={{ fontSize: 13 }}>{L(lang, CLIENT_ROOM.progress)}</p>
          <Link href="/practice?s=room" className="btn btn-secondary" style={{ marginTop: 10 }}><T en="Open branded room" th="เปิดห้องภายใต้แบรนด์" /></Link>
        </div>
      </div>
      <div className="stack-actions" style={{ marginBottom: 28 }}>
        <button type="button" className="btn btn-primary" onClick={() => { startXray(); router.push("/review?s=xray"); }}>
          <T en="Analyse a contract" th="วิเคราะห์สัญญา" />
        </button>
        <Link href="/practice?s=packages" className="btn btn-secondary"><T en="Sell packaged services" th="ขายบริการสำเร็จรูป" /></Link>
        <Link href="/practice?s=brain" className="btn btn-secondary"><T en="Firm Brain" th="สมองสำนักงาน" /></Link>
        {!readInviteSession() && (
          <Link href="/host" className="btn btn-ghost"><T en="Host desk" th="โต๊ะโฮสต์" /></Link>
        )}
      </div>
      <TrustStrip />
      <ReviewerPath />
      <h5 style={{ marginTop: 28 }}><T en="Productized work" th="งานที่เป็นสินค้า" /></h5>
      <div className="home-cards">
        {PACKAGES.slice(0, 4).map((p) => (
          <Link key={p.id} href="/practice?s=quote" className="home-card" style={{ textDecoration: "none", color: "inherit" }}>
            <PlaybookMark href="/practice?s=quote" compact />
            <div style={{ fontWeight: 700, marginTop: 8 }}>{L(lang, p.k)}</div>
            <div className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>{p.fee} · {L(lang, p.cycle)}</div>
          </Link>
        ))}
      </div>
      <p className="text-muted" style={{ marginTop: 18, fontSize: 12 }}>
        {th ? "ประเภทเริ่มต้น: " : "Launch wedge: "}{WEDGE_TYPES.map((x) => L(lang, x)).join(" · ")}
      </p>
      <HomePlaybooks />
    </div>
  );
}
