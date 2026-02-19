jest.mock("../../../env.mjs", () => ({ env: {} }));

jest.mock("@polkadot/ui-shared", () => ({
  polkadotIcon: jest.fn((address: string) => {
    // Return empty for invalid/empty address
    if (!address || address.length < 5) return [];
    // Return mock circle data for valid addresses
    return [
      { cx: 32, cy: 32, r: 32, fill: "#ff0000" },
      { cx: 16, cy: 16, r: 8, fill: "#00ff00" },
    ];
  }),
}));

import React from "react";
import { render, screen } from "@testing-library/react";
import { Identicon } from "../../../components/ui/identicon";

const VALID_ADDRESS = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";

describe("Identicon", () => {
  it("renders SVG for valid address", () => {
    const { container } = render(<Identicon address={VALID_ADDRESS} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    // Should have circle elements from our mock
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBe(2);
  });

  it("placeholder for invalid/empty address", () => {
    const { container } = render(<Identicon address="" />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeInTheDocument();
    // Should render a placeholder div
    const placeholder = container.firstChild as HTMLElement;
    expect(placeholder.tagName).toBe("DIV");
    expect(placeholder.style.borderRadius).toBe("50%");
  });

  it("size prop", () => {
    const { container } = render(
      <Identicon address={VALID_ADDRESS} size={48} />
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "48");
    expect(svg).toHaveAttribute("height", "48");
  });

  it("size prop affects placeholder", () => {
    const { container } = render(<Identicon address="" size={64} />);
    const placeholder = container.firstChild as HTMLElement;
    expect(placeholder.style.width).toBe("64px");
    expect(placeholder.style.height).toBe("64px");
  });
});
