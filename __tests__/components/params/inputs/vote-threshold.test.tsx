jest.mock("../../../../env.mjs", () => ({ env: {} }));

// Mock FormDescription to avoid form context requirement
jest.mock("@/components/ui/form", () => ({
  FormDescription: ({ children, ...props }: any) => (
    <p data-testid="form-description" {...props}>
      {children}
    </p>
  ),
}));

// Radix Select uses portals and pointer events that are hard to test.
// We mock the entire Select component set with simple HTML equivalents.
jest.mock("@/components/ui/select", () => {
  const React = require("react");

  function Select({
    children,
    onValueChange,
    disabled,
  }: {
    children: React.ReactNode;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
  }) {
    const contextValue = React.useMemo(
      () => ({ onValueChange, disabled }),
      [onValueChange, disabled]
    );
    return (
      <SelectContext.Provider value={contextValue}>
        {children}
      </SelectContext.Provider>
    );
  }

  const SelectContext = React.createContext<{
    onValueChange?: (value: string) => void;
    disabled?: boolean;
  }>({});

  function SelectTrigger({
    children,
    id,
  }: {
    children: React.ReactNode;
    id?: string;
  }) {
    return (
      <div data-testid="select-trigger" id={id}>
        {children}
      </div>
    );
  }

  function SelectValue({ placeholder }: { placeholder?: string }) {
    return <span>{placeholder}</span>;
  }

  function SelectContent({ children }: { children: React.ReactNode }) {
    return <div data-testid="select-content">{children}</div>;
  }

  function SelectItem({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) {
    const { onValueChange } = React.useContext(SelectContext);
    return (
      <button
        role="option"
        data-value={value}
        onClick={() => onValueChange?.(value)}
      >
        {children}
      </button>
    );
  }

  return {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
  };
});

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { VoteThreshold } from "../../../../components/params/inputs/vote-threshold";

const baseProps = {
  name: "threshold",
  client: {} as any,
};

describe("VoteThreshold", () => {
  it("renders label and select with 3 options", () => {
    render(<VoteThreshold {...baseProps} label="Threshold" />);
    expect(screen.getByText("Threshold")).toBeInTheDocument();
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
    expect(screen.getByText("Super Majority Approve")).toBeInTheDocument();
    expect(screen.getByText("Super Majority Against")).toBeInTheDocument();
    expect(screen.getByText("Simple Majority")).toBeInTheDocument();
  });

  it("calls onChange with selected value", () => {
    const onChange = jest.fn();
    render(
      <VoteThreshold {...baseProps} label="Threshold" onChange={onChange} />
    );
    fireEvent.click(screen.getByText("Simple Majority"));
    expect(onChange).toHaveBeenCalledWith("SimpleMajority");
  });

  it("shows error message", () => {
    render(
      <VoteThreshold
        {...baseProps}
        label="Threshold"
        error="Required field"
      />
    );
    expect(screen.getByText("Required field")).toBeInTheDocument();
  });

  it("shows required asterisk", () => {
    render(<VoteThreshold {...baseProps} label="Threshold" isRequired />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <VoteThreshold
        {...baseProps}
        label="Threshold"
        description="Choose a threshold type"
      />
    );
    expect(screen.getByText("Choose a threshold type")).toBeInTheDocument();
  });
});
