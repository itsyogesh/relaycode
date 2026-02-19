jest.mock("../../../../env.mjs", () => ({ env: {} }));

// Mock lucide-react to avoid SVG rendering issues
jest.mock("lucide-react", () => ({
  Info: () => <span data-testid="info-icon" />,
}));

import React from "react";
import { render, screen } from "@testing-library/react";
import { ContextHint } from "../../../../components/params/selectors/context-hint";

describe("ContextHint", () => {
  it("renders text with default Info icon", () => {
    render(<ContextHint text="Some hint text" />);
    expect(screen.getByText("Some hint text")).toBeInTheDocument();
    expect(screen.getByTestId("info-icon")).toBeInTheDocument();
  });

  it("renders with custom icon instead of default", () => {
    render(
      <ContextHint
        text="Custom hint"
        icon={<span data-testid="custom-icon">!</span>}
      />
    );
    expect(screen.getByText("Custom hint")).toBeInTheDocument();
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("info-icon")).not.toBeInTheDocument();
  });
});
