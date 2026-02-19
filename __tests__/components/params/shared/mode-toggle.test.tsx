jest.mock("../../../../env.mjs", () => ({ env: {} }));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ModeToggle } from "../../../../components/params/shared/mode-toggle";

const modes = [
  { id: "encoded", label: "Encoded" },
  { id: "decoded", label: "Decoded" },
  { id: "raw", label: "Raw" },
];

describe("ModeToggle", () => {
  it("renders mode buttons with labels", () => {
    render(
      <ModeToggle modes={modes} activeMode="encoded" onModeChange={jest.fn()} />
    );
    expect(screen.getByText("Encoded")).toBeInTheDocument();
    expect(screen.getByText("Decoded")).toBeInTheDocument();
    expect(screen.getByText("Raw")).toBeInTheDocument();
  });

  it("active mode has distinct styling (bg-primary class)", () => {
    render(
      <ModeToggle modes={modes} activeMode="encoded" onModeChange={jest.fn()} />
    );
    const activeBtn = screen.getByText("Encoded");
    expect(activeBtn.className).toContain("bg-primary");

    const inactiveBtn = screen.getByText("Decoded");
    expect(inactiveBtn.className).not.toContain("bg-primary");
  });

  it("clicking inactive mode calls onModeChange with mode id", () => {
    const onModeChange = jest.fn();
    render(
      <ModeToggle
        modes={modes}
        activeMode="encoded"
        onModeChange={onModeChange}
      />
    );
    fireEvent.click(screen.getByText("Decoded"));
    expect(onModeChange).toHaveBeenCalledWith("decoded");
  });

  it("disabled state prevents clicks", () => {
    const onModeChange = jest.fn();
    render(
      <ModeToggle
        modes={modes}
        activeMode="encoded"
        onModeChange={onModeChange}
        disabled
      />
    );
    const btn = screen.getByText("Decoded");
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onModeChange).not.toHaveBeenCalled();
  });

  it("all modes rendered", () => {
    render(
      <ModeToggle modes={modes} activeMode="encoded" onModeChange={jest.fn()} />
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
  });
});
