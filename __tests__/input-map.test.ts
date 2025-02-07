// __tests__/input-map.test.ts
import { findComponent, paramComponents } from "../lib/input-map";

describe("findComponent", () => {
  it("should return the correct component for exact type matches", () => {
    // Exact matches: "bool", "number", "text"
    expect(findComponent("bool")).toEqual(paramComponents.bool);
    expect(findComponent("number")).toEqual(paramComponents.number);
    expect(findComponent("text")).toEqual(paramComponents.text);
  });

  it("should return the number component for known type categories", () => {
    // These types should fall through to the "number" category
    expect(findComponent("compact")).toEqual(paramComponents.number);
    expect(findComponent("T::Balance")).toEqual(paramComponents.number);
    expect(findComponent("T::Amount")).toEqual(paramComponents.number);
  });

  it("should default to the text component for unknown types", () => {
    // Any unknown type should return the text component
    expect(findComponent("unknownType")).toEqual(paramComponents.text);
  });
});
