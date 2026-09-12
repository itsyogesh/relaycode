jest.mock("../../../env.mjs", () => ({ env: {} }));

const mockTxCall = Object.assign(jest.fn(), {
  meta: {
    index: 0,
    fields: [],
    docs: [],
  },
});

jest.mock("@/context/client", () => ({
  ClientProvider: ({ children }: { children: React.ReactNode }) => children,
  useClient: () => ({ client: {}, loading: false }),
}));

jest.mock("@/components/builder/extrinsic-builder", () => ({
  __esModule: true,
  default: ({ onTxChange }: { onTxChange: (tx: typeof mockTxCall) => void }) => (
    <button type="button" onClick={() => onTxChange(mockTxCall)}>
      Select vest
    </button>
  ),
}));

jest.mock("@/components/builder/information-pane", () => ({
  __esModule: true,
  default: ({ tx }: { tx: typeof mockTxCall | null }) => (
    <output data-testid="selected-tx-index">{tx?.meta?.index ?? "missing"}</output>
  ),
}));

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import BuilderPage from "@/app/builder/page";

describe("BuilderPage", () => {
  beforeEach(() => {
    mockTxCall.mockClear();
  });

  it("stores a Dedot transaction function without invoking it as a state updater", () => {
    render(<BuilderPage />);

    expect(screen.getByTestId("selected-tx-index")).toHaveTextContent("missing");
    fireEvent.click(screen.getByRole("button", { name: "Select vest" }));

    expect(mockTxCall).not.toHaveBeenCalled();
    expect(screen.getByTestId("selected-tx-index")).toHaveTextContent("0");
  });
});
