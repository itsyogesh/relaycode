jest.mock("../../../env.mjs", () => ({ env: {} }));

jest.mock("lucide-react", () => ({
  ArrowLeft: (props: any) => <span data-testid="arrow-left" {...props} />,
}));

import React from "react";
import { render, screen } from "@testing-library/react";
import { ComingSoon } from "../../../components/shared/coming-soon";

describe("ComingSoon", () => {
  it("renders title", () => {
    render(<ComingSoon title="Batch Builder" />);
    expect(screen.getByText("Batch Builder")).toBeInTheDocument();
  });

  it("default description", () => {
    render(<ComingSoon title="Batch Builder" />);
    expect(
      screen.getByText("This page is coming soon. Stay tuned for updates.")
    ).toBeInTheDocument();
  });

  it("custom description", () => {
    render(
      <ComingSoon
        title="Batch Builder"
        description="Available in milestone 2."
      />
    );
    expect(screen.getByText("Available in milestone 2.")).toBeInTheDocument();
    expect(
      screen.queryByText("This page is coming soon. Stay tuned for updates.")
    ).not.toBeInTheDocument();
  });

  it("has a back link", () => {
    render(<ComingSoon title="Batch Builder" />);
    const link = screen.getByRole("link", { name: /back to builder/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/builder");
  });
});
