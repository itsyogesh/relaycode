import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

// ESM packages that need to be transformed by Jest.
// These packages ship ESM-only builds that Jest can't handle natively.
const esmPackages = [
  "@noble/hashes",
  "@noble/curves",
  "@dedot/utils",
  "@dedot/codecs",
  "@dedot/types",
  "@dedot/shape",
  "dedot",
  "@scure/base",
  "@luno-kit/core",
  "@luno-kit/react",
  "@luno-kit/ui",
  "cuer",
];

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/jest.polyfills.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testPathIgnorePatterns: ["/node_modules/", "__tests__/helpers/"],
};

// Use async config to modify transformIgnorePatterns after next/jest builds them
// This workaround is needed because next/jest overwrites transformIgnorePatterns
// See: https://github.com/vercel/next.js/issues/35634
export default async (...args: Parameters<ReturnType<typeof createJestConfig>>) => {
  const fn = createJestConfig(config);
  const resolvedConfig = await fn(...args);

  // Create a pattern that allows our ESM packages to be transformed
  // Handles both regular node_modules and pnpm's .pnpm directory structure
  const esmPackagesPattern = esmPackages
    .map((pkg) => pkg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  // Replace the default node_modules pattern with one that excludes our ESM packages
  resolvedConfig.transformIgnorePatterns = [
    `/node_modules/(?!(${esmPackagesPattern})/)`,
    `\\.pnpm/(?!(${esmPackagesPattern.replace(/\//g, "\\+")})@)`,
    "^.+\\.module\\.(css|sass|scss)$",
  ];

  return resolvedConfig;
};
