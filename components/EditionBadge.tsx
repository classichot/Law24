"use client";

import { useStore } from "@/lib/store";
import { T } from "@/lib/i18n";

export function EditionBadge({ size = "sm" }: { size?: "sm" | "lg" }) {
  const { edition } = useStore();
  const advisor = edition === "firm";
  return (
    <span className={`os-edition${advisor ? " advisor" : " corporate"}${size === "lg" ? " lg" : ""}`}>
          {advisor
        ? <T en="LAW24 Firm" th="LAW24 Firm" />
        : <T en="LAW24 Corporate" th="LAW24 Corporate" />}
    </span>
  );
}
