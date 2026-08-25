"use client";

import Link from "next/link";
import { BookOpen, Flag, Folder, Grid3x3, Handshake, Library, PenLine, RefreshCw, ScanLine, Share2, Sparkles, Timer } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { T } from "@/lib/i18n";

const ICONS: Record<string, LucideIcon> = {
  library: Library, wand: Sparkles, pen: PenLine, scan: ScanLine, network: Share2, handshake: Handshake,
  folder: Folder, grid: Grid3x3, flag: Flag, clock: Timer, refresh: RefreshCw, chart: BookOpen,
};

type Card = { code: string; icon: string; k: string; d: string; n: string; dot: string; href: string };

export function HomeScreen() {
  const { lang, ask, edition } = useStore();
  const th = lang === "th";
  const greet = th
    ? (edition === "firm" ? "สวัสดีตอนเช้า คุณคณิต" : "สวัสดีตอนเช้า คุณปรีชา")
    : (edition === "firm" ? "Good morning, Khun Kanit" : "Good morning, Khun Preecha");
  const groups: { code: string; label: string; cards: Card[] }[] = [
    {
      code: "A",
      label: th ? "โมดูล AI · การสร้างสัญญา" : "AI applications · create",
      cards: [
        { code: "A1", icon: "library", k: th ? "คลังสัญญา" : "Contract Library", d: th ? "สัญญาไทย 500 ประเภท พร้อมฐานกฎหมาย" : "500 Thai contract types with legal basis.", n: th ? "500 ประเภท · 155 P1 core" : "500 types · 155 P1 core", dot: "#4ade80", href: "/assemble?s=lib" },
        { code: "A2", icon: "wand", k: th ? "สัมภาษณ์นำทาง" : "Guided Assembly", d: th ? "ตอบคำถาม แล้วกฎจะเลือกข้อสัญญาให้" : "Answer questions; rules pick the clauses.", n: th ? "1 ข้อขัดกันรอตัดสินใจ" : "1 conflict to resolve", dot: "#e0a132", href: "/assemble?s=iv" },
        { code: "A3", icon: "pen", k: th ? "ร่างและลงนาม" : "Draft & Signing", d: th ? "อนุมัติภายใน เส้นทาง e-Sign และข้อผูกพัน" : "Approvals, e-Sign route and obligations.", n: th ? "รออนุมัติจาก DPO" : "DPO approval pending", dot: "#e0a132", href: "/assemble?s=draft" },
      ],
    },
    {
      code: "R",
      label: th ? "โมดูล AI · การตรวจและความเสี่ยง" : "AI applications · review & risk",
      cards: [
        { code: "R1", icon: "scan", k: th ? "ตรวจสัญญา" : "Contract Review", d: th ? "ข้อค้นพบ เทียบ playbook และ redline" : "Findings, playbook fit and redline.", n: th ? "8 ข้อค้นพบ · สูง 3" : "8 findings · 3 high", dot: "var(--color-accent)", href: "/review?s=quick" },
        { code: "R2", icon: "network", k: th ? "วิเคราะห์องค์รวม" : "Holistic Analysis", d: th ? "ข้อสัญญาทำงานร่วมกันหรือขัดกัน" : "Do the clauses work together?", n: th ? "4 ข้อขัดกัน" : "4 clause conflicts", dot: "var(--color-accent)", href: "/holistic?s=hinter" },
        { code: "R3", icon: "handshake", k: th ? "การเจรจา" : "Negotiation", d: th ? "จุดยืน อำนาจต่อรอง และร่างคำตอบ" : "Positions, leverage and draft responses.", n: th ? "รอบที่ 2 · 4 ข้อต้องได้" : "Round 2 · 4 must-haves", dot: "#e0a132", href: "/negotiate?s=nstrat" },
      ],
    },
    {
      code: "D",
      label: th ? "โมดูล AI · การสืบค้น" : "AI applications · investigate",
      cards: [
        { code: "D1", icon: "folder", k: th ? "ห้องข้อมูล" : "Diligence Room", d: th ? "รับเอกสารเข้า จัดเวอร์ชัน และกำหนดขอบเขต" : "Ingest, version and scope the data room.", n: th ? "3,418 เอกสาร · OCR 412" : "3,418 docs · 412 OCR'd", dot: "#4ade80", href: "/diligence?s=droom" },
        { code: "D2", icon: "grid", k: th ? "ตารางตรวจเอกสาร" : "Review Grid", d: th ? "สกัดแนวคิดข้ามเอกสารพร้อมหลักฐาน" : "Cross-document extraction with evidence.", n: th ? "ทนายตรวจแล้ว 78%" : "78% lawyer-verified", dot: "#e0a132", href: "/diligence?s=dgrid" },
        { code: "D3", icon: "flag", k: th ? "ธงแดงและแผนผังดีล" : "Red Flags & Deal Map", d: th ? "สิ่งที่อาจล้มดีล พร้อมสายหลักฐาน" : "What could kill the deal, with evidence chains.", n: th ? "2 ประเด็นรุนแรงมาก" : "2 very-high items", dot: "var(--color-accent)", href: "/diligence?s=dflags" },
      ],
    },
    {
      code: "G",
      label: th ? "โมดูล AI · การกำกับดูแล" : "AI applications · govern",
      cards: [
        { code: "G1", icon: "clock", k: th ? "ข้อผูกพัน" : "Obligations", d: th ? "ทะเบียนหลังลงนามและปฏิทินกำหนดเวลา" : "Post-signature register and deadline calendar.", n: th ? "47 รายการเลยกำหนด" : "47 overdue", dot: "var(--color-accent)", href: "/obligations?s=oreg" },
        { code: "G2", icon: "refresh", k: th ? "การต่ออายุและแจ้งเตือน" : "Renewals & Alerts", d: th ? "ช่วงบอกกล่าวและคำแนะนำต่ออายุ" : "Notice windows and renewal recommendations.", n: th ? "318 ต่ออายุใน 90 วัน" : "318 renewals in 90 days", dot: "#e0a132", href: "/obligations?s=oren" },
        { code: "G3", icon: "chart", k: th ? "ปัญญาเชิงพอร์ต" : "Portfolio Intelligence", d: th ? "วิเคราะห์พอร์ตและกราฟความรู้ทางกฎหมาย" : "Portfolio analytics and the legal knowledge graph.", n: th ? "12,847 สัญญา · ฿48.2 พันล้าน" : "12,847 contracts · THB 48.2B", dot: "#4ade80", href: "/intel?s=ipf" },
      ],
    },
  ];

  const path = [
    { k: th ? "A1 · คลังสัญญา" : "A1 · Library", href: "/assemble?s=lib", arrow: "" },
    { k: th ? "R2 · ข้อค้นพบ" : "R2 · Findings", href: "/review?s=find", arrow: "→" },
    { k: th ? "D3 · ธงแดง" : "D3 · Red flags", href: "/diligence?s=dflags", arrow: "→" },
    { k: th ? "G1 · ข้อผูกพัน" : "G1 · Obligations", href: "/obligations?s=oreg", arrow: "→" },
  ];

  return (
    <div className="home-wrap">
      <div style={{ display: "flex", gap: 34, alignItems: "flex-start", marginBottom: 34, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ font: "800 10px/1 var(--font-heading)", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-neutral-600)", marginBottom: 14 }}>
            {th ? "LAW24 OS · 25 สิงหาคม 2569" : "LAW24 OS · 25 AUG 2026"}
          </div>
          <h1 style={{ margin: "0 0 12px", fontSize: 34, letterSpacing: "-0.025em", fontWeight: 800 }}>{greet}</h1>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-neutral-700)", maxWidth: "52ch" }}>
            {th
              ? "ทุกอย่างที่งานกฎหมายขององค์กรต้องใช้ — การร่าง การตรวจ การสืบค้น และการกำกับดูแล — อยู่ในระบบปฏิบัติการเดียว เปิดโมดูลเพื่อเริ่มทำงาน"
              : "Everything your legal function runs on — drafting, review, investigation and governance — in one AI operating system. Open a module to begin."}
          </div>
        </div>
        <div style={{ flex: "none", width: 250, background: "var(--color-surface)", border: "2px solid var(--color-divider)", padding: "15px 17px" }}>
          <div style={{ font: "800 9px/1 var(--font-heading)", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-neutral-600)", marginBottom: 13 }}><T en="System status" th="สถานะระบบ" /></div>
          {[
            { k: "LAW24 Connect", v: th ? "ออนไลน์" : "Online", dot: "#4ade80" },
            { k: th ? "Taxonomy ไทย" : "Thai taxonomy", v: th ? "500 ประเภท" : "500 types", dot: "#4ade80" },
            { k: th ? "playbook ปรับปรุง" : "Playbooks updated", v: th ? "1 ส.ค. 2569" : "1 Aug 2026", dot: "var(--color-neutral-500)" },
          ].map((x) => (
            <div key={x.k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, marginBottom: 9 }}>
              <span style={{ color: "var(--color-neutral-700)" }}>{x.k}</span>
              <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: x.dot }} />
                <span>{x.v}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, border: "2px solid var(--color-divider)", padding: "11px 15px", marginBottom: 14, flexWrap: "wrap" }}>
        <span style={{ font: "800 9px/1 var(--font-heading)", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}><T en="Recommended executive path" th="เส้นทางสาธิตที่แนะนำ" /></span>
        {path.map((p) => (
          <span key={p.href} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {p.arrow && <span style={{ color: "var(--color-neutral-500)", fontSize: 12 }}>{p.arrow}</span>}
            <Link href={p.href} className="btn btn-secondary" style={{ fontSize: 12, padding: "5px 10px" }}>{p.k}</Link>
          </span>
        ))}
        <Link href="/assemble?s=lib" className="btn btn-secondary" style={{ marginLeft: "auto" }}><T en="Start executive demo" th="เริ่มสาธิต" /></Link>
      </div>

      <button type="button" onClick={() => ask(th ? "สัญญาใดมีความรับผิดไม่จำกัดและยังใช้บังคับอยู่" : "which contracts in force carry uncapped liability?")} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", border: "2px solid var(--color-divider)", background: "var(--color-surface)", padding: "15px 17px", marginBottom: 36, cursor: "pointer", textAlign: "left", color: "inherit" }}>
        <span style={{ color: "var(--color-accent)", fontSize: 15 }}>✦</span>
        <span style={{ fontSize: 14, color: "var(--color-neutral-600)" }}>
          {th ? "ถาม LAW24 ได้ทุกเรื่อง — “สัญญาใดมีความรับผิดไม่จำกัดและยังใช้บังคับอยู่”" : "Ask LAW24 anything — \"which contracts in force carry uncapped liability?\""}
        </span>
      </button>

      {groups.map((g) => (
        <div key={g.code} style={{ marginBottom: 34 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11, paddingBottom: 11, borderBottom: "2px solid var(--color-divider)", marginBottom: 16 }}>
            <span style={{ flex: "none", width: 19, height: 19, background: "var(--color-neutral-300)", color: "var(--color-neutral-700)", display: "grid", placeItems: "center", font: "800 10px/1 var(--font-heading)" }}>{g.code}</span>
            <span style={{ font: "800 10px/1 var(--font-heading)", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-neutral-600)" }}>{g.label}</span>
          </div>
          <div className="home-cards">
            {g.cards.map((c) => {
              const Icon = ICONS[c.icon] || Library;
              return (
                <Link key={c.code} href={c.href} className="home-card" style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span className="home-icon"><Icon size={17} /></span>
                    <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ font: "800 9px/1 var(--font-heading)", letterSpacing: "0.06em", color: "var(--color-neutral-600)", border: "1px solid var(--color-neutral-400)", padding: "4px 6px" }}>{c.code}</span>
                      <span style={{ color: "var(--color-neutral-500)", fontSize: 12 }}>↗</span>
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 5 }}>{c.k}</div>
                    <div style={{ fontSize: 12, lineHeight: 1.5, color: "var(--color-neutral-600)" }}>{c.d}</div>
                  </div>
                  <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--color-neutral-700)" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot }} />{c.n}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
