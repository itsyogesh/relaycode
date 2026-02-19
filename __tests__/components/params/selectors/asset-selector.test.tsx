jest.mock("../../../../env.mjs", () => ({ env: {} }));

jest.mock("lucide-react", () => ({
  Check: () => <span data-testid="check-icon" />,
  ChevronsUpDown: () => <span data-testid="chevrons-icon" />,
  Info: () => <span data-testid="info-icon" />,
  AlertCircle: () => <span data-testid="alert-icon" />,
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AssetSelector } from "../../../../components/params/selectors/asset-selector";
import type { AssetsContext } from "../../../../types/pallet-context";

const assetsContext: AssetsContext = {
  type: "assets",
  assets: [
    { id: 1, name: "Tether USD", symbol: "USDT", decimals: 6 },
    {
      id: 2,
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      isFrozen: true,
    },
    { id: 100, name: "DED", symbol: "DED", decimals: 10 },
  ],
  tokenSymbol: "DOT",
  tokenDecimals: 10,
};

const baseProps = {
  name: "asset_id",
  client: {} as any,
};

describe("AssetSelector", () => {
  it("shows skeleton when isContextLoading is true", () => {
    render(
      <AssetSelector {...baseProps} label="Asset" isContextLoading={true} />
    );
    expect(screen.getByText("Asset")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("shows fallback when no palletContext", () => {
    render(<AssetSelector {...baseProps} label="Asset" />);
    expect(
      screen.getByText("Context unavailable — enter value manually")
    ).toBeInTheDocument();
  });

  it("renders assets with id, name, and symbol", () => {
    render(
      <AssetSelector
        {...baseProps}
        label="Asset"
        palletContext={assetsContext}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("Tether USD")).toBeInTheDocument();
    expect(screen.getByText("USD Coin")).toBeInTheDocument();
    // DED appears as both name and symbol
    expect(screen.getAllByText("DED").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("USDT")).toBeInTheDocument();
    expect(screen.getByText("USDC")).toBeInTheDocument();
  });

  it("shows Frozen badge for frozen assets", () => {
    render(
      <AssetSelector
        {...baseProps}
        label="Asset"
        palletContext={assetsContext}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("Frozen")).toBeInTheDocument();
  });

  it("selection calls onChange with asset id", () => {
    const onChange = jest.fn();
    render(
      <AssetSelector
        {...baseProps}
        label="Asset"
        palletContext={assetsContext}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    const options = screen.getAllByRole("option");
    fireEvent.click(options[0]); // id=1
    expect(onChange).toHaveBeenCalledWith(1);
  });
});
