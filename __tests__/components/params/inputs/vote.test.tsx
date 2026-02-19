jest.mock("../../../../env.mjs", () => ({ env: {} }));

jest.mock("lucide-react", () => ({
  ThumbsUp: () => <span data-testid="thumbs-up" />,
  ThumbsDown: () => <span data-testid="thumbs-down" />,
}));

jest.mock("../../../../components/ui/form", () => ({
  FormDescription: ({ children }: any) => (
    <p data-testid="form-description">{children}</p>
  ),
}));

jest.mock("../../../../hooks/use-chain-token", () => ({
  useChainToken: jest.fn().mockReturnValue({
    symbol: "DOT",
    decimals: 10,
    loading: false,
    existentialDeposit: BigInt("10000000000"),
    denominations: [
      { label: "DOT", multiplier: BigInt(10) ** BigInt(10), maxDecimals: 10 },
      { label: "planck", multiplier: BigInt(1), maxDecimals: 0 },
    ],
  }),
}));

jest.mock("../../../../hooks/use-wallet-safe", () => ({
  useSafeAccount: jest.fn().mockReturnValue({ address: undefined }),
  useSafeBalance: jest.fn().mockReturnValue({
    free: undefined,
    transferable: undefined,
    formattedTransferable: undefined,
  }),
}));

// Mock Balance component used internally by Vote
jest.mock("../../../../components/params/inputs/balance", () => ({
  Balance: ({ name, onChange, label }: any) => (
    <div data-testid={`balance-${name}`}>
      <span>{label}</span>
      <input
        data-testid={`balance-input-${name}`}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  ),
}));

import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Vote } from "../../../../components/params/inputs/vote";

const baseProps = {
  name: "vote",
  label: "Vote",
  client: {} as any,
};

describe("Vote", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders label and vote mode selector", () => {
    render(<Vote {...baseProps} />);
    expect(screen.getByText("Vote")).toBeInTheDocument();
  });

  it("shows Standard mode by default with Aye/Nay buttons", () => {
    render(<Vote {...baseProps} />);
    expect(screen.getByText("Aye")).toBeInTheDocument();
    expect(screen.getByText("Nay")).toBeInTheDocument();
  });

  it("shows conviction selector in Standard mode", () => {
    render(<Vote {...baseProps} />);
    expect(screen.getByText("Conviction")).toBeInTheDocument();
    expect(
      screen.getByText("None (0.1x voting power)")
    ).toBeInTheDocument();
  });

  it("shows Balance input in Standard mode", () => {
    render(<Vote {...baseProps} />);
    expect(screen.getByTestId("balance-vote-balance")).toBeInTheDocument();
    expect(screen.getByText("Balance")).toBeInTheDocument();
  });

  it("emits Standard vote with aye direction by default", () => {
    const onChange = jest.fn();
    render(<Vote {...baseProps} onChange={onChange} />);
    // The effect runs on mount and emits
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "Standard",
        value: expect.objectContaining({
          vote: 0x80, // aye with conviction 0 = 0x80 | 0
        }),
      })
    );
  });

  it("emits Standard vote with nay direction when Nay is clicked", () => {
    const onChange = jest.fn();
    render(<Vote {...baseProps} onChange={onChange} />);
    fireEvent.click(screen.getByText("Nay"));
    // Should emit with nay vote byte (0x00 | conviction)
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.type).toBe("Standard");
    expect(lastCall.value.vote).toBe(0x00); // nay with conviction 0
  });

  it("encodes aye vote byte correctly: 0x80 | conviction", () => {
    const onChange = jest.fn();
    render(<Vote {...baseProps} onChange={onChange} />);
    // Default is aye with conviction 0 -> 0x80
    const initialCall = onChange.mock.calls.find(
      (call: any[]) => call[0]?.type === "Standard"
    );
    expect(initialCall).toBeTruthy();
    expect(initialCall![0].value.vote).toBe(0x80);
  });

  it("encodes nay vote byte correctly: 0x00 | conviction", () => {
    const onChange = jest.fn();
    render(<Vote {...baseProps} onChange={onChange} />);
    fireEvent.click(screen.getByText("Nay"));
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.value.vote).toBe(0x00);
  });

  it("updates balance value when balance input changes", () => {
    const onChange = jest.fn();
    render(<Vote {...baseProps} onChange={onChange} />);
    const balanceInput = screen.getByTestId("balance-input-vote-balance");
    fireEvent.change(balanceInput, { target: { value: "1000" } });
    // After balance change, the emitted value should include the balance
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.type).toBe("Standard");
    expect(lastCall.value.balance).toBe("1000");
  });

  it("shows Split mode with aye and nay balance inputs", () => {
    render(<Vote {...baseProps} />);
    // Switch to Split mode by clicking the mode selector
    fireEvent.click(screen.getByText("Standard"));
    fireEvent.click(screen.getByText("Split"));

    expect(screen.getByTestId("balance-vote-aye")).toBeInTheDocument();
    expect(screen.getByTestId("balance-vote-nay")).toBeInTheDocument();
    expect(screen.getByText("Aye balance")).toBeInTheDocument();
    expect(screen.getByText("Nay balance")).toBeInTheDocument();
  });

  it("emits Split vote values", () => {
    const onChange = jest.fn();
    render(<Vote {...baseProps} onChange={onChange} />);
    // Switch to Split mode
    fireEvent.click(screen.getByText("Standard"));
    fireEvent.click(screen.getByText("Split"));

    const ayeInput = screen.getByTestId("balance-input-vote-aye");
    fireEvent.change(ayeInput, { target: { value: "100" } });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.type).toBe("Split");
    expect(lastCall.value.aye).toBe("100");
  });

  it("shows SplitAbstain mode with aye, nay, and abstain balance inputs", () => {
    render(<Vote {...baseProps} />);
    fireEvent.click(screen.getByText("Standard"));
    fireEvent.click(screen.getByText("Split Abstain"));

    expect(screen.getByTestId("balance-vote-aye")).toBeInTheDocument();
    expect(screen.getByTestId("balance-vote-nay")).toBeInTheDocument();
    expect(screen.getByTestId("balance-vote-abstain")).toBeInTheDocument();
    expect(screen.getByText("Aye balance")).toBeInTheDocument();
    expect(screen.getByText("Nay balance")).toBeInTheDocument();
    expect(screen.getByText("Abstain balance")).toBeInTheDocument();
  });

  it("emits SplitAbstain vote values", () => {
    const onChange = jest.fn();
    render(<Vote {...baseProps} onChange={onChange} />);
    fireEvent.click(screen.getByText("Standard"));
    fireEvent.click(screen.getByText("Split Abstain"));

    const abstainInput = screen.getByTestId("balance-input-vote-abstain");
    fireEvent.change(abstainInput, { target: { value: "500" } });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.type).toBe("SplitAbstain");
    expect(lastCall.value.abstain).toBe("500");
  });

  it("shows description when provided", () => {
    render(<Vote {...baseProps} description="Your referendum vote" />);
    expect(screen.getByText("Your referendum vote")).toBeInTheDocument();
  });

  it("shows external error", () => {
    render(<Vote {...baseProps} error="Vote failed" />);
    expect(screen.getByText("Vote failed")).toBeInTheDocument();
  });
});
