import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server output: only Node.js + PostgreSQL are needed at runtime.
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com" }],
  },
};

export default nextConfig;
