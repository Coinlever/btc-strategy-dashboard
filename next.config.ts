import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/btc-strategy-dashboard",
  images: { unoptimized: true },
};

export default nextConfig;
