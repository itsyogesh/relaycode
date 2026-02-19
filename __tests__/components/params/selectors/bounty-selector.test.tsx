jest.mock("../../../../env.mjs", () => ({ env: {} }));

jest.mock("lucide-react", () => ({
  Check: () => <span data-testid="check-icon" />,
  ChevronsUpDown: () => <span data-testid="chevrons-icon" />,
  Info: () => <span data-testid="info-icon" />,
  AlertCircle: () => <span data-testid="alert-icon" />,
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BountySelector } from "../../../../components/params/selectors/bounty-selector";
import type { GovernanceContext } from "../../../../types/pallet-context";

const governanceContext: GovernanceContext = {
  type: "governance",
  referenda: [],
  tracks: [],
  bounties: [
    {
      index: 0,
      title: "Website Redesign",
      description: "Redesign the main website",
      value: "10000000000000",
      curator: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      status: "Active",
    },
    {
      index: 1,
      title: undefined,
      description: "A bounty without a title",
      value: "5000000000000",
      status: "Funded",
    },
    {
      index: 2,
      title: undefined,
      description: undefined,
      status: "Proposed",
    },
  ],
  tokenSymbol: "DOT",
  tokenDecimals: 10,
};

const baseProps = {
  name: "bounty_index",
  client: {} as any,
};

describe("BountySelector", () => {
  it("shows skeleton when isContextLoading is true", () => {
    render(
      <BountySelector {...baseProps} label="Bounty" isContextLoading={true} />
    );
    expect(screen.getByText("Bounty")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("shows fallback when no palletContext", () => {
    render(<BountySelector {...baseProps} label="Bounty" />);
    expect(
      screen.getByText("Context unavailable — enter value manually")
    ).toBeInTheDocument();
  });

  it("renders bounties with index and title", () => {
    render(
      <BountySelector
        {...baseProps}
        label="Bounty"
        palletContext={governanceContext}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("Website Redesign")).toBeInTheDocument();
    // Bounty without title shows description
    expect(screen.getByText("A bounty without a title")).toBeInTheDocument();
  });

  it("shows Untitled for bounty with no title or description", () => {
    render(
      <BountySelector
        {...baseProps}
        label="Bounty"
        palletContext={governanceContext}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    // The third bounty has no title or description
    expect(screen.getAllByText("Untitled").length).toBeGreaterThanOrEqual(1);
  });

  it("selection calls onChange with bounty index", () => {
    const onChange = jest.fn();
    render(
      <BountySelector
        {...baseProps}
        label="Bounty"
        palletContext={governanceContext}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    const options = screen.getAllByRole("option");
    fireEvent.click(options[0]); // index 0
    expect(onChange).toHaveBeenCalledWith(0);
  });
});
