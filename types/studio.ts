export interface StudioFile {
  id: string;
  name: string; // e.g., "MyToken.sol"
  content: string;
}

export interface OpenTab {
  fileId: string;
}

export interface StudioState {
  files: Record<string, StudioFile>; // keyed by ID
  openTabs: OpenTab[];
  activeTabId: string | null;
  sidebarCollapsed: boolean;
  outputVisible: boolean;
  compileTarget: "evm" | "pvm"; // user's INTENT (what they'll compile next)
  compiledContentHash: string | null; // hash of all sources at last successful compile
  compiledSources: Record<string, string> | null; // snapshot of file name → content at last compile
}

export type StudioAction =
  | { type: "CREATE_FILE"; name: string; content?: string }
  | { type: "RENAME_FILE"; fileId: string; newName: string }
  | { type: "DELETE_FILE"; fileId: string }
  | { type: "UPDATE_FILE_CONTENT"; fileId: string; content: string }
  | { type: "IMPORT_FILES"; files: Array<{ name: string; content: string }> }
  | { type: "OPEN_TAB"; fileId: string }
  | { type: "CLOSE_TAB"; fileId: string }
  | { type: "SET_ACTIVE_TAB"; fileId: string }
  | { type: "SET_COMPILE_TARGET"; target: "evm" | "pvm" }
  | { type: "SET_COMPILED_HASH"; hash: string; sources: Record<string, string> }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "TOGGLE_OUTPUT" }
  | { type: "HYDRATE"; state: StudioState };

// --- Content hash utility ---

/**
 * Fast non-crypto hash (djb2) for content equality comparison.
 * Hashes sorted file names + contents.
 */
export function contentHash(
  sources: Record<string, { content: string }>
): string {
  const keys = Object.keys(sources).sort();
  let hash = 5381;
  for (const key of keys) {
    const str = key + "\0" + sources[key].content;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
    }
  }
  return hash.toString(36);
}

export const DEFAULT_SOLIDITY = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MyToken {
    string public name;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    constructor(string memory _name, uint256 _initialSupply) {
        name = _name;
        totalSupply = _initialSupply;
        balanceOf[msg.sender] = _initialSupply;
    }
}`;

export function createDefaultState(): StudioState {
  const id = crypto.randomUUID();
  return {
    files: {
      [id]: { id, name: "Contract.sol", content: DEFAULT_SOLIDITY },
    },
    openTabs: [{ fileId: id }],
    activeTabId: id,
    sidebarCollapsed: false,
    outputVisible: true,
    compileTarget: "pvm",
    compiledContentHash: null,
    compiledSources: null,
  };
}

/**
 * Build allSources map (fileName → {content}) for compile API.
 */
export function getAllSources(
  files: Record<string, StudioFile>
): Record<string, { content: string }> {
  const sources: Record<string, { content: string }> = {};
  for (const file of Object.values(files)) {
    sources[file.name] = { content: file.content };
  }
  return sources;
}
