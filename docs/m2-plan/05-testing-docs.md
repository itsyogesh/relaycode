# Testing & Documentation Strategy

## Overview

This document outlines the testing strategy and documentation requirements for M2 deliverables as specified in the W3F grant:

**From Grant Application (M2 Deliverable 0c):**
> We will expand our test suite to include integration tests and edge cases. A comprehensive testing guide will be provided.

**From Grant Application (M2 Deliverable 0b):**
> We will provide comprehensive documentation including: Detailed inline code documentation, and an in-depth tutorial explaining all features of Relaycode API specifications for core functionality

---

## Testing Strategy

### Current State

| Metric | Current | Target |
|--------|---------|--------|
| Test files | 1 | 15+ |
| Unit tests | 3 | 50+ |
| Integration tests | 0 | 20+ |
| E2E tests | 0 | 10+ |
| Coverage | ~5% | >70% |

### Test Categories

```
Tests
├── Unit Tests (/tests/unit/)
│   ├── Input Components
│   ├── Utility Functions
│   └── Hooks
│
├── Integration Tests (/tests/integration/)
│   ├── Form Submission Flow
│   ├── Encoding/Decoding
│   └── Wallet Connection
│
└── E2E Tests (/tests/e2e/)
    ├── Build & Submit Extrinsic
    ├── Bi-directional Editing
    └── Multi-chain Support
```

---

## Unit Tests

### Input Component Tests

Each input component should have tests for:

```typescript
// __tests__/components/params/account-input.test.tsx

import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccountInput } from "@/components/params/inputs/account";
import { useForm, FormProvider } from "react-hook-form";

// Test wrapper with form context
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    defaultValues: { account: "" },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("AccountInput", () => {
  describe("Rendering", () => {
    it("renders with label", () => {
      render(
        <TestWrapper>
          <AccountInput name="account" label="Destination" />
        </TestWrapper>
      );
      expect(screen.getByLabelText("Destination")).toBeInTheDocument();
    });

    it("renders identicon when address is valid", async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <AccountInput name="account" showIdenticon />
        </TestWrapper>
      );

      const input = screen.getByRole("textbox");
      await user.type(input, "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY");

      expect(screen.getByTestId("identicon")).toBeInTheDocument();
    });
  });

  describe("Validation", () => {
    it("shows error for invalid address", async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <AccountInput name="account" />
        </TestWrapper>
      );

      const input = screen.getByRole("textbox");
      await user.type(input, "invalid-address");
      await user.tab(); // Trigger blur validation

      expect(screen.getByText(/invalid.*address/i)).toBeInTheDocument();
    });

    it("accepts valid Polkadot address", async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <AccountInput name="account" />
        </TestWrapper>
      );

      const input = screen.getByRole("textbox");
      await user.type(input, "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY");
      await user.tab();

      expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
    });

    it("accepts valid Kusama address", async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <AccountInput name="account" />
        </TestWrapper>
      );

      const input = screen.getByRole("textbox");
      await user.type(input, "HNZata7iMYWmk5RvZRTiAsSDhV8366zq2YGb3tLH5Upf74F");
      await user.tab();

      expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("copies address to clipboard", async () => {
      const user = userEvent.setup();
      const mockClipboard = jest.fn();
      Object.assign(navigator, {
        clipboard: { writeText: mockClipboard },
      });

      render(
        <TestWrapper>
          <AccountInput
            name="account"
            defaultValue="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
          />
        </TestWrapper>
      );

      await user.click(screen.getByRole("button", { name: /copy/i }));
      expect(mockClipboard).toHaveBeenCalledWith(
        "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
      );
    });
  });
});
```

### Balance Input Tests

```typescript
// __tests__/components/params/balance-input.test.tsx

describe("BalanceInput", () => {
  describe("Unit Conversion", () => {
    it("converts DOT to planck correctly", async () => {
      const user = userEvent.setup();
      const onValueChange = jest.fn();

      render(
        <TestWrapper>
          <BalanceInput
            name="amount"
            decimals={10}
            onValueChange={onValueChange}
          />
        </TestWrapper>
      );

      await user.type(screen.getByRole("textbox"), "1.5");

      // 1.5 DOT = 15000000000 planck (10 decimals)
      expect(onValueChange).toHaveBeenCalledWith(BigInt("15000000000"));
    });

    it("displays planck conversion", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BalanceInput name="amount" decimals={10} showPlanck />
        </TestWrapper>
      );

      await user.type(screen.getByRole("textbox"), "10.5");

      expect(screen.getByText(/105,000,000,000 planck/)).toBeInTheDocument();
    });
  });

  describe("Validation", () => {
    it("rejects negative values", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BalanceInput name="amount" />
        </TestWrapper>
      );

      await user.type(screen.getByRole("textbox"), "-5");
      await user.tab();

      expect(screen.getByText(/positive/i)).toBeInTheDocument();
    });

    it("enforces max value", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BalanceInput
            name="amount"
            maxValue={BigInt("100000000000")} // 10 DOT
            decimals={10}
          />
        </TestWrapper>
      );

      await user.type(screen.getByRole("textbox"), "15");
      await user.tab();

      expect(screen.getByText(/exceeds maximum/i)).toBeInTheDocument();
    });
  });
});
```

### Utility Function Tests

```typescript
// __tests__/lib/format.test.ts

import { formatBalance, parseBalanceToPlanck } from "@/lib/format";

describe("formatBalance", () => {
  it("formats whole numbers correctly", () => {
    expect(formatBalance(BigInt("10000000000"), 10)).toBe("1");
    expect(formatBalance(BigInt("10000000000"), 10, "DOT")).toBe("1 DOT");
  });

  it("formats decimals correctly", () => {
    expect(formatBalance(BigInt("15000000000"), 10)).toBe("1.5");
    expect(formatBalance(BigInt("12345678901"), 10)).toBe("1.2345678901");
  });

  it("handles zero", () => {
    expect(formatBalance(BigInt(0), 10)).toBe("0");
  });

  it("handles very large numbers", () => {
    expect(formatBalance(BigInt("1000000000000000000000"), 10)).toBe(
      "100000000000"
    );
  });
});

describe("parseBalanceToPlanck", () => {
  it("parses whole numbers", () => {
    expect(parseBalanceToPlanck("1", 10)).toBe(BigInt("10000000000"));
    expect(parseBalanceToPlanck("100", 10)).toBe(BigInt("1000000000000"));
  });

  it("parses decimals", () => {
    expect(parseBalanceToPlanck("1.5", 10)).toBe(BigInt("15000000000"));
    expect(parseBalanceToPlanck("0.1", 10)).toBe(BigInt("1000000000"));
  });

  it("handles precision correctly", () => {
    // Should truncate extra decimals
    expect(parseBalanceToPlanck("1.12345678901234", 10)).toBe(
      BigInt("11234567890")
    );
  });
});
```

### Encoding/Decoding Tests

```typescript
// __tests__/lib/encoding.test.ts

import { encodeExtrinsic, decodeExtrinsic } from "@/lib/encoding";

describe("Extrinsic Encoding", () => {
  describe("Balances.transferKeepAlive", () => {
    const testCases = [
      {
        name: "simple transfer",
        pallet: "Balances",
        method: "transferKeepAlive",
        args: {
          dest: { Id: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" },
          value: BigInt("10000000000"),
        },
        expectedPrefix: "0x0503", // Balances.transferKeepAlive
      },
    ];

    testCases.forEach(({ name, pallet, method, args, expectedPrefix }) => {
      it(`encodes ${name} correctly`, async () => {
        const encoded = await encodeExtrinsic(pallet, method, args);

        expect(encoded).toMatch(/^0x/);
        expect(encoded.startsWith(expectedPrefix)).toBe(true);
      });
    });
  });

  describe("Round-trip encoding", () => {
    it("decodes what was encoded", async () => {
      const original = {
        pallet: "System",
        method: "remark",
        args: { remark: "0x48656c6c6f" }, // "Hello" in hex
      };

      const encoded = await encodeExtrinsic(
        original.pallet,
        original.method,
        original.args
      );
      const decoded = await decodeExtrinsic(encoded);

      expect(decoded.pallet).toBe(original.pallet);
      expect(decoded.method).toBe(original.method);
    });
  });
});
```

---

## Integration Tests

### Form Submission Flow

```typescript
// __tests__/integration/extrinsic-builder.test.tsx

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExtrinsicBuilder } from "@/components/builder/extrinsic-builder";
import { TestProviders } from "@/tests/utils/test-providers";

describe("Extrinsic Builder Integration", () => {
  it("builds a complete transfer extrinsic", async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <ExtrinsicBuilder />
      </TestProviders>
    );

    // Wait for pallets to load
    await waitFor(() => {
      expect(screen.getByRole("combobox", { name: /pallet/i })).toBeEnabled();
    });

    // Select Balances pallet
    await user.click(screen.getByRole("combobox", { name: /pallet/i }));
    await user.click(screen.getByRole("option", { name: /balances/i }));

    // Select transferKeepAlive method
    await user.click(screen.getByRole("combobox", { name: /method/i }));
    await user.click(screen.getByRole("option", { name: /transferKeepAlive/i }));

    // Fill destination
    const destInput = screen.getByLabelText(/dest/i);
    await user.type(destInput, "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY");

    // Fill value
    const valueInput = screen.getByLabelText(/value/i);
    await user.type(valueInput, "1");

    // Verify encoded call is generated
    await waitFor(() => {
      const encodedDisplay = screen.getByTestId("encoded-call");
      expect(encodedDisplay.textContent).toMatch(/^0x0503/);
    });
  });

  it("syncs bi-directional editing", async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <ExtrinsicBuilder />
      </TestProviders>
    );

    // ... setup pallet/method ...

    // Switch to edit mode
    await user.click(screen.getByRole("button", { name: /edit hex/i }));

    // Paste encoded call
    const hexInput = screen.getByRole("textbox", { name: /encoded/i });
    await user.clear(hexInput);
    await user.paste("0x0503d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d0284d717");

    // Switch back to form mode
    await user.click(screen.getByRole("button", { name: /form/i }));

    // Verify form fields are populated
    await waitFor(() => {
      expect(screen.getByLabelText(/dest/i)).toHaveValue(
        expect.stringContaining("5GrwvaEF")
      );
    });
  });
});
```

### Wallet Integration Tests

```typescript
// __tests__/integration/wallet.test.tsx

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConnectButton } from "@/components/wallet/connect-button";
import { TestProviders } from "@/tests/utils/test-providers";

// Mock LunoKit
jest.mock("@luno-kit/react", () => ({
  useAccount: jest.fn(),
  useConnect: jest.fn(),
  useDisconnect: jest.fn(),
}));

describe("Wallet Integration", () => {
  it("shows connect button when disconnected", () => {
    (useAccount as jest.Mock).mockReturnValue({
      address: null,
      isConnected: false,
    });

    render(
      <TestProviders>
        <ConnectButton />
      </TestProviders>
    );

    expect(screen.getByRole("button", { name: /connect/i })).toBeInTheDocument();
  });

  it("shows account display when connected", () => {
    (useAccount as jest.Mock).mockReturnValue({
      address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      isConnected: true,
    });

    render(
      <TestProviders>
        <ConnectButton />
      </TestProviders>
    );

    expect(screen.getByText(/5Grwva.*utQY/)).toBeInTheDocument();
  });
});
```

---

## E2E Tests (Stretch Goal)

For E2E tests, use Playwright:

```typescript
// e2e/extrinsic-flow.spec.ts

import { test, expect } from "@playwright/test";

test.describe("Extrinsic Builder E2E", () => {
  test("complete flow: select, fill, encode, sign", async ({ page }) => {
    await page.goto("/builder");

    // Wait for app to load
    await expect(page.getByText("Extrinsic Builder")).toBeVisible();

    // Select pallet
    await page.getByRole("combobox", { name: /pallet/i }).click();
    await page.getByRole("option", { name: /System/i }).click();

    // Select method
    await page.getByRole("combobox", { name: /method/i }).click();
    await page.getByRole("option", { name: /remark/i }).click();

    // Fill remark
    await page.getByLabel(/remark/i).fill("0x48656c6c6f"); // "Hello"

    // Verify encoding
    await expect(page.getByTestId("encoded-call")).toContainText("0x0001");

    // Screenshot for visual verification
    await page.screenshot({ path: "e2e/screenshots/remark-filled.png" });
  });
});
```

---

## Test Configuration

### Jest Configuration

```javascript
// jest.config.js

module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testPathIgnorePatterns: ["/node_modules/", "/e2e/"],
  collectCoverageFrom: [
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "hooks/**/*.{ts,tsx}",
    "!**/*.d.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### Jest Setup

```javascript
// jest.setup.js

import "@testing-library/jest-dom";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
```

---

## Documentation Requirements

### 1. Inline Code Documentation (JSDoc)

Every public function, component, and type should have JSDoc:

```typescript
/**
 * Input component for Substrate account addresses.
 *
 * Supports multiple address formats including Polkadot, Kusama,
 * and generic Substrate addresses. Automatically validates
 * SS58 encoding and displays an identicon when valid.
 *
 * @example
 * ```tsx
 * <AccountInput
 *   control={control}
 *   name="dest"
 *   label="Destination"
 *   showIdenticon={true}
 * />
 * ```
 *
 * @param props - Component props
 * @param props.control - React Hook Form control object
 * @param props.name - Field name in the form
 * @param props.label - Human-readable label
 * @param props.showIdenticon - Whether to display identicon (default: true)
 * @param props.formats - Allowed address formats
 *
 * @see {@link https://wiki.polkadot.network/docs/learn-accounts} Polkadot Accounts
 */
export function AccountInput(props: AccountInputProps) {
  // ...
}
```

### 2. API Specifications

Create API documentation for core functions:

```markdown
<!-- docs/api/encoding.md -->

# Encoding API

## encodeExtrinsic

Encodes an extrinsic call using SCALE codec.

### Signature

\`\`\`typescript
function encodeExtrinsic(
  pallet: string,
  method: string,
  args: Record<string, unknown>
): Promise<string>
\`\`\`

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| pallet | string | Pallet name (e.g., "Balances") |
| method | string | Method name (e.g., "transfer") |
| args | Record | Method arguments |

### Returns

`Promise<string>` - Hex-encoded call data prefixed with "0x"

### Example

\`\`\`typescript
const encoded = await encodeExtrinsic("Balances", "transfer", {
  dest: { Id: "5GrwvaEF..." },
  value: BigInt("10000000000"),
});
// Returns: "0x0503d43593c715..."
\`\`\`
```

### 3. User Tutorial

Create a step-by-step guide:

```markdown
<!-- docs/tutorial/getting-started.md -->

# Getting Started with Relaycode

## What is Relaycode?

Relaycode is an extrinsics builder for the Polkadot ecosystem that helps
you create, encode, and submit blockchain transactions without writing code.

## Quick Start

### Step 1: Connect Your Wallet

1. Click the "Connect Wallet" button in the top right
2. Select your preferred wallet (Polkadot.js, Talisman, etc.)
3. Approve the connection in your wallet extension

### Step 2: Select a Pallet and Method

1. Use the "Pallet" dropdown to select a module (e.g., Balances)
2. Use the "Method" dropdown to select an action (e.g., transfer)
3. Read the method documentation in the info panel

### Step 3: Fill in Parameters

1. Each parameter has a specific input type
2. Hover over the (?) icon for help
3. Required fields are marked with *

### Step 4: Review and Submit

1. Review the encoded call data in the right panel
2. Click "Sign & Submit" to send the transaction
3. Confirm in your wallet extension
4. Wait for confirmation

## Understanding the Interface

[Screenshots and detailed explanations...]
```

---

## Documentation Structure

```
docs/
├── m2-plan/           # Implementation planning (this folder)
├── api/               # API reference documentation
│   ├── encoding.md
│   ├── components.md
│   └── hooks.md
├── tutorial/          # User tutorials
│   ├── getting-started.md
│   ├── building-transfer.md
│   ├── batch-transactions.md
│   └── advanced-types.md
└── contributing/      # Developer documentation
    ├── setup.md
    ├── architecture.md
    └── testing.md
```

---

## Medium Article Outline

**Title:** "Introducing Relaycode: The Human-Friendly Extrinsics Builder for Polkadot"

**Sections:**
1. The Problem: Extrinsics Are Hard
2. Meet Relaycode: Build, Encode, Submit
3. Key Features
   - Bi-directional Editing
   - All Pallets Supported
   - Wallet Integration
4. Technical Deep Dive
   - Dedot Integration
   - SCALE Encoding/Decoding
5. Getting Started
6. What's Next
7. Credits & Acknowledgments (W3F Grant)

**Target:** 1500-2000 words with screenshots

---

## Related Documents

- [01-overview.md](./01-overview.md) - Timeline & deliverables
- [03-input-components.md](./03-input-components.md) - Component specs to test
- [04-wallet-integration.md](./04-wallet-integration.md) - Wallet testing
