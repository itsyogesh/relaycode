import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

// ESM packages that need to be transformed by Jest.
// In pnpm, packages under .pnpm use "+" instead of "/" for scoped names
// (e.g., @noble/hashes -> @noble+hashes@1.8.0).
// We need two patterns: one for the .pnpm internal path, one for the symlinked path.
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
];

// Convert scoped packages to pnpm .pnpm directory format: @scope/name -> @scope\\+name
const pnpmPattern = esmPackages
  .map((pkg) => pkg.replace("/", "\\+"))
  .join("|");

// Keep normal format for the symlinked node_modules path
const normalPattern = esmPackages.join("|");

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/jest.polyfills.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transformIgnorePatterns: [
    `<rootDir>/node_modules/.pnpm/(?!(${pnpmPattern})@)`,
    `node_modules/(?!(\\.pnpm|${normalPattern})/)`,
  ],
};

export default createJestConfig(config);
