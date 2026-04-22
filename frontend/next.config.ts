import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker production builds
  output: "standalone",
  // Support subpath deployment (e.g., /if-go-green)
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  trailingSlash: false,
  images: {
    // Disable optimization for environments without image optimizer
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "prepro.informatics.buu.ac.th",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "igg.hooppul.codes",
        pathname: "/**",
      },
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
    ],
  },
};

export default nextConfig;
