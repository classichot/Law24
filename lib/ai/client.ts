import type { ChatAnswer } from "./types";

const TIMEOUT_MS = 120_000;

let liveCache: boolean | null = null;
let liveAt = 0;

export class AiRequestError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.status = status;
  }
}

export async function fetchAiStatus(force = false): Promise<boolean> {
  if (!force && liveCache !== null && Date.now() - liveAt < 60_000) return liveCache;
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), 8_000);
  try {
    const res = await fetch("/api/ai/status", { cache: "no-store", signal: ctrl.signal });
    const json = (await res.json()) as { live?: boolean };
    liveCache = Boolean(json.live);
  } catch {
    liveCache = false;
  } finally {
    window.clearTimeout(timer);
  }
  liveAt = Date.now();
  return liveCache;
}

export async function postAi<T>(path: string, body: FormData | unknown, timeoutMs = TIMEOUT_MS): Promise<T> {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const isForm = typeof FormData !== "undefined" && body instanceof FormData;
    const res = await fetch(path, {
      method: "POST",
      headers: isForm ? undefined : { "Content-Type": "application/json" },
      body: isForm ? body : JSON.stringify(body),
      signal: ctrl.signal,
    });
    const json = await res.json().catch(() => ({})) as { error?: string };
    if (!res.ok) {
      throw new AiRequestError(json.error || `AI request failed (${res.status})`, res.status);
    }
    return json as T;
  } catch (err) {
    if (err instanceof AiRequestError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new AiRequestError("Live AI timed out", 408);
    }
    throw new AiRequestError(err instanceof Error ? err.message : "Live AI failed", 0);
  } finally {
    window.clearTimeout(timer);
  }
}

/** Browser-only. Returns null when live AI is off. Throws on a live request failure. */
export async function askLiveChat(
  path: "/api/ai/leio",
  body: { q: string; lang: string; edition?: string; context?: string }
): Promise<ChatAnswer | null> {
  const live = await fetchAiStatus();
  if (!live) return null;
  const ans = await postAi<ChatAnswer>(path, body);
  if (!ans?.text?.trim()) throw new AiRequestError("Live AI returned an empty answer");
  return ans;
}
