"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Briefcase, Building2, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Edition } from "@/lib/model";
import { LangToggle } from "@/components/LangToggle";
import { ModeToggle } from "@/components/ModeToggle";
import { T } from "@/lib/i18n";
import { PRACTICE_HREF } from "@/lib/nav";
import { GuestBriefing } from "@/components/GuestBriefing";
import { AiLiveMark } from "@/components/AiLiveMark";
import {
  DEFAULT_DAYS,
  MAX_DAYS,
  MIN_DAYS,
  clampInviteDays,
  formatExpiry,
  isHostSession,
  mintInvite,
  pinMatches,
  readIssued,
  readLastMintUrl,
  setHostSession,
} from "@/lib/invite";

const DAY_PRESETS = [1, 3, 7, 14] as const;

export default function HostPage() {
  const { login, flash, lang, toast } = useStore();
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [days, setDays] = useState(DEFAULT_DAYS);
  const [edition, setEdition] = useState<Edition>("corporate");
  const [pin, setPin] = useState("7L-host");
  const [err, setErr] = useState("");
  const [lastUrl, setLastUrl] = useState("");
  const [host, setHost] = useState(false);
  const [issued, setIssued] = useState<ReturnType<typeof readIssued>>([]);
  const [busy, setBusy] = useState(false);
  const windowDays = clampInviteDays(days);
  const th = lang === "th";

  useEffect(() => {
    setLastUrl(readLastMintUrl());
    setHost(isHostSession());
    setIssued(readIssued());
  }, []);

  const expiresPreview = useMemo(
    () => formatExpiry(Date.now() + windowDays * 24 * 60 * 60 * 1000),
    [windowDays],
  );

  function mint() {
    if (!isHostSession()) {
      setErr(th ? "ปลดล็อกโต๊ะโฮสต์ก่อนสร้างลิงก์" : "Unlock Host desk before minting a link.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const minted = mintInvite({ days: windowDays, label, edition });
      setLastUrl(minted.url);
      setIssued(readIssued());
      flash(th ? `ลิงก์ใช้ได้ถึง ${formatExpiry(minted.payload.exp)}` : `Link live until ${formatExpiry(minted.payload.exp)}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : th ? "สร้างลิงก์ไม่ได้ — รีเฟรชแล้วลองใหม่" : "Could not generate the link. Hard-refresh and try again.");
    } finally {
      setBusy(false);
    }
  }

  function onMint(e: FormEvent) {
    e.preventDefault();
    mint();
  }

  function onUnlock(e: FormEvent) {
    e.preventDefault();
    if (!pinMatches(pin)) {
      setErr(th ? "คีย์โฮสต์ไม่ถูกต้อง ใช้ 7L-host หรือ advisor / partner / firm" : "Host key not recognised. Use 7L-host, or advisor / partner / firm.");
      return;
    }
    setHostSession(true);
    setHost(true);
    setErr("");
    flash(th ? "ปลดล็อกโต๊ะโฮสต์แล้ว" : "Host desk unlocked");
  }

  async function copyText(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      flash(th ? "คัดลอกลิงก์แล้ว" : "Review link copied");
    } catch {
      flash(th ? "คัดลอกไม่ได้ — เลือก URL เอง" : "Copy failed — select the URL");
    }
  }

  return (
    <div className="gate">
      <section className="gate-hero">
        <header className="gate-head">
          <div className="login-mark">LAW<span className="os-brand-24">24</span></div>
          <p className="gate-line"><T en="Host desk" th="โต๊ะโฮสต์" /></p>
        </header>
        <h1>
          <T
            en={`${windowDays}-day LAW24 demo links`}
            th={`ลิงก์สาธิต LAW24 ${windowDays} วัน`}
          />
        </h1>
        <p className="gate-lede">
          <T
            en={`7L only. Unlock, then Generate. Send that URL only. After ${windowDays} day${windowDays === 1 ? "" : "s"} the same link shows Access ended and will not open LAW24. Guests never use this page — they open /review/{token}.`}
            th={`เฉพาะ 7L ปลดล็อกแล้วกดสร้าง ส่งเฉพาะ URL นั้น หลัง ${windowDays} วันลิงก์เดิมจะแสดงว่าสิ้นสุดการเข้าถึง และเปิด LAW24 ไม่ได้ ผู้รับไม่ใช้หน้านี้ — เปิด /review/{token}`}
          />
        </p>
        <p className="gate-promise">
          <T
            en="Expiry is signed into the token. The host key is never on public login. The engine never signs."
            th="วันหมดอายุถูกเซ็นในโทเคน คีย์โฮสต์ไม่อยู่หน้าเข้าสู่ระบบสาธารณะ เครื่องยนต์ไม่ลงนามแทน"
          />
        </p>
        <div className="gate-trust" style={{ marginTop: "auto" }}>
          <span>{windowDays}d · {th ? "อายุลิงก์นี้" : "This link life"}</span>
          <span>{issued.filter((r) => Date.now() < r.exp).length} · {th ? "ยังใช้ได้บนเบราว์เซอร์นี้" : "Live on this browser"}</span>
          <span>{MIN_DAYS}–{MAX_DAYS} · {th ? "ปรับจำนวนวันได้" : "Adjustable days"}</span>
        </div>
      </section>

      <section className="gate-auth" style={{ overflowY: "auto" }}>
        <header className="login-pane-head">
          <div className="login-kicker-ghost"><T en="Host desk" th="โต๊ะโฮสต์" /></div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <LangToggle />
            <ModeToggle compact />
            <Link href="/" className="btn btn-ghost" style={{ fontSize: 12 }}><T en="Public login" th="เข้าสู่ระบบสาธารณะ" /></Link>
          </div>
        </header>

        {!host ? (
          <form className="login-card" onSubmit={onUnlock}>
            <p className="eyebrow" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              <T en="7L Advisory only" th="เฉพาะ 7L Advisory" />
            </p>
            <h2><T en="Unlock Host desk" th="ปลดล็อกโต๊ะโฮสต์" /></h2>
            <p className="text-muted login-card-note">
              <T
                en="The host key unlocks minting on this browser. It is not on public login. Guests enter on a signed /review/{token} URL — they never mint."
                th="คีย์โฮสต์ปลดล็อกการสร้างลิงก์บนเบราว์เซอร์นี้ ไม่ได้อยู่หน้าเข้าสู่ระบบสาธารณะ ผู้รับเข้าทาง URL /review/{token} ที่เซ็นแล้ว — ไม่ได้สร้างลิงก์เอง"
              />
            </p>
            <div className="field">
              <label htmlFor="hostPin"><T en="Host key" th="คีย์โฮสต์" /></label>
              <input className="input" id="hostPin" type="password" value={pin} onChange={(e) => setPin(e.target.value)} autoComplete="current-password" />
            </div>
            <p style={{ color: "var(--color-hot)", minHeight: "1.2em", margin: 0, fontSize: 13 }}>{err}</p>
            <button className="btn btn-primary btn-block" type="submit">
              <T en="Unlock Host desk" th="ปลดล็อกโต๊ะโฮสต์" />
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <>
            <form className="login-card" onSubmit={onMint}>
              <p className="eyebrow" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                <T en="Send one link per prospect" th="หนึ่งลิงก์ต่อผู้รับหนึ่งราย" />
              </p>
              <h2><T en="Generate a demo URL" th="สร้าง URL สาธิต" /></h2>
              <p className="text-muted login-card-note">
                <T
                  en={`The expiry is signed into the URL, so a recipient on another device can open the Siam Digital / 7L demo until that clock runs out. Default is ${DEFAULT_DAYS} days.`}
                  th={`วันหมดอายุถูกเซ็นใน URL ผู้รับบนเครื่องอื่นเปิดสาธิตสยามดิจิทัล / 7L ได้จนกว่านาฬิกาจะหมด ค่าเริ่มต้น ${DEFAULT_DAYS} วัน`}
                />
              </p>
              <div className="field">
                <label htmlFor="hostLabel"><T en="Prospect / label (optional)" th="ผู้รับ / ป้าย (ไม่บังคับ)" /></label>
                <input className="input" id="hostLabel" value={label} onChange={(e) => setLabel(e.target.value)} placeholder={th ? "ชื่อสำนักงานหรือบริษัท" : "Firm or company name"} />
              </div>
              <div className="field">
                <label htmlFor="hostDays"><T en="Days until the link closes" th="จำนวนวันจนกว่าลิงก์จะปิด" /></label>
                <input
                  className="input"
                  id="hostDays"
                  name="days"
                  type="number"
                  min={MIN_DAYS}
                  max={MAX_DAYS}
                  value={days}
                  onChange={(e) => setDays(clampInviteDays(e.target.value))}
                />
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                  {DAY_PRESETS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`btn ${d === windowDays ? "btn-secondary" : "btn-ghost"}`}
                      style={{ fontSize: 12, padding: "4px 10px" }}
                      onClick={() => setDays(d)}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
                <div className="text-muted" style={{ fontSize: 12, marginTop: 6, textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>
                  {MIN_DAYS}–{MAX_DAYS} {th ? "วัน" : "days"}. {th ? "ค่าเริ่มต้น" : "Default"} {DEFAULT_DAYS}. {th ? "ปิดประมาณ" : "Closes about"} {expiresPreview}.
                </div>
              </div>
              <div className="field">
                <label><T en="Demo door" th="ทางเข้าสาธิต" /></label>
                <div className="login-modes">
                  <button type="button" className={`login-mode${edition === "corporate" ? " on" : ""}`} onClick={() => setEdition("corporate")}>
                    <Building2 size={18} />
                    <strong>LAW24 Corporate</strong>
                    <span><T en="Company command center · lands on Contract X-Ray" th="ศูนย์บัญชาการบริษัท · ลงที่ Contract X-Ray" /></span>
                  </button>
                  <button type="button" className={`login-mode${edition === "firm" ? " on" : ""}`} onClick={() => setEdition("firm")}>
                    <Briefcase size={18} />
                    <strong>LAW24 Firm</strong>
                    <span><T en="Advisory practice · lands on the firm desk" th="สำนักงานที่ปรึกษา · ลงที่โต๊ะสำนักงาน" /></span>
                  </button>
                </div>
              </div>
              <p style={{ color: "var(--color-hot)", minHeight: "1.2em", margin: 0, fontSize: 13 }}>{err}</p>
              <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
                {busy
                  ? <T en="Generating…" th="กำลังสร้าง…" />
                  : <T en={`Generate ${windowDays}-day link`} th={`สร้างลิงก์ ${windowDays} วัน`} />}
                <ArrowRight size={16} />
              </button>
            </form>

            {lastUrl ? (
              <div className="callout" style={{ marginTop: 16, maxWidth: 460 }}>
                <div className="stat-label"><T en="Copy this to the customer" th="คัดลอกส่งลูกค้า" /></div>
                <textarea className="input" readOnly rows={4} value={lastUrl} style={{ marginTop: 8, fontSize: 12 }} />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                  <button type="button" className="btn btn-primary" onClick={() => copyText(lastUrl)}><T en="Copy link" th="คัดลอกลิงก์" /></button>
                  <a className="btn btn-secondary" href={lastUrl} target="_blank" rel="noreferrer"><T en="Open as guest" th="เปิดแบบผู้รับ" /></a>
                </div>
                <div style={{ marginTop: 14 }}>
                  <div className="stat-label" style={{ marginBottom: 8 }}>
                    <T en="Reviewer checklist — full OS" th="รายการผู้ตรวจ — ทั้งระบบ" /> <AiLiveMark compact />
                  </div>
                  <p className="text-muted" style={{ fontSize: 12, margin: "0 0 8px", lineHeight: 1.5 }}>
                    <T
                      en="Open the URL on another device. No demo1234. They land in the full LAW24 OS until the signed expiry. Walk every module — ingest and AI are inside the OS, not a one-page guest shell."
                      th="เปิด URL บนเครื่องอื่น ไม่ใช้ demo1234 ผู้รับเข้า LAW24 OS ทั้งระบบจนกว่าวันหมดอายุที่เซ็นไว้ เดินทุกโมดูล — การรับเข้าและ AI อยู่ใน OS ไม่ใช่เปลือกผู้รับหน้าเดียว"
                    />
                  </p>
                  <GuestBriefing edition={edition} expiry={expiresPreview} />
                </div>
              </div>
            ) : (
              <p className="text-muted" style={{ fontSize: 13, marginTop: 12, maxWidth: 460 }}>
                <T en="The customer URL appears here after Generate. It is not emailed automatically." th="URL สำหรับลูกค้าจะปรากฏที่นี่หลังกดสร้าง ระบบไม่ส่งอีเมลให้อัตโนมัติ" />
              </p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16, maxWidth: 460 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setHostSession(true);
                  login("firm");
                  router.push(PRACTICE_HREF);
                }}
              >
                <T en="Open LAW24 Firm (this browser)" th="เปิด LAW24 Firm (เบราว์เซอร์นี้)" />
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setHostSession(false);
                  setHost(false);
                }}
              >
                <T en="Lock host" th="ล็อกโฮสต์" />
              </button>
            </div>

            <p className="text-muted" style={{ fontSize: 12, marginTop: 14, lineHeight: 1.55, maxWidth: 460 }}>
              <T
                en="To cut off every live review link at once, bump INVITE_EPOCH in the invite engine and redeploy (CPR). Individual links die on their own expiry."
                th="ถ้าจะตัดลิงก์ที่ยังใช้ได้ทั้งหมดในครั้งเดียว ให้เพิ่ม INVITE_EPOCH ในเครื่องยนต์เชิญแล้ว redeploy (CPR) แต่ละลิงก์หมดอายุตามของตัวเอง"
              />
            </p>

            {issued.length > 0 && (
              <div style={{ marginTop: 18, maxWidth: 460 }}>
                <div className="stat-label"><T en="Links minted on this browser" th="ลิงก์ที่สร้างบนเบราว์เซอร์นี้" /></div>
                <div className="table-wrap" style={{ marginTop: 8 }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th><T en="Label" th="ป้าย" /></th>
                        <th><T en="Life" th="อายุ" /></th>
                        <th><T en="Expires" th="หมดอายุ" /></th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {issued.map((row) => {
                        const live = Date.now() < Number(row.exp);
                        return (
                          <tr key={row.id}>
                            <td style={{ fontSize: 13 }}>{row.label || row.id}</td>
                            <td style={{ fontSize: 12 }}>{row.days || DEFAULT_DAYS}d · {row.edition}</td>
                            <td style={{ fontSize: 12 }}>{formatExpiry(row.exp)}</td>
                            <td>
                              <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "flex-end" }}>
                                <span className={live ? "tag tag-accent" : "tag tag-outline"}>{live ? (th ? "ใช้ได้" : "Live") : (th ? "หมดอายุ" : "Expired")}</span>
                                {live && row.url ? (
                                  <button type="button" className="btn btn-ghost" style={{ fontSize: 11, padding: "2px 8px" }} onClick={() => copyText(row.url)}>
                                    <T en="Copy" th="คัดลอก" />
                                  </button>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {toast && (
        <div className="toast">
          <Check size={16} color="var(--color-accent-400)" />
          {toast}
        </div>
      )}
    </div>
  );
}
