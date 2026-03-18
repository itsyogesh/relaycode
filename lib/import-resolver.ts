/**
 * Server-side Solidity import resolver via unpkg CDN.
 *
 * Uses compiler-driven resolution: attempt compilation, extract missing imports
 * from compiler errors, resolve from CDN, retry. The compiler is the
 * authoritative import parser — no regex guessing.
 *
 * Version pinning: bare imports resolve to "current latest at compile time."
 * Resolved versions are reported for auditability, not reproducibility.
 * For deterministic builds: use versioned imports or Upload mode.
 */

const UNPKG_BASE = "https://unpkg.com";
const PER_FETCH_TIMEOUT_MS = 10_000;
const MAX_FILE_SIZE = 500_000; // 500KB per file
const MAX_FILES = 50;
const MAX_ITERATIONS = 10;
const TOTAL_BUDGET_MS = 30_000;

interface ResolvedSources {
  sources: Record<string, { content: string }>;
  resolvedVersions: Record<string, string>;
}

// In-memory cache for a single resolution session
class ResolutionSession {
  private versionCache = new Map<string, string>();
  private fileCount = 0;
  private startTime = Date.now();

  constructor(private abortController: AbortController) {}

  private checkBudget() {
    if (Date.now() - this.startTime > TOTAL_BUDGET_MS) {
      throw new Error(
        "Import resolution timed out (30s budget). Compile externally and use Upload mode."
      );
    }
    if (this.fileCount >= MAX_FILES) {
      throw new Error(
        `Too many imports (>${MAX_FILES} files). Compile externally and use Upload mode.`
      );
    }
  }

  /**
   * Parse a Solidity import path into package name and file path.
   * "@openzeppelin/contracts/token/ERC20/ERC20.sol" → { pkg: "@openzeppelin/contracts", path: "token/ERC20/ERC20.sol" }
   * "@openzeppelin/contracts@5.0.0/token/ERC20/ERC20.sol" → { pkg: "@openzeppelin/contracts", version: "5.0.0", path: "token/ERC20/ERC20.sol" }
   */
  private parseImportPath(importPath: string): {
    pkg: string;
    version?: string;
    filePath: string;
  } | null {
    // Scoped package: @scope/name/path or @scope/name@version/path
    const scopedMatch = importPath.match(
      /^(@[^/]+\/[^/@]+)(?:@([^/]+))?\/(.+)$/
    );
    if (scopedMatch) {
      return {
        pkg: scopedMatch[1],
        version: scopedMatch[2],
        filePath: scopedMatch[3],
      };
    }

    // Non-scoped: name/path or name@version/path
    const simpleMatch = importPath.match(/^([^/@][^/]*)(?:@([^/]+))?\/(.+)$/);
    if (simpleMatch) {
      return {
        pkg: simpleMatch[1],
        version: simpleMatch[2],
        filePath: simpleMatch[3],
      };
    }

    return null;
  }

  /**
   * Resolve the pinned version for a package (session-scoped cache).
   */
  private async resolveVersion(pkg: string): Promise<string> {
    const cached = this.versionCache.get(pkg);
    if (cached) return cached;

    const url = `${UNPKG_BASE}/${pkg}/package.json`;
    const resp = await fetch(url, {
      signal: AbortSignal.any([
        this.abortController.signal,
        AbortSignal.timeout(PER_FETCH_TIMEOUT_MS),
      ]),
    });
    if (!resp.ok) {
      throw new Error(`Package not found on npm: ${pkg}`);
    }
    const pkgJson = await resp.json();
    const version = pkgJson.version as string;
    this.versionCache.set(pkg, version);
    return version;
  }

  /**
   * Fetch a single Solidity file from unpkg CDN.
   */
  async fetchFile(importPath: string): Promise<string> {
    this.checkBudget();
    this.fileCount++;

    const parsed = this.parseImportPath(importPath);
    if (!parsed) {
      throw new Error(`Cannot resolve import path: ${importPath}`);
    }

    const version =
      parsed.version || (await this.resolveVersion(parsed.pkg));
    const url = `${UNPKG_BASE}/${parsed.pkg}@${version}/${parsed.filePath}`;

    const resp = await fetch(url, {
      signal: AbortSignal.any([
        this.abortController.signal,
        AbortSignal.timeout(PER_FETCH_TIMEOUT_MS),
      ]),
    });

    if (!resp.ok) {
      throw new Error(
        `Failed to resolve import: ${importPath} (HTTP ${resp.status} from ${url})`
      );
    }

    const text = await resp.text();
    if (text.length > MAX_FILE_SIZE) {
      throw new Error(
        `Import file too large: ${importPath} (${text.length} bytes, max ${MAX_FILE_SIZE})`
      );
    }

    return text;
  }

  /**
   * Resolve a relative import path within a package context.
   * Example: from "@openzeppelin/contracts/token/ERC20/ERC20.sol",
   *          "../../utils/Context.sol" → "@openzeppelin/contracts/utils/Context.sol"
   */
  resolveRelativePath(
    fromPath: string,
    relativePath: string
  ): string | null {
    // Only handle relative paths
    if (!relativePath.startsWith("./") && !relativePath.startsWith("../")) {
      return null; // Not a relative path — treat as npm package import
    }

    const fromParts = fromPath.split("/");
    fromParts.pop(); // Remove filename
    const relParts = relativePath.split("/");

    for (const part of relParts) {
      if (part === "..") fromParts.pop();
      else if (part !== ".") fromParts.push(part);
    }

    return fromParts.join("/");
  }

  getResolvedVersions(): Record<string, string> {
    return Object.fromEntries(this.versionCache);
  }
}

/**
 * Extract missing import paths from compiler error output.
 * Works with both solc and resolc error formats.
 */
function extractMissingImports(
  errors: Array<{
    type?: string;
    message: string;
    formattedMessage?: string;
    severity?: string;
  }>
): string[] {
  const missing: string[] = [];

  for (const err of errors) {
    if (err.severity !== "error") continue;

    const msg = err.formattedMessage || err.message;

    // solc: "Source \"@openzeppelin/contracts/token/ERC20/ERC20.sol\" not found"
    const solcMatch = msg.match(/Source "(.+?)" not found/);
    if (solcMatch) {
      missing.push(solcMatch[1]);
      continue;
    }

    // resolc: similar format
    const resolcMatch = msg.match(
      /(?:File not found|not found|cannot find).*?["'](.+?)["']/i
    );
    if (resolcMatch) {
      missing.push(resolcMatch[1]);
      continue;
    }

    // Generic: "ParserError: Source ... not found"
    const genericMatch = msg.match(/Source\s+["']?([^\s"']+\.sol)["']?\s+not found/i);
    if (genericMatch) {
      missing.push(genericMatch[1]);
    }
  }

  return [...new Set(missing)]; // Deduplicate
}

/**
 * Resolve all imports for a Solidity source file using compiler-driven iteration.
 *
 * 1. Try to compile with just the user's source
 * 2. Extract missing import paths from compiler errors
 * 3. Fetch from CDN
 * 4. Repeat until all imports resolved or limits exceeded
 */
export async function resolveAllImports(
  source: string,
  existingSources?: Record<string, { content: string }>
): Promise<ResolvedSources> {
  const abortController = new AbortController();
  const session = new ResolutionSession(abortController);
  const budgetTimer = setTimeout(() => abortController.abort(), TOTAL_BUDGET_MS);

  try {
    const sources: Record<string, { content: string }> = {
      "Contract.sol": { content: source },
      ...existingSources,
    };

    // Quick check: if source has no imports, skip resolution
    if (!source.includes("import")) {
      return { sources, resolvedVersions: {} };
    }

    // Iterative resolution using solc's error output
    // We use solc for resolution (not resolc) because it's faster for parsing
    // eslint-disable-next-line
    const solc = require("solc"); // Server-side only — used for import resolution parsing

    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
      const input = JSON.stringify({
        language: "Solidity",
        sources,
        settings: { outputSelection: {} }, // Cheap: parse only, no codegen
      });

      const output = JSON.parse(solc.compile(input));
      const errors = output.errors || [];
      const missingPaths = extractMissingImports(errors);

      if (missingPaths.length === 0) break; // All imports resolved

      for (const importPath of missingPaths) {
        if (sources[importPath]) continue; // Already resolved

        // Check if this is a relative path within a previously resolved file
        let resolvedPath: string | null = null;
        for (const existingPath of Object.keys(sources)) {
          const candidate = session.resolveRelativePath(
            existingPath,
            importPath
          );
          if (candidate && !sources[candidate]) {
            resolvedPath = candidate;
            break;
          }
        }

        const pathToFetch = resolvedPath || importPath;
        const content = await session.fetchFile(pathToFetch);
        sources[pathToFetch] = { content };

        // If the original import path differs from the resolved path,
        // also add it under the original key for the compiler
        if (resolvedPath && resolvedPath !== importPath) {
          sources[importPath] = { content };
        }
      }
    }

    return {
      sources,
      resolvedVersions: session.getResolvedVersions(),
    };
  } finally {
    clearTimeout(budgetTimer);
    abortController.abort(); // Cancel any in-flight fetches
  }
}
