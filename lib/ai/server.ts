import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import type { z } from "zod";
import { HOUSE_SYSTEM } from "./house";

const TIMEOUT_MS = 120_000;

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

function getModel() {
  const named = (process.env.AI_MODEL || "").trim();
  const wantClaude = named.toLowerCase().includes("claude");
  if (process.env.ANTHROPIC_API_KEY && (wantClaude || !process.env.OPENAI_API_KEY)) {
    return anthropic(named || "claude-sonnet-4-20250514");
  }
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("No AI provider key");
  }
  return openai(named || "gpt-4o");
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
}
