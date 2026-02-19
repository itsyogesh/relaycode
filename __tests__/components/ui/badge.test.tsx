jest.mock("../../../env.mjs", () => ({ env: {} }));
jest.mock("../../../config/site", () => ({
  siteConfig: { name: "Test", description: "Test", url: "https://test.com", ogImage: "https://test.com/og.jpg" },
}));

import React from "react";
import { render, screen } from "@testing-library/react";
import { Badge } from "../../../components/ui/badge";

describe("Badge", () => {
  it("renders with default variant", () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText("Default")).toBeInTheDocument();
  });

  it("renders with secondary variant", () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText("Secondary");
    expect(badge.className).toContain("bg-secondary");
  });

  it("renders with destructive variant", () => {
    render(<Badge variant="destructive">Error</Badge>);
    const badge = screen.getByText("Error");
    expect(badge.className).toContain("bg-destructive");
  });

  it("renders with outline variant", () => {
    render(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText("Outline")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Badge className="ml-2">Custom</Badge>);
    const badge = screen.getByText("Custom");
    expect(badge.className).toContain("ml-2");
  });
});
