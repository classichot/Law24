"use client";

import { useEffect, type ReactNode, Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { AppShell } from "@/components/AppShell";

function Guard({ children }: { children: ReactNode }) {
  const { ready, authed } = useStore();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!authed) router.replace("/");
  }, [ready, authed, router, path]);

  if (!ready || !authed) {
    return <div style={{ minHeight: "100vh", background: "var(--color-bg)" }} />;
  }
  return <AppShell>{children}</AppShell>;
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--color-bg)" }} />}>
      <Guard>{children}</Guard>
    </Suspense>
  );
}
