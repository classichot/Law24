import { z } from "zod";

export const te = z.object({ t: z.string(), e: z.string() });
/** Bare string or TE — generateObject JSON-schema stays valid; normalizeXray folds strings. */
export const teLoose = z.union([te, z.string()]);
export const cite = z.object({ label: z.string(), href: z.string() });

const verdictLoose = z.union([z.enum(["sign", "negotiate", "reject"]), z.string()]);
const sevLoose = z.union([z.enum(["high", "med", "low"]), z.string()]);

const PLAYBOOKS = [
  "practice", "assembly", "itcloud", "decision", "dd", "mandate",
  "control", "memory", "router", "help", "command",
] as const;

const MODES = [
  "practice", "command", "assist", "help", "assemble", "review",
  "holistic", "diligence", "negotiate", "obligations", "intel",
] as const;

/**
 * The map is minted as two halves so neither one has to write a whole bilingual
 * X-Ray inside the function budget. They are requested in parallel and merged;
 * splitting roughly halves wall-clock time, not just token count.
 */
export const xrayCore = z.object({
  doc: teLoose,
  ref: z.string().optional().default(""),
  pages: z.coerce.number().optional().default(1),
  langs: teLoose,
  verdict: verdictLoose,
  verdictLabel: teLoose,
  verdictWhy: teLoose,
  heatmap: z.array(z.object({
    cl: z.coerce.string(),
    k: teLoose,
    sev: sevLoose,
    pct: z.coerce.number(),
  })).max(8).optional().default([]),
  money: z.array(z.object({ k: teLoose, v: z.union([z.string(), teLoose]) })).max(5).optional().default([]),
  dates: z.array(z.object({ k: teLoose, v: z.union([z.string(), teLoose]), src: teLoose })).max(5).optional().default([]),
  parties: z.array(z.object({ k: teLoose, v: teLoose })).max(5).optional().default([]),
  laws: z.array(z.object({ k: teLoose, src: teLoose })).max(6).optional().default([]),
});

export const xrayDeep = z.object({
  missing: z.array(z.object({ k: teLoose, src: teLoose })).max(6).optional().default([]),
  unusual: z.array(z.object({ k: teLoose, vs: teLoose, src: teLoose })).max(5).optional().default([]),
  layers: z.array(z.object({ k: teLoose, v: teLoose })).max(3).optional().default([]),
  redlines: z.array(z.object({ cl: z.coerce.string(), text: teLoose })).max(6).optional().default([]),
  ladder: z.array(z.object({ n: z.coerce.string(), k: teLoose, v: teLoose })).max(4).optional().default([]),
  brief: teLoose,
  email: teLoose,
});

export const xrayObject = z.object({ ...xrayCore.shape, ...xrayDeep.shape });

export const findingObject = z.object({
  id: z.string(),
  sev: z.enum(["high", "med", "low"]),
  conf: z.number(),
  cat: te,
  issue: te,
  src: z.union([z.string(), te]),
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

/** Second stage. Kept out of xrayObject so neither call outgrows the function time limit. */
export const reviewPack = z.object({
  findings: z.array(findingObject).min(1).max(8),
  board: z.array(boardSeatObject).min(5).max(7),
  agreement: te,
  recommendation: te,
});

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
