jest.mock("../../../../env.mjs", () => ({ env: {} }));

jest.mock("lucide-react", () => ({
  Check: () => <span data-testid="check-icon" />,
  Vote: () => <span data-testid="vote-icon" />,
  ChevronsUpDown: () => <span data-testid="chevrons-icon" />,
  Info: () => <span data-testid="info-icon" />,
  AlertCircle: () => <span data-testid="alert-icon" />,
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReferendumSelector } from "../../../../components/params/selectors/referendum-selector";
import type { GovernanceContext } from "../../../../types/pallet-context";

const governanceContext: GovernanceContext = {
  type: "governance",
  referenda: [
    {
      index: 100,
      title: "Upgrade Runtime",
      status: "Deciding",
      trackId: 0,
      trackName: "Root",
      tally: { ayes: "7000", nays: "3000", support: "1000" },
    },
    {
      index: 101,
      title: "Fund Treasury",
      status: "Confirming",
      trackId: 1,
      trackName: "Whitelisted Caller",
    },
    {
      index: 50,
      title: "Old Proposal",
      status: "Approved",
      trackId: 10,
      trackName: "Staking Admin",
    },
  ],
  tracks: [],
  bounties: [],
  tokenSymbol: "DOT",
  tokenDecimals: 10,
};

const baseProps = {
  name: "ref_index",
  client: {} as any,
};

describe("ReferendumSelector", () => {
  it("shows skeleton when isContextLoading is true", () => {
    render(
      <ReferendumSelector
        {...baseProps}
        label="Referendum"
        isContextLoading={true}
      />
    );
    expect(screen.getByText("Referendum")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("shows fallback when no palletContext", () => {
    render(<ReferendumSelector {...baseProps} label="Referendum" />);
    expect(
      screen.getByText("Context unavailable — enter value manually")
    ).toBeInTheDocument();
  });

  it("renders active referenda by default", () => {
    render(
      <ReferendumSelector
        {...baseProps}
        label="Referendum"
        palletContext={governanceContext}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    // Active filter: Deciding and Confirming should show
    expect(screen.getByText("Upgrade Runtime")).toBeInTheDocument();
    expect(screen.getByText("Fund Treasury")).toBeInTheDocument();
    // Approved is not active
    expect(screen.queryByText("Old Proposal")).not.toBeInTheDocument();
  });

  it("shows all referenda when All filter is clicked", () => {
    render(
      <ReferendumSelector
        {...baseProps}
        label="Referendum"
        palletContext={governanceContext}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    // Click the "All" button in the header
    const allButton = screen.getByText("All");
    fireEvent.click(allButton);
    expect(screen.getByText("Old Proposal")).toBeInTheDocument();
    expect(screen.getByText("Upgrade Runtime")).toBeInTheDocument();
    expect(screen.getByText("Fund Treasury")).toBeInTheDocument();
  });

  it("selection calls onChange with referendum index", () => {
    const onChange = jest.fn();
    render(
      <ReferendumSelector
        {...baseProps}
        label="Referendum"
        palletContext={governanceContext}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    const options = screen.getAllByRole("option");
    fireEvent.click(options[0]); // index 100
    expect(onChange).toHaveBeenCalledWith(100);
  });
});
