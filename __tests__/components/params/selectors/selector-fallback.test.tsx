jest.mock("../../../../env.mjs", () => ({ env: {} }));

jest.mock("lucide-react", () => ({
  Info: () => <span data-testid="info-icon" />,
  AlertCircle: () => <span data-testid="alert-icon" />,
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SelectorFallback } from "../../../../components/params/selectors/selector-fallback";

describe("SelectorFallback", () => {
  it("renders with number type by default", () => {
    render(<SelectorFallback label="Amount" />);
    expect(screen.getByText("Amount")).toBeInTheDocument();
    const input = screen.getByRole("spinbutton");
    expect(input).toBeInTheDocument();
  });

  it("renders with text type", () => {
    render(<SelectorFallback label="Name" type="text" />);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("fires onChange with number for number type", () => {
    const onChange = jest.fn();
    render(<SelectorFallback label="Amount" type="number" onChange={onChange} />);
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "42" } });
    expect(onChange).toHaveBeenCalledWith(42);
  });

  it("fires onChange with string for text type", () => {
    const onChange = jest.fn();
    render(<SelectorFallback label="Name" type="text" onChange={onChange} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "hello" } });
    expect(onChange).toHaveBeenCalledWith("hello");
  });
});
