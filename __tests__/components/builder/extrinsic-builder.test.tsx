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
  assert: jest.fn(),
}));

// Mock gas estimation hook
const mockEstimate = jest.fn();
const mockGasEstimation = {
  estimating: false,
  weightRequired: null as any,
  storageDeposit: null as any,
  gasConsumed: null,
  deployedAddress: null,
  error: null as string | null,
  estimate: mockEstimate,
};

jest.mock("@/hooks/use-gas-estimation", () => ({
  useGasEstimation: jest.fn().mockImplementation(() => mockGasEstimation),
}));

// Mock use-chain-token
jest.mock("@/hooks/use-chain-token", () => ({
  useChainToken: jest.fn().mockReturnValue({
    symbol: "DOT",
    decimals: 10,
    denominations: [],
    existentialDeposit: BigInt(0),
    loading: false,
  }),
}));

// Mock fee-display
jest.mock("@/lib/fee-display", () => ({
  formatFee: jest.fn().mockReturnValue("0.001 DOT"),
  formatWeight: jest.fn().mockReturnValue("refTime: 1.1K, proofSize: 2.2K"),
}));

// Mock chain-types
jest.mock("@/lib/chain-types", () => ({
  hasReviveApi: jest.fn().mockReturnValue(false),
  GenericChainClient: {} as any,
}));

// Mock next/link — needed for the Studio link
jest.mock("next/link", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ children, href, ...props }: any) =>
      React.createElement("a", { href, ...props }, children),
  };
});

// Mock lucide-react icons — proxy to actual icons but add our test ones
jest.mock("lucide-react", () => {
  const actual = jest.requireActual("lucide-react");
  return {
    ...actual,
    Loader2: (props: any) => <span data-testid="loader2" {...props} />,
    Zap: (props: any) => <span data-testid="zap" {...props} />,
    ArrowRight: (props: any) => <span data-testid="arrow-right" {...props} />,
  };
});

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

  it("renders the Section and Method selectors", () => {
    render(<TestWrapper />);
    expect(screen.getByText("Section")).toBeInTheDocument();
    expect(screen.getByText("Method")).toBeInTheDocument();
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

  it("shows Sign and Submit when account connected and not submitting", () => {
    (useAccount as jest.Mock).mockReturnValue({
      account: { address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" },
    });
    (useSendTransaction as jest.Mock).mockReturnValue({
      sendTransactionAsync: jest.fn(),
      isPending: false,
    });
    render(<TestWrapper tx={{ meta: { fields: [] } }} />);
    expect(screen.getByText("Sign and Submit")).toBeInTheDocument();
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

  describe("gas estimation for Revive", () => {
    const reviveTx = {
      meta: {
        fields: [
          { name: "value", typeId: 6, typeName: "BalanceOf" },
          { name: "weight_limit", typeId: 10, typeName: "Weight" },
          { name: "storage_deposit_limit", typeId: 6, typeName: "BalanceOf" },
          { name: "code", typeId: 14, typeName: "Vec<u8>" },
          { name: "data", typeId: 14, typeName: "Vec<u8>" },
          { name: "salt", typeId: 15, typeName: "Option<[u8; 32]>" },
        ],
        docs: ["Instantiate a contract with code"],
      },
    };

    beforeEach(() => {
      // Override section/method options to include Revive
      const { createSectionOptions, createMethodOptions } = require("@/lib/parser");
      createSectionOptions.mockReturnValue([
        { value: 60, text: "Revive", docs: ["Contracts"] },
        { value: 0, text: "System", docs: ["System pallet"] },
      ]);
      createMethodOptions.mockReturnValue([
        { value: 0, text: "instantiate_with_code" },
      ]);
    });

    function ReviveTestWrapper({ tx = reviveTx }: { tx?: any }) {
      const form = useForm({
        defaultValues: {
          section: "60:Revive",
          method: "", // useEffect clears this on mount anyway
          value: "0",
          weight_limit: "",
          storage_deposit_limit: "",
          code: "0x1234",
          data: "0x",
          salt: "",
        },
      });

      // Simulate method selection after mount
      React.useEffect(() => {
        form.setValue("method", "0:instantiate_with_code");
      }, [form]);

      const mockClient = {
        metadata: {
          latest: {
            pallets: [
              {
                index: 60,
                name: "Revive",
                calls: { typeId: 100 },
                docs: ["Contracts"],
              },
            ],
          },
        },
        registry: {
          findCodec: jest.fn(),
          findType: jest.fn().mockReturnValue({
            typeDef: {
              type: "Struct",
              value: {
                fields: [
                  { name: "refTime", typeId: 6 },
                  { name: "proofSize", typeId: 6 },
                ],
              },
            },
          }),
        },
        tx: {
          revive: {
            instantiateWithCode: {
              meta: reviveTx.meta,
            },
          },
        },
      } as any;

      return (
        <ExtrinsicBuilder
          client={mockClient}
          tx={tx}
          onTxChange={jest.fn()}
          builderForm={form}
        />
      );
    }

    it("shows Estimate Gas button when pallet=Revive, method=instantiate_with_code", () => {
      render(<ReviveTestWrapper />);
      expect(screen.getByText("Estimate Gas")).toBeInTheDocument();
    });

    it("shows Open in Contract Studio link when Revive selected", () => {
      const { container } = render(<ReviveTestWrapper />);
      // The link is rendered by next/link mock as an <a> tag
      const link = container.querySelector('a[href="/studio"]');
      expect(link).toBeInTheDocument();
    });

    it("does NOT show Estimate Gas for non-Revive pallet", () => {
      const systemTx = {
        meta: {
          fields: [{ name: "remark", typeId: 14, typeName: "Vec<u8>" }],
          docs: ["Make a remark"],
        },
      };

      function SystemTestWrapper() {
        const form = useForm({
          defaultValues: {
            section: "0:System",
            method: "",
          },
        });

        const mockClient = {
          metadata: { latest: { pallets: [] } },
          registry: { findCodec: jest.fn(), findType: jest.fn() },
          tx: { system: { remark: systemTx } },
        } as any;

        return (
          <ExtrinsicBuilder
            client={mockClient}
            tx={systemTx}
            onTxChange={jest.fn()}
            builderForm={form}
          />
        );
      }

      render(<SystemTestWrapper />);
      expect(screen.queryByText("Estimate Gas")).not.toBeInTheDocument();
    });
  });
});
