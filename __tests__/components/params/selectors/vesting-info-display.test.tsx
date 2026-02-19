jest.mock("../../../../env.mjs", () => ({ env: {} }));

jest.mock("lucide-react", () => ({
  Info: () => <span data-testid="info-icon" />,
}));

import React from "react";
import { render, screen } from "@testing-library/react";
import { VestingInfoDisplay } from "../../../../components/params/selectors/vesting-info-display";

const baseProps = {
  name: "vesting",
  client: {} as any,
};

describe("VestingInfoDisplay", () => {
  it("renders label and text input", () => {
    render(<VestingInfoDisplay {...baseProps} label="Amount" />);
    expect(screen.getByText("Amount")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("shows no hint when no palletContext", () => {
    render(<VestingInfoDisplay {...baseProps} label="Amount" />);
    expect(screen.queryByText(/Min vested/)).not.toBeInTheDocument();
  });

  it("shows minVestedTransfer hint when context available", () => {
    render(
      <VestingInfoDisplay
        {...baseProps}
        label="Amount"
        palletContext={{
          type: "vesting",
          minVestedTransfer: "10000000000",
          tokenSymbol: "DOT",
          tokenDecimals: 10,
        }}
      />
    );
    // 10000000000 planck / 10^10 = 1 DOT
    expect(screen.getByText("Min vested transfer: 1 DOT")).toBeInTheDocument();
  });
});
