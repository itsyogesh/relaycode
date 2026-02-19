jest.mock("../../../env.mjs", () => ({ env: {} }));

jest.mock("lucide-react", () => ({
  Wallet: (props: any) => <span data-testid="wallet-icon" {...props} />,
}));

const mockOpenConnectModal = jest.fn();
const mockOpenAccountModal = jest.fn();
let mockAccount: { address: string } | null = null;

jest.mock("@luno-kit/ui", () => ({
  useConnectModal: () => ({ open: mockOpenConnectModal }),
  useAccountModal: () => ({ open: mockOpenAccountModal }),
}));

jest.mock("@luno-kit/react", () => ({
  useAccount: () => ({ account: mockAccount }),
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConnectButton } from "../../../components/shared/connect-button";

describe("ConnectButton", () => {
  beforeEach(() => {
    mockAccount = null;
    mockOpenConnectModal.mockClear();
    mockOpenAccountModal.mockClear();
  });

  it('shows "Connect" when disconnected', () => {
    render(<ConnectButton />);
    expect(screen.getByText("Connect")).toBeInTheDocument();
  });

  it("shows truncated address when connected", () => {
    mockAccount = {
      address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    };
    render(<ConnectButton />);
    // "5Grwva...utQY"
    expect(screen.getByText("5Grwva...utQY")).toBeInTheDocument();
  });

  it("clicking calls connect modal when disconnected", () => {
    render(<ConnectButton />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockOpenConnectModal).toHaveBeenCalled();
    expect(mockOpenAccountModal).not.toHaveBeenCalled();
  });

  it("clicking calls account modal when connected", () => {
    mockAccount = {
      address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    };
    render(<ConnectButton />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockOpenAccountModal).toHaveBeenCalled();
    expect(mockOpenConnectModal).not.toHaveBeenCalled();
  });
});
