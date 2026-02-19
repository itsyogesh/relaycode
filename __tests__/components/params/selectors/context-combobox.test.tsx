jest.mock("../../../../env.mjs", () => ({ env: {} }));

jest.mock("lucide-react", () => ({
  ChevronsUpDown: () => <span data-testid="chevrons-icon" />,
  Info: () => <span data-testid="info-icon" />,
  AlertCircle: () => <span data-testid="alert-icon" />,
}));

import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { ContextCombobox } from "../../../../components/params/selectors/context-combobox";

interface TestItem {
  id: number;
  name: string;
}

const items: TestItem[] = [
  { id: 1, name: "Alpha" },
  { id: 2, name: "Beta" },
  { id: 3, name: "Gamma" },
];

const baseProps = {
  items,
  value: undefined as string | number | undefined,
  placeholder: "Select item...",
  searchPlaceholder: "Search items...",
  emptyMessage: "No items found.",
  getItemValue: (item: TestItem) => item.id,
  searchFilter: (item: TestItem, q: string) =>
    item.name.toLowerCase().includes(q),
  renderTriggerContent: (item: TestItem) => <span>{item.name}</span>,
  renderItem: (item: TestItem, isSelected: boolean) => (
    <span>
      {item.name}
      {isSelected && " (selected)"}
    </span>
  ),
};

describe("ContextCombobox", () => {
  it("renders skeleton when isContextLoading is true", () => {
    render(
      <ContextCombobox {...baseProps} isContextLoading={true} label="Test" />
    );
    expect(screen.getByText("Test")).toBeInTheDocument();
    // Skeleton renders instead of the combobox
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("renders SelectorFallback when contextAvailable is false", () => {
    render(
      <ContextCombobox
        {...baseProps}
        contextAvailable={false}
        label="Fallback"
      />
    );
    expect(screen.getByText("Fallback")).toBeInTheDocument();
    // SelectorFallback renders a number input by default
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
    expect(
      screen.getByText("Context unavailable — enter value manually")
    ).toBeInTheDocument();
  });

  it("renders SelectorFallback with text type when specified", () => {
    render(
      <ContextCombobox
        {...baseProps}
        contextAvailable={false}
        fallbackType="text"
        fallbackPlaceholder="Enter value"
        label="Text Fallback"
      />
    );
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("trigger shows placeholder text when no value selected", () => {
    render(<ContextCombobox {...baseProps} label="Pick" />);
    expect(screen.getByText("Select item...")).toBeInTheDocument();
  });

  it("trigger shows selected item label when value matches", () => {
    render(<ContextCombobox {...baseProps} value={2} label="Pick" />);
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("opens popover and shows items on trigger click", () => {
    render(<ContextCombobox {...baseProps} label="Pick" />);
    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("Gamma")).toBeInTheDocument();
  });

  it("filters items via search input", () => {
    render(<ContextCombobox {...baseProps} label="Pick" />);
    fireEvent.click(screen.getByRole("combobox"));
    const searchInput = screen.getByPlaceholderText("Search items...");
    fireEvent.change(searchInput, { target: { value: "alp" } });
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.queryByText("Beta")).not.toBeInTheDocument();
    expect(screen.queryByText("Gamma")).not.toBeInTheDocument();
  });

  it("selecting an item calls onChange with item value", () => {
    const onChange = jest.fn();
    render(<ContextCombobox {...baseProps} onChange={onChange} label="Pick" />);
    fireEvent.click(screen.getByRole("combobox"));
    // cmdk items have role="option"
    const options = screen.getAllByRole("option");
    fireEvent.click(options[1]); // Beta
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("shows emptyMessage when no items match search", () => {
    render(<ContextCombobox {...baseProps} label="Pick" />);
    fireEvent.click(screen.getByRole("combobox"));
    const searchInput = screen.getByPlaceholderText("Search items...");
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });
    expect(screen.getByText("No items found.")).toBeInTheDocument();
  });

  it("renders headerContent above the list", () => {
    render(
      <ContextCombobox
        {...baseProps}
        label="Pick"
        headerContent={<div data-testid="header">Header Content</div>}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("Header Content")).toBeInTheDocument();
  });

  it("renders footerContent below the popover", () => {
    render(
      <ContextCombobox
        {...baseProps}
        label="Pick"
        footerContent={<div data-testid="footer">Footer Content</div>}
      />
    );
    // footerContent is rendered outside the popover, always visible
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByText("Footer Content")).toBeInTheDocument();
  });
});
