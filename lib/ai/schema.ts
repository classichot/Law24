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

export const xrayObject = z.object({
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
  })).min(1).max(10),
  missing: z.array(z.object({ k: te, src: te })).max(8),
  unusual: z.array(z.object({ k: te, vs: te, src: te })).max(6),
  money: z.array(z.object({ k: te, v: z.union([z.string(), te]) })).max(6),
  dates: z.array(z.object({ k: te, v: z.union([z.string(), te]), src: te })).max(6),
  parties: z.array(z.object({ k: te, v: te })).max(6),
  laws: z.array(z.object({ k: te, src: te })).max(8),
  layers: z.array(z.object({ k: te, v: te })).min(1).max(3),
  redlines: z.array(z.object({ cl: z.string(), text: te })).max(8),
  ladder: z.array(z.object({ n: z.string(), k: te, v: te })).min(1).max(4),
  brief: te,
  email: te,
});

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

export const xrayPayload = z.object({
  xray: xrayObject,
  findings: z.array(findingObject).max(10),
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
