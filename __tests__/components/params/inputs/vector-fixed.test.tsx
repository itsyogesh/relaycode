jest.mock("../../../../env.mjs", () => ({ env: {} }));

jest.mock("../../../../components/ui/form", () => ({
  FormDescription: ({ children }: any) => (
    <p data-testid="form-description">{children}</p>
  ),
}));

// Mock findComponent to return a simple text input
jest.mock("../../../../lib/input-map", () => ({
  findComponent: jest.fn().mockReturnValue({
    component: ({ name, label, value, onChange }: any) => (
      <div data-testid={`mock-input-${name}`}>
        <span>{label}</span>
        <input
          data-testid={`mock-input-field-${name}`}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </div>
    ),
    schema: { parse: (v: any) => v },
  }),
}));

jest.mock("../../../../lib/byte-utils", () => ({
  bytesToHex: jest.fn().mockImplementation((bytes: Uint8Array) => {
    if (bytes.length === 0) return "";
    return (
      "0x" +
      Array.from(bytes, (b: number) => b.toString(16).padStart(2, "0")).join("")
    );
  }),
  hexToBytes: jest.fn().mockImplementation((hex: string) => {
    const stripped = hex.startsWith("0x") ? hex.slice(2) : hex;
    if (stripped.length === 0) return new Uint8Array(0);
    if (stripped.length % 2 !== 0) return null;
    if (!/^[0-9a-fA-F]+$/.test(stripped)) return null;
    const bytes = new Uint8Array(stripped.length / 2);
    for (let i = 0; i < stripped.length; i += 2) {
      bytes[i / 2] = parseInt(stripped.slice(i, i + 2), 16);
    }
    return bytes;
  }),
  base64ToBytes: jest.fn().mockImplementation((b64: string) => {
    try {
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    } catch {
      return null;
    }
  }),
  bytesToBase64: jest.fn().mockImplementation((bytes: Uint8Array) => {
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }),
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { VectorFixed } from "../../../../components/params/inputs/vector-fixed";

const baseProps = {
  name: "fixedArr",
  label: "Fixed Array",
  client: null as any,
  typeId: 100,
};

describe("VectorFixed", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows 'Unable to resolve' message when length is 0", () => {
    render(<VectorFixed {...baseProps} typeName="[u8; 0]" />);
    expect(
      screen.getByText("Unable to resolve fixed array structure")
    ).toBeInTheDocument();
  });

  it("shows 'Unable to resolve' when typeName is missing and no client", () => {
    render(<VectorFixed {...baseProps} typeName="" />);
    expect(
      screen.getByText("Unable to resolve fixed array structure")
    ).toBeInTheDocument();
  });

  it("renders hex input for u8 array (byte array mode)", () => {
    render(<VectorFixed {...baseProps} typeName="[u8; 32]" />);
    expect(screen.getByText("(32 bytes)")).toBeInTheDocument();
    expect(screen.getByText("Hex")).toBeInTheDocument();
    expect(screen.getByText("Base64")).toBeInTheDocument();
  });

  it("validates byte count for u8 array", () => {
    const onChange = jest.fn();
    render(
      <VectorFixed {...baseProps} typeName="[u8; 4]" onChange={onChange} />
    );
    const input = screen.getByPlaceholderText(/hex chars/);
    // Enter 2 bytes instead of 4
    fireEvent.change(input, { target: { value: "0xabcd" } });
    expect(screen.getByText("Expected 4 bytes, got 2")).toBeInTheDocument();
  });

  it("emits correct array for valid u8 hex input", () => {
    const onChange = jest.fn();
    render(
      <VectorFixed {...baseProps} typeName="[u8; 2]" onChange={onChange} />
    );
    const input = screen.getByPlaceholderText(/hex chars/);
    fireEvent.change(input, { target: { value: "0xabcd" } });
    // Should emit [0xab, 0xcd] = [171, 205]
    expect(onChange).toHaveBeenCalledWith([171, 205]);
  });

  it("shows invalid hex error for bad hex input", () => {
    render(<VectorFixed {...baseProps} typeName="[u8; 4]" />);
    const input = screen.getByPlaceholderText(/hex chars/);
    fireEvent.change(input, { target: { value: "0xgggg" } });
    expect(screen.getByText("Invalid hex string")).toBeInTheDocument();
  });

  it("switches to base64 mode", () => {
    render(<VectorFixed {...baseProps} typeName="[u8; 4]" />);
    fireEvent.click(screen.getByText("Base64"));
    expect(screen.getByPlaceholderText(/Base64 string/)).toBeInTheDocument();
  });

  it("validates base64 byte length", () => {
    render(<VectorFixed {...baseProps} typeName="[u8; 4]" />);
    fireEvent.click(screen.getByText("Base64"));
    const input = screen.getByPlaceholderText(/Base64 string/);
    // "YQ==" decodes to 1 byte ("a"), but we need 4
    fireEvent.change(input, { target: { value: "YQ==" } });
    expect(screen.getByText("Expected 4 bytes, got 1")).toBeInTheDocument();
  });

  it("renders per-element inputs for non-u8 types", () => {
    render(<VectorFixed {...baseProps} typeName="[u32; 3]" />);
    expect(screen.getByText("(3 elements)")).toBeInTheDocument();
    // Should render 3 mock sub-inputs
    expect(screen.getByTestId("mock-input-fixedArr-0")).toBeInTheDocument();
    expect(screen.getByTestId("mock-input-fixedArr-1")).toBeInTheDocument();
    expect(screen.getByTestId("mock-input-fixedArr-2")).toBeInTheDocument();
  });

  it("calls onChange when per-element value changes", () => {
    const onChange = jest.fn();
    render(
      <VectorFixed {...baseProps} typeName="[u32; 2]" onChange={onChange} />
    );
    const input0 = screen.getByTestId("mock-input-field-fixedArr-0");
    fireEvent.change(input0, { target: { value: "42" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("shows external error", () => {
    render(
      <VectorFixed {...baseProps} typeName="[u8; 32]" error="Hash required" />
    );
    expect(screen.getByText("Hash required")).toBeInTheDocument();
  });
});
