import type { NextConfig } from "next";

const config: NextConfig = {
  // Workspace packages ship TypeScript source.
  transpilePackages: ["@rem/core", "@rem/db"],
  serverExternalPackages: ["pg"],
};

export default config;
