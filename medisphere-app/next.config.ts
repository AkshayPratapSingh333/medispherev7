import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {serverComponentsExternalPackages: ["pdf-parse", "pdfjs-dist", "mammoth"],},
  reactStrictMode: true,
  devIndicators: false,
  /* config options here */
};

export default nextConfig;
