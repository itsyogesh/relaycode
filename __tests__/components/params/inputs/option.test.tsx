jest.mock("../../../../env.mjs", () => ({ env: {} }));

jest.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: any) => children,
  motion: {
    div: (props: any) => <div {...props} />,
  },
}));

jest.mock("../../../../components/ui/form", () => ({
  FormDescription: ({ children, ...props }: any) => <p {...props}>{children}</p>,
}));

jest.mock("../../../../lib/input-map", () => {
  const React = require("react");
  const SubInput = (props: any) => {
    const { name, onChange, value, label } = props;
    return React.createElement("div", null,
      label ? React.createElement("span", null, typeof label === "string" ? label : "sub-label") : null,
      React.createElement("input", {
        "data-testid": `sub-${name}`,
        value: value ?? "",
        onChange: (e: any) => onChange?.(e.target.value),
      })
    );
  };
  return {
    findComponent: jest.fn().mockReturnValue({
      component: SubInput,
      schema: {},
    }),
  };
});

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Option } from "../../../../components/params/inputs/option";
import { createMockDedotClient, createEnumTypeMock } from "../../../helpers/mock-client";

// A mock child component for the children-based rendering path
const MockChild = ({ name, onChange, value }: any) => (
  <input
    data-testid={`sub-${name || "child"}`}
    value={value ?? ""}
    onChange={(e) => onChange?.(e.target.value)}
  />
);

const baseProps = {
  name: "testOption",
  label: "Optional Field",
  client: {} as any,
};

describe("Option", () => {
  it("renders None/Some labels and switch toggle", () => {
    render(<Option {...baseProps} />);
    expect(screen.getByText("Optional Field")).toBeInTheDocument();
    expect(screen.getByText("None")).toBeInTheDocument();
    // Switch button should exist
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("defaults to None mode", () => {
    render(<Option {...baseProps} />);
    expect(screen.getByText("None")).toBeInTheDocument();
    expect(screen.getByRole("switch")).not.toBeChecked();
  });

  it("toggling to Some reveals inner component when children provided", () => {
    render(
      <Option {...baseProps}>
        <MockChild name="inner" />
      </Option>
    );
    // Initially None - child should not be visible
    expect(screen.queryByTestId("sub-inner")).not.toBeInTheDocument();

    // Toggle switch to Some
    fireEvent.click(screen.getByRole("switch"));
    expect(screen.getByText("Some")).toBeInTheDocument();
    expect(screen.getByTestId("sub-inner")).toBeInTheDocument();
  });

  it("None calls onChange(undefined)", () => {
    const onChange = jest.fn();
    render(
      <Option {...baseProps} onChange={onChange}>
        <MockChild name="inner" />
      </Option>
    );
    // Toggle to Some first
    fireEvent.click(screen.getByRole("switch"));
    // Toggle back to None
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  it("Some emits inner value through onChange", () => {
    const onChange = jest.fn();
    render(
      <Option {...baseProps} onChange={onChange}>
        <MockChild name="inner" />
      </Option>
    );
    // Toggle to Some
    fireEvent.click(screen.getByRole("switch"));
    // Type in the inner input
    const innerInput = screen.getByTestId("sub-inner");
    fireEvent.change(innerInput, { target: { value: "someValue" } });
    expect(onChange).toHaveBeenCalledWith("someValue");
  });

  it("resolves inner type from metadata via findComponent", () => {
    const optionEnumMock = createEnumTypeMock([
      { name: "None", fields: [], index: 0 },
      {
        name: "Some",
        fields: [{ typeId: 42, typeName: "BalanceOf" }],
        index: 1,
      },
    ]);
    const client = createMockDedotClient({
      registry: {
        findType: jest.fn().mockImplementation((id: number) => {
          if (id === 99) return optionEnumMock;
          // Inner type
          return {
            typeDef: { type: "Primitive", value: { kind: "u128" } },
            path: ["pallet_balances", "BalanceOf"],
          };
        }),
      },
    });

    render(<Option {...baseProps} client={client} typeId={99} />);
    // Toggle to Some
    fireEvent.click(screen.getByRole("switch"));
    // The resolved component should be rendered
    expect(screen.getByTestId("sub-testOption-value")).toBeInTheDocument();
  });

  it("auto-enables when external value is provided (not null/undefined)", () => {
    render(<Option {...baseProps} value="existingValue" />);
    // Should auto-switch to Some
    expect(screen.getByText("Some")).toBeInTheDocument();
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("stays in None when external value is undefined", () => {
    render(<Option {...baseProps} value={undefined} />);
    expect(screen.getByText("None")).toBeInTheDocument();
    expect(screen.getByRole("switch")).not.toBeChecked();
  });

  it("renders required asterisk", () => {
    render(<Option {...baseProps} isRequired />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<Option {...baseProps} description="An optional parameter" />);
    expect(screen.getByText("An optional parameter")).toBeInTheDocument();
  });

  it("renders error when provided", () => {
    render(<Option {...baseProps} error="Option error" />);
    expect(screen.getByText("Option error")).toBeInTheDocument();
  });
});
