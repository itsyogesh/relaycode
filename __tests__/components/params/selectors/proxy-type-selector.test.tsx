jest.mock("../../../../env.mjs", () => ({ env: {} }));

jest.mock("lucide-react", () => ({
  Check: () => <span data-testid="check-icon" />,
  ChevronsUpDown: () => <span data-testid="chevrons-icon" />,
  Info: () => <span data-testid="info-icon" />,
  AlertCircle: () => <span data-testid="alert-icon" />,
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProxyTypeSelector } from "../../../../components/params/selectors/proxy-type-selector";
import type { ProxyContext } from "../../../../types/pallet-context";

const proxyContext: ProxyContext = {
  type: "proxy",
  proxyTypes: [
    { name: "Any", index: 0 },
    { name: "NonTransfer", index: 1 },
    { name: "Governance", index: 2 },
    { name: "Staking", index: 3 },
  ],
  tokenSymbol: "DOT",
  tokenDecimals: 10,
};

const baseProps = {
  name: "proxy_type",
  client: {} as any,
};

describe("ProxyTypeSelector", () => {
  it("shows skeleton when isContextLoading is true", () => {
    render(
      <ProxyTypeSelector
        {...baseProps}
        label="Proxy Type"
        isContextLoading={true}
      />
    );
    expect(screen.getByText("Proxy Type")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("shows fallback when no palletContext", () => {
    render(<ProxyTypeSelector {...baseProps} label="Proxy Type" />);
    expect(
      screen.getByText("Context unavailable — enter value manually")
    ).toBeInTheDocument();
  });

  it("renders proxy types with index and name", () => {
    render(
      <ProxyTypeSelector
        {...baseProps}
        label="Proxy Type"
        palletContext={proxyContext}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("Any")).toBeInTheDocument();
    expect(screen.getByText("NonTransfer")).toBeInTheDocument();
    expect(screen.getByText("Governance")).toBeInTheDocument();
    expect(screen.getByText("Staking")).toBeInTheDocument();
  });

  it("selection calls onChange with proxy type index", () => {
    const onChange = jest.fn();
    render(
      <ProxyTypeSelector
        {...baseProps}
        label="Proxy Type"
        palletContext={proxyContext}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    const options = screen.getAllByRole("option");
    fireEvent.click(options[2]); // Governance (index=2)
    expect(onChange).toHaveBeenCalledWith(2);
  });
});
