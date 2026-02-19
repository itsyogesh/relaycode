jest.mock("../../../env.mjs", () => ({ env: {} }));

jest.mock("lucide-react", () => ({
  Check: (props: any) => <span data-testid="check-icon" {...props} />,
  ChevronDown: (props: any) => (
    <span data-testid="chevron-down" {...props} />
  ),
}));

const mockSwitchChain = jest.fn();

const mockChains = [
  {
    name: "Polkadot",
    genesisHash: "0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3",
    chainIconUrl: "https://example.com/dot.png",
    testnet: false,
  },
  {
    name: "Kusama",
    genesisHash: "0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe",
    chainIconUrl: "https://example.com/ksm.png",
    testnet: false,
  },
  {
    name: "Westend",
    genesisHash: "0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e",
    chainIconUrl: "https://example.com/wnd.png",
    testnet: true,
  },
];

let mockCurrentChain = mockChains[0];

jest.mock("@luno-kit/react", () => ({
  useSwitchChain: () => ({
    chains: mockChains,
    currentChain: mockCurrentChain,
    switchChain: mockSwitchChain,
  }),
}));

// Mock the DropDrawer component tree with simple HTML equivalents
jest.mock("@/components/ui/dropdrawer", () => {
  const React = require("react");

  function DropDrawer({ children }: { children: React.ReactNode }) {
    return <div data-testid="dropdrawer">{children}</div>;
  }

  function DropDrawerTrigger({
    children,
    asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) {
    return <div data-testid="dropdrawer-trigger">{children}</div>;
  }

  function DropDrawerContent({
    children,
  }: {
    children: React.ReactNode;
    align?: string;
    className?: string;
  }) {
    return <div data-testid="dropdrawer-content">{children}</div>;
  }

  function DropDrawerItem({
    children,
    onSelect,
    className,
  }: {
    children: React.ReactNode;
    onSelect?: () => void;
    className?: string;
  }) {
    return (
      <div
        data-testid="dropdrawer-item"
        role="menuitem"
        onClick={onSelect}
        className={className}
      >
        {children}
      </div>
    );
  }

  function DropDrawerLabel({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div data-testid="dropdrawer-label">{children}</div>;
  }

  return {
    DropDrawer,
    DropDrawerTrigger,
    DropDrawerContent,
    DropDrawerItem,
    DropDrawerLabel,
  };
});

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChainSelector } from "../../../components/shared/chain-selector";

describe("ChainSelector", () => {
  beforeEach(() => {
    mockSwitchChain.mockClear();
    mockCurrentChain = mockChains[0];
  });

  it("shows current chain name in trigger", () => {
    render(<ChainSelector />);
    // "Polkadot" appears in trigger and in list, so use within to target the trigger
    const trigger = screen.getByTestId("dropdrawer-trigger");
    expect(trigger).toHaveTextContent("Polkadot");
  });

  it("lists available chains", () => {
    render(<ChainSelector />);
    const content = screen.getByTestId("dropdrawer-content");
    expect(content).toHaveTextContent("Polkadot");
    expect(content).toHaveTextContent("Kusama");
    expect(content).toHaveTextContent("Westend");
  });

  it("shows testnet badge for testnet chains", () => {
    render(<ChainSelector />);
    expect(screen.getByText("testnet")).toBeInTheDocument();
  });

  it("calls switchChain on selection", () => {
    render(<ChainSelector />);
    const items = screen.getAllByRole("menuitem");
    // Click Kusama (second item)
    fireEvent.click(items[1]);
    expect(mockSwitchChain).toHaveBeenCalledWith({
      chainId: mockChains[1].genesisHash,
    });
  });

  it("shows check icon for active chain", () => {
    render(<ChainSelector />);
    const checkIcons = screen.getAllByTestId("check-icon");
    // Only one check icon should be visible (for the active chain)
    expect(checkIcons).toHaveLength(1);
  });
});
