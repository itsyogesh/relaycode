jest.mock("../../../../env.mjs", () => ({ env: {} }));

jest.mock("lucide-react", () => ({
  Check: () => <span data-testid="check-icon" />,
  ChevronsUpDown: () => <span data-testid="chevrons-icon" />,
}));

jest.mock("@polkadot/ui-shared", () => ({
  polkadotIcon: jest.fn().mockReturnValue([]),
}));

import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import {
  AccountCombobox,
  type AccountOption,
} from "../../../../components/params/inputs/account-combobox";

const ALICE = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
const BOB = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";
const CHARLIE = "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y";

const defaultProps = {
  onChange: jest.fn(),
  accounts: [] as AccountOption[],
  recentAddresses: [] as string[],
  ss58Prefix: 0,
  formatAddress: (addr: string) => addr,
  isValidAddress: (_addr: string) => true,
  truncateAddress: (addr: string) =>
    addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-6)}` : addr,
};

describe("AccountCombobox", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the combobox trigger button", () => {
    render(<AccountCombobox {...defaultProps} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeInTheDocument();
  });

  it("shows placeholder when no value is selected", () => {
    render(
      <AccountCombobox {...defaultProps} placeholder="Pick an account..." />
    );
    expect(screen.getByText("Pick an account...")).toBeInTheDocument();
  });

  it("shows default placeholder text", () => {
    render(<AccountCombobox {...defaultProps} />);
    expect(screen.getByText("Select an account...")).toBeInTheDocument();
  });

  it("displays truncated address when a value is set", () => {
    render(<AccountCombobox {...defaultProps} value={ALICE} />);
    // The truncated ALICE address should be visible
    const truncated = `${ALICE.slice(0, 6)}...${ALICE.slice(-6)}`;
    expect(screen.getByText(truncated)).toBeInTheDocument();
  });

  it("displays account name with truncated address when value matches a named account", () => {
    const accounts: AccountOption[] = [
      { address: ALICE, name: "Alice" },
    ];
    render(
      <AccountCombobox {...defaultProps} accounts={accounts} value={ALICE} />
    );
    const truncated = `${ALICE.slice(0, 6)}...${ALICE.slice(-6)}`;
    expect(screen.getByText(`Alice (${truncated})`)).toBeInTheDocument();
  });

  it("shows connected accounts section (My Accounts) when popover is open", () => {
    const accounts: AccountOption[] = [
      { address: ALICE, name: "Alice" },
      { address: BOB, name: "Bob" },
    ];
    render(<AccountCombobox {...defaultProps} accounts={accounts} />);
    // Open popover
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("My Accounts")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("calls onChange when selecting an account", () => {
    const onChange = jest.fn();
    const accounts: AccountOption[] = [
      { address: ALICE, name: "Alice" },
    ];
    render(
      <AccountCombobox {...defaultProps} accounts={accounts} onChange={onChange} />
    );
    // Open popover
    fireEvent.click(screen.getByRole("combobox"));
    // Click on Alice
    fireEvent.click(screen.getByText("Alice"));
    expect(onChange).toHaveBeenCalledWith(ALICE);
  });

  it("shows Recently Used section for recent addresses", () => {
    render(
      <AccountCombobox
        {...defaultProps}
        recentAddresses={[CHARLIE]}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("Recently Used")).toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    render(<AccountCombobox {...defaultProps} disabled />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDisabled();
  });

  it("shows 'No accounts available' when no accounts, no recent, no typed address", () => {
    render(<AccountCombobox {...defaultProps} />);
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("No accounts available")).toBeInTheDocument();
  });
});
