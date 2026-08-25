"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, Scale } from "lucide-react";
import { useStore } from "@/lib/store";
import { ModeToggle } from "@/components/ModeToggle";
import type { Edition } from "@/lib/model";

export default function LoginPage() {
  const { login, authed, ready } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("preecha@siamdigital.co.th");
  const [password, setPassword] = useState("demo1234");
  const [edition, setEdition] = useState<Edition>("corporate");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (ready && authed) router.replace("/home");
  }, [ready, authed, router]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== "demo1234") {
      setErr(edition === "firm" ? "Use demo1234 for this workspace." : "Use demo1234 for this workspace.");
      return;
    }
    setErr("");
    login(edition);
    router.push("/home");
  }

  return (
    <div className="login-split">
      <section className="login-pane login-hero">
        <header className="login-pane-head">
          <div>
            <div className="login-mark">LAW24<span /></div>
            <span className="login-kicker">AI legal operating system</span>
          </div>
        </header>
        <div className="login-pane-body">
          <h1 className="login-headline">From business intention to contract, decision and control.</h1>
          <p className="login-lede">
            LAW24 is not a template generator. Assemble, review clause-by-clause, understand the whole transaction, investigate a data room, and control obligations — with evidence on every material conclusion.
          </p>
        </div>
        <footer className="login-pane-foot">
          <div className="login-stats">
            <div><strong>500</strong><span>Thai contract types</span></div>
            <div><strong>8</strong><span>Issue cards · Nimbus</span></div>
            <div><strong>3,418</strong><span>DD documents</span></div>
          </div>
        </footer>
      </section>
      <section className="login-pane login-auth">
        <header className="login-pane-head">
          <div className="login-kicker-ghost">Sign in</div>
          <ModeToggle compact />
        </header>
        <div className="login-pane-body">
          <form className="login-card" onSubmit={onSubmit}>
            <h2>Choose edition</h2>
            <p className="text-muted login-card-note">The engine does not change. Corporate and advisory share one playbook, one evidence trail, and one tenant wall.</p>
            <div className="login-modes">
              <button type="button" className={`login-mode${edition === "corporate" ? " on" : ""}`} onClick={() => { setEdition("corporate"); setEmail("preecha@siamdigital.co.th"); }}>
                <Building2 size={18} />
                <strong>Corporate</strong>
                <span>In-house legal, procurement, HR and commercial teams.</span>
              </button>
              <button type="button" className={`login-mode${edition === "firm" ? " on" : ""}`} onClick={() => { setEdition("firm"); setEmail("kanit@7l-advisory.com"); }}>
                <Scale size={18} />
                <strong>Law firm / advisory</strong>
                <span>Client-matter workspace, white-label packs, partner review.</span>
              </button>
            </div>
            <div className="field">
              <label>Work email</label>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
            </div>
            <div className="field">
              <label>Password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </div>
            {err && <p className="text-muted" style={{ color: "var(--color-accent)", fontSize: 13 }}>{err}</p>}
            <button className="btn btn-primary btn-block" type="submit">
              Enter LAW24 OS <ArrowRight size={18} />
            </button>
          </form>
        </div>
        <footer className="login-pane-foot login-meta">
          <span>SSO · MFA · tenant isolation · PDPA</span>
          <span>Demo / demo1234</span>
        </footer>
      </section>
    </div>
  );
}
