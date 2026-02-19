// Mock env.mjs to avoid t3-oss/env validation in tests
jest.mock("../../../env.mjs", () => ({ env: {} }));

// Mock @luno-kit/ui
jest.mock("@luno-kit/ui", () => ({
  LunoKitProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="luno-kit-provider">{children}</div>
  ),
}));

// Mock @luno-kit/react
jest.mock("@luno-kit/react", () => ({
  createConfig: () => ({}),
}));

// Mock @tanstack/react-query
jest.mock("@tanstack/react-query", () => ({
  QueryClient: jest.fn().mockImplementation(() => ({})),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="query-client-provider">{children}</div>
  ),
}));

// Mock wallet config
jest.mock("../../../config/wallet", () => ({
  walletConfig: {},
}));

import React from "react";
import { render, screen } from "@testing-library/react";
import {
  WalletProvider,
  useLunoKitAvailable,
} from "../../../components/wallet/wallet-provider";

describe("WalletProvider", () => {
  it("renders children", () => {
    render(
      <WalletProvider>
        <div data-testid="child">Hello</div>
      </WalletProvider>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("useLunoKitAvailable returns true inside provider", () => {
    function TestComponent() {
      const isAvailable = useLunoKitAvailable();
      return <div data-testid="available">{String(isAvailable)}</div>;
    }

    render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    );

    expect(screen.getByTestId("available").textContent).toBe("true");
  });

  it("useLunoKitAvailable returns false outside provider", () => {
    function TestComponent() {
      const isAvailable = useLunoKitAvailable();
      return <div data-testid="available">{String(isAvailable)}</div>;
    }

    // Render without WalletProvider — useContext returns default value (false)
    render(<TestComponent />);

    expect(screen.getByTestId("available").textContent).toBe("false");
  });
});
