jest.mock("../../../../env.mjs", () => ({ env: {} }));

const mockUseSafeAccount = jest.fn().mockReturnValue({ address: undefined });
const mockUseSafeBalance = jest.fn().mockReturnValue({
  free: undefined,
  transferable: undefined,
  formattedTransferable: undefined,
});

jest.mock("../../../../hooks/use-wallet-safe", () => ({
  useSafeAccount: (...args: any[]) => mockUseSafeAccount(...args),
  useSafeBalance: (...args: any[]) => mockUseSafeBalance(...args),
}));

const mockUseChainToken = jest.fn().mockReturnValue({
  symbol: "DOT",
  decimals: 10,
  loading: false,
  existentialDeposit: BigInt("10000000000"),
  denominations: [
    { label: "DOT", multiplier: BigInt(10) ** BigInt(10), maxDecimals: 10 },
    { label: "mDOT", multiplier: BigInt(10) ** BigInt(7), maxDecimals: 7 },
    { label: "planck", multiplier: BigInt(1), maxDecimals: 0 },
  ],
});

jest.mock("../../../../hooks/use-chain-token", () => ({
  useChainToken: (...args: any[]) => mockUseChainToken(...args),
}));

jest.mock("../../../../components/ui/form", () => ({
  FormDescription: ({ children }: any) => (
    <p data-testid="form-description">{children}</p>
  ),
}));

jest.mock("../../../../lib/paste-utils", () => ({
  stripNumericFormatting: jest.fn().mockImplementation((raw: string) => ({
    value: raw.trim(),
    transformed: false,
  })),
  detectPlanckPaste: jest.fn().mockReturnValue({ isPlanck: false }),
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Balance } from "../../../../components/params/inputs/balance";

const baseProps = {
  name: "amount",
  label: "Amount",
  client: {} as any,
};

describe("Balance", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseChainToken.mockReturnValue({
      symbol: "DOT",
      decimals: 10,
      loading: false,
      existentialDeposit: BigInt("10000000000"),
      denominations: [
        { label: "DOT", multiplier: BigInt(10) ** BigInt(10), maxDecimals: 10 },
        { label: "mDOT", multiplier: BigInt(10) ** BigInt(7), maxDecimals: 7 },
        { label: "planck", multiplier: BigInt(1), maxDecimals: 0 },
      ],
    });
    mockUseSafeAccount.mockReturnValue({ address: undefined });
    mockUseSafeBalance.mockReturnValue({
      free: undefined,
      transferable: undefined,
      formattedTransferable: undefined,
    });
  });

  it("renders label", () => {
    render(<Balance {...baseProps} />);
    expect(screen.getByText("Amount")).toBeInTheDocument();
  });

  it("shows required asterisk when isRequired is true", () => {
    render(<Balance {...baseProps} isRequired />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("disables input when loading", () => {
    mockUseChainToken.mockReturnValue({
      symbol: "DOT",
      decimals: 10,
      loading: true,
      existentialDeposit: BigInt("10000000000"),
      denominations: [
        { label: "DOT", multiplier: BigInt(10) ** BigInt(10), maxDecimals: 10 },
        { label: "planck", multiplier: BigInt(1), maxDecimals: 0 },
      ],
    });
    render(<Balance {...baseProps} />);
    const input = screen.getByPlaceholderText("0.00");
    expect(input).toBeDisabled();
  });

  it("shows denomination selector with DOT denomination options", () => {
    render(<Balance {...baseProps} />);
    // The DOT denomination should be displayed in the selector trigger
    expect(screen.getByText("DOT")).toBeInTheDocument();
  });

  it("calls onChange with planck value when user types a value", () => {
    const onChange = jest.fn();
    render(<Balance {...baseProps} onChange={onChange} />);
    const input = screen.getByPlaceholderText("0.00");
    fireEvent.change(input, { target: { value: "1" } });
    // 1 DOT = 10^10 planck = "10000000000"
    expect(onChange).toHaveBeenCalledWith("10000000000");
  });

  it("calls onChange with undefined when input is cleared", () => {
    const onChange = jest.fn();
    render(<Balance {...baseProps} onChange={onChange} />);
    const input = screen.getByPlaceholderText("0.00");
    fireEvent.change(input, { target: { value: "1" } });
    fireEvent.change(input, { target: { value: "" } });
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  it("shows validation error for invalid value", () => {
    const onChange = jest.fn();
    render(<Balance {...baseProps} onChange={onChange} />);
    const input = screen.getByPlaceholderText("0.00");
    // Invalid format triggers validation error
    fireEvent.change(input, { target: { value: "abc" } });
    expect(screen.getByText("Invalid value or excess precision")).toBeInTheDocument();
  });

  it("shows description when provided", () => {
    render(<Balance {...baseProps} description="Enter the transfer amount" />);
    expect(screen.getByText("Enter the transfer amount")).toBeInTheDocument();
  });

  it("shows external error", () => {
    render(<Balance {...baseProps} error="Balance too low" />);
    expect(screen.getByText("Balance too low")).toBeInTheDocument();
  });

  it("shows available balance and percentage buttons when wallet is connected", () => {
    mockUseSafeAccount.mockReturnValue({
      address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    });
    mockUseSafeBalance.mockReturnValue({
      free: BigInt("100000000000000"),
      transferable: BigInt("90000000000000"),
      formattedTransferable: "9000.0000 DOT",
    });
    render(<Balance {...baseProps} />);
    expect(screen.getByText(/Available:/)).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("Max")).toBeInTheDocument();
  });

  it("percentage buttons set correct value (50%)", () => {
    const onChange = jest.fn();
    mockUseSafeAccount.mockReturnValue({
      address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    });
    mockUseSafeBalance.mockReturnValue({
      free: BigInt("100000000000000"),
      transferable: BigInt("100000000000000"),
      formattedTransferable: "10000 DOT",
    });
    render(<Balance {...baseProps} onChange={onChange} />);
    fireEvent.click(screen.getByText("50%"));
    // 50% of 100000000000000 = 50000000000000
    expect(onChange).toHaveBeenCalledWith("50000000000000");
  });

  it("Max button subtracts existential deposit", () => {
    const onChange = jest.fn();
    mockUseSafeAccount.mockReturnValue({
      address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    });
    mockUseSafeBalance.mockReturnValue({
      free: BigInt("100000000000000"),
      transferable: BigInt("100000000000000"),
      formattedTransferable: "10000 DOT",
    });
    render(<Balance {...baseProps} onChange={onChange} />);
    fireEvent.click(screen.getByText("Max"));
    // Max: 100000000000000 - 10000000000 (ED) = 99990000000000
    expect(onChange).toHaveBeenCalledWith("99990000000000");
  });

  it("shows existential deposit warning when transfer would reap account", () => {
    mockUseSafeAccount.mockReturnValue({
      address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    });
    // Transferable is very small - just above ED
    mockUseSafeBalance.mockReturnValue({
      free: BigInt("15000000000"),
      transferable: BigInt("15000000000"),
      formattedTransferable: "1.5 DOT",
    });
    const onChange = jest.fn();
    render(<Balance {...baseProps} onChange={onChange} />);
    const input = screen.getByPlaceholderText("0.00");
    // Enter 1 DOT - remaining (0.5 DOT) < ED (1 DOT)
    fireEvent.change(input, { target: { value: "1" } });
    expect(screen.getByText(/Amount would reap account/)).toBeInTheDocument();
  });

  it("does not show percentage buttons when wallet is not connected", () => {
    render(<Balance {...baseProps} />);
    expect(screen.queryByText("25%")).not.toBeInTheDocument();
    expect(screen.queryByText("Max")).not.toBeInTheDocument();
  });
});
