jest.mock("../../../../env.mjs", () => ({ env: {} }));

const mockUseChainToken = jest.fn().mockReturnValue({
  symbol: "DOT",
  decimals: 10,
  loading: false,
  existentialDeposit: BigInt("10000000000"),
  denominations: [
    { label: "DOT", multiplier: BigInt(10) ** BigInt(10), maxDecimals: 10 },
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
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Amount } from "../../../../components/params/inputs/amount";

const baseProps = {
  name: "value",
  label: "Value",
  client: {} as any,
};

describe("Amount", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseChainToken.mockReturnValue({
      symbol: "DOT",
      decimals: 10,
      loading: false,
      existentialDeposit: BigInt("10000000000"),
      denominations: [
        { label: "DOT", multiplier: BigInt(10) ** BigInt(10), maxDecimals: 10 },
        { label: "planck", multiplier: BigInt(1), maxDecimals: 0 },
      ],
    });
  });

  it("renders label and input", () => {
    render(<Amount {...baseProps} typeName="u32" />);
    expect(screen.getByText("Value")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("0")).toBeInTheDocument();
  });

  it("shows required asterisk when isRequired is true", () => {
    render(<Amount {...baseProps} typeName="u32" isRequired />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("calls onChange with numeric value for plain input", () => {
    const onChange = jest.fn();
    render(<Amount {...baseProps} typeName="u32" onChange={onChange} />);
    const input = screen.getByPlaceholderText("0");
    fireEvent.change(input, { target: { value: "42" } });
    expect(onChange).toHaveBeenCalledWith("42");
  });

  it("shows NaN validation error for non-numeric input", () => {
    const onChange = jest.fn();
    render(<Amount {...baseProps} typeName="u32" onChange={onChange} />);
    const input = screen.getByPlaceholderText("0");
    fireEvent.change(input, { target: { value: "abc" } });
    expect(screen.getByText("Invalid number")).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("displays range text for u8", () => {
    render(<Amount {...baseProps} typeName="u8" />);
    expect(screen.getByText("Range: 0 \u2014 255")).toBeInTheDocument();
  });

  it("displays range text for i8", () => {
    render(<Amount {...baseProps} typeName="i8" />);
    expect(screen.getByText("Range: -128 \u2014 127")).toBeInTheDocument();
  });

  it("displays range text for u32", () => {
    render(<Amount {...baseProps} typeName="u32" />);
    expect(screen.getByText("Range: 0 \u2014 4294967295")).toBeInTheDocument();
  });

  it("shows range validation error when value exceeds u8 max", () => {
    const onChange = jest.fn();
    render(<Amount {...baseProps} typeName="u8" onChange={onChange} />);
    const input = screen.getByPlaceholderText("0");
    fireEvent.change(input, { target: { value: "256" } });
    expect(screen.getByText("Value above maximum")).toBeInTheDocument();
  });

  it("shows range validation error when value is below i8 min", () => {
    const onChange = jest.fn();
    render(<Amount {...baseProps} typeName="i8" onChange={onChange} />);
    const input = screen.getByPlaceholderText("0");
    fireEvent.change(input, { target: { value: "-129" } });
    expect(screen.getByText(/Value below minimum/)).toBeInTheDocument();
  });

  it("shows hex toggle for i128 type", () => {
    render(<Amount {...baseProps} typeName="i128" />);
    expect(screen.getByText("Dec")).toBeInTheDocument();
    expect(screen.getByText("Hex")).toBeInTheDocument();
  });

  it("does NOT show hex toggle for u32 type", () => {
    render(<Amount {...baseProps} typeName="u32" />);
    expect(screen.queryByText("Dec")).not.toBeInTheDocument();
    expect(screen.queryByText("Hex")).not.toBeInTheDocument();
  });

  it("switches to hex mode and shows hex placeholder", () => {
    render(<Amount {...baseProps} typeName="i128" />);
    fireEvent.click(screen.getByText("Hex"));
    expect(screen.getByPlaceholderText("0x0")).toBeInTheDocument();
  });

  it("converts existing decimal value to hex when switching modes", () => {
    const onChange = jest.fn();
    render(<Amount {...baseProps} typeName="i128" onChange={onChange} />);
    const input = screen.getByPlaceholderText("0");
    fireEvent.change(input, { target: { value: "255" } });
    // Switch to hex mode
    fireEvent.click(screen.getByText("Hex"));
    // The input should show hex value
    const hexInput = screen.getByPlaceholderText("0x0");
    expect(hexInput).toHaveValue("0xff");
  });

  it("uses denominated mode for u128 Balance-like typeName", () => {
    render(<Amount {...baseProps} typeName="u128" />);
    // u128 is in BALANCE_LIKE_TYPES - should show denomination selector
    expect(screen.getByText("DOT")).toBeInTheDocument();
  });

  it("shows description when provided", () => {
    render(
      <Amount {...baseProps} typeName="u32" description="An integer value" />
    );
    expect(screen.getByText("An integer value")).toBeInTheDocument();
  });

  it("shows external error", () => {
    render(<Amount {...baseProps} typeName="u32" error="Out of range" />);
    expect(screen.getByText("Out of range")).toBeInTheDocument();
  });

  it("calls onChange with undefined when input is cleared", () => {
    const onChange = jest.fn();
    render(<Amount {...baseProps} typeName="u32" onChange={onChange} />);
    const input = screen.getByPlaceholderText("0");
    fireEvent.change(input, { target: { value: "42" } });
    fireEvent.change(input, { target: { value: "" } });
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });
});
