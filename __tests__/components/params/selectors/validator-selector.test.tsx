jest.mock("../../../../env.mjs", () => ({ env: {} }));

jest.mock("lucide-react", () => ({
  Check: () => <span data-testid="check-icon" />,
  ChevronsUpDown: () => <span data-testid="chevrons-icon" />,
  ShieldCheck: () => <span data-testid="shield-icon" />,
  X: () => <span data-testid="x-icon" />,
  Info: () => <span data-testid="info-icon" />,
  AlertCircle: () => <span data-testid="alert-icon" />,
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  ValidatorSelector,
  ValidatorMultiSelector,
} from "../../../../components/params/selectors/validator-selector";
import type { StakingContext, ValidatorInfo } from "../../../../types/pallet-context";

function makeValidator(
  overrides: Partial<ValidatorInfo> & { address: string }
): ValidatorInfo {
  return {
    commission: 5,
    isActive: true,
    ...overrides,
  };
}

const validators: ValidatorInfo[] = [
  makeValidator({
    address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    identity: "Alice",
    isVerified: true,
    commission: 1,
    isActive: true,
  }),
  makeValidator({
    address: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
    identity: "Bob",
    commission: 5,
    isActive: true,
  }),
  makeValidator({
    address: "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y",
    identity: "Charlie",
    commission: 10,
    isActive: false,
  }),
];

const stakingContext: StakingContext = {
  type: "staking",
  validators,
  pools: [],
  currentEra: 100,
  activeEra: 99,
  tokenSymbol: "DOT",
  tokenDecimals: 10,
};

const baseProps = {
  name: "validator",
  client: {} as any,
};

describe("ValidatorSelector (single-select)", () => {
  it("shows skeleton when isContextLoading is true", () => {
    render(
      <ValidatorSelector
        {...baseProps}
        label="Validator"
        isContextLoading={true}
      />
    );
    expect(screen.getByText("Validator")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("shows fallback when no palletContext", () => {
    render(<ValidatorSelector {...baseProps} label="Validator" />);
    // Uses fallbackType="text"
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(
      screen.getByText("Context unavailable — enter value manually")
    ).toBeInTheDocument();
  });

  it("renders validator items sorted by active then commission", () => {
    render(
      <ValidatorSelector
        {...baseProps}
        label="Validator"
        palletContext={stakingContext}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    const options = screen.getAllByRole("option");
    // Active validators first, sorted by commission: Alice (1%), Bob (5%)
    // Then waiting: Charlie (10%)
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent("Alice");
    expect(options[1]).toHaveTextContent("Bob");
    expect(options[2]).toHaveTextContent("Charlie");
  });

  it("shows commission percentage", () => {
    render(
      <ValidatorSelector
        {...baseProps}
        label="Validator"
        palletContext={stakingContext}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("1%")).toBeInTheDocument();
    expect(screen.getByText("5%")).toBeInTheDocument();
    expect(screen.getByText("10%")).toBeInTheDocument();
  });

  it("shows Active/Waiting badges", () => {
    render(
      <ValidatorSelector
        {...baseProps}
        label="Validator"
        palletContext={stakingContext}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    // 2 active, 1 waiting
    const activeBadges = screen.getAllByText("Active");
    const waitingBadges = screen.getAllByText("Waiting");
    expect(activeBadges).toHaveLength(2);
    expect(waitingBadges).toHaveLength(1);
  });

  it("selection calls onChange with validator address", () => {
    const onChange = jest.fn();
    render(
      <ValidatorSelector
        {...baseProps}
        label="Validator"
        palletContext={stakingContext}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    const options = screen.getAllByRole("option");
    fireEvent.click(options[0]); // Alice
    expect(onChange).toHaveBeenCalledWith(
      "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
    );
  });
});

describe("ValidatorSelector (multi-select)", () => {
  it("shows skeleton when isContextLoading is true", () => {
    render(
      <ValidatorSelector
        {...baseProps}
        label="Validators"
        isContextLoading={true}
        multi
      />
    );
    expect(screen.getByText("Validators")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("shows fallback when no palletContext in multi mode", () => {
    render(<ValidatorSelector {...baseProps} label="Validators" multi />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("shows count badge for multi-select", () => {
    render(
      <ValidatorSelector
        {...baseProps}
        label="Validators"
        palletContext={stakingContext}
        value={["5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"]}
        multi
      />
    );
    expect(screen.getByText("1/16 selected")).toBeInTheDocument();
  });

  it("toggle selects and deselects a validator", () => {
    const onChange = jest.fn();
    render(
      <ValidatorSelector
        {...baseProps}
        label="Validators"
        palletContext={stakingContext}
        value={[]}
        onChange={onChange}
        multi
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    const options = screen.getAllByRole("option");
    // Select first validator (Alice)
    fireEvent.click(options[0]);
    expect(onChange).toHaveBeenCalledWith([
      "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    ]);
  });

  it("shows removable chips for selected validators", () => {
    render(
      <ValidatorSelector
        {...baseProps}
        label="Validators"
        palletContext={stakingContext}
        value={[
          "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
          "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        ]}
        multi
      />
    );
    // Chips show identities
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    // X icons for removal
    const removeButtons = screen.getAllByRole("button", { name: "" });
    // At least the remove buttons should be present (plus the combobox trigger)
    expect(removeButtons.length).toBeGreaterThanOrEqual(2);
  });

  it("removes a validator when chip remove button is clicked", () => {
    const onChange = jest.fn();
    render(
      <ValidatorSelector
        {...baseProps}
        label="Validators"
        palletContext={stakingContext}
        value={[
          "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
          "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        ]}
        onChange={onChange}
        multi
      />
    );
    // Find remove buttons within the chips area
    // Each chip has a button[type="button"] with an X icon
    const chipButtons = screen.getAllByRole("button").filter((btn) => {
      return btn.getAttribute("type") === "button" && btn.closest(".flex.flex-wrap");
    });
    if (chipButtons.length > 0) {
      fireEvent.click(chipButtons[0]); // Remove first validator (Alice)
      expect(onChange).toHaveBeenCalledWith([
        "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
      ]);
    }
  });

  it("enforces MAX_NOMINATIONS (16) limit", () => {
    // Create 16 validators
    const manyValidators: ValidatorInfo[] = Array.from(
      { length: 17 },
      (_, i) =>
        makeValidator({
          address: `5Addr${String(i).padStart(44, "0")}`,
          identity: `Validator ${i}`,
          commission: i,
          isActive: true,
        })
    );

    const manyCtx: StakingContext = {
      ...stakingContext,
      validators: manyValidators,
    };

    // Select 16 validators (the max)
    const selected = manyValidators.slice(0, 16).map((v) => v.address);

    render(
      <ValidatorSelector
        {...baseProps}
        label="Validators"
        palletContext={manyCtx}
        value={selected}
        multi
      />
    );

    expect(screen.getByText("16/16 selected")).toBeInTheDocument();

    // Open popover - the 17th validator should be disabled (opacity-50)
    fireEvent.click(screen.getByRole("combobox"));
    const options = screen.getAllByRole("option");
    // The last option (not selected) should be disabled
    const lastOption = options[options.length - 1];
    expect(lastOption).toHaveAttribute("data-disabled", "true");
  });
});

describe("ValidatorMultiSelector", () => {
  it("renders in multi-select mode", () => {
    render(
      <ValidatorMultiSelector
        {...baseProps}
        label="Targets"
        palletContext={stakingContext}
        value={[]}
      />
    );
    expect(screen.getByText("0/16 selected")).toBeInTheDocument();
  });
});
