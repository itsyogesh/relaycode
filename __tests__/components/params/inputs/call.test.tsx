jest.mock("../../../../env.mjs", () => ({ env: {} }));

jest.mock("../../../../components/ui/form", () => ({
  FormDescription: ({ children, ...props }: any) => (
    <p {...props}>{children}</p>
  ),
}));

jest.mock("lucide-react", () => ({
  Check: () => <span data-testid="check-icon" />,
  ChevronsUpDown: () => <span data-testid="chevrons-icon" />,
}));

// Call's behavior is independent of Radix/cmdk portal mechanics, which have
// their own Combobox tests. Keep these interaction tests deterministic.
jest.mock("../../../../components/builder/combobox", () => {
  const React = require("react") as typeof import("react");

  return {
    Combobox: ({
      items,
      value,
      onValueChange,
      placeholder,
    }: {
      items: Array<{ value: string | number; label: string }>;
      value?: string;
      onValueChange: (value: string) => void;
      placeholder?: string;
    }) => {
      const [open, setOpen] = React.useState(false);
      const listId = React.useId();
      const selected = items.find(
        (item) => `${item.value}:${item.label}` === value,
      );

      return (
        <div>
          <button
            role="combobox"
            aria-controls={listId}
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
          >
            {selected?.label ?? placeholder}
          </button>
          {open && (
            <div id={listId}>
              {items.map((item) => (
                <button
                  key={item.value}
                  role="option"
                  aria-selected={selected?.value === item.value}
                  onClick={() => {
                    onValueChange(`${item.value}:${item.label}`);
                    setOpen(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    },
  };
});

jest.mock("../../../../lib/input-map", () => {
  const React = require("react");
  const SubInput = (props: any) => {
    const { name, onChange, value, label } = props;
    return React.createElement(
      "div",
      null,
      label
        ? React.createElement(
            "span",
            null,
            typeof label === "string" ? label : "sub-label",
          )
        : null,
      React.createElement("input", {
        "data-testid": `sub-${name}`,
        value: value ?? "",
        onChange: (e: any) => onChange?.(e.target.value),
      }),
    );
  };
  return {
    findComponent: jest.fn().mockReturnValue({
      component: SubInput,
      schema: {},
    }),
  };
});

jest.mock("../../../../lib/parser", () => ({
  createSectionOptions: jest.fn().mockReturnValue([
    { value: 0, text: "Balances", docs: [] },
    { value: 5, text: "Staking", docs: [] },
  ]),
  createMethodOptions: jest
    .fn()
    .mockImplementation((_client: any, sectionIndex: number) => {
      if (sectionIndex === 0) {
        return [
          { value: 0, text: "transferKeepAlive" },
          { value: 1, text: "forceTransfer" },
        ];
      }
      if (sectionIndex === 5) {
        return [
          { value: 0, text: "bond" },
          { value: 1, text: "nominate" },
        ];
      }
      return [];
    }),
}));

jest.mock("dedot/utils", () => ({
  stringCamelCase: jest.fn((s: string) => {
    if (!s) return s;
    return s.charAt(0).toLowerCase() + s.slice(1);
  }),
  assert: jest.fn(),
}));

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Call } from "../../../../components/params/inputs/call";
import {
  createMockDedotClient,
  createEnumTypeMock,
} from "../../../helpers/mock-client";

// Build a mock client with metadata that has pallets and call types
function buildCallClient() {
  const balancesCallsEnum = createEnumTypeMock([
    {
      name: "transferKeepAlive",
      fields: [
        { typeId: 10, typeName: "AccountId32" },
        { typeId: 20, typeName: "u128" },
      ],
      index: 0,
    },
    {
      name: "forceTransfer",
      fields: [
        { typeId: 10, typeName: "AccountId32" },
        { typeId: 10, typeName: "AccountId32" },
        { typeId: 20, typeName: "u128" },
      ],
      index: 1,
    },
  ]);

  const stakingCallsEnum = createEnumTypeMock([
    {
      name: "bond",
      fields: [{ typeId: 20, typeName: "u128" }],
      index: 0,
    },
    {
      name: "nominate",
      fields: [],
      index: 1,
    },
  ]);

  return createMockDedotClient({
    metadata: {
      latest: {
        pallets: [
          {
            name: "Balances",
            index: 0,
            calls: { typeId: 100 },
            docs: [],
          },
          {
            name: "Staking",
            index: 5,
            calls: { typeId: 200 },
            docs: [],
          },
        ],
      },
    },
    registry: {
      findType: jest.fn().mockImplementation((id: number) => {
        if (id === 100) return balancesCallsEnum;
        if (id === 200) return stakingCallsEnum;
        return {
          typeDef: { type: "Primitive", value: { kind: "u32" } },
          path: [],
        };
      }),
      findCodec: jest.fn().mockReturnValue({
        tryEncode: jest.fn().mockReturnValue(new Uint8Array([0])),
        tryDecode: jest.fn().mockReturnValue("decoded"),
      }),
    },
  });
}

const baseProps = {
  name: "testCall",
  label: "Proposal Call",
  client: buildCallClient(),
};

describe("Call", () => {
  it("renders pallet combobox", () => {
    render(<Call {...baseProps} />);
    expect(screen.getByText("Proposal Call")).toBeInTheDocument();
    expect(screen.getByText("Pallet")).toBeInTheDocument();
    // The combobox button should be rendered
    const palletCombobox = screen.getAllByRole("combobox")[0];
    expect(palletCombobox).toBeInTheDocument();
  });

  it("method combobox does not appear before pallet selected", () => {
    render(<Call {...baseProps} />);
    // Only one combobox (pallet) should be visible initially
    const comboboxes = screen.getAllByRole("combobox");
    expect(comboboxes).toHaveLength(1);
  });

  it("method combobox appears after pallet selected", async () => {
    render(<Call {...baseProps} />);

    // Click the pallet combobox to open it
    const palletCombobox = screen.getAllByRole("combobox")[0];
    fireEvent.click(palletCombobox);

    // Select "Balances" from the dropdown
    const balancesOption = await screen.findByText("Balances");
    fireEvent.click(balancesOption);

    // Now method combobox should appear
    await waitFor(() => {
      expect(screen.getByText("Method")).toBeInTheDocument();
    });
  });

  it("resets method when pallet changes", async () => {
    render(<Call {...baseProps} />);

    // Select Balances pallet
    fireEvent.click(screen.getAllByRole("combobox")[0]);
    fireEvent.click(await screen.findByText("Balances"));

    await waitFor(() => expect(screen.getByText("Method")).toBeInTheDocument());

    // Select a method
    fireEvent.click(screen.getAllByRole("combobox")[1]);
    fireEvent.click(await screen.findByText("transferKeepAlive"));

    // Now change pallet to Staking
    fireEvent.click(screen.getAllByRole("combobox")[0]);
    fireEvent.click(await screen.findByText("Staking"));

    // Method should be reset
    await waitFor(() => {
      const methodCombobox = screen.getAllByRole("combobox")[1];
      expect(methodCombobox).toHaveTextContent(/Select method/);
    });
  });

  it("renders parameter fields for selected method", async () => {
    render(<Call {...baseProps} />);

    // Select Balances pallet
    fireEvent.click(screen.getAllByRole("combobox")[0]);
    fireEvent.click(await screen.findByText("Balances"));

    await waitFor(() => expect(screen.getByText("Method")).toBeInTheDocument());

    // Select transferKeepAlive method
    fireEvent.click(screen.getAllByRole("combobox")[1]);
    fireEvent.click(await screen.findByText("transferKeepAlive"));

    // Should show parameter fields
    await waitFor(() => {
      expect(screen.getByText("Parameters")).toBeInTheDocument();
    });
  });

  it("shows 'no parameters' text for parameterless methods", async () => {
    render(<Call {...baseProps} />);

    // Select Staking pallet
    fireEvent.click(screen.getAllByRole("combobox")[0]);
    fireEvent.click(await screen.findByText("Staking"));

    await waitFor(() => expect(screen.getByText("Method")).toBeInTheDocument());

    // Select nominate method (no fields)
    fireEvent.click(screen.getAllByRole("combobox")[1]);
    fireEvent.click(await screen.findByText("nominate"));

    await waitFor(() => {
      expect(
        screen.getByText("This method has no parameters"),
      ).toBeInTheDocument();
    });
  });

  it("renders error when provided", () => {
    render(<Call {...baseProps} error="Call error" />);
    expect(screen.getByText("Call error")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<Call {...baseProps} description="A nested call" />);
    expect(screen.getByText("A nested call")).toBeInTheDocument();
  });
});
