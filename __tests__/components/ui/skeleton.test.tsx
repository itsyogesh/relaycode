jest.mock("../../../env.mjs", () => ({ env: {} }));
jest.mock("../../../config/site", () => ({
  siteConfig: { name: "Test", description: "Test", url: "https://test.com", ogImage: "https://test.com/og.jpg" },
}));

import React from "react";
import { render } from "@testing-library/react";
import { Skeleton } from "../../../components/ui/skeleton";

describe("Skeleton", () => {
  it("renders a div with animate-pulse class", () => {
    const { container } = render(<Skeleton />);
    const div = container.firstChild as HTMLElement;
    expect(div.tagName).toBe("DIV");
    expect(div.className).toContain("animate-pulse");
  });

  it("applies custom className", () => {
    const { container } = render(<Skeleton className="w-full h-4" />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("w-full");
    expect(div.className).toContain("h-4");
  });

  it("passes through HTML attributes", () => {
    const { container } = render(<Skeleton data-testid="skel" />);
    expect(container.querySelector("[data-testid='skel']")).toBeInTheDocument();
  });
});
