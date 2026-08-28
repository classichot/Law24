"use client";

import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { T } from "@/lib/i18n";

export function EditionBadge({ size = "sm" }: { size?: "sm" | "lg" }) {
  const { edition, setEdition, flash, lang } = useStore();
  const router = useRouter();
  const path = usePathname();
  const advisor = edition === "firm";

  function toggle() {
    const next = edition === "firm" ? "corporate" : "firm";
    setEdition(next);
    flash(next === "firm"
      ? (lang === "th" ? "สลับเป็น LAW24 Firm — เมนูสำนักงาน" : "Switched to LAW24 Firm — Practice menus")
      : (lang === "th" ? "สลับเป็น LAW24 Corporate — เมนูควบคุม" : "Switched to LAW24 Corporate — Control menus"));
    if (next === "corporate" && path.startsWith("/practice")) router.replace("/home");
    if (next === "firm" && path.startsWith("/command")) router.replace("/home");
  }

  return (
    <button
      type="button"
      className={`os-edition${advisor ? " advisor" : " corporate"}${size === "lg" ? " lg" : ""}`}
      onClick={toggle}
      title={lang === "th" ? "สลับองค์กร / สำนักงาน" : "Switch Corporate / Firm"}
    >
      {advisor
        ? <T en="LAW24 Firm" th="LAW24 Firm" />
        : <T en="LAW24 Corporate" th="LAW24 Corporate" />}
    </button>
  );
}
