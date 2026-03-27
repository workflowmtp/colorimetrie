import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...config.resolve.alias,
      ".prisma/client/default": path.resolve(
        __dirname,
        "node_modules/.prisma/client"
      ),
    };
    return config;
  },
};

export default nextConfig;
