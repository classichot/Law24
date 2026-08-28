import type { Edition, Lang } from "./model";
import { answerCopilot, type CopilotMsg } from "./copilot";
import { copyTE, type TE } from "./guides";
import { askLiveChat } from "./ai/client";

const P = (t: string, e: string): TE => ({ t, e });

export const LEIO = {
  name: "Leio",
  nameTh: "เลโอ",
  role: P("ผู้ช่วย LAW24 — วิธีใช้ระบบ วิจัย และติดตามกฎ", "LAW24 assistant — how to use the OS, research and regulation watch"),
  never: P("เลโอไม่ลงนาม ไม่เลือกท่าทีแทนทนาย และทุกข้อสรุปต้องมีหลักฐาน", "Leio does not sign, does not pick a posture, and every conclusion cites evidence"),
};

export const LEIO_SUGGESTIONS_EN = [
  "How do I use LAW24?",
  "What changed in PDPA this month?",
  "Research: transferring personal data to Singapore",
];

export const LEIO_SUGGESTIONS_TH = [
  "วิธีใช้ LAW24 อย่างไร",
  "PDPA เดือนนี้มีอะไรเปลี่ยน",
  "วิจัย: โอนข้อมูลส่วนบุคคลไปสิงคโปร์",
];

export type RegUpdate = {
  id: string;
  date: string;
  source: TE;
  title: TE;
  impact: TE;
  applies: TE;
  href: string;
  hot?: boolean;
};

export const REG_UPDATES: RegUpdate[] = [
  {
    id: "RG-01",
    date: "2026-08-01",
    source: P("สคส. · ประกาศการโอนข้ามแดน", "PDPC · cross-border notification"),
    title: P("แนวทาง PDPA ม.28 — มาตรการที่เหมาะสมเมื่อโอนออกนอกราชอาณาจักร", "PDPA s.28 guidance — appropriate safeguards for transfers out of Thailand"),
    impact: P("ฉบับนิมบัสโอนไปสิงคโปร์และสหรัฐโดยยังไม่มี DPA/SCC — F-02 ต้องปิดก่อน go-live", "Nimbus transfers to Singapore and the US with no DPA/SCCs — F-02 must close before go-live"),
    applies: P("สัญญาคลาวด์ / SaaS / DPA", "Cloud / SaaS / DPA paper"),
    href: "/help?s=book&b=itcloud",
    hot: true,
  },
  {
    id: "RG-02",
    date: "2026-08-12",
    source: P("พ.ร.บ.ธุรกรรมทางอิเล็กทรอนิกส์", "Electronic Transactions Act"),
    title: P("เส้นทาง e-sign — ลายมือชื่ออิเล็กทรอนิกส์ที่เชื่อถือได้ต้องมีเส้นทางอนุมัติในระบบ", "e-Sign route — a reliable electronic signature needs an in-system approval trail"),
    impact: P("ชุดเอกสาร Assemble ออกได้เมื่อ GC / CIO / DPO อนุมัติครบ — ตรงเพลย์บุ๊กประกอบสัญญา", "Assemble packs issue only after GC, CIO and DPO sign off — matches the assembly playbook"),
    applies: P("ร่าง อนุมัติ ลงนาม", "Draft, approval & signing"),
    href: "/assemble?s=draft",
  },
  {
    id: "RG-03",
    date: "2026-08-08",
    source: P("กสทช. · การปรึกษาคลาวด์", "NBTC · cloud consultation"),
    title: P("ข้อมูลจราจรและชั้นข้อมูลที่อาจถูกกำหนดให้อยู่ในราชอาณาจักร", "Traffic data and a data layer that may have to stay in-kingdom"),
    impact: P("ต้องระบุที่ตั้งประมวลผลในสัมภาษณ์และ DPA — ห้ามร่างลอยเรื่องข้อมูล", "Processing location must lock in the interview and the DPA — no freehand data clause"),
    applies: P("นิมบัส / IT & Cloud v4.2", "Nimbus / IT & Cloud v4.2"),
    href: "/review?s=find",
    hot: true,
  },
  {
    id: "RG-04",
    date: "2026-08-15",
    source: P("ปปง. · ผู้มีประโยชน์ที่แท้จริง", "AMLO · beneficial ownership"),
    title: P("ความหนาแน่นบุคคลเกี่ยวโยงต้องอธิบายด้วยหลักฐานก่อนชุดคณะกรรมการ", "Related-party concentration must be explained with evidence before the IC pack"),
    impact: P("ดีลเจริญโลจิสติกส์ — ไล่ DK-02 และแผนผังดีลก่อนปิดรายงาน", "Charoen Logistics — walk DK-02 and the deal map before the report closes"),
    applies: P("ตรวจสอบสถานะฝั่งผู้ซื้อ", "Buy-side diligence"),
    href: "/diligence?s=dflags",
  },
  {
    id: "RG-05",
    date: "2026-07-20",
    source: P("ปพพ. · การต่ออายุและการบอกกล่าว", "CCC · renewal and notice"),
    title: P("หน้าต่างบอกกล่าวที่พ้นแล้วทำให้ต่ออัตโนมัติ — ต้องส่งหนังสือเยียวยาในวันเดียวกัน", "A missed notice window auto-renews — a remedial notice must go the same day"),
    impact: P("อาคารพ้น 1 ส.ค. — เปิดการแจ้งเตือน Obligations แล้วส่งต่อพาร์ทเนอร์", "Facilities window closed 1 Aug — open Obligations alerts and escalate to partner"),
    applies: P("ทะเบียนข้อผูกพัน / ปฏิทิน", "Obligation register / calendar"),
    href: "/obligations?s=oalert",
    hot: true,
  },
  {
    id: "RG-06",
    date: "2026-08-22",
    source: P("กรมสรรพากร · e-Tax", "Revenue Department · e-Tax"),
    title: P("ใบกำกับภาษีอิเล็กทรอนิกส์ต้องผูกกับสัญญาต้นทางในคลัง", "e-Tax invoices must trace to a source contract in the library"),
    impact: P("Intelligence ไล่กลับไปยังสัญญา — ห้ามปิดตัวเลขพอร์ตถ้าไม่มีต้นทาง", "Intelligence traces back to the contract — no portfolio close without a source"),
    applies: P("พอร์ตและความจำทางกฎหมาย", "Portfolio and legal memory"),
    href: "/intel?s=ipf",
  },
];

export type ResearchBrief = {
  id: string;
  q: TE;
  a: TE;
  cites: { label: string; href: string }[];
};

export const RESEARCH_BRIEFS: ResearchBrief[] = [
  {
    id: "RS-01",
    q: P("โอนข้อมูลส่วนบุคคลไปสิงคโปร์และสหรัฐได้หรือไม่", "May personal data move to Singapore and the US?"),
    a: P(
      "ได้เมื่อมีมาตรการตาม PDPA ม.28 — DPA, SCC หรือฐานที่เทียบเท่า และรายชื่อผู้ประมวลผลช่วง ฉบับนิมบัสยังไม่มีทั้งสามอย่าง (F-02) เพลย์บุ๊ก IT & Cloud v4.2 ห้าม go-live จนกว่าจะปิด ประกาศ สคส. 1 ส.ค. 2569 ยืนยันท่าทีนี้",
      "Yes, with PDPA s.28 safeguards — a DPA, SCCs or an equivalent basis, and a sub-processor list. Nimbus has none of the three (F-02). IT & Cloud v4.2 bars go-live until that closes. The 1 Aug 2026 PDPC notification confirms the house position.",
    ),
    cites: [
      { label: "F-02", href: "/review?s=find" },
      { label: "PB-IT v4.2", href: "/help?s=book&b=itcloud" },
      { label: "RG-01 PDPC", href: "/help?s=watch" },
    ],
  },
  {
    id: "RS-02",
    q: P("กฎหมายไทยเป็นท่าทีบ้าน — อนุญาโตตุลาการสิงคโปร์ใช้ได้เมื่อใด", "Thai law is the house position — when may Singapore arbitration stand?"),
    a: P(
      "เพลย์บุ๊กประกอบสัญญาให้กฎหมายไทยเป็นค่าเริ่ม อนุญาโตตุลาการต่างประเทศต้องมีเหตุในสัมภาษณ์ ห้ามร่างลอย เปิดคลังประเภท แล้วล็อกท่าทีในแบบสัมภาษณ์ก่อนประกอบข้อ",
      "The assembly playbook defaults to Thai law. Foreign arbitration needs a reason in the interview — no freehand draft. Pick the type, then lock the position in the interview before clauses fire.",
    ),
    cites: [
      { label: "PB-ASM", href: "/help?s=book&b=assembly" },
      { label: "Interview", href: "/assemble?s=iv" },
    ],
  },
  {
    id: "RS-03",
    q: P("เปลี่ยนอำนาจควบคุมกระทบสินเชื่อเจริญโลจิสติกส์อย่างไร", "How does change of control hit the Charoen facility?"),
    a: P(
      "สินเชื่อธนาคารกรุงเทพ ฿640 ล้านผิดนัดทันทีเมื่อเปลี่ยนอำนาจควบคุม (DK-01) ลูกค้า 7 รายเลิกได้ คิดเป็นรายได้ 22% (DK-02) ทั้งสองเป็นประเด็นล้มดีลตามเพลย์บุ๊กฝั่งผู้ซื้อ ต้องถึงพาร์ทเนอร์ก่อนชุด IC",
      "The Bangkok Bank facility THB 640M defaults immediately on change of control (DK-01). Seven customers may exit — 22% of revenue (DK-02). Both are kill items under the buy-side playbook and must reach partner before the IC pack.",
    ),
    cites: [
      { label: "DK-01", href: "/diligence?s=dflags" },
      { label: "PB-DD v3.1", href: "/help?s=book&b=dd" },
      { label: "RG-04 AMLO", href: "/help?s=watch" },
    ],
  },
  {
    id: "RS-04",
    q: P("หน้าต่างบอกกล่าวที่พ้นแล้วแก้ได้อย่างไร", "What can still be done after a notice window is missed?"),
    a: P(
      "ปพพ. และการต่ออายุอัตโนมัติ: ถ้าไม่บอกกล่าวตามสัญญา ระยะต่ออายุเดิน เพลย์บุ๊กกำกับให้ส่งหนังสือเยียวยาและส่งต่อพาร์ทเนอร์ในวันเดียวกัน รายการอาคารพ้น 1 ส.ค. ยังเปิดอยู่ที่การแจ้งเตือน",
      "Under the CCC and auto-renewal: missed notice lets the term roll. The control playbook requires a remedial notice and same-day partner escalation. The facilities miss of 1 Aug is still open on alerts.",
    ),
    cites: [
      { label: "Alerts", href: "/obligations?s=oalert" },
      { label: "PB-CTL v1.4", href: "/help?s=book&b=control" },
      { label: "RG-05 CCC", href: "/help?s=watch" },
    ],
  },
];

const BRIEF_ALIASES: Record<string, string[]> = {
  "RS-01": ["singapore", "สิงคโปร์", "cross-border", "s.28", "ม.28", "transferring personal", "โอนข้อมูล"],
  "RS-02": ["arbitration", "อนุญาโต", "thai law", "กฎหมายไทย"],
  "RS-03": ["charoen", "เจริญ", "dk-01", "dk-02", "change of control", "อำนาจควบคุม"],
  "RS-04": ["notice window", "หน้าต่างบอก", "missed notice", "หน้าต่างที่พ้น"],
};

function matchResearchBrief(t: string) {
  return RESEARCH_BRIEFS.find((b) =>
    t.includes(b.id.toLowerCase()) || (BRIEF_ALIASES[b.id] ?? []).some((a) => t.includes(a)),
  );
}

export function leioIntro(lang: Lang): CopilotMsg {
  return {
    role: "ai",
    text: lang === "th"
      ? "ฉันคือเลโอ ผู้ช่วยของ LAW24 ถามได้สามเรื่อง: วิธีใช้ระบบ วิจัยทางกฎหมาย และกฎที่เพิ่งออก ข้อสรุปทุกข้อมีหลักฐาน — ฉันไม่ลงนามแทน"
      : "I am Leio, LAW24's assistant. Ask me three things: how to use the OS, legal research, and what just changed in regulation. Every conclusion cites evidence — I never sign.",
  };
}

export function answerLeio(q: string, lang: Lang, edition: Edition = "corporate"): CopilotMsg {
  const t = q.toLowerCase();
  const th = lang === "th";

  if (/\bhost desk\b|\bbhd\b|demo (invite|link)|review link|mint (a )?link|โต๊ะโฮสต์|ลิงก์สาธิต/.test(t)) {
    return {
      role: "ai",
      text: th
        ? "โต๊ะโฮสต์เป็นหน้าที่ 7L ใช้สร้างลิงก์สาธิต เปิด /host ปลดล็อกด้วยคีย์โฮสต์ (ไม่อยู่หน้าเข้าสู่ระบบสาธารณะ) ตั้ง 1–14 วัน (ค่าเริ่มต้น 3) กดสร้าง แล้วส่งเฉพาะ URL นั้น วันหมดอายุถูกเซ็นใน /review/{token} — ใช้บนเครื่องอื่นได้จนกว่าจะหมด เลโอไม่ลงนามแทน"
        : "Host desk is the 7L page that mints demo links. Open /host, unlock with the host key (never on public login), set 1–14 days (default 3), Generate, then send only that URL. Expiry is signed into /review/{token} — it works on another device until it ends. Leio does not sign.",
      cites: [
        { label: th ? "โต๊ะโฮสต์" : "Host desk", href: "/host" },
        { label: th ? "วิธีใช้" : "How to use", href: "/help?s=use" },
      ],
    };
  }

  if (t.includes("leio") || t.includes("เลโอ") || t.includes("who are you") || t.includes("คุณคือ")) {
    return {
      role: "ai",
      text: th
        ? `${copyTE(lang, LEIO.role)} ${copyTE(lang, LEIO.never)} เปิดโต๊ะเลโอในคู่มือ หรือถามจากแถบด้านข้าง (Ctrl J)`
        : `${copyTE(lang, LEIO.role)}. ${copyTE(lang, LEIO.never)} Open the Leio desk in Help, or ask from the side rail (Ctrl J).`,
      cites: [
        { label: th ? "โต๊ะเลโอ" : "Leio desk", href: "/help?s=leio" },
        { label: th ? "วิจัยและกฎ" : "Research & regulations", href: "/help?s=watch" },
        { label: th ? "วิธีใช้" : "How to use", href: "/help?s=use" },
      ],
    };
  }

  if (t.includes("how to use") || t.includes("how do i use") || t.includes("use law24") || t.includes("วิธีใช้") || t.includes("คู่มือ") || t.includes("onboard") || t.includes("first session") || t.includes("ขั้นแรก")) {
    return {
      role: "ai",
      text: th
        ? "LAW24 เป็นระบบปฏิบัติการ ไม่ใช่แชตบอท เลือกโหมดองค์กรหรือที่ปรึกษาตอนเข้าสู่ระบบ ถ้ายังไม่รู้โมดูล ให้อธิบายงานในผู้ช่วย แล้วอ่านเพลย์บุ๊กที่ติดมากับโมดูล เดินเมนูซ้ายไปขวา ทนายเป็นผู้ตัดสินท่าที — เลโอไม่ลงนามแทน"
        : "LAW24 is an operating system, not a chatbot. Choose Corporate or Advisor at sign-in. If the module is not obvious, describe the work in Assist, then read the playbook attached to the module. Walk menus left to right. Counsel decides the posture — Leio does not sign.",
      cites: [
        { label: th ? "วิธีใช้ LAW24" : "How to use LAW24", href: "/help?s=use" },
        { label: th ? "คลังเพลย์บุ๊ก" : "Playbook library", href: "/help?s=books" },
        { label: th ? "ผู้ช่วยจัดเส้นทาง" : "Assist", href: "/assist?s=ask" },
      ],
    };
  }

  const reg = REG_UPDATES.find((r) =>
    t.includes(r.id.toLowerCase()) ||
    (t.includes("e-sign") && r.id === "RG-02") ||
    (t.includes("e-tax") && r.id === "RG-06") ||
    (t.includes("eta") && r.id === "RG-02"),
  );
  if (reg) {
    return {
      role: "ai",
      text: `${reg.id} · ${copyTE(lang, reg.source)} · ${reg.date}\n${copyTE(lang, reg.title)}\n${copyTE(lang, reg.impact)}`,
      cites: [
        { label: copyTE(lang, reg.source), href: "/help?s=watch" },
        { label: th ? "เปิดในเครื่องยนต์" : "Open in the engine", href: reg.href },
      ],
    };
  }

  if (
    t.includes("regulation") || t.includes("กฎ") || t.includes("gazette") || t.includes("ประกาศ") ||
    t.includes("update") || t.includes("เดือนนี้") || t.includes("this month") || t.includes("pdpc") ||
    t.includes("pdpa") || t.includes("สคส") || t.includes("nbtc") || t.includes("กสทช") || t.includes("amlo") || t.includes("ปปง")
  ) {
    const hot = REG_UPDATES.filter((r) => r.hot);
    const lines = (hot.length ? hot : REG_UPDATES.slice(0, 3)).map((r) =>
      `${r.id} · ${r.date} · ${copyTE(lang, r.title)} — ${copyTE(lang, r.impact)}`,
    );
    return {
      role: "ai",
      text: th
        ? `กฎที่เลโอติดตามในเทนแนนท์นี้ (อัปเดต 25 ส.ค. 2569):\n${lines.join("\n")}\nทนายเป็นผู้ตัดสินว่าจะย้ายเพลย์บุ๊กหรือไม่`
        : `Regulations Leio is watching in this tenant (as at 25 Aug 2026):\n${lines.join("\n")}\nCounsel decides whether the playbook moves.`,
      cites: [
        { label: th ? "วิจัยและกฎ" : "Research & regulations", href: "/help?s=watch" },
        ...REG_UPDATES.filter((r) => r.hot).slice(0, 3).map((r) => ({ label: r.id, href: r.href })),
      ],
    };
  }

  const brief = matchResearchBrief(t);
  if (brief) {
    return {
      role: "ai",
      text: copyTE(lang, brief.a),
      cites: brief.cites,
    };
  }

  if (t.includes("research") || t.includes("วิจัย") || t.includes("brief")) {
    const lines = RESEARCH_BRIEFS.map((b) => `${b.id} · ${copyTE(lang, b.q)}`);
    return {
      role: "ai",
      text: th
        ? `งานวิจัยที่เปิดอยู่ในเทนแนนท์นี้:\n${lines.join("\n")}\nถามด้วยหัวข้อ หรือเปิดหน้าวิจัยและกฎ`
        : `Research briefs open in this tenant:\n${lines.join("\n")}\nAsk by topic, or open Research & regulations.`,
      cites: [
        { label: th ? "วิจัยและกฎ" : "Research & regulations", href: "/help?s=watch" },
        ...RESEARCH_BRIEFS.slice(0, 3).map((b) => ({ label: b.id, href: "/help?s=watch" })),
      ],
    };
  }

  return answerCopilot(q, lang, edition);
}

/** Live Leio when a key is present; canned research / how-to / copilot answers otherwise. Twin is not live-wired. */
export async function askLeio(
  q: string,
  lang: Lang,
  edition: Edition = "corporate",
  source: "leio" | "twin" = "leio",
  context?: string
): Promise<CopilotMsg> {
  if (source === "twin") return answerCopilot(q, lang, edition);
  const canned = answerLeio(q, lang, edition);
  const ans = await askLiveChat("/api/ai/leio", { q, lang, edition, context });
  if (!ans) return canned;
  return { role: "ai", text: ans.text, cites: ans.cites };
}
