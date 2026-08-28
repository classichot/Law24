"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Briefcase, Building2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { ModeToggle } from "@/components/ModeToggle";
import { LangToggle } from "@/components/LangToggle";
import type { Edition } from "@/lib/model";
import { L } from "@/lib/model";
import { landingHref, WORK_HREF } from "@/lib/nav";
import { ENTRANCES, POSITION, TRUST_STRIP, WEDGE_TYPES } from "@/lib/product";
import { T } from "@/lib/i18n";
import { PLAYBOOKS } from "@/lib/guides";

export default function LoginPage() {
  const { login, authed, ready, startDemo, startXray, edition: storedEdition, lang } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("preecha@siamdigital.co.th");
  const [password, setPassword] = useState("demo1234");
  const [edition, setEdition] = useState<Edition>("corporate");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (ready && authed) router.replace(landingHref(storedEdition));
  }, [ready, authed, storedEdition, router]);

  function enter(ed: Edition, opts?: { demo?: boolean; xray?: boolean }) {
    if (password !== "demo1234") {
      setErr("Use demo1234 for this workspace.");
      return;
    }
    setErr("");
    login(ed);
    if (opts?.demo) startDemo();
    if (opts?.xray) startXray();
    router.push(opts?.xray ? WORK_HREF : opts?.demo ? WORK_HREF : landingHref(ed));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    enter(edition);
  }

  return (
    <div className="gate">
      <section className="gate-hero">
        <header className="gate-head">
          <div className="login-mark">LAW<span className="os-brand-24">24</span></div>
          <p className="gate-line">{L(lang, POSITION.line)}</p>
        </header>
        <h1>{L(lang, POSITION.hook)}</h1>
        <p className="gate-lede">{L(lang, POSITION.hookLede)}</p>
        <p className="gate-promise">{L(lang, POSITION.promise)}</p>
        <div className="stack-actions" style={{ marginTop: 28 }}>
          <button type="button" className="btn btn-primary" onClick={() => enter("corporate", { xray: true })}>
            <T en="Analyse a Contract" th="วิเคราะห์สัญญา" /> <ArrowRight size={16} />
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => { setEdition("firm"); setEmail("kanit@7l-advisory.com"); }}>
            <T en="Explore LAW24 for Firms" th="สำรวจ LAW24 สำหรับสำนักงาน" />
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => { setEdition("corporate"); setEmail("preecha@siamdigital.co.th"); }}>
            <T en="Explore LAW24 for Companies" th="สำรวจ LAW24 สำหรับบริษัท" />
          </button>
        </div>
        <p className="gate-wedge">{WEDGE_TYPES.map((x) => L(lang, x)).join(" · ")}</p>
        <div className="gate-trust">
          {TRUST_STRIP.slice(0, 2).map((x) => <span key={x.e}>{L(lang, x)}</span>)}
        </div>
        <p className="gate-wedge" style={{ marginTop: 18 }}>
          <T en="Every module carries a house playbook — the engine never signs." th="ทุกโมดูลมีเพลย์บุ๊กบ้าน — เครื่องยนต์ไม่ลงนามแทน" />
        </p>
      </section>

      <section className="gate-auth">
        <header className="login-pane-head">
          <div className="login-kicker-ghost"><T en="Two entrances · one engine" th="สองทางเข้า · เครื่องยนต์ชุดเดียว" /></div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <LangToggle />
            <ModeToggle compact />
          </div>
        </header>
        <form className="login-card" onSubmit={onSubmit}>
          <h2><T en="Choose your entrance" th="เลือกทางเข้า" /></h2>
          <p className="text-muted login-card-note">
            <T en="Not ChatGPT for lawyers. Not generic AI contract review. Same engine — different fears, different value." th="ไม่ใช่ ChatGPT สำหรับทนาย และไม่ใช่แค่ตรวจสัญญาด้วย AI เครื่องยนต์ชุดเดียวกัน — ความกลัวต่างกัน มูลค่าต่างกัน" />
          </p>
          <div className="login-modes">
            <button type="button" className={`login-mode${edition === "corporate" ? " on" : ""}`} onClick={() => { setEdition("corporate"); setEmail("preecha@siamdigital.co.th"); }}>
              <Building2 size={18} />
              <strong>LAW24 Corporate</strong>
              <span>{L(lang, ENTRANCES.corporate.help)}</span>
              <em>{L(lang, ENTRANCES.corporate.fear)}</em>
              <span className="pb-mark compact">{PLAYBOOKS.command.id} · {PLAYBOOKS.command.ver}</span>
            </button>
            <button type="button" className={`login-mode${edition === "firm" ? " on" : ""}`} onClick={() => { setEdition("firm"); setEmail("kanit@7l-advisory.com"); }}>
              <Briefcase size={18} />
              <strong>LAW24 Firm</strong>
              <span>{L(lang, ENTRANCES.firm.help)}</span>
              <em>{L(lang, ENTRANCES.firm.fear)}</em>
              <span className="pb-mark compact">{PLAYBOOKS.practice.id} · {PLAYBOOKS.practice.ver}</span>
            </button>
          </div>
          <ul className="gate-points">
            {(edition === "firm" ? ENTRANCES.firm.points : ENTRANCES.corporate.points).map((p) => (
              <li key={p.e}>{L(lang, p)}</li>
            ))}
          </ul>
          <div className="field">
            <label>Work email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          {err && <p className="text-muted" style={{ color: "var(--color-hot)", fontSize: 13 }}>{err}</p>}
          <button className="btn btn-primary btn-block" type="submit">
            {edition === "firm" ? <T en="Enter LAW24 Firm" th="เข้า LAW24 Firm" /> : <T en="Enter LAW24 Corporate" th="เข้า LAW24 Corporate" />}
            <ArrowRight size={18} />
          </button>
          <button className="btn btn-secondary btn-block" type="button" onClick={() => enter(edition, { demo: true, xray: true })}>
            <T en="Enter and run Contract X-Ray" th="เข้าแล้วเปิด Contract X-Ray" />
          </button>
        </form>
        <footer className="login-meta" style={{ marginTop: 20 }}>
          <span>SSO · MFA · PDPA · tenant isolation</span>
          <span>Demo / demo1234 · <a href="/host"><T en="Host desk" th="โต๊ะโฮสต์" /></a></span>
        </footer>
      </section>
    </div>
  );
}
