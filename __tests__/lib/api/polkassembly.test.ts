import {
  fetchReferenda,
  fetchBounties,
} from "../../../lib/api/polkassembly";

describe("polkassembly API", () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    global.fetch = mockFetch as any;
    mockFetch.mockReset();
  });

  describe("fetchReferenda", () => {
    it("returns mapped referenda on success", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            posts: [
              {
                post_id: 42,
                title: "Proposal A",
                status: "Deciding",
                track_no: 1,
                track_name: "root",
                proposer: "0x1234",
                tally: { ayes: "100", nays: "50", support: "75" },
                created_at: "2024-01-01",
              },
            ],
          }),
      });
      const result = await fetchReferenda("polkadot");
      expect(result).toHaveLength(1);
      expect(result[0].post_id).toBe(42);
      expect(result[0].title).toBe("Proposal A");
      expect(result[0].track_name).toBe("root");
    });

    it("returns empty array when posts is null", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });
      const result = await fetchReferenda("polkadot");
      expect(result).toEqual([]);
    });

    it("throws on non-ok response", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });
      await expect(fetchReferenda("polkadot")).rejects.toThrow(
        "Polkassembly error"
      );
    });

    it("includes trackStatus param when provided", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ posts: [] }),
      });
      await fetchReferenda("polkadot", { trackStatus: "Deciding" });
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("trackStatus=Deciding");
    });

    it("uses correct default URL params", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ posts: [] }),
      });
      await fetchReferenda("kusama");
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("proposalType=referendums_v2");
      expect(url).toContain("sortBy=newest");
      expect(url).toContain("network=kusama");
      expect(url).toContain("listingLimit=100");
      expect(url).toContain("page=1");
    });
  });

  describe("fetchBounties", () => {
    it("returns mapped bounties on success", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            posts: [
              {
                post_id: 10,
                title: "Bounty A",
                content: "Details",
                status: "Active",
                curator: "0xABC",
                reward: "1000",
                created_at: "2024-02-01",
              },
            ],
          }),
      });
      const result = await fetchBounties("polkadot");
      expect(result).toHaveLength(1);
      expect(result[0].post_id).toBe(10);
      expect(result[0].curator).toBe("0xABC");
    });

    it("throws on non-ok response", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 404 });
      await expect(fetchBounties("polkadot")).rejects.toThrow(
        "Polkassembly error"
      );
    });
  });
});
