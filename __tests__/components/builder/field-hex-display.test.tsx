jest.mock("../../../env.mjs", () => ({ env: {} }));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Copy: (props: any) => <span data-testid="copy-icon" {...props} />,
  Check: (props: any) => <span data-testid="check-icon" {...props} />,
  AlertCircle: (props: any) => <span data-testid="alert-icon" {...props} />,
}));

// Mock dedot/utils
jest.mock("dedot/utils", () => ({
  stringCamelCase: (s: string) => {
    // Simple camelCase: lowercase first letter, keep rest as-is
    if (!s) return s;
    return s.charAt(0).toLowerCase() + s.slice(1);
  },
}));

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
});

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FieldHexDisplay } from "../../../components/builder/field-hex-display";
import type { HexTreeNode } from "../../../lib/codec";

const leafNode: HexTreeNode = { kind: "leaf" };

const compoundNode: HexTreeNode = {
  kind: "compound",
  compoundType: "Struct",
  children: [
    { label: "amount", typeId: 1, hex: "0xabcd" },
    { label: "dest", typeId: 2, hex: "0x1234" },
  ],
};

const defaultProps = {
  fieldName: "Amount",
  hex: "0xdeadbeef",
  decomposition: leafNode as HexTreeNode,
  editing: false,
  onHexChange: jest.fn(),
};

describe("FieldHexDisplay", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("leaf node: renders field name + hex input", () => {
    render(<FieldHexDisplay {...defaultProps} />);
    expect(screen.getByText("amount Hex")).toBeInTheDocument();
    const input = screen.getByDisplayValue("0xdeadbeef");
    expect(input).toBeInTheDocument();
  });

  it("input disabled by default (not editing)", () => {
    render(<FieldHexDisplay {...defaultProps} editing={false} />);
    const input = screen.getByDisplayValue("0xdeadbeef");
    expect(input).toBeDisabled();
  });

  it("input enabled when editing=true", () => {
    render(<FieldHexDisplay {...defaultProps} editing={true} />);
    const input = screen.getByDisplayValue("0xdeadbeef");
    expect(input).not.toBeDisabled();
  });

  it("copy button copies hex value to clipboard", async () => {
    render(<FieldHexDisplay {...defaultProps} />);
    const copyBtn = screen.getByTitle("Copy to clipboard");
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("0xdeadbeef");
  });

  it("compound node: renders sub-nodes recursively", () => {
    render(
      <FieldHexDisplay
        {...defaultProps}
        decomposition={compoundNode}
      />
    );
    // Parent label should render
    expect(screen.getByText("amount Hex")).toBeInTheDocument();
    // Sub-nodes should render with combined labels
    expect(screen.getByText("amountamount Hex")).toBeInTheDocument();
    expect(screen.getByText("amountdest Hex")).toBeInTheDocument();
    // Sub-hex values should be present
    expect(screen.getByDisplayValue("0xabcd")).toBeInTheDocument();
    expect(screen.getByDisplayValue("0x1234")).toBeInTheDocument();
  });

  it("typeName displayed as badge/label", () => {
    render(<FieldHexDisplay {...defaultProps} typeName="Balance" />);
    expect(screen.getByText("Balance")).toBeInTheDocument();
  });

  it("empty typeName handled gracefully", () => {
    render(<FieldHexDisplay {...defaultProps} typeName="" />);
    // Should not render empty badge
    const labels = screen.getAllByText(/Hex/);
    expect(labels.length).toBeGreaterThan(0);
  });

  it("shows error message when error prop provided", () => {
    render(
      <FieldHexDisplay
        {...defaultProps}
        error="Invalid hex"
        hasError={true}
      />
    );
    expect(screen.getByText("Invalid hex")).toBeInTheDocument();
  });

  it("no copy button when hex is empty (0x)", () => {
    render(<FieldHexDisplay {...defaultProps} hex="0x" />);
    expect(screen.queryByTitle("Copy to clipboard")).not.toBeInTheDocument();
  });

  it("very deep nesting renders without issues", () => {
    const deepNode: HexTreeNode = {
      kind: "compound",
      compoundType: "Struct",
      children: [
        {
          label: "outer",
          typeId: 1,
          hex: "0xaa",
          children: {
            kind: "compound",
            compoundType: "Struct",
            children: [
              {
                label: "inner",
                typeId: 2,
                hex: "0xbb",
                children: { kind: "leaf" },
              },
            ],
          },
        },
      ],
    };

    expect(() => {
      render(
        <FieldHexDisplay
          {...defaultProps}
          decomposition={deepNode}
        />
      );
    }).not.toThrow();

    // The deeply nested inner value should render
    expect(screen.getByDisplayValue("0xbb")).toBeInTheDocument();
  });
});
