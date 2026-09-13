import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      /** 入力上限 15MB + FormData 余白 */
      bodySizeLimit: "16mb",
    },
  },
};

export default nextConfig;
