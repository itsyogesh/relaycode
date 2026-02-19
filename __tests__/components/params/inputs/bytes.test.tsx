jest.mock("../../../../env.mjs", () => ({ env: {} }));

jest.mock("lucide-react", () => ({
  Upload: () => <span data-testid="upload-icon" />,
}));

jest.mock("../../../../components/ui/form", () => ({
  FormDescription: ({ children }: any) => (
    <p data-testid="form-description">{children}</p>
  ),
}));

jest.mock("dedot/utils", () => ({
  isHex: jest.fn().mockImplementation((val: string) => {
    if (!val) return false;
    return /^0x[0-9a-fA-F]*$/.test(val);
  }),
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Bytes } from "../../../../components/params/inputs/bytes";

const baseProps = {
  name: "data",
  label: "Data",
  client: {} as any,
};

describe("Bytes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders label and mode toggle buttons", () => {
    render(<Bytes {...baseProps} />);
    expect(screen.getByText("Data")).toBeInTheDocument();
    expect(screen.getByText("Hex")).toBeInTheDocument();
    expect(screen.getByText("Text")).toBeInTheDocument();
    expect(screen.getByText("JSON")).toBeInTheDocument();
    expect(screen.getByText("B64")).toBeInTheDocument();
    expect(screen.getByText("File")).toBeInTheDocument();
  });

  it("shows hex input by default", () => {
    render(<Bytes {...baseProps} />);
    expect(screen.getByPlaceholderText("0x1234abcd")).toBeInTheDocument();
  });

  it("auto-prepends 0x to hex input", () => {
    const onChange = jest.fn();
    render(<Bytes {...baseProps} onChange={onChange} />);
    const input = screen.getByPlaceholderText("0x1234abcd");
    fireEvent.change(input, { target: { value: "abcd" } });
    expect(input).toHaveValue("0xabcd");
    expect(onChange).toHaveBeenCalledWith("0xabcd");
  });

  it("emits hex value from hex input", () => {
    const onChange = jest.fn();
    render(<Bytes {...baseProps} onChange={onChange} />);
    const input = screen.getByPlaceholderText("0x1234abcd");
    fireEvent.change(input, { target: { value: "0x48656c6c6f" } });
    expect(onChange).toHaveBeenCalledWith("0x48656c6c6f");
  });

  it("switches to text mode and shows textarea", () => {
    render(<Bytes {...baseProps} />);
    fireEvent.click(screen.getByText("Text"));
    expect(
      screen.getByPlaceholderText("Enter text (auto-converts to hex)")
    ).toBeInTheDocument();
  });

  it("text mode: converts text to hex and calls onChange", () => {
    const onChange = jest.fn();
    render(<Bytes {...baseProps} onChange={onChange} />);
    fireEvent.click(screen.getByText("Text"));
    const textarea = screen.getByPlaceholderText(
      "Enter text (auto-converts to hex)"
    );
    fireEvent.change(textarea, { target: { value: "Hi" } });
    // "Hi" = 0x4869
    expect(onChange).toHaveBeenCalledWith("0x4869");
  });

  it("switches to JSON mode and shows textarea", () => {
    render(<Bytes {...baseProps} />);
    fireEvent.click(screen.getByText("JSON"));
    expect(
      screen.getByPlaceholderText('{"key": "value"}')
    ).toBeInTheDocument();
  });

  it("JSON mode: shows error for invalid JSON", () => {
    const onChange = jest.fn();
    render(<Bytes {...baseProps} onChange={onChange} />);
    fireEvent.click(screen.getByText("JSON"));
    const textarea = screen.getByPlaceholderText('{"key": "value"}');
    fireEvent.change(textarea, { target: { value: "{bad json" } });
    expect(screen.getByText("Invalid JSON")).toBeInTheDocument();
  });

  it("JSON mode: encodes valid JSON to hex", () => {
    const onChange = jest.fn();
    render(<Bytes {...baseProps} onChange={onChange} />);
    fireEvent.click(screen.getByText("JSON"));
    const textarea = screen.getByPlaceholderText('{"key": "value"}');
    fireEvent.change(textarea, { target: { value: '{"a":1}' } });
    // Should not have error
    expect(screen.queryByText("Invalid JSON")).not.toBeInTheDocument();
    // onChange should have been called with a hex string
    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall).toMatch(/^0x/);
  });

  it("switches to base64 mode and shows input", () => {
    render(<Bytes {...baseProps} />);
    fireEvent.click(screen.getByText("B64"));
    expect(
      screen.getByPlaceholderText("SGVsbG8gV29ybGQ=")
    ).toBeInTheDocument();
  });

  it("base64 mode: shows error for invalid base64", () => {
    render(<Bytes {...baseProps} />);
    fireEvent.click(screen.getByText("B64"));
    const input = screen.getByPlaceholderText("SGVsbG8gV29ybGQ=");
    fireEvent.change(input, { target: { value: "!!!invalid!!!" } });
    expect(screen.getByText("Invalid Base64 string")).toBeInTheDocument();
  });

  it("shows byte count when hex value is present", () => {
    const onChange = jest.fn();
    render(<Bytes {...baseProps} onChange={onChange} />);
    const input = screen.getByPlaceholderText("0x1234abcd");
    fireEvent.change(input, { target: { value: "0x48656c6c6f" } });
    // 5 bytes
    expect(screen.getByText("5 bytes")).toBeInTheDocument();
  });

  it("shows singular byte count for 1 byte", () => {
    render(<Bytes {...baseProps} />);
    const input = screen.getByPlaceholderText("0x1234abcd");
    fireEvent.change(input, { target: { value: "0xff" } });
    expect(screen.getByText("1 byte")).toBeInTheDocument();
  });

  it("switches to file mode and shows file button", () => {
    render(<Bytes {...baseProps} />);
    fireEvent.click(screen.getByText("File"));
    expect(screen.getByText("Choose file")).toBeInTheDocument();
  });

  it("shows external error", () => {
    render(<Bytes {...baseProps} error="Invalid bytes" />);
    expect(screen.getByText("Invalid bytes")).toBeInTheDocument();
  });
});
