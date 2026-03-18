/**
 * Worker thread code for Solidity compilation.
 * Passed to `new Worker(code, { eval: true })` — runs in a separate thread.
 *
 * For PVM: bypasses @parity/resolc's exports map by resolving the absolute
 * path to resolc.js via require.resolve. The package only exports "." but
 * we need the low-level resolc() WASM function that returns bytecode
 * (the compile() wrapper hardcodes outputSelection to ['abi'] only).
 */
export const COMPILE_WORKER_CODE = `
  const { parentPort, workerData } = require('worker_threads');
  const path = require('path');

  try {
    const { mode, input } = workerData;

    if (mode === 'pvm') {
      const mainPath = require.resolve('@parity/resolc');
      const { resolc } = require(path.join(path.dirname(mainPath), 'resolc.js'));
      parentPort.postMessage({ success: true, output: resolc(input) });
    } else {
      const solc = require('solc');
      parentPort.postMessage({ success: true, output: JSON.parse(solc.compile(input)) });
    }
  } catch (err) {
    parentPort.postMessage({ success: false, error: err.message || String(err) });
  }
`;
