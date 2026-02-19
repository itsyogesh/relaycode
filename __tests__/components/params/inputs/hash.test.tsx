jest.mock("../../../../env.mjs", () => ({ env: {} }));

jest.mock("lucide-react", () => ({
  CheckCircle2: (props: any) => <span data-testid="check-icon" {...props} />,
  XCircle: (props: any) => <span data-testid="x-icon" {...props} />,
}));

// FormDescription uses useFormField which needs react-hook-form context.
// Mock the form module to render a simple <p> instead.
jest.mock("../../../../components/ui/form", () => ({
  FormDescription: ({ children, ...props }: any) => <p {...props}>{children}</p>,
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { HashInput, Hash160, Hash256, Hash512 } from "../../../../components/params/inputs/hash";

const baseProps = {
  name: "testHash",
  client: {} as any,
};

describe("HashInput", () => {
  it("renders label and hex input", () => {
    render(<HashInput {...baseProps} label="Block Hash" />);
    expect(screen.getByText("Block Hash")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders required asterisk when isRequired", () => {
    render(<HashInput {...baseProps} label="Hash" isRequired />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<HashInput {...baseProps} label="Hash" description="Enter a hash" />);
    expect(screen.getByText("Enter a hash")).toBeInTheDocument();
  });

  it("renders error when provided", () => {
    render(<HashInput {...baseProps} label="Hash" error="Invalid hash" />);
    expect(screen.getByText("Invalid hash")).toBeInTheDocument();
  });

  // ─── Hash length expectations ──────────────────────────────────────────

  it("Hash160: validates 20-byte (40 hex char) input", () => {
    const onChange = jest.fn();
    render(<Hash160 {...baseProps} label="H160" onChange={onChange} />);
    const input = screen.getByRole("textbox");
    // Valid H160: 0x + 40 hex chars
    fireEvent.change(input, {
      target: { value: "0x" + "ab".repeat(20) },
    });
    expect(onChange).toHaveBeenCalledWith("0x" + "ab".repeat(20));
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
  });

  it("Hash256: validates 32-byte (64 hex char) input", () => {
    const onChange = jest.fn();
    render(<Hash256 {...baseProps} label="H256" onChange={onChange} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, {
      target: { value: "0x" + "ab".repeat(32) },
    });
    expect(onChange).toHaveBeenCalledWith("0x" + "ab".repeat(32));
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
  });

  it("Hash512: validates 64-byte (128 hex char) input", () => {
    const onChange = jest.fn();
    render(<Hash512 {...baseProps} label="H512" onChange={onChange} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, {
      target: { value: "0x" + "ab".repeat(64) },
    });
    expect(onChange).toHaveBeenCalledWith("0x" + "ab".repeat(64));
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
  });

  // ─── Validation icons ──────────────────────────────────────────────────

  it("shows green check icon for valid hex of correct length", () => {
    render(<Hash256 {...baseProps} label="H256" />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, {
      target: { value: "0x" + "a1".repeat(32) },
    });
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("x-icon")).not.toBeInTheDocument();
  });

  it("shows red X icon for invalid hex", () => {
    render(<Hash256 {...baseProps} label="H256" />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, {
      target: { value: "0xinvalid" },
    });
    expect(screen.getByTestId("x-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("check-icon")).not.toBeInTheDocument();
  });

  it("shows no validation icon when empty", () => {
    render(<Hash256 {...baseProps} label="H256" />);
    expect(screen.queryByTestId("check-icon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("x-icon")).not.toBeInTheDocument();
  });

  // ─── Paste handling ────────────────────────────────────────────────────

  it("auto-prefixes 0x on paste of raw hex", () => {
    const onChange = jest.fn();
    render(<Hash256 {...baseProps} label="H256" onChange={onChange} />);
    const input = screen.getByRole("textbox");
    // Paste raw hex without 0x prefix
    const rawHex = "ab".repeat(32);
    fireEvent.paste(input, {
      clipboardData: { getData: () => rawHex },
    });
    expect(onChange).toHaveBeenCalledWith("0x" + rawHex);
  });

  // ─── onChange behavior ─────────────────────────────────────────────────

  it("calls onChange with lowercased trimmed value", () => {
    const onChange = jest.fn();
    render(<Hash256 {...baseProps} label="H256" onChange={onChange} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, {
      target: { value: "  0xABCDEF  " },
    });
    expect(onChange).toHaveBeenCalledWith("0xabcdef");
  });

  it("calls onChange with undefined when input is cleared", () => {
    const onChange = jest.fn();
    render(<Hash256 {...baseProps} label="H256" onChange={onChange} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "0xabc" } });
    fireEvent.change(input, { target: { value: "" } });
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  // ─── External value sync ───────────────────────────────────────────────

  it("syncs display value from external value prop", () => {
    const { rerender } = render(
      <Hash256 {...baseProps} label="H256" value={undefined} />
    );
    const validHash = "0x" + "ab".repeat(32);
    rerender(<Hash256 {...baseProps} label="H256" value={validHash} />);
    expect(screen.getByRole("textbox")).toHaveValue(validHash);
  });

  // ─── detectHashType ────────────────────────────────────────────────────

  it("detects H160 from typeName containing H160", () => {
    render(<HashInput {...baseProps} label="Hash" typeName="sp_core::H160" />);
    const input = screen.getByRole("textbox");
    // H160 placeholder has 40 hex chars
    expect(input).toHaveAttribute(
      "placeholder",
      "0x1234567890abcdef1234567890abcdef12345678"
    );
  });

  it("detects H512 from typeName containing H512", () => {
    render(<HashInput {...baseProps} label="Hash" typeName="sp_core::H512" />);
    const input = screen.getByRole("textbox");
    // H512 placeholder has 128 hex chars
    expect(input.getAttribute("placeholder")!.length).toBe(2 + 128); // 0x + 128 hex chars
  });

  it("defaults to H256 when typeName has no recognized hash type", () => {
    render(<HashInput {...baseProps} label="Hash" typeName="SomeOtherType" />);
    const input = screen.getByRole("textbox");
    // H256 placeholder has 64 hex chars
    expect(input.getAttribute("placeholder")!.length).toBe(2 + 64); // 0x + 64 hex chars
  });
});
