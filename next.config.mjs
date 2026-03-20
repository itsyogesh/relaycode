import { createMDX } from "fumadocs-mdx/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],
  output: "standalone",
  serverExternalPackages: ["@parity/resolc", "solc"],
  outputFileTracingIncludes: {
    "/api/compile": [
      "./node_modules/@parity/resolc/**/*",
      "./node_modules/solc/**/*",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.brandfetch.io",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
        path: false,
      };
    }
    return config;
  },
};

const withMDX = createMDX();

export default withMDX(nextConfig);
