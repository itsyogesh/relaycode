import {
  fetchValidators,
  fetchNominationPools,
} from "../../../lib/api/subscan";

describe("subscan API", () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    global.fetch = mockFetch as any;
    mockFetch.mockReset();
  });

  describe("fetchValidators", () => {
    it("returns validator list on success", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            data: { list: [{ stash_account_display: {} }] },
          }),
      });
      const result = await fetchValidators("polkadot");
      expect(result).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/subscan/polkadot/scan/staking/validators"),
        expect.objectContaining({ method: "POST" })
      );
    });

    it("returns empty array when data.list is null", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      });
      const result = await fetchValidators("polkadot");
      expect(result).toEqual([]);
    });

    it("throws on non-ok response", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });
      await expect(fetchValidators("polkadot")).rejects.toThrow(
        "Subscan error"
      );
    });

    it("respects custom page/row options", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { list: [] } }),
      });
      await fetchValidators("polkadot", { page: 2, row: 50 });
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.page).toBe(2);
      expect(body.row).toBe(50);
    });
  });

  describe("fetchNominationPools", () => {
    it("returns pool list on success", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ data: { list: [{ pool_id: 1 }] } }),
      });
      const result = await fetchNominationPools("polkadot");
      expect(result).toHaveLength(1);
    });

    it("throws on non-ok response", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 404 });
      await expect(fetchNominationPools("polkadot")).rejects.toThrow(
        "Subscan error"
      );
    });
  });
});
