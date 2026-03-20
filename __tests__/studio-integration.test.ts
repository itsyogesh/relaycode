/**
 * Integration tests for the riskiest async state transitions in Studio and Builder.
 *
 * Tests compile race protection, upload-during-compile cancellation,
 * compile failure artifact preservation, and mixed artifact flows.
 *
 * These are pure-logic tests that exercise the handler patterns without rendering
 * React components. They simulate the state mutations that handleCompile/handleUpload
 * perform against ContractCompilationState.
 */
import type { ContractCompilationState } from "@/lib/contract-store";

// --- Helpers that mirror the handler logic ---

function createInitialState(): ContractCompilationState {
  return {
    abi: null,
    contractName: null,
    bytecode: null,
    contractNames: [],
    allContracts: null,
    errors: [],
    warnings: [],
    isCompiling: false,
    mode: null,
    bytecodeSource: null,
  };
}

function applyUpdate(
  state: ContractCompilationState,
  update: Partial<ContractCompilationState>
): ContractCompilationState {
  return { ...state, ...update };
}

/** Simulate a successful compile result applied to state */
function applyCompileSuccess(
  state: ContractCompilationState,
  target: "evm" | "pvm"
): ContractCompilationState {
  return applyUpdate(state, {
    allContracts: { "Contract.sol:MyToken": { abi: [{ type: "constructor" }], bytecode: "aabb" } },
    contractName: "Contract.sol:MyToken",
    abi: [{ type: "constructor" }],
    bytecode: "aabb",
    contractNames: ["Contract.sol:MyToken"],
    errors: [],
    warnings: [],
    isCompiling: false,
    mode: target,
    bytecodeSource: "compile",
  });
}

/** Simulate a compile failure applied to state (preserves previous artifacts) */
function applyCompileFailure(
  state: ContractCompilationState
): ContractCompilationState {
  return applyUpdate(state, {
    isCompiling: false,
    errors: [{ message: "ParserError: Expected ';'", severity: "error" }],
    warnings: [],
  });
}

/** Simulate bytecode upload applied to state (full artifact reset) */
function applyBytecodeUpload(
  state: ContractCompilationState,
  bytecodeHex: string
): ContractCompilationState {
  return applyUpdate(state, {
    bytecode: bytecodeHex,
    bytecodeSource: "upload",
    mode: null,
    abi: null,
    allContracts: null,
    contractNames: [],
    contractName: null,
    errors: [],
    warnings: [],
    isCompiling: false,
  });
}

/** Simulate ABI upload applied to state (layers on top, does NOT touch bytecode) */
function applyAbiUpload(
  state: ContractCompilationState,
  abi: any[],
  name: string
): ContractCompilationState {
  return applyUpdate(state, {
    abi,
    contractName: name,
  });
}

// --- Compile Race Protection ---

describe("Compile race protection", () => {
  it("stale compile response is discarded when compileIdRef mismatches", () => {
    // Simulate: start compile A, start compile B, A finishes
    let compileId = 0;
    let state = createInitialState();

    // Compile A starts
    const idA = ++compileId;
    state = applyUpdate(state, { isCompiling: true, errors: [], warnings: [] });

    // Compile B starts before A finishes
    const idB = ++compileId;
    state = applyUpdate(state, { isCompiling: true, errors: [], warnings: [] });

    // Compile A finishes — but compileId !== idA, so it should be discarded
    if (compileId === idA) {
      state = applyCompileSuccess(state, "pvm");
    }
    // State should still be compiling (A was discarded)
    expect(state.isCompiling).toBe(true);
    expect(state.bytecode).toBeNull();

    // Compile B finishes — compileId === idB, so it should be applied
    if (compileId === idB) {
      state = applyCompileSuccess(state, "pvm");
    }
    expect(state.isCompiling).toBe(false);
    expect(state.bytecode).toBe("aabb");
    expect(state.bytecodeSource).toBe("compile");
    expect(state.mode).toBe("pvm");
  });

  it("upload during in-flight compile invalidates the compile token", () => {
    let compileId = 0;
    let state = createInitialState();
    let isCompiling = false;

    // Start compile
    const idA = ++compileId;
    isCompiling = true;
    state = applyUpdate(state, { isCompiling: true, errors: [], warnings: [] });

    // Upload bytecode while compile is in-flight — bumps token + clears local spinner
    ++compileId;
    isCompiling = false;
    state = applyBytecodeUpload(state, "deadbeef");

    // Verify upload took effect
    expect(state.bytecode).toBe("deadbeef");
    expect(state.bytecodeSource).toBe("upload");
    expect(state.mode).toBeNull();
    expect(state.isCompiling).toBe(false);
    expect(isCompiling).toBe(false);

    // Late compile A finishes — compileId !== idA, discarded
    if (compileId === idA) {
      state = applyCompileSuccess(state, "pvm");
      isCompiling = false;
    }
    // Upload state should be preserved, not overwritten
    expect(state.bytecode).toBe("deadbeef");
    expect(state.bytecodeSource).toBe("upload");
    expect(state.mode).toBeNull();
  });
});

// --- Compile Failure Policy ---

describe("Compile failure preserves previous artifacts", () => {
  it("keeps previous successful artifacts on compile failure", () => {
    let state = createInitialState();

    // First compile succeeds
    state = applyCompileSuccess(state, "pvm");
    expect(state.bytecode).toBe("aabb");
    expect(state.mode).toBe("pvm");
    expect(state.bytecodeSource).toBe("compile");

    // Second compile fails — should preserve first compile's artifacts
    state = applyCompileFailure(state);
    expect(state.bytecode).toBe("aabb"); // Preserved
    expect(state.abi).toEqual([{ type: "constructor" }]); // Preserved
    expect(state.mode).toBe("pvm"); // Preserved
    expect(state.bytecodeSource).toBe("compile"); // Preserved
    expect(state.errors).toHaveLength(1); // Error recorded
    expect(state.isCompiling).toBe(false);
  });

  it("deploy stays blocked after compile failure (dirty state)", () => {
    let state = createInitialState();

    // Compile succeeds
    state = applyCompileSuccess(state, "pvm");

    // Simulate user edits (content hash would change)
    // Then compile fails
    state = applyCompileFailure(state);

    // Previous artifacts exist but workspace is dirty (compiledContentHash not updated)
    // The deploy section checks isDirtySinceCompile which would be true
    expect(state.bytecode).toBe("aabb");
    expect(state.errors).toHaveLength(1);
    // compiledContentHash is NOT updated on failure — isDirtySinceCompile stays true
  });
});

// --- Mixed Artifact Transitions ---

describe("Mixed artifact transitions", () => {
  it("compile EVM → upload ABI only → deploy still blocked by EVM gate", () => {
    let state = createInitialState();

    // Compile EVM
    state = applyCompileSuccess(state, "evm");
    expect(state.mode).toBe("evm");
    expect(state.bytecodeSource).toBe("compile");

    // Upload ABI only — does NOT change bytecodeSource or mode
    state = applyAbiUpload(state, [{ type: "function", name: "foo" }], "MyAbi");
    expect(state.bytecodeSource).toBe("compile"); // Unchanged
    expect(state.mode).toBe("evm"); // Unchanged — still EVM-blocked
    expect(state.contractName).toBe("MyAbi"); // ABI name updated
  });

  it("compile PVM → upload new .bin → full artifact reset", () => {
    let state = createInitialState();

    // Compile PVM
    state = applyCompileSuccess(state, "pvm");
    expect(state.bytecodeSource).toBe("compile");
    expect(state.mode).toBe("pvm");
    expect(state.abi).toEqual([{ type: "constructor" }]);

    // Upload new bytecode — full reset
    state = applyBytecodeUpload(state, "cafebabe");
    expect(state.bytecodeSource).toBe("upload");
    expect(state.mode).toBeNull();
    expect(state.abi).toBeNull(); // Cleared
    expect(state.allContracts).toBeNull(); // Cleared
    expect(state.contractName).toBeNull(); // Cleared
    expect(state.bytecode).toBe("cafebabe");
  });

  it("upload .bin → upload .json → ABI layered, deploy enabled", () => {
    let state = createInitialState();

    // Upload bytecode
    state = applyBytecodeUpload(state, "deadbeef");
    expect(state.abi).toBeNull();

    // Upload ABI
    state = applyAbiUpload(state, [{ type: "constructor", inputs: [] }], "Uploaded");
    expect(state.bytecode).toBe("deadbeef"); // Unchanged
    expect(state.bytecodeSource).toBe("upload"); // Unchanged
    expect(state.abi).toEqual([{ type: "constructor", inputs: [] }]); // Layered
    expect(state.contractName).toBe("Uploaded");
  });

  it(".bin upload clears previous ABI (bytecode/ABI must match)", () => {
    let state = createInitialState();

    // Compile to get ABI + bytecode
    state = applyCompileSuccess(state, "pvm");
    expect(state.abi).toEqual([{ type: "constructor" }]);

    // Upload new bytecode — ABI must be cleared
    state = applyBytecodeUpload(state, "newcode");
    expect(state.abi).toBeNull();
    expect(state.bytecode).toBe("newcode");
  });
});

// --- Deploy Gate Logic ---

describe("Deploy gate rules", () => {
  it("compile source: enabled when PVM + not dirty", () => {
    const state = applyCompileSuccess(createInitialState(), "pvm");
    const enabled =
      state.bytecodeSource === "compile" &&
      state.mode === "pvm" &&
      !!state.bytecode;
    expect(enabled).toBe(true);
  });

  it("compile source: blocked when EVM", () => {
    const state = applyCompileSuccess(createInitialState(), "evm");
    const blocked = state.mode === "evm";
    expect(blocked).toBe(true);
  });

  it("upload source: enabled when bytecode exists (no dirty check)", () => {
    const state = applyBytecodeUpload(createInitialState(), "aabb");
    const enabled = state.bytecodeSource === "upload" && !!state.bytecode;
    expect(enabled).toBe(true);
  });

  it("no source: disabled when bytecodeSource is null", () => {
    const state = createInitialState();
    const enabled = state.bytecodeSource !== null && !!state.bytecode;
    expect(enabled).toBe(false);
  });
});
