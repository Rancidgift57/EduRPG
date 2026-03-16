import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Force Webpack — Turbopack panics on Windows with large SVG files
  webpack(config) {
    return config;
  },
  // ✅ Valid Next.js 16 options only
  turbopack: {},
};

export default nextConfig;
