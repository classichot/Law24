import { z } from "zod";

export const te = z.object({ t: z.string(), e: z.string() });
export const cite = z.object({ label: z.string(), href: z.string() });

const PLAYBOOKS = [
  "practice", "assembly", "itcloud", "decision", "dd", "mandate",
  "control", "memory", "router", "help", "command",
] as const;

const MODES = [
  "practice", "command", "assist", "help", "assemble", "review",
  "holistic", "diligence", "negotiate", "obligations", "intel",
] as const;

/**
 * The map is minted as four small stages requested in parallel, then merged.
 * One call writing the whole bilingual X-Ray ran past the function budget, and
 * wall time now tracks the largest stage instead of the sum. Fields stay strict
 * objects on purpose: a `string | TE` union compiles to `anyOf` and Claude then
 * answers with stringified JSON, which validates but renders as garbage.
 */
export const xrayIdent = z.object({
  doc: te,
  ref: z.string(),
  pages: z.number(),
  langs: te,
  verdict: z.enum(["sign", "negotiate", "reject"]),
  verdictLabel: te,
  verdictWhy: te,
  heatmap: z.array(z.object({
    cl: z.string(),
    k: te,
    sev: z.enum(["high", "med", "low"]),
    pct: z.number(),
  })).max(8),
});

export const xrayFacts = z.object({
  money: z.array(z.object({ k: te, v: te })).max(5),
  dates: z.array(z.object({ k: te, v: te, src: te })).max(5),
  parties: z.array(z.object({ k: te, v: te })).max(5),
  laws: z.array(z.object({ k: te, src: te })).max(6),
});

export const xrayGaps = z.object({
  missing: z.array(z.object({ k: te, src: te })).max(6),
  unusual: z.array(z.object({ k: te, vs: te, src: te })).max(5),
  layers: z.array(z.object({ k: te, v: te })).length(3),
});

export const xrayPlan = z.object({
  redlines: z.array(z.object({ cl: z.string(), text: te })).max(4),
  ladder: z.array(z.object({ n: z.string(), k: te, v: te })).length(4),
  brief: te,
  email: te,
});

export const xrayObject = z.object({
  ...xrayIdent.shape,
  ...xrayFacts.shape,
  ...xrayGaps.shape,
  ...xrayPlan.shape,
});

export const findingObject = z.object({
  id: z.string(),
  sev: z.enum(["high", "med", "low"]),
  conf: z.number(),
  cat: te,
  issue: te,
  src: te,
  like: te,
  mat: te,
  why: te,
  inter: te,
  pb: te,
  rec: z.string(),
  word: te,
  alt: te,
  appr: te,
  status: z.string(),
});

export const boardSeatObject = z.object({
  k: te,
  v: te,
  note: te,
  vote: z.string(),
});

/** Second stage, split for the same reason the map is: one call runs too long. */
export const reviewFindings = z.object({
  /** Eleven bilingual fields per card, so cards are minted two at a time. */
  findings: z.array(findingObject).min(1).max(2),
});

export const reviewBoard = z.object({
  board: z.array(boardSeatObject).min(5).max(7),
  agreement: te,
  recommendation: te,
});

export const reviewPack = z.object({ ...reviewFindings.shape, ...reviewBoard.shape });

export const chatAnswer = z.object({
  text: z.string(),
  cites: z.array(cite).max(8),
});

export const clauseProposal = z.object({
  blocked: z.boolean(),
  body: te,
  why: te,
  cites: z.array(cite).max(6),
});

export const assemblyQuestionnaire = z.object({
  summary: te,
  ready: z.boolean(),
  missing: z.array(te).max(8),
  questions: z.array(z.object({
    id: z.string(),
    prompt: te,
    why: te,
    category: z.enum(["parties", "commercial", "scope", "risk", "approval", "formality"]),
    answerType: z.enum(["text", "number", "date", "boolean", "select"]),
    required: z.boolean(),
    options: z.array(te).max(8),
  })).max(8),
});

const assistHit = z.object({
  mode: z.enum(MODES),
  screen: z.string(),
  label: te,
  why: te,
  playbook: z.enum(PLAYBOOKS),
});

export const assistRoute = z.object({
  jobRead: te,
  briefRead: te,
  start: assistHit,
  functions: z.array(assistHit).min(1).max(6),
  playbook: z.enum(PLAYBOOKS),
  assignmentType: z.enum(["review", "diligence", "negotiate", "obligations", "assemble", "advisory"]),
  path: z.array(assistHit).min(1).max(4),
});

export const ddPack = z.object({
  flags: z.array(z.object({
    id: z.string(),
    sev: z.string(),
    ws: te,
    t: te,
    im: te,
    a: te,
    st: z.string(),
    conf: z.number(),
  })).max(10),
  missing: z.array(te).max(8),
  brief: te,
});

export const negotiatePack = z.object({
  moves: z.array(z.object({
    i: te,
    k: z.string(),
    why: te,
    msg: te,
  })).min(1).max(6),
  email: te,
});
