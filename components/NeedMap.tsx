"use client";

import Link from "next/link";
import { Kicker, Title } from "@/components/ui";
import { T } from "@/lib/i18n";

export function NeedMap({ kicker }: { kicker: string }) {
  return (
    <div className="pad-page">
      <Kicker>{kicker}</Kicker>
      <Title><T en="Map a document first" th="วางแผนที่สัญญาก่อน" /></Title>
      <p className="page-sub">
        <T
          en="This screen reads the live X-Ray of the file you uploaded. It stays empty until that map exists — it will not fill with the Nimbus sample."
          th="หน้านี้ใช้แผนที่ X-Ray สดของไฟล์ที่คุณอัปโหลด ว่างไว้จนกว่าจะมีแผนที่ — จะไม่เติมข้อมูลตัวอย่างนิมบัส"
        />
      </p>
      <div className="stack-actions" style={{ marginTop: 16 }}>
        <Link href="/review?s=xray" className="btn btn-primary">X-Ray</Link>
      </div>
    </div>
  );
}
