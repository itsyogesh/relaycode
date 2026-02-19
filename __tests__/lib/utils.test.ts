jest.mock("../../env.mjs", () => ({
  env: { NEXT_PUBLIC_APP_URL: "https://test.relaycode.org" },
}));

jest.mock("../../config/site", () => ({
  siteConfig: {
    name: "Relaycode",
    description: "Test description",
    url: "https://test.relaycode.org",
    ogImage: "https://test.relaycode.org/og.jpg",
  },
}));

import { cn, formatDate, absoluteUrl, constructMetadata } from "../../lib/utils";

describe("cn", () => {
  it("returns empty string for no args", () => {
    expect(cn()).toBe("");
  });

  it("returns single class", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("merges multiple classes", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("resolves conflicting tailwind classes (last wins)", () => {
    const result = cn("p-2", "p-4");
    expect(result).toBe("p-4");
  });
});

describe("formatDate", () => {
  it("formats string date input", () => {
    const result = formatDate("2024-01-15");
    expect(result).toBe("January 15, 2024");
  });

  it("formats numeric timestamp", () => {
    // 1705276800000 = Jan 15, 2024 00:00:00 UTC
    const result = formatDate(1705276800000);
    expect(result).toMatch(/January 1[45], 2024/);
  });
});

describe("absoluteUrl", () => {
  it("returns concatenated URL", () => {
    expect(absoluteUrl("/about")).toBe("https://test.relaycode.org/about");
  });

  it("handles root path", () => {
    expect(absoluteUrl("/")).toBe("https://test.relaycode.org/");
  });
});

describe("constructMetadata", () => {
  it("returns defaults when called with no args", () => {
    const meta = constructMetadata();
    expect(meta.title).toBe("Relaycode");
    expect(meta.description).toBe("Test description");
  });

  it("uses custom values", () => {
    const meta = constructMetadata({
      title: "Custom Title",
      description: "Custom description",
    });
    expect(meta.title).toBe("Custom Title");
    expect(meta.description).toBe("Custom description");
  });

  it("adds robots noIndex when noIndex is true", () => {
    const meta = constructMetadata({ noIndex: true });
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it("does not include robots when noIndex is false", () => {
    const meta = constructMetadata({ noIndex: false });
    expect(meta.robots).toBeUndefined();
  });
});
