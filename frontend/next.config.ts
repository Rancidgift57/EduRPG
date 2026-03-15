import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Prevent Turso/libsql from being bundled in frontend
  experimental: {
    serverComponentsExternalPackages: [],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle these on client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
