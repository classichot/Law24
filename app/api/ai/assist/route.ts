import { NextResponse } from "next/server";
import { generateStructured } from "@/lib/ai/server";
import { assistRoute } from "@/lib/ai/schema";
import { TENANT_BRIEF } from "@/lib/ai/house";
import { jsonError, requireLive } from "@/lib/ai/http";
import { routeAssist } from "@/lib/assist";
import type { Edition } from "@/lib/model";
import type { PlaybookKey } from "@/lib/guides";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const blocked = requireLive();
  if (blocked) return blocked;
  try {
    const body = await req.json() as { job?: string; brief?: string; edition?: Edition };
    const job = (body.job || "").trim();
    const brief = (body.brief || "").trim();
    const edition: Edition = body.edition === "firm" ? "firm" : "corporate";
    if (!job && !brief) return jsonError("Describe the job or the assignment", 400);

    const fallback = routeAssist(job, brief, edition);
    const object = await generateStructured(
      assistRoute,
      `${TENANT_BRIEF}

Route this assignment to LAW24 modules and functions. Name the start function, up to 6 useful functions, a 4-step path, the playbook to attach, and assignmentType. Do not sign and do not pick a negotiation posture.

Edition: ${edition} (${edition === "firm" ? "include Practice, exclude Command" : "include Command, exclude Practice"}).

Role: ${job || "(not given)"}
Assignment: ${brief || "(not given)"}

Known screens (mode?s=screen): assemble lib/iv/asm/draft/bilingual; review xray/rsetup/find/pb/red/board; holistic cockpit/dna/simulate/memo; diligence dmatter/droom/dflags/autopilot/drep; negotiate nstrat/nladder/npos/nresp; obligations oreg/ocal/oren/oalert; intel twin/ipf/ikg/memory; command desk/approvals; practice brain/room/packages/quote/assign/trace; help use/leio/watch/books; assist ask.

Playbook keys: practice assembly itcloud decision dd mandate control memory router help command.`,
    );

    const startHref = `/${object.start.mode}?s=${object.start.screen}`;
    const functions = object.functions.map((fn, i) => ({
      ...fn,
      href: `/${fn.mode}?s=${fn.screen}`,
      score: 80 - i * 8,
    }));
    const start = { ...object.start, href: startHref, score: 90 };
    const used = functions.length ? functions : fallback?.functions || [start];
    const byMode = new Map<string, typeof used>();
    used.forEach((h) => {
      const list = byMode.get(h.mode) || [];
      list.push(h);
      byMode.set(h.mode, list);
    });
    const modules = [...byMode.entries()].map(([mode, fns]) => ({
      mode: mode as (typeof used)[0]["mode"],
      score: fns.reduce((n, x) => n + x.score, 0),
      href: fns[0].href,
      why: fns[0].why,
      functions: fns,
    }));

    return NextResponse.json({
      jobRead: object.jobRead,
      briefRead: object.briefRead,
      start,
      modules,
      functions: used,
      playbook: object.playbook as PlaybookKey,
      assignmentType: object.assignmentType,
      path: (object.path.length ? object.path : used.slice(0, 4)).map((p, i) => ({
        ...p,
        href: "href" in p && p.href ? p.href : `/${p.mode}?s=${p.screen}`,
        score: 70 - i * 5,
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Assist routing failed";
    return jsonError(msg, 500);
  }
}
