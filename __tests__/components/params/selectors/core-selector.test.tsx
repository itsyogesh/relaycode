jest.mock("../../../../env.mjs", () => ({ env: {} }));

jest.mock("lucide-react", () => ({
  Check: () => <span data-testid="check-icon" />,
  ChevronsUpDown: () => <span data-testid="chevrons-icon" />,
  Info: () => <span data-testid="info-icon" />,
  AlertCircle: () => <span data-testid="alert-icon" />,
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CoreSelector } from "../../../../components/params/selectors/core-selector";
import type { CoretimeContext } from "../../../../types/pallet-context";

const coretimeContext: CoretimeContext = {
  type: "coretime",
  cores: [
    { core: 0, begin: 100, end: 200 },
    { core: 1, begin: 100, end: 200 },
    { core: 5, begin: 150, end: 250 },
  ],
  currentPrice: "50000000000",
  tokenSymbol: "DOT",
  tokenDecimals: 10,
};

const baseProps = {
  name: "core",
  client: {} as any,
};

describe("CoreSelector", () => {
  it("shows skeleton when isContextLoading is true", () => {
    render(
      <CoreSelector {...baseProps} label="Core" isContextLoading={true} />
    );
    expect(screen.getByText("Core")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("shows fallback when no palletContext", () => {
    render(<CoreSelector {...baseProps} label="Core" />);
    expect(
      screen.getByText("Context unavailable — enter value manually")
    ).toBeInTheDocument();
  });

  it("renders cores", () => {
    render(
      <CoreSelector
        {...baseProps}
        label="Core"
        palletContext={coretimeContext}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("Core 0")).toBeInTheDocument();
    expect(screen.getByText("Core 1")).toBeInTheDocument();
    expect(screen.getByText("Core 5")).toBeInTheDocument();
  });

  it("footer shows sale price info", () => {
    render(
      <CoreSelector
        {...baseProps}
        label="Core"
        palletContext={coretimeContext}
      />
    );
    // Footer is always rendered (outside popover), shows current sale price
    // 50000000000 planck / 10^10 = 5 DOT
    expect(screen.getByText("Current sale price: 5 DOT")).toBeInTheDocument();
  });

  it("selection calls onChange with core number", () => {
    const onChange = jest.fn();
    render(
      <CoreSelector
        {...baseProps}
        label="Core"
        palletContext={coretimeContext}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    const options = screen.getAllByRole("option");
    fireEvent.click(options[2]); // core 5
    expect(onChange).toHaveBeenCalledWith(5);
  });
});
