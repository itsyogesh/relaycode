import { TextDecoder, TextEncoder } from "util";
import { randomUUID } from "crypto";

Object.assign(global, { TextDecoder, TextEncoder });

// crypto.randomUUID polyfill for jsdom
if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, "crypto", {
    value: {
      ...globalThis.crypto,
      randomUUID,
    },
  });
}

// ResizeObserver polyfill for cmdk (used by shadcn Command component)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

