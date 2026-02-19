jest.mock("../../../../env.mjs", () => ({ env: {} }));

jest.mock("lucide-react", () => ({
  Plus: () => <span data-testid="plus-icon" />,
  Trash2: () => <span data-testid="trash-icon" />,
}));

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

jest.mock("../../../../lib/bulk-parse", () => ({
  parseJsonBulk: jest.fn().mockImplementation((text: string, expectPairs?: boolean) => {
    const trimmed = text.trim();
    if (!trimmed) return { success: false, values: [], error: "Empty input", count: 0 };
    try {
      const parsed = JSON.parse(trimmed);
      if (expectPairs) {
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const entries = Object.entries(parsed);
          return { success: true, values: entries, count: entries.length };
        }
        if (Array.isArray(parsed)) {
          const valid = parsed.every(
            (item: any) => Array.isArray(item) && item.length === 2
          );
          if (!valid) {
            return { success: false, values: [], error: "Expected array of [key, value] pairs", count: 0 };
          }
          return { success: true, values: parsed, count: parsed.length };
        }
        return { success: false, values: [], error: "Expected object or array of pairs", count: 0 };
      }
      if (Array.isArray(parsed)) {
        return { success: true, values: parsed, count: parsed.length };
      }
      return { success: false, values: [], error: "Expected JSON array", count: 0 };
    } catch {
      return { success: false, values: [], error: "Invalid JSON", count: 0 };
    }
  }),
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BTreeMap } from "../../../../components/params/inputs/btree-map";
import { findComponent } from "../../../../lib/input-map";

// Mock client that resolves BTreeMap type (Sequence of Tuple)
const mockClient = {
  registry: {
    findType: jest.fn().mockImplementation((typeId: number) => {
      if (typeId === 50) {
        // BTreeMap: Sequence of Tuple
        return {
          typeDef: { type: "Sequence", value: { typeParam: 51 } },
        };
      }
      if (typeId === 51) {
        // Tuple with 2 fields (key, value)
        return {
          typeDef: {
            type: "Tuple",
            value: { fields: [52, 53] },
          },
        };
      }
      if (typeId === 52) {
        // Key type
        return {
          path: ["AccountId32"],
          typeDef: { type: "Primitive", value: { kind: "u32" } },
        };
      }
      if (typeId === 53) {
        // Value type
        return {
          path: ["Balance"],
          typeDef: { type: "Primitive", value: { kind: "u128" } },
        };
      }
      return {
        typeDef: { type: "Primitive", value: { kind: "u32" } },
      };
    }),
  },
} as any;

const baseProps = {
  name: "map",
  label: "Map",
  client: mockClient,
  typeId: 50,
};

describe("BTreeMap", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders label and form/JSON mode toggle", () => {
    render(<BTreeMap {...baseProps} />);
    expect(screen.getByText("Map")).toBeInTheDocument();
    expect(screen.getByText("Form")).toBeInTheDocument();
    expect(screen.getByText("JSON")).toBeInTheDocument();
  });

  it("renders one key-value pair by default in form mode", () => {
    render(<BTreeMap {...baseProps} />);
    // With resolved key/value types, findComponent is called and mock inputs render
    expect(screen.getByTestId("mock-input-map-key-0")).toBeInTheDocument();
    expect(screen.getByTestId("mock-input-map-val-0")).toBeInTheDocument();
  });

  it("adds a key-value pair when Add Entry is clicked", () => {
    render(<BTreeMap {...baseProps} />);
    fireEvent.click(screen.getByText("Add Entry"));
    expect(screen.getByTestId("mock-input-map-key-1")).toBeInTheDocument();
    expect(screen.getByTestId("mock-input-map-val-1")).toBeInTheDocument();
  });

  it("removes a key-value pair when trash button is clicked", () => {
    render(<BTreeMap {...baseProps} />);
    // Add a second pair
    fireEvent.click(screen.getByText("Add Entry"));
    expect(screen.getByTestId("mock-input-map-key-1")).toBeInTheDocument();
    // Remove first pair
    const trashButtons = screen.getAllByTestId("trash-icon");
    fireEvent.click(trashButtons[0].closest("button")!);
    // Should still have one pair
    expect(screen.queryByTestId("mock-input-map-key-1")).not.toBeInTheDocument();
  });

  it("calls onChange when key value changes", () => {
    const onChange = jest.fn();
    render(<BTreeMap {...baseProps} onChange={onChange} />);
    const keyInput = screen.getByTestId("mock-input-field-map-key-0");
    fireEvent.change(keyInput, { target: { value: "myKey" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("calls onChange when value changes", () => {
    const onChange = jest.fn();
    render(<BTreeMap {...baseProps} onChange={onChange} />);
    const valInput = screen.getByTestId("mock-input-field-map-val-0");
    fireEvent.change(valInput, { target: { value: "myVal" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("switches to JSON mode and shows textarea", () => {
    render(<BTreeMap {...baseProps} />);
    fireEvent.click(screen.getByText("JSON"));
    expect(
      screen.getByPlaceholderText(/{"key1": "value1"/)
    ).toBeInTheDocument();
  });

  it("JSON mode: parses object input", () => {
    const onChange = jest.fn();
    render(<BTreeMap {...baseProps} onChange={onChange} />);
    fireEvent.click(screen.getByText("JSON"));
    const textarea = screen.getByPlaceholderText(/{"key1": "value1"/);
    fireEvent.change(textarea, {
      target: { value: '{"a": "1", "b": "2"}' },
    });
    expect(onChange).toHaveBeenCalled();
  });

  it("JSON mode: shows error for invalid JSON", () => {
    render(<BTreeMap {...baseProps} />);
    fireEvent.click(screen.getByText("JSON"));
    const textarea = screen.getByPlaceholderText(/{"key1": "value1"/);
    fireEvent.change(textarea, { target: { value: "{bad json" } });
    expect(screen.getByText("Invalid JSON")).toBeInTheDocument();
  });

  it("falls back to plain text inputs when no client is provided", () => {
    render(
      <BTreeMap
        name="map"
        label="Map"
        client={null as any}
        typeId={50}
      />
    );
    // Without client, findComponent is not called for resolved types
    // Should render plain <input> elements with placeholder "Key" and "Value"
    expect(screen.getByPlaceholderText("Key")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Value")).toBeInTheDocument();
  });

  it("shows external error", () => {
    render(<BTreeMap {...baseProps} error="Invalid map" />);
    expect(screen.getByText("Invalid map")).toBeInTheDocument();
  });
});
