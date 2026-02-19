jest.mock("../../../../env.mjs", () => ({ env: {} }));

jest.mock("lucide-react", () => ({
  Check: () => <span data-testid="check-icon" />,
  ChevronsUpDown: () => <span data-testid="chevrons-icon" />,
  Info: () => <span data-testid="info-icon" />,
  AlertCircle: () => <span data-testid="alert-icon" />,
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MultisigCallSelector } from "../../../../components/params/selectors/multisig-call-selector";
import type { MultisigContext } from "../../../../types/pallet-context";

const multisigContext: MultisigContext = {
  type: "multisig",
  pendingMultisigs: [
    {
      callHash:
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      approvals: ["5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"],
      threshold: 2,
      depositor: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      when: { height: 12345, index: 0 },
    },
    {
      callHash:
        "0x1111111122222222333333334444444455555555666666667777777788888888",
      approvals: [
        "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
      ],
      threshold: 3,
      depositor: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
      when: { height: 12400, index: 1 },
    },
  ],
  tokenSymbol: "DOT",
  tokenDecimals: 10,
};

const baseProps = {
  name: "call_hash",
  client: {} as any,
};

describe("MultisigCallSelector", () => {
  it("shows skeleton when isContextLoading is true", () => {
    render(
      <MultisigCallSelector
        {...baseProps}
        label="Multisig"
        isContextLoading={true}
      />
    );
    expect(screen.getByText("Multisig")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("shows fallback when no palletContext", () => {
    render(<MultisigCallSelector {...baseProps} label="Multisig" />);
    // MultisigCallSelector uses fallbackType="text"
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(
      screen.getByText("Context unavailable — enter value manually")
    ).toBeInTheDocument();
  });

  it("renders multisigs with call hash and approvals", () => {
    render(
      <MultisigCallSelector
        {...baseProps}
        label="Multisig"
        palletContext={multisigContext}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    // Approval counts shown as "approvals/threshold"
    expect(screen.getByText("1/2 approvals")).toBeInTheDocument();
    expect(screen.getByText("2/3 approvals")).toBeInTheDocument();
    // Block height shown
    expect(screen.getByText("Block #12345")).toBeInTheDocument();
    expect(screen.getByText("Block #12400")).toBeInTheDocument();
  });

  it("selection calls onChange with call hash", () => {
    const onChange = jest.fn();
    render(
      <MultisigCallSelector
        {...baseProps}
        label="Multisig"
        palletContext={multisigContext}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    const options = screen.getAllByRole("option");
    fireEvent.click(options[0]);
    expect(onChange).toHaveBeenCalledWith(
      "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
    );
  });
});
