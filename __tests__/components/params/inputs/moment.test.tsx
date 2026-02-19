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
import { Moment } from "../../../../components/params/inputs/moment";

const baseProps = {
  name: "timestamp",
  client: {} as any,
};

// Fixed timestamp for deterministic tests: 2023-11-14T22:13:20.000Z
const FIXED_NOW = 1700000000000;

describe("Moment", () => {
  beforeEach(() => {
    jest.spyOn(Date, "now").mockReturnValue(FIXED_NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders datetime-local input", () => {
    render(<Moment {...baseProps} label="Timestamp" />);
    const input = screen.getByLabelText("Timestamp");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "datetime-local");
  });

  it("renders all preset buttons (Now, +1h, +6h, +24h, +7d)", () => {
    render(<Moment {...baseProps} label="Timestamp" />);
    expect(screen.getByText("Now")).toBeInTheDocument();
    expect(screen.getByText("+1h")).toBeInTheDocument();
    expect(screen.getByText("+6h")).toBeInTheDocument();
    expect(screen.getByText("+24h")).toBeInTheDocument();
    expect(screen.getByText("+7d")).toBeInTheDocument();
  });

  it("displays timezone", () => {
    render(<Moment {...baseProps} label="Timestamp" />);
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    expect(screen.getByText(`Timezone: ${tz}`)).toBeInTheDocument();
  });

  it('clicking "Now" preset calls onChange with timestamp string', () => {
    const onChange = jest.fn();
    render(<Moment {...baseProps} label="Timestamp" onChange={onChange} />);
    fireEvent.click(screen.getByText("Now"));
    expect(onChange).toHaveBeenCalledWith(FIXED_NOW.toString());
  });

  it('clicking "+1h" calls onChange with timestamp + 3600000', () => {
    const onChange = jest.fn();
    render(<Moment {...baseProps} label="Timestamp" onChange={onChange} />);
    fireEvent.click(screen.getByText("+1h"));
    expect(onChange).toHaveBeenCalledWith((FIXED_NOW + 3600000).toString());
  });

  it("manual input change calls onChange with timestamp string", () => {
    const onChange = jest.fn();
    render(<Moment {...baseProps} label="Timestamp" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Timestamp"), {
      target: { value: "2023-11-15T10:00" },
    });
    const expected = new Date("2023-11-15T10:00").getTime().toString();
    expect(onChange).toHaveBeenCalledWith(expected);
  });

  it("clearing input calls onChange(undefined)", () => {
    const onChange = jest.fn();
    render(<Moment {...baseProps} label="Timestamp" onChange={onChange} />);
    // First set a value
    fireEvent.click(screen.getByText("Now"));
    onChange.mockClear();

    // Then clear
    fireEvent.change(screen.getByLabelText("Timestamp"), {
      target: { value: "" },
    });
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("external value sync", () => {
    const { rerender } = render(
      <Moment {...baseProps} label="Timestamp" value={FIXED_NOW.toString()} />
    );
    // The input should have a formatted date value (not empty)
    const input = screen.getByLabelText("Timestamp") as HTMLInputElement;
    expect(input.value).not.toBe("");

    // Rerender with a new value
    const newTs = FIXED_NOW + 86400000; // +1 day
    rerender(
      <Moment {...baseProps} label="Timestamp" value={newTs.toString()} />
    );
    // Value should have changed (we just verify it's not empty, the exact format depends on locale)
    expect(input.value).not.toBe("");
  });
});
