import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["unpdf", "mammoth", "@napi-rs/canvas"],
};

export default nextConfig;
