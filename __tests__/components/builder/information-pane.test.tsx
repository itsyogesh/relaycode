jest.mock("../../../env.mjs", () => ({ env: {} }));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Copy: (props: any) => <span data-testid="copy-icon" {...props} />,
  Check: (props: any) => <span data-testid="check-icon" {...props} />,
  AlertCircle: (props: any) => <span data-testid="alert-icon" {...props} />,
}));

// Mock dedot
jest.mock("dedot", () => ({
  $: { u8: { tryEncode: jest.fn().mockReturnValue(new Uint8Array([0x05])) } },
  DedotClient: jest.fn(),
}));

// Mock dedot/utils
jest.mock("dedot/utils", () => ({
  stringCamelCase: (s: string) => {
    if (!s) return s;
    return s.charAt(0).toLowerCase() + s.slice(1);
  },
  toHex: jest.fn((v: Uint8Array) => "0x" + Buffer.from(v).toString("hex")),
  u8aToHex: jest.fn((v: Uint8Array) => "0x" + Buffer.from(v).toString("hex")),
  hexStripPrefix: jest.fn((hex: string) =>
    hex.startsWith("0x") ? hex.slice(2) : hex
  ),
  hexAddPrefix: jest.fn((hex: string) =>
    hex.startsWith("0x") ? hex : "0x" + hex
  ),
  xxhashAsHex: jest.fn().mockReturnValue("0xabcdef1234567890"),
  isHex: jest.fn((v: string) => /^0x[0-9a-fA-F]*$/.test(v)),
  HexString: "",
}));

// Mock lib/codec
jest.mock("@/lib/codec", () => ({
  encodeArg: jest.fn().mockReturnValue({ success: true, hex: "0xaa" }),
  decodeArg: jest.fn().mockReturnValue({ success: true, value: "decoded" }),
  encodeAllArgs: jest.fn().mockReturnValue({
    argHexes: ["0xaa"],
    argResults: [{ success: true, hex: "0xaa" }],
    hasErrors: false,
    errors: new Map(),
  }),
  decodeAllArgs: jest.fn().mockReturnValue({
    success: true,
    values: { amount: "100" },
    errors: new Map(),
  }),
  decomposeArgHex: jest.fn().mockReturnValue({ kind: "leaf" }),
  patchValueAtPath: jest.fn(),
}));

// Mock FieldHexDisplay to simplify testing
jest.mock("@/components/builder/field-hex-display", () => ({
  FieldHexDisplay: (props: any) => (
    <div data-testid={`field-hex-${props.fieldName}`}>
      <span>{props.fieldName} Hex</span>
      <input value={props.hex} readOnly />
    </div>
  ),
}));

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
});

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import InformationPane from "../../../components/builder/information-pane";

// Create a mock builderForm
function createMockForm(values: Record<string, any> = {}) {
  return {
    watch: jest.fn((field?: string) => {
      if (field) return values[field] ?? "";
      return values;
    }),
    setValue: jest.fn(),
    getValues: jest.fn((field?: string) => {
      if (field) return values[field];
      return values;
    }),
    control: {},
    handleSubmit: jest.fn(),
    setError: jest.fn(),
    clearErrors: jest.fn(),
    formState: { errors: {} },
  } as any;
}

// Create a mock client
function createMockClient() {
  return {
    registry: {
      findCodec: jest.fn().mockReturnValue({
        tryEncode: jest.fn().mockReturnValue(new Uint8Array([0])),
        tryDecode: jest.fn(),
      }),
      findType: jest.fn().mockReturnValue({
        typeDef: { type: "Primitive", value: { kind: "u128" } },
      }),
      $Extrinsic: {
        tryDecode: jest.fn(),
      },
    },
    metadata: { latest: { pallets: [] } },
  } as any;
}

describe("InformationPane", () => {
  const mockClient = createMockClient();
  const mockOnTxChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders heading", () => {
    render(
      <InformationPane
        client={mockClient}
        tx={null}
        builderForm={createMockForm()}
        onTxChange={mockOnTxChange}
      />
    );
    expect(screen.getByText("Information Pane")).toBeInTheDocument();
  });

  it("renders editing toggle button", () => {
    render(
      <InformationPane
        client={mockClient}
        tx={null}
        builderForm={createMockForm()}
        onTxChange={mockOnTxChange}
      />
    );
    expect(screen.getByText("Enable Editing")).toBeInTheDocument();
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("shows Section, Function labels", () => {
    render(
      <InformationPane
        client={mockClient}
        tx={null}
        builderForm={createMockForm()}
        onTxChange={mockOnTxChange}
      />
    );
    expect(screen.getByText("Section Hex")).toBeInTheDocument();
    expect(screen.getByText("Function Hex")).toBeInTheDocument();
  });

  it("shows Encoded Call Data and Call Hash labels", () => {
    render(
      <InformationPane
        client={mockClient}
        tx={null}
        builderForm={createMockForm()}
        onTxChange={mockOnTxChange}
      />
    );
    expect(screen.getByText("Encoded Call Data")).toBeInTheDocument();
    expect(screen.getByText("Encoded Call Hash")).toBeInTheDocument();
  });

  it("shows Hex Encoded Call Data textarea", () => {
    render(
      <InformationPane
        client={mockClient}
        tx={null}
        builderForm={createMockForm()}
        onTxChange={mockOnTxChange}
      />
    );
    expect(screen.getByText("Hex Encoded Call Data")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        "Paste a full hex-encoded extrinsic to decode..."
      )
    ).toBeInTheDocument();
  });

  it("empty state when no tx data", () => {
    render(
      <InformationPane
        client={mockClient}
        tx={null}
        builderForm={createMockForm()}
        onTxChange={mockOnTxChange}
      />
    );
    // Section and function hex should be empty
    const inputs = screen.getAllByRole("textbox");
    // All hex inputs should be empty/disabled
    expect(inputs.length).toBeGreaterThan(0);
  });

  it("renders FieldHexDisplay for tx with fields", () => {
    const mockTx = {
      meta: {
        index: 1,
        fields: [
          { name: "amount", typeId: 6, typeName: "Balance" },
        ],
        docs: [],
      },
    } as any;

    render(
      <InformationPane
        client={mockClient}
        tx={mockTx}
        builderForm={createMockForm({ amount: "100", section: "5:Balances" })}
        onTxChange={mockOnTxChange}
      />
    );

    expect(screen.getByTestId("field-hex-amount")).toBeInTheDocument();
  });

  it("editing toggle enables textarea for hex encoded call", () => {
    render(
      <InformationPane
        client={mockClient}
        tx={null}
        builderForm={createMockForm()}
        onTxChange={mockOnTxChange}
      />
    );

    const textarea = screen.getByPlaceholderText(
      "Paste a full hex-encoded extrinsic to decode..."
    );
    expect(textarea).toBeDisabled();

    // Toggle editing on
    fireEvent.click(screen.getByRole("switch"));

    expect(textarea).not.toBeDisabled();
  });

  it("section hex encodes section index when section value is provided", () => {
    const form = createMockForm({ section: "5:Balances" });

    render(
      <InformationPane
        client={mockClient}
        tx={null}
        builderForm={form}
        onTxChange={mockOnTxChange}
      />
    );

    // The section hex input should have an encoded value (from mocked $.u8.tryEncode)
    const sectionLabel = screen.getByText("Section Hex");
    const sectionContainer = sectionLabel.closest("div")!.parentElement!;
    const input = sectionContainer.querySelector("input");
    expect(input).toBeTruthy();
    // Should have a hex value set since section is not empty
    expect(input!.value).not.toBe("");
  });

  it("copy button calls clipboard.writeText", () => {
    const mockTx = {
      meta: {
        index: 1,
        fields: [
          { name: "amount", typeId: 6, typeName: "Balance" },
        ],
        docs: [],
      },
    } as any;

    render(
      <InformationPane
        client={mockClient}
        tx={mockTx}
        builderForm={createMockForm({ section: "5:Balances", amount: "100" })}
        onTxChange={mockOnTxChange}
      />
    );

    // There should be copy buttons for non-empty hex fields
    const copyButtons = screen.getAllByTitle("Copy to clipboard");
    if (copyButtons.length > 0) {
      fireEvent.click(copyButtons[0]);
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    }
  });

  it("renders multiple arg fields when tx has multiple fields", () => {
    const mockTx = {
      meta: {
        index: 1,
        fields: [
          { name: "dest", typeId: 1, typeName: "AccountId" },
          { name: "value", typeId: 6, typeName: "Balance" },
        ],
        docs: [],
      },
    } as any;

    render(
      <InformationPane
        client={mockClient}
        tx={mockTx}
        builderForm={createMockForm({ section: "5:Balances", dest: "0x00", value: "100" })}
        onTxChange={mockOnTxChange}
      />
    );

    expect(screen.getByTestId("field-hex-dest")).toBeInTheDocument();
    expect(screen.getByTestId("field-hex-value")).toBeInTheDocument();
  });
});
