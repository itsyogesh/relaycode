jest.mock("../../../../env.mjs", () => ({ env: {} }));

jest.mock("../../../../components/ui/form", () => ({
  FormDescription: ({ children, ...props }: any) => <p {...props}>{children}</p>,
}));

jest.mock("../../../../lib/validation", () => ({
  validateStructFields: jest.fn().mockReturnValue({ valid: true }),
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Struct } from "../../../../components/params/inputs/struct";

const baseProps = {
  name: "testStruct",
  label: "Transfer Info",
  client: {} as any,
};

// A simple test component that renders an input.
// When cloned by Struct, it receives props like name, label, onChange, etc.
function TestFieldInput(props: any) {
  return (
    <div>
      {props.label && <div data-testid={`label-${props.name || "unknown"}`}>{props.label}</div>}
      <input
        data-testid={`field-${props.name || "unknown"}`}
        onChange={(e) => props.onChange?.(e.target.value)}
      />
    </div>
  );
}

// Helper: create a field with a simple input as its component
function createField(
  name: string,
  label: string,
  typeName?: string,
  required?: boolean
) {
  return {
    name,
    label,
    typeName,
    required,
    component: <TestFieldInput />,
  };
}

describe("Struct", () => {
  it("renders the struct label", () => {
    const fields = [
      createField("dest", "Destination", "AccountId32"),
      createField("amount", "Amount", "u128"),
    ];
    render(<Struct {...baseProps} fields={fields} />);
    expect(screen.getByText("Transfer Info")).toBeInTheDocument();
  });

  it("renders within a card wrapper", () => {
    const fields = [createField("dest", "Destination")];
    const { container } = render(<Struct {...baseProps} fields={fields} />);
    // The Card component renders with the class "rounded-xl border bg-card..."
    const card = container.querySelector(".rounded-xl.border.bg-card");
    expect(card).toBeInTheDocument();
  });

  it("calls onChange with Record of field values", () => {
    const onChange = jest.fn();
    const fields = [
      createField("dest", "Destination"),
      createField("amount", "Amount"),
    ];
    render(<Struct {...baseProps} fields={fields} onChange={onChange} />);

    // The fields are cloned with name = "testStruct-dest" and "testStruct-amount"
    const destInput = screen.getByTestId("field-testStruct-dest");
    const amountInput = screen.getByTestId("field-testStruct-amount");

    fireEvent.change(destInput, { target: { value: "alice" } });
    expect(onChange).toHaveBeenCalledWith({ dest: "alice" });

    fireEvent.change(amountInput, { target: { value: "100" } });
    expect(onChange).toHaveBeenCalledWith({ dest: "alice", amount: "100" });
  });

  it("empty fields array renders without crash", () => {
    render(<Struct {...baseProps} fields={[]} />);
    expect(screen.getByText("Transfer Info")).toBeInTheDocument();
  });

  it("typeName badge shown for fields with typeName", () => {
    const fields = [createField("dest", "Destination", "AccountId32")];
    render(<Struct {...baseProps} fields={fields} />);
    // The typeName is rendered as a <code> element inside the cloned label
    const codeEl = screen.getByText("AccountId32");
    expect(codeEl).toBeInTheDocument();
    expect(codeEl.tagName).toBe("CODE");
  });

  it("renders required asterisk on label", () => {
    render(<Struct {...baseProps} fields={[]} isRequired />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<Struct {...baseProps} fields={[]} description="Struct info" />);
    expect(screen.getByText("Struct info")).toBeInTheDocument();
  });

  it("renders error message when provided", () => {
    render(<Struct {...baseProps} fields={[]} error="Missing fields" />);
    expect(screen.getByText("Missing fields")).toBeInTheDocument();
  });

  it("hydrates child inputs from external value prop", () => {
    const onChange = jest.fn();
    const fields = [
      createField("refTime", "Ref Time"),
      createField("proofSize", "Proof Size"),
    ];

    const { rerender } = render(
      <Struct {...baseProps} fields={fields} onChange={onChange} />
    );

    // Now set external value — simulating gas estimation auto-fill
    rerender(
      <Struct
        {...baseProps}
        fields={fields}
        onChange={onChange}
        value={{ refTime: "1000", proofSize: "2000" }}
      />
    );

    // The child inputs should receive the values via cloneElement
    const refTimeInput = screen.getByTestId("field-testStruct-refTime");
    const proofSizeInput = screen.getByTestId("field-testStruct-proofSize");

    // The TestFieldInput component doesn't render value, but onChange should
    // have been called with the synced values. Since useEffect triggers
    // setValues but not onChange (only handleFieldChange calls onChange),
    // we verify the internal state was updated by checking that a subsequent
    // field change includes the externally-set values
    fireEvent.change(refTimeInput, { target: { value: "3000" } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ refTime: "3000", proofSize: "2000" })
    );
  });

  it("does not loop when external value matches internal state", () => {
    const onChange = jest.fn();
    const fields = [createField("a", "A"), createField("b", "B")];
    const value = { a: "1", b: "2" };

    const { rerender } = render(
      <Struct {...baseProps} fields={fields} onChange={onChange} value={value} />
    );

    // Rerender with same value — should not cause extra renders
    rerender(
      <Struct {...baseProps} fields={fields} onChange={onChange} value={value} />
    );

    // Verify the component didn't explode — no infinite loop
    expect(screen.getByText("Transfer Info")).toBeInTheDocument();
  });

  it("emits object-valued onChange (not string)", () => {
    const onChange = jest.fn();
    const fields = [
      createField("x", "X"),
      createField("y", "Y"),
    ];
    render(<Struct {...baseProps} fields={fields} onChange={onChange} />);

    const xInput = screen.getByTestId("field-testStruct-x");
    fireEvent.change(xInput, { target: { value: "hello" } });

    // onChange should receive an object, not a string
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ x: "hello" }));
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(typeof lastCall).toBe("object");
  });
});
