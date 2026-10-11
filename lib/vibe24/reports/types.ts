import type { TE } from "@/lib/model";

export type ReportPackId = "xray-brief" | "decision-memo" | "dd-ic" | "assemble-pack";
export type ClaimKind = "sourced" | "derived" | "analysis" | "estimate" | "recommendation" | "gap";
export type SupportStatus = "supported" | "conflict" | "unresolved" | "not-applicable";
export type GateId = "boundary" | "evidence" | "numbers" | "references" | "requirements" | "writing" | "findings" | "approval" | "export";
export type GateState = "pass" | "fail" | "pending";
export type ReportStatus = "brief" | "drafting" | "ready-for-review" | "approved" | "submitted";
export type FindingSeverity = "critical" | "major" | "minor";

export type ReportBrief = {
  purpose: TE;
  audience: TE;
  jurisdiction: TE;
  entity: string;
  period: string;
  language: "en" | "th" | "both";
  currency: string;
  packId: ReportPackId;
  packVersion: string;
  preparer: string;
  reviewer: string;
  approver: string;
  estimatesPermitted: boolean;
};

export type DataField = {
  id: string;
  label: TE;
  value: string | null;
  unit?: string;
  entity: string;
  period: string;
  sourceId: string | null;
  validation: "approved" | "assertion" | "estimate" | "missing" | "demo" | "conflict";
  use: "allowed" | "blocked";
};

export type SourceRecord = {
  id: string;
  title: TE;
  owner: string;
  type: "pdf" | "docx" | "sheet" | "database" | "assertion" | "calculation";
  locator: string;
  version: string;
  retrieved: string;
  demo: boolean;
  review: "pending" | "accepted" | "rejected";
};

export type Claim = {
  id: string;
  section: string;
  text: TE;
  kind: ClaimKind;
  sourceIds: string[];
  excerpt: TE;
  support: SupportStatus;
  reviewer?: "accepted" | "rejected" | "held";
};

export type ReviewFinding = {
  id: string;
  severity: FindingSeverity;
  category: string;
  passage: TE;
  issue: TE;
  remedy: TE;
  status: "open" | "accepted" | "rejected";
};

export type QualityGate = {
  id: GateId;
  name: TE;
  state: GateState;
  detail: TE;
};

export type ReportSection = {
  id: string;
  title: TE;
  body: TE;
  claimIds: string[];
};

export type ReportRevision = {
  id: string;
  packId: ReportPackId;
  title: TE;
  status: ReportStatus;
  demo: boolean;
  brief: ReportBrief;
  fields: DataField[];
  sources: SourceRecord[];
  claims: Claim[];
  sections: ReportSection[];
  findings: ReviewFinding[];
  gates: QualityGate[];
  editorial: "pending" | "provisional" | "confirmed";
  editorialNote: TE;
  model: { provider: string; id: string; fallback: boolean };
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
};
