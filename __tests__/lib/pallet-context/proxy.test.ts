jest.mock("../../../env.mjs", () => ({ env: {} }));

import { fetchProxyContext } from "../../../lib/pallet-context/proxy";
import { createMockDedotClient } from "../../helpers/mock-client";

const tokenMeta = { tokenSymbol: "DOT", tokenDecimals: 10 };

const DEFAULT_PROXY_TYPES = [
  { name: "Any", index: 0 },
  { name: "NonTransfer", index: 1 },
  { name: "Governance", index: 2 },
  { name: "Staking", index: 3 },
  { name: "IdentityJudgement", index: 5 },
  { name: "CancelProxy", index: 6 },
  { name: "Auction", index: 7 },
  { name: "NominationPools", index: 8 },
];

describe("fetchProxyContext", () => {
  it("returns proxyTypes and tokenMeta", async () => {
    const client = createMockDedotClient();

    const result = await fetchProxyContext(client, "polkadot", tokenMeta);

    expect(result.type).toBe("proxy");
    expect(result.proxyTypes).toBeDefined();
    expect(result.tokenSymbol).toBe("DOT");
    expect(result.tokenDecimals).toBe(10);
  });

  it("extracts proxy types from metadata enum with matching variants", async () => {
    const client = createMockDedotClient({
      metadata: {
        pallets: [
          {
            name: "Proxy",
            calls: { type: 1 },
          },
        ],
        types: [
          {
            type: {
              def: {
                Variant: {
                  variants: [
                    { name: "Any", index: 0 },
                    { name: "NonTransfer", index: 1 },
                    { name: "Governance", index: 2 },
                    { name: "Custom", index: 3 },
                  ],
                },
              },
            },
          },
        ],
      },
    });

    const result = await fetchProxyContext(client, "polkadot", tokenMeta);

    expect(result.proxyTypes).toHaveLength(4);
    expect(result.proxyTypes[0]).toEqual({ name: "Any", index: 0 });
    expect(result.proxyTypes[1]).toEqual({ name: "NonTransfer", index: 1 });
    expect(result.proxyTypes[2]).toEqual({ name: "Governance", index: 2 });
    expect(result.proxyTypes[3]).toEqual({ name: "Custom", index: 3 });
  });

  it("returns defaults when no Proxy pallet in metadata", async () => {
    const client = createMockDedotClient({
      metadata: {
        pallets: [{ name: "System", calls: {} }],
        types: [],
      },
    });

    const result = await fetchProxyContext(client, "polkadot", tokenMeta);

    expect(result.proxyTypes).toEqual(DEFAULT_PROXY_TYPES);
  });

  it("returns defaults when metadata is null", async () => {
    const client = createMockDedotClient({ metadata: null });

    const result = await fetchProxyContext(client, "polkadot", tokenMeta);

    expect(result.proxyTypes).toEqual(DEFAULT_PROXY_TYPES);
  });

  it("returns defaults when Proxy pallet has no calls", async () => {
    const client = createMockDedotClient({
      metadata: {
        pallets: [{ name: "Proxy" }],
        types: [],
      },
    });

    const result = await fetchProxyContext(client, "polkadot", tokenMeta);

    expect(result.proxyTypes).toEqual(DEFAULT_PROXY_TYPES);
  });

  it("returns defaults when metadata walk throws", async () => {
    const client = createMockDedotClient({
      metadata: {
        get pallets(): any {
          throw new Error("corrupt metadata");
        },
      },
    });

    const result = await fetchProxyContext(client, "polkadot", tokenMeta);

    expect(result.proxyTypes).toEqual(DEFAULT_PROXY_TYPES);
  });

  it("returns defaults when no enum matches proxy type pattern", async () => {
    const client = createMockDedotClient({
      metadata: {
        pallets: [{ name: "Proxy", calls: { type: 1 } }],
        types: [
          {
            type: {
              def: {
                Variant: {
                  variants: [
                    { name: "Foo", index: 0 },
                    { name: "Bar", index: 1 },
                  ],
                },
              },
            },
          },
        ],
      },
    });

    const result = await fetchProxyContext(client, "polkadot", tokenMeta);

    expect(result.proxyTypes).toEqual(DEFAULT_PROXY_TYPES);
  });

  it("default proxy types include standard types", async () => {
    const client = createMockDedotClient({ metadata: null });

    const result = await fetchProxyContext(client, "polkadot", tokenMeta);

    const names = result.proxyTypes.map((t: any) => t.name);
    expect(names).toContain("Any");
    expect(names).toContain("NonTransfer");
    expect(names).toContain("Governance");
    expect(names).toContain("Staking");
  });
});
