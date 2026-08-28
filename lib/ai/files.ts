const stash = new Map<string, { file: File; at: number }>();

export const CONTRACT_ACCEPT = ".pdf,.docx,.txt,.md";

export function stashFiles(bucket: string, files: File[]) {
  const now = Date.now();
  for (const f of files) {
    stash.set(`${bucket}:${f.name}:${f.size}`, { file: f, at: now });
  }
}

export function peekFile(bucket: string): File | null {
  let best: { file: File; at: number } | null = null;
  for (const [k, v] of stash) {
    if (!k.startsWith(`${bucket}:`)) continue;
    if (!best || v.at > best.at) best = v;
  }
  return best?.file ?? null;
}

export function isDemoName(name: string) {
  return /nimbus.*ct-291/i.test(name);
}
