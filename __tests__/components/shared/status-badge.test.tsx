jest.mock("../../../env.mjs", () => ({ env: {} }));

// Mock next/font/google to avoid font loading in tests
jest.mock("next/font/google", () => ({
  JetBrains_Mono: () => ({
    variable: "--font-jetbrains-mock",
  }),
}));

import React from "react";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../../../components/shared/status-badge";

describe("StatusBadge", () => {
  it('renders "LIVE" with correct color', () => {
    render(<StatusBadge status="live" />);
    expect(screen.getByText("LIVE")).toBeInTheDocument();
    const badge = screen.getByText("LIVE").closest("div");
    expect(badge?.className).toContain("text-green-500");
  });

  it('renders "COMING SOON" with correct color', () => {
    render(<StatusBadge status="soon" />);
    expect(screen.getByText("COMING SOON")).toBeInTheDocument();
    const badge = screen.getByText("COMING SOON").closest("div");
    expect(badge?.className).toContain("text-yellow-500");
  });

  it('renders "BETA" with correct color', () => {
    render(<StatusBadge status="beta" />);
    expect(screen.getByText("BETA")).toBeInTheDocument();
    const badge = screen.getByText("BETA").closest("div");
    expect(badge?.className).toContain("text-blue-500");
  });

  it("custom className applied", () => {
    render(<StatusBadge status="live" className="ml-4" />);
    const badge = screen.getByText("LIVE").closest("div");
    expect(badge?.className).toContain("ml-4");
  });
});
