import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for React 19
  experimental: {
    ppr: false,
  },
  // Configure for Replit environment
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  // Allow all hosts for Replit proxy
  async rewrites() {
    return [];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
