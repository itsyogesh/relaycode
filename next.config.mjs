import { createMDX } from "fumadocs-mdx/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],
  output: "standalone",
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
};

const withMDX = createMDX();

export default withMDX(nextConfig);
