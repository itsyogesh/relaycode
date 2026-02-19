jest.mock("../../../env.mjs", () => ({ env: {} }));

// Polyfill ResizeObserver for jsdom (required by cmdk/radix popover)
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

// Polyfill scrollIntoView for jsdom (required by cmdk)
Element.prototype.scrollIntoView = jest.fn();

// Polyfill hasPointerCapture for jsdom (required by radix)
Element.prototype.hasPointerCapture = jest.fn().mockReturnValue(false);

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Combobox, ComboboxItem } from "../../../components/builder/combobox";

// Helper to create items
function makeItems(labels: string[]): ComboboxItem[] {
  return labels.map((label, i) => ({ value: i, label }));
}

describe("Combobox", () => {
  const defaultItems = makeItems(["Balances", "System", "Staking"]);
  const defaultProps = {
    items: defaultItems,
    onValueChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders trigger with placeholder when no value", () => {
    render(<Combobox {...defaultProps} placeholder="Select section" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Select section");
  });

  it("shows selected label when value is set", () => {
    render(
      <Combobox
        {...defaultProps}
        value="1:System"
      />
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("System");
  });

  it("popover opens on trigger click", async () => {
    render(<Combobox {...defaultProps} />);
    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });
  });

  it("search input filters items", async () => {
    render(<Combobox {...defaultProps} />);
    fireEvent.click(screen.getByRole("combobox"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search...");
    fireEvent.change(searchInput, { target: { value: "Bal" } });

    await waitFor(() => {
      expect(screen.getByText("Balances")).toBeInTheDocument();
    });
  });

  it('selecting calls onValueChange with "value:label" format', async () => {
    const onValueChange = jest.fn();
    render(<Combobox {...defaultProps} onValueChange={onValueChange} />);

    fireEvent.click(screen.getByRole("combobox"));

    await waitFor(() => {
      expect(screen.getByText("Balances")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Balances"));

    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalledWith("0:Balances");
    });
  });

  it("empty items array renders without crash", () => {
    expect(() => {
      render(<Combobox items={[]} onValueChange={jest.fn()} />);
    }).not.toThrow();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it('label containing ":" character handled correctly', () => {
    const items: ComboboxItem[] = [
      { value: 5, label: "Foo:Bar" },
    ];
    render(
      <Combobox
        items={items}
        value="5:Foo:Bar"
        onValueChange={jest.fn()}
      />
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Foo:Bar");
  });
});
