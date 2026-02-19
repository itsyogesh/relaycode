jest.mock("../../../env.mjs", () => ({ env: {} }));

// Mock lib/parser
jest.mock("@/lib/parser", () => ({
  createSectionOptions: jest.fn().mockReturnValue([
    { value: 5, text: "Balances", docs: ["Transfer and manage balances"] },
    { value: 0, text: "System", docs: ["System pallet"] },
  ]),
  createMethodOptions: jest.fn().mockReturnValue([
    { value: 0, text: "transferKeepAlive" },
    { value: 1, text: "transferAll" },
  ]),
}));

// Mock lib/input-map
jest.mock("@/lib/input-map", () => ({
  findComponentWithContext: jest.fn().mockReturnValue({
    component: (props: any) => (
      <div data-testid={`param-${props.label}`}>
        <label>{props.label}</label>
        <input
          value={props.value || ""}
          onChange={(e: any) => props.onChange?.(e.target.value)}
        />
      </div>
    ),
    typeId: 1,
  }),
}));

// Mock lib/validation
jest.mock("@/lib/validation", () => ({
  validateAllArgs: jest.fn().mockReturnValue({
    valid: true,
    results: new Map(),
    errors: [],
  }),
}));

// Mock @luno-kit/react
jest.mock("@luno-kit/react", () => ({
  useAccount: jest.fn().mockReturnValue({ account: null }),
  useSendTransaction: jest.fn().mockReturnValue({
    sendTransactionAsync: jest.fn(),
    isPending: false,
  }),
}));

// Mock hooks/use-pallet-context
jest.mock("@/hooks/use-pallet-context", () => ({
  usePalletContext: jest.fn().mockReturnValue({
    context: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock react-markdown
jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="markdown">{children}</div>,
}));

// Mock dedot/utils
jest.mock("dedot/utils", () => ({
  stringCamelCase: (s: string) => {
    if (!s) return s;
    return s.charAt(0).toLowerCase() + s.slice(1);
  },
}));

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";
import ExtrinsicBuilder from "../../../components/builder/extrinsic-builder";
import { useAccount, useSendTransaction } from "@luno-kit/react";

// Create a wrapper that provides a real react-hook-form instance
function TestWrapper({
  tx = null,
  onTxChange = jest.fn(),
  formDefaults = {},
}: {
  tx?: any;
  onTxChange?: jest.Mock;
  formDefaults?: Record<string, any>;
}) {
  const form = useForm({
    defaultValues: {
      section: "",
      method: "",
      ...formDefaults,
    },
  });

  const mockClient = {
    metadata: {
      latest: {
        pallets: [
          {
            index: 5,
            name: "Balances",
            calls: { typeId: 10 },
            docs: ["Transfer and manage balances"],
          },
          {
            index: 0,
            name: "System",
            calls: { typeId: 20 },
            docs: ["System pallet"],
          },
        ],
      },
    },
    registry: {
      findCodec: jest.fn(),
      findType: jest.fn(),
    },
    tx: {
      balances: {
        transferKeepAlive: {
          meta: {
            fields: [
              { name: "dest", typeId: 1, typeName: "AccountId" },
              { name: "value", typeId: 6, typeName: "Balance" },
            ],
            docs: ["Transfer some balance to another account"],
          },
        },
      },
    },
  } as any;

  return (
    <ExtrinsicBuilder
      client={mockClient}
      tx={tx}
      onTxChange={onTxChange}
      builderForm={form}
    />
  );
}

describe("ExtrinsicBuilder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAccount as jest.Mock).mockReturnValue({ account: null });
    (useSendTransaction as jest.Mock).mockReturnValue({
      sendTransactionAsync: jest.fn(),
      isPending: false,
    });
  });

  it("renders the Extrinsic Builder heading", () => {
    render(<TestWrapper />);
    expect(screen.getByText("Extrinsic Builder")).toBeInTheDocument();
    expect(
      screen.getByText("Build and analyze extrinsics for Polkadot")
    ).toBeInTheDocument();
  });

  it("renders Section combobox", () => {
    render(<TestWrapper />);
    expect(screen.getByText("Section")).toBeInTheDocument();
    // The combobox for section should show "Select section" placeholder
    const comboboxes = screen.getAllByRole("combobox");
    expect(comboboxes.length).toBeGreaterThanOrEqual(1);
  });

  it("renders Method combobox disabled until section selected", () => {
    render(<TestWrapper />);
    const comboboxes = screen.getAllByRole("combobox");
    // The second combobox (method) should be disabled
    const methodCombobox = comboboxes[1];
    expect(methodCombobox).toBeDisabled();
  });

  it('shows "Connect Wallet to Submit" when disconnected', () => {
    (useAccount as jest.Mock).mockReturnValue({ account: null });
    render(<TestWrapper />);
    expect(screen.getByText("Connect Wallet to Submit")).toBeInTheDocument();
  });

  it('shows "Sign and Submit" when connected', () => {
    (useAccount as jest.Mock).mockReturnValue({
      account: { address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" },
    });
    render(<TestWrapper />);
    expect(screen.getByText("Sign and Submit")).toBeInTheDocument();
  });

  it("shows Submitting... when isPending", () => {
    (useAccount as jest.Mock).mockReturnValue({
      account: { address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" },
    });
    (useSendTransaction as jest.Mock).mockReturnValue({
      sendTransactionAsync: jest.fn(),
      isPending: true,
    });
    render(<TestWrapper tx={{ meta: { fields: [] } }} />);
    expect(screen.getByText("Submitting...")).toBeInTheDocument();
  });

  it("submit button disabled when no tx", () => {
    render(<TestWrapper tx={null} />);
    const submitBtn = screen.getByRole("button", { name: /submit|connect/i });
    expect(submitBtn).toBeDisabled();
  });

  it("submit button disabled when no account", () => {
    (useAccount as jest.Mock).mockReturnValue({ account: null });
    render(
      <TestWrapper tx={{ meta: { fields: [], docs: [] } }} />
    );
    const submitBtn = screen.getByRole("button", {
      name: "Connect Wallet to Submit",
    });
    expect(submitBtn).toBeDisabled();
  });

  it("method selection renders parameter fields when tx has fields", () => {
    const txWithFields = {
      meta: {
        fields: [
          { name: "dest", typeId: 1, typeName: "AccountId" },
          { name: "value", typeId: 6, typeName: "Balance" },
        ],
        docs: ["Transfer some balance to another account"],
      },
    };

    render(<TestWrapper tx={txWithFields} />);

    expect(screen.getByTestId("param-dest")).toBeInTheDocument();
    expect(screen.getByTestId("param-value")).toBeInTheDocument();
  });

  it("renders without crash when sections list is empty", () => {
    const { createSectionOptions } = require("@/lib/parser");
    createSectionOptions.mockReturnValueOnce([]);

    expect(() => {
      render(<TestWrapper />);
    }).not.toThrow();
  });
});
