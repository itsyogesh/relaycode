jest.mock("../../../env.mjs", () => ({ env: {} }));

import React from "react";
import { render, screen } from "@testing-library/react";
import { InputWithAddon } from "../../../components/ui/input-with-addon";

describe("InputWithAddon", () => {
  it("renders input element", () => {
    render(<InputWithAddon placeholder="Enter value" />);
    expect(screen.getByPlaceholderText("Enter value")).toBeInTheDocument();
  });

  it("renders addonLeft when provided", () => {
    render(
      <InputWithAddon
        addonLeft={<span data-testid="left-icon">$</span>}
        placeholder="Amount"
      />
    );
    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    // Input should have left padding class
    const input = screen.getByPlaceholderText("Amount");
    expect(input.className).toContain("pl-10");
  });

  it("renders suffix when provided", () => {
    render(
      <InputWithAddon
        suffix={<span data-testid="suffix">DOT</span>}
        placeholder="Balance"
      />
    );
    expect(screen.getByTestId("suffix")).toBeInTheDocument();
    const input = screen.getByPlaceholderText("Balance");
    expect(input.className).toContain("pr-28");
  });

  it("forwards input props", () => {
    render(
      <InputWithAddon
        placeholder="Test"
        disabled
        type="number"
        data-testid="my-input"
      />
    );
    const input = screen.getByTestId("my-input");
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("type", "number");
  });

  it("custom className", () => {
    render(<InputWithAddon className="bg-red-500" placeholder="Custom" />);
    const input = screen.getByPlaceholderText("Custom");
    expect(input.className).toContain("bg-red-500");
  });
});
