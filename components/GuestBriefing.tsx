"use client";

import Link from "next/link";
import type { Edition } from "@/lib/model";
import { T } from "@/lib/i18n";
import { guestTour } from "@/lib/invite";
import { AiLiveMark } from "@/components/AiLiveMark";

export function GuestBriefing({
  edition,
  linked = false,
  expiry,
}: {
  edition: Edition;
  linked?: boolean;
  expiry?: string;
}) {
  const steps = guestTour(edition);
  return (
    <div>
      <p className="text-muted" style={{ fontSize: 13, margin: "0 0 10px", lineHeight: 1.5 }}>
        <T
          en="This is a time-limited full LAW24 OS demo — not a one-page X-Ray. No public login password. Drop a PDF/DOCX on X-Ray (or run the Nimbus sample). Live AI maps the contract and answers in Leio when a key is on the server; otherwise fixtures run and the badge says Demo."
          th="นี่คือสาธิต LAW24 OS ทั้งระบบแบบมีกำหนดเวลา — ไม่ใช่หน้า X-Ray หน้าเดียว ไม่ต้องใช้รหัสเข้าสู่ระบบสาธารณะ ลาก PDF/DOCX ที่ X-Ray (หรือรันนิมบัสตัวอย่าง) AI สดวางแผนที่สัญญาและตอบในเลโอเมื่อมีคีย์บนเซิร์ฟเวอร์ มิฉะนั้นใช้ข้อมูลสาธิตและป้ายบอกว่าสาธิต"
        />
        {expiry ? (
          <>
            {" "}
            <T en={`Link closes ${expiry}.`} th={`ลิงก์ปิด ${expiry}`} />
          </>
        ) : null}
        {" "}
        <AiLiveMark compact />
      </p>
      <ol className="gate-points" style={{ marginBottom: 0 }}>
        {steps.map((step) => (
          <li key={step.href}>
            {linked ? (
              <Link href={step.href}><T en={step.en} th={step.th} /></Link>
            ) : (
              <T en={step.en} th={step.th} />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
