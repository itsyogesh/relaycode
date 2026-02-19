// Mock env.mjs to avoid t3-oss/env validation in tests
jest.mock("../../env.mjs", () => ({
  env: {},
}));

// We need to test getURL which reads from process.env directly
// Save original env to restore after each test
const originalEnv = { ...process.env };

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_URL;
  delete process.env.NEXT_PUBLIC_VERCEL_URL;
});

afterEach(() => {
  process.env = { ...originalEnv };
});

// Must re-import fresh each time since getURL reads process.env at call time
import { getURL } from "../../config/get-url";

describe("getURL", () => {
  it("returns localhost when no env vars are set", () => {
    const result = getURL();
    expect(result).toBe("http://localhost:3000/");
  });

  it("prepends https:// when url is not localhost and has no protocol", () => {
    process.env.NEXT_PUBLIC_URL = "example.com";
    const result = getURL();
    expect(result).toBe("https://example.com/");
  });

  it("appends trailing / if not present", () => {
    process.env.NEXT_PUBLIC_URL = "https://example.com";
    const result = getURL();
    expect(result).toBe("https://example.com/");
  });

  it("uses NEXT_PUBLIC_URL over NEXT_PUBLIC_VERCEL_URL", () => {
    process.env.NEXT_PUBLIC_URL = "https://my-custom-domain.com";
    process.env.NEXT_PUBLIC_VERCEL_URL = "my-app.vercel.app";
    const result = getURL();
    expect(result).toBe("https://my-custom-domain.com/");
  });

  it("falls back to NEXT_PUBLIC_VERCEL_URL when NEXT_PUBLIC_URL is not set", () => {
    process.env.NEXT_PUBLIC_VERCEL_URL = "my-app.vercel.app";
    const result = getURL();
    expect(result).toBe("https://my-app.vercel.app/");
  });

  it("preserves http:// when URL already contains it", () => {
    process.env.NEXT_PUBLIC_URL = "http://localhost:4000";
    const result = getURL();
    expect(result).toBe("http://localhost:4000/");
  });

  it("does not double-add trailing / when URL already has one", () => {
    process.env.NEXT_PUBLIC_URL = "https://example.com/";
    const result = getURL();
    expect(result).toBe("https://example.com/");
  });
});
