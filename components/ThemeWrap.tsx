"use client";

import { useEffect, type ReactNode } from "react";
import { THEMES } from "@/lib/format";
import { useStore } from "@/lib/store";

export function ThemeWrap({ children }: { children: ReactNode }) {
  const { theme, themeVars, lang } = useStore();
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(themeVars).forEach(([key, value]) => root.style.setProperty(key, value));
    root.dataset.theme = theme;
    root.lang = lang;
    root.style.colorScheme = THEMES[theme].scheme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", themeVars["--color-bg"] ?? "#f3f2f2");
  }, [theme, themeVars, lang]);
  return <>{children}</>;
}
