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
import { KeyValue } from "../../../../components/params/inputs/key-value";
import { createMockDedotClient } from "../../../helpers/mock-client";

const baseProps = {
  name: "testKv",
  label: "Key-Value",
  client: {} as any,
};

describe("KeyValue", () => {
  it("renders two text inputs by default (no client/typeId)", () => {
    render(<KeyValue {...baseProps} client={undefined as any} />);
    expect(screen.getByText("Key-Value")).toBeInTheDocument();
    // Default text inputs for Key and Value
    expect(screen.getByText("Key")).toBeInTheDocument();
    expect(screen.getByText("Value")).toBeInTheDocument();
    // Two text inputs
    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(2);
  });

  it("renders label with required asterisk", () => {
    render(<KeyValue {...baseProps} isRequired />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("calls onChange with {key, value} when both filled", () => {
    const onChange = jest.fn();
    render(<KeyValue {...baseProps} client={undefined as any} onChange={onChange} />);
    const inputs = screen.getAllByRole("textbox");
    // Fill key
    fireEvent.change(inputs[0], { target: { value: "myKey" } });
    // At this point value is still undefined, so onChange should emit undefined
    expect(onChange).toHaveBeenLastCalledWith(undefined);

    // Fill value
    fireEvent.change(inputs[1], { target: { value: "myValue" } });
    expect(onChange).toHaveBeenLastCalledWith({ key: "myKey", value: "myValue" });
  });

  it("calls onChange(undefined) when key is undefined (only value set)", () => {
    const onChange = jest.fn();
    render(<KeyValue {...baseProps} client={undefined as any} onChange={onChange} />);
    const inputs = screen.getAllByRole("textbox");
    // Only fill value, leave key empty
    fireEvent.change(inputs[1], { target: { value: "onlyValue" } });
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  it("renders typed sub-components when client/typeId provided", () => {
    // Tuple type mock with fields as plain numbers (how Dedot stores Tuple fields)
    const tupleMock = {
      typeDef: {
        type: "Tuple" as const,
        value: {
          fields: [10, 20],
        },
      },
    };
    const client = createMockDedotClient({
      registry: {
        findType: jest.fn().mockImplementation((id: number) => {
          if (id === 99) return tupleMock;
          return {
            typeDef: { type: "Primitive", value: { kind: "u32" } },
            path: ["sp_core", id === 10 ? "KeyType" : "ValueType"],
          };
        }),
      },
    });

    render(<KeyValue {...baseProps} client={client} typeId={99} />);
    // The mock findComponent returns SubInput which renders with label
    expect(screen.getByText("Key")).toBeInTheDocument();
    expect(screen.getByText("Value")).toBeInTheDocument();
    // Sub inputs should be rendered from findComponent
    expect(screen.getByTestId("sub-testKv-key")).toBeInTheDocument();
    expect(screen.getByTestId("sub-testKv-value")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<KeyValue {...baseProps} description="A key-value pair" />);
    expect(screen.getByText("A key-value pair")).toBeInTheDocument();
  });

  it("renders error when provided", () => {
    render(<KeyValue {...baseProps} error="KV error" />);
    expect(screen.getByText("KV error")).toBeInTheDocument();
  });

  it("typed sub-components call onChange correctly", () => {
    const onChange = jest.fn();
    const tupleMock = {
      typeDef: {
        type: "Tuple" as const,
        value: {
          fields: [10, 20],
        },
      },
    };
    const client = createMockDedotClient({
      registry: {
        findType: jest.fn().mockImplementation((id: number) => {
          if (id === 99) return tupleMock;
          return {
            typeDef: { type: "Primitive", value: { kind: "u32" } },
            path: ["sp_core", id === 10 ? "KeyType" : "ValueType"],
          };
        }),
      },
    });

    render(<KeyValue {...baseProps} client={client} typeId={99} onChange={onChange} />);
    const keyInput = screen.getByTestId("sub-testKv-key");
    const valInput = screen.getByTestId("sub-testKv-value");

    fireEvent.change(keyInput, { target: { value: "k1" } });
    // Only key set, value still undefined
    expect(onChange).toHaveBeenLastCalledWith(undefined);

    fireEvent.change(valInput, { target: { value: "v1" } });
    expect(onChange).toHaveBeenLastCalledWith({ key: "k1", value: "v1" });
  });
});
