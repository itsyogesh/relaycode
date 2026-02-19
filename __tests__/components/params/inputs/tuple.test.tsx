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
import { Tuple } from "../../../../components/params/inputs/tuple";
import { createMockDedotClient } from "../../../helpers/mock-client";

const baseProps = {
  name: "testTuple",
  label: "Tuple Field",
  client: undefined as any,
  typeId: 99,
};

describe("Tuple", () => {
  it("shows 'Unable to resolve' when no client", () => {
    render(<Tuple {...baseProps} />);
    expect(screen.getByText("Unable to resolve tuple structure")).toBeInTheDocument();
  });

  it("shows 'Unable to resolve' when typeId is undefined", () => {
    render(<Tuple {...baseProps} typeId={undefined as any} />);
    expect(screen.getByText("Unable to resolve tuple structure")).toBeInTheDocument();
  });

  it("resolves fields from registry and renders sub-components", () => {
    // In Dedot, Tuple fields are plain typeId numbers
    const tupleMock = {
      typeDef: {
        type: "Tuple" as const,
        value: { fields: [10, 20] },
      },
    };

    const client = createMockDedotClient({
      registry: {
        findType: jest.fn().mockImplementation((id: number) => {
          if (id === 99) return tupleMock;
          if (id === 10) {
            return {
              typeDef: { type: "Primitive", value: { kind: "u32" } },
              path: ["sp_runtime", "multiaddress", "MultiAddress"],
            };
          }
          if (id === 20) {
            return {
              typeDef: { type: "Primitive", value: { kind: "u128" } },
              path: ["pallet_balances", "BalanceOf"],
            };
          }
          return {
            typeDef: { type: "Primitive", value: { kind: "u32" } },
            path: [],
          };
        }),
      },
    });

    render(<Tuple {...baseProps} client={client} />);
    // Should render sub-components for each tuple field
    expect(screen.getByTestId("sub-testTuple-0")).toBeInTheDocument();
    expect(screen.getByTestId("sub-testTuple-1")).toBeInTheDocument();
    // Labels should use shortTypeName: "MultiAddress [0]" and "BalanceOf [1]"
    expect(screen.getByText("MultiAddress [0]")).toBeInTheDocument();
    expect(screen.getByText("BalanceOf [1]")).toBeInTheDocument();
  });

  it("calls onChange with array of values", () => {
    const onChange = jest.fn();
    const tupleMock = {
      typeDef: {
        type: "Tuple" as const,
        value: { fields: [10, 20] },
      },
    };
    const client = createMockDedotClient({
      registry: {
        findType: jest.fn().mockImplementation((id: number) => {
          if (id === 99) return tupleMock;
          return {
            typeDef: { type: "Primitive", value: { kind: "u32" } },
            path: ["SomeType"],
          };
        }),
      },
    });

    render(<Tuple {...baseProps} client={client} onChange={onChange} />);
    const input0 = screen.getByTestId("sub-testTuple-0");
    fireEvent.change(input0, { target: { value: "hello" } });
    // Should emit array with value at index 0
    expect(onChange).toHaveBeenCalledWith(["hello", undefined]);
  });

  it("tuple with 0 fields shows unable to resolve", () => {
    const tupleMock = {
      typeDef: {
        type: "Tuple" as const,
        value: { fields: [] as number[] },
      },
    };
    const client = createMockDedotClient({
      registry: {
        findType: jest.fn().mockReturnValue(tupleMock),
      },
    });

    render(<Tuple {...baseProps} client={client} />);
    expect(screen.getByText("Unable to resolve tuple structure")).toBeInTheDocument();
  });

  it("renders required asterisk", () => {
    render(<Tuple {...baseProps} isRequired />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders error when provided", () => {
    render(<Tuple {...baseProps} error="Tuple error" />);
    expect(screen.getByText("Tuple error")).toBeInTheDocument();
  });
});
