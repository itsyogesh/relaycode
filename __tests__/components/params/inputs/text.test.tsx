jest.mock("../../../../env.mjs", () => ({ env: {} }));

// Mock FormDescription to avoid form context requirement
jest.mock("@/components/ui/form", () => ({
  FormDescription: ({ children, ...props }: any) => (
    <p data-testid="form-description" {...props}>
      {children}
    </p>
  ),
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Text } from "../../../../components/params/inputs/text";

const baseProps = {
  name: "myField",
  client: {} as any,
};

describe("Text", () => {
  it("renders label and text input", () => {
    render(<Text {...baseProps} label="My Label" />);
    expect(screen.getByText("My Label")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("calls onChange with string value on typing", () => {
    const onChange = jest.fn();
    render(<Text {...baseProps} label="Name" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "hello" },
    });
    expect(onChange).toHaveBeenCalledWith("hello");
  });

  it("syncs displayValue from external value prop", () => {
    const { rerender } = render(
      <Text {...baseProps} label="Name" value="initial" />
    );
    expect(screen.getByRole("textbox")).toHaveValue("initial");

    rerender(<Text {...baseProps} label="Name" value="updated" />);
    expect(screen.getByRole("textbox")).toHaveValue("updated");
  });

  it("shows placeholder with label/name", () => {
    render(<Text {...baseProps} label="Address" />);
    expect(screen.getByPlaceholderText("Enter Address")).toBeInTheDocument();
  });

  it("shows placeholder using name when label is absent", () => {
    render(<Text {...baseProps} />);
    expect(
      screen.getByPlaceholderText("Enter myField")
    ).toBeInTheDocument();
  });

  it("renders error message when error prop set", () => {
    render(<Text {...baseProps} label="Name" error="Field is required" />);
    expect(screen.getByText("Field is required")).toBeInTheDocument();
  });

  it("disabled state", () => {
    render(<Text {...baseProps} label="Name" isDisabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("shows required asterisk", () => {
    render(<Text {...baseProps} label="Name" isRequired />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });
});
