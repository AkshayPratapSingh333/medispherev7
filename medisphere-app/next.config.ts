import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "mammoth"],
  reactStrictMode: true,
  devIndicators: false,
  /* config options here */
};

export default nextConfig;
