import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const root = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    localPatterns: [{ pathname: "/assets/crazy/**" }],
  },
  turbopack: { root },
};

export default nextConfig;
