import type { TE } from "@/lib/model";
import type { PlaybookKey } from "@/lib/guides";
import type { AssignmentType } from "@/lib/firm";
import type { ModeKey } from "@/lib/model";
import { XRAY } from "@/lib/product";

export type XrayView = typeof XRAY;

export type Cite = { label: string; href: string };

export type ChatAnswer = {
  text: string;
  cites: Cite[];
};

export type LiveFinding = {
  id: string;
  sev: "high" | "med" | "low";
  conf: number;
  cat: TE;
  issue: TE;
  src: TE | string;
  like: TE;
  mat: TE;
  why: TE;
  inter: TE;
  pb: TE;
  rec: string;
  word: TE;
  alt: TE;
  appr: TE;
  status: string;
};

export type LiveBoardSeat = {
  k: TE;
  v: TE;
  note: TE;
  vote: string;
};

export type ReviewLive = {
  findings: LiveFinding[];
  board: LiveBoardSeat[];
  agreement: TE;
  recommendation: TE;
};

export type LiveFlag = {
  id: string;
  sev: string;
  ws: TE;
  t: TE;
  im: TE;
  a: TE;
  st: string;
  conf: number;
};

export type DdLive = {
  flags: LiveFlag[];
  missing: TE[];
  brief: TE;
};

export type LiveMove = {
  i: TE;
  k: string;
  why: TE;
  msg: TE;
};

export type NegotiateLive = {
  moves: LiveMove[];
  email: TE;
};

export type XrayLivePayload = {
  xray: XrayView;
  review?: ReviewLive | null;
};

export type AssistLiveHit = {
  mode: Exclude<ModeKey, "home">;
  screen: string;
  href: string;
  score: number;
  label: TE;
  why: TE;
  playbook: PlaybookKey;
};

export type AssistLiveResult = {
  jobRead: TE;
  briefRead: TE;
  start: AssistLiveHit;
  modules: {
    mode: Exclude<ModeKey, "home">;
    score: number;
    href: string;
    why: TE;
    functions: AssistLiveHit[];
  }[];
  functions: AssistLiveHit[];
  playbook: PlaybookKey;
  assignmentType: AssignmentType;
  path: AssistLiveHit[];
};
