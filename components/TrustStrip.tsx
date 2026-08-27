"use client";

import Link from "next/link";
import { T } from "@/lib/i18n";
import { L } from "@/lib/model";
import { useStore } from "@/lib/store";
import { TRUST_STRIP } from "@/lib/product";

export function TrustStrip({ compact = false }: { compact?: boolean }) {
  const { lang } = useStore();
  if (compact) {
    return (
      <Link href="/help?s=trust" className="trust-strip compact">
        <span><T en="Documents are not used to train public models" th="เอกสารไม่ถูกใช้ฝึกโมเดลสาธารณะ" /></span>
        <span>·</span>
        <span><T en="Lawyer approval before final advice" th="ทนายอนุมัติก่อนคำแนะนำสุดท้าย" /></span>
      </Link>
    );
  }
  return (
    <div className="trust-strip">
      {TRUST_STRIP.map((x) => (
        <span key={x.e}>{L(lang, x)}</span>
      ))}
      <Link href="/help?s=trust"><T en="Trust controls" th="การควบคุมความเชื่อถือ" /> →</Link>
    </div>
  );
}
