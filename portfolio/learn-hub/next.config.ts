import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  outputFileTracingRoot: path.join(root, "../.."),
  async rewrites() {
    return [
      {
        source: "/skill-studio/:path*",
        destination: "http://127.0.0.1:3270/:path*",
      },
    ];
  },
};

export default nextConfig;
