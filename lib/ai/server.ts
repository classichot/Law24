import { generateObject, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import type { z } from "zod";
import { HOUSE_SYSTEM } from "./house";

const TIMEOUT_MS = 120_000;
/** Retired June 2026. Anthropic's documented replacement is Sonnet 4.6. */
const DEFAULT_ANTHROPIC = "claude-sonnet-4-6";
const RETIRED_ANTHROPIC: Record<string, string> = {
  "claude-sonnet-4-20250514": DEFAULT_ANTHROPIC,
  "claude-sonnet-4": DEFAULT_ANTHROPIC,
  "claude-opus-4-20250514": "claude-opus-4-6",
};

export function aiErrorMessage(err: unknown): string {
  if (!err) return "Live AI failed";
  if (typeof err === "string" && err.trim()) return err.trim();
  const e = err as {
    message?: string;
    cause?: unknown;
    data?: { error?: { message?: string } | string };
    text?: string;
  };
  const nested = typeof e.data?.error === "string" ? e.data.error : e.data?.error?.message;
  if (nested?.trim()) return nested.trim();
  if (e.text?.trim() && e.text.length < 400) return e.text.trim();
  if (e.message?.trim() && e.message !== "AI_APICallError") return e.message.trim();
  if (e.cause && e.cause !== err) return aiErrorMessage(e.cause);
  return "Live AI failed";
}

export function isAiLive(): boolean {
  const force = (process.env.AI_LIVE || "").trim().toLowerCase();
  if (force === "0" || force === "false" || force === "off") return false;
  return Boolean((process.env.OPENAI_API_KEY || "").trim() || (process.env.ANTHROPIC_API_KEY || "").trim());
}

export function aiProviderLabel(): string | null {
  if (!isAiLive()) return null;
  const model = (process.env.AI_MODEL || "").toLowerCase();
  if (model.includes("claude") && process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return null;
}

/** Identity-linked Anthropic keys are rejected unless the workspace is named in a header. */
function anthropicProvider() {
  const workspace = (process.env.ANTHROPIC_WORKSPACE_ID || "").trim();
  return createAnthropic({
    apiKey: (process.env.ANTHROPIC_API_KEY || "").trim(),
    headers: workspace ? { "anthropic-workspace-id": workspace } : undefined,
  });
}

function anthropicModelId() {
  const named = (process.env.AI_MODEL || "").trim();
  const id = named || DEFAULT_ANTHROPIC;
  return RETIRED_ANTHROPIC[id] || id;
}

function getModel() {
  const named = (process.env.AI_MODEL || "").trim();
  const wantClaude = named.toLowerCase().includes("claude");
  if (process.env.ANTHROPIC_API_KEY && (wantClaude || !process.env.OPENAI_API_KEY)) {
    return anthropicProvider()(anthropicModelId());
  }
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("No AI provider key");
  }
  return openai(named && !wantClaude ? named : "gpt-4o");
}

export async function generateStructured<S extends z.ZodType>(
  schema: S,
  prompt: string,
  extraSystem?: string
): Promise<z.infer<S>> {
  if (!isAiLive()) {
    throw new Error("Live AI is not configured");
  }
  const system = extraSystem ? `${HOUSE_SYSTEM}\n\n${extraSystem}` : HOUSE_SYSTEM;
  try {
    const { object } = await generateObject({
      model: getModel(),
      schema,
      schemaName: "law24",
      schemaDescription: "LAW24 structured legal output. Cite evidence. Never sign.",
      system,
      prompt,
      mode: "json",
      maxRetries: 1,
      abortSignal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return object as z.infer<S>;
  } catch (err) {
    throw new Error(aiErrorMessage(err));
  }
}

/** Read Thai/English contract text off scanned page images. Used when the PDF has no text layer. */
export async function generateTranscript(
  pages: { data: Uint8Array; mediaType: string }[],
  rendered: number,
  total: number
): Promise<string> {
  if (!isAiLive()) throw new Error("Live AI is not configured");
  if (!pages.length) throw new Error("No page images to read");
  try {
    const { text } = await generateText({
      model: getModel(),
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: `Transcribe this scanned contract (Thai and/or English). Keep clause numbers, party names, dates, amounts, defined terms and headings. Do not summarise. Do not invent missing pages. If a page is unreadable write [page N unreadable]. These are pages 1–${rendered} of ${total}.`,
          },
          ...pages.map((p) => ({
            type: "image" as const,
            image: p.data,
            mediaType: p.mediaType,
          })),
        ],
      }],
      abortSignal: AbortSignal.timeout(60_000),
    });
    const out = (text || "").trim();
    if (out.length < 80) throw new Error("OCR produced no usable contract text");
    return out;
  } catch (err) {
    throw new Error(aiErrorMessage(err));
  }
}
