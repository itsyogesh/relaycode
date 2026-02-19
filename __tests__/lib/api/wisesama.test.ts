import {
  fetchIdentity,
  fetchIdentityBatch,
  clearIdentityCache,
} from "../../../lib/api/wisesama";

describe("wisesama API", () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    global.fetch = mockFetch as any;
    mockFetch.mockReset();
    clearIdentityCache();
  });

  describe("fetchIdentity", () => {
    it("returns mapped identity on success", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            displayName: "Alice",
            isVerified: true,
            judgements: [{ registrar: 0, judgement: "Reasonable" }],
            riskLevel: "low",
          }),
      });
      const result = await fetchIdentity("0x1234", "polkadot");
      expect(result).not.toBeNull();
      expect(result!.display).toBe("Alice");
      expect(result!.isVerified).toBe(true);
      expect(result!.address).toBe("0x1234");
      expect(result!.riskLevel).toBe("low");
    });

    it("returns cached result on second call", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ displayName: "Bob", isVerified: false }),
      });
      const first = await fetchIdentity("0xABCD", "polkadot");
      const second = await fetchIdentity("0xABCD", "polkadot");
      expect(first).toEqual(second);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("returns null on non-ok response", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 404 });
      const result = await fetchIdentity("0x0000", "polkadot");
      expect(result).toBeNull();
    });

    it("returns null on fetch error", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));
      const result = await fetchIdentity("0xDEAD", "polkadot");
      expect(result).toBeNull();
    });
  });

  describe("fetchIdentityBatch", () => {
    it("fetches uncached and returns all results", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ displayName: "User", isVerified: false }),
      });
      const results = await fetchIdentityBatch(
        ["0x1", "0x2", "0x3"],
        "polkadot"
      );
      expect(results.size).toBe(3);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it("uses cache for already-fetched addresses", async () => {
      // Pre-populate cache by fetching one identity
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ displayName: "Cached", isVerified: true }),
      });
      await fetchIdentity("0xCACHED", "polkadot");
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Now batch with the cached address and a new one
      mockFetch.mockReset();
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ displayName: "New", isVerified: false }),
      });
      const results = await fetchIdentityBatch(
        ["0xCACHED", "0xNEW"],
        "polkadot"
      );
      expect(results.size).toBe(2);
      // Only the uncached address should trigger a fetch
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(results.get("0xCACHED")!.display).toBe("Cached");
      expect(results.get("0xNEW")!.display).toBe("New");
    });

    it("handles errors in batch gracefully with partial results", async () => {
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          return Promise.reject(new Error("Network fail"));
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ displayName: "OK", isVerified: false }),
        });
      });
      const results = await fetchIdentityBatch(
        ["0xA", "0xB", "0xC"],
        "polkadot"
      );
      // 0xB fails, so we get 2 results
      expect(results.size).toBe(2);
      expect(results.has("0xA")).toBe(true);
      expect(results.has("0xB")).toBe(false);
      expect(results.has("0xC")).toBe(true);
    });
  });

  describe("clearIdentityCache", () => {
    it("clears the cache so subsequent calls fetch again", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ displayName: "Test", isVerified: false }),
      });
      await fetchIdentity("0xTEST", "polkadot");
      expect(mockFetch).toHaveBeenCalledTimes(1);

      clearIdentityCache();

      await fetchIdentity("0xTEST", "polkadot");
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
