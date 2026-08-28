import type { Edition, Lang } from "./model";
import { routeAssist } from "./assist";
import { copyTE } from "./guides";
import { askLiveChat } from "./ai/client";

export type CopilotMsg = { role: "user" | "ai"; text: string; cites?: { label: string; href?: string }[] };

export function copilotIntro(lang: Lang): CopilotMsg {
  return {
    role: "ai",
    text: lang === "th"
      ? "LAW24 อ้างหลักฐานทุกข้อสรุป — ข้อสัญญา playbook หรือฐานกฎหมาย อ่านวิธีใช้ในคู่มือ อธิบายงานในผู้ช่วยเพื่อให้ชี้โมดูล หรือถามเรื่อง Nimbus, Charoen, พอร์ตได้เลย"
      : "LAW24 cites every material conclusion — clause, playbook or legal authority. Read Help for how to use and the house books. Describe a job in Assist to be routed, or ask about Nimbus, Charoen, or the portfolio.",
  };
}

export const SUGGESTIONS_EN = [
  "What is our maximum exposure?",
  "Which contracts in force carry uncapped liability?",
  "What happens if control of the company changes?",
  "Can the customer terminate without paying?",
];

export const SUGGESTIONS_TH = [
  "ความเสี่ยงสูงสุดของเราคือเท่าใด",
  "สัญญาใดมีความรับผิดไม่จำกัดและยังใช้บังคับอยู่",
  "ถ้าเปลี่ยนอำนาจควบคุมวันนี้สัญญาใดถูกกระทบ",
  "ลูกค้าเลิกสัญญาได้โดยไม่ต้องชำระหรือไม่",
];

export function answerCopilot(q: string, lang: Lang, edition: Edition = "corporate"): CopilotMsg {
  const t = q.toLowerCase();
  const th = lang === "th";
  if (/\bhost desk\b|\bbhd\b|demo (invite|link)|review link|mint (a )?link|โต๊ะโฮสต์|ลิงก์สาธิต/.test(t)) {
    return {
      role: "ai",
      text: th
        ? "โต๊ะโฮสต์สร้าง URL สาธิต LAW24 ที่มีกำหนดเวลา เปิด /host ตั้งจำนวนวัน (1–14 ค่าเริ่มต้น 3) กดสร้าง แล้วส่งเฉพาะ URL นั้น\n\nวันหมดอายุถูกเซ็นใน /review/{token} ผู้รับบนเครื่องอื่นเปิดสาธิตได้จนกว่านาฬิกาจะหมด หลังจากนั้น URL เดิมแสดงว่าสิ้นสุดการเข้าถึง\n\nคีย์โฮสต์ใช้ปลดล็อก Firm บนเบราว์เซอร์นี้เท่านั้น ไม่แสดงบนหน้าเข้าสู่ระบบสาธารณะ ถ้าจะตัดลิงก์ที่ยังใช้ได้ทั้งหมด ให้เพิ่ม INVITE_EPOCH แล้ว redeploy เครื่องยนต์ไม่ลงนามแทน"
        : "Host desk mints a time-limited LAW24 demo URL. Open /host, set days (1–14, default 3), Generate, then send only that URL.\n\nThe expiry is signed into /review/{token}, so a recipient on another device can open the demo until the clock runs out. After that the same URL shows Access ended.\n\nThe host key unlocks Firm on this browser. It is never shown on public login. To kill every live link at once, bump INVITE_EPOCH and redeploy. The engine never signs.",
      cites: [
        { label: th ? "โต๊ะโฮสต์" : "Host desk", href: "/host" },
        { label: th ? "วิธีใช้ LAW24" : "How to use LAW24", href: "/help?s=use" },
      ],
    };
  }
  if (t.includes("exposure") || t.includes("maximum") || t.includes("ความเสี่ยง") || t.includes("เพดาน")) {
    return {
      role: "ai",
      text: th
        ? "เพดานทั่วไปคือ 12 เดือนของค่าบริการ (฿8.2 ล้าน) แต่ข้อ 12.4 ยกเว้นข้อเรียกร้องด้านข้อมูล ทำให้ความเสี่ยงจากข้อมูลรั่วไหลไม่มีเพดาน ขณะที่ผู้ให้บริการควบคุมระบบ — playbook กำหนดเพดาน 2 เท่า รวมข้อเรียกร้องด้านข้อมูล"
        : "The general cap is 12 months of fees (THB 8.2M), but clause 12.4 carves out data claims, so data-breach exposure is unlimited while the provider controls the environment. Playbook IT & Cloud v4.2 requires a 2× cap including personal-data claims.",
      cites: [
        { label: "cl.12.4 · p.18", href: "/review?s=find" },
        { label: "Playbook IT & Cloud v4.2", href: "/help?s=book&b=itcloud" },
        { label: "F-01", href: "/review?s=find" },
      ],
    };
  }
  if (t.includes("control") || t.includes("อำนาจควบคุม") || t.includes("change of control")) {
    return {
      role: "ai",
      text: th
        ? "ดีลเจริญโลจิสติกส์: สัญญาสินเชื่อธนาคารกรุงเทพ ฿640 ล้านผิดนัดทันทีเมื่อเปลี่ยนอำนาจควบคุม ลูกค้า 7 รายเลิกสัญญาได้ คิดเป็นรายได้ 22% ผู้ร่วมทุนเวียดนามมีสิทธิซื้อก่อน"
        : "Charoen Logistics: Bangkok Bank facility THB 640M defaults immediately on change of control. Seven customers may terminate — 22% of revenue. The Vietnam JV partner holds a pre-emption right.",
      cites: [
        { label: "DK-01 Facility CT-155", href: "/diligence?s=dflags" },
        { label: "DK-02 CT-268", href: "/diligence?s=dmap" },
      ],
    };
  }
  if (t.includes("uncapped") || t.includes("ไม่จำกัด") || t.includes("in force")) {
    return {
      role: "ai",
      text: th
        ? "พอร์ตมีสัญญาที่ใช้บังคับอยู่ 12,847 ฉบับ ความรับผิดไม่จำกัด 212 ฉบับ ต่ออายุอัตโนมัติไม่มีเพดานราคา 486 ฉบับ"
        : "12,847 contracts in force. 212 carry uncapped liability. 486 auto-renew with uncapped uplift.",
      cites: [{ label: "Portfolio intelligence", href: "/intel?s=ipf" }],
    };
  }
  if (t.includes("terminat") || t.includes("เลิก")) {
    return {
      role: "ai",
      text: th
        ? "ผู้ให้บริการเลิกได้ตามสะดวกใน 30 วัน ฝ่ายเราเลิกได้เมื่อผิดสัญญาเท่านั้น และผูกพันขั้นต่ำ 36 เดือน ไม่มีข้อช่วยเหลือช่วงเปลี่ยนผ่าน — F-03"
        : "The provider may terminate for convenience on 30 days; we may terminate for cause only, remaining bound to a 36-month minimum with no exit assistance — finding F-03.",
      cites: [{ label: "cl.11.2 · p.16", href: "/review?s=find" }],
    };
  }
  if (t.includes("pdpa") || t.includes("transfer") || t.includes("โอน") || t.includes("ม.28") || t.includes("s.28") || t.includes("dpa")) {
    return {
      role: "ai",
      text: th
        ? "ข้อมูลถูกโอนไปสิงคโปร์และสหรัฐโดยยังไม่มีมาตรการตาม PDPA มาตรา 28 ไม่มี DPA และไม่มีรายชื่อผู้ประมวลผลช่วง — F-02 ต้องปิดก่อนวันเริ่มใช้งาน"
        : "Personal data moves to Singapore and the US without PDPA s.28 safeguards, no executed DPA, and no sub-processor list — F-02. That must close before go-live.",
      cites: [
        { label: "F-02", href: "/review?s=find" },
        { label: "Playbook IT & Cloud v4.2", href: "/help?s=book&b=itcloud" },
      ],
    };
  }
  if (t.includes("annex") || t.includes("ภาคผนวก") || t.includes("escrow")) {
    return {
      role: "ai",
      text: th
        ? "ภาคผนวก A–C ถูกอ้างถึงแต่ไม่แนบ ระบบถูกระบุว่าสำคัญแต่ไม่มี escrow และแผนเปลี่ยนผ่าน — สองช่องว่างนี้ทำให้ร่างยังลงนามไม่ได้"
        : "Annexes A–C are incorporated but never delivered. The system is business-critical with no escrow or transition plan. Either gap is enough to withhold signature.",
      cites: [
        { label: "F-05 / F-06", href: "/review?s=find" },
        { label: "Decision memo", href: "/holistic?s=memo" },
      ],
    };
  }
  if (t.includes("bangkok") || t.includes("กรุงเทพ") || t.includes("charoen") || t.includes("เจริญ") || t.includes("kill") || t.includes("ธงแดง")) {
    return {
      role: "ai",
      text: th
        ? "เจริญโลจิสติกส์: สินเชื่อธนาคารกรุงเทพ ฿640 ล้านผิดนัดทันทีเมื่อเปลี่ยนอำนาจควบคุม (DK-01) ลูกค้า 7 รายเลิกได้ คิดเป็นรายได้ 22% (DK-02) ทั้งสองเป็นประเด็นล้มดีล"
        : "Charoen Logistics: Bangkok Bank facility THB 640M defaults on change of control (DK-01). Seven customers may exit — 22% of revenue (DK-02). Both are deal-kill items.",
      cites: [
        { label: "DK-01", href: "/diligence?s=dflags" },
        { label: "Deal Map", href: "/diligence?s=dmap" },
      ],
    };
  }
  if (t.includes("renew") || t.includes("ต่ออายุ") || t.includes("notice") || t.includes("บอกกล่าว") || t.includes("overdue") || t.includes("เลยกำหนด")) {
    return {
      role: "ai",
      text: th
        ? "สัญญาบริหารอาคารเหลือ 6 วันก่อนกำหนดบอกกล่าว ถ้าไม่ส่งจะต่ออัตโนมัติ 12 เดือน ใบแจ้งหนี้ Nimbus ค้าง 2 วันและดอกเบี้ยผิดนัดเริ่มเดินแล้ว"
        : "Facilities management: six days to the notice deadline, then it auto-renews for 12 months. The Nimbus invoice is two days overdue and default interest is already accruing.",
      cites: [{ label: "Alerts", href: "/obligations?s=oalert" }],
    };
  }
  if (t.includes("memo") || t.includes("บันทึก") || t.includes("board") || t.includes("คณะ") || t.includes("sign") || t.includes("ลงนาม") || t.includes("recommend")) {
    return {
      role: "ai",
      text: th
        ? "คณะทบทวนเจ็ดคนไม่ผ่านร่างนี้ คำแนะนำในบันทึกผู้บริหารคือเจรจาใหม่ — ไม่ลงนามจนกว่าเพดานข้อมูล DPA/SCC สิทธิเลิกสมมาตร และภาคผนวกจะปิด"
        : "The seven-member board fails this draft. The management memo recommends renegotiate — no signature until the data cap, DPA/SCCs, symmetric termination and annexes close.",
      cites: [
        { label: "Review Board", href: "/review?s=board" },
        { label: "Decision memo", href: "/holistic?s=memo" },
      ],
    };
  }
  if (t.includes("playbook") || t.includes("เพลย์") || t.includes("os flow") || t.includes("เส้นทางระบบ") || t.includes("this menu") || t.includes("เมนูนี้")) {
    return {
      role: "ai",
      text: th
        ? "ทุกโมดูลมีเพลย์บุ๊กติดมา และทุกเมนูมีคำอธิบายเส้นทางใต้แท็บ Assemble ใช้เพลย์บุ๊กประกอบสัญญา Review ใช้ IT & Cloud v4.2 Holistic ใช้เพลย์บุ๊กตัดสินใจ Diligence ใช้ฝั่งผู้ซื้อ v3.1 Negotiate ใช้อำนาจเจรจา Obligations ใช้กำกับหลังลงนาม Intelligence ใช้ระเบียบความจำ สำนักงานใช้วิธีปฏิบัติ v1.0 เปิดแถบคำอธิบายใต้เมนูเพื่ออ่านกฎที่ใช้บังคับกับหน้านี้"
        : "Every module carries an attached playbook, and every menu has a flow explain under the tabs. Assemble uses the assembly book; Review uses IT & Cloud v4.2; Holistic the decision book; Diligence buy-side v3.1; Negotiate the mandate; Obligations post-signature control; Intelligence the memory protocol; Practice the SOP. Open the explain strip under the menus to read the rule in force on this screen.",
      cites: [
        { label: "IT & Cloud v4.2", href: "/help?s=book&b=itcloud" },
        { label: "Assembly playbook", href: "/help?s=book&b=assembly" },
        { label: "Practice SOP", href: "/help?s=book&b=practice" },
      ],
    };
  }
  if (t.includes("how to use") || t.includes("วิธีใช้") || t.includes("คู่มือ") || t.includes("playbook") || t.includes("เพลย์บุ๊ก") || t.includes("house book")) {
    return {
      role: "ai",
      text: th
        ? "LAW24 เป็นระบบปฏิบัติการ ไม่ใช่แชตบอท ข้อสรุปต้องมีหลักฐาน และทนายเป็นผู้ตัดสิน เพลย์บุ๊กบ้านอยู่ในโมดูลคู่มือ — เปิดเล่มที่กำกับงาน แล้วเข้าเครื่องยนต์ตามโมดูลนั้น ถ้ายังไม่รู้โมดูล ให้เริ่มที่ผู้ช่วย"
        : "LAW24 is an operating system, not a chatbot. Conclusions need evidence, and the lawyer decides. House playbooks live in Help — open the volume that governs the work, then enter that module. If the module is not obvious, start in Assist.",
      cites: [
        { label: th ? "วิธีใช้ LAW24" : "How to use LAW24", href: "/help?s=use" },
        { label: th ? "คลังเพลย์บุ๊ก" : "Playbook library", href: "/help?s=books" },
        { label: th ? "ผู้ช่วย" : "Assist", href: "/assist?s=ask" },
      ],
    };
  }
  if (t.includes("which module") || t.includes("which function") || t.includes("โมดูลไหน") || t.includes("ฟังก์ชัน") || t.includes("ช่วยงาน") || t.includes("ควรใช้") || t.includes("assist") || t.includes("ผู้ช่วย")) {
    const r = routeAssist(q, q, edition);
    if (r) {
      const top = r.functions.slice(0, 4).map((f) => `${f.mode} · ${copyTE(lang, f.label)}`).join("; ");
      return {
        role: "ai",
        text: th
          ? `จากงานที่อธิบาย เริ่มที่ ${r.start.mode} · ${copyTE(lang, r.start.label)} — ${copyTE(lang, r.start.why)} โมดูลที่ช่วยได้: ${top}`
          : `From that assignment, start in ${r.start.mode} · ${copyTE(lang, r.start.label)} — ${copyTE(lang, r.start.why)} Also useful: ${top}.`,
        cites: [
          { label: th ? "ผู้ช่วย AI" : "AI Assist", href: "/assist?s=ask" },
          ...r.functions.slice(0, 3).map((f) => ({ label: copyTE(lang, f.label), href: f.href })),
        ],
      };
    }
  }
  if (t.includes("assignment") || t.includes("client") || t.includes("งาน") || t.includes("ลูกค้า") || t.includes("trail") || t.includes("เส้นทาง") || t.includes("a-2481") || t.includes("dashboard") || t.includes("แดช")) {
    return {
      role: "ai",
      text: th
        ? "งาน A-2481 ของสยามดิจิทัลเริ่ม 4 ส.ค. จากคำสั่ง GC ปรีชา เส้นทางครบ: รับเรื่อง → ตรวจผลประโยชน์ทับซ้อน → CT-291 → สัมภาษณ์ → กฎหมายไทย → 8 ข้อค้นพบ → F-01 แก้ → คณะกรรมการเจรจาใหม่ → บันทึกถึงลูกค้า → รอบ 2 ยึดเพดาน ปัจจุบันรอร่างแก้จากนิมบัส จุดควบคุมถัดไป 5 ก.ย."
        : "Assignment A-2481 for Siam Digital opened 4 Aug on instruction from GC Preecha. The trail is complete: intake → conflict check → CT-291 → interview → Thai law → 8 findings → F-01 amend → board renegotiate → memo to client → Round 2 hold on the cap. Current control: awaiting Nimbus markup, next board 5 Sep.",
      cites: [
        { label: "A-2481 trail", href: "/practice?s=trace" },
        { label: "Dashboard", href: "/practice?s=dash" },
        { label: "F-01", href: "/review?s=find" },
      ],
    };
  }
  return {
    role: "ai",
    text: th
      ? `ยังไม่มีคำตอบที่ผูกหลักฐานสำหรับ “${q}” ลองถามเรื่องเพดานความรับผิด PDPA การเลิกสัญญา หรือธงแดงของเจริญโลจิสติกส์`
      : `No evidence-linked answer yet for “${q}”. Try liability cap, PDPA transfer, termination, or Charoen Logistics red flags.`,
    cites: [{ label: "Findings", href: "/review?s=find" }, { label: "Red flags", href: "/diligence?s=dflags" }],
  };
}

/** Live Copilot shares Leio. Twin stays on canned answers. */
export async function askCopilot(
  q: string,
  lang: Lang,
  edition: Edition = "corporate",
  source: "leio" | "twin" = "leio"
): Promise<CopilotMsg> {
  if (source === "twin") return answerCopilot(q, lang, edition);
  const canned = answerCopilot(q, lang, edition);
  const ans = await askLiveChat("/api/ai/leio", { q, lang, edition });
  if (!ans) return canned;
  return { role: "ai", text: ans.text, cites: ans.cites };
}
