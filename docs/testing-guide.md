# Testing Guide

This guide covers how to run and write tests for Relaycode. The project uses Jest with React Testing Library for unit and integration testing.

## Test Setup

### Configuration Files

**jest.config.ts** - Main Jest configuration:
```typescript
import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/jest.polyfills.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};
```

**ESM Package Handling:**
Several dependencies ship ESM-only builds. The config transforms these packages:
- `dedot`, `@dedot/*` - Polkadot client
- `@noble/hashes`, `@noble/curves` - Cryptography
- `@scure/base` - Base encoding
- `@luno-kit/*` - Wallet integration

### Setup Files

**jest.polyfills.ts** - Polyfills for Node.js environment (TextEncoder, crypto, etc.)

**jest.setup.ts** - Test utilities and global mocks

## Running Tests

### Basic Commands

```bash
# Run all tests
yarn test

# Run tests in watch mode (re-runs on file changes)
yarn test:watch

# Run tests with coverage report
yarn test --coverage

# Run specific test file
yarn test __tests__/lib/validation.test.ts

# Run tests matching a pattern
yarn test --testPathPattern="validation"
```

### Watch Mode Options

In watch mode, press:
- `a` - Run all tests
- `f` - Run only failed tests
- `p` - Filter by filename pattern
- `t` - Filter by test name pattern
- `q` - Quit watch mode

## Test Structure

### Directory Layout

```
__tests__/
├── hooks/
│   ├── use-chain-token.test.ts
│   ├── use-recent-addresses.test.ts
│   └── use-ss58.test.ts
├── lib/
│   ├── denominations.test.ts
│   ├── parser.test.ts
│   └── validation.test.ts
└── input-map.test.ts
```

### Naming Conventions

- Test files: `*.test.ts` or `*.test.tsx`
- Test files mirror source structure: `lib/validation.ts` → `__tests__/lib/validation.test.ts`
- Describe blocks match module/function names
- Test names describe expected behavior

## Writing Unit Tests

### Testing Utility Functions

Example from `__tests__/lib/validation.test.ts`:

```typescript
import {
  validateVectorConstraints,
  isValidAddressFormat,
  validateAmount,
} from "../../lib/validation";

describe("validateVectorConstraints", () => {
  describe("minItems validation", () => {
    it("should pass when items >= minItems", () => {
      const result = validateVectorConstraints([1, 2, 3], 2, undefined);
      expect(result.valid).toBe(true);
    });

    it("should fail when items < minItems", () => {
      const result = validateVectorConstraints([1], 2, undefined, "Items");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("at least 2");
    });
  });
});

describe("isValidAddressFormat", () => {
  it("should return true for valid Polkadot address", () => {
    expect(isValidAddressFormat("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY")).toBe(true);
  });

  it("should return false for invalid characters", () => {
    expect(isValidAddressFormat("0GrwvaEF...")).toBe(false);  // '0' not in Base58
  });
});
```

### Testing Hooks

Example from `__tests__/hooks/use-ss58.test.ts`:

```typescript
import { renderHook } from "@testing-library/react";
import { useSS58 } from "../../hooks/use-ss58";

describe("useSS58", () => {
  describe("when client is null", () => {
    it("should use default ss58Prefix of 42", () => {
      const { result } = renderHook(() => useSS58(null));
      expect(result.current.ss58Prefix).toBe(42);
    });
  });

  describe("isValidAddress", () => {
    it("should return true for valid SS58 addresses", () => {
      const { result } = renderHook(() => useSS58(null));
      expect(result.current.isValidAddress("5GrwvaEF...")).toBe(true);
    });
  });

  describe("with mock client", () => {
    it("should use client ss58Prefix when available", () => {
      const mockClient = {
        consts: { system: { ss58Prefix: 0 } },
      } as any;

      const { result } = renderHook(() => useSS58(mockClient));
      expect(result.current.ss58Prefix).toBe(0);
    });
  });
});
```

### Testing Type Resolution

Example from `__tests__/input-map.test.ts`:

```typescript
// Mock components to avoid dependency issues
jest.mock("../components/params/inputs/account", () => ({
  Account: { displayName: "Account", schema: {} },
}));

import { findComponent } from "../lib/input-map";
import { Account } from "../components/params/inputs/account";

describe("findComponent", () => {
  describe("Account types (Priority 100)", () => {
    it("should return Account for AccountId", () => {
      expect(findComponent("AccountId").component).toBe(Account);
    });

    it("should match AccountId regex patterns", () => {
      expect(findComponent("AccountIdOf").component).toBe(Account);
    });
  });

  describe("Priority ordering", () => {
    it("should prefer Bytes over Vector for Vec<u8>", () => {
      expect(findComponent("Vec<u8>").component).toBe(Bytes);
    });
  });
});
```

## Mocking Patterns

### Mocking Environment Variables

```typescript
// Mock env.mjs at the top of test files
jest.mock("../../env.mjs", () => ({
  env: {},
}));
```

### Mocking Dedot Client

```typescript
const mockClient = {
  metadata: {
    latest: {
      pallets: [
        { index: 0, name: "System", calls: 1, docs: [] },
        { index: 4, name: "Balances", calls: 2, docs: [] },
      ],
    },
  },
  registry: {
    findType: jest.fn((typeId) => ({
      typeDef: { type: "Primitive", value: "u128" },
    })),
    findCodec: jest.fn((typeId) => ({
      tryEncode: jest.fn(),
      tryDecode: jest.fn(),
    })),
  },
  consts: {
    system: { ss58Prefix: 0 },
    balances: { existentialDeposit: BigInt(10000000000) },
  },
} as any;
```

### Mocking Wallet/React Context

```typescript
// Mock wallet hooks
jest.mock("../../hooks/use-wallet-safe", () => ({
  useSafeAccounts: () => ({
    accounts: [
      { address: "5GrwvaEF...", name: "Alice" },
    ],
  }),
  useSafeBalance: () => ({
    transferable: BigInt(100000000000),
    formattedTransferable: "10",
  }),
}));
```

### Mocking Components with Complex Dependencies

```typescript
jest.mock("../components/params/inputs/account", () => ({
  Account: Object.assign(
    (props: any) => <div data-testid="account-input" />,
    { schema: {}, displayName: "Account" }
  ),
}));
```

### Mocking localStorage

```typescript
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

## Test Examples by Category

### Validation Tests

```typescript
describe("validateAmount", () => {
  it("should pass for valid positive numbers", () => {
    expect(validateAmount("100").valid).toBe(true);
    expect(validateAmount("1.5").valid).toBe(true);
  });

  it("should fail for negative values", () => {
    const result = validateAmount("-5");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("negative");
  });

  it("should include field name in error", () => {
    const result = validateAmount("", "Transfer Amount");
    expect(result.error).toContain("Transfer Amount");
  });
});
```

### Parser Tests

```typescript
describe("createSectionOptions", () => {
  it("should filter pallets without calls", () => {
    const mockMetadata = {
      pallets: [
        { index: 0, name: "System", calls: 1, docs: [] },
        { index: 1, name: "Timestamp", calls: null, docs: [] },
      ],
    } as any;

    const result = createSectionOptions(mockMetadata);
    expect(result).toHaveLength(1);
    expect(result?.[0].text).toBe("System");
  });

  it("should sort pallets alphabetically", () => {
    const mockMetadata = {
      pallets: [
        { index: 2, name: "Utility", calls: 1, docs: [] },
        { index: 0, name: "Balances", calls: 2, docs: [] },
      ],
    } as any;

    const result = createSectionOptions(mockMetadata);
    expect(result?.map(p => p.text)).toEqual(["Balances", "Utility"]);
  });
});
```

### Hook Tests with State Changes

```typescript
import { renderHook, act } from "@testing-library/react";

describe("useRecentAddresses", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should add address to recent list", () => {
    const { result } = renderHook(() => useRecentAddresses());

    act(() => {
      result.current.addRecent("5GrwvaEF...");
    });

    expect(result.current.recentAddresses).toContainEqual(
      expect.objectContaining({ address: "5GrwvaEF..." })
    );
  });
});
```

## Coverage Requirements

Run coverage report:
```bash
yarn test --coverage
```

### Coverage Thresholds

Target coverage metrics:
- **Statements:** 80%
- **Branches:** 75%
- **Functions:** 80%
- **Lines:** 80%

### Viewing Coverage

After running with `--coverage`:
1. Check terminal summary
2. Open `coverage/lcov-report/index.html` in browser for detailed report

## CI Integration

### GitHub Actions

Example workflow (`.github/workflows/test.yml`):

```yaml
name: Tests

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Run tests
        run: yarn test --coverage --ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## Debugging Tests

### Verbose Output

```bash
yarn test --verbose
```

### Running Single Test

```bash
yarn test -t "should return Account for AccountId"
```

### Debug Mode

Add `debugger` statements and run:
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

Then open Chrome DevTools at `chrome://inspect`.

## Best Practices

1. **Isolate tests** - Each test should be independent
2. **Mock external dependencies** - Don't rely on network or real clients
3. **Test edge cases** - Empty values, invalid inputs, boundary conditions
4. **Use descriptive names** - Test names should explain expected behavior
5. **Keep tests focused** - One assertion per test when possible
6. **Clean up** - Reset mocks and state between tests

## See Also

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Validation API](./api/validation.md) - Functions being tested
