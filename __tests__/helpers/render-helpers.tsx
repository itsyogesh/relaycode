import React from "react";
import { render } from "@testing-library/react";
import { createMockDedotClient } from "./mock-client";

export function createBaseParamProps(overrides?: Partial<any>) {
  return {
    name: "test-field",
    label: "Test Label",
    client: createMockDedotClient(),
    onChange: jest.fn(),
    ...overrides,
  };
}

export function renderParamInput(
  Component: React.ComponentType<any>,
  overrides?: any
) {
  const props = createBaseParamProps(overrides);
  return { ...render(<Component {...props} />), props };
}
