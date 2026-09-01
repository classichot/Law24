import { NextResponse } from "next/server";
import { generateStructured } from "@/lib/ai/server";
import { assemblyQuestionnaire } from "@/lib/ai/schema";
import { LIVE_ONLY } from "@/lib/ai/house";
import { jsonError, requireLive } from "@/lib/ai/http";

export const runtime = "nodejs";
export const maxDuration = 60;

type IntakeBody = {
  type?: {
    id?: string;
    nameTh?: string;
    nameEn?: string;
    category?: string;
    purpose?: string;
    parties?: string;
    keyTerms?: string;
    legalBasis?: string;
    formality?: string;
  };
  answers?: Record<string, string>;
  round?: number;
};

export async function POST(req: Request) {
  const blocked = requireLive();
  if (blocked) return blocked;
  try {
    const body = await req.json() as IntakeBody;
    const type = body.type;
    if (!type?.id || (!type.nameEn && !type.nameTh)) {
      return jsonError("Select a contract type first", 400);
    }
    const answers = Object.fromEntries(
      Object.entries(body.answers || {})
        .filter(([k, v]) => k.length < 80 && typeof v === "string" && v.trim())
        .slice(0, 40),
    );
    const object = await generateStructured(
      assemblyQuestionnaire,
      `${LIVE_ONLY}

Create the next adaptive intake questionnaire for LAW24 Contract Assembly.

CONTRACT TYPE
ID: ${type.id}
Thai: ${type.nameTh || "not stated"}
English: ${type.nameEn || "not stated"}
Category: ${type.category || "not stated"}
Purpose: ${type.purpose || "not stated"}
Typical parties: ${type.parties || "not stated"}
Key terms: ${type.keyTerms || "not stated"}
Legal basis: ${type.legalBasis || "not stated"}
Formality: ${type.formality || "not stated"}

PRIOR ANSWERS
${JSON.stringify(answers, null, 2)}

ROUND: ${Math.max(1, Number(body.round) || 1)}

Rules:
- Ask 4–8 short questions that are specific to this contract type and materially affect clauses.
- Do not repeat answered questions.
- Adapt follow-up questions to the prior answers. For example: personal data triggers controller/processor, location, DPA and transfer questions; auto-renewal triggers notice and uplift questions; equity triggers class, percentage and vesting questions.
- Cover parties, commercial terms, scope/deliverables, risk allocation, approvals and statutory formality only where relevant.
- Use stable uppercase ids prefixed AQ-.
- Explain briefly why each answer matters to drafting.
- Select answerType carefully and provide options only for select.
- ready=true only when enough information exists to assemble a first draft; list unresolved essentials in missing.
- Answers are client/counsel assertions, not verified facts. The lawyer confirms. Never sign and never invent an answer.`,
    );
    return NextResponse.json(object);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Assembly intake questionnaire failed";
    return jsonError(msg, 500);
  }
}
