jest.mock("../../../../env.mjs", () => ({ env: {} }));

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
import { Enum } from "../../../../components/params/inputs/enum";
import { createMockDedotClient, createEnumTypeMock } from "../../../helpers/mock-client";

const baseProps = {
  name: "testEnum",
  label: "Reward Destination",
  client: {} as any,
};

// Simple no-field variants
const simpleVariants = [
  { name: "Staked", fields: [] as any[] },
  { name: "Stash", fields: [] as any[] },
  { name: "Controller", fields: [] as any[] },
];

// Variants with fields
const fieldVariants = [
  { name: "None", fields: [] as any[] },
  {
    name: "Account",
    fields: [{ typeId: 0, typeName: "AccountId32", name: "account" }],
  },
  {
    name: "Complex",
    fields: [
      { typeId: 1, typeName: "u32", name: "amount" },
      { typeId: 2, typeName: "bool", name: "active" },
    ],
  },
];

describe("Enum", () => {
  it("renders variant select dropdown from explicit variants", () => {
    render(<Enum {...baseProps} variants={simpleVariants} />);
    expect(screen.getByText("Reward Destination")).toBeInTheDocument();
    // The select trigger should be rendered
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("auto-selects first variant and emits for no-field variant", () => {
    const onChange = jest.fn();
    render(<Enum {...baseProps} variants={simpleVariants} onChange={onChange} />);
    // First variant "Staked" should be auto-selected and emitted (since no fields)
    expect(onChange).toHaveBeenCalledWith({ type: "Staked" });
  });

  it("emits {type: 'VariantName'} for no-field variants", () => {
    const onChange = jest.fn();
    render(<Enum {...baseProps} variants={simpleVariants} onChange={onChange} />);
    expect(onChange).toHaveBeenCalledWith({ type: "Staked" });
  });

  it("renders variant select from metadata when client/typeId provided", () => {
    const enumMock = createEnumTypeMock([
      { name: "Staked", fields: [], index: 0 },
      { name: "Stash", fields: [], index: 1 },
    ]);
    const client = createMockDedotClient({
      registry: {
        findType: jest.fn().mockReturnValue(enumMock),
      },
    });

    const onChange = jest.fn();
    render(<Enum {...baseProps} client={client} typeId={42} variants={[]} onChange={onChange} />);
    // Should auto-select first variant from metadata
    expect(onChange).toHaveBeenCalledWith({ type: "Staked" });
  });

  it("shows sub-component when variant with single field is selected via external value", () => {
    render(
      <Enum
        {...baseProps}
        variants={fieldVariants}
        client={{} as any}
        value={{ type: "Account", value: "some-account" }}
      />
    );
    // The sub-input should be rendered for the Account variant
    expect(screen.getByTestId("sub-testEnum-value")).toBeInTheDocument();
  });

  it("multi-field variant renders nested components with field labels", () => {
    render(
      <Enum
        {...baseProps}
        variants={fieldVariants}
        client={{} as any}
        value={{ type: "Complex" }}
      />
    );
    // Multiple sub-inputs should be rendered
    expect(screen.getByTestId("sub-testEnum-amount")).toBeInTheDocument();
    expect(screen.getByTestId("sub-testEnum-active")).toBeInTheDocument();
  });

  it("external value with missing variant gracefully falls back", () => {
    // Set external value with a variant that doesn't exist in the list
    render(
      <Enum
        {...baseProps}
        variants={simpleVariants}
        value={{ type: "NonExistent" }}
      />
    );
    // Should not crash - the select will show the value but no sub-component
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("enum with zero variants renders without crash", () => {
    render(<Enum {...baseProps} variants={[]} />);
    expect(screen.getByText("Reward Destination")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders required asterisk", () => {
    render(<Enum {...baseProps} variants={simpleVariants} isRequired />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <Enum {...baseProps} variants={simpleVariants} description="Choose destination" />
    );
    expect(screen.getByText("Choose destination")).toBeInTheDocument();
  });

  it("renders error when provided", () => {
    render(<Enum {...baseProps} variants={simpleVariants} error="Select a variant" />);
    expect(screen.getByText("Select a variant")).toBeInTheDocument();
  });

  it("single-field variant emits onChange with type and value", () => {
    const onChange = jest.fn();
    render(
      <Enum
        {...baseProps}
        variants={fieldVariants}
        client={{} as any}
        onChange={onChange}
        value={{ type: "Account" }}
      />
    );
    // The sub-input should be rendered
    const subInput = screen.getByTestId("sub-testEnum-value");
    fireEvent.change(subInput, { target: { value: "newAccount" } });
    expect(onChange).toHaveBeenCalledWith({ type: "Account", value: "newAccount" });
  });
});
