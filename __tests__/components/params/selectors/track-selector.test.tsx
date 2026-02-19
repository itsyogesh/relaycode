jest.mock("../../../../env.mjs", () => ({ env: {} }));

jest.mock("lucide-react", () => ({
  Check: () => <span data-testid="check-icon" />,
  ChevronsUpDown: () => <span data-testid="chevrons-icon" />,
  Info: () => <span data-testid="info-icon" />,
  AlertCircle: () => <span data-testid="alert-icon" />,
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TrackSelector } from "../../../../components/params/selectors/track-selector";
import type { GovernanceContext } from "../../../../types/pallet-context";

const governanceContext: GovernanceContext = {
  type: "governance",
  referenda: [],
  tracks: [
    { id: 0, name: "Root", maxDeciding: 1, currentDeciding: 0 },
    { id: 1, name: "Whitelisted Caller", maxDeciding: 10, currentDeciding: 3 },
    { id: 10, name: "Staking Admin" },
  ],
  bounties: [],
  tokenSymbol: "DOT",
  tokenDecimals: 10,
};

const baseProps = {
  name: "track_id",
  client: {} as any,
};

describe("TrackSelector", () => {
  it("shows skeleton when isContextLoading is true", () => {
    render(
      <TrackSelector {...baseProps} label="Track" isContextLoading={true} />
    );
    expect(screen.getByText("Track")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("shows fallback when no palletContext", () => {
    render(<TrackSelector {...baseProps} label="Track" />);
    expect(
      screen.getByText("Context unavailable — enter value manually")
    ).toBeInTheDocument();
  });

  it("renders tracks with id and name", () => {
    render(
      <TrackSelector
        {...baseProps}
        label="Track"
        palletContext={governanceContext}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("Root")).toBeInTheDocument();
    expect(screen.getByText("Whitelisted Caller")).toBeInTheDocument();
    expect(screen.getByText("Staking Admin")).toBeInTheDocument();
  });

  it("shows deciding count for tracks with maxDeciding", () => {
    render(
      <TrackSelector
        {...baseProps}
        label="Track"
        palletContext={governanceContext}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("0/1 deciding")).toBeInTheDocument();
    expect(screen.getByText("3/10 deciding")).toBeInTheDocument();
  });

  it("selection calls onChange with track id", () => {
    const onChange = jest.fn();
    render(
      <TrackSelector
        {...baseProps}
        label="Track"
        palletContext={governanceContext}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    const options = screen.getAllByRole("option");
    fireEvent.click(options[1]); // Whitelisted Caller (id=1)
    expect(onChange).toHaveBeenCalledWith(1);
  });
});
