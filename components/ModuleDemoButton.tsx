"use client";

import { useRouter } from "next/navigation";
import { MODULE_DEMOS, type ModuleDemoId } from "@/lib/demo";
import { useStore } from "@/lib/store";
import { T } from "@/lib/i18n";

export function ModuleDemoButton({
  id,
  compact = false,
  className,
}: {
  id: ModuleDemoId;
  compact?: boolean;
  className?: string;
}) {
  const s = useStore();
  const router = useRouter();
  const spec = MODULE_DEMOS[id];
  const th = s.lang === "th";

  return (
    <button
      type="button"
      className={className || (compact ? "btn btn-secondary" : "btn btn-primary")}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        s.startModuleDemo(id);
        s.flash(th ? spec.th.flash : spec.en.flash);
        router.push(spec.href);
      }}
    >
      {compact
        ? <T en="Demo" th="สาธิต" />
        : (th ? spec.th.btn : spec.en.btn)}
    </button>
  );
}
