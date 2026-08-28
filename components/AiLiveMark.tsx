"use client";

import { useStore } from "@/lib/store";
import { T } from "@/lib/i18n";

export function AiLiveMark({ compact = false }: { compact?: boolean }) {
  const { aiLive, lang } = useStore();
  if (aiLive === null) return null;
  return (
    <span className={`os-ai-badge${aiLive ? " live" : ""}`} title={lang === "th" ? (aiLive ? "โมเดลทำงานบนเซิร์ฟเวอร์" : "ไม่มีคีย์ — ใช้ข้อมูลสาธิต") : (aiLive ? "Model runs on the server" : "No key — fixtures")}>
      {aiLive
        ? (compact ? "Live" : <T en="Live AI" th="AI สด" />)
        : (compact ? "Demo" : <T en="Demo" th="สาธิต" />)}
    </span>
  );
}
