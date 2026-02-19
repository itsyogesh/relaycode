jest.mock("../../../../env.mjs", () => ({ env: {} }));

jest.mock("lucide-react", () => ({
  Check: () => <span data-testid="check-icon" />,
  ChevronsUpDown: () => <span data-testid="chevrons-icon" />,
  Info: () => <span data-testid="info-icon" />,
  AlertCircle: () => <span data-testid="alert-icon" />,
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DestinationChainSelector } from "../../../../components/params/selectors/destination-chain-selector";
import type { XcmContext } from "../../../../types/pallet-context";

const xcmContext: XcmContext = {
  type: "xcm",
  parachains: [
    { paraId: 1000, name: "Asset Hub" },
    { paraId: 1001, name: "Collectives" },
    { paraId: 2000, name: "Acala" },
    { paraId: 2004, name: "Moonbeam" },
  ],
  tokenSymbol: "DOT",
  tokenDecimals: 10,
};

const baseProps = {
  name: "dest",
  client: {} as any,
};

describe("DestinationChainSelector", () => {
  it("shows skeleton when isContextLoading is true", () => {
    render(
      <DestinationChainSelector
        {...baseProps}
        label="Destination"
        isContextLoading={true}
      />
    );
    expect(screen.getByText("Destination")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("shows fallback when no palletContext", () => {
    render(<DestinationChainSelector {...baseProps} label="Destination" />);
    expect(
      screen.getByText("Context unavailable — enter value manually")
    ).toBeInTheDocument();
  });

  it("renders parachains with id and name", () => {
    render(
      <DestinationChainSelector
        {...baseProps}
        label="Destination"
        palletContext={xcmContext}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("Asset Hub")).toBeInTheDocument();
    expect(screen.getByText("Collectives")).toBeInTheDocument();
    expect(screen.getByText("Acala")).toBeInTheDocument();
    expect(screen.getByText("Moonbeam")).toBeInTheDocument();
  });

  it("shows System badge for system parachains (paraId < 2000)", () => {
    render(
      <DestinationChainSelector
        {...baseProps}
        label="Destination"
        palletContext={xcmContext}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    // Asset Hub (1000) and Collectives (1001) should have System badge
    const systemBadges = screen.getAllByText("System");
    expect(systemBadges).toHaveLength(2);
  });

  it("selection calls onChange with parachain id", () => {
    const onChange = jest.fn();
    render(
      <DestinationChainSelector
        {...baseProps}
        label="Destination"
        palletContext={xcmContext}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    const options = screen.getAllByRole("option");
    fireEvent.click(options[2]); // Acala (2000)
    expect(onChange).toHaveBeenCalledWith(2000);
  });
});
