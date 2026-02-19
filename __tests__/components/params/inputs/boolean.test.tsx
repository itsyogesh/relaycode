jest.mock("../../../../env.mjs", () => ({ env: {} }));

// Mock FormDescription to avoid form context requirement
jest.mock("@/components/ui/form", () => ({
  FormDescription: ({ children, ...props }: any) => (
    <p data-testid="form-description" {...props}>
      {children}
    </p>
  ),
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Boolean } from "../../../../components/params/inputs/boolean";

const baseProps = {
  name: "isActive",
  client: {} as any,
};

describe("Boolean", () => {
  it("renders label and switch, unchecked by default", () => {
    render(<Boolean {...baseProps} label="Active" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
    const switchEl = screen.getByRole("switch");
    expect(switchEl).toBeInTheDocument();
    expect(switchEl).not.toBeChecked();
  });

  it("reflects value={true} as checked", () => {
    render(<Boolean {...baseProps} label="Active" value={true} />);
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it('reflects value="true" as checked (string coercion)', () => {
    render(<Boolean {...baseProps} label="Active" value="true" />);
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("calls onChange with boolean on toggle", () => {
    const onChange = jest.fn();
    render(<Boolean {...baseProps} label="Active" onChange={onChange} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("has accessible label (aria-label)", () => {
    render(<Boolean {...baseProps} label="Active" />);
    expect(screen.getByRole("switch")).toHaveAttribute(
      "aria-label",
      "Active"
    );
  });

  it("shows error message", () => {
    render(
      <Boolean {...baseProps} label="Active" error="Must select a value" />
    );
    expect(screen.getByText("Must select a value")).toBeInTheDocument();
  });
});
