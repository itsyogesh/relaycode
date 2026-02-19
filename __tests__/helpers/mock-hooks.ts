/**
 * Centralized mock setup functions for wallet/chain hooks.
 * Call these in beforeEach() to set up jest.mock return values.
 */

// ─── Wallet Mocks ───────────────────────────────────────────────────────────

const DEFAULT_ADDRESS = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"; // Alice

export function setupWalletMocks(overrides?: {
  address?: string;
  accounts?: Array<{ address: string; name?: string }>;
  free?: bigint;
  transferable?: bigint;
  formattedTransferable?: string;
}) {
  const address = overrides?.address ?? DEFAULT_ADDRESS;
  const accounts = overrides?.accounts ?? [
    { address, name: "Alice" },
  ];
  const free = overrides?.free ?? BigInt("10000000000000");
  const transferable = overrides?.transferable ?? BigInt("9000000000000");
  const formattedTransferable =
    overrides?.formattedTransferable ?? "900.0000 DOT";

  const mocks = {
    useSafeAccount: jest.fn().mockReturnValue({ address }),
    useSafeAccounts: jest.fn().mockReturnValue({ accounts }),
    useSafeBalance: jest.fn().mockReturnValue({
      free,
      transferable,
      formattedTransferable,
    }),
  };

  return mocks;
}

// ─── Chain Token Mock ───────────────────────────────────────────────────────

export function setupChainTokenMock(overrides?: {
  symbol?: string;
  decimals?: number;
  loading?: boolean;
  existentialDeposit?: bigint;
  denominations?: Array<{ label: string; decimals: number }>;
}) {
  return {
    useChainToken: jest.fn().mockReturnValue({
      symbol: overrides?.symbol ?? "DOT",
      decimals: overrides?.decimals ?? 10,
      loading: overrides?.loading ?? false,
      existentialDeposit:
        overrides?.existentialDeposit ?? BigInt("10000000000"),
      denominations: overrides?.denominations ?? [
        { label: "DOT", decimals: 10 },
        { label: "Planck", decimals: 0 },
      ],
    }),
  };
}

// ─── SS58 Mock ──────────────────────────────────────────────────────────────

export function setupSS58Mock(overrides?: {
  ss58Prefix?: number;
  formatAddress?: (address: string) => string | null;
  isValidAddress?: (address: string) => boolean;
  truncateAddress?: (address: string) => string;
}) {
  return {
    useSS58: jest.fn().mockReturnValue({
      ss58Prefix: overrides?.ss58Prefix ?? 0,
      formatAddress:
        overrides?.formatAddress ?? ((addr: string) => addr),
      isValidAddress:
        overrides?.isValidAddress ?? (() => true),
      truncateAddress:
        overrides?.truncateAddress ??
        ((addr: string) =>
          addr.length > 12
            ? `${addr.slice(0, 6)}...${addr.slice(-6)}`
            : addr),
    }),
  };
}

// ─── Recent Addresses Mock ──────────────────────────────────────────────────

export function setupRecentAddressesMock(overrides?: {
  recentAddresses?: Array<{ address: string; timestamp: number }>;
  addRecent?: jest.Mock;
  clearRecent?: jest.Mock;
}) {
  return {
    useRecentAddresses: jest.fn().mockReturnValue({
      recentAddresses: overrides?.recentAddresses ?? [],
      addRecent: overrides?.addRecent ?? jest.fn(),
      clearRecent: overrides?.clearRecent ?? jest.fn(),
    }),
  };
}
