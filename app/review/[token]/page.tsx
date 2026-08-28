"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { LangToggle } from "@/components/LangToggle";
import { ModeToggle } from "@/components/ModeToggle";
import { T } from "@/lib/i18n";
import { GuestBriefing } from "@/components/GuestBriefing";
import {
  formatExpiry,
  hoursLeft,
  inviteLandingHref,
  readInviteSession,
  saveInviteSession,
  verifyInvite,
  type InvitePayload,
} from "@/lib/invite";

function Shell({ kicker, title, lede, children }: { kicker: ReactNode; title: ReactNode; lede: ReactNode; children: ReactNode }) {
  return (
    <div className="gate">
      <section className="gate-hero">
        <header className="gate-head">
          <div className="login-mark">LAW<span className="os-brand-24">24</span></div>
          <p className="gate-line">{kicker}</p>
        </header>
        <h1>{title}</h1>
        <p className="gate-lede">{lede}</p>
      </section>
      <section className="gate-auth" style={{ overflowY: "auto" }}>
        <header className="login-pane-head">
          <div className="login-kicker-ghost"><T en="Review link" th="ลิงก์สอบทาน" /></div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <LangToggle />
            <ModeToggle compact />
            <Link href="/" className="btn btn-ghost" style={{ fontSize: 12 }}><T en="Public login" th="เข้าสู่ระบบสาธารณะ" /></Link>
          </div>
        </header>
        <div className="login-card">{children}</div>
      </section>
    </div>
  );
}

export default function ReviewInvitePage() {
  const { token } = useParams<{ token: string }>();
  const { login, ready, lang } = useStore();
  const router = useRouter();
  const [state, setState] = useState<"checking" | "ok" | "expired" | "revoked" | "invalid">("checking");
  const [payload, setPayload] = useState<InvitePayload | null>(null);
  const [raw, setRaw] = useState("");
  const th = lang === "th";

  const rawToken = Array.isArray(token) ? token.join("/") : token || "";

  useEffect(() => {
    if (!ready) return;
    if (rawToken === "ended") {
      setState("expired");
      return;
    }
    let cancelled = false;
    (async () => {
      const result = await verifyInvite(rawToken);
      if (cancelled) return;
      if (result.ok) {
        setPayload(result.payload);
        setRaw(result.token);
        setState("ok");
        return;
      }
      setPayload(result.payload ?? null);
      setState(result.reason);
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, rawToken]);

  function enter() {
    if (!payload) return;
    saveInviteSession(payload, raw);
    login(payload.edition, { invite: true });
    router.push(inviteLandingHref(payload.edition));
  }

  useEffect(() => {
    if (state !== "ok" || !payload || !raw) return;
    const existing = readInviteSession();
    if (existing && existing.id === payload.id) {
      login(payload.edition, { invite: true });
      router.replace(inviteLandingHref(payload.edition));
    }
  }, [state, payload, raw, login, router]);

  if (!ready || state === "checking") {
    return (
      <Shell
        kicker={<T en="Review link" th="ลิงก์สอบทาน" />}
        title={<T en="Opening your review…" th="กำลังเปิดการสอบทาน…" />}
        lede={<T en="Checking the time window on this link." th="กำลังตรวจหน้าต่างเวลาของลิงก์นี้" />}
      >
        <p className="text-muted"><T en="One moment." th="สักครู่" /></p>
      </Shell>
    );
  }

  if (state === "expired") {
    const when = payload?.exp ? formatExpiry(payload.exp) : (th ? "สิ้นสุดหน้าต่างสอบทาน" : "the end of the review window");
    return (
      <Shell
        kicker={<T en="Review link expired" th="ลิงก์สอบทานหมดอายุ" />}
        title={<T en="This link is closed" th="ลิงก์นี้ปิดแล้ว" />}
        lede={<T en="The review window has ended. LAW24 on this URL can no longer be opened. Ask 7L Advisory if you need a new link." th="หน้าต่างสอบทานสิ้นสุดแล้ว เปิด LAW24 จาก URL นี้ไม่ได้แล้ว หากต้องการลิงก์ใหม่ ให้ติดต่อ 7L Advisory" />}
      >
        <p className="eyebrow" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          <T en="Expired" th="หมดอายุ" />
        </p>
        <h2><T en="Access ended" th="สิ้นสุดการเข้าถึง" /></h2>
        <p className="text-muted login-card-note">
          <T
            en={`This review link stopped working at ${when}. Nothing was filed. Demo data stays only in the browser that used the link. The engine never signs.`}
            th={`ลิงก์สอบทานนี้หยุดทำงานเมื่อ ${when} ไม่มีการยื่นใด ๆ ข้อมูลสาธิตอยู่เฉพาะในเบราว์เซอร์ที่ใช้ลิงก์ เครื่องยนต์ไม่ลงนามแทน`}
          />
        </p>
      </Shell>
    );
  }

  if (state === "revoked") {
    return (
      <Shell
        kicker={<T en="Review link withdrawn" th="ลิงก์สอบทานถูกยกเลิก" />}
        title={<T en="This link was cut off" th="ลิงก์นี้ถูกตัดแล้ว" />}
        lede={<T en="7L Advisory ended this review link before the window ran out." th="7L Advisory ตัดลิงก์สอบทานนี้ก่อนหมดหน้าต่างเวลา" />}
      >
        <p className="eyebrow" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          <T en="Unavailable" th="ใช้ไม่ได้" />
        </p>
        <h2><T en="Link disabled" th="ลิงก์ถูกปิด" /></h2>
        <p className="text-muted login-card-note">
          <T en="Ask 7L for a new invite if you still need to look at LAW24." th="หากยังต้องดู LAW24 ให้ขอลิงก์ใหม่จาก 7L" />
        </p>
      </Shell>
    );
  }

  if (state !== "ok" || !payload) {
    return (
      <Shell
        kicker={<T en="Review link" th="ลิงก์สอบทาน" />}
        title={<T en="This link is not valid" th="ลิงก์นี้ใช้ไม่ได้" />}
        lede={<T en="The URL is incomplete or was copied wrong. Ask 7L Advisory to send the link again." th="URL ไม่ครบหรือคัดลอกผิด ให้ 7L Advisory ส่งลิงก์อีกครั้ง" />}
      >
        <p className="eyebrow" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          <T en="Cannot open" th="เปิดไม่ได้" />
        </p>
        <h2><T en="Broken link" th="ลิงก์เสีย" /></h2>
        <p className="text-muted login-card-note">
          <T en="Use the full URL from the message, including everything after /review/." th="ใช้ URL เต็มจากข้อความ รวมทุกอย่างหลัง /review/" />
        </p>
        <p className="text-muted" style={{ fontSize: 12, marginTop: 16 }}>
          <Link href="/host"><T en="Host sign-in" th="เข้าโต๊ะโฮสต์" /></Link> · 7L Advisory only
        </p>
      </Shell>
    );
  }

  const left = hoursLeft(payload.exp);
  const daysLeft = Math.max(1, Math.ceil(left / 24));
  const existing = readInviteSession();
  const door = payload.edition === "firm" ? "LAW24 Firm" : "LAW24 Corporate";

  return (
    <Shell
      kicker={<T en="Demo review" th="สอบทานสาธิต" />}
      title={<T en="Continue your LAW24 review" th="ดำเนินการสอบทาน LAW24 ต่อ" />}
      lede={
        <T
          en={`This link still works until ${formatExpiry(payload.exp)} (about ${daysLeft} day${daysLeft === 1 ? "" : "s"} left). After that it will not open.`}
          th={`ลิงก์นี้ยังใช้ได้ถึง ${formatExpiry(payload.exp)} (เหลือประมาณ ${daysLeft} วัน) หลังจากนั้นจะเปิดไม่ได้`}
        />
      }
    >
      <p className="eyebrow" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {payload.label || (payload.edition === "firm" ? "7L Advisory demo" : "Siam Digital demo")}
      </p>
      <h2><T en={existing ? "Welcome back" : "Welcome"} th={existing ? "ยินดีต้อนรับกลับ" : "ยินดีต้อนรับ"} /></h2>
      <p className="text-muted login-card-note">
        <T
          en={`You are entering a time-limited ${door} OS (~${left} hour${left === 1 ? "" : "s"} left). No demo1234. Home, X-Ray, Assemble, Diligence, Negotiate, Assist, ${payload.edition === "firm" ? "Practice" : "Control"}, Cockpit, Twin, Help, and Leio are all open until the link expires.`}
          th={`คุณกำลังเข้า ${door} ทั้งระบบแบบมีกำหนดเวลา (เหลือประมาณ ${left} ชั่วโมง) ไม่ใช้ demo1234 หน้าแรก X-Ray ประกอบ ตรวจสอบสถานะ เจรจา ผู้ช่วย ${payload.edition === "firm" ? "สำนักงาน" : "ควบคุม"} ห้องบังคับ ฝาแฝด คู่มือ และเลโอ เปิดได้จนกว่าลิงก์จะหมด`}
        />
      </p>
      <GuestBriefing edition={payload.edition} expiry={formatExpiry(payload.exp)} />
      <button className="btn btn-primary btn-block" type="button" onClick={enter} style={{ marginTop: 16 }}>
        {payload.edition === "firm"
          ? <T en="Enter LAW24 Firm" th="เข้า LAW24 Firm" />
          : <T en="Enter LAW24 Corporate" th="เข้า LAW24 Corporate" />}
        <ArrowRight size={18} />
      </button>
    </Shell>
  );
}
