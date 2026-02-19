jest.mock("../../../../env.mjs", () => ({ env: {} }));

jest.mock("../../../../hooks/use-wallet-safe", () => ({
  useSafeAccount: jest.fn().mockReturnValue({ address: undefined }),
  useSafeAccounts: jest.fn().mockReturnValue({ accounts: [] }),
  useSafeBalance: jest.fn().mockReturnValue({
    free: undefined,
    transferable: undefined,
    formattedTransferable: undefined,
  }),
}));

jest.mock("../../../../hooks/use-ss58", () => ({
  useSS58: jest.fn().mockReturnValue({
    ss58Prefix: 0,
    formatAddress: (addr: string) => addr,
    isValidAddress: () => true,
    truncateAddress: (addr: string) =>
      addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-6)}` : addr,
  }),
}));

jest.mock("../../../../hooks/use-recent-addresses", () => ({
  useRecentAddresses: jest.fn().mockReturnValue({
    recentAddresses: [],
    addRecent: jest.fn(),
    clearRecent: jest.fn(),
  }),
}));

jest.mock("../../../../components/ui/form", () => ({
  FormDescription: ({ children }: any) => (
    <p data-testid="form-description">{children}</p>
  ),
}));

// Mock the AccountCombobox since we test that separately
jest.mock("../../../../components/params/inputs/account-combobox", () => ({
  AccountCombobox: ({
    value,
    onChange,
    accounts,
    recentAddresses,
    placeholder,
    disabled,
  }: any) => (
    <div data-testid="account-combobox">
      <span data-testid="combobox-value">{value ?? ""}</span>
      <span data-testid="combobox-placeholder">{placeholder}</span>
      <span data-testid="combobox-disabled">{String(!!disabled)}</span>
      <span data-testid="combobox-accounts">{JSON.stringify(accounts)}</span>
      <span data-testid="combobox-recent">
        {JSON.stringify(recentAddresses)}
      </span>
      <button
        data-testid="combobox-select"
        onClick={() => onChange("5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty")}
      />
      <button data-testid="combobox-clear" onClick={() => onChange(undefined)} />
    </div>
  ),
}));

jest.mock("dedot/utils", () => ({
  decodeAddress: jest.fn().mockReturnValue(new Uint8Array(32)),
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Account } from "../../../../components/params/inputs/account";
import { useSafeAccounts } from "../../../../hooks/use-wallet-safe";
import { useSS58 } from "../../../../hooks/use-ss58";
import { useRecentAddresses } from "../../../../hooks/use-recent-addresses";

const ALICE = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
const BOB = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";

const baseProps = {
  name: "dest",
  label: "Destination",
  client: {} as any,
};

describe("Account", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders label and AccountCombobox", () => {
    render(<Account {...baseProps} />);
    expect(screen.getByText("Destination")).toBeInTheDocument();
    expect(screen.getByTestId("account-combobox")).toBeInTheDocument();
  });

  it("shows required asterisk when isRequired is true", () => {
    render(<Account {...baseProps} isRequired />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("passes connected accounts to combobox", () => {
    (useSafeAccounts as jest.Mock).mockReturnValue({
      accounts: [
        { address: ALICE, name: "Alice" },
        { address: BOB, name: "Bob" },
      ],
    });
    render(<Account {...baseProps} />);
    const accountsEl = screen.getByTestId("combobox-accounts");
    const accounts = JSON.parse(accountsEl.textContent!);
    expect(accounts).toHaveLength(2);
    expect(accounts[0].name).toBe("Alice");
    expect(accounts[1].name).toBe("Bob");
  });

  it("passes recent addresses to combobox", () => {
    (useRecentAddresses as jest.Mock).mockReturnValue({
      recentAddresses: [{ address: BOB, timestamp: 12345 }],
      addRecent: jest.fn(),
      clearRecent: jest.fn(),
    });
    render(<Account {...baseProps} />);
    const recentEl = screen.getByTestId("combobox-recent");
    const recent = JSON.parse(recentEl.textContent!);
    expect(recent).toEqual([BOB]);
  });

  it("calls onChange with formatted address on selection", () => {
    const onChange = jest.fn();
    (useSS58 as jest.Mock).mockReturnValue({
      ss58Prefix: 0,
      formatAddress: (addr: string) => addr,
      isValidAddress: () => true,
      truncateAddress: (addr: string) =>
        addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-6)}` : addr,
    });
    render(<Account {...baseProps} onChange={onChange} />);
    fireEvent.click(screen.getByTestId("combobox-select"));
    expect(onChange).toHaveBeenCalledWith(BOB);
  });

  it("adds non-connected address to recent list", () => {
    const addRecent = jest.fn();
    (useSafeAccounts as jest.Mock).mockReturnValue({ accounts: [] });
    (useRecentAddresses as jest.Mock).mockReturnValue({
      recentAddresses: [],
      addRecent,
      clearRecent: jest.fn(),
    });
    (useSS58 as jest.Mock).mockReturnValue({
      ss58Prefix: 0,
      formatAddress: (addr: string) => addr,
      isValidAddress: () => true,
      truncateAddress: (addr: string) =>
        addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-6)}` : addr,
    });
    const onChange = jest.fn();
    render(<Account {...baseProps} onChange={onChange} />);
    fireEvent.click(screen.getByTestId("combobox-select"));
    expect(addRecent).toHaveBeenCalledWith(BOB);
  });

  it("does NOT add connected account address to recent list", () => {
    const addRecent = jest.fn();
    (useSafeAccounts as jest.Mock).mockReturnValue({
      accounts: [{ address: BOB, name: "Bob" }],
    });
    (useRecentAddresses as jest.Mock).mockReturnValue({
      recentAddresses: [],
      addRecent,
      clearRecent: jest.fn(),
    });
    (useSS58 as jest.Mock).mockReturnValue({
      ss58Prefix: 0,
      formatAddress: (addr: string) => addr,
      isValidAddress: () => true,
      truncateAddress: (addr: string) =>
        addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-6)}` : addr,
    });
    const onChange = jest.fn();
    render(<Account {...baseProps} onChange={onChange} />);
    fireEvent.click(screen.getByTestId("combobox-select"));
    expect(addRecent).not.toHaveBeenCalled();
  });

  it("shows description when provided", () => {
    render(<Account {...baseProps} description="The target address" />);
    expect(screen.getByText("The target address")).toBeInTheDocument();
  });

  it("shows error when provided", () => {
    render(<Account {...baseProps} error="Invalid address" />);
    expect(screen.getByText("Invalid address")).toBeInTheDocument();
  });
});
