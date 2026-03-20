/**
 * Pure reducer + state tests for StudioProvider.
 *
 * Tests file ops, dirty tracking, and tab management without React rendering.
 * Imports the real reducer to prevent drift from production behavior.
 */
import type { StudioState } from "@/types/studio";
import { contentHash, createDefaultState, getAllSources } from "@/types/studio";
import { studioReducer } from "@/context/studio-provider";

// Helper to get the first file ID from state
function firstFileId(state: StudioState): string {
  return Object.keys(state.files)[0];
}

function isDirtySinceCompile(state: StudioState): boolean {
  const sources = getAllSources(state.files);
  const hash = contentHash(sources);
  return state.compiledContentHash === null || state.compiledContentHash !== hash;
}

describe("StudioReducer", () => {
  let state: StudioState;

  beforeEach(() => {
    state = createDefaultState();
  });

  // --- File Operations ---

  describe("CREATE_FILE", () => {
    it("creates a new file and opens a tab", () => {
      const next = studioReducer(state, {
        type: "CREATE_FILE",
        name: "Token.sol",
        content: "// token",
      });
      const files = Object.values(next.files);
      expect(files).toHaveLength(2);
      const newFile = files.find((f) => f.name === "Token.sol");
      expect(newFile).toBeDefined();
      expect(newFile!.content).toBe("// token");
      expect(next.openTabs).toHaveLength(2);
      expect(next.activeTabId).toBe(newFile!.id);
    });

    it("rejects duplicate names", () => {
      const next = studioReducer(state, {
        type: "CREATE_FILE",
        name: "Contract.sol",
      });
      expect(next).toBe(state); // No change
    });

    it("rejects names with path separators", () => {
      expect(studioReducer(state, { type: "CREATE_FILE", name: "foo/bar.sol" })).toBe(state);
      expect(studioReducer(state, { type: "CREATE_FILE", name: "../Token.sol" })).toBe(state);
      expect(studioReducer(state, { type: "CREATE_FILE", name: "path\\file.sol" })).toBe(state);
    });
  });

  describe("RENAME_FILE", () => {
    it("renames a file", () => {
      const id = firstFileId(state);
      const next = studioReducer(state, {
        type: "RENAME_FILE",
        fileId: id,
        newName: "MyContract.sol",
      });
      expect(next.files[id].name).toBe("MyContract.sol");
    });

    it("rejects rename to path-like names", () => {
      const id = firstFileId(state);
      expect(studioReducer(state, { type: "RENAME_FILE", fileId: id, newName: "foo/bar.sol" })).toBe(state);
      expect(studioReducer(state, { type: "RENAME_FILE", fileId: id, newName: "../x.sol" })).toBe(state);
    });

    it("rejects duplicate target name", () => {
      // Create a second file first
      const s1 = studioReducer(state, {
        type: "CREATE_FILE",
        name: "Token.sol",
      });
      const id = firstFileId(s1);
      const next = studioReducer(s1, {
        type: "RENAME_FILE",
        fileId: id,
        newName: "Token.sol",
      });
      expect(next).toBe(s1); // No change
    });
  });

  describe("DELETE_FILE", () => {
    it("deletes a file and closes its tab", () => {
      // Create second file
      const s1 = studioReducer(state, {
        type: "CREATE_FILE",
        name: "Token.sol",
      });
      const tokenId = Object.values(s1.files).find(
        (f) => f.name === "Token.sol"
      )!.id;
      const next = studioReducer(s1, {
        type: "DELETE_FILE",
        fileId: tokenId,
      });
      expect(Object.keys(next.files)).toHaveLength(1);
      expect(next.openTabs.find((t) => t.fileId === tokenId)).toBeUndefined();
    });

    it("blocks deletion of last file", () => {
      const id = firstFileId(state);
      const next = studioReducer(state, {
        type: "DELETE_FILE",
        fileId: id,
      });
      expect(next).toBe(state); // No change
    });

    it("focuses neighbor tab after deleting active tab", () => {
      // Create 3 files: A, B, C. Delete B (active).
      let s = studioReducer(state, {
        type: "CREATE_FILE",
        name: "B.sol",
      });
      s = studioReducer(s, { type: "CREATE_FILE", name: "C.sol" });
      const bId = Object.values(s.files).find((f) => f.name === "B.sol")!.id;

      // Make B active
      s = studioReducer(s, { type: "SET_ACTIVE_TAB", fileId: bId });
      expect(s.activeTabId).toBe(bId);

      const next = studioReducer(s, { type: "DELETE_FILE", fileId: bId });
      expect(next.activeTabId).not.toBe(bId);
      expect(next.activeTabId).not.toBeNull();
    });
  });

  describe("UPDATE_FILE_CONTENT", () => {
    it("updates file content", () => {
      const id = firstFileId(state);
      const next = studioReducer(state, {
        type: "UPDATE_FILE_CONTENT",
        fileId: id,
        content: "new content",
      });
      expect(next.files[id].content).toBe("new content");
    });
  });

  // --- Dirty Tracking ---

  describe("isDirtySinceCompile", () => {
    it("is dirty initially (compiledContentHash is null)", () => {
      expect(isDirtySinceCompile(state)).toBe(true);
    });

    it("becomes clean after setting compiled hash", () => {
      const sources = getAllSources(state.files);
      const hash = contentHash(sources);
      const next = studioReducer(state, {
        type: "SET_COMPILED_HASH",
        hash,
      });
      expect(isDirtySinceCompile(next)).toBe(false);
    });

    it("becomes dirty after editing", () => {
      const sources = getAllSources(state.files);
      const hash = contentHash(sources);
      let s = studioReducer(state, { type: "SET_COMPILED_HASH", hash });
      expect(isDirtySinceCompile(s)).toBe(false);

      const id = firstFileId(s);
      s = studioReducer(s, {
        type: "UPDATE_FILE_CONTENT",
        fileId: id,
        content: "changed",
      });
      expect(isDirtySinceCompile(s)).toBe(true);
    });

    it("becomes dirty after rename (name is part of hash)", () => {
      const sources = getAllSources(state.files);
      const hash = contentHash(sources);
      let s = studioReducer(state, { type: "SET_COMPILED_HASH", hash });

      const id = firstFileId(s);
      s = studioReducer(s, {
        type: "RENAME_FILE",
        fileId: id,
        newName: "Renamed.sol",
      });
      expect(isDirtySinceCompile(s)).toBe(true);
    });

    it("becomes dirty after creating a file", () => {
      const sources = getAllSources(state.files);
      const hash = contentHash(sources);
      let s = studioReducer(state, { type: "SET_COMPILED_HASH", hash });

      s = studioReducer(s, { type: "CREATE_FILE", name: "New.sol" });
      expect(isDirtySinceCompile(s)).toBe(true);
    });

    it("becomes dirty after deleting a file", () => {
      // Need 2 files to delete
      let s = studioReducer(state, {
        type: "CREATE_FILE",
        name: "Extra.sol",
      });
      const sources = getAllSources(s.files);
      const hash = contentHash(sources);
      s = studioReducer(s, { type: "SET_COMPILED_HASH", hash });

      const extraId = Object.values(s.files).find(
        (f) => f.name === "Extra.sol"
      )!.id;
      s = studioReducer(s, { type: "DELETE_FILE", fileId: extraId });
      expect(isDirtySinceCompile(s)).toBe(true);
    });
  });

  // --- Tab Management ---

  describe("OPEN_TAB", () => {
    it("opens a new tab and makes it active", () => {
      const s = studioReducer(state, {
        type: "CREATE_FILE",
        name: "B.sol",
      });
      const bId = Object.values(s.files).find((f) => f.name === "B.sol")!.id;
      // Close B's tab, then re-open it
      const s2 = studioReducer(s, { type: "CLOSE_TAB", fileId: bId });
      const s3 = studioReducer(s2, { type: "OPEN_TAB", fileId: bId });
      expect(s3.openTabs.find((t) => t.fileId === bId)).toBeDefined();
      expect(s3.activeTabId).toBe(bId);
    });

    it("does not duplicate existing tabs", () => {
      const id = firstFileId(state);
      const next = studioReducer(state, { type: "OPEN_TAB", fileId: id });
      expect(next.openTabs).toHaveLength(1);
      expect(next.activeTabId).toBe(id);
    });
  });

  describe("CLOSE_TAB", () => {
    it("closes a tab and focuses neighbor", () => {
      let s = studioReducer(state, {
        type: "CREATE_FILE",
        name: "B.sol",
      });
      const aId = firstFileId(state);
      // Active is B, close B → should focus A
      const next = studioReducer(s, {
        type: "CLOSE_TAB",
        fileId: s.activeTabId!,
      });
      expect(next.openTabs.find((t) => t.fileId === s.activeTabId)).toBeUndefined();
      expect(next.activeTabId).toBe(aId);
    });

    it("sets activeTabId to null when all tabs closed", () => {
      const id = firstFileId(state);
      const next = studioReducer(state, { type: "CLOSE_TAB", fileId: id });
      expect(next.openTabs).toHaveLength(0);
      expect(next.activeTabId).toBeNull();
    });
  });

  describe("SET_ACTIVE_TAB", () => {
    it("switches active tab", () => {
      const s = studioReducer(state, {
        type: "CREATE_FILE",
        name: "B.sol",
      });
      const aId = firstFileId(state);
      const next = studioReducer(s, { type: "SET_ACTIVE_TAB", fileId: aId });
      expect(next.activeTabId).toBe(aId);
    });
  });

  // --- Content Hash ---

  describe("contentHash", () => {
    it("produces deterministic hashes", () => {
      const sources = { "A.sol": { content: "abc" }, "B.sol": { content: "def" } };
      expect(contentHash(sources)).toBe(contentHash(sources));
    });

    it("is order-independent (sorted keys)", () => {
      const a = { "A.sol": { content: "abc" }, "B.sol": { content: "def" } };
      const b = { "B.sol": { content: "def" }, "A.sol": { content: "abc" } };
      expect(contentHash(a)).toBe(contentHash(b));
    });

    it("changes when content changes", () => {
      const a = { "A.sol": { content: "abc" } };
      const b = { "A.sol": { content: "xyz" } };
      expect(contentHash(a)).not.toBe(contentHash(b));
    });

    it("changes when filename changes", () => {
      const a = { "A.sol": { content: "abc" } };
      const b = { "B.sol": { content: "abc" } };
      expect(contentHash(a)).not.toBe(contentHash(b));
    });
  });
});
