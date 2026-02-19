jest.mock("../../../../env.mjs", () => ({ env: {} }));

jest.mock("lucide-react", () => ({
  Plus: () => <span data-testid="plus-icon" />,
  Trash2: () => <span data-testid="trash-icon" />,
  ChevronUp: () => <span data-testid="chevron-up-icon" />,
  ChevronDown: () => <span data-testid="chevron-down-icon" />,
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
  parseJsonBulk: jest.fn().mockImplementation((text: string) => {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return { success: true, values: parsed, count: parsed.length };
      }
      return { success: false, values: [], error: "Expected JSON array", count: 0 };
    } catch {
      return { success: false, values: [], error: "Invalid JSON", count: 0 };
    }
  }),
  parseSeparatedValues: jest.fn().mockImplementation((text: string) => {
    const values = text.trim().split(/[\n,]/).map((v: string) => v.trim()).filter((v: string) => v.length > 0);
    return { success: true, values, count: values.length };
  }),
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Vector, BTreeSet } from "../../../../components/params/inputs/vector";

// Helper mock client for inner type resolution
const mockClient = {
  registry: {
    findType: jest.fn().mockImplementation((typeId: number) => {
      if (typeId === 10) {
        return {
          typeDef: { type: "Sequence", value: { typeParam: 11 } },
        };
      }
      if (typeId === 11) {
        return {
          path: ["sp_runtime", "AccountId32"],
          typeDef: { type: "Primitive", value: { kind: "u32" } },
        };
      }
      return {
        typeDef: { type: "Primitive", value: { kind: "u32" } },
      };
    }),
  },
} as any;

const baseProps = {
  name: "items",
  label: "Items",
  client: mockClient,
  typeId: 10,
};

describe("Vector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders label and form/bulk toggle", () => {
    render(<Vector {...baseProps} />);
    expect(screen.getByText("Items")).toBeInTheDocument();
    expect(screen.getByText("Form")).toBeInTheDocument();
    expect(screen.getByText("Bulk")).toBeInTheDocument();
  });

  it("renders one item by default in form mode", () => {
    render(<Vector {...baseProps} />);
    expect(screen.getByTestId("mock-input-items-0")).toBeInTheDocument();
  });

  it("adds an item when Add button is clicked", () => {
    render(<Vector {...baseProps} />);
    // Click the Add button
    const addButton = screen.getByText("Add");
    fireEvent.click(addButton);
    expect(screen.getByTestId("mock-input-items-1")).toBeInTheDocument();
  });

  it("removes an item when delete button is clicked", () => {
    const onChange = jest.fn();
    render(<Vector {...baseProps} onChange={onChange} />);
    // Add two more items
    fireEvent.click(screen.getByText("Add"));
    fireEvent.click(screen.getByText("Add"));
    // We should have 3 items
    expect(screen.getByTestId("mock-input-items-2")).toBeInTheDocument();
    // Remove first item (click any trash button)
    const trashButtons = screen.getAllByTestId("trash-icon");
    fireEvent.click(trashButtons[0].closest("button")!);
    // Now should have 2 items
    expect(screen.queryByTestId("mock-input-items-2")).not.toBeInTheDocument();
  });

  it("calls onChange when item value changes", () => {
    const onChange = jest.fn();
    render(<Vector {...baseProps} onChange={onChange} />);
    const input = screen.getByTestId("mock-input-field-items-0");
    fireEvent.change(input, { target: { value: "test-value" } });
    expect(onChange).toHaveBeenCalled();
    const lastCallArgs = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCallArgs).toContain("test-value");
  });

  it("reorders items with move up/down buttons", () => {
    const onChange = jest.fn();
    render(<Vector {...baseProps} onChange={onChange} />);
    // Add a second item
    fireEvent.click(screen.getByText("Add"));
    // Set first item value
    const input0 = screen.getByTestId("mock-input-field-items-0");
    fireEvent.change(input0, { target: { value: "first" } });
    // Set second item value
    const input1 = screen.getByTestId("mock-input-field-items-1");
    fireEvent.change(input1, { target: { value: "second" } });
    // Move second item up
    const moveUpButtons = screen.getAllByTestId("chevron-up-icon");
    fireEvent.click(moveUpButtons[1].closest("button")!);
    // onChange should have been called with reordered items
    expect(onChange).toHaveBeenCalled();
  });

  it("switches to bulk mode and shows textarea", () => {
    render(<Vector {...baseProps} />);
    fireEvent.click(screen.getByText("Bulk"));
    expect(
      screen.getByPlaceholderText(/Paste JSON array/i)
    ).toBeInTheDocument();
  });

  it("bulk mode: parses JSON array input", () => {
    const onChange = jest.fn();
    render(<Vector {...baseProps} onChange={onChange} />);
    fireEvent.click(screen.getByText("Bulk"));
    const textarea = screen.getByPlaceholderText(/Paste JSON array/i);
    fireEvent.change(textarea, {
      target: { value: '["a", "b", "c"]' },
    });
    expect(onChange).toHaveBeenCalled();
    const lastCallArgs = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCallArgs).toEqual(["a", "b", "c"]);
  });

  it("shows min/max constraint labels", () => {
    render(<Vector {...baseProps} minItems={1} maxItems={5} />);
    expect(screen.getByText("(min: 1, max: 5)")).toBeInTheDocument();
  });

  it("does not allow adding beyond maxItems", () => {
    render(<Vector {...baseProps} maxItems={2} />);
    fireEvent.click(screen.getByText("Add"));
    // Now at 2 items (max), the Add button should no longer be visible
    expect(screen.queryByText("Add")).not.toBeInTheDocument();
  });

  it("shows description when provided", () => {
    render(<Vector {...baseProps} description="A list of values" />);
    expect(screen.getByText("A list of values")).toBeInTheDocument();
  });

  it("shows external error", () => {
    render(<Vector {...baseProps} error="Too many items" />);
    expect(screen.getByText("Too many items")).toBeInTheDocument();
  });
});

describe("BTreeSet (unique mode)", () => {
  it("renders with JSON mode label instead of Bulk", () => {
    render(<BTreeSet {...baseProps} />);
    expect(screen.getByText("JSON")).toBeInTheDocument();
    expect(screen.queryByText("Bulk")).not.toBeInTheDocument();
  });

  it("shows 'Add Item' instead of 'Add' for unique mode", () => {
    render(<BTreeSet {...baseProps} />);
    expect(screen.getByText("Add Item")).toBeInTheDocument();
  });

  it("shows duplicate error in red for unique sets", () => {
    const onChange = jest.fn();
    render(<BTreeSet {...baseProps} onChange={onChange} />);
    // Add a second item
    fireEvent.click(screen.getByText("Add Item"));
    // Set both items to same value
    const input0 = screen.getByTestId("mock-input-field-items-0");
    fireEvent.change(input0, { target: { value: "same" } });
    const input1 = screen.getByTestId("mock-input-field-items-1");
    fireEvent.change(input1, { target: { value: "same" } });
    // Should show duplicate error
    expect(
      screen.getByText(/Set contains duplicate values/)
    ).toBeInTheDocument();
  });
});
