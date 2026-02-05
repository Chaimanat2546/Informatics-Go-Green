import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output only for Docker production builds
  // Set NEXT_OUTPUT=standalone when building for Docker
  ...(process.env.NEXT_OUTPUT === "standalone" && { output: "standalone" }),
  images: {
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3001",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
