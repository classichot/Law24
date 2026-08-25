import type { Metadata, Viewport } from "next";
import { StoreProvider } from "@/lib/store";
import { ThemeWrap } from "@/components/ThemeWrap";
import "./globals.css";

export const metadata: Metadata = {
  title: "LAW24 — AI Legal Operating System",
  description: "From business intention to contract, decision and control. Thai–English AI contract intelligence and legal due diligence.",
  applicationName: "LAW24",
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
};

export const viewport: Viewport = {
  themeColor: "#f3f2f2",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <StoreProvider>
          <ThemeWrap>{children}</ThemeWrap>
        </StoreProvider>
      </body>
    </html>
  );
}
