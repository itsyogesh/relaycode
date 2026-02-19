jest.mock("../../../../env.mjs", () => ({ env: {} }));

jest.mock("lucide-react", () => ({
  Info: () => <span data-testid="info-icon" />,
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { EraSelector } from "../../../../components/params/selectors/era-selector";

const baseProps = {
  name: "era",
  client: {} as any,
};

describe("EraSelector", () => {
  it("renders label and number input", () => {
    render(<EraSelector {...baseProps} label="Era Index" />);
    expect(screen.getByText("Era Index")).toBeInTheDocument();
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
  });

  it("shows no context hint when no palletContext", () => {
    render(<EraSelector {...baseProps} label="Era" />);
    expect(screen.queryByText(/Current era/)).not.toBeInTheDocument();
  });

  it("shows context hint with era values", () => {
    render(
      <EraSelector
        {...baseProps}
        label="Era"
        palletContext={{
          type: "staking",
          validators: [],
          pools: [],
          currentEra: 1234,
          activeEra: 1233,
          tokenSymbol: "DOT",
          tokenDecimals: 10,
        }}
      />
    );
    // The hint joins parts with " · "
    expect(screen.getByText("Current era: 1234 · Active era: 1233")).toBeInTheDocument();
  });

  it("fires onChange with number value", () => {
    const onChange = jest.fn();
    render(<EraSelector {...baseProps} label="Era" onChange={onChange} />);
    fireEvent.change(screen.getByRole("spinbutton"), {
      target: { value: "42" },
    });
    expect(onChange).toHaveBeenCalledWith(42);
  });
});
