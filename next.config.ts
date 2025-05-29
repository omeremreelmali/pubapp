import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for Docker
  output: "standalone",

  // Enable experimental features
  experimental: {
    // Server actions for better performance
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },

  // Image optimization
  images: {
    unoptimized: process.env.NODE_ENV === "production",
  },

  // Webpack configuration
  webpack: (config) => {
    // Handle Prisma client
    config.externals.push({
      "@prisma/client": "commonjs @prisma/client",
    });

    return config;
  },

  // Environment variables that should be available on client-side
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false,
        has: [
          {
            type: "cookie",
            key: "next-auth.session-token",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
