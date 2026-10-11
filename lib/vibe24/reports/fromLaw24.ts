import type { Lang, TE } from "@/lib/model";
import { L } from "@/lib/model";
import type { XrayView } from "@/lib/ai/types";
import type { AssemblyState } from "@/lib/assembly";
import type { DealState } from "@/lib/deal";
import { draftFromLive } from "./engine";
import type { ReportPackId, ReportRevision } from "./types";

const P = (t: string, e: string): TE => ({ t, e });

export function draftLaw24Report(input: {
  packId: ReportPackId;
  lang: Lang;
  actor: string;
  demo: boolean;
  entity: string;
  xray?: XrayView | null;
  assembly?: AssemblyState | null;
  deal?: DealState | null;
}): ReportRevision {
  const { packId, lang, actor, demo, entity } = input;

  if (packId === "xray-brief" || packId === "decision-memo") {
    const X = input.xray;
    const verdict = X ? L(lang, X.verdictLabel) : null;
    const missing = !X;
    return draftFromLive({
      packId,
      entity,
      actor,
      lang,
      demo: demo || !X,
      facts: [
        { label: P("เอกสาร", "Document"), value: X ? L(lang, X.doc) : null, source: X?.ref || "fixture", locator: X ? `${X.ref} · title` : "unmapped", missing, demo: !X },
        { label: P("คำตัดสิน", "Verdict"), value: verdict, source: X?.ref || "fixture", locator: X ? `${X.ref} · verdict` : "unmapped", missing, demo: !X },
        { label: P("มูลค่าที่อ้าง", "Stated value"), value: X ? "THB 24.6M" : null, source: X?.ref || "fixture", locator: "commercial schedule", missing, demo: !X },
      ],
      claims: [
        {
          section: "verdict",
          text: X
            ? P(`คำตัดสินรวม: ${X.verdictLabel.t}`, `Overall verdict: ${X.verdictLabel.e}`)
            : P("ยังไม่มีแผนที่สัญญา — ห้ามแต่งคำตัดสิน", "No mapped paper — do not invent a verdict"),
          kind: "analysis",
          excerpt: X ? X.verdictWhy : P("ต้องอัปโหลดและเปิดงานก่อน", "Upload and open the engagement first"),
          source: X?.ref,
          gap: !X,
        },
        {
          section: "next",
          text: P("เครื่องยนต์ไม่ลงนาม ทนายเป็นผู้ยืนยันท่าที", "The engine never signs. Counsel confirms the posture."),
          kind: "recommendation",
          excerpt: P("เพลย์บุ๊กบ้าน", "House playbook"),
          source: X?.ref,
        },
      ],
      sections: [
        {
          id: "verdict",
          title: P("คำตัดสิน", "Verdict"),
          body: X ? X.verdictWhy : P("ร่างนี้เป็นช่องว่างจนกว่าจะมีแผนที่", "This draft is a gap until a map exists."),
        },
        {
          id: "next",
          title: P("ขั้นถัดไป", "Next"),
          body: P("ตรวจเกณฑ์ แล้วให้ผู้อนุมัติที่มีชื่อล็อกฉบับนี้", "Walk the gates, then a named approver locks this revision."),
        },
      ],
    });
  }

  if (packId === "assemble-pack") {
    const a = input.assembly;
    const parties = a?.questionnaire.answers["AQ-PARTIES"] || a?.acceptedInputs.find((x) => x.id === "AQ-PARTIES")?.value.e || null;
    const law = a?.questionnaire.answers["AQ-LAW"] || null;
    const ready = Boolean(parties && law);
    return draftFromLive({
      packId,
      entity,
      actor,
      lang,
      demo: demo || !ready,
      facts: [
        { label: P("คู่สัญญา", "Parties"), value: parties, source: a?.sourceRef || "intake", locator: "AQ-PARTIES", missing: !parties, demo: !ready },
        { label: P("กฎหมายที่ใช้บังคับ", "Governing law"), value: law, source: a?.sourceRef || "intake", locator: "AQ-LAW", missing: !law, demo: !ready },
        { label: P("ประเภท", "Type"), value: a?.questionnaire.typeId || null, source: "taxonomy", locator: "typeId", missing: !a?.questionnaire.typeId, demo: !ready },
      ],
      claims: [
        {
          section: "scope",
          text: parties
            ? P(`ร่างนี้ใช้คู่สัญญาที่ทนายยืนยันแล้ว`, `This draft uses counsel-confirmed parties`)
            : P("ยังไม่มีคู่สัญญาที่ยืนยัน — ห้ามประกอบข้อจริง", "No confirmed parties — do not assemble as fact"),
          kind: "sourced",
          excerpt: P("แบบสอบถามนำเข้า", "Intake questionnaire"),
          source: "AQ-PARTIES",
          gap: !parties,
        },
      ],
      sections: [
        {
          id: "scope",
          title: P("ขอบเขต", "Scope"),
          body: ready
            ? P("ชุดร่างผูกกับข้อเท็จจริงที่ทนายยืนยัน เครื่องยนต์ไม่ลงนาม", "The pack is bound to counsel-confirmed facts. The engine never signs.")
            : P("One Click Draft ชี้ช่องว่าง — ไม่ถมคู่สัญญาให้", "One Click Draft names the gap. It does not invent the parties."),
        },
      ],
    });
  }

  const deal = input.deal;
  const verified = Boolean(deal?.verified);
  return draftFromLive({
    packId: "dd-ic",
    entity,
    actor,
    lang,
    demo: demo || !verified,
    facts: [
      { label: P("ธุรกรรม", "Transaction"), value: deal?.transaction || null, source: "deal-intake", locator: "transaction", missing: !deal?.transaction, demo: !verified },
      { label: P("ทนายยืนยันห้อง", "Counsel verified room"), value: verified ? "verified" : null, source: "deal-xray", locator: "verified", missing: !verified, demo: !verified },
    ],
    claims: [
      {
        section: "health",
        text: verified
          ? P("สุขภาพดีลมาจากห้องที่ทนายยืนยัน", "Deal health comes from the counsel-verified room")
          : P("ห้องยังไม่ถูกยืนยัน — ห้ามรายงานว่าตรวจครบ", "Room is not verified — do not report the diligence as complete"),
        kind: "analysis",
        excerpt: P("Deal X-Ray", "Deal X-Ray"),
        source: "deal-xray",
        gap: !verified,
      },
    ],
    sections: [
      {
        id: "health",
        title: P("สุขภาพดีล", "Deal health"),
        body: P("ประเด็นล้มดีลต้องอยู่หน้าแรกของรายงาน IC", "Kill items stay on page one of the IC report."),
      },
    ],
  });
}
