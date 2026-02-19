jest.mock("../../../../env.mjs", () => ({ env: {} }));

jest.mock("lucide-react", () => ({
  Check: () => <span data-testid="check-icon" />,
  Users: () => <span data-testid="users-icon" />,
  ChevronsUpDown: () => <span data-testid="chevrons-icon" />,
  Info: () => <span data-testid="info-icon" />,
  AlertCircle: () => <span data-testid="alert-icon" />,
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PoolSelector } from "../../../../components/params/selectors/pool-selector";
import type { StakingContext } from "../../../../types/pallet-context";

const stakingContext: StakingContext = {
  type: "staking",
  validators: [],
  pools: [
    { id: 1, name: "Pool One", state: "Open", memberCount: 10 },
    { id: 2, name: "Pool Two", state: "Blocked", memberCount: 5 },
    { id: 3, name: "Pool Three", state: "Destroying", memberCount: 0 },
  ],
  currentEra: 100,
  activeEra: 99,
  tokenSymbol: "DOT",
  tokenDecimals: 10,
};

const baseProps = {
  name: "pool_id",
  client: {} as any,
};

describe("PoolSelector", () => {
  it("shows skeleton when isContextLoading is true", () => {
    render(
      <PoolSelector {...baseProps} label="Pool" isContextLoading={true} />
    );
    expect(screen.getByText("Pool")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("shows fallback when no palletContext", () => {
    render(<PoolSelector {...baseProps} label="Pool" />);
    expect(
      screen.getByText("Context unavailable — enter value manually")
    ).toBeInTheDocument();
  });

  it("renders pools with id, name, state, and members count", () => {
    render(
      <PoolSelector
        {...baseProps}
        label="Pool"
        palletContext={stakingContext}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    // Destroying pools are hidden by default
    expect(screen.getByText("Pool One")).toBeInTheDocument();
    expect(screen.getByText("Pool Two")).toBeInTheDocument();
    expect(screen.queryByText("Pool Three")).not.toBeInTheDocument();
    expect(screen.getByText("10 members")).toBeInTheDocument();
    expect(screen.getByText("5 members")).toBeInTheDocument();
  });

  it("shows destroying pools when checkbox is toggled", () => {
    render(
      <PoolSelector
        {...baseProps}
        label="Pool"
        palletContext={stakingContext}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(screen.getByText("Pool Three")).toBeInTheDocument();
  });

  it("selection calls onChange with pool id", () => {
    const onChange = jest.fn();
    render(
      <PoolSelector
        {...baseProps}
        label="Pool"
        palletContext={stakingContext}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    const options = screen.getAllByRole("option");
    fireEvent.click(options[0]); // Pool One (id=1)
    expect(onChange).toHaveBeenCalledWith(1);
  });
});
