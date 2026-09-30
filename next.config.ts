import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  serverExternalPackages: ["tweetnacl", "bcryptjs"],
};

export default nextConfig;
